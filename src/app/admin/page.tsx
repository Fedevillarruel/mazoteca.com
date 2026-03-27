import type { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  ShoppingBag,
  RefreshCw,
  MessageSquare,
  Flag,
  Database,
  Settings,
  TrendingUp,
  ShieldCheck,
  AlertTriangle,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Panel de Administración",
  description: "Panel de administración de Mazoteca.",
};

const stats = [
  { label: "Usuarios", value: "2.847", change: "+12%", icon: Users },
  { label: "Cartas en catálogo", value: "1.248", change: "+48", icon: BookOpen },
  { label: "Publicaciones activas", value: "634", change: "+23%", icon: ShoppingBag },
  { label: "Intercambios activos", value: "89", change: "+5%", icon: RefreshCw },
];

const quickLinks = [
  { href: "/admin/users", label: "Usuarios", description: "Gestión de cuentas y roles", icon: Users },
  { href: "/admin/cards", label: "Catálogo", description: "Cartas, expansiones y variantes", icon: BookOpen },
  { href: "/admin/singles", label: "Singles", description: "Publicaciones y transacciones", icon: ShoppingBag },
  { href: "/admin/forum", label: "Foro", description: "Moderación de contenido", icon: MessageSquare },
  { href: "/admin/reports", label: "Reportes", description: "Denuncias y moderación", icon: Flag },
  { href: "/admin/database", label: "Base de datos", description: "Migraciones y backups", icon: Database },
  { href: "/admin/settings", label: "Configuración", description: "Ajustes del sistema", icon: Settings },
];

const recentActivity = [
  { text: "Nuevo usuario registrado: NightBlade", time: "Hace 5 min", type: "info" },
  { text: "Reporte de contenido #142 pendiente", time: "Hace 15 min", type: "warning" },
  { text: "Nueva publicación en singles por CrystalKnight", time: "Hace 1 hora", type: "success" },
  { text: "Expansión 'Tormenta de Arena' publicada", time: "Hace 3 horas", type: "success" },
  { text: "Fallo en webhook de MercadoPago (reintento 2/3)", time: "Hace 4 horas", type: "error" },
];

const typeColors: Record<string, string> = {
  info: "bg-blue-500",
  warning: "bg-amber-500",
  success: "bg-green-500",
  error: "bg-red-500",
};

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-surface-900 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <ShieldCheck className="h-7 w-7 text-primary-400" />
          <div>
            <h1 className="text-2xl font-bold text-surface-50">Panel de Administración</h1>
            <p className="text-sm text-surface-400">Mazoteca — Dashboard</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat) => (
            <Card key={stat.label} variant="glass">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <stat.icon className="h-5 w-5 text-primary-400" />
                  <span className="text-xs text-green-400 font-medium">{stat.change}</span>
                </div>
                <p className="text-2xl font-bold text-surface-50">{stat.value}</p>
                <p className="text-xs text-surface-400">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Quick Links */}
          <div className="lg:col-span-2">
            <h2 className="text-lg font-semibold text-surface-100 mb-4 flex items-center gap-2">
              <LayoutDashboard className="h-5 w-5 text-primary-400" />
              Acceso rápido
            </h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {quickLinks.map((link) => (
                <Link key={link.href} href={link.href}>
                  <Card variant="interactive">
                    <CardContent className="p-4 flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-surface-800 flex items-center justify-center shrink-0">
                        <link.icon className="h-5 w-5 text-primary-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-surface-100">{link.label}</p>
                        <p className="text-xs text-surface-400">{link.description}</p>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div>
            <h2 className="text-lg font-semibold text-surface-100 mb-4 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-accent-400" />
              Actividad reciente
            </h2>
            <Card>
              <CardContent className="p-4 space-y-4">
                {recentActivity.map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div
                      className={`h-2 w-2 rounded-full mt-1.5 shrink-0 ${typeColors[item.type]}`}
                    />
                    <div>
                      <p className="text-sm text-surface-200">{item.text}</p>
                      <p className="text-xs text-surface-500">{item.time}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Alerts */}
            <Card className="mt-4 border-amber-500/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-4 w-4 text-amber-400" />
                  <p className="text-sm font-medium text-amber-400">Alertas</p>
                </div>
                <ul className="space-y-2 text-sm text-surface-400">
                  <li>• 3 reportes pendientes de revisión</li>
                  <li>• Webhook MP con fallos intermitentes</li>
                  <li>• Backup pendiente (último: hace 26h)</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
