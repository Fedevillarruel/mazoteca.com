"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { createClient } from "@/lib/supabase/client";

interface AuthUser {
  id: string;
  username: string;
  avatar_url: string | null;
  is_premium: boolean;
}

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextValue>({ user: null, loading: true });

export function useAuth() {
  return useContext(AuthContext);
}

interface Props {
  initialUser: AuthUser | null;
  children: ReactNode;
}

export function AuthProvider({ initialUser, children }: Props) {
  const [user, setUser] = useState<AuthUser | null>(initialUser);
  const [loading, setLoading] = useState(!initialUser);

  useEffect(() => {
    const supabase = createClient();

    // Obtiene o crea el perfil directamente desde el browser client
    async function fetchOrCreateProfile(authUser: { id: string; email?: string; user_metadata?: Record<string, string> }): Promise<AuthUser | null> {
      // 1. Intentar leer el perfil existente
      const { data: profile } = await supabase
        .from("profiles")
        .select("id, username, avatar_url, is_premium")
        .eq("id", authUser.id)
        .single();

      if (profile) return profile as AuthUser;

      // 2. No existe → crearlo con datos del auth user
      const username =
        authUser.user_metadata?.username ||
        authUser.user_metadata?.full_name?.replace(/\s+/g, "").toLowerCase() ||
        authUser.email?.split("@")[0] ||
        `user_${authUser.id.slice(0, 8)}`;

      const { data: created } = await supabase
        .from("profiles")
        .upsert({
          id: authUser.id,
          username,
          avatar_url: authUser.user_metadata?.avatar_url ?? null,
          display_name: authUser.user_metadata?.full_name ?? null,
        })
        .select("id, username, avatar_url, is_premium")
        .single();

      return created as AuthUser ?? null;
    }

    // Si no hay initialUser del servidor, leer la sesión actual
    async function init() {
      if (initialUser) {
        setLoading(false);
        return;
      }
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const profile = await fetchOrCreateProfile(session.user);
        setUser(profile);
      }
      setLoading(false);
    }

    init();

    // Detectar login/logout en tiempo real
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === "SIGNED_OUT" || !session?.user) {
          setUser(null);
          setLoading(false);
        } else if (
          event === "SIGNED_IN" ||
          event === "TOKEN_REFRESHED" ||
          event === "USER_UPDATED"
        ) {
          setLoading(true);
          const profile = await fetchOrCreateProfile(session.user);
          setUser(profile);
          setLoading(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}
