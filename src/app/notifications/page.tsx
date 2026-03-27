import type { Metadata } from "next";
import { PageLayout } from "@/components/layout/page-layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Bell,
  CheckCheck,
  RefreshCw,
  ShoppingBag,
  MessageSquare,
  UserPlus,
  Heart,
  Megaphone,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Notificaciones",
  description: "Tus notificaciones de Mazoteca.",
};

const iconMap: Record<string, typeof Bell> = {
  trade: RefreshCw,
  singles: ShoppingBag,
  forum: MessageSquare,
  friend: UserPlus,
  like: Heart,
  system: Megaphone,
};

const placeholderNotifications = [
  {
    id: "n1",
    type: "trade",
    title: "Intercambio aceptado",
    body: "DragonMaster99 aceptó tu propuesta de intercambio.",
    read: false,
    date: "Hace 5 minutos",
  },
  {
    id: "n3",
    type: "singles",
    title: "Nueva oferta",
    body: "Recibiste una oferta de $850 por tu Fénix Ancestral.",
    read: false,
    date: "Hace 3 horas",
  },
  {
    id: "n4",
    type: "friend",
    title: "Solicitud de amistad",
    body: "NightBlade quiere ser tu amigo.",
    read: true,
    date: "Ayer",
  },
  {
    id: "n5",
    type: "like",
    title: "Le gustó tu mazo",
    body: "A CrystalKnight le gustó tu mazo 'Fuego Agresivo'.",
    read: true,
    date: "Ayer",
  },
  {
    id: "n6",
    type: "forum",
    title: "Respuesta en hilo",
    body: "StormWizard respondió a tu hilo 'Mejor combo de apertura'.",
    read: true,
    date: "Hace 2 días",
  },
  {
    id: "n7",
    type: "system",
    title: "Actualización del sistema",
    body: "Nueva expansión 'Tormenta de Arena' ya disponible en el catálogo.",
    read: true,
    date: "Hace 3 días",
  },
];

export default function NotificationsPage() {
  const unreadCount = placeholderNotifications.filter((n) => !n.read).length;

  return (
    <PageLayout
      title="Notificaciones"
      description="Mantente al día con toda tu actividad"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-primary-400" />
          {unreadCount > 0 && (
            <Badge variant="primary">{unreadCount} sin leer</Badge>
          )}
        </div>
        <Button variant="ghost" size="sm">
          <CheckCheck className="h-4 w-4" />
          Marcar todas como leídas
        </Button>
      </div>

      <div className="space-y-2">
        {placeholderNotifications.map((notif) => {
          const Icon = iconMap[notif.type] || Bell;
          return (
            <Card
              key={notif.id}
              variant="interactive"
              className={!notif.read ? "border-l-2 border-l-primary-500" : ""}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div
                    className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 ${
                      !notif.read
                        ? "bg-primary-600/20 text-primary-400"
                        : "bg-surface-800 text-surface-400"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p
                        className={`text-sm font-medium ${
                          !notif.read ? "text-surface-50" : "text-surface-300"
                        }`}
                      >
                        {notif.title}
                      </p>
                      {!notif.read && (
                        <div className="h-2 w-2 rounded-full bg-primary-500 shrink-0" />
                      )}
                    </div>
                    <p className="text-sm text-surface-400 mt-0.5">{notif.body}</p>
                    <p className="text-xs text-surface-500 mt-1">{notif.date}</p>
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
