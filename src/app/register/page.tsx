import type { Metadata } from "next";
import { RegisterForm } from "./register-form";

export const metadata: Metadata = {
  title: "Registrarse",
  description: "Creá tu cuenta en Mazoteca. Colecciones, mazos, singles y comunidad TCG.",
};

export default function RegisterPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-surface-50 mb-2">
            Creá tu cuenta
          </h1>
          <p className="text-surface-400">
            Unite a la comunidad de Kingdom TCG
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-surface-900 border border-surface-800 rounded-xl p-6 sm:p-8">
          <RegisterForm />
        </div>

        {/* Login link */}
        <p className="text-center mt-6 text-sm text-surface-400">
          ¿Ya tenés cuenta?{" "}
          <a
            href="/login"
            className="text-primary-400 hover:text-primary-300 font-medium"
          >
            Iniciá sesión
          </a>
        </p>
      </div>
    </div>
  );
}
