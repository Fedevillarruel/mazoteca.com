"use client";

import { useState, useTransition } from "react";
import { Flag, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { submitReport } from "@/lib/actions/profile";

const REASONS = [
  "Comportamiento abusivo",
  "Spam o publicidad",
  "Fraude o estafa",
  "Contenido inapropiado",
  "Cuenta falsa o bot",
  "Otro",
];

export function ReportUserButton({
  targetId,
  username,
}: {
  targetId: string;
  username: string;
}) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState(REASONS[0]);
  const [details, setDetails] = useState("");
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const formData = new FormData();
    formData.set("entity_type", "user");
    formData.set("entity_id", targetId);
    formData.set("reported_user_id", targetId);
    formData.set("reason", reason);
    formData.set("details", details);

    startTransition(async () => {
      const result = await submitReport(formData);
      if (result?.error) {
        setError(result.error);
      } else {
        setSuccess(true);
        setTimeout(() => {
          setOpen(false);
          setSuccess(false);
          setDetails("");
          setReason(REASONS[0]);
        }, 2000);
      }
    });
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="p-1.5 rounded text-surface-500 hover:text-red-400 hover:bg-surface-700 transition-colors"
        title={`Reportar a @${username}`}
      >
        <Flag className="h-4 w-4" />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-surface-800 border border-surface-700 rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b border-surface-700">
              <h2 className="font-semibold text-surface-50 flex items-center gap-2">
                <Flag className="h-4 w-4 text-red-400" />
                Reportar a @{username}
              </h2>
              <button
                onClick={() => setOpen(false)}
                className="p-1 rounded text-surface-400 hover:text-surface-100 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {success ? (
              <div className="p-8 text-center">
                <div className="text-4xl mb-3">✅</div>
                <p className="text-surface-100 font-medium">Reporte enviado</p>
                <p className="text-surface-400 text-sm mt-1">Gracias por ayudar a mantener la comunidad.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="p-5 space-y-4">
                <div>
                  <label className="block text-xs font-medium text-surface-300 mb-1.5">
                    Motivo
                  </label>
                  <select
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-full bg-surface-900 border border-surface-600 text-surface-100 text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  >
                    {REASONS.map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-surface-300 mb-1.5">
                    Detalles <span className="text-surface-500">(opcional)</span>
                  </label>
                  <textarea
                    value={details}
                    onChange={(e) => setDetails(e.target.value)}
                    placeholder="Describí lo que pasó..."
                    rows={3}
                    maxLength={500}
                    className="w-full bg-surface-900 border border-surface-600 text-surface-100 text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary-500 resize-none placeholder:text-surface-600"
                  />
                </div>

                {error && (
                  <p className="text-xs text-red-400 bg-red-500/10 px-3 py-2 rounded-lg">{error}</p>
                )}

                <div className="flex gap-2 justify-end pt-1">
                  <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" variant="primary" size="sm" disabled={isPending}>
                    {isPending ? "Enviando…" : "Enviar reporte"}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
