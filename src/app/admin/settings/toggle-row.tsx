"use client";

import { useState, useTransition } from "react";
import { updateAppSetting } from "@/lib/services/app-settings";
import type { AppSettings } from "@/lib/services/app-settings";
import { Loader2, CheckCircle, AlertCircle } from "lucide-react";

interface ToggleRowProps {
  label: string;
  description: string;
  flagKey: keyof AppSettings;
  value: boolean;
}

export function ToggleRow({ label, description, flagKey, value: initialValue }: ToggleRowProps) {
  const [enabled, setEnabled] = useState(initialValue);
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message?: string } | null>(null);

  function handleToggle() {
    const next = !enabled;
    startTransition(async () => {
      setFeedback(null);
      try {
        const result = await updateAppSetting(flagKey, next);
        if (result.success) {
          setEnabled(next);
          setFeedback({ type: "success" });
          setTimeout(() => setFeedback(null), 2000);
        } else {
          setFeedback({ type: "error", message: result.error ?? "Error desconocido" });
        }
      } catch (e) {
        setFeedback({ type: "error", message: String(e) });
      }
    });
  }

  return (
    <div className="py-4 border-b border-surface-800 last:border-0">
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0 pr-4">
          <p className="text-sm font-medium text-surface-100">{label}</p>
          <p className="text-xs text-surface-400 mt-0.5">{description}</p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          {feedback?.type === "success" && <CheckCircle className="h-4 w-4 text-green-400" />}
          {feedback?.type === "error" && <AlertCircle className="h-4 w-4 text-red-400" />}
          {isPending && <Loader2 className="h-4 w-4 text-surface-400 animate-spin" />}

          <button
            onClick={handleToggle}
            disabled={isPending}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-surface-900 disabled:opacity-50 ${
              enabled ? "bg-primary-500" : "bg-surface-700"
            }`}
            aria-pressed={enabled}
            aria-label={`${enabled ? "Desactivar" : "Activar"} ${label}`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                enabled ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>
      </div>
      {feedback?.type === "error" && feedback.message && (
        <p className="mt-2 text-xs text-red-400 bg-red-500/10 rounded px-2 py-1">
          ⚠ {feedback.message}
        </p>
      )}
    </div>
  );
}
