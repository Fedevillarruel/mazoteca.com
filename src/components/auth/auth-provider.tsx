"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { createClient } from "@/lib/supabase/client";
import { getCurrentUser } from "@/lib/actions/auth";

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
  initialUser: AuthUser | null;
  children: ReactNode;
}

export function AuthProvider({ initialUser, children }: Props) {
  const [user, setUser] = useState<AuthUser | null>(initialUser);
  const [loading, setLoading] = useState(!initialUser);

  useEffect(() => {
    const supabase = createClient();

    // Usa getCurrentUser() para obtener (y auto-crear) el perfil si no existe
    async function fetchProfile(): Promise<AuthUser | null> {
      const session = await getCurrentUser();
      if (!session?.profile) return null;
      return {
        id: session.profile.id,
        username: session.profile.username,
        avatar_url: session.profile.avatar_url,
        is_premium: session.profile.is_premium,
      };
    }

    // Si no hay initialUser del servidor, intentamos leer la sesión del cliente
    async function init() {
      console.log("[AuthProvider] init — initialUser:", initialUser);
      if (initialUser) {
        setLoading(false);
        return;
      }
      console.log("[AuthProvider] no initialUser, llamando getCurrentUser()...");
      const profile = await fetchProfile();
      console.log("[AuthProvider] init profile result:", profile);
      setUser(profile);
      setLoading(false);
    }

    init();

    // Detectar login/logout en tiempo real
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("[AuthProvider] onAuthStateChange event:", event, "user:", session?.user?.email ?? null);
        if (event === "SIGNED_OUT" || !session?.user) {
          setUser(null);
          setLoading(false);
        } else if (
          event === "SIGNED_IN" ||
          event === "TOKEN_REFRESHED" ||
          event === "USER_UPDATED"
        ) {
          setLoading(true);
          console.log("[AuthProvider] SIGNED_IN — llamando getCurrentUser()...");
          const profile = await fetchProfile();
          console.log("[AuthProvider] SIGNED_IN profile result:", profile);
          setUser(profile);
          setLoading(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}