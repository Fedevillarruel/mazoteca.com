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
import { cn } from "@/lib/utils";
import { updateProfile } from "@/lib/actions/profile";
import {
  updateNotificationPreferences,
  updatePassword,
  type NotificationPreferences,
} from "@/lib/actions/notifications";

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

interface ProfileData {
  id: string;
  username: string;
  display_name: string | null;
  bio: string | null;
  location: string | null;
  avatar_url: string | null;
  digital_collection_visibility: string | null;
  physical_collection_visibility: string | null;
  decks_visibility: string | null;
}

function resolveAvatarId(avatarUrl: string | null): string | null {
  if (!avatarUrl) return null;
  return AVATARS.find((a) => avatarUrl.includes(a.id))?.id ?? null;
}

function StatusMsg({ status, error }: { status: SaveStatus; error: string | null }) {
  if (status === "success") {
    return (
      <span className="flex items-center gap-1.5 text-sm text-success">
        <CheckCircle className="h-4 w-4" />
        Cambios guardados
      </span>
    );
  }
  if (status === "error") {
    return (
      <span className="flex items-center gap-1.5 text-sm text-error">
        <AlertCircle className="h-4 w-4" />
        {error ?? "Error al guardar"}
      </span>
    );
  }
  return null;
}

export function SettingsClient({
  profile,
  initialPrefs,
}: {
  profile: ProfileData;
  initialPrefs: NotificationPreferences;
}) {
  const [activeSection, setActiveSection] = useState<Section>("profile");

  // ── Profile ──────────────────────────────────────────────────────────────
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(
    resolveAvatarId(profile.avatar_url)
  );
  const [displayName, setDisplayName] = useState(profile.display_name ?? "");
  const [bio, setBio] = useState(profile.bio ?? "");
  const [location, setLocation] = useState(profile.location ?? "");
  const [profileStatus, setProfileStatus] = useState<SaveStatus>("idle");
  const [profileError, setProfileError] = useState<string | null>(null);

  // ── Privacy ───────────────────────────────────────────────────────────────
  const [digitalVis, setDigitalVis] = useState(
    profile.digital_collection_visibility ?? "public"
  );
  const [physicalVis, setPhysicalVis] = useState(
    profile.physical_collection_visibility ?? "public"
  );
  const [decksVis, setDecksVis] = useState(profile.decks_visibility ?? "public");
  const [privacyStatus, setPrivacyStatus] = useState<SaveStatus>("idle");
  const [privacyError, setPrivacyError] = useState<string | null>(null);

  // ── Security ──────────────────────────────────────────────────────────────
  const [currentPwd, setCurrentPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [securityStatus, setSecurityStatus] = useState<SaveStatus>("idle");
  const [securityError, setSecurityError] = useState<string | null>(null);

  // ── Notifications ─────────────────────────────────────────────────────────
  const [prefs, setPrefs] = useState<NotificationPreferences>(initialPrefs);
  const [notifStatus, setNotifStatus] = useState<SaveStatus>("idle");
  const [notifError, setNotifError] = useState<string | null>(null);

  // ── Handlers ──────────────────────────────────────────────────────────────

  async function handleSaveProfile() {
    if (profileStatus === "saving") return;
    setProfileStatus("saving");
    setProfileError(null);
    const avatarSrc = AVATARS.find((a) => a.id === selectedAvatar)?.src ?? profile.avatar_url;
    const fd = new FormData();
    if (displayName) fd.set("display_name", displayName);
    if (bio) fd.set("bio", bio);
    if (location) fd.set("location", location);
    if (avatarSrc) fd.set("avatar_url", avatarSrc);
    fd.set("digital_collection_visibility", digitalVis);
    fd.set("physical_collection_visibility", physicalVis);
    fd.set("decks_visibility", decksVis);
    const result = await updateProfile(fd);
    if (result?.error) {
      setProfileError(result.error);
      setProfileStatus("error");
      setTimeout(() => setProfileStatus("idle"), 3000);
    } else {
      setProfileStatus("success");
      setTimeout(() => setProfileStatus("idle"), 2500);
    }
  }

  async function handleSavePrivacy() {
    if (privacyStatus === "saving") return;
    setPrivacyStatus("saving");
    setPrivacyError(null);
    const fd = new FormData();
    if (displayName) fd.set("display_name", displayName);
    if (bio) fd.set("bio", bio);
    if (location) fd.set("location", location);
    fd.set("digital_collection_visibility", digitalVis);
    fd.set("physical_collection_visibility", physicalVis);
    fd.set("decks_visibility", decksVis);
    const result = await updateProfile(fd);
    if (result?.error) {
      setPrivacyError(result.error);
      setPrivacyStatus("error");
      setTimeout(() => setPrivacyStatus("idle"), 3000);
    } else {
      setPrivacyStatus("success");
      setTimeout(() => setPrivacyStatus("idle"), 2500);
    }
  }

  async function handleChangePassword() {
    if (securityStatus === "saving") return;
    setSecurityError(null);
    if (newPwd !== confirmPwd) {
      setSecurityError("Las contraseñas nuevas no coinciden.");
      setSecurityStatus("error");
      setTimeout(() => setSecurityStatus("idle"), 3000);
      return;
    }
    if (newPwd.length < 8) {
      setSecurityError("La nueva contraseña debe tener al menos 8 caracteres.");
      setSecurityStatus("error");
      setTimeout(() => setSecurityStatus("idle"), 3000);
      return;
    }
    setSecurityStatus("saving");
    const result = await updatePassword(currentPwd, newPwd);
    if (result?.error) {
      setSecurityError(result.error);
      setSecurityStatus("error");
      setTimeout(() => setSecurityStatus("idle"), 3000);
    } else {
      setSecurityStatus("success");
      setCurrentPwd("");
      setNewPwd("");
      setConfirmPwd("");
      setTimeout(() => setSecurityStatus("idle"), 2500);
    }
  }

  async function handleSaveNotifications() {
    if (notifStatus === "saving") return;
    setNotifStatus("saving");
    setNotifError(null);
    const result = await updateNotificationPreferences(prefs);
    if (result?.error) {
      setNotifError(result.error);
      setNotifStatus("error");
      setTimeout(() => setNotifStatus("idle"), 3000);
    } else {
      setNotifStatus("success");
      setTimeout(() => setNotifStatus("idle"), 2500);
    }
  }

  const notifItems: {
    key: keyof NotificationPreferences;
    label: string;
    description: string;
  }[] = [
    {
      key: "trades",
      label: "Intercambios",
      description: "Propuestas recibidas, aceptaciones y contra-ofertas",
    },
    {
      key: "singles",
      label: "Singles",
      description: "Ofertas en tus publicaciones y respuestas a tus ofertas",
    },
    {
      key: "friends",
      label: "Amigos",
      description: "Solicitudes de amistad recibidas y aceptadas",
    },
    {
      key: "forum",
      label: "Foro",
      description: "Respuestas a tus hilos del foro",
    },
    {
      key: "system",
      label: "Sistema",
      description: "Actualizaciones, novedades y anuncios importantes",
    },
  ];

  return (
    <PageLayout
      title="Configuración"
      description="Personalizá tu experiencia en Mazoteca"
    >
      <div className="grid lg:grid-cols-4 gap-6">
        {/* Sidebar */}
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

        <div className="lg:col-span-3 space-y-6">

          {/* ── Perfil ── */}
          {activeSection === "profile" && (
            <div className="space-y-6">
              <Card>
                <CardHeader><CardTitle>Avatar</CardTitle></CardHeader>
                <CardContent>
                  <p className="text-sm text-surface-400 mb-4">Elegí tu avatar de coleccionista</p>
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
                          <Image src={avatar.src} alt={avatar.label} fill className="object-cover" sizes="120px" />
                          {isSelected && (
                            <div className="absolute inset-0 bg-primary-600/20 flex items-end justify-end p-1.5">
                              <span className="bg-primary-500 text-white rounded-full p-0.5">
                                <Check className="h-3 w-3" />
                              </span>
                            </div>
                          )}
                          <div className="absolute bottom-0 inset-x-0 bg-linear-to-t from-black/60 to-transparent pt-4 pb-1.5 px-2">
                            <p className="text-[11px] font-semibold text-white text-center leading-none">{avatar.label}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle>Información de perfil</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-surface-200 mb-1.5">Nickname</label>
                    <input
                      value={profile.username}
                      disabled
                      className="w-full bg-surface-800/50 border border-surface-700 rounded-lg px-3 py-2.5 text-sm text-surface-400 cursor-not-allowed"
                    />
                    <p className="text-xs text-surface-500 mt-1">El nickname no se puede cambiar</p>
                  </div>
                  <Input
                    label="Nombre para mostrar"
                    placeholder={profile.username}
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                  />
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
                    <StatusMsg status={profileStatus} error={profileError} />
                    <Button onClick={handleSaveProfile} isLoading={profileStatus === "saving"}>
                      <Save className="h-4 w-4" />
                      Guardar cambios
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* ── Privacidad ── */}
          {activeSection === "privacy" && (
            <Card>
              <CardHeader><CardTitle>Privacidad</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <Select
                  label="Visibilidad de la colección digital"
                  options={[
                    { value: "public", label: "Público" },
                    { value: "friends", label: "Solo amigos" },
                    { value: "private", label: "Privado" },
                  ]}
                  value={digitalVis}
                  onChange={(e) => setDigitalVis(e.target.value)}
                />
                <Select
                  label="Visibilidad de la colección física"
                  options={[
                    { value: "public", label: "Público" },
                    { value: "friends", label: "Solo amigos" },
                    { value: "private", label: "Privado" },
                  ]}
                  value={physicalVis}
                  onChange={(e) => setPhysicalVis(e.target.value)}
                />
                <Select
                  label="Visibilidad de los mazos"
                  options={[
                    { value: "public", label: "Público" },
                    { value: "friends", label: "Solo amigos" },
                    { value: "private", label: "Privado" },
                  ]}
                  value={decksVis}
                  onChange={(e) => setDecksVis(e.target.value)}
                />
                <div className="flex items-center justify-end gap-3">
                  <StatusMsg status={privacyStatus} error={privacyError} />
                  <Button onClick={handleSavePrivacy} isLoading={privacyStatus === "saving"}>
                    <Save className="h-4 w-4" />
                    Guardar cambios
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* ── Seguridad ── */}
          {activeSection === "security" && (
            <div className="space-y-6">
              <Card>
                <CardHeader><CardTitle>Cambiar contraseña</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <Input
                    label="Contraseña actual"
                    type="password"
                    value={currentPwd}
                    onChange={(e) => setCurrentPwd(e.target.value)}
                    autoComplete="current-password"
                  />
                  <Input
                    label="Nueva contraseña"
                    type="password"
                    value={newPwd}
                    onChange={(e) => setNewPwd(e.target.value)}
                    autoComplete="new-password"
                  />
                  <Input
                    label="Confirmar nueva contraseña"
                    type="password"
                    value={confirmPwd}
                    onChange={(e) => setConfirmPwd(e.target.value)}
                    autoComplete="new-password"
                  />
                  {newPwd.length > 0 && (
                    <PasswordStrength password={newPwd} />
                  )}
                  <div className="flex items-center justify-end gap-3">
                    <StatusMsg status={securityStatus} error={securityError} />
                    <Button
                      onClick={handleChangePassword}
                      isLoading={securityStatus === "saving"}
                      disabled={!currentPwd || !newPwd || !confirmPwd}
                    >
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
                    Al eliminar tu cuenta se borrarán permanentemente todos tus datos,
                    mazos, colección e historial. Esta acción no se puede deshacer.
                  </p>
                  <Button variant="danger">
                    <Trash2 className="h-4 w-4" />
                    Eliminar mi cuenta
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}

          {/* ── Notificaciones ── */}
          {activeSection === "notifications" && (
            <Card>
              <CardHeader>
                <CardTitle>Preferencias de notificaciones</CardTitle>
                <p className="text-sm text-surface-400 mt-1">
                  Elegí qué tipo de notificaciones querés recibir.
                </p>
              </CardHeader>
              <CardContent className="space-y-3">
                {notifItems.map((item) => (
                  <div
                    key={item.key}
                    className="flex items-center justify-between p-3 rounded-lg bg-surface-800/50"
                  >
                    <div>
                      <p className="text-sm font-medium text-surface-200">{item.label}</p>
                      <p className="text-xs text-surface-400">{item.description}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={prefs[item.key]}
                        onChange={(e) =>
                          setPrefs((prev) => ({ ...prev, [item.key]: e.target.checked }))
                        }
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-surface-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary-600" />
                    </label>
                  </div>
                ))}
                <div className="flex items-center justify-end gap-3 pt-2">
                  <StatusMsg status={notifStatus} error={notifError} />
                  <Button onClick={handleSaveNotifications} isLoading={notifStatus === "saving"}>
                    <Save className="h-4 w-4" />
                    Guardar preferencias
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* ── Apariencia ── */}
          {activeSection === "appearance" && (
            <Card>
              <CardHeader><CardTitle>Apariencia</CardTitle></CardHeader>
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
              </CardContent>
            </Card>
          )}

        </div>
      </div>
    </PageLayout>
  );
}

// ─── Password strength indicator ─────────────────────────────────────────────

function PasswordStrength({ password }: { password: string }) {
  const checks = [
    { label: "Mínimo 8 caracteres", ok: password.length >= 8 },
    { label: "Letras mayúsculas y minúsculas", ok: /[a-z]/.test(password) && /[A-Z]/.test(password) },
    { label: "Al menos un número", ok: /\d/.test(password) },
    { label: "Carácter especial (!@#$...)", ok: /[^A-Za-z0-9]/.test(password) },
  ];
  const score = checks.filter((c) => c.ok).length;
  const barColor = score <= 1 ? "bg-red-500" : score === 2 ? "bg-amber-500" : score === 3 ? "bg-yellow-400" : "bg-success";
  const label = score <= 1 ? "Muy débil" : score === 2 ? "Débil" : score === 3 ? "Buena" : "Fuerte";

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <div className="flex-1 h-1.5 bg-surface-700 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${barColor}`}
            style={{ width: `${(score / 4) * 100}%` }}
          />
        </div>
        <span className="text-xs text-surface-400">{label}</span>
      </div>
      <div className="grid grid-cols-2 gap-1">
        {checks.map((c) => (
          <p key={c.label} className={`text-xs flex items-center gap-1 ${c.ok ? "text-success" : "text-surface-500"}`}>
            <span>{c.ok ? "✓" : "·"}</span>
            {c.label}
          </p>
        ))}
      </div>
    </div>
  );
}
