"use client";

import { useState } from "react";
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
} from "lucide-react";

const sections = [
  { id: "profile", label: "Perfil", icon: User },
  { id: "privacy", label: "Privacidad", icon: Eye },
  { id: "security", label: "Seguridad", icon: Shield },
  { id: "notifications", label: "Notificaciones", icon: Bell },
  { id: "appearance", label: "Apariencia", icon: Palette },
] as const;

type Section = (typeof sections)[number]["id"];

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState<Section>("profile");

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
              {/* Avatar Upload */}
              <Card>
                <CardHeader>
                  <CardTitle>Foto de perfil</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-6">
                    <div className="h-20 w-20 rounded-2xl bg-surface-800 flex items-center justify-center overflow-hidden shrink-0 border-2 border-surface-700">
                      <User className="h-8 w-8 text-surface-500" />
                    </div>
                    <div className="space-y-2">
                      <label className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-600 text-white text-sm font-medium hover:bg-primary-500 transition-colors cursor-pointer">
                        <User className="h-4 w-4" />
                        Subir imagen
                        <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" />
                      </label>
                      <p className="text-xs text-surface-500">
                        JPG, PNG o WebP. Máximo 2MB.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Profile Info */}
              <Card>
                <CardHeader>
                  <CardTitle>Información de perfil</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <Input label="Nickname" defaultValue="KingdomPlayer" />
                    <Input label="Email" type="email" defaultValue="player@email.com" disabled />
                  </div>
                  <Textarea
                    label="Biografía"
                    placeholder="Contá algo sobre vos..."
                    defaultValue="Coleccionista y competidor de Kingdom TCG"
                    rows={3}
                  />
                  <Input label="Ubicación" placeholder="Ej: Buenos Aires, Argentina" />
                  <div className="flex justify-end">
                    <Button>
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
                    Al eliminar tu cuenta se borrarán permanentemente todos tus datos, mazos,
                    colección e historial. Esta acción no se puede deshacer.
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
                  { id: "trades", label: "Intercambios", description: "Propuestas y actualizaciones" },
                  { id: "singles", label: "Singles", description: "Ofertas en tus publicaciones" },
                  { id: "friends", label: "Amigos", description: "Solicitudes y actividad" },
                  { id: "forum", label: "Foro", description: "Respuestas a tus hilos" },
                  { id: "system", label: "Sistema", description: "Actualizaciones y novedades" },
                ].map((pref) => (
                  <div
                    key={pref.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-surface-800/50"
                  >
                    <div>
                      <p className="text-sm font-medium text-surface-200">{pref.label}</p>
                      <p className="text-xs text-surface-400">{pref.description}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked className="sr-only peer" />
                      <div className="w-9 h-5 bg-surface-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary-600" />
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
