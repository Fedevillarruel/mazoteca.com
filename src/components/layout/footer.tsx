import Link from "next/link";
import Image from "next/image";
import { siteConfig } from "@/config/site";

const footerSections = [
  {
    title: "Plataforma",
    links: [
      { label: "Catálogo", href: "/catalog" },
      { label: "Deck Builder", href: "/decks" },
      { label: "Singles", href: "/singles" },
      { label: "Comunidad", href: "/forum" },
    ],
  },
  {
    title: "Cuenta",
    links: [
      { label: "Registrarse", href: "/register" },
      { label: "Mi Colección", href: "/collection" },
      { label: "Mis Mazos", href: "/decks" },
      { label: "Amigos", href: "/friends" },
      { label: "Premium", href: "/premium" },
    ],
  },
  {
    title: "Recursos",
    links: [
      { label: "Guía de inicio", href: "/guide" },
      { label: "FAQ", href: "/faq" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Términos de uso", href: "/terms" },
      { label: "Política de privacidad", href: "/privacy" },
      { label: "Política de cookies", href: "/cookies" },
      { label: "Contacto", href: "/contact" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-surface-800 bg-surface-950">
      <div className="mx-auto max-w-350 px-4 sm:px-6">
        {/* Main footer content */}
        <div className="py-12 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
          {/* Brand column */}
          <div className="col-span-2 md:col-span-4 lg:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <span className="text-lg font-bold text-surface-50">
                Mazoteca<span className="text-primary-400">.com</span>
              </span>
            </Link>
            <p className="text-sm text-surface-400 mb-4 max-w-xs">
              Tu plataforma de TCG: catálogo, singles, mazos e intercambios.
              Hoy Kingdom TCG, mañana más juegos.
            </p>
          </div>

          {/* Link columns */}
          {footerSections.map((section) => (
            <div key={section.title}>
              <h3 className="text-sm font-semibold text-surface-200 mb-3">
                {section.title}
              </h3>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-surface-400 hover:text-surface-200 transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="border-t border-surface-800 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-surface-500">
            © {new Date().getFullYear()} {siteConfig.name}. Todos los derechos
            reservados. Los juegos de cartas son propiedad de sus respectivos autores.
          </p>
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <p className="text-xs text-surface-600">
              mazoteca.com no está afiliado oficialmente con ningún editor de TCG.
            </p>
            <a
              href="https://fedini.app"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs text-surface-500 hover:text-surface-300 transition-colors"
            >
              <Image
                src="https://fedini.app/_next/image?url=https%3A%2F%2Fjtujtceemarxedagazge.supabase.co%2Fstorage%2Fv1%2Fobject%2Fpublic%2Fbusiness-photos%2Fapp-icon-logos%2Flogo2.png&w=48&q=75"
                alt="Fedini"
                width={16}
                height={16}
                className="rounded-sm"
              />
              <span>
                Mazoteca<sup>®</sup> es marca registrada de{" "}
                <span className="font-semibold text-primary-400">Fedini</span>
              </span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
