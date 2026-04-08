import type { Metadata } from "next";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Users } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { RoleSelector } from "./role-selector";

export const metadata: Metadata = {
  title: "Admin — Usuarios",
  robots: { index: false, follow: false },
};

export const revalidate = 0;

const roleColors: Record<string, "primary" | "accent" | "default"> = {
  admin: "accent",
  moderator: "primary",
  user: "default",
};

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const { q, page: pageParam } = await searchParams;
  const page = Math.max(1, parseInt(pageParam ?? "1", 10));
  const pageSize = 50;
  const offset = (page - 1) * pageSize;

  const supabase = await createClient();

  let query = supabase
    .from("profiles")
    .select("id, username, display_name, role, is_premium, created_at", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(offset, offset + pageSize - 1);

  if (q) {
    query = query.ilike("username", `%${q}%`);
  }

  const { data: users, count } = await query;
  const totalPages = Math.ceil((count ?? 0) / pageSize);

  return (
    <div className="min-h-screen bg-surface-900 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Link href="/admin" className="text-xs text-surface-400 hover:text-surface-200 mb-1 block">
              ← Volver al dashboard
            </Link>
            <h1 className="text-2xl font-bold text-surface-50 flex items-center gap-2">
              <Users className="h-6 w-6 text-primary-400" />
              Gestión de Usuarios
            </h1>
          </div>
          <Badge variant="default">{count ?? 0} usuarios</Badge>
        </div>

        {/* Search */}
        <form method="GET">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-surface-400" />
            <input
              name="q"
              defaultValue={q ?? ""}
              placeholder="Buscar por nombre o email..."
              className="w-full pl-9 pr-4 py-2 bg-surface-800 border border-surface-700 rounded-lg text-sm text-surface-100 placeholder:text-surface-500 focus:outline-none focus:border-primary-500"
            />
          </div>
        </form>

        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-surface-700">
                    <th className="text-left p-4 text-surface-400 font-medium">Usuario</th>
                    <th className="text-left p-4 text-surface-400 font-medium">Nombre</th>
                    <th className="text-left p-4 text-surface-400 font-medium">Rol</th>
                    <th className="text-left p-4 text-surface-400 font-medium">Premium</th>
                    <th className="text-left p-4 text-surface-400 font-medium">Registro</th>
                    <th className="text-right p-4 text-surface-400 font-medium">Cambiar rol</th>
                  </tr>
                </thead>
                <tbody>
                  {(users ?? []).map((user) => (
                    <tr key={user.id} className="border-b border-surface-800 hover:bg-surface-800/30">
                      <td className="p-4">
                        <Link
                          href={`/profile/${user.username}`}
                          className="font-medium text-surface-100 hover:text-primary-400"
                        >
                          {user.username ?? "—"}
                        </Link>
                      </td>
                      <td className="p-4 text-surface-400 text-xs">{user.display_name ?? "—"}</td>
                      <td className="p-4">
                        <Badge variant={roleColors[user.role ?? "user"] ?? "default"}>
                          {user.role ?? "user"}
                        </Badge>
                      </td>
                      <td className="p-4">
                        {user.is_premium ? (
                          <Badge variant="accent">Premium</Badge>
                        ) : (
                          <span className="text-surface-500">—</span>
                        )}
                      </td>
                      <td className="p-4 text-surface-400 text-xs">
                        {user.created_at
                          ? new Date(user.created_at as string).toLocaleDateString("es-AR")
                          : "—"}
                      </td>
                      <td className="p-4 text-right">
                        <RoleSelector userId={user.id} currentRole={user.role ?? "user"} />
                      </td>
                    </tr>
                  ))}
                  {(users ?? []).length === 0 && (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-surface-400">
                        No se encontraron usuarios.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-xs text-surface-400">
              Página {page} de {totalPages} ({count} usuarios)
            </p>
            <div className="flex gap-2">
              {page > 1 && (
                <Link
                  href={`?${new URLSearchParams({ ...(q ? { q } : {}), page: String(page - 1) })}`}
                  className="px-3 py-1.5 text-xs bg-surface-800 border border-surface-700 rounded hover:bg-surface-700 text-surface-200"
                >
                  ← Anterior
                </Link>
              )}
              {page < totalPages && (
                <Link
                  href={`?${new URLSearchParams({ ...(q ? { q } : {}), page: String(page + 1) })}`}
                  className="px-3 py-1.5 text-xs bg-surface-800 border border-surface-700 rounded hover:bg-surface-700 text-surface-200"
                >
                  Siguiente →
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
