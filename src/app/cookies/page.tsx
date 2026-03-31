import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Política de Cookies | Mazoteca",
  description: "Cómo Mazoteca.com utiliza cookies y tecnologías de seguimiento.",
};

export default function CookiesPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12 text-surface-200">
      <h1 className="text-3xl font-bold text-surface-50 mb-2">Política de Cookies</h1>
      <p className="text-sm text-surface-500 mb-10">Última actualización: 31 de marzo de 2026</p>

      <div className="space-y-8 text-sm leading-7 text-surface-300">

        <section>
          <h2 className="text-lg font-semibold text-surface-100 mb-3">¿Qué son las cookies?</h2>
          <p>
            Las cookies son pequeños archivos de texto que se almacenan en tu dispositivo cuando visitás
            Mazoteca.com. Nos permiten recordar tus preferencias, mantener tu sesión activa y mejorar
            tu experiencia general en la Plataforma.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-surface-100 mb-3">Tipos de cookies que utilizamos</h2>

          <div className="space-y-4">
            <div className="bg-surface-900 border border-surface-800 rounded-xl p-4">
              <h3 className="font-semibold text-surface-200 mb-1">🔒 Cookies estrictamente necesarias</h3>
              <p>
                Son indispensables para el funcionamiento de la Plataforma. Sin ellas no podrías iniciar
                sesión ni usar funcionalidades básicas. No pueden desactivarse.
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1 text-surface-400">
                <li><code className="text-primary-300">sb-access-token</code> — Token de autenticación de Supabase.</li>
                <li><code className="text-primary-300">sb-refresh-token</code> — Token de renovación de sesión.</li>
              </ul>
            </div>

            <div className="bg-surface-900 border border-surface-800 rounded-xl p-4">
              <h3 className="font-semibold text-surface-200 mb-1">⚙️ Cookies de preferencias</h3>
              <p>
                Guardan tus elecciones para personalizar la experiencia, como el modo de visualización
                de catálogo o filtros activos.
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1 text-surface-400">
                <li><code className="text-primary-300">mz-view-mode</code> — Vista preferida (grilla/lista).</li>
                <li><code className="text-primary-300">mz-theme</code> — Preferencia de tema visual.</li>
              </ul>
            </div>

            <div className="bg-surface-900 border border-surface-800 rounded-xl p-4">
              <h3 className="font-semibold text-surface-200 mb-1">📊 Cookies de análisis</h3>
              <p>
                Nos ayudan a entender cómo se usa la Plataforma para poder mejorarla. Los datos son
                anónimos y agregados.
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1 text-surface-400">
                <li>Vercel Analytics — métricas de rendimiento y uso general.</li>
              </ul>
            </div>

            <div className="bg-surface-900 border border-surface-800 rounded-xl p-4">
              <h3 className="font-semibold text-surface-200 mb-1">🛒 Cookies de terceros (Tiendanube)</h3>
              <p>
                Al hacer clic en &ldquo;Comprar&rdquo; y ser redirigido a la tienda de Tiendanube, esa plataforma
                puede establecer sus propias cookies según su política de privacidad.
              </p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-surface-100 mb-3">¿Cómo gestionar las cookies?</h2>
          <p>
            Podés controlar y/o eliminar las cookies desde la configuración de tu navegador:
          </p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li><strong>Chrome:</strong> Configuración → Privacidad y seguridad → Cookies.</li>
            <li><strong>Firefox:</strong> Opciones → Privacidad y seguridad → Cookies y datos del sitio.</li>
            <li><strong>Safari:</strong> Preferencias → Privacidad → Gestionar datos del sitio web.</li>
            <li><strong>Edge:</strong> Configuración → Cookies y permisos del sitio.</li>
          </ul>
          <p className="mt-2 text-surface-400">
            Tené en cuenta que deshabilitar las cookies necesarias puede afectar el funcionamiento de
            la Plataforma y podría impedirte iniciar sesión.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-surface-100 mb-3">Almacenamiento local (localStorage)</h2>
          <p>
            Además de cookies, Mazoteca utiliza <code className="text-primary-300">localStorage</code> del
            navegador para guardar preferencias de interfaz de forma local, sin transmitir datos a servidores.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-surface-100 mb-3">Actualizaciones de esta política</h2>
          <p>
            Esta Política de Cookies puede actualizarse para reflejar cambios en la Plataforma o en la
            legislación aplicable. Revisá esta página periódicamente.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-surface-100 mb-3">Contacto</h2>
          <p>
            Para dudas sobre cookies escribinos al{" "}
            <a href="https://wa.me/5491130659240" target="_blank" rel="noopener noreferrer" className="text-primary-400 hover:underline">
              +54 9 11 3065 9240
            </a>{" "}
            o visitá <Link href="/contact" className="text-primary-400 hover:underline">nuestra página de contacto</Link>.
          </p>
        </section>

      </div>
    </div>
  );
}
