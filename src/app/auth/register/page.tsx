// app/(auth)/register/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useHelp } from "@/components/HelpWidget";
import { motion } from "framer-motion";
import { fadeInUp, staggerContainer } from "../../../components/animations";
import { z } from "zod";
import Button from "../../../components/button";
import { useRouter } from "next/navigation";
import Image from "next/image";
import api from "@/lib/api";

// --- Helpers RUT ---
const cleanRut = (s: string) => s.replace(/[^0-9kK]/g, "").toUpperCase();
const formatRut = (s: string) => {
  const c = cleanRut(s).slice(0, 9);          // tope aquí
  if (!c) return "";
  const body = c.slice(0, -1);
  const dv = c.slice(-1);
  const bodyDots = body.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `${bodyDots}-${dv}`;
};
const calcDV = (body: string) => {
  let sum = 0, mul = 2;
  for (let i = body.length - 1; i >= 0; i--) {
    sum += Number(body[i]) * mul;
    mul = mul === 7 ? 2 : mul + 1;
  }
  const res = 11 - (sum % 11);
  return res === 11 ? "0" : res === 10 ? "K" : String(res);
};
const isValidRut = (val: string) => {
  const c = cleanRut(val);
  if (c.length < 2) return false;
  const body = c.slice(0, -1);
  const dv = c.slice(-1);
  if (!/^\d+$/.test(body)) return false;
  return calcDV(body) === dv;
};

// --- Tipos y schema ---
type RegisterInput = {
  Rut: string;
  nombres: string;
  apellidos: string;
  correo: string;
  contrasena: string;
  confirmcontrasena: string;
};

const registerSchema = z
  .object({
    Rut: z
      .string()
      .min(3, "RUT requerido")
      .refine((v) => cleanRut(v).length <= 9, "Máximo 9 dígitos incluyendo DV")
      .refine(isValidRut, "RUT inválido"),
    nombres: z.string().min(2, "Nombres requeridos"),
    apellidos: z.string().min(2, "Apellidos requeridos"),
    correo: z.string().email("Correo inválido"),
    contrasena: z.string().min(8, "Mínimo 8 caracteres"),
    confirmcontrasena: z.string(),
  })
  .refine((d) => d.contrasena === d.confirmcontrasena, {
    path: ["confirmcontrasena"],
    message: "Las contraseñas no coinciden",
  });

export default function Register() {
  const router = useRouter();

  const { register, unregister } = useHelp();
  useEffect(() => {
    register([
      {
        title: "Registro de usuario",
        content: (
          <div>
            <p>Completa los campos del formulario y pulsa "Registrar Cuenta".</p>
            <p>El RUT debe ser válido y la contraseña al menos 8 caracteres.</p>
          </div>
        ),
      },
    ]);

    return () => unregister();
  }, [register, unregister]);

  const [formData, setFormData] = useState<RegisterInput>({
    Rut: "",
    nombres: "",
    apellidos: "",
    correo: "",
    contrasena: "",
    confirmcontrasena: "",
  });

  const [errors, setErrors] = useState<
    Partial<Record<keyof RegisterInput | "general", string | string[]>>
  >({});
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const getPasswordStrength = (contrasena: string) => {
    let s = 0;
    if (contrasena.length >= 8) s++;
    if (contrasena.length >= 12) s++;
    if (/[a-z]/.test(contrasena)) s++;
    if (/[A-Z]/.test(contrasena)) s++;
    if (/\d/.test(contrasena)) s++;
    if (/[@$!%*?&#]/.test(contrasena)) s++;
    if (s <= 2) return { level: "Débil", color: "bg-red-500", width: "33%" };
    if (s <= 4) return { level: "Media", color: "bg-yellow-500", width: "66%" };
    return { level: "Fuerte", color: "bg-green-500", width: "100%" };
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const processed = name === "Rut" ? formatRut(value) : value;
    setFormData((p) => ({ ...p, [name]: processed }));
    if (errors[name as keyof RegisterInput]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    if (e.target.name === "Rut") {
      setFormData((p) => ({ ...p, Rut: formatRut(p.Rut) }));
    }
  };

const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  setIsLoading(true);
  setErrors({});
  setSuccessMessage("");

  const parsed = registerSchema.safeParse(formData);
  if (!parsed.success) {
    setErrors(parsed.error.flatten().fieldErrors as any);
    setIsLoading(false);
    return;
  }

  try {
    const payload = {
      Rut: formData.Rut.trim(),
      nombres: formData.nombres.trim(),
      apellidos: formData.apellidos.trim(),
      correo: formData.correo.trim(),
      contrasena: formData.contrasena,
    };

    const res = await api.post("/register", payload);

    if (res.status === 201 || res.data?.user) {
      const user = res.data?.user ?? null;
      const token = res.data?.token ?? null;
      if (token) api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      // Crear perfil por defecto en /perfil (POST)
      try {
        const perfilDefault = {
          id_usuario: user?.id ?? user?.user_id ?? user?.id_usuario ?? null, // requerido por backend
          habilidades: "",
          experiencia: "",
          ciudad: "",
          region: "",
          disponibilidad_horaria: { dias: [], horaInicio: null, horaFin: null }, // JSON
          insignia: null, // o 0..5 si quieres semilla
        };

        await api.post("/perfil", perfilDefault);
        console.log("Perfil por defecto creado correctamente.");
      } catch (err: any) {
        const status = err?.response?.status;
        if (status === 409) {
          console.warn("Perfil ya existe (409). Continuando.");
        } else {
          console.warn("No se pudo crear perfil por defecto:", err?.response?.data ?? err);
        }
      }

      setSuccessMessage("Cuenta creada. Redirigiendo…");
      setTimeout(() => router.push("/auth/login"), 1200);
    } else {
      setErrors({ general: "No se pudo registrar." });
    }
  } catch (err: any) {
    const resp = err?.response;
    if (resp?.data?.error) setErrors({ general: resp.data.error });
    else setErrors({ general: "Error de red o servidor." });
  } finally {
    setIsLoading(false);
  }
};

  const strength = formData.contrasena
    ? getPasswordStrength(formData.contrasena)
    : null;

  return (
    <div className="min-h-screen bg-white">
      <div className="flex justify-center items-start px-4 py-8">
        <div className="w-full max-w-6xl bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="flex min-h-[700px]">
            <div className="flex-1 p-6 flex items-center">
              <div className="w-full max-w-md mx-auto">
                <motion.div 
                  className="text-center mb-6"
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                >
                  <motion.h2 
                    className="text-3xl font-bold text-gray-900 mb-2"
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                  >
                    Crea Tu Cuenta
                  </motion.h2>
                  <motion.h3 
                    className="text-xl font-bold text-gray-900 mb-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                  >
                    JobMatch
                  </motion.h3>
                  <motion.p 
                    className="text-gray-600 text-sm"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                  >
                    Completa tus datos.
                  </motion.p>
                </motion.div>

                {successMessage && (
                  <motion.div 
                    className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-md text-sm"
                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {successMessage}
                  </motion.div>
                )}
                {errors.general && (
                  <motion.div 
                    className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md text-sm"
                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {Array.isArray(errors.general) ? errors.general.join(", ") : errors.general}
                  </motion.div>
                )}

                <motion.form 
                  onSubmit={handleSubmit} 
                  className="space-y-4"
                  variants={staggerContainer}
                  initial="hidden"
                  animate="visible"
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                >
                  <motion.div 
                    variants={fadeInUp}
                    whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
                    whileTap={{ scale: 0.98 }}>
                    <label htmlFor="Rut" className="block text-sm font-medium text-gray-700 mb-1">RUT</label>
                    <input
                      type="text"
                      id="Rut"
                      name="Rut"
                      value={formData.Rut}
                      onChange={handleInputChange}
                      onBlur={handleBlur}
                      placeholder="12.345.678-5"
                      inputMode="text"
                      className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 ${
                        errors.Rut ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-blue-500"
                      }`}
                    />
                    {errors.Rut && <p className="text-red-500 text-xs mt-1">{errors.Rut as string}</p>}
                  </motion.div>

                  <motion.div variants={fadeInUp}>
                    <label htmlFor="nombres" className="block text-sm font-medium text-gray-700 mb-1">Nombres</label>
                    <input
                      type="text"
                      id="nombres"
                      name="nombres"
                      value={formData.nombres}
                      onChange={handleInputChange}
                      placeholder="Juan"
                      className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 ${
                        errors.nombres ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-blue-500"
                      }`}
                    />
                    {errors.nombres && <p className="text-red-500 text-xs mt-1">{errors.nombres as string}</p>}
                  </motion.div>

                  <motion.div variants={fadeInUp}>
                    <label htmlFor="apellidos" className="block text-sm font-medium text-gray-700 mb-1">Apellidos</label>
                    <input
                      type="text"
                      id="apellidos"
                      name="apellidos"
                      value={formData.apellidos}
                      onChange={handleInputChange}
                      placeholder="Pérez Soto"
                      className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 ${
                        errors.apellidos ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-blue-500"
                      }`}
                    />
                    {errors.apellidos && <p className="text-red-500 text-xs mt-1">{errors.apellidos as string}</p>}
                  </motion.div>

                  <motion.div variants={fadeInUp}>
                    <label htmlFor="correo" className="block text-sm font-medium text-gray-700 mb-1">Correo</label>
                    <input
                      type="email"
                      id="correo"
                      name="correo"
                      value={formData.correo}
                      onChange={handleInputChange}
                      placeholder="juan@ejemplo.com"
                      className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 ${
                        errors.correo ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-blue-500"
                      }`}
                    />
                    {errors.correo && <p className="text-red-500 text-xs mt-1">{errors.correo as string}</p>}
                  </motion.div>

                  <motion.div variants={fadeInUp}>
                    <label htmlFor="contrasena" className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
                    <input
                      type="password"
                      id="contrasena"
                      name="contrasena"
                      value={formData.contrasena}
                      onChange={handleInputChange}
                      placeholder="••••••••"
                      className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 ${
                        errors.contrasena ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-blue-500"
                      }`}
                    />
                    {formData.contrasena && strength && (
                      <div className="mt-2">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-gray-600">Fuerza de la contraseña:</span>
                          <span
                            className={`text-xs font-medium ${
                              strength.level === "Débil"
                                ? "text-red-600"
                                : strength.level === "Media"
                                ? "text-yellow-600"
                                : "text-green-600"
                            }`}
                          >
                            {strength.level}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className={`h-2 rounded-full ${strength.color}`} style={{ width: strength.width }} />
                        </div>
                      </div>
                    )}
                    {errors.contrasena && <p className="text-red-500 text-xs mt-1">{errors.contrasena as string}</p>}
                  </motion.div>

                  <motion.div variants={fadeInUp}>
                    <label htmlFor="confirmcontrasena" className="block text-sm font-medium text-gray-700 mb-1">
                      Confirmar contraseña
                    </label>
                    <input
                      type="password"
                      id="confirmcontrasena"
                      name="confirmcontrasena"
                      value={formData.confirmcontrasena}
                      onChange={handleInputChange}
                      placeholder="••••••••"
                      className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 ${
                        errors.confirmcontrasena ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-blue-500"
                      }`}
                    />
                    {errors.confirmcontrasena && (
                      <p className="text-red-500 text-xs mt-1">{errors.confirmcontrasena as string}</p>
                    )}
                  </motion.div>

                  <motion.div className="pt-2" variants={fadeInUp}>
                    <Button type="submit" disabled={isLoading} className="w-full">
                      {isLoading ? "Registrando..." : "Registrar Cuenta"}
                    </Button>
                  </motion.div>
                </motion.form>

                <div className="flex items-center my-3">
                  <div className="flex-1 border-t border-gray-300"></div>
                  <span className="px-3 text-xs text-gray-500">O</span>
                  <div className="flex-1 border-t border-gray-300"></div>
                </div>

                <p className="text-center text-xs text-gray-600">
                  ¿Ya tienes una cuenta?{" "}
                  <button onClick={() => router.push("/auth/login")} className="text-blue-600 hover:text-blue-800 font-medium">
                    Inicia Sesión
                  </button>
                </p>
              </div>
            </div>

            <div className="flex-1 flex items-center justify-center p-6" style={{ backgroundColor: "rgba(1,105,193,1)" }}>
              <div className="max-w-md w-full flex items-center justify-center">
                <Image src="/Register.png" alt="Registro JobMatch" className="w-full h-auto max-w-sm object-contain" width={1024} height={1024} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
