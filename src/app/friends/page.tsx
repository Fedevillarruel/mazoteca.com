import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { PageLayout } from "@/components/layout/page-layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Search,
  UserPlus,
  UserCheck,
  MessageSquare,
  Clock,
  Users,
  X,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Amigos",
  description: "Gestioná tus amigos y solicitudes de amistad en Mazoteca.",
};

const placeholderFriends = [
  { id: "1", username: "DragonMaster99", status: "online", lastSeen: null, mutualDecks: 3 },
  { id: "2", username: "CrystalKnight", status: "online", lastSeen: null, mutualDecks: 1 },
  { id: "3", username: "ShadowHunter", status: "offline", lastSeen: "Hace 2 horas", mutualDecks: 5 },
  { id: "4", username: "StormWizard", status: "offline", lastSeen: "Hace 1 día", mutualDecks: 0 },
  { id: "5", username: "ForestKeeper", status: "in_game", lastSeen: null, mutualDecks: 2 },
];

const placeholderRequests = [
  { id: "r1", username: "NightBlade", type: "received" },
  { id: "r2", username: "FlameSorceress", type: "sent" },
];

const statusLabels: Record<string, { label: string; color: string }> = {
  online: { label: "En línea", color: "bg-green-500" },
  offline: { label: "Desconectado", color: "bg-surface-500" },
  in_game: { label: "En partida", color: "bg-amber-500" },
};

export default function FriendsPage() {
  return (
    <PageLayout
      title="Amigos"
      description="Gestioná tus conexiones en la comunidad"
    >
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Friends List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-surface-400" />
              <Input placeholder="Buscar amigos..." className="pl-9" />
            </div>
            <Button size="sm">
              <UserPlus className="h-4 w-4" />
              Agregar
            </Button>
          </div>

          <div className="flex items-center gap-2 mb-2">
            <Users className="h-4 w-4 text-surface-400" />
            <span className="text-sm text-surface-400">
              {placeholderFriends.length} amigos · {placeholderFriends.filter((f) => f.status === "online").length} en línea
            </span>
          </div>

          <div className="space-y-2">
            {placeholderFriends.map((friend) => {
              const statusInfo = statusLabels[friend.status];
              return (
                <Card key={friend.id} variant="interactive">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="h-10 w-10 rounded-full overflow-hidden bg-surface-700">
                          <Image
                            src={`https://api.dicebear.com/7.x/identicon/svg?seed=${friend.username}`}
                            alt={friend.username}
                            width={40}
                            height={40}
                          />
                        </div>
                        <div
                          className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-surface-900 ${statusInfo.color}`}
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <Link
                          href={`/profile/${friend.username}`}
                          className="text-sm font-medium text-surface-100 hover:text-primary-400"
                        >
                          {friend.username}
                        </Link>
                        <p className="text-xs text-surface-400">
                          {friend.status === "offline" && friend.lastSeen
                            ? friend.lastSeen
                            : statusInfo.label}
                        </p>
                      </div>

                      {friend.mutualDecks > 0 && (
                        <span className="text-xs text-surface-500">
                          {friend.mutualDecks} mazos compartidos
                        </span>
                      )}

                      <Button variant="ghost" size="icon-sm">
                        <MessageSquare className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Sidebar: Requests */}
        <div className="space-y-6">
          <Card>
            <CardContent className="p-4">
              <h3 className="text-sm font-semibold text-surface-100 mb-3 flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary-400" />
                Solicitudes
                <Badge variant="primary" className="text-xs">{placeholderRequests.length}</Badge>
              </h3>
              <div className="space-y-3">
                {placeholderRequests.map((req) => (
                  <div key={req.id} className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full overflow-hidden bg-surface-700">
                      <Image
                        src={`https://api.dicebear.com/7.x/identicon/svg?seed=${req.username}`}
                        alt={req.username}
                        width={32}
                        height={32}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-surface-200 truncate">{req.username}</p>
                      <p className="text-xs text-surface-500">
                        {req.type === "received" ? "Quiere ser tu amigo" : "Solicitud enviada"}
                      </p>
                    </div>
                    {req.type === "received" ? (
                      <div className="flex gap-1">
                        <Button size="icon-sm" variant="primary">
                          <UserCheck className="h-3.5 w-3.5" />
                        </Button>
                        <Button size="icon-sm" variant="ghost">
                          <X className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    ) : (
                      <Button size="icon-sm" variant="ghost">
                        <X className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <UserPlus className="h-8 w-8 mx-auto mb-2 text-surface-500" />
              <p className="text-sm text-surface-300 mb-2">Buscá jugadores por nombre</p>
              <Input placeholder="Nombre de usuario..." className="mb-3" />
              <Button variant="secondary" size="sm" className="w-full">
                Buscar
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageLayout>
  );
}
