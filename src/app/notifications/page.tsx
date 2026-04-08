import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { PageLayout } from "@/components/layout/page-layout";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Bell,
  CheckCheck,
  RefreshCw,
  ShoppingBag,
  MessageSquare,
  UserPlus,
  Megaphone,
  Trash2,
} from "lucide-react";
import { getNotifications, markAllNotificationsRead, deleteNotification } from "@/lib/actions/notifications";
import { getCurrentUser } from "@/lib/actions/auth";

export const metadata: Metadata = {
  title: "Notificaciones",
  description: "Tus notificaciones de Mazoteca.",
  robots: { index: false, follow: false },
};

export const revalidate = 0;

// Server action wrappers — form actions must return void
async function markAllReadAction() {
  "use server";
  await markAllNotificationsRead();
  revalidatePath("/notifications");
}

async function deleteNotifAction(id: string) {
  "use server";
  await deleteNotification(id);
  revalidatePath("/notifications");
}

const iconMap: Record<string, typeof Bell> = {
  trade_proposed: RefreshCw,
  trade_updated: RefreshCw,
  trade_accepted: RefreshCw,
  trade_rejected: RefreshCw,
  offer_received: ShoppingBag,
  offer_made: ShoppingBag,
  offer_accepted: ShoppingBag,
  offer_rejected: ShoppingBag,
  listing_sold: ShoppingBag,
  friend_request: UserPlus,
  friend_accepted: UserPlus,
  forum_reply: MessageSquare,
  forum_comment: MessageSquare,
  forum_mention: MessageSquare,
  system: Megaphone,
};

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Ahora";
  if (mins < 60) return `Hace ${mins} min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `Hace ${hrs}h`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return "Ayer";
  return `Hace ${days} días`;
}

export default async function NotificationsPage() {
  const currentUser = await getCurrentUser();
  if (!currentUser) redirect("/login");

  const { notifications, unreadCount } = await getNotifications();

  return (
    <PageLayout
      title="Notificaciones"
      description="Mantente al día con toda tu actividad"
      showAds={false}
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-primary-400" />
          {unreadCount > 0 && (
            <Badge variant="primary">{unreadCount} sin leer</Badge>
          )}
        </div>
        {unreadCount > 0 && (
          <form action={markAllReadAction}>
            <button
              type="submit"
              className="flex items-center gap-1.5 text-xs text-surface-400 hover:text-surface-200 transition-colors px-2 py-1"
            >
              <CheckCheck className="h-4 w-4" />
              Marcar todas como leídas
            </button>
          </form>
        )}
      </div>

      {notifications.length > 0 ? (
        <div className="space-y-2">
          {notifications.map((notif) => {
            const Icon = iconMap[notif.type] ?? Bell;
            const isUnread = !notif.is_read;
            return (
              <Card
                key={notif.id}
                variant="interactive"
                className={isUnread ? "border-l-2 border-l-primary-500" : ""}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div
                      className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 ${
                        isUnread
                          ? "bg-primary-600/20 text-primary-400"
                          : "bg-surface-800 text-surface-400"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className={`text-sm font-medium ${isUnread ? "text-surface-50" : "text-surface-300"}`}>
                          {notif.title}
                        </p>
                        {isUnread && (
                          <div className="h-2 w-2 rounded-full bg-primary-500 shrink-0" />
                        )}
                      </div>
                      {notif.message && (
                        <p className="text-sm text-surface-400 mt-0.5">{notif.message}</p>
                      )}
                      <div className="flex items-center gap-3 mt-1">
                        <p className="text-xs text-surface-500">{timeAgo(notif.created_at)}</p>
                        {notif.link && (
                          <Link href={notif.link} className="text-xs text-primary-400 hover:text-primary-300 transition-colors">
                            Ver →
                          </Link>
                        )}
                      </div>
                    </div>
                    <form action={deleteNotifAction.bind(null, notif.id)}>
                      <button
                        type="submit"
                        className="p-1 rounded text-surface-600 hover:text-surface-400 transition-colors shrink-0"
                        title="Eliminar"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </form>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <Bell className="h-12 w-12 mx-auto mb-4 text-surface-600" />
            <p className="text-surface-400">No tenés notificaciones por el momento.</p>
          </CardContent>
        </Card>
      )}
    </PageLayout>
  );
}
