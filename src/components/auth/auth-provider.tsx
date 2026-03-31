"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { createClient } from "@/lib/supabase/client";

interface AuthUser {
  id: string;
  username: string;
  avatar_url: string | null;
  is_premium: boolean;
}

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextValue>({ user: null, loading: true });

export function useAuth() {
  return useContext(AuthContext);
}

interface Props {
  /** Valor inicial pasado desde el Server Component (layout.tsx) */
  initialUser: AuthUser | null;
  children: ReactNode;
}

export function AuthProvider({ initialUser, children }: Props) {
  const [user, setUser] = useState<AuthUser | null>(initialUser);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const supabase = createClient();

    // Obtener perfil desde Supabase profiles
    async function fetchProfile(userId: string): Promise<AuthUser | null> {
      const { data } = await supabase
        .from("profiles")
        .select("id, username, avatar_url, is_premium")
        .eq("id", userId)
        .single();
      return data ?? null;
    }

    // Escuchar cambios de sesión en tiempo real (login, logout, token refresh)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_OUT" || !session?.user) {
        setUser(null);
      } else if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED" || event === "USER_UPDATED") {
        setLoading(true);
        const profile = await fetchProfile(session.user.id);
        setUser(profile);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}
