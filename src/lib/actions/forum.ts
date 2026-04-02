"use server";

import { createClient } from "@/lib/supabase/server";
import { threadSchema, postSchema } from "@/lib/validations";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSlug } from "@/lib/utils";
import { sendNotification } from "./notifications";

export async function createThread(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Debés iniciar sesión para crear un hilo." };
  }

  const tagsRaw = formData.get("tags") as string;
  const raw = {
    category_id: formData.get("category_id"),
    title: formData.get("title"),
    content: formData.get("content"),
    tags: tagsRaw
      ? tagsRaw
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean)
      : [],
  };

  const parsed = threadSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const slug = createSlug(parsed.data.title);

  const { data: thread, error } = await supabase
    .from("forum_threads")
    .insert({
      author_id: user.id,
      category_id: parsed.data.category_id,
      title: parsed.data.title,
      slug,
      content: parsed.data.content,
      tags: parsed.data.tags || [],
    })
    .select("id")
    .single();

  if (error) {
    console.error("[createThread]", error);
    return { error: "Error al crear el hilo." };
  }

  // Increment thread count in category
  await supabase.rpc("increment_thread_count", {
    p_category_id: parsed.data.category_id,
  });

  revalidatePath("/forum");
  redirect(`/forum/${thread.id}`);
}

export async function createPost(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Debés iniciar sesión para responder." };
  }

  const threadId = formData.get("thread_id") as string;
  const parentId = (formData.get("parent_id") as string) || null;

  if (!threadId) {
    return { error: "Falta el ID del hilo." };
  }

  const raw = {
    content: formData.get("content"),
  };

  const parsed = postSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  // Check thread is not locked
  const { data: thread } = await supabase
    .from("forum_threads")
    .select("is_locked, category_id, author_id")
    .eq("id", threadId)
    .single();

  if (thread?.is_locked) {
    return { error: "Este hilo está cerrado y no acepta más respuestas." };
  }

  const { error } = await supabase.from("forum_posts").insert({
    thread_id: threadId,
    author_id: user.id,
    content: parsed.data.content,
    parent_id: parentId,
  });

  if (error) {
    console.error("[createPost]", error);
    return { error: "Error al publicar la respuesta." };
  }

  // Update thread metadata
  await supabase
    .from("forum_threads")
    .update({
      replies_count: thread ? undefined : 0, // let trigger handle actual increment
      last_reply_at: new Date().toISOString(),
      last_reply_by: user.id,
    })
    .eq("id", threadId);

  // Notify thread author (unless they're replying to their own thread)
  if (thread?.author_id && thread.author_id !== user.id) {
    await sendNotification({
      userId: thread.author_id,
      type: "forum_comment",
      title: "Nueva respuesta en tu hilo",
      message: "Alguien respondió a tu hilo del foro.",
      link: `/forum/${threadId}`,
      category: "forum",
    });
  }

  revalidatePath(`/forum/${threadId}`);
  return { success: true };
}

export async function likeThread(threadId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "No autenticado." };

  // Toggle like via a likes junction table
  const { data: existingLike } = await supabase
    .from("forum_thread_likes")
    .select("id")
    .eq("thread_id", threadId)
    .eq("user_id", user.id)
    .single();

  if (existingLike) {
    await supabase
      .from("forum_thread_likes")
      .delete()
      .eq("id", existingLike.id);
  } else {
    await supabase.from("forum_thread_likes").insert({
      thread_id: threadId,
      user_id: user.id,
    });
  }

  revalidatePath(`/forum/${threadId}`);
  return { success: true, liked: !existingLike };
}

export async function likePost(postId: string, threadId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "No autenticado." };

  const { data: existingLike } = await supabase
    .from("forum_post_likes")
    .select("id")
    .eq("post_id", postId)
    .eq("user_id", user.id)
    .single();

  if (existingLike) {
    await supabase
      .from("forum_post_likes")
      .delete()
      .eq("id", existingLike.id);
  } else {
    await supabase.from("forum_post_likes").insert({
      post_id: postId,
      user_id: user.id,
    });
  }

  revalidatePath(`/forum/${threadId}`);
  return { success: true, liked: !existingLike };
}

export async function markAsSolution(postId: string, threadId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "No autenticado." };

  // Only the thread author can mark a solution
  const { data: thread } = await supabase
    .from("forum_threads")
    .select("author_id")
    .eq("id", threadId)
    .single();

  if (thread?.author_id !== user.id) {
    return { error: "Solo el autor del hilo puede marcar una solución." };
  }

  // Unmark any existing solution
  await supabase
    .from("forum_posts")
    .update({ is_solution: false })
    .eq("thread_id", threadId)
    .eq("is_solution", true);

  // Mark this post as solution
  await supabase
    .from("forum_posts")
    .update({ is_solution: true })
    .eq("id", postId);

  // Mark thread as solved
  await supabase
    .from("forum_threads")
    .update({ is_solved: true })
    .eq("id", threadId);

  revalidatePath(`/forum/${threadId}`);
  return { success: true };
}

export async function deleteThread(threadId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "No autenticado." };

  // Check if user is author or admin/mod
  const { data: thread } = await supabase
    .from("forum_threads")
    .select("author_id, category_id")
    .eq("id", threadId)
    .single();

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const isAuthor = thread?.author_id === user.id;
  const isMod = profile?.role === "moderator" || profile?.role === "admin";

  if (!isAuthor && !isMod) {
    return { error: "No tenés permiso para eliminar este hilo." };
  }

  const { error } = await supabase
    .from("forum_threads")
    .delete()
    .eq("id", threadId);

  if (error) {
    console.error("[deleteThread]", error);
    return { error: "Error al eliminar el hilo." };
  }

  revalidatePath("/forum");
  redirect("/forum");
}

export async function toggleLockThread(threadId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "No autenticado." };

  // Only mods/admins can lock
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "moderator" && profile?.role !== "admin") {
    return { error: "No tenés permiso para esta acción." };
  }

  const { data: thread } = await supabase
    .from("forum_threads")
    .select("is_locked")
    .eq("id", threadId)
    .single();

  await supabase
    .from("forum_threads")
    .update({ is_locked: !thread?.is_locked })
    .eq("id", threadId);

  revalidatePath(`/forum/${threadId}`);
  return { success: true, locked: !thread?.is_locked };
}
