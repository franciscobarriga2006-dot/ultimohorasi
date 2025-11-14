"use client";

import React, { useState } from "react";
import { z } from "zod";
import { useRouter } from "next/navigation";

// Schema de validación con Zod
const NewPasswordSchema = z
  .object({
    contrasena: z
      .string()
      .min(8, "La contraseña debe tener al menos 8 caracteres")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "La contraseña debe contener al menos una mayúscula, una minúscula y un número"
      ),
    confirmcontrasena: z.string(),
  })
  .refine((data) => data.contrasena === data.confirmcontrasena, {
    message: "Las contraseñas no coinciden",
    path: ["confirmcontrasena"],
  });

type NewPasswordForm = z.infer<typeof NewPasswordSchema>;

export default function NewPassword() {
  const router = useRouter();
  const [formData, setFormData] = useState<NewPasswordForm>({
    contrasena: "",
    confirmcontrasena: "",
  });

  const [errors, setErrors] = useState<
    Partial<Record<keyof NewPasswordForm | "general", string | string[]>>
  >({});
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [showContrasena, setShowContrasena] = useState(false);
  const [showConfirmContrasena, setShowConfirmContrasena] = useState(false);

  // Calcular fuerza de contraseña
  const getPasswordStrength = (contrasena: string) => {
    let strength = 0;

    if (contrasena.length >= 8) strength++;
    if (contrasena.length >= 12) strength++;
    if (/(?=.*[a-z])/.test(contrasena)) strength++;
    if (/(?=.*[A-Z])/.test(contrasena)) strength++;
    if (/(?=.*\d)/.test(contrasena)) strength++;
    if (/(?=.*[@$!%*?&#])/.test(contrasena)) strength++;

    if (strength <= 2)
      return { level: "Débil", color: "bg-red-500", width: "33%" };
    if (strength <= 4)
      return { level: "Media", color: "bg-yellow-500", width: "66%" };
    return { level: "Fuerte", color: "bg-green-500", width: "100%" };
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Limpiar error específico cuando el usuario empiece a escribir
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});
    setSuccessMessage("");

    try {
      // Validar datos con Zod primero (del lado del cliente)
      const validatedData = NewPasswordSchema.parse(formData);

      // Aquí llamarías a tu Server Action
      // const result = await NewPasswordAction(validatedData);

      // Simulación de éxito
      setSuccessMessage(
        "¡Contraseña restablecida exitosamente! Redirigiendo..."
      );

      // Limpiar el formulario
      setFormData({
        contrasena: "",
        confirmcontrasena: "",
      });

      // Redirigir después de 2 segundos
      setTimeout(() => {
        router.push("/auth/login");
      }, 2000);
    } catch (error) {
      if (error instanceof z.ZodError) {
        // Formatear errores de Zod
        const formattedErrors: Partial<Record<keyof NewPasswordForm, string>> =
          {};
        error.issues.forEach((err) => {
          if (err.path[0]) {
            formattedErrors[err.path[0] as keyof NewPasswordForm] = err.message;
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

  const contrasenaStrength = formData.contrasena
    ? getPasswordStrength(formData.contrasena)
    : null;

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
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Restablecer Contraseña
              </h2>
              <p className="text-gray-600 text-sm">
                Ingresa tu nueva contraseña segura
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

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Nueva Contraseña */}
              <div>
                <label
                  htmlFor="contrasena"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Nueva Contraseña
                </label>
                <div className="relative">
                  <input
                    type={showContrasena ? "text" : "password"}
                    id="contrasena"
                    name="contrasena"
                    value={formData.contrasena}
                    onChange={handleInputChange}
                    placeholder="••••••••"
                    className={`w-full px-3 py-3 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors bg-gray-100 pr-10 ${
                      errors.contrasena
                        ? "border-red-500 focus:ring-red-500"
                        : "border-gray-300"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowContrasena(!showContrasena)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showContrasena ? (
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                        />
                      </svg>
                    ) : (
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                    )}
                  </button>
                </div>

                {/* Indicador de fuerza */}
                {formData.contrasena && contrasenaStrength && (
                  <div className="mt-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-600">
                        Fuerza de la contraseña:
                      </span>
                      <span
                        className={`text-xs font-medium ${
                          contrasenaStrength.level === "Débil"
                            ? "text-red-600"
                            : contrasenaStrength.level === "Media"
                            ? "text-yellow-600"
                            : "text-green-600"
                        }`}
                      >
                        {contrasenaStrength.level}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${contrasenaStrength.color}`}
                        style={{ width: contrasenaStrength.width }}
                      />
                    </div>
                  </div>
                )}

                {errors.contrasena && (
                  <p className="text-red-500 text-xs mt-1">
                    {Array.isArray(errors.contrasena)
                      ? errors.contrasena.join(", ")
                      : errors.contrasena}
                  </p>
                )}
              </div>

              {/* Confirmar Contraseña */}
              <div>
                <label
                  htmlFor="confirmcontrasena"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Confirmar Contraseña
                </label>
                <div className="relative">
                  <input
                    type={showConfirmContrasena ? "text" : "password"}
                    id="confirmcontrasena"
                    name="confirmcontrasena"
                    value={formData.confirmcontrasena}
                    onChange={handleInputChange}
                    placeholder="••••••••"
                    className={`w-full px-3 py-3 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors bg-gray-100 pr-10 ${
                      errors.confirmcontrasena
                        ? "border-red-500 focus:ring-red-500"
                        : "border-gray-300"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmContrasena(!showConfirmContrasena)
                    }
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showConfirmContrasena ? (
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                        />
                      </svg>
                    ) : (
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                    )}
                  </button>
                </div>
                {errors.confirmcontrasena && (
                  <p className="text-red-500 text-xs mt-1">
                    {Array.isArray(errors.confirmcontrasena)
                      ? errors.confirmcontrasena.join(", ")
                      : errors.confirmcontrasena}
                  </p>
                )}
              </div>

              {/* Requisitos de contraseña */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-xs font-medium text-blue-900 mb-2">
                  Tu contraseña debe contener:
                </p>
                <ul className="space-y-1 text-xs text-blue-800">
                  <li className="flex items-center">
                    <svg
                      className="w-3 h-3 mr-2 text-blue-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Al menos 8 caracteres
                  </li>
                  <li className="flex items-center">
                    <svg
                      className="w-3 h-3 mr-2 text-blue-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Una letra mayúscula
                  </li>
                  <li className="flex items-center">
                    <svg
                      className="w-3 h-3 mr-2 text-blue-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Una letra minúscula
                  </li>
                  <li className="flex items-center">
                    <svg
                      className="w-3 h-3 mr-2 text-blue-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Un número
                  </li>
                </ul>
              </div>

              {/* Botón de envío */}
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-3 px-4 rounded-lg text-white font-medium text-sm transition-colors ${
                  isLoading
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
                    Procesando...
                  </span>
                ) : (
                  "Restablecer Contraseña"
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center my-6">
              <div className="flex-1 border-t border-gray-300"></div>
              <span className="px-4 text-sm text-gray-500">O</span>
              <div className="flex-1 border-t border-gray-300"></div>
            </div>

            {/* Volver al login */}
            <p className="text-center text-sm text-gray-600">
              ¿Recordaste tu contraseña?{" "}
              <button
                onClick={() => router.push("/auth/login")}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Volver al inicio de sesión
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
