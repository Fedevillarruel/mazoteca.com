import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  Flag,
  Settings,
  ChevronLeft,
} from "lucide-react";

const adminNav = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Usuarios", href: "/admin/users", icon: Users },
  { label: "Cartas", href: "/admin/cards", icon: BookOpen },
  { label: "Reportes", href: "/admin/reports", icon: Flag },
  { label: "Configuración", href: "/admin/settings", icon: Settings },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin" && profile?.role !== "moderator") {
    redirect("/");
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      {/* Sidebar */}
      <aside className="hidden w-64 shrink-0 border-r border-border bg-surface-1 lg:block">
        <div className="flex h-full flex-col">
          <div className="flex items-center gap-2 border-b border-border px-4 py-4">
            <Link
              href="/"
              className="flex items-center gap-1 text-sm text-muted hover:text-white transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
              Volver al sitio
            </Link>
          </div>

          <nav className="flex-1 space-y-1 p-3">
            {adminNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-muted hover:bg-surface-2 hover:text-white transition-colors"
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="border-t border-border p-4">
            <p className="text-xs text-muted">
              Rol: <span className="text-primary font-medium">{profile.role}</span>
            </p>
          </div>
        </div>
      </aside>

      {/* Mobile nav */}
      <div className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-surface-1 lg:hidden">
        <nav className="flex items-center justify-around py-2">
          {adminNav.slice(0, 4).map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center gap-1 text-muted hover:text-white transition-colors"
            >
              <item.icon className="h-5 w-5" />
              <span className="text-[10px]">{item.label}</span>
            </Link>
          ))}
        </nav>
      </div>

      {/* Content */}
      <main className="flex-1 overflow-y-auto p-6 pb-20 lg:pb-6">
        {children}
      </main>
    </div>
  );
}
