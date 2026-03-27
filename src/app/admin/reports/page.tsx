import type { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Flag,
  Eye,
  CheckCircle,
  XCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Admin — Reportes",
};

const placeholderReports = [
  {
    id: "r1",
    type: "user",
    target: "ToxicPlayer",
    reason: "Comportamiento abusivo en el foro",
    reporter: "CrystalKnight",
    status: "pending",
    date: "2026-03-27",
  },
  {
    id: "r2",
    type: "listing",
    target: "Carta falsa — $50.000",
    reason: "Publicación fraudulenta",
    reporter: "DragonMaster99",
    status: "pending",
    date: "2026-03-26",
  },
  {
    id: "r3",
    type: "thread",
    target: "Spam de links externos",
    reason: "Spam / publicidad no autorizada",
    reporter: "StormWizard",
    status: "pending",
    date: "2026-03-26",
  },
  {
    id: "r4",
    type: "user",
    target: "ScammerBot",
    reason: "Cuenta bot / spam",
    reporter: "ShadowHunter",
    status: "resolved",
    date: "2026-03-25",
  },
  {
    id: "r5",
    type: "listing",
    target: "Carta con precio irreal",
    reason: "Precio manipulado",
    reporter: "ForestKeeper",
    status: "dismissed",
    date: "2026-03-24",
  },
];

const typeLabels: Record<string, string> = {
  user: "Usuario",
  listing: "Publicación",
  thread: "Hilo",
  post: "Comentario",
};

const statusConfig: Record<string, { label: string; variant: "warning" | "success" | "default" }> = {
  pending: { label: "Pendiente", variant: "warning" },
  resolved: { label: "Resuelto", variant: "success" },
  dismissed: { label: "Desestimado", variant: "default" },
};

export default function AdminReportsPage() {
  const pendingCount = placeholderReports.filter((r) => r.status === "pending").length;

  return (
    <div className="min-h-screen bg-surface-900 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <Link href="/admin" className="text-xs text-surface-400 hover:text-surface-200 mb-1 block">
              ← Volver al dashboard
            </Link>
            <h1 className="text-2xl font-bold text-surface-50 flex items-center gap-2">
              <Flag className="h-6 w-6 text-red-400" />
              Reportes
            </h1>
          </div>
          <Badge variant="warning">{pendingCount} pendientes</Badge>
        </div>

        <div className="flex gap-2 mb-6">
          <Badge variant="primary" className="cursor-pointer px-3 py-1">Todos</Badge>
          <Badge variant="default" className="cursor-pointer px-3 py-1">Pendientes</Badge>
          <Badge variant="default" className="cursor-pointer px-3 py-1">Resueltos</Badge>
          <Badge variant="default" className="cursor-pointer px-3 py-1">Desestimados</Badge>
        </div>

        <div className="space-y-3">
          {placeholderReports.map((report) => {
            const status = statusConfig[report.status];
            return (
              <Card key={report.id} variant="interactive">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant={status.variant}>{status.label}</Badge>
                        <Badge variant="default">{typeLabels[report.type]}</Badge>
                        <span className="text-xs text-surface-500">{report.date}</span>
                      </div>
                      <p className="text-sm font-medium text-surface-100 mb-1">
                        Objetivo: {report.target}
                      </p>
                      <p className="text-sm text-surface-400 mb-1">{report.reason}</p>
                      <p className="text-xs text-surface-500">
                        Reportado por: {report.reporter}
                      </p>
                    </div>
                    {report.status === "pending" && (
                      <div className="flex gap-1 shrink-0">
                        <Button variant="ghost" size="icon-sm" title="Ver detalles">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="primary" size="icon-sm" title="Resolver">
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon-sm" title="Desestimar">
                          <XCircle className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="flex items-center justify-between mt-4">
          <p className="text-xs text-surface-400">Mostrando 1-5 de 142</p>
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
