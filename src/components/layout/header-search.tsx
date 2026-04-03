"use client";

import { useState, useEffect, useRef, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, User, Layers, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type ProfileResult = {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
};

type DeckResult = {
  id: string;
  name: string;
  deck_type: string;
  profile: { username: string } | null;
};

export function HeaderSearch() {
  const [query, setQuery] = useState("");
  const [profiles, setProfiles] = useState<ProfileResult[]>([]);
  const [decks, setDecks] = useState<DeckResult[]>([]);
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    const trimmed = query.trim();

    const timer = setTimeout(async () => {
      if (trimmed.length < 2) {
        startTransition(() => {
          setProfiles([]);
          setDecks([]);
          setOpen(false);
        });
        return;
      }

      const supabase = createClient();

      const [profileRes, deckRes] = await Promise.all([
        supabase
          .from("profiles")
          .select("id, username, display_name, avatar_url")
          .or(`username.ilike.%${trimmed}%,display_name.ilike.%${trimmed}%`)
          .eq("is_banned", false)
          .limit(5),
        supabase
          .from("decks")
          .select("id, name, deck_type, profile:profiles(username)")
          .ilike("name", `%${trimmed}%`)
          .eq("is_public", true)
          .limit(5),
      ]);

      startTransition(() => {
        setProfiles((profileRes.data ?? []) as ProfileResult[]);
        setDecks(
          ((deckRes.data ?? []) as unknown as (Omit<DeckResult, "profile"> & { profile: { username: string } | { username: string }[] | null })[]).map((d) => ({
            ...d,
            profile: Array.isArray(d.profile) ? (d.profile[0] ?? null) : d.profile,
          }))
        );
        setOpen(true);
      });
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  const hasResults = profiles.length > 0 || decks.length > 0;

  return (
    <div ref={containerRef} className="relative w-full max-w-xs sm:max-w-sm lg:max-w-md">
      {/* Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-surface-500 pointer-events-none" />
        <input
          ref={inputRef}
          type="search"
          placeholder="Buscar amigos o mazos..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => { if (query.trim().length >= 2) setOpen(true); }}
          className="w-full h-9 pl-9 pr-8 bg-surface-900/80 border border-surface-700/60 rounded-xl text-sm text-surface-100 placeholder:text-surface-500 focus:border-primary-500/70 focus:ring-1 focus:ring-primary-500/50 focus:outline-none transition-all"
        />
        {query && (
          <button
            onClick={() => { setQuery(""); setOpen(false); inputRef.current?.focus(); }}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-surface-500 hover:text-surface-300"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Dropdown */}
      {open && (
        <div className="absolute left-0 right-0 top-full mt-1.5 bg-surface-900 border border-surface-700 rounded-xl shadow-2xl z-50 overflow-hidden">
          {isPending && (
            <div className="px-4 py-3 text-xs text-surface-500">Buscando...</div>
          )}

          {!isPending && !hasResults && (
            <div className="px-4 py-3 text-xs text-surface-500">
              Sin resultados para &ldquo;{query}&rdquo;
            </div>
          )}

          {!isPending && profiles.length > 0 && (
            <div>
              <p className="px-3 pt-2.5 pb-1 text-[10px] font-semibold text-surface-500 uppercase tracking-wider flex items-center gap-1.5">
                <User className="h-3 w-3" /> Usuarios
              </p>
              {profiles.map((p) => (
                <Link
                  key={p.id}
                  href={`/profile/${p.username}`}
                  onClick={() => { setOpen(false); setQuery(""); }}
                  className="flex items-center gap-3 px-3 py-2 hover:bg-surface-800 transition-colors"
                >
                  {p.avatar_url ? (
                    <Image src={p.avatar_url} alt={p.username} width={28} height={28} className="rounded-full shrink-0" />
                  ) : (
                    <div className="h-7 w-7 rounded-full bg-primary-700 flex items-center justify-center text-xs font-bold text-white shrink-0">
                      {p.username.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-sm text-surface-100 truncate">{p.display_name ?? p.username}</p>
                    {p.display_name && (
                      <p className="text-xs text-surface-500 truncate">@{p.username}</p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}

          {!isPending && decks.length > 0 && (
            <div className={profiles.length > 0 ? "border-t border-surface-800" : ""}>
              <p className="px-3 pt-2.5 pb-1 text-[10px] font-semibold text-surface-500 uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="h-3 w-3" /> Mazos
              </p>
              {decks.map((d) => (
                <Link
                  key={d.id}
                  href={`/decks/${d.id}`}
                  onClick={() => { setOpen(false); setQuery(""); }}
                  className="flex items-center gap-3 px-3 py-2 hover:bg-surface-800 transition-colors"
                >
                  <div className="h-7 w-7 rounded-lg bg-surface-700 flex items-center justify-center shrink-0">
                    <Layers className="h-3.5 w-3.5 text-surface-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm text-surface-100 truncate">{d.name}</p>
                    <p className="text-xs text-surface-500">
                      {d.deck_type === "combatants" ? "Combatientes" : "Estrategia"}
                      {d.profile?.username ? ` · @${d.profile.username}` : ""}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {hasResults && (
            <div className="border-t border-surface-800 px-3 py-2">
              <p className="text-[10px] text-surface-600">
                Enter para buscar · Esc para cerrar
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
