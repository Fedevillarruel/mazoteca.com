"use client";

import { useState, useTransition } from "react";
import { updateUserRole } from "./actions";
import type { UserRole } from "@/lib/types/actions";
import { CheckCircle, Loader2 } from "lucide-react";

const ROLES: { value: UserRole; label: string }[] = [
  { value: "user", label: "Usuario" },
  { value: "moderator", label: "Moderador" },
  { value: "admin", label: "Admin" },
];

interface Props {
  userId: string;
  currentRole: string;
}

export function RoleSelector({ userId, currentRole }: Props) {
  const [selected, setSelected] = useState<UserRole>((currentRole as UserRole) ?? "user");
  const [status, setStatus] = useState<"idle" | "ok" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleChange(newRole: UserRole) {
    if (newRole === selected) return;
    setSelected(newRole);
    setStatus("idle");
    setErrorMsg(null);

    startTransition(async () => {
      const result = await updateUserRole(userId, newRole);
      if (result.error) {
        setStatus("error");
        setErrorMsg(result.error);
        setSelected(currentRole as UserRole); // revert
      } else {
        setStatus("ok");
        setTimeout(() => setStatus("idle"), 2000);
      }
    });
  }

  return (
    <div className="flex items-center justify-end gap-2">
      {isPending && <Loader2 className="h-3.5 w-3.5 animate-spin text-surface-400" />}
      {status === "ok" && !isPending && (
        <CheckCircle className="h-3.5 w-3.5 text-green-400 shrink-0" />
      )}
      {status === "error" && !isPending && (
        <span className="text-xs text-red-400 max-w-30 text-right leading-tight">{errorMsg}</span>
      )}
      <select
        value={selected}
        onChange={(e) => handleChange(e.target.value as UserRole)}
        disabled={isPending}
        className="text-xs bg-surface-800 border border-surface-600 text-surface-200 rounded px-2 py-1 focus:outline-none focus:border-primary-500 disabled:opacity-50"
      >
        {ROLES.map((r) => (
          <option key={r.value} value={r.value}>
            {r.label}
          </option>
        ))}
      </select>
    </div>
  );
}
