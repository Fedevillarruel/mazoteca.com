import type { Metadata } from "next";
import Link from "next/link";
import { PageLayout } from "@/components/layout/page-layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowRight,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Plus,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Intercambios",
  description: "Proponé y gestioná intercambios de cartas con otros jugadores de Kingdom TCG.",
};

const statusConfig: Record<string, { label: string; variant: "success" | "warning" | "error" | "default" | "info"; icon: typeof CheckCircle }> = {
  pending: { label: "Pendiente", variant: "warning", icon: Clock },
  accepted: { label: "Aceptado", variant: "success", icon: CheckCircle },
  rejected: { label: "Rechazado", variant: "error", icon: XCircle },
  cancelled: { label: "Cancelado", variant: "default", icon: XCircle },
  expired: { label: "Expirado", variant: "default", icon: AlertTriangle },
};

const placeholderTrades = [
  {
    id: "t1",
    type: "sent",
    partner: "DragonMaster99",
    status: "pending",
    offeredCards: ["Llamarada Infernal", "Escudo de Roble"],
    requestedCards: ["Tormenta Arcana"],
    date: "2026-03-26",
  },
  {
    id: "t2",
    type: "received",
    partner: "CrystalKnight",
    status: "pending",
    offeredCards: ["Golem de Cristal"],
    requestedCards: ["Fénix Ancestral", "Lluvia de Estrellas"],
    date: "2026-03-25",
  },
  {
    id: "t3",
    type: "sent",
    partner: "ShadowHunter",
    status: "accepted",
    offeredCards: ["Espía Nocturno"],
    requestedCards: ["Trampa de Sombras"],
    date: "2026-03-20",
  },
  {
    id: "t4",
    type: "received",
    partner: "StormWizard",
    status: "rejected",
    offeredCards: ["Relámpago", "Lluvia Ácida"],
    requestedCards: ["Dragón de Tormenta", "Escudo Eléctrico", "Rayo Cegador"],
    date: "2026-03-18",
  },
];

export default function TradesPage() {
  return (
    <PageLayout
      title="Intercambios"
      description="Proponé y gestioná intercambios de cartas"
    >
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        {[
          { label: "Pendientes", value: "2", color: "text-amber-400" },
          { label: "Completados", value: "12", color: "text-green-400" },
          { label: "Enviados hoy", value: "1/3", color: "text-primary-400" },
          { label: "Reputación", value: "4.9★", color: "text-accent-400" },
        ].map((stat) => (
          <Card key={stat.label} variant="glass">
            <CardContent className="p-3 text-center">
              <p className={`text-lg font-bold ${stat.color}`}>{stat.value}</p>
              <p className="text-xs text-surface-400">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex items-center justify-between mb-6">
        <div className="flex gap-2">
          <Badge variant="primary" className="cursor-pointer px-3 py-1">Todos</Badge>
          <Badge variant="default" className="cursor-pointer px-3 py-1">Recibidos</Badge>
          <Badge variant="default" className="cursor-pointer px-3 py-1">Enviados</Badge>
          <Badge variant="default" className="cursor-pointer px-3 py-1">Pendientes</Badge>
        </div>
        <Button size="sm">
          <Plus className="h-4 w-4" />
          Nuevo intercambio
        </Button>
      </div>

      {/* Trade List */}
      <div className="space-y-4">
        {placeholderTrades.map((trade) => {
          const status = statusConfig[trade.status];
          const StatusIcon = status.icon;
          return (
            <Card key={trade.id} variant="interactive">
              <CardContent className="p-5">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant={status.variant}>
                        <StatusIcon className="h-3 w-3" />
                        {status.label}
                      </Badge>
                      <Badge variant="default">
                        {trade.type === "sent" ? "Enviado" : "Recibido"}
                      </Badge>
                      <span className="text-xs text-surface-500">{trade.date}</span>
                    </div>

                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-sm text-surface-400">
                        {trade.type === "sent" ? "Para:" : "De:"}
                      </span>
                      <Link
                        href={`/profile/${trade.partner}`}
                        className="text-sm font-medium text-primary-400 hover:underline"
                      >
                        {trade.partner}
                      </Link>
                    </div>

                    <div className="flex items-center gap-4">
                      {/* Offered */}
                      <div className="flex-1">
                        <p className="text-xs text-surface-500 mb-1">
                          {trade.type === "sent" ? "Ofrecés" : "Te ofrecen"}
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {trade.offeredCards.map((card) => (
                            <Badge key={card} variant="default" className="text-xs">
                              {card}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <RefreshCw className="h-4 w-4 text-surface-500 shrink-0" />

                      {/* Requested */}
                      <div className="flex-1">
                        <p className="text-xs text-surface-500 mb-1">
                          {trade.type === "sent" ? "Pedís" : "Te piden"}
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {trade.requestedCards.map((card) => (
                            <Badge key={card} variant="default" className="text-xs">
                              {card}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 shrink-0">
                    {trade.status === "pending" && trade.type === "received" && (
                      <>
                        <Button size="sm" variant="primary">
                          <CheckCircle className="h-4 w-4" />
                          Aceptar
                        </Button>
                        <Button size="sm" variant="danger">
                          <XCircle className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                    {trade.status === "pending" && trade.type === "sent" && (
                      <Button size="sm" variant="ghost">
                        Cancelar
                      </Button>
                    )}
                    {trade.status !== "pending" && (
                      <Button size="sm" variant="ghost">
                        Ver detalles
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </PageLayout>
  );
}
