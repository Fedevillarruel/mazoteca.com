import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Términos de Uso | Mazoteca",
  description: "Términos y condiciones de uso de la plataforma Mazoteca.com",
};

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12 text-surface-200">
      <h1 className="text-3xl font-bold text-surface-50 mb-2">Términos de Uso</h1>
      <p className="text-sm text-surface-500 mb-10">Última actualización: 31 de marzo de 2026</p>

      <div className="space-y-8 text-sm leading-7 text-surface-300">

        <section>
          <h2 className="text-lg font-semibold text-surface-100 mb-3">1. Aceptación de los términos</h2>
          <p>
            Al acceder o utilizar Mazoteca.com (&ldquo;la Plataforma&rdquo;), operada por <strong>Fedini</strong>{" "}
            (<a href="https://fedini.app" target="_blank" rel="noopener noreferrer" className="text-primary-400 hover:underline">fedini.app</a>),
            aceptás íntegramente estos Términos de Uso. Si no estás de acuerdo con alguno de estos términos,
            por favor no utilices la Plataforma.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-surface-100 mb-3">2. Descripción del servicio</h2>
          <p>
            Mazoteca.com es una plataforma dedicada a los juegos de cartas coleccionables (TCG). Ofrece las
            siguientes funcionalidades:
          </p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Catálogo de cartas de Kingdom TCG y otros juegos.</li>
            <li>Compra de singles a través de la tienda oficial integrada con Tiendanube.</li>
            <li>Herramientas de deck builder para armar y compartir mazos.</li>
            <li>Gestión de colección personal.</li>
            <li>Intercambios entre usuarios (<em>trades</em>).</li>
            <li>Foro y comunidad para discusión de estrategias y torneos.</li>
            <li>Álbum digital de cartas.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-surface-100 mb-3">3. Registro y cuenta de usuario</h2>
          <p>
            Para acceder a funcionalidades completas debés crear una cuenta. Al registrarte garantizás que:
          </p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>La información proporcionada es veraz, exacta y actualizada.</li>
            <li>Tenés al menos 13 años de edad.</li>
            <li>Sos responsable de mantener la confidencialidad de tu contraseña.</li>
            <li>Notificarás de inmediato cualquier uso no autorizado de tu cuenta.</li>
          </ul>
          <p className="mt-2">
            Mazoteca se reserva el derecho de suspender o eliminar cuentas que violen estos términos.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-surface-100 mb-3">4. Publicaciones y singles</h2>
          <p>
            Los usuarios pueden publicar cartas a la venta como &ldquo;singles&rdquo;. Al publicar, aceptás que:
          </p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>La carta publicada es de tu propiedad legítima.</li>
            <li>La descripción del estado (condición) es fiel a la realidad.</li>
            <li>Los precios están expresados en pesos argentinos (ARS).</li>
            <li>Mazoteca puede revisar, moderar o remover publicaciones que incumplan las normas.</li>
            <li>
              Las transacciones de compra se procesan a través de la tienda integrada con Tiendanube,
              sujetas a los términos y condiciones de esa plataforma.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-surface-100 mb-3">5. Intercambios (Trades)</h2>
          <p>
            Los intercambios entre usuarios se realizan de forma directa. Mazoteca actúa únicamente como
            intermediario de la comunicación y no garantiza la ejecución de los intercambios. Cualquier disputa
            entre usuarios deberá resolverse entre las partes.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-surface-100 mb-3">6. Conducta del usuario</h2>
          <p>Queda prohibido:</p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Publicar contenido ofensivo, discriminatorio o ilegal.</li>
            <li>Hacer spam, phishing o cualquier actividad maliciosa.</li>
            <li>Crear cuentas falsas o suplantar identidades.</li>
            <li>Manipular precios o el sistema de valoraciones.</li>
            <li>Utilizar bots o scripts para interactuar con la Plataforma sin autorización.</li>
            <li>Intentar acceder a datos de otros usuarios sin su consentimiento.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-surface-100 mb-3">7. Propiedad intelectual</h2>
          <p>
            Mazoteca® es una marca registrada de <strong>Fedini</strong>. El código fuente, diseño,
            logotipos y contenido propio de la Plataforma son propiedad de Fedini. Las imágenes de cartas
            y nombres de juegos pertenecen a sus respectivos autores y editores, y son utilizados en el
            contexto de una comunidad de fans sin fines de infracción.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-surface-100 mb-3">8. Suscripción Premium</h2>
          <p>
            Mazoteca ofrece planes de suscripción Premium con funcionalidades adicionales. Los pagos son
            procesados de forma segura. No se realizan reembolsos salvo por fallas técnicas imputables a la
            Plataforma. Los beneficios del plan Premium están sujetos a cambios con previo aviso.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-surface-100 mb-3">9. Limitación de responsabilidad</h2>
          <p>
            Mazoteca y Fedini no serán responsables por daños directos, indirectos o consecuentes derivados
            del uso o la imposibilidad de uso de la Plataforma, ni por las acciones de terceros usuarios.
            La Plataforma se ofrece &ldquo;tal como está&rdquo; sin garantías de disponibilidad ininterrumpida.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-surface-100 mb-3">10. Modificaciones</h2>
          <p>
            Nos reservamos el derecho de modificar estos Términos en cualquier momento. Los cambios serán
            publicados en esta página con la fecha de actualización. El uso continuado de la Plataforma
            implica la aceptación de los términos vigentes.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-surface-100 mb-3">11. Contacto</h2>
          <p>
            Para consultas sobre estos Términos de Uso podés comunicarte al{" "}
            <a href="https://wa.me/5491130659240" target="_blank" rel="noopener noreferrer" className="text-primary-400 hover:underline">
              +54 9 11 3065 9240
            </a>{" "}
            o visitar <Link href="/contact" className="text-primary-400 hover:underline">nuestra página de contacto</Link>.
          </p>
        </section>

      </div>
    </div>
  );
}
