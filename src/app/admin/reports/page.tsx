import type { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Flag, ChevronLeft, ChevronRight, Eye } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/server";
import { ReportActions } from "./report-actions";

export const metadata: Metadata = {
  title: "Admin — Reportes",
  robots: { index: false, follow: false },
};

export const revalidate = 0;

const PAGE_SIZE = 25;

const typeLabels: Record<string, string> = {
  user: "Usuario",
  listing: "Publicación",
  thread: "Hilo",
  post: "Comentario",
  profile: "Perfil",
};

const statusConfig: Record<string, { label: string; variant: "warning" | "success" | "default" }> = {
  pending: { label: "Pendiente", variant: "warning" },
  resolved: { label: "Resuelto", variant: "success" },
  dismissed: { label: "Desestimado", variant: "default" },
};

export default async function AdminReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; status?: string }>;
}) {
  const sp = await searchParams;
  const page = Math.max(1, parseInt(sp.page ?? "1"));
  const statusFilter = sp.status ?? "all";
  const offset = (page - 1) * PAGE_SIZE;

  const supabase = createAdminClient();

  let query = supabase
    .from("reports")
    .select(
      `
      id, target_type, target_id, reason, details, status, created_at,
      reporter:profiles!reporter_id ( username ),
      resolver:profiles!resolved_by ( username )
    `,
      { count: "exact" }
    )
    .order("created_at", { ascending: false })
    .range(offset, offset + PAGE_SIZE - 1);

  if (statusFilter !== "all") {
    query = query.eq("status", statusFilter);
  }

  const { data: reports, count } = await query;
  const total = count ?? 0;
  const totalPages = Math.ceil(total / PAGE_SIZE);

  const pendingCount = statusFilter === "all"
    ? (reports ?? []).filter((r) => r.status === "pending").length
    : statusFilter === "pending" ? total : 0;

  const filters = [
    { value: "all", label: "Todos" },
    { value: "pending", label: "Pendientes" },
    { value: "resolved", label: "Resueltos" },
    { value: "dismissed", label: "Desestimados" },
  ];

  function formatDate(iso: string) {
    return new Intl.DateTimeFormat("es-AR", {
      day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit",
    }).format(new Date(iso));
  }

  return (
    <div className="min-h-screen bg-surface-900 p-4 sm:p-6 lg:p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <Link href="/admin" className="text-xs text-surface-400 hover:text-surface-200 mb-1 block">
              ← Volver al dashboard
            </Link>
            <h1 className="text-2xl font-bold text-surface-50 flex items-center gap-2">
              <Flag className="h-6 w-6 text-red-400" />
              Reportes
            </h1>
            <p className="text-sm text-surface-400 mt-0.5">{total} reportes</p>
          </div>
          {pendingCount > 0 && (
            <Badge variant="warning">{pendingCount} pendiente{pendingCount > 1 ? "s" : ""}</Badge>
          )}
        </div>

        {/* Filtros */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {filters.map((f) => (
            <Link
              key={f.value}
              href={`/admin/reports?status=${f.value}`}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                statusFilter === f.value
                  ? "bg-primary-600 text-white"
                  : "bg-surface-800 text-surface-400 hover:text-surface-200"
              }`}
            >
              {f.label}
            </Link>
          ))}
        </div>

        {reports && reports.length > 0 ? (
          <>
            <div className="space-y-3">
              {reports.map((report) => {
                const status = statusConfig[report.status] ?? statusConfig.pending;
                const reporter = (Array.isArray(report.reporter) ? report.reporter[0] : report.reporter) as { username: string } | null;
                const resolver = (Array.isArray(report.resolver) ? report.resolver[0] : report.resolver) as { username: string } | null;
                return (
                  <Card key={report.id} variant="interactive">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <Badge variant={status.variant}>{status.label}</Badge>
                            <Badge variant="default">{typeLabels[report.target_type] ?? report.target_type}</Badge>
                            <span className="text-xs text-surface-500">{formatDate(report.created_at)}</span>
                          </div>
                          <p className="text-sm font-medium text-surface-100 mb-1">{report.reason}</p>
                          {report.details && (
                            <p className="text-xs text-surface-400 mb-1 line-clamp-2">{report.details}</p>
                          )}
                          <div className="flex items-center gap-3 text-xs text-surface-500 flex-wrap">
                            <span>Reportado por: <span className="text-surface-300">@{reporter?.username ?? "—"}</span></span>
                            <span className="font-mono text-surface-600">ID: {report.target_id.slice(0, 8)}…</span>
                            {resolver && (
                              <span>Resuelto por: <span className="text-surface-300">@{resolver.username}</span></span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <Link
                            href={`/admin/reports?id=${report.id}`}
                            className="p-1.5 rounded text-surface-400 hover:bg-surface-700 transition-colors"
                            title="Ver detalles"
                          >
                            <Eye className="h-4 w-4" />
                          </Link>
                          {report.status === "pending" && (
                            <ReportActions reportId={report.id} />
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <div className="flex items-center justify-between mt-4">
              <p className="text-xs text-surface-400">
                Mostrando {offset + 1}–{Math.min(offset + PAGE_SIZE, total)} de {total}
              </p>
              <div className="flex items-center gap-1">
                {page > 1 ? (
                  <Link href={`/admin/reports?page=${page - 1}&status=${statusFilter}`} className="p-1.5 rounded text-surface-400 hover:text-surface-100 hover:bg-surface-700 transition-colors">
                    <ChevronLeft className="h-4 w-4" />
                  </Link>
                ) : (
                  <span className="p-1.5 text-surface-700"><ChevronLeft className="h-4 w-4" /></span>
                )}
                <span className="px-3 text-xs text-surface-400">{page} / {totalPages || 1}</span>
                {page < totalPages ? (
                  <Link href={`/admin/reports?page=${page + 1}&status=${statusFilter}`} className="p-1.5 rounded text-surface-400 hover:text-surface-100 hover:bg-surface-700 transition-colors">
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                ) : (
                  <span className="p-1.5 text-surface-700"><ChevronRight className="h-4 w-4" /></span>
                )}
              </div>
            </div>
          </>
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <Flag className="h-12 w-12 mx-auto mb-4 text-surface-600" />
              <p className="text-surface-400">
                {statusFilter === "pending" ? "No hay reportes pendientes. ¡Todo en orden!" : "No hay reportes en esta categoría."}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}


