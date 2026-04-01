"use client";

import Link from "next/link";
import Image from "next/image";
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
  LogOut,
  Settings,
  ChevronDown,
  RefreshCw,
  ShoppingBag,
  ShoppingCart,
  Smile,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useRef, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useCartStore } from "@/lib/stores";
import { CartDrawer } from "@/components/ui/cart-drawer";

const mainNav = [
  { href: "/catalog", label: "Catálogo", icon: BookOpen },
  { href: "/decks", label: "Mazos", icon: Swords },
  { href: "/singles", label: "Singles", icon: Store },
  { href: "/album", label: "Álbum", icon: BookMarked },
];

const communityTabs = [
  { href: "/forum?tab=general", label: "General", icon: MessageSquare, tab: "general" },
  { href: "/forum?tab=trading", label: "Trading", icon: RefreshCw, tab: "trading" },
  { href: "/forum?tab=memes", label: "Memes", icon: Smile, tab: "memes" },
];

interface HeaderProps {
  user: {
    id: string;
    username: string;
    avatar_url: string | null;
    is_premium: boolean;
  } | null;
}

// ---- Avatar component ----
function UserAvatar({ user, size = 7 }: { user: NonNullable<HeaderProps["user"]>; size?: number }) {
  const sizeClass = `h-${size} w-${size}`;
  if (user.avatar_url) {
    return (
      <Image
        src={user.avatar_url}
        alt={user.username}
        width={size * 4}
        height={size * 4}
        className={`${sizeClass} rounded-full object-cover ring-2 ring-surface-700`}
      />
    );
  }
  return (
    <div className={`${sizeClass} rounded-full bg-primary-600 flex items-center justify-center text-xs font-bold text-white ring-2 ring-surface-700`}>
      {user.username.charAt(0).toUpperCase()}
    </div>
  );
}

// ---- Community dropdown (desktop) ----
function CommunityDropdown({ pathname }: { pathname: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const isActive = pathname.startsWith("/forum");

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg transition-all duration-150",
          isActive
            ? "text-primary-300 bg-primary-500/15 shadow-sm"
            : "text-surface-400 hover:text-surface-100 hover:bg-surface-800/70"
        )}
      >
        <MessageSquare className="h-3.5 w-3.5" />
        Comunidad
        <ChevronDown className={cn("h-3 w-3 transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <div className="absolute left-0 top-full mt-1.5 w-44 bg-surface-900 border border-surface-700 rounded-xl shadow-xl z-50 overflow-hidden p-1 space-y-0.5">
          {communityTabs.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-surface-300 hover:text-surface-100 hover:bg-surface-800 transition-colors"
            >
              <Icon className="h-4 w-4 text-surface-500" />
              {label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

// ---- Profile dropdown ----
function ProfileDropdown({ user }: { user: NonNullable<HeaderProps["user"]> }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  async function handleSignOut() {
    setOpen(false);
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-surface-800 transition-colors"
        aria-label="Menú de perfil"
      >
        <UserAvatar user={user} size={7} />
        <div className="hidden md:flex flex-col items-start">
          <span className="text-xs font-semibold text-surface-100 max-w-24 truncate leading-tight">
            {user.username}
          </span>
          {user.is_premium && (
            <span className="text-[10px] text-accent-400 leading-tight flex items-center gap-0.5">
              <Crown className="h-2.5 w-2.5" />Premium
            </span>
          )}
        </div>
        <ChevronDown className={cn("h-3.5 w-3.5 text-surface-500 transition-transform hidden md:block", open && "rotate-180")} />
      </button>

      {/* Dropdown panel */}
      {open && (
        <div className="absolute right-0 top-full mt-2 w-64 bg-surface-900 border border-surface-700 rounded-xl shadow-xl z-50 overflow-hidden">
          {/* User info header */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-surface-800 bg-surface-950/60">
            <UserAvatar user={user} size={10} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-surface-50 truncate">{user.username}</p>
              {user.is_premium ? (
                <p className="text-xs text-accent-400 flex items-center gap-1 mt-0.5">
                  <Crown className="h-3 w-3" />
                  Usuario Premium
                </p>
              ) : (
                <p className="text-xs text-surface-500 mt-0.5">Cuenta gratuita</p>
              )}
            </div>
          </div>

          {/* Menu items */}
          <nav className="p-1.5 space-y-0.5">
            <Link
              href={`/profile/${user.username}`}
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-surface-300 hover:text-surface-100 hover:bg-surface-800 transition-colors"
            >
              <User className="h-4 w-4 text-surface-400" />
              Mi perfil
            </Link>
            <Link
              href="/collection"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-surface-300 hover:text-surface-100 hover:bg-surface-800 transition-colors"
            >
              <Layers className="h-4 w-4 text-surface-400" />
              Mi colección
            </Link>
            <Link
              href="/trades"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-surface-300 hover:text-surface-100 hover:bg-surface-800 transition-colors"
            >
              <RefreshCw className="h-4 w-4 text-surface-400" />
              Intercambios
            </Link>
            <Link
              href="/orders"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-surface-300 hover:text-surface-100 hover:bg-surface-800 transition-colors"
            >
              <ShoppingBag className="h-4 w-4 text-surface-400" />
              Mis Pedidos
            </Link>
            <Link
              href="/settings"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-surface-300 hover:text-surface-100 hover:bg-surface-800 transition-colors"
            >
              <Settings className="h-4 w-4 text-surface-400" />
              Configuración
            </Link>
            {!user.is_premium && (
              <Link
                href="/premium"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-accent-400 hover:text-accent-300 hover:bg-accent-500/10 transition-colors border border-accent-500/30 mt-1"
              >
                <Crown className="h-4 w-4" />
                Obtener Premium — USD 12
              </Link>
            )}
          </nav>

          <div className="border-t border-surface-800 p-1.5">
            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Cerrar sesión
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export function Header({ user }: HeaderProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { totalItems, openCart } = useCartStore();
  const cartCount = totalItems();

  return (
    <>
    <header className="sticky top-0 z-40 w-full border-b border-surface-800/60 bg-surface-950/85 backdrop-blur-2xl">
      {/* Subtle top accent line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-primary-500/40 to-transparent" />

      <div className="mx-auto max-w-350 px-4 sm:px-6">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2 shrink-0 group">
              <div className="h-7 w-7 rounded-lg bg-primary-600 flex items-center justify-center shadow-lg shadow-primary-600/30 group-hover:bg-primary-500 transition-colors">
                <Crown className="h-4 w-4 text-white" />
              </div>
              <span className="text-lg font-bold tracking-tight">
                <span className="text-surface-50">Mazoteca</span><span className="text-primary-400">.com</span>
              </span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-0.5">
              {mainNav.map((item) => {
                const Icon = item.icon;
                const isActive = pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg transition-all duration-150",
                      isActive
                        ? "text-primary-300 bg-primary-500/15 shadow-sm"
                        : "text-surface-400 hover:text-surface-100 hover:bg-surface-800/70"
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {item.label}
                  </Link>
                );
              })}
              <CommunityDropdown pathname={pathname} />
            </nav>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-1">
            {/* Search Toggle */}
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="p-2 text-surface-400 hover:text-surface-200 hover:bg-surface-800/70 rounded-lg transition-all"
              aria-label="Buscar"
            >
              <Search className="h-4.5 w-4.5" />
            </button>

            {/* Cart button */}
            <button
              onClick={openCart}
              className="relative p-2 text-surface-400 hover:text-surface-200 hover:bg-surface-800/70 rounded-lg transition-all"
              aria-label="Carrito de compras"
            >
              <ShoppingCart className="h-4.5 w-4.5" />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-4.5 h-4.5 px-1 rounded-full bg-primary-500 text-white text-[9px] font-bold flex items-center justify-center leading-none shadow-lg shadow-primary-500/40">
                  {cartCount > 99 ? "99+" : cartCount}
                </span>
              )}
            </button>

            {user ? (
              <>
                {/* Notifications */}
                <Link
                  href="/notifications"
                  className="p-2 text-surface-400 hover:text-surface-200 hover:bg-surface-800/70 rounded-lg transition-all relative"
                >
                  <Bell className="h-4.5 w-4.5" />
                </Link>

                {/* Profile dropdown */}
                <ProfileDropdown user={user} />
              </>
            ) : (
              <div className="flex items-center gap-2 ml-1">
                <Link href="/login">
                  <Button variant="ghost" size="sm" className="hidden sm:flex text-surface-300 hover:text-surface-100">
                    <LogIn className="h-4 w-4" />
                    Ingresar
                  </Button>
                </Link>
                <Link href="/register">
                  <Button variant="primary" size="sm" className="btn-glow">
                    <User className="h-4 w-4" />
                    <span className="hidden sm:inline">Registrarse</span>
                  </Button>
                </Link>
              </div>
            )}

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-surface-400 hover:text-surface-200 hover:bg-surface-800/70 rounded-lg transition-all lg:hidden ml-1"
              aria-label="Menú"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Search Bar */}
        {searchOpen && (
          <div className="pb-4 pt-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-surface-500" />
              <input
                type="search"
                placeholder="Buscar cartas, mazos, usuarios, publicaciones..."
                className="w-full h-10 pl-10 pr-4 bg-surface-900/80 border border-surface-700/60 rounded-xl text-sm text-surface-100 placeholder:text-surface-500 focus:border-primary-500/70 focus:ring-1 focus:ring-primary-500/50 focus:outline-none transition-all"
                autoFocus
              />
            </div>
          </div>
        )}
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-surface-800/60 bg-surface-950/95 backdrop-blur-xl">
          <nav className="px-4 py-3 space-y-0.5">
            {mainNav.map((item) => {
              const Icon = item.icon;
              const isActive = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-xl transition-colors",
                    isActive
                      ? "text-primary-300 bg-primary-500/15"
                      : "text-surface-300 hover:text-surface-100 hover:bg-surface-800/70"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  {item.label}
                </Link>
              );
            })}

            {/* Comunidad — sub-tabs */}
            <div className="pt-0.5">
              <p className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-surface-500 uppercase tracking-wide">
                <MessageSquare className="h-3.5 w-3.5" /> Comunidad
              </p>
              {communityTabs.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-3 pl-7 pr-3 py-2.5 text-sm font-medium rounded-xl transition-colors",
                    pathname.startsWith("/forum")
                      ? "text-primary-300 hover:bg-primary-500/10"
                      : "text-surface-300 hover:text-surface-100 hover:bg-surface-800/70"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </Link>
              ))}
            </div>

            {user && (
              <>
                <div className="border-t border-surface-800/60 my-2" />
                <div className="flex items-center gap-3 px-3 py-2 mb-1">
                  <UserAvatar user={user} size={8} />
                  <div>
                    <p className="text-sm font-semibold text-surface-100">{user.username}</p>
                    {user.is_premium && (
                      <p className="text-xs text-accent-400 flex items-center gap-1">
                        <Crown className="h-3 w-3" />Premium
                      </p>
                    )}
                  </div>
                </div>
                <Link href={`/profile/${user.username}`} onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-surface-300 hover:text-surface-100 hover:bg-surface-800/70 rounded-xl">
                  <User className="h-5 w-5" />Mi perfil
                </Link>
                <Link href="/collection" onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-surface-300 hover:text-surface-100 hover:bg-surface-800/70 rounded-xl">
                  <Layers className="h-5 w-5" />Mi Colección
                </Link>
                <Link href="/settings" onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-surface-300 hover:text-surface-100 hover:bg-surface-800/70 rounded-xl">
                  <Settings className="h-5 w-5" />Configuración
                </Link>
                {!user.is_premium && (
                  <Link href="/premium" onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-accent-400 hover:text-accent-300 hover:bg-accent-500/10 rounded-xl border border-accent-500/30">
                    <Crown className="h-5 w-5" />Obtener Premium — USD 12
                  </Link>
                )}
                <button
                  onClick={async () => { setMobileMenuOpen(false); const supabase = createClient(); await supabase.auth.signOut(); window.location.href = "/"; }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-colors"
                >
                  <LogOut className="h-5 w-5" />Cerrar sesión
                </button>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
      <CartDrawer />
    </>
  );
}
