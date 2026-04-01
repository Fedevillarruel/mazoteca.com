import { getCurrentUser } from "@/lib/actions/auth";
import { redirect } from "next/navigation";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getCurrentUser();
  if (session?.user) {
    redirect("/");
  }

  return (
    <div className="min-h-screen flex flex-col bg-surface-950">
      {children}
    </div>
  );
}
