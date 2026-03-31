"use client";

import { usePathname } from "next/navigation";
import { Header } from "./header";
import { Footer } from "./footer";
import { AuthProvider, useAuth } from "@/components/auth/auth-provider";

const AUTH_PATHS = ["/login", "/register", "/forgot-password", "/reset-password"];

interface AuthUser {
  id: string;
  username: string;
  avatar_url: string | null;
  is_premium: boolean;
}

interface Props {
  initialUser: AuthUser | null;
  children: React.ReactNode;
}

/** Inner shell — accede al AuthContext provisto por AuthProvider */
function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user } = useAuth();
  const isAuthPage = AUTH_PATHS.some((p) => pathname.startsWith(p));

  if (isAuthPage) {
    return <>{children}</>;
  }

  return (
    <>
      <Header user={user} />
      <div className="flex-1">{children}</div>
      <Footer />
    </>
  );
}

/** Outer shell — provee el AuthContext con el valor inicial del servidor */
export function ConditionalShell({ initialUser, children }: Props) {
  return (
    <AuthProvider initialUser={initialUser}>
      <Shell>{children}</Shell>
    </AuthProvider>
  );
}
