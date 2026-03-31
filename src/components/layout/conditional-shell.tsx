"use client";

import { usePathname } from "next/navigation";
import { Header } from "./header";
import { Footer } from "./footer";

const AUTH_PATHS = ["/login", "/register", "/forgot-password", "/reset-password"];

interface Props {
  user: {
    id: string;
    username: string;
    avatar_url: string | null;
    is_premium: boolean;
  } | null;
  children: React.ReactNode;
}

export function ConditionalShell({ user, children }: Props) {
  const pathname = usePathname();
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
