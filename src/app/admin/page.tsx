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
  Settings,
  TrendingUp,
  ShieldCheck,
  AlertTriangle,
  Crown,
  Package,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react";
import { getAdminDashboardStats } from "./actions";
import { getAppSettings } from "@/lib/services/app-settings";

export const metadata: Metadata = {
  title: "Panel de Administración",
  description: "Panel de administración de Mazoteca.",
};

export const revalidate = 0;

function formatDate(iso: string | null) {
  if (!iso) return "Nunca";
  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

export default async function AdminDashboard() {
  const [stats, settings] = await Promise.all([
    getAdminDashboardStats(),
    getAppSettings(),
  ]);
  const quickLinks = [
    { href: "/admin/users", label: "Usuarios", description: `${stats.totalUsers} registrados`, icon: Users },
    { href: "/admin/cards", label: "Catálogo", description: `${stats.totalCards} cartas`, icon: BookOpen },
    { href: "/admin/singles", label: "Singles TN", description: `${stats.totalSinglesProducts} productos`, icon: ShoppingBag },
    { href: "/admin/reports", label: "Reportes", description: stats.pendingReports > 0 ? `${stats.pendingReports} pendientes` : "Sin pendientes", icon: Flag, alert: stats.pendingReports > 0 },
    { href: "/admin/settings", label: "Configuración", description: "Feature flags y ajustes", icon: Settings },
  ];

  const syncStatusIcon = stats.lastSyncStatus === "success"
    ? <CheckCircle className="h-4 w-4 text-green-400" />
    : stats.lastSyncStatus === "error"
    ? <XCircle className="h-4 w-4 text-red-400" />
    : <Clock className="h-4 w-4 text-surface-500" />;

  return (
    <div className="min-h-screen bg-surface-900 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Header */}
        <div className="flex items-center gap-3">
          <ShieldCheck className="h-7 w-7 text-primary-400" />
          <div>
            <h1 className="text-2xl font-bold text-surface-50">Panel de Administración</h1>
            <p className="text-sm text-surface-400">Mazoteca — Dashboard en tiempo real</p>
          </div>
        </div>

        {/* Stats principales */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card variant="glass">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Users className="h-5 w-5 text-primary-400" />
                <span className="text-xs text-green-400 font-medium">+{stats.newUsersLast7d} (7d)</span>
              </div>
              <p className="text-2xl font-bold text-surface-50">{stats.totalUsers}</p>
              <p className="text-xs text-surface-400">Usuarios registrados</p>
            </CardContent>
          </Card>

          <Card variant="glass">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Crown className="h-5 w-5 text-accent-400" />
              </div>
              <p className="text-2xl font-bold text-surface-50">{stats.premiumUsers}</p>
              <p className="text-xs text-surface-400">Usuarios Premium</p>
            </CardContent>
          </Card>

          <Card variant="glass">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <BookOpen className="h-5 w-5 text-blue-400" />
              </div>
              <p className="text-2xl font-bold text-surface-50">{stats.totalCards}</p>
              <p className="text-xs text-surface-400">Cartas en catálogo</p>
            </CardContent>
          </Card>

          <Card variant="glass">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Flag className="h-5 w-5 text-red-400" />
                {stats.pendingReports > 0 && (
                  <span className="text-xs bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded font-medium">
                    Pendiente
                  </span>
                )}
              </div>
              <p className={`text-2xl font-bold ${stats.pendingReports > 0 ? "text-red-400" : "text-surface-50"}`}>
                {stats.pendingReports}
              </p>
              <p className="text-xs text-surface-400">Reportes pendientes</p>
            </CardContent>
          </Card>
        </div>

        {/* Stats secundarias */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {([
            { label: "Publicaciones", value: stats.totalListings, sub: `${stats.activeListings} activas`, icon: ShoppingBag, color: "text-green-400" },
            { label: "Intercambios", value: stats.totalTrades, sub: `${stats.activeTrades} activos`, icon: RefreshCw, color: "text-teal-400" },
            { label: "Threads foro", value: stats.totalForumThreads, sub: `${stats.totalForumPosts} respuestas`, icon: MessageSquare, color: "text-purple-400" },
            { label: "Productos TN", value: stats.totalSinglesProducts, sub: `${stats.singlesInStock} con stock`, icon: Package, color: "text-orange-400" },
          ] as const).map((item) => (
            <Card key={item.label} variant="glass" className="col-span-1">
              <CardContent className="p-3">
                <item.icon className={`h-4 w-4 mb-1 ${item.color}`} />
                <p className="text-xl font-bold text-surface-50">{item.value}</p>
                <p className="text-xs text-surface-400 leading-tight">{item.label}</p>
                <p className="text-xs text-surface-500">{item.sub}</p>
              </CardContent>
            </Card>
          ))}

          {/* Último sync */}
          <Card variant="glass" className="col-span-2">
            <CardContent className="p-3">
              <div className="flex items-center gap-1.5 mb-1">
                {syncStatusIcon}
                <p className="text-xs text-surface-400">Último sync TN</p>
              </div>
              <p className="text-sm font-semibold text-surface-100 capitalize">
                {stats.lastSyncStatus ?? "Sin datos"}
              </p>
              <p className="text-xs text-surface-500">{formatDate(stats.lastSyncAt)}</p>
            </CardContent>
          </Card>
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
                      <div className={`h-10 w-10 rounded-lg flex items-center justify-center shrink-0 ${link.alert ? "bg-red-500/20" : "bg-surface-800"}`}>
                        <link.icon className={`h-5 w-5 ${link.alert ? "text-red-400" : "text-primary-400"}`} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-surface-100">{link.label}</p>
                        <p className={`text-xs ${link.alert ? "text-red-400" : "text-surface-400"}`}>{link.description}</p>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>

          {/* Feature Flags + Alertas */}
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold text-surface-100 mb-4 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-accent-400" />
                Estado del sitio
              </h2>
              <Card>
                <CardContent className="p-4 space-y-2">
                  {(
                    [
                      { key: "singles_enabled", label: "Sección Singles", value: settings.singles_enabled },
                      { key: "cart_enabled", label: "Carrito", value: settings.cart_enabled },
                      { key: "prices_enabled", label: "Precios visibles", value: settings.prices_enabled },
                      { key: "trades_enabled", label: "Intercambios", value: settings.trades_enabled },
                      { key: "forum_enabled", label: "Foro", value: settings.forum_enabled },
                      { key: "premium_enabled", label: "Premium", value: settings.premium_enabled },
                    ] as const
                  ).map((f) => (
                    <div key={f.key} className="flex items-center justify-between text-sm">
                      <span className="text-surface-300">{f.label}</span>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${f.value ? "bg-green-500/20 text-green-400" : "bg-surface-700 text-surface-500"}`}>
                        {f.value ? "ON" : "OFF"}
                      </span>
                    </div>
                  ))}
                  <Link href="/admin/settings" className="block mt-3 text-xs text-primary-400 hover:text-primary-300 transition-colors">
                    Modificar ajustes →
                  </Link>
                </CardContent>
              </Card>
            </div>

            {stats.pendingReports > 0 && (
              <Card className="border-amber-500/20">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="h-4 w-4 text-amber-400" />
                    <p className="text-sm font-medium text-amber-400">Alertas</p>
                  </div>
                  <ul className="space-y-1.5 text-sm text-surface-400">
                    <li>
                      •{" "}
                      <Link href="/admin/reports" className="hover:text-amber-300 transition-colors">
                        {stats.pendingReports} reporte{stats.pendingReports > 1 ? "s" : ""} pendiente{stats.pendingReports > 1 ? "s" : ""} de revisión
                      </Link>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            )}

            {stats.pendingReports === 0 && (
              <Card className="border-green-500/20">
                <CardContent className="p-4 flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-400 shrink-0" />
                  <p className="text-sm text-surface-300">Todo en orden. Sin alertas activas.</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
