import type { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Settings,
  ShoppingCart,
  Layers,
  Info,
} from "lucide-react";
import { getAppSettings } from "@/lib/services/app-settings";
import { ToggleRow } from "./toggle-row";

export const metadata: Metadata = {
  title: "Configuración del sitio | Admin",
};

export const revalidate = 0;

export default async function AdminSettingsPage() {
  const settings = await getAppSettings();

  return (
    <div className="min-h-screen bg-surface-900 p-4 sm:p-6 lg:p-8">
      <div className="max-w-3xl mx-auto space-y-8">

        {/* Header */}
        <div>
          <Link href="/admin" className="text-xs text-surface-400 hover:text-surface-200 mb-1 block">
            ← Volver al dashboard
          </Link>
          <div className="flex items-center gap-3 mt-2">
            <Settings className="h-7 w-7 text-primary-400" />
            <div>
              <h1 className="text-2xl font-bold text-surface-50">Configuración del sitio</h1>
              <p className="text-sm text-surface-400">Feature flags y visibilidad de secciones</p>
            </div>
          </div>
        </div>

        {/* Info */}
        <Card className="border-blue-500/20 bg-blue-500/5">
          <CardContent className="p-4 flex items-start gap-3">
            <Info className="h-5 w-5 text-blue-400 shrink-0 mt-0.5" />
            <p className="text-sm text-surface-300">
              Los cambios se aplican <strong className="text-surface-100">inmediatamente</strong> en todo el sitio.
              Los toggles se guardan en la base de datos. Solo los admins pueden modificarlos.
            </p>
          </CardContent>
        </Card>

        {/* Secciones del sitio */}
        <Card>
          <CardHeader className="pb-0">
            <CardTitle className="text-base flex items-center gap-2">
              <Layers className="h-4 w-4 text-primary-400" />
              Secciones del sitio
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-2">
            <ToggleRow
              flagKey="singles_enabled"
              label="Sección Singles"
              description="Muestra el acceso a Singles en el header, catálogo y páginas de cartas. Si está OFF, los usuarios no ven ninguna referencia a singles."
              value={settings.singles_enabled}
            />
            <ToggleRow
              flagKey="trades_enabled"
              label="Intercambios"
              description="Habilita el sistema de intercambios entre usuarios (propuestas, historial, etc.)."
              value={settings.trades_enabled}
            />
            <ToggleRow
              flagKey="forum_enabled"
              label="Foro de la comunidad"
              description="Habilita el acceso al foro y la creación de nuevos threads."
              value={settings.forum_enabled}
            />
            <ToggleRow
              flagKey="decks_enabled"
              label="Constructor de mazos"
              description="Habilita el módulo de creación y gestión de mazos."
              value={settings.decks_enabled}
            />
            <ToggleRow
              flagKey="album_enabled"
              label="Álbum de colección"
              description="Habilita el álbum digital donde los usuarios registran sus cartas."
              value={settings.album_enabled}
            />
          </CardContent>
        </Card>

        {/* Comercio */}
        <Card>
          <CardHeader className="pb-0">
            <CardTitle className="text-base flex items-center gap-2">
              <ShoppingCart className="h-4 w-4 text-accent-400" />
              Comercio
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-2">
            <ToggleRow
              flagKey="cart_enabled"
              label="Carrito de compras"
              description="Muestra el ícono del carrito en el header y permite agregar productos al carrito. Actualmente oculto mientras se integra el checkout completo."
              value={settings.cart_enabled}
            />
            <ToggleRow
              flagKey="prices_enabled"
              label="Precios visibles"
              description="Muestra los precios de las cartas en el catálogo y en las páginas de detalle. Si está OFF, los precios quedan ocultos para todos los usuarios."
              value={settings.prices_enabled}
            />
            <ToggleRow
              flagKey="premium_enabled"
              label="Suscripciones Premium"
              description="Habilita la página de Premium, el botón de upgrade y el procesamiento de pagos por MercadoPago."
              value={settings.premium_enabled}
            />
          </CardContent>
        </Card>

        <p className="text-xs text-surface-500 text-center pb-4">
          Para que los cambios surtan efecto en el layout principal, puede ser necesario refrescar la página.
        </p>
      </div>
    </div>
  );
}
