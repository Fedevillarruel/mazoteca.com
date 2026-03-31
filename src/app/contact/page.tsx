import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contacto | Mazoteca",
  description: "Contactate con el equipo de Mazoteca.com",
};

export default function ContactPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-12 text-surface-200">
      <h1 className="text-3xl font-bold text-surface-50 mb-2">Contacto</h1>
      <p className="text-surface-400 mb-10">
        ¿Tenés alguna consulta, reporte o sugerencia? Estamos para ayudarte.
      </p>

      <div className="space-y-6">
        {/* WhatsApp */}
        <a
          href="https://wa.me/5491130659240"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-4 bg-surface-900 border border-surface-800 rounded-xl p-5 hover:border-green-600 hover:bg-surface-800 transition-colors group"
        >
          <div className="w-12 h-12 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center shrink-0">
            <svg viewBox="0 0 24 24" className="w-6 h-6 fill-green-400" xmlns="http://www.w3.org/2000/svg">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
          </div>
          <div>
            <p className="font-semibold text-surface-100 group-hover:text-green-400 transition-colors">WhatsApp</p>
            <p className="text-sm text-surface-400">+54 9 11 3065 9240</p>
            <p className="text-xs text-surface-500 mt-0.5">Respuesta rápida · Lun–Vie 10 a 19 hs</p>
          </div>
        </a>

        {/* Fedini */}
        <a
          href="https://fedini.app"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-4 bg-surface-900 border border-surface-800 rounded-xl p-5 hover:border-primary-600 hover:bg-surface-800 transition-colors group"
        >
          <div className="w-12 h-12 rounded-full overflow-hidden border border-surface-700 shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://fedini.app/_next/image?url=https%3A%2F%2Fjtujtceemarxedagazge.supabase.co%2Fstorage%2Fv1%2Fobject%2Fpublic%2Fbusiness-photos%2Fapp-icon-logos%2Flogo2.png&w=48&q=75"
              alt="Fedini"
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <p className="font-semibold text-surface-100 group-hover:text-primary-400 transition-colors">Fedini</p>
            <p className="text-sm text-surface-400">fedini.app</p>
            <p className="text-xs text-surface-500 mt-0.5">Empresa responsable de Mazoteca®</p>
          </div>
        </a>

        {/* Info adicional */}
        <div className="bg-surface-900/50 border border-surface-800 rounded-xl p-5 text-sm text-surface-400">
          <p className="font-medium text-surface-300 mb-1">¿Para qué podés contactarnos?</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Reportar un error o problema técnico.</li>
            <li>Consultas sobre pedidos o compras de singles.</li>
            <li>Solicitud de baja de cuenta o datos personales.</li>
            <li>Sugerencias de mejora o nuevas funciones.</li>
            <li>Consultas sobre la suscripción Premium.</li>
            <li>Reportar contenido inapropiado.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
