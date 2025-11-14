// app/(auth)/login/page.tsx
"use client";
import React, { useState, useEffect } from "react";
import Button from "@/components/button";
import api from "@/lib/api";
import { useHelp } from "@/components/HelpWidget";

type Errors = {
  correo?: string;
  contrasena?: string;
  general?: string;
};

export default function Login() {
  const { register, unregister } = useHelp();
  useEffect(() => {
    register([
      {
        title: "Inicio de sesión",
        content: (
          <div>
            <p>Introduce tu correo y contraseña y pulsa "Iniciar Sesión".</p>
            <p>
              Si aún no tienes cuenta pulsa "¡Regístrate!" debajo del
              formulario.
            </p>
          </div>
        ),
      },
      {
        title: "Olvidé mi contraseña",
        content: (
          <div>
            <p>
              Pulsa "¿Olvidaste tu contraseña?" para iniciar el flujo de
              recuperación por correo.
            </p>
          </div>
        ),
      },
    ]);

    return () => unregister();
  }, [register, unregister]);

  const [pending, setPending] = useState(false);
  const [errors, setErrors] = useState<Errors>({});

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});
    setPending(true);

    const fd = new FormData(e.currentTarget);
    const payload = {
      correo: String(fd.get("correo") || ""),
      contrasena: String(fd.get("contrasena") || ""),
    };

    try {
      const res = await api.post("/login", payload);
      const { token, user } = res.data || {};

      if (typeof window !== "undefined") {
        if (token) {
          localStorage.setItem("token", token);
        } else {
          localStorage.removeItem("token");
        }

        if (user?.id_usuario) {
          localStorage.setItem("uid", String(user.id_usuario));
        } else {
          localStorage.removeItem("uid");
        }
      }
      window.location.href = "/";
    } catch (err: any) {
      const resp = err?.response;
      if (resp) {
        const apiErrors = resp.data?.errors || {};
        setErrors({
          correo: apiErrors?.correo?.[0],
          contrasena: apiErrors?.contrasena?.[0],
          general:
            apiErrors?.general?.[0] ||
            resp.data?.message ||
            "Credenciales inválidas",
        });
      } else {
        setErrors({ general: "Error de red. Intenta nuevamente." });
      }
    } finally {
      setPending(false);
    }
  };

  const handleRegister = () => (window.location.href = "/auth/register");
  const handleForgotPassword = () => (window.location.href = "/auth/reset");

  return (
    <div className="min-h-screen bg-login">
      <div className="flex items-center justify-center min-h-[calc(100vh-80px)] p-8">
        <div className="w-full max-w-md animate-slide-up">
          <div className="bg-white rounded-lg shadow-lg p-8 animate-scale-in">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Inicio de Sesión
              </h2>
              <p className="text-gray-600 text-sm">
                Bienvenido. Introduce tus datos.
              </p>
            </div>

            <form onSubmit={onSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="correo"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Correo Electrónico
                </label>
                <input
                  type="email"
                  id="correo"
                  name="correo"
                  placeholder="tu@ejemplo.com"
                  className={`w-full px-3 py-3 border rounded-lg text-sm bg-gray-100 transition-all duration-300 focus:outline-none focus:ring-2
                    ${errors.correo ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-blue-500"}
                    focus:bg-white focus:shadow-lg focus:shadow-blue-100 focus:scale-[1.01]`}
                />
                {errors.correo && (
                  <p className="text-red-500 text-xs mt-1">{errors.correo}</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="contrasena"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Contraseña
                </label>
                <input
                  type="password"
                  id="contrasena"
                  name="contrasena"
                  placeholder="••••••••"
                  className={`w-full px-3 py-3 border rounded-lg text-sm bg-gray-100 transition-all duration-300 focus:outline-none focus:ring-2
                    ${errors.contrasena ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-blue-500"}
                    focus:bg-white focus:shadow-lg focus:shadow-blue-100 focus:scale-[1.01]`}
                />
                {errors.contrasena && (
                  <p className="text-red-500 text-xs mt-1">{errors.contrasena}</p>
                )}
              </div>

              <Button
                type="submit"
                disabled={pending}
                className="w-full transition-transform duration-300 hover:-translate-y-0.5 active:translate-y-0.5 hover:shadow-lg"
              >
                {pending ? "Iniciando sesión..." : "Iniciar Sesión"}
              </Button>
            </form>

            {errors.general && (
              <p className="text-red-600 text-sm mt-4">{errors.general}</p>
            )}

            <div className="flex items-center my-6">
              <div className="flex-1 border-t border-gray-300"></div>
              <span className="px-4 text-sm text-gray-500">O</span>
              <div className="flex-1 border-t border-gray-300"></div>
            </div>

            <div className="text-center mb-4">
              <button
                onClick={handleForgotPassword}
                className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>

            <p className="text-center text-sm text-gray-600">
              ¿No tienes cuenta aún?{" "}
              <button
                onClick={handleRegister}
                className="text-blue-600 hover:text-blue-800 font-medium transition-colors underline-offset-4 hover:underline"
              >
                ¡Regístrate!
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
