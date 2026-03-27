"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Search,
  Menu,
  X,
  BookOpen,
  Swords,
  Store,
  MessageSquare,
  User,
  LogIn,
  Crown,
  Bell,
  Layers,
  BookMarked,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const mainNav = [
  { href: "/catalog", label: "Catálogo", icon: BookOpen },
  { href: "/decks", label: "Mazos", icon: Swords },
  { href: "/singles", label: "Singles", icon: Store },
  { href: "/album", label: "Álbum", icon: BookMarked },
  { href: "/forum", label: "Comunidad", icon: MessageSquare },
];

interface HeaderProps {
  user: {
    id: string;
    username: string;
    avatar_url: string | null;
    is_premium: boolean;
  } | null;
}

export function Header({ user }: HeaderProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-surface-800 bg-surface-950/80 backdrop-blur-xl">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2 shrink-0">
              <span className="text-lg font-bold text-surface-50">
                Mazoteca<span className="text-primary-400">.com</span>
              </span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-1">
              {mainNav.map((item) => {
                const Icon = item.icon;
                const isActive = pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                      isActive
                        ? "text-primary-400 bg-primary-500/10"
                        : "text-surface-300 hover:text-surface-100 hover:bg-surface-800"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {/* Search Toggle */}
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="p-2 text-surface-400 hover:text-surface-200 hover:bg-surface-800 rounded-lg transition-colors"
              aria-label="Buscar"
            >
              <Search className="h-5 w-5" />
            </button>

            {user ? (
              <>
                {/* Notifications */}
                <Link
                  href="/notifications"
                  className="p-2 text-surface-400 hover:text-surface-200 hover:bg-surface-800 rounded-lg transition-colors relative"
                >
                  <Bell className="h-5 w-5" />
                </Link>

                {/* Collection */}
                <Link
                  href="/collection"
                  className="p-2 text-surface-400 hover:text-surface-200 hover:bg-surface-800 rounded-lg transition-colors hidden sm:flex"
                  aria-label="Mi colección"
                >
                  <Layers className="h-5 w-5" />
                </Link>

                {/* Profile Menu */}
                <Link
                  href={`/profile/${user.username}`}
                  className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-surface-800 transition-colors"
                >
                  <div className="h-7 w-7 rounded-full bg-primary-600 flex items-center justify-center text-xs font-semibold text-white">
                    {user.username.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-medium text-surface-200 hidden md:inline max-w-25 truncate">
                    {user.username}
                  </span>
                  {user.is_premium && (
                    <Crown className="h-3.5 w-3.5 text-accent-400" />
                  )}
                </Link>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login">
                  <Button variant="ghost" size="sm" className="hidden sm:flex">
                    <LogIn className="h-4 w-4" />
                    Iniciar Sesión
                  </Button>
                </Link>
                <Link href="/register">
                  <Button variant="primary" size="sm">
                    <User className="h-4 w-4" />
                    <span className="hidden sm:inline">Registrarse</span>
                  </Button>
                </Link>
              </div>
            )}

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-surface-400 hover:text-surface-200 hover:bg-surface-800 rounded-lg transition-colors lg:hidden"
              aria-label="Menú"
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        {/* Search Bar */}
        {searchOpen && (
          <div className="pb-4 pt-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-surface-400" />
              <input
                type="search"
                placeholder="Buscar cartas, mazos, usuarios, publicaciones..."
                className="w-full h-10 pl-10 pr-4 bg-surface-900 border border-surface-700 rounded-lg text-sm text-surface-100 placeholder:text-surface-500 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none"
                autoFocus
              />
            </div>
          </div>
        )}
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-surface-800 bg-surface-950">
          <nav className="px-4 py-3 space-y-1">
            {mainNav.map((item) => {
              const Icon = item.icon;
              const isActive = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors",
                    isActive
                      ? "text-primary-400 bg-primary-500/10"
                      : "text-surface-300 hover:text-surface-100 hover:bg-surface-800"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  {item.label}
                </Link>
              );
            })}
            {user && (
              <>
                <div className="border-t border-surface-800 my-2" />
                <Link
                  href="/collection"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-surface-300 hover:text-surface-100 hover:bg-surface-800 rounded-lg"
                >
                  <Layers className="h-5 w-5" />
                  Mi Colección
                </Link>
                <Link
                  href="/friends"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-surface-300 hover:text-surface-100 hover:bg-surface-800 rounded-lg"
                >
                  <User className="h-5 w-5" />
                  Amigos
                </Link>
                <Link
                  href="/trades"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-surface-300 hover:text-surface-100 hover:bg-surface-800 rounded-lg"
                >
                  <Store className="h-5 w-5" />
                  Intercambios
                </Link>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
