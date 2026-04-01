"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw, CheckCircle, XCircle, AlertTriangle, ChevronDown, ChevronUp } from "lucide-react";
import { useRouter } from "next/navigation";

interface SyncResult {
  success: boolean;
  synced: number;
  failed: number;
  noCode: number;
  noMatch: number;
  errors: { productId: number; name: string; error: string }[];
  unmatched: { productId: number; name: string; rawCode: string | null }[];
  error?: string;
}

export function SyncButton() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SyncResult | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const router = useRouter();

  async function handleSync() {
    setLoading(true);
    setResult(null);
    setShowDetails(false);
    try {
      const res = await fetch("/api/tiendanube/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      const data = await res.json();
      setResult(data);
      if (res.ok) router.refresh();
    } catch (err) {
      setResult({
        success: false,
        synced: 0,
        failed: 0,
        noCode: 0,
        noMatch: 0,
        errors: [],
        unmatched: [],
        error: err instanceof Error ? err.message : "Error desconocido",
      });
    } finally {
      setLoading(false);
    }
  }

  const hasWarnings = result && (result.noCode > 0 || result.noMatch > 0 || result.failed > 0);
  const hasDetails = result && (result.unmatched.length > 0 || result.errors.length > 0);

  return (
    <div className="flex flex-col items-end gap-2">
      <div className="flex items-center gap-2 flex-wrap justify-end">
        {result && !loading && (
          <>
            {result.error ? (
              <span className="flex items-center gap-1 text-sm text-red-400">
                <XCircle className="h-4 w-4" /> {result.error}
              </span>
            ) : (
              <span className="flex items-center gap-1 text-sm text-green-400">
                <CheckCircle className="h-4 w-4" />
                {result.synced} sincronizados
                {hasWarnings && (
                  <span className="text-yellow-400 ml-1">
                    · {result.noCode + result.noMatch} sin match
                    {result.failed > 0 && ` · ${result.failed} errores`}
                  </span>
                )}
              </span>
            )}
            {hasDetails && (
              <button
                onClick={() => setShowDetails((v) => !v)}
                className="text-xs text-surface-400 hover:text-surface-200 flex items-center gap-0.5"
              >
                {showDetails ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                {showDetails ? "Ocultar" : "Ver detalle"}
              </button>
            )}
          </>
        )}
        <Button onClick={handleSync} disabled={loading} variant="accent">
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          {loading ? "Sincronizando..." : "Sincronizar ahora"}
        </Button>
      </div>

      {/* Detail panel */}
      {showDetails && result && hasDetails && (
        <div className="w-full max-w-2xl bg-surface-800 border border-surface-700 rounded-lg p-4 text-xs space-y-3">
          {result.unmatched.length > 0 && (
            <div>
              <p className="flex items-center gap-1 font-semibold text-yellow-400 mb-2">
                <AlertTriangle className="h-3.5 w-3.5" />
                Productos sin match en catálogo ({result.unmatched.length})
              </p>
              <p className="text-surface-400 mb-2">
                Estos productos existen en Tiendanube pero su código no se encontró en la base de datos.
                Verificá que el tag del producto en TN coincida con el código de carta (ej:{" "}
                <code className="bg-surface-700 px-1 rounded">KT001</code>).
              </p>
              <div className="space-y-1 max-h-48 overflow-y-auto">
                {result.unmatched.map((u) => (
                  <div key={u.productId} className="flex items-center gap-2 text-surface-300 py-0.5">
                    <span className="text-surface-500 w-16 shrink-0">#{u.productId}</span>
                    <span className="flex-1 truncate">{u.name}</span>
                    <code className="bg-surface-700 px-1.5 py-0.5 rounded text-yellow-300 shrink-0">
                      {u.rawCode ?? "sin código"}
                    </code>
                  </div>
                ))}
              </div>
            </div>
          )}
          {result.errors.length > 0 && (
            <div className={result.unmatched.length > 0 ? "border-t border-surface-700 pt-3" : ""}>
              <p className="flex items-center gap-1 font-semibold text-red-400 mb-2">
                <XCircle className="h-3.5 w-3.5" />
                Errores al guardar ({result.errors.length})
              </p>
              <div className="space-y-1 max-h-48 overflow-y-auto">
                {result.errors.map((e) => (
                  <div key={e.productId} className="text-surface-300">
                    <span className="text-surface-500">#{e.productId}</span>{" "}
                    <span>{e.name}</span>:{" "}
                    <span className="text-red-300">{e.error}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
