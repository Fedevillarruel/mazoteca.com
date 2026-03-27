import Link from "next/link";
import { ExternalLink, MessageSquare } from "lucide-react";
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
      { label: "Reglas del juego", href: "/rules" },
      { label: "FAQ", href: "/faq" },
      { label: "Soporte", href: "/support" },
      { label: "API (próximamente)", href: "#" },
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
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6">
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
              Catálogo, singles y comunidad para Kingdom TCG.
              Colecciones, mazos, intercambios y competencia.
            </p>
            {/* Social links */}
            <div className="flex gap-3">
              {siteConfig.links.discord && (
                <a
                  href={siteConfig.links.discord}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 text-surface-400 hover:text-primary-400 hover:bg-surface-800 rounded-lg transition-colors"
                  aria-label="Discord"
                >
                  <MessageSquare className="h-5 w-5" />
                </a>
              )}
              {siteConfig.links.twitter && (
                <a
                  href={siteConfig.links.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 text-surface-400 hover:text-primary-400 hover:bg-surface-800 rounded-lg transition-colors"
                  aria-label="Twitter"
                >
                  <ExternalLink className="h-5 w-5" />
                </a>
              )}
            </div>
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
            reservados. Kingdom TCG es propiedad de sus respectivos autores.
          </p>
          <p className="text-xs text-surface-600">
            mazoteca.com no está afiliado oficialmente con Kingdom TCG.
          </p>
        </div>
      </div>
    </footer>
  );
}
