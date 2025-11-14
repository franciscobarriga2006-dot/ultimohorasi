// app/error.tsx
"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log opcional (en cliente). Para logs de servidor, usa middleware/observabilidad.
    console.error(error);
  }, [error]);

  return (
    <html>
      <body className="min-h-screen grid place-items-center p-6">
        <div className="max-w-md w-full rounded-2xl border p-6 shadow-sm bg-white">
          <h1 className="text-xl font-semibold">Ocurrió un error</h1>
          <p className="mt-2 text-sm text-zinc-600">
            Intenta recargar la página o vuelve a la página anterior.
          </p>
          <div className="mt-4 flex gap-3">
            <button
              onClick={() => reset()} // reintenta renderizar el segmento
              className="rounded-md bg-zinc-900 px-4 py-2 text-white"
            >
              Reintentar
            </button>
            <a href="/" className="rounded-md border px-4 py-2">
              Ir al inicio
            </a>
          </div>
          {/* Opcional: muestra el digest en dev */}
          {process.env.NODE_ENV !== "production" && error?.digest && (
            <p className="mt-3 text-xs text-zinc-500">digest: {error.digest}</p>
          )}
        </div>
      </body>
    </html>
  );
}
