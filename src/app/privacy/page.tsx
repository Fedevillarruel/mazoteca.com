import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Política de Privacidad | Mazoteca",
  description: "Conocé cómo Mazoteca.com protege y gestiona tu información personal.",
};

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12 text-surface-200">
      <h1 className="text-3xl font-bold text-surface-50 mb-2">Política de Privacidad</h1>
      <p className="text-sm text-surface-500 mb-10">Última actualización: 31 de marzo de 2026</p>

      <div className="space-y-8 text-sm leading-7 text-surface-300">

        <section>
          <h2 className="text-lg font-semibold text-surface-100 mb-3">1. Responsable del tratamiento</h2>
          <p>
            El responsable del tratamiento de los datos personales recabados a través de Mazoteca.com es{" "}
            <strong>Fedini</strong>{" "}
            (<a href="https://fedini.app" target="_blank" rel="noopener noreferrer" className="text-primary-400 hover:underline">fedini.app</a>),
            titular de la marca registrada <strong>Mazoteca®</strong>.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-surface-100 mb-3">2. Datos que recopilamos</h2>
          <p>Recopilamos los siguientes datos personales:</p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li><strong>Registro:</strong> nombre de usuario, dirección de correo electrónico y contraseña cifrada.</li>
            <li><strong>Perfil:</strong> avatar, biografía y datos opcionales que el usuario agrega voluntariamente.</li>
            <li><strong>Actividad:</strong> colección de cartas, mazos, publicaciones, trades y participación en el foro.</li>
            <li><strong>Transacciones:</strong> datos de compra procesados a través de Tiendanube (no almacenamos datos de tarjetas).</li>
            <li><strong>Técnicos:</strong> dirección IP, tipo de navegador, dispositivo y cookies (ver Política de Cookies).</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-surface-100 mb-3">3. Finalidad del tratamiento</h2>
          <p>Utilizamos tus datos para:</p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Gestionar tu cuenta y autenticación.</li>
            <li>Permitir el funcionamiento de la colección, mazos, trades y foro.</li>
            <li>Procesar compras de singles y gestionar órdenes.</li>
            <li>Enviarte notificaciones relacionadas con tu actividad en la plataforma.</li>
            <li>Mejorar la experiencia de usuario y detectar errores técnicos.</li>
            <li>Cumplir con obligaciones legales cuando corresponda.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-surface-100 mb-3">4. Base legal del tratamiento</h2>
          <p>
            El tratamiento de datos se basa en: (a) la ejecución del contrato de uso de la plataforma;
            (b) el consentimiento otorgado al registrarte; y (c) el interés legítimo en la seguridad y
            mejora del servicio.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-surface-100 mb-3">5. Compartición de datos con terceros</h2>
          <p>No vendemos ni alquilamos tus datos personales. Podemos compartirlos con:</p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li><strong>Supabase:</strong> proveedor de base de datos y autenticación (servidores en la nube).</li>
            <li><strong>Tiendanube:</strong> plataforma de e-commerce para procesar compras de singles.</li>
            <li><strong>Vercel:</strong> infraestructura de hosting del sitio web.</li>
            <li>Organismos públicos cuando exista obligación legal.</li>
          </ul>
          <p className="mt-2">
            Todos los proveedores cuentan con sus propias políticas de privacidad y medidas de seguridad adecuadas.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-surface-100 mb-3">6. Retención de datos</h2>
          <p>
            Conservamos tus datos mientras tu cuenta esté activa. Si eliminás tu cuenta, tus datos personales
            serán borrados en un plazo de 30 días, excepto aquellos que deban conservarse por obligaciones legales
            o transacciones en curso.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-surface-100 mb-3">7. Tus derechos</h2>
          <p>Podés ejercer los siguientes derechos sobre tus datos:</p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li><strong>Acceso:</strong> conocer qué datos tenemos sobre vos.</li>
            <li><strong>Rectificación:</strong> corregir datos inexactos o incompletos.</li>
            <li><strong>Eliminación:</strong> solicitar el borrado de tus datos personales.</li>
            <li><strong>Oposición:</strong> oponerte al tratamiento de tus datos con fines de marketing.</li>
            <li><strong>Portabilidad:</strong> recibir tus datos en formato estructurado.</li>
          </ul>
          <p className="mt-2">
            Para ejercer estos derechos contactanos en{" "}
            <a href="https://wa.me/5491130659240" target="_blank" rel="noopener noreferrer" className="text-primary-400 hover:underline">
              +54 9 11 3065 9240
            </a>.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-surface-100 mb-3">8. Seguridad</h2>
          <p>
            Implementamos medidas técnicas y organizativas para proteger tus datos: cifrado en tránsito (HTTPS),
            contraseñas hasheadas, autenticación segura mediante Supabase Auth y control de acceso por roles.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-surface-100 mb-3">9. Menores de edad</h2>
          <p>
            La Plataforma no está dirigida a menores de 13 años. Si tenés conocimiento de que un menor ha
            proporcionado datos personales sin consentimiento parental, contactanos para proceder a su eliminación.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-surface-100 mb-3">10. Cambios en esta política</h2>
          <p>
            Podemos actualizar esta Política de Privacidad periódicamente. La versión vigente siempre estará
            disponible en esta página con la fecha de última actualización.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-surface-100 mb-3">11. Contacto</h2>
          <p>
            Para consultas sobre privacidad escribinos al{" "}
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
