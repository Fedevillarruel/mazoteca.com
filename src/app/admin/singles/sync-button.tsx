"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw, CheckCircle, XCircle } from "lucide-react";
import { useRouter } from "next/navigation";

export function SyncButton() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<"idle" | "ok" | "error">("idle");
  const router = useRouter();

  async function handleSync() {
    setLoading(true);
    setResult("idle");
    try {
      const res = await fetch("/api/tiendanube/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      if (res.ok) {
        setResult("ok");
        router.refresh();
      } else {
        setResult("error");
      }
    } catch {
      setResult("error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      {result === "ok" && (
        <span className="flex items-center gap-1 text-sm text-green-400">
          <CheckCircle className="h-4 w-4" /> Sincronizado
        </span>
      )}
      {result === "error" && (
        <span className="flex items-center gap-1 text-sm text-red-400">
          <XCircle className="h-4 w-4" /> Error al sincronizar
        </span>
      )}
      <Button onClick={handleSync} disabled={loading} variant="accent">
        <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
        {loading ? "Sincronizando..." : "Sincronizar ahora"}
      </Button>
    </div>
  );
}
