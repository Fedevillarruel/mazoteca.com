import type { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ShoppingBag,
  RefreshCw,
  Package,
  CheckCircle,
  XCircle,
  Clock,
  ExternalLink,
  AlertTriangle,
  Layers,
  TrendingUp,
} from "lucide-react";
import { getSyncStats } from "@/lib/services/tiendanube-sync";
import { SyncButton } from "./sync-button";

export const metadata: Metadata = {
  title: "Singles — Tiendanube | Admin",
  description: "Gestión de singles conectada a Tiendanube.",
  robots: { index: false, follow: false },
};

export const revalidate = 0;

export default async function AdminSinglesPage() {
  const stats = await getSyncStats();

  const lastSync = stats.lastSyncs?.[0];
  const syncHistory = stats.lastSyncs ?? [];

  return (
    <div className="min-h-screen bg-surface-900 p-4 sm:p-6 lg:p-8">
      <div className="max-w-5xl mx-auto space-y-8">

        {/* Header */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <ShoppingBag className="h-7 w-7 text-primary-400" />
            <div>
              <h1 className="text-2xl font-bold text-surface-50">Singles — Tiendanube</h1>
              <p className="text-sm text-surface-400">
                Stock y precios sincronizados desde tu tienda oficial
              </p>
            </div>
          </div>
          <SyncButton />
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Card variant="glass">
            <CardContent className="p-5 flex items-center gap-4">
              <Package className="h-8 w-8 text-primary-400 shrink-0" />
              <div>
                <p className="text-2xl font-bold text-surface-50">
                  {stats.totalProducts ?? 0}
                </p>
                <p className="text-xs text-surface-400">Productos en cache</p>
              </div>
            </CardContent>
          </Card>
          <Card variant="glass">
            <CardContent className="p-5 flex items-center gap-4">
              <Layers className="h-8 w-8 text-accent-400 shrink-0" />
              <div>
                <p className="text-2xl font-bold text-surface-50">
                  {stats.totalVariantsInStock ?? 0}
                </p>
                <p className="text-xs text-surface-400">Variantes con stock</p>
              </div>
            </CardContent>
          </Card>
          <Card variant="glass">
            <CardContent className="p-5 flex items-center gap-4">
              <TrendingUp className="h-8 w-8 text-green-400 shrink-0" />
              <div>
                <p className="text-2xl font-bold text-surface-50">
                  {lastSync?.status === "success" ? "OK" : lastSync?.status ?? "—"}
                </p>
                <p className="text-xs text-surface-400">Último estado de sync</p>
              </div>
            </CardContent>
          </Card>
          <Card variant="glass">
            <CardContent className="p-5 flex items-center gap-4">
              <AlertTriangle className={`h-8 w-8 shrink-0 ${stats.unmatchedCount > 0 ? "text-yellow-400" : "text-surface-600"}`} />
              <div>
                <p className={`text-2xl font-bold ${stats.unmatchedCount > 0 ? "text-yellow-400" : "text-surface-50"}`}>
                  {stats.unmatchedCount ?? 0}
                </p>
                <p className="text-xs text-surface-400">Sin match en catálogo</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Last sync info */}
        {lastSync && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Clock className="h-4 w-4 text-surface-400" />
                Última sincronización
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-surface-400 mb-1">Estado</p>
                {lastSync.status === "success" ? (
                  <Badge variant="success" className="gap-1">
                    <CheckCircle className="h-3 w-3" /> Exitosa
                  </Badge>
                ) : (
                  <Badge variant="error" className="gap-1">
                    <XCircle className="h-3 w-3" /> Error
                  </Badge>
                )}
              </div>
              <div>
                <p className="text-surface-400 mb-1">Disparado por</p>
                <p className="text-surface-200 font-medium capitalize">
                  {lastSync.trigger ?? "—"}
                </p>
              </div>
              <div>
                <p className="text-surface-400 mb-1">Productos</p>
                <p className="text-surface-200 font-medium">
                  {lastSync.products_synced ?? 0}
                </p>
              </div>
              <div>
                <p className="text-surface-400 mb-1">Fecha</p>
                <p className="text-surface-200 font-medium">
                  {lastSync.finished_at
                    ? new Date(lastSync.finished_at as string).toLocaleString("es-AR")
                    : "—"}
                </p>
              </div>
              {lastSync.error_msg && (
                <div className="col-span-full flex items-start gap-2 bg-red-900/20 border border-red-500/30 rounded-lg p-3 mt-2">
                  <AlertTriangle className="h-4 w-4 text-red-400 mt-0.5 shrink-0" />
                  <p className="text-xs text-red-300">{lastSync.error_msg as string}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Sync history */}
        {syncHistory.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <RefreshCw className="h-4 w-4 text-surface-400" />
                Historial de sincronización
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-surface-800">
                      <th className="text-left text-surface-400 py-2 pr-4 font-medium">Estado</th>
                      <th className="text-left text-surface-400 py-2 pr-4 font-medium">Tipo</th>
                      <th className="text-left text-surface-400 py-2 pr-4 font-medium">Productos</th>
                      <th className="text-left text-surface-400 py-2 font-medium">Fecha</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-800">
                    {syncHistory.map((entry, i) => (
                      <tr key={i}>
                        <td className="py-2.5 pr-4">
                          {entry.status === "success" ? (
                            <span className="flex items-center gap-1 text-green-400">
                              <CheckCircle className="h-3.5 w-3.5" /> OK
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-red-400">
                              <XCircle className="h-3.5 w-3.5" /> Error
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 pr-4 text-surface-300 capitalize">
                          {entry.trigger ?? "—"}
                        </td>
                        <td className="py-2.5 pr-4 text-surface-300">
                          {entry.products_synced ?? 0}
                        </td>
                        <td className="py-2.5 text-surface-400 text-xs">
                          {entry.finished_at
                            ? new Date(entry.finished_at as string).toLocaleString("es-AR")
                            : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Unmatched products diagnostic */}
        {stats.unmatchedCount > 0 && stats.unmatchedProducts.length > 0 && (
          <Card className="border-yellow-500/30 bg-yellow-900/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base text-yellow-300">
                <AlertTriangle className="h-4 w-4" />
                Productos sin match en catálogo ({stats.unmatchedCount})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-surface-400">
                Estos productos están en Tiendanube pero <strong className="text-surface-200">no tienen un código de carta válido</strong>.
                No aparecerán en el catálogo de la web. Para vincularlos, agregá el tag correcto
                en TN (ej: <code className="bg-surface-800 px-1 rounded text-xs">KT001</code>).
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-surface-700">
                      <th className="text-left text-surface-400 py-2 pr-4 font-medium">ID</th>
                      <th className="text-left text-surface-400 py-2 pr-4 font-medium">Nombre del producto</th>
                      <th className="text-left text-surface-400 py-2 font-medium">Handle (slug)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-800">
                    {stats.unmatchedProducts.map((p) => (
                      <tr key={p.id}>
                        <td className="py-2 pr-4 text-surface-500 font-mono">#{p.id}</td>
                        <td className="py-2 pr-4 text-surface-200">{p.name}</td>
                        <td className="py-2 text-surface-400 font-mono">{p.handle ?? "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {stats.unmatchedCount > 50 && (
                  <p className="text-xs text-surface-500 mt-2">
                    Mostrando 50 de {stats.unmatchedCount}. Sincronizá para ver el listado actualizado.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Setup instructions */}
        <Card className="border-primary-500/20 bg-primary-900/10">
          <CardHeader>
            <CardTitle className="text-base text-primary-300">Configuración de Tiendanube</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <p className="font-semibold text-surface-200">Variables de entorno necesarias</p>
                <ul className="space-y-1 text-surface-400 font-mono text-xs">
                  <li>TIENDANUBE_STORE_ID</li>
                  <li>TIENDANUBE_ACCESS_TOKEN</li>
                  <li>TIENDANUBE_CLIENT_SECRET</li>
                  <li>TIENDANUBE_WEBHOOK_SECRET <span className="text-surface-500">(opcional)</span></li>
                  <li>CRON_SECRET <span className="text-surface-500">(opcional)</span></li>
                </ul>
              </div>
              <div className="space-y-2">
                <p className="font-semibold text-surface-200">Webhook URL para Tiendanube</p>
                <code className="block bg-surface-800 border border-surface-700 rounded px-3 py-2 text-xs text-surface-300 break-all">
                  https://mazoteca.com/api/tiendanube/webhook
                </code>
                <p className="text-surface-500 text-xs">
                  Configurar en TN Admin → Apps → Webhooks para eventos{" "}
                  <code className="bg-surface-800 px-1 rounded">product/created</code>,{" "}
                  <code className="bg-surface-800 px-1 rounded">product/updated</code>,{" "}
                  <code className="bg-surface-800 px-1 rounded">product/deleted</code>
                </p>
              </div>
            </div>
            <div className="border-t border-surface-800 pt-4">
              <p className="font-semibold text-surface-200 mb-2">Códigos de carta en Tiendanube</p>
              <p className="text-surface-400 text-xs leading-relaxed">
                Para que cada producto se vincule a una carta del catálogo, agregá el código de
                carta (ej: <code className="bg-surface-800 px-1 rounded">KT001</code>) como{" "}
                <strong className="text-surface-300">tag del producto</strong> en tu tienda de
                Tiendanube. El sistema también puede detectarlo en el nombre, handle o SKU.
              </p>
            </div>
            <div className="flex gap-3">
              <a
                href="https://www.tiendanube.com/administrador/apps"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button size="sm" variant="secondary">
                  <ExternalLink className="h-3.5 w-3.5" />
                  Abrir TN Admin
                </Button>
              </a>
              <Link href="/singles">
                <Button size="sm" variant="ghost">
                  Ver página de Singles
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
