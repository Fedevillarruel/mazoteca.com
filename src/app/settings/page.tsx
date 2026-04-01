"use client";

import { useState } from "react";
import Image from "next/image";
import { PageLayout } from "@/components/layout/page-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  User,
  Shield,
  Bell,
  Palette,
  Eye,
  Lock,
  Save,
  Trash2,
  Check,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/auth/auth-provider";

const AVATARS = [
  { id: "nemea", label: "Nemea", src: "/avatars/nemea.png" },
  { id: "igno", label: "Igno", src: "/avatars/igno.png" },
  { id: "viggo", label: "Viggo", src: "/avatars/viggo.png" },
];

const sections = [
  { id: "profile", label: "Perfil", icon: User },
  { id: "privacy", label: "Privacidad", icon: Eye },
  { id: "security", label: "Seguridad", icon: Shield },
  { id: "notifications", label: "Notificaciones", icon: Bell },
  { id: "appearance", label: "Apariencia", icon: Palette },
] as const;

type Section = (typeof sections)[number]["id"];
type SaveStatus = "idle" | "saving" | "success" | "error";

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState<Section>("profile");
  const { user, refreshUser } = useAuth();

  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);
  const [bio, setBio] = useState("");
  const [location, setLocation] = useState("");
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");

  // Sync avatar once user loads — only runs when user changes from null to a value
  const prevUserRef = useState<string | null>(null);
  if (user && prevUserRef[0] !== user.id) {
    prevUserRef[1](user.id);
    const match = user.avatar_url
      ? AVATARS.find((a) => a.src === user.avatar_url)?.id ?? null
      : null;
    if (selectedAvatar === null) setSelectedAvatar(match);
  }

  async function handleSaveProfile() {
    if (!user) return;
    if (saveStatus === "saving") return; // prevent double-click loop
    setSaveStatus("saving");
    const supabase = createClient();
    const avatarSrc = AVATARS.find((a) => a.id === selectedAvatar)?.src ?? user.avatar_url;
    const { error } = await supabase
      .from("profiles")
      .update({ avatar_url: avatarSrc, bio: bio || null, location: location || null })
      .eq("id", user.id);
    if (error) {
      setSaveStatus("error");
      setTimeout(() => setSaveStatus("idle"), 3000);
    } else {
      await refreshUser();
      setSaveStatus("success");
      setTimeout(() => setSaveStatus("idle"), 2500);
    }
  }

  return (
    <PageLayout
      title="Configuración"
      description="Personalizá tu experiencia en Mazoteca"
    >
      <div className="grid lg:grid-cols-4 gap-6">
        {/* Sidebar Nav */}
        <nav className="space-y-1">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeSection === section.id
                  ? "bg-primary-600/20 text-primary-300"
                  : "text-surface-400 hover:text-surface-200 hover:bg-surface-800"
              }`}
            >
              <section.icon className="h-4 w-4" />
              {section.label}
            </button>
          ))}
        </nav>

        {/* Content */}
        <div className="lg:col-span-3 space-y-6">
          {activeSection === "profile" && (
            <div className="space-y-6">
              {/* Avatar Picker */}
              <Card>
                <CardHeader>
                  <CardTitle>Avatar</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-surface-400 mb-4">
                    Elegí tu avatar de coleccionista
                  </p>
                  <div className="grid grid-cols-3 gap-3 max-w-xs">
                    {AVATARS.map((avatar) => {
                      const isSelected = selectedAvatar === avatar.id;
                      return (
                        <button
                          key={avatar.id}
                          type="button"
                          onClick={() => setSelectedAvatar(avatar.id)}
                          className={cn(
                            "relative aspect-square rounded-xl overflow-hidden border-2 transition-all focus:outline-none",
                            isSelected
                              ? "border-primary-500 ring-2 ring-primary-500/30 scale-[1.03]"
                              : "border-surface-700 hover:border-surface-500"
                          )}
                        >
                          <Image
                            src={avatar.src}
                            alt={avatar.label}
                            fill
                            className="object-cover"
                            sizes="120px"
                          />
                          {isSelected && (
                            <div className="absolute inset-0 bg-primary-600/20 flex items-end justify-end p-1.5">
                              <span className="bg-primary-500 text-white rounded-full p-0.5">
                                <Check className="h-3 w-3" />
                              </span>
                            </div>
                          )}
                          <div className="absolute bottom-0 inset-x-0 bg-linear-to-t from-black/60 to-transparent pt-4 pb-1.5 px-2">
                            <p className="text-[11px] font-semibold text-white text-center leading-none">
                              {avatar.label}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Profile Info */}
              <Card>
                <CardHeader>
                  <CardTitle>Información de perfil</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-surface-200 mb-1.5">
                      Nickname
                    </label>
                    <input
                      value={user?.username ?? ""}
                      disabled
                      className="w-full bg-surface-800/50 border border-surface-700 rounded-lg px-3 py-2.5 text-sm text-surface-400 cursor-not-allowed"
                    />
                    <p className="text-xs text-surface-500 mt-1">
                      El nickname no se puede cambiar
                    </p>
                  </div>
                  <Textarea
                    label="Biografía"
                    placeholder="Contá algo sobre vos..."
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    rows={3}
                  />
                  <Input
                    label="Ubicación"
                    placeholder="Ej: Buenos Aires, Argentina"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                  <div className="flex items-center justify-end gap-3">
                    {saveStatus === "success" && (
                      <span className="flex items-center gap-1.5 text-sm text-success">
                        <CheckCircle className="h-4 w-4" />
                        Cambios guardados
                      </span>
                    )}
                    {saveStatus === "error" && (
                      <span className="flex items-center gap-1.5 text-sm text-error">
                        <AlertCircle className="h-4 w-4" />
                        Error al guardar
                      </span>
                    )}
                    <Button onClick={handleSaveProfile} isLoading={saveStatus === "saving"}>
                      <Save className="h-4 w-4" />
                      Guardar cambios
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeSection === "privacy" && (
            <Card>
              <CardHeader>
                <CardTitle>Privacidad</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Select
                  label="Visibilidad del perfil"
                  options={[
                    { value: "public", label: "Público" },
                    { value: "friends", label: "Solo amigos" },
                    { value: "private", label: "Privado" },
                  ]}
                  defaultValue="public"
                />
                <Select
                  label="Visibilidad de la colección"
                  options={[
                    { value: "public", label: "Público" },
                    { value: "friends", label: "Solo amigos" },
                    { value: "private", label: "Privado" },
                  ]}
                  defaultValue="friends"
                />
                <Select
                  label="Quién puede enviar solicitudes de intercambio"
                  options={[
                    { value: "everyone", label: "Todos" },
                    { value: "friends", label: "Solo amigos" },
                    { value: "nobody", label: "Nadie" },
                  ]}
                  defaultValue="everyone"
                />
                <div className="flex justify-end">
                  <Button>
                    <Save className="h-4 w-4" />
                    Guardar cambios
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {activeSection === "security" && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Cambiar contraseña</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Input label="Contraseña actual" type="password" />
                  <Input label="Nueva contraseña" type="password" />
                  <Input label="Confirmar nueva contraseña" type="password" />
                  <div className="flex justify-end">
                    <Button>
                      <Lock className="h-4 w-4" />
                      Cambiar contraseña
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-red-500/20">
                <CardHeader>
                  <CardTitle className="text-red-400">Zona peligrosa</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-surface-400 mb-4">
                    Al eliminar tu cuenta se borrarán permanentemente todos tus
                    datos, mazos, colección e historial. Esta acción no se puede
                    deshacer.
                  </p>
                  <Button variant="danger">
                    <Trash2 className="h-4 w-4" />
                    Eliminar mi cuenta
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}

          {activeSection === "notifications" && (
            <Card>
              <CardHeader>
                <CardTitle>Preferencias de notificaciones</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  {
                    id: "trades",
                    label: "Intercambios",
                    description: "Propuestas y actualizaciones",
                  },
                  {
                    id: "singles",
                    label: "Singles",
                    description: "Ofertas en tus publicaciones",
                  },
                  {
                    id: "friends",
                    label: "Amigos",
                    description: "Solicitudes y actividad",
                  },
                  {
                    id: "forum",
                    label: "Foro",
                    description: "Respuestas a tus hilos",
                  },
                  {
                    id: "system",
                    label: "Sistema",
                    description: "Actualizaciones y novedades",
                  },
                ].map((pref) => (
                  <div
                    key={pref.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-surface-800/50"
                  >
                    <div>
                      <p className="text-sm font-medium text-surface-200">
                        {pref.label}
                      </p>
                      <p className="text-xs text-surface-400">
                        {pref.description}
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-surface-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary-600" />
                    </label>
                  </div>
                ))}
                <div className="flex justify-end">
                  <Button>
                    <Save className="h-4 w-4" />
                    Guardar cambios
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {activeSection === "appearance" && (
            <Card>
              <CardHeader>
                <CardTitle>Apariencia</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Select
                  label="Tema"
                  options={[
                    { value: "dark", label: "Oscuro (predeterminado)" },
                    { value: "light", label: "Claro (próximamente)" },
                    { value: "system", label: "Automático del sistema" },
                  ]}
                  defaultValue="dark"
                />
                <Select
                  label="Densidad de la vista"
                  options={[
                    { value: "comfortable", label: "Cómoda" },
                    { value: "compact", label: "Compacta" },
                  ]}
                  defaultValue="comfortable"
                />
                <Select
                  label="Idioma"
                  options={[
                    { value: "es", label: "Español" },
                    { value: "en", label: "English (próximamente)" },
                  ]}
                  defaultValue="es"
                />
                <div className="flex justify-end">
                  <Button>
                    <Save className="h-4 w-4" />
                    Guardar cambios
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </PageLayout>
  );
}
