"use client";

import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 text-center px-4">
      <div className="text-6xl font-black text-error">Oops</div>
      <h1 className="text-2xl font-bold text-white">Algo salió mal</h1>
      <p className="max-w-md text-muted">
        Ocurrió un error inesperado. Podés intentar nuevamente.
      </p>
      {process.env.NODE_ENV === "development" && error?.message && (
        <pre className="max-w-lg rounded-lg bg-surface-2 p-4 text-sm text-muted overflow-x-auto">
          {error.message}
        </pre>
      )}
      <Button variant="primary" size="lg" onClick={reset}>
        Intentar de nuevo
      </Button>
    </div>
  );
}
