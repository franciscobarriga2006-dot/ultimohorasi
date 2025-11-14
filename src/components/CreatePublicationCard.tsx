"use client";

import { useState, useEffect, useRef, useLayoutEffect } from "react";
import api from "@/lib/api";
import { gsap } from "gsap";
import { Flip } from "gsap/Flip"; // Importar el plugin Flip

type FormData = {
  titulo: string;
  descripcion: string;
  direccion: string;
  horario: string;
  tipo: string;
  monto: string;
  horas: string;
  ciudad: string;
  region: string;
};

const initialFormData: FormData = {
  titulo: "",
  descripcion: "",
  direccion: "",
  horario: "",
  tipo: "necesidad",
  monto: "",
  horas: "",
  ciudad: "",
  region: "",
};

export default function CreatePublicationCard() {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Estados para etiquetas
  const [etiquetas, setEtiquetas] = useState<any[]>([]);
  const [selectedTags, setSelectedTags] = useState<number[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  // 2. Refs para GSAP
  const cardRef = useRef<HTMLDivElement>(null); // Contenedor principal
  const dropdownRef = useRef<HTMLDivElement>(null); // Para el clic fuera
  const dropdownMenuRef = useRef<HTMLDivElement>(null); // Para animar el menú
  const tagListRef = useRef<HTMLDivElement>(null); // Para animar las etiquetas (Flip)
  const flipState = useRef<any>(null); // Para guardar el estado de Flip
  const errorRef = useRef<HTMLDivElement>(null);
  const successRef = useRef<HTMLDivElement>(null);

  // 3. Registrar el plugin Flip al inicio
  useLayoutEffect(() => {
    gsap.registerPlugin(Flip);
  }, []);

  // Cargar etiquetas (sin cambios)
  useEffect(() => {
    api
      .get("/publicaciones/etiquetas")
      .then((res) => {
        const data = Array.isArray(res.data) ? res.data : res.data?.data || [];
        setEtiquetas(data);
      })
      .catch((err) => {
        console.error("Error al cargar etiquetas:", err);
        setEtiquetas([]);
      });
  }, []);

  // Cerrar dropdown (sin cambios)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 4. Animación de Carga del Formulario (Stagger)
  useLayoutEffect(() => {
    if (!cardRef.current) return;
    
    // GSAP Context para limpieza automática
    const ctx = gsap.context(() => {
      gsap.timeline()
        .from(".form-title", { autoAlpha: 0, y: 30, duration: 0.6, ease: "power3.out" })
        .from(".form-field", { 
          autoAlpha: 0, 
          y: 30, 
          duration: 0.5, 
          stagger: 0.1, // La magia del escalonado
          ease: "power3.out" 
        }, "-=0.4") // Empezar un poco antes de que termine el título
        .from(".form-buttons", { autoAlpha: 0, y: 20, duration: 0.5 }, "-=0.3");
    }, cardRef);

    return () => ctx.revert();
  }, []); // El array vacío asegura que solo se ejecute al montar

  // 5. Animación para mensajes de Error y Éxito
  useLayoutEffect(() => {
    if (error && errorRef.current) {
      gsap.fromTo(errorRef.current, 
        { autoAlpha: 0, y: -20 }, 
        { autoAlpha: 1, y: 0, duration: 0.4, ease: "power3.out" }
      );
    }
    if (success && successRef.current) {
      gsap.fromTo(successRef.current, 
        { autoAlpha: 0, y: -20 }, 
        { autoAlpha: 1, y: 0, duration: 0.4, ease: "power3.out" }
      );
    }
  }, [error, success]);

  // 6. Animación para el Dropdown de Etiquetas
  useEffect(() => {
    if (isDropdownOpen) {
      gsap.fromTo(dropdownMenuRef.current, 
        { autoAlpha: 0, y: -10, display: "block" }, 
        { autoAlpha: 1, y: 0, duration: 0.3, ease: "power3.out" }
      );
    } else {
      gsap.to(dropdownMenuRef.current, { 
        autoAlpha: 0, 
        y: -10, 
        duration: 0.3, 
        ease: "power2.in",
        onComplete: () => {
          // Ocultar después de la animación para que no sea clickeable
          if (dropdownMenuRef.current) {
            gsap.set(dropdownMenuRef.current, { display: "none" });
          }
        }
      });
    }
  }, [isDropdownOpen]);

  // 7. Lógica de Flip para añadir/quitar etiquetas
  // Capturar el estado ANTES de que React actualice el DOM
  const captureFlipState = () => {
    if (tagListRef.current) {
      flipState.current = Flip.getState(tagListRef.current.children);
    }
  };

  // Animar al estado DESPUÉS de que React haya actualizado el DOM
  useLayoutEffect(() => {
    if (flipState.current && tagListRef.current) {
      Flip.from(flipState.current, {
        targets: tagListRef.current.children,
        duration: 0.4,
        ease: "power3.out",
        // Animar las etiquetas que entran y salen
        onEnter: (elements) => gsap.from(elements, { autoAlpha: 0, scale: 0.8, y: 10 }),
        onLeave: (elements) => gsap.to(elements, { autoAlpha: 0, scale: 0.8, duration: 0.3 }),
      });
      flipState.current = null; // Limpiar el estado
    }
  }, [selectedTags]); // Se ejecuta cada vez que las etiquetas cambian

  // --- Manejadores de Estado (Modificados para Flip) ---

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const toggleTag = (tagId: number) => {
    captureFlipState(); // Capturar estado ANTES de cambiar el estado de React
    setSelectedTags((prev) => {
      if (prev.includes(tagId)) {
        return prev.filter((id) => id !== tagId);
      } else {
        if (prev.length >= 3) {
          setError("Solo puedes seleccionar hasta 3 etiquetas");
          setTimeout(() => setError(null), 3000);
          flipState.current = null; // No hubo cambio, limpiar estado
          return prev;
        }
        return [...prev, tagId];
      }
    });
  };

  const removeTag = (tagId: number) => {
    captureFlipState(); // Capturar estado ANTES de cambiar el estado de React
    setSelectedTags((prev) => prev.filter((id) => id !== tagId));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    if (!formData.titulo.trim() || !formData.descripcion.trim()) {
      setError("El título y la descripción son obligatorios");
      setLoading(false);
      return;
    }
    if (selectedTags.length === 0) {
      setError("Debes seleccionar al menos 1 etiqueta");
      setLoading(false);
      return;
    }

    try {
      const dataToSend: any = {
        titulo: formData.titulo.trim(),
        descripcion: formData.descripcion.trim(),
        tipo: formData.tipo,
        etiquetas: selectedTags, // Array de IDs de etiquetas
      };

      if (formData.direccion.trim()) dataToSend.direccion = formData.direccion.trim();
      if (formData.horario.trim()) dataToSend.horario = formData.horario.trim();
      if (formData.monto.trim()) dataToSend.monto = parseFloat(formData.monto);
      if (formData.horas.trim()) dataToSend.horas = formData.horas.trim();
      if (formData.ciudad.trim()) dataToSend.ciudad = formData.ciudad.trim();
      if (formData.region.trim()) dataToSend.region = formData.region.trim();

      const response = await api.post("/publicaciones", dataToSend, {
        withCredentials: true,
        headers: { "Content-Type": "application/json" },
      });

      console.log("Respuesta del servidor:", response.data);
      setSuccess(true);
      setFormData(initialFormData);
      setSelectedTags([]);

      // Redirigir después de 2 segundos
      setTimeout(() => {
        window.location.href = "/publications/publications_own";
      }, 2000);
    } catch (err: any) {
      console.error("Error completo:", err);
      setError(
        err?.response?.data?.error ||
        err?.message ||
        "Error al crear la publicación"
      );
    } finally {
      setLoading(false);
    }
  };

  // Obtener etiquetas seleccionadas con sus nombres
  const selectedTagsWithNames = selectedTags
    .map((id) => etiquetas.find((tag) => tag.id_etiqueta === id))
    .filter(Boolean);

  // Etiquetas disponibles (no seleccionadas)
  const availableTags = etiquetas.filter(
    (tag) => !selectedTags.includes(tag.id_etiqueta)
  );

  return (
    <div ref={cardRef} className="max-w-3xl mx-auto bg-white rounded-2xl shadow-lg p-8">
      <h2 className="form-title invisible text-2xl font-bold text-gray-800 mb-6">
        Crear nueva publicación
      </h2>

      {success && (
        <div ref={successRef} className="success-message invisible mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
          ✓ Publicación creada exitosamente. Redirigiendo...
        </div>
      )}

      {error && (
        <div ref={errorRef} className="error-message invisible mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Tipo */}
        <div className="form-field invisible">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tipo de publicación <span className="text-red-500">*</span>
          </label>
          <select
            name="tipo"
            value={formData.tipo}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="necesidad">Necesidad</option>
            <option value="servicio">Servicio</option>
          </select>
        </div>

        {/* Título */}
        <div className="form-field invisible">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Título <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="titulo"
            value={formData.titulo}
            onChange={handleChange}
            maxLength={200}
            placeholder="Ej: Se necesita profesor de matemáticas"
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        {/* Descripción */}
        <div className="form-field invisible">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Descripción <span className="text-red-500">*</span>
          </label>
          <textarea
            name="descripcion"
            value={formData.descripcion}
            onChange={handleChange}
            rows={5}
            placeholder="Describe los detalles de tu publicación..."
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
            required
          />
        </div>

        {/* Etiquetas */}
        <div className="form-field invisible">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Etiquetas <span className="text-red-500">*</span>
            <span className="text-xs text-gray-500 ml-2">
              (Mínimo 1, máximo 3)
            </span>
          </label>
          {/* Dropdown selector */}
          <div className="relative z-50" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-full h-11 rounded-xl border border-gray-300 bg-white px-4 text-sm outline-none focus:ring-2 focus:ring-blue-500 flex items-center justify-between hover:bg-gray-50"
            >
              <span className="text-gray-700">
                {selectedTags.length > 0
                  ? `${selectedTags.length} etiqueta${selectedTags.length > 1 ? "s" : ""} seleccionada${selectedTags.length > 1 ? "s" : ""}`
                  : "Seleccionar etiquetas"}
              </span>
              <svg
                className={`w-4 h-4 transition-transform ${
                  isDropdownOpen ? "rotate-180" : ""
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {/* Dropdown menu - Añadir ref y 'display: none' */}
            <div 
              ref={dropdownMenuRef} 
              className="relative left-0 top-full mt-2 w-full max-h-60 overflow-y-auto rounded-xl border border-gray-200 bg-white shadow-xl"
              style={{ display: "none" }} // GSAP controlará esto
            >
              {etiquetas.length === 0 ? (
                <p className="p-3 text-sm text-gray-500">Cargando etiquetas...</p>
              ) : availableTags.length === 0 ? (
                <p className="p-3 text-sm text-gray-500">
                  No hay más etiquetas disponibles
                </p>
              ) : (
                <div className="py-1">
                  {availableTags.map((tag) => (
                    <button
                      key={tag.id_etiqueta}
                      type="button"
                      onClick={() => {
                        toggleTag(tag.id_etiqueta);
                      }}
                      disabled={selectedTags.length >= 3}
                      className="w-full px-4 py-2 text-left text-sm hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {tag.nombre}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Etiquetas seleccionadas - Añadir ref para Flip */}
          <div ref={tagListRef} className="mt-3 flex flex-wrap gap-2">
            {selectedTagsWithNames.map((tag: any) => (
              <div
                key={tag.id_etiqueta}
                data-tag-id={tag.id_etiqueta} // Importante para Flip
                className="group relative inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-gray-300 bg-white text-gray-700 text-sm transition-all hover:bg-blue-600 hover:text-white hover:border-blue-600 hover:pr-8 cursor-pointer"
              >
                <span>{tag.nombre}</span>
                <button
                  type="button"
                  onClick={() => removeTag(tag.id_etiqueta)}
                  className="absolute right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label={`Eliminar ${tag.nombre}`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Grid 2 columnas: ciudad, region, direccion, horario, monto, horas */}
        <div className="form-field invisible grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Ciudad</label>
            <input
              type="text"
              name="ciudad"
              value={formData.ciudad}
              onChange={handleChange}
              placeholder="Ej: Santiago"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Región</label>
            <input
              type="text"
              name="region"
              value={formData.region}
              onChange={handleChange}
              placeholder="Ej: Metropolitana"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Dirección</label>
            <input
              type="text"
              name="direccion"
              value={formData.direccion}
              onChange={handleChange}
              placeholder="Ej: Av. Libertador 1234"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Horario</label>
            <input
              type="text"
              name="horario"
              value={formData.horario}
              onChange={handleChange}
              placeholder="Ej: Lunes a Viernes 9:00-18:00"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Monto (CLP)</label>
            <input
              type="number"
              name="monto"
              value={formData.monto}
              onChange={handleChange}
              min="0"
              step="0.01"
              placeholder="Ej: 50000"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Horas</label>
            <input
              type="text"
              name="horas"
              value={formData.horas}
              onChange={handleChange}
              placeholder="Ej: 4 horas semanales"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Botones */}
        <div className="form-buttons invisible flex gap-4 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? "Creando..." : "Crear publicación"}
          </button>
          <button
            type="button"
            onClick={() => {
              setFormData(initialFormData);
              captureFlipState(); // Capturar estado para animar limpieza
              setSelectedTags([]);
              setError(null);
            }}
            className="px-6 py-3 border rounded-lg font-medium text-gray-700 hover:bg-gray-50"
          >
            Limpiar
          </button>
        </div>
      </form>
    </div>
  );
}