import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 text-center">
      <div className="text-8xl font-black text-primary">404</div>
      <h1 className="text-2xl font-bold text-white">Página no encontrada</h1>
      <p className="max-w-md text-muted">
        La página que buscás no existe o fue movida. Verificá la URL o volvé al
        inicio.
      </p>
      <Link href="/">
        <Button variant="primary" size="lg">
          Volver al inicio
        </Button>
      </Link>
    </div>
  );
}
