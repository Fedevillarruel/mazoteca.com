"use client";

import { useState, useTransition } from "react";
import { resolveReport, dismissReport } from "./actions";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";

export function ReportActions({ reportId }: { reportId: string }) {
  const [isPending, startTransition] = useTransition();
  const [done, setDone] = useState<"resolved" | "dismissed" | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (done === "resolved") {
    return <span className="text-xs text-green-400 font-medium">✓ Resuelto</span>;
  }
  if (done === "dismissed") {
    return <span className="text-xs text-surface-500 font-medium">✓ Desestimado</span>;
  }

  return (
    <div className="flex items-center gap-1">
      {error && <span className="text-xs text-red-400 mr-1">{error}</span>}
      {isPending ? (
        <Loader2 className="h-4 w-4 text-surface-400 animate-spin" />
      ) : (
        <>
          <button
            onClick={() => startTransition(async () => {
              const r = await resolveReport(reportId);
              if (r.success) setDone("resolved");
              else setError(r.error ?? "Error");
            })}
            title="Resolver (acción tomada)"
            className="p-1.5 rounded text-green-400 hover:bg-green-500/10 transition-colors"
          >
            <CheckCircle className="h-4 w-4" />
          </button>
          <button
            onClick={() => startTransition(async () => {
              const r = await dismissReport(reportId);
              if (r.success) setDone("dismissed");
              else setError(r.error ?? "Error");
            })}
            title="Desestimar (sin acción)"
            className="p-1.5 rounded text-surface-400 hover:bg-surface-700 transition-colors"
          >
            <XCircle className="h-4 w-4" />
          </button>
        </>
      )}
    </div>
  );
}
