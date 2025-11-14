// components/header-auth.tsx
"use client";

import Link from "next/link";
import Button from "./button";

export default function HeaderAuth() {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200 px-4 py-2">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {/* Logo */}
        <Link href="/" className="flex items-center">
          <img src="/JobMatch.png" alt="JobMatch Logo" className="h-22 w-22" />
          <span className="text-2xl font-bold text-blue-600">JobMatch</span>
        </Link>

        {/* Botones de navegación */}
        <div className="flex items-center gap-3">
          <Link href="/auth/login">
            <Button variant="outline" size="sm">
              Iniciar Sesión
            </Button>
          </Link>
          <Link href="/auth/register">
            <Button variant="outline" size="sm">
              Registro
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
