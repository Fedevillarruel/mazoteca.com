import type { Metadata } from "next";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Search,
  Shield,
  Ban,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Admin — Usuarios",
};

const placeholderUsers = [
  { id: "1", username: "DragonMaster99", email: "dragon@email.com", role: "user", status: "active", joined: "2025-01-15", premium: true },
  { id: "2", username: "CrystalKnight", email: "crystal@email.com", role: "moderator", status: "active", joined: "2025-02-20", premium: true },
  { id: "3", username: "ShadowHunter", email: "shadow@email.com", role: "user", status: "active", joined: "2025-03-10", premium: false },
  { id: "4", username: "ToxicPlayer", email: "toxic@email.com", role: "user", status: "banned", joined: "2025-04-01", premium: false },
  { id: "5", username: "StormWizard", email: "storm@email.com", role: "user", status: "active", joined: "2025-05-18", premium: false },
];

const roleColors: Record<string, "primary" | "accent" | "default"> = {
  admin: "accent",
  moderator: "primary",
  user: "default",
};

export default function AdminUsersPage() {
  return (
    <div className="min-h-screen bg-surface-900 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <Link href="/admin" className="text-xs text-surface-400 hover:text-surface-200 mb-1 block">
              ← Volver al dashboard
            </Link>
            <h1 className="text-2xl font-bold text-surface-50">Gestión de Usuarios</h1>
          </div>
          <div className="flex gap-2">
            <Badge variant="default">{placeholderUsers.length} usuarios</Badge>
          </div>
        </div>

        <div className="relative max-w-md mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-surface-400" />
          <Input placeholder="Buscar por nombre o email..." className="pl-9" />
        </div>

        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-surface-700">
                    <th className="text-left p-4 text-surface-400 font-medium">Usuario</th>
                    <th className="text-left p-4 text-surface-400 font-medium">Email</th>
                    <th className="text-left p-4 text-surface-400 font-medium">Rol</th>
                    <th className="text-left p-4 text-surface-400 font-medium">Estado</th>
                    <th className="text-left p-4 text-surface-400 font-medium">Premium</th>
                    <th className="text-left p-4 text-surface-400 font-medium">Registro</th>
                    <th className="text-right p-4 text-surface-400 font-medium">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {placeholderUsers.map((user) => (
                    <tr key={user.id} className="border-b border-surface-800 hover:bg-surface-800/30">
                      <td className="p-4">
                        <Link
                          href={`/profile/${user.username}`}
                          className="font-medium text-surface-100 hover:text-primary-400"
                        >
                          {user.username}
                        </Link>
                      </td>
                      <td className="p-4 text-surface-400">{user.email}</td>
                      <td className="p-4">
                        <Badge variant={roleColors[user.role] || "default"}>{user.role}</Badge>
                      </td>
                      <td className="p-4">
                        <Badge variant={user.status === "active" ? "success" : "error"}>
                          {user.status === "active" ? "Activo" : "Baneado"}
                        </Badge>
                      </td>
                      <td className="p-4">
                        {user.premium ? (
                          <Badge variant="accent">Premium</Badge>
                        ) : (
                          <span className="text-surface-500">—</span>
                        )}
                      </td>
                      <td className="p-4 text-surface-400">{user.joined}</td>
                      <td className="p-4">
                        <div className="flex items-center justify-end gap-1">
                          {user.status === "active" ? (
                            <Button variant="ghost" size="icon-sm" title="Banear">
                              <Ban className="h-3.5 w-3.5" />
                            </Button>
                          ) : (
                            <Button variant="ghost" size="icon-sm" title="Desbanear">
                              <Shield className="h-3.5 w-3.5" />
                            </Button>
                          )}
                          <Button variant="ghost" size="icon-sm">
                            <MoreHorizontal className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-between mt-4">
          <p className="text-xs text-surface-400">Mostrando 1-5 de 2.847</p>
          <div className="flex gap-1">
            <Button variant="ghost" size="icon-sm" disabled>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon-sm">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
