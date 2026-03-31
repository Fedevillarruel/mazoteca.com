import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Preguntas Frecuentes (FAQ) | Mazoteca",
  description: "Respondemos las preguntas más frecuentes sobre Mazoteca.com y Kingdom TCG.",
};

const faqs = [
  {
    category: "Plataforma",
    items: [
      {
        q: "¿Qué es Mazoteca?",
        a: "Mazoteca es una plataforma dedicada a los juegos de cartas coleccionables (TCG). Podés comprar singles, armar mazos, gestionar tu colección, intercambiar cartas con otros jugadores y participar en la comunidad. Hoy se enfoca en Kingdom TCG, con planes de expandirse a más juegos.",
      },
      {
        q: "¿Es gratis usar Mazoteca?",
        a: "Sí, el registro y el uso básico de la plataforma son completamente gratuitos. Existe una suscripción Premium opcional que desbloquea funcionalidades avanzadas como mayor capacidad de colección, sin publicidad y herramientas exclusivas de deck builder.",
      },
      {
        q: "¿Cómo me registro?",
        a: "Hacé clic en 'Registrarse' en la esquina superior derecha, completá el formulario con tu nombre de usuario, correo electrónico y contraseña. También podés iniciar sesión con tu cuenta de Google o Discord.",
      },
    ],
  },
  {
    category: "Kingdom TCG — Reglas del juego",
    items: [
      {
        q: "¿Cuántas cartas tiene un mazo válido en Kingdom TCG?",
        a: "Necesitás armar dos mazos separados. El Mazo de Combatientes tiene exactamente 33 cartas de tropa + 1 carta de coronado (34 en total). El Mazo de Estrategia tiene exactamente 30 cartas (Estrategia, Realeza y/o Arroje). Ambos se usan al mismo tiempo durante la partida.",
      },
      {
        q: "¿Cómo se arma el Mazo de Combatientes?",
        a: "Debe tener exactamente 33 tropas + 1 coronado. La distribución obligatoria por nivel es: 12 cartas de Nivel 1, 12 cartas de Nivel 2, 6 cartas de Nivel 3 y 3 cartas de Nivel 4. La selección de qué tropas incluir es completamente libre. Solo podés incluir 1 copia de cada carta.",
      },
      {
        q: "¿Cómo se arma el Mazo de Estrategia?",
        a: "Debe tener exactamente 30 cartas. Las cartas de Estrategia son obligatorias (mínimo 15, máximo 30) y podés incluir hasta 2 cartas con el mismo nombre. Las cartas de Realeza son opcionales (máximo 5) y cada una debe tener un nombre distinto. Las cartas de Arroje también son opcionales (máximo 10) con un máximo de 2 del mismo nombre.",
      },
      {
        q: "¿Cuántas copias de una misma carta puedo incluir?",
        a: "En el Mazo de Combatientes: solo 1 copia de cada carta de tropa. En el Mazo de Estrategia: hasta 2 cartas de Estrategia con el mismo nombre, hasta 2 cartas de Arroje con el mismo nombre, y las cartas de Realeza deben tener todas nombres distintos (máximo 1 de cada nombre).",
      },
      {
        q: "¿Qué es un Coronado?",
        a: "El Coronado es el líder de tu reino y la carta más importante de tu Mazo de Combatientes. Solo podés incluir 1 coronado. Si tu coronado es derrotado, perdés la partida. Los coronados no tienen nivel y tienen dados de ataque y defensa propios. Actualmente hay 4 coronados: Viggo de Fahridor, Nemea de Goldinfeit, Igno de Estonbleiz y Erya de Gringud.",
      },
      {
        q: "¿Qué son las cartas de Realeza?",
        a: "Las cartas de Realeza agregan habilidades especiales al coronado especificado en cada carta. Solo podés usarlas si controlás al coronado indicado en la carta. Son opcionales en el Mazo de Estrategia (máximo 5, cada una con nombre distinto).",
      },
      {
        q: "¿Cómo funcionan las cartas de Arroje?",
        a: "Las cartas de Arroje producen ataques a distancia fuera de la etapa de batalla. Se usan desde la mano en cualquier etapa del turno excepto durante la etapa de batalla. Necesitás tener en el campo de batalla una tropa con nivel igual o mayor al indicado en la carta. La tropa enemiga objetivo debe superar una tirada de defensa o es derrotada.",
      },
      {
        q: "¿Qué es la Audacia?",
        a: "La Audacia es una habilidad especial indicada en algunos dados de ataque o defensa (se distingue por las dos flechas alrededor del dado). Permite volver a tirar una vez más una tirada de ataque o defensa que no te haya convencido, pero debés quedarte con el segundo resultado aunque sea menor al primero.",
      },
      {
        q: "¿Cómo se gana una partida?",
        a: "El objetivo es derrotar al Coronado enemigo. El coronado no puede ser dañado directamente por ataques normales de tropas, pero sí por cartas de Arroje, efectos directos de ciertas cartas de Estrategia y cartas de Realeza específicas.",
      },
      {
        q: "¿Cómo funciona el Orden de Resolución del Mazo de Estrategia?",
        a: "La última carta activada es la primera en resolver su efecto (tipo pila). Si tu oponente responde a tu carta con otra, la suya se resuelve primero. Podés usar tantas cartas de estrategia como quieras por turno, pero todas deben tener nombres distintos entre sí. Al final de tu turno podés tener un máximo de 7 cartas de estrategia en la mano.",
      },
    ],
  },
  {
    category: "Catálogo y Compras",
    items: [
      {
        q: "¿Cómo compro un single?",
        a: "En el Catálogo encontrás todas las cartas disponibles. Hacé clic en 'Comprar' en la carta que te interesa y serás redirigido a nuestra tienda en Tiendanube para completar la compra de forma segura.",
      },
      {
        q: "¿En qué moneda están los precios?",
        a: "Todos los precios están expresados en Pesos Argentinos (ARS).",
      },
    ],
  },
  {
    category: "Cuenta y Privacidad",
    items: [
      {
        q: "¿Cómo elimino mi cuenta?",
        a: (
          <>
            Podés solicitar la eliminación de tu cuenta y datos personales contactándonos por{" "}
            <a href="https://wa.me/5491130659240" target="_blank" rel="noopener noreferrer" className="text-primary-400 hover:underline">
              WhatsApp
            </a>{" "}
            o desde nuestra{" "}
            <Link href="/contact" className="text-primary-400 hover:underline">
              página de contacto
            </Link>
            . Procesamos la solicitud en un plazo de 30 días hábiles.
          </>
        ),
      },
    ],
  },
];

export default function FAQPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12 text-surface-200">
      <h1 className="text-3xl font-bold text-surface-50 mb-2">Preguntas Frecuentes</h1>
      <p className="text-surface-400 mb-10">
        Encontrá respuestas a las dudas más comunes sobre la plataforma y Kingdom TCG.
      </p>

      <div className="space-y-10">
        {faqs.map((section) => (
          <div key={section.category}>
            <h2 className="text-lg font-semibold text-primary-400 mb-4 pb-2 border-b border-surface-800">
              {section.category}
            </h2>
            <div className="space-y-4">
              {section.items.map((item, i) => (
                <details
                  key={i}
                  className="group bg-surface-900 border border-surface-800 rounded-xl overflow-hidden"
                >
                  <summary className="flex items-center justify-between gap-4 px-5 py-4 cursor-pointer list-none text-sm font-medium text-surface-200 hover:text-surface-50 transition-colors select-none">
                    <span>{item.q}</span>
                    <svg
                      className="h-4 w-4 shrink-0 text-surface-500 transition-transform group-open:rotate-180"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </summary>
                  <div className="px-5 pb-4 pt-1 text-sm text-surface-400 leading-7 border-t border-surface-800">
                    {item.a}
                  </div>
                </details>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-12 bg-surface-900 border border-surface-800 rounded-xl p-6 text-center">
        <p className="text-surface-300 font-medium mb-2">¿No encontraste lo que buscabas?</p>
        <p className="text-sm text-surface-400 mb-4">
          Contactanos directamente y te ayudamos a resolver tu consulta.
        </p>
        <a
          href="https://wa.me/5491130659240"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-green-600 hover:bg-green-500 text-white text-sm font-semibold rounded-lg transition-colors"
        >
          Escribinos por WhatsApp
        </a>
      </div>
    </div>
  );
}
