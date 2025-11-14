"use client";

import React, { useState, useRef, useEffect } from "react";
import { z } from "zod";
import { useRouter } from "next/navigation";

// Schema de validación con Zod
const tokenSchema = z.object({
  token: z
    .string()
    .length(6, "El código debe tener 6 dígitos")
    .regex(/^\d{6}$/, "El código debe contener solo números"),
});

type TokenForm = z.infer<typeof tokenSchema>;

export default function TokenVerification() {
  const router = useRouter();
  const [token, setToken] = useState(["", "", "", "", "", ""]);
  const [errors, setErrors] = useState<
    Partial<Record<"token" | "general", string | string[]>>
  >({});
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Focus en el primer input al montar
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleInputChange = (index: number, value: string) => {
    // Solo permitir números
    if (value && !/^\d$/.test(value)) return;

    const newToken = [...token];
    newToken[index] = value;
    setToken(newToken);

    // Limpiar errores cuando el usuario escriba
    if (errors.token || errors.general) {
      setErrors({});
    }

    // Auto-focus al siguiente input si hay un valor
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    // Manejar backspace
    if (e.key === "Backspace") {
      if (!token[index] && index > 0) {
        // Si el campo está vacío, ir al anterior
        inputRefs.current[index - 1]?.focus();
      } else {
        // Si tiene valor, borrarlo
        const newToken = [...token];
        newToken[index] = "";
        setToken(newToken);
      }
    }

    // Manejar flechas izquierda/derecha
    if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === "ArrowRight" && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").trim();

    // Solo permitir pegar si son 6 dígitos
    if (/^\d{6}$/.test(pastedData)) {
      const newToken = pastedData.split("");
      setToken(newToken);
      // Focus en el último input
      inputRefs.current[5]?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});
    setSuccessMessage("");

    try {
      const tokenString = token.join("");

      // Validar con Zod
      const validatedData = tokenSchema.parse({ token: tokenString });

      // Aquí llamarías a tu Server Action para verificar el token
      // const result = await verifyTokenAction(validatedData.token);

      // Simulación de éxito
      setSuccessMessage("¡Código verificado exitosamente! Redirigiendo...");

      // Redirigir a la página de nueva contraseña
      setTimeout(() => {
        router.push("/auth/reset/token/newpassword");
      }, 2000);
    } catch (error) {
      if (error instanceof z.ZodError) {
        // Formatear errores de Zod
        const formattedErrors: Partial<Record<"token", string>> = {};
        error.issues.forEach((err) => {
          if (err.path[0]) {
            formattedErrors.token = err.message;
          }
        });
        setErrors(formattedErrors);
      } else {
        // Error genérico
        setErrors({
          general: [
            "Ocurrió un error inesperado. Por favor, intenta nuevamente.",
          ],
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = () => {
    // Aquí llamarías a tu Server Action para reenviar el código
    alert("Código reenviado a tu correo electrónico");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex items-center justify-center min-h-[calc(100vh-80px)] p-8">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Verificar Código
              </h2>
              <p className="text-gray-600 text-sm">
                Ingresa el código de 6 dígitos que enviamos a tu correo
                electrónico
              </p>
            </div>

            {/* Mensaje de éxito */}
            {successMessage && (
              <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-md text-sm">
                {successMessage}
              </div>
            )}

            {/* Mensaje de error general */}
            {errors.general && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md text-sm">
                {Array.isArray(errors.general)
                  ? errors.general.join(", ")
                  : errors.general}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Inputs de código */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3 text-center">
                  Código de Verificación
                </label>
                <div className="flex gap-2 justify-center">
                  {token.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => {
                        inputRefs.current[index] = el;
                      }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleInputChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      onPaste={index === 0 ? handlePaste : undefined}
                      className={`w-12 h-14 text-center text-2xl font-bold border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                        errors.token
                          ? "border-red-500 focus:ring-red-500"
                          : "border-gray-300"
                      }`}
                      aria-label={`Dígito ${index + 1}`}
                    />
                  ))}
                </div>
                {errors.token && (
                  <p className="text-red-500 text-xs mt-2 text-center">
                    {Array.isArray(errors.token)
                      ? errors.token.join(", ")
                      : errors.token}
                  </p>
                )}
              </div>

              {/* Información adicional */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-start">
                  <svg
                    className="w-5 h-5 text-blue-600 mt-0.5 mr-2 flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <p className="text-xs text-blue-800">
                    El código expira en 10 minutos. Si no lo recibes, verifica
                    tu carpeta de spam o solicita uno nuevo.
                  </p>
                </div>
              </div>

              {/* Botón de verificar */}
              <button
                type="submit"
                disabled={isLoading || token.some((digit) => !digit)}
                className={`w-full py-3 px-4 rounded-lg text-white font-medium text-sm transition-colors ${
                  isLoading || token.some((digit) => !digit)
                    ? "bg-blue-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Verificando...
                  </span>
                ) : (
                  "Verificar Código"
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center my-6">
              <div className="flex-1 border-t border-gray-300"></div>
              <span className="px-4 text-sm text-gray-500">O</span>
              <div className="flex-1 border-t border-gray-300"></div>
            </div>

            {/* Reenviar código */}
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">
                ¿No recibiste el código?
              </p>
              <button
                type="button"
                onClick={handleResendCode}
                className="text-blue-600 hover:text-blue-800 font-medium text-sm"
              >
                Reenviar código
              </button>
            </div>

            {/* Volver */}
            <div className="mt-4 text-center">
              <button
                onClick={() => router.push("/auth/login")}
                className="text-gray-600 hover:text-gray-800 text-sm"
              >
                ← Volver al inicio de sesión
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
