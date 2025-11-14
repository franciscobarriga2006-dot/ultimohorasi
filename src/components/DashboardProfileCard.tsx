'use client';

import React, { useState, useRef, useLayoutEffect, useEffect } from 'react';
// 1. Importar GSAP
import { gsap } from 'gsap';

// ... (tus constantes: regions, citiesByRegion, occupations, etc. no cambian)
const regions = [
  'Arica y Parinacota',
  'Tarapacá',
  'Antofagasta',
  'Atacama',
  'Coquimbo',
  'Valparaíso',
  'Metropolitana',
  'O’Higgins',
  'Maule',
  'Ñuble',
  'Biobío',
  'Araucanía',
  'Los Ríos',
  'Los Lagos',
  'Aysén',
  'Magallanes',
];

const citiesByRegion = {
  'Arica y Parinacota': ['Arica', 'Putre'],
  'Tarapacá': ['Iquique', 'Alto Hospicio', 'Pozo Almonte'],
  'Antofagasta': ['Antofagasta', 'Calama', 'Tocopilla'],
  'Atacama': ['Copiapó', 'Vallenar', 'Chañaral'],
  'Coquimbo': ['La Serena', 'Coquimbo', 'Ovalle'],
  'Valparaíso': ['Valparaíso', 'Viña del Mar', 'Quillota'],
  'Metropolitana': ['Santiago', 'Puente Alto', 'Maipú'],
  'O’Higgins': ['Rancagua', 'San Fernando', 'Pichilemu'],
  'Maule': ['Talca', 'Curicó', 'Linares'],
  'Ñuble': ['Chillán', 'San Carlos', 'Bulnes'],
  'Biobío': ['Concepción', 'Los Ángeles', 'Coronel'],
  'Araucanía': ['Temuco', 'Villarrica', 'Pucón'],
  'Los Ríos': ['Valdivia', 'La Unión', 'Río Bueno'],
  'Los Lagos': ['Puerto Montt', 'Osorno', 'Castro'],
  'Aysén': ['Coyhaique', 'Puerto Aysén', 'Chile Chico'],
  'Magallanes': ['Punta Arenas', 'Puerto Natales', 'Porvenir'],
};

const occupations = ['Profesional', 'Técnico', 'Estudiante', 'Independiente', 'Ninguna'];

const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@(gmail\.com|hotmail\.com|outlook\.com)$/i; // Restrict to specific domains
  return emailRegex.test(email);
};

const validatePhone = (phone) => {
  const phoneRegex = /^\+56\d{9}$/; // Ejemplo: +56 seguido de 9 dígitos
  return phoneRegex.test(phone);
};

const daysOfWeek = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

export default function DashboardProfileCard({ perfil }) {
  const [nombre, setNombre] = useState(perfil?.nombre || `${perfil?.first_name || 'Usuario'} ${perfil?.last_name || ''}`.trim());
  const [email, setEmail] = useState(perfil?.email || 'usuario@example.com');
  const [phone, setPhone] = useState(perfil?.telefono || '123456789');
  const [region, setRegion] = useState(perfil?.region || 'Araucanía');
  const [ciudad, setCiudad] = useState(perfil?.ciudad || 'Temuco');
  const [disponibilidad, setDisponibilidad] = useState(perfil?.disponibilidad_horaria || { dias: [], horas: '' });
  const [descripcion, setDescripcion] = useState(perfil?.descripcion || 'Descripción del usuario.');
  const [isEditing, setIsEditing] = useState(false);

  // 2. Refs para GSAP y control de estado
  const pageRef = useRef<HTMLDivElement>(null);
  const isInitialLoad = useRef(true); // Para saltar el primer useEffect[isEditing]

  // ... (Todos tus manejadores: handleEmailChange, handlePhoneChange, etc. no cambian)
  const handleEmailChange = (e) => {
    const inputValue = e.target.value;
    setEmail(inputValue.replace(/[^a-zA-Z0-9@._-]/g, ''));
  };

  const handlePhoneChange = (e) => {
    const inputValue = e.target.value;
    if (!inputValue.startsWith('+56')) {
      setPhone('+56');
    } else {
      const phoneNumber = inputValue.slice(3).replace(/\D/g, '');
      setPhone(`+56${phoneNumber}`);
    }
  };

  const handleRegionChange = (e) => {
    setRegion(e.target.value);
    setCiudad(citiesByRegion[e.target.value]?.[0] || '');
  };

  const handleCiudadChange = (e) => {
    setCiudad(e.target.value);
  };

  const handleDisponibilidadChange = (e) => {
    const { name, value } = e.target;
    setDisponibilidad((prev) => ({ ...prev, [name]: value }));
  };

  const handleDaySelection = (day) => {
    setDisponibilidad((prev) => {
      const dias = prev?.dias || [];
      const isSelected = dias.includes(day);
      const updatedDias = isSelected
        ? dias.filter((d) => d !== day)
        : [...dias, day];
      return { ...prev, dias: updatedDias };
    });
  };

  const handleHourChange = (e) => {
    const { name, value } = e.target;
    setDisponibilidad((prev) => ({ ...prev, [name]: value }));
  };

  const toggleEditing = () => {
    setIsEditing(!isEditing); 
  };

  const handleSave = () => {
    if (!validateEmail(email) || !validatePhone(phone)) {
      return;
    }
    setIsEditing(false);
  };

  // 3. Animación de Carga Inicial
  useLayoutEffect(() => {
    if (!pageRef.current) return;

    // gsap.context() es la forma moderna de usar GSAP en React,
    // maneja la limpieza automáticamente.
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        defaults: { ease: 'power3.out', duration: 0.7 },
      });

      // Anima los contenedores principales en cascada
      tl.from('.profile-header', { autoAlpha: 0, y: 30 })
        .from('.profile-section', { autoAlpha: 0, y: 30, stagger: 0.15 }, '-=0.5')
        .from('.profile-sidebar', { autoAlpha: 0, y: 30, stagger: 0.15 }, '-=0.6')
        .from('.profile-button', { autoAlpha: 0, y: 20 }, '-=0.5');

    }, pageRef); // Alcance de las animaciones a pageRef

    return () => ctx.revert(); // Limpieza
  }, []); // El array vacío asegura que se ejecute solo una vez

  // 4. Animación de Transición de Edición
  useEffect(() => {
    // Si es la carga inicial, marca la bandera como falsa y sal.
    // useLayoutEffect se encargó de la animación de entrada.
    if (isInitialLoad.current) {
      isInitialLoad.current = false;
      return;
    }

    if (!pageRef.current) return;

    // Animar la entrada de los nuevos elementos (ya sea de vista o edición)
    const ctx = gsap.context(() => {
      if (isEditing) {
        // Animar la entrada de los campos de edición
        gsap.from('.edit-mode-item', {
          autoAlpha: 0,
          y: -10, // Vienen desde arriba
          stagger: 0.05,
          duration: 0.3,
          ease: 'power2.out',
        });
      } else {
        // Animar la entrada de los campos de vista
        gsap.from('.view-mode-item', {
          autoAlpha: 0,
          y: 10, // Vienen desde abajo
          stagger: 0.05,
          duration: 0.3,
          ease: 'power2.out',
        });
      }
    }, pageRef);

    return () => ctx.revert();
  }, [isEditing]); // Se ejecuta cada vez que isEditing cambia

  return (
    // 5. Añadir ref y clases de animación al JSX
    <div ref={pageRef} className="max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl p-6 ring-1 ring-gray-50">
      
      {/* Añadir clase 'profile-header' e 'invisible' */}
      <div className="profile-header invisible rounded-xl -mx-6 px-6 py-5 bg-gradient-to-r from-white via-slate-50 to-white border-b border-gray-100">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="relative w-28 h-28 rounded-full bg-gradient-to-br from-indigo-50 to-white flex items-center justify-center overflow-hidden ring-2 ring-white shadow-md">
              {perfil?.avatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={perfil.avatar} alt={`${nombre} avatar`} className="w-full h-full object-cover" />
              ) : (
                <span className="text-3xl font-semibold text-gray-400">{(nombre || 'U').charAt(0)}</span>
              )}
              <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-white border-2 border-white flex items-center justify-center text-xs text-green-500 shadow">●</span>
            </div>

            <div>
              {isEditing ? (
                <>
                  {/* Añadir clase 'edit-mode-item' */}
                  <input
                    type="text"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    className="edit-mode-item text-2xl font-extrabold text-gray-900 leading-tight tracking-tight border-b border-gray-300 focus:outline-none focus:border-indigo-500"
                  />
                  <select
                    value={region}
                    onChange={handleRegionChange}
                    className="edit-mode-item text-indigo-600 text-sm font-medium border-b border-gray-300 focus:outline-none focus:border-indigo-500"
                  >
                    {regions.map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                  <select
                    value={ciudad}
                    onChange={handleCiudadChange}
                    className="edit-mode-item text-gray-400 text-sm border-b border-gray-300 focus:outline-none focus:border-indigo-500"
                  >
                    {citiesByRegion[region]?.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </>
              ) : (
                <>
                  {/* Añadir clase 'view-mode-item' */}
                  <h2 className="view-mode-item text-2xl font-extrabold text-gray-900 leading-tight tracking-tight">{nombre}</h2>
                  <p className="view-mode-item text-indigo-600 text-sm font-medium">{region}</p>
                  <p className="view-mode-item text-gray-400 text-sm">{ciudad}</p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        <div className="lg:col-span-2">
          {/* Añadir clase 'profile-section' e 'invisible' */}
          <section className="profile-section invisible mb-6">
            <h3 className="text-lg font-semibold mb-3 text-gray-700">Sobre mí</h3>
            <div className="bg-white text-gray-700 rounded-lg p-5 shadow-inner">
              {isEditing ? (
                <textarea
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  className="edit-mode-item w-full border border-gray-300 rounded-lg p-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                  placeholder="Escribe tu descripción aquí..."
                />
              ) : (
                <p className="view-mode-item whitespace-pre-line leading-relaxed">
                  {descripcion}
                </p>
              )}
            </div>
          </section>

          {/* Añadir clase 'profile-section' e 'invisible' */}
          <section className="profile-section invisible mb-6">
            <h3 className="text-lg font-semibold mb-3 text-gray-700">Experiencia</h3>
            <div className="bg-white rounded-lg p-5 shadow-inner">
              {perfil?.experiencia ? (
                <p className="whitespace-pre-line leading-relaxed text-gray-700">{perfil.experiencia}</p>
              ) : (
                <p className="text-gray-400">Sin información registrada.</p>
              )}
            </div>
          </section>

          {/* Añadir clase 'profile-section' e 'invisible' */}
          <section className="profile-section invisible">
            <h3 className="text-lg font-semibold mb-3 text-gray-700">Contacto</h3>
            <div className="bg-white rounded-lg p-5 shadow-inner text-sm text-gray-700 space-y-2">
              {isEditing ? (
                <>
                  <div className="edit-mode-item flex items-center gap-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12v6M8 12v6m-2 0h12a2 2 0 002-2v-5a2 2 0 00-2-2H6a2 2 0 00-2 2v5a2 2 0 002 2z" />
                    </svg>
                    <input
                      type="email"
                      value={email}
                      onChange={handleEmailChange} // Usar tu manejador existente
                      className={`w-full border border-gray-300 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${validateEmail(email) ? '' : 'border-red-500'}`}
                      placeholder="Email (ejemplo@gmail.com)"
                    />
                    {!validateEmail(email) && (
                      <span className="text-xs text-red-500">Email inválido. Use dominios como gmail.com, hotmail.com, etc.</span>
                    )}
                  </div>
                  <div className="edit-mode-item flex items-center gap-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m0 4v6" />
                    </svg>
                    <input
                      type="text"
                      value={phone}
                      onChange={handlePhoneChange} // Usar tu manejador existente
                      className={`w-full border border-gray-300 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${validatePhone(phone) ? '' : 'border-red-500'}`}
                      placeholder="Teléfono (+56 seguido de 9 dígitos)"
                    />
                    {!validatePhone(phone) && (
                      <span className="text-xs text-red-500">Teléfono inválido. Debe comenzar con +56 y tener 9 dígitos.</span>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <div className="view-mode-item flex items-center gap-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12v6M8 12v6m-2 0h12a2 2 0 002-2v-5a2 2 0 00-2-2H6a2 2 0 00-2 2v5a2 2 0 002 2z" />
                    </svg>
                    <span>Email: <span className="font-medium">{email || 'No definido'}</span></span>
                  </div>
                  <div className="view-mode-item flex items-center gap-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m0 4v6" />
                    </svg>
                    <span>Teléfono: <span className="font-medium">{phone || 'No definido'}</span></span>
                  </div>
                </>
              )}
            </div>
          </section>
        </div>

        <aside className="lg:col-span-1">
          {/* Añadir clase 'profile-sidebar' e 'invisible' */}
          <section className="profile-sidebar invisible mb-6">
            <h3 className="text-lg font-semibold mb-3 text-gray-700">Habilidades</h3>
            <div className="bg-gradient-to-b from-white to-slate-50 rounded-lg p-4">
              {perfil?.habilidades ? (
                <div className="flex flex-wrap gap-2">
                  {perfil.habilidades.split(',').map((h, i) => (
                    <span key={i} className="inline-flex items-center px-3 py-1 rounded-full bg-gradient-to-r from-indigo-50 to-white text-indigo-700 border border-indigo-100 text-sm shadow hover:scale-105 transform transition">{h.trim()}</span>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400">No se han agregado habilidades.</p>
              )}
            </div>
          </section>

          {/* Añadir clase 'profile-sidebar' e 'invisible' */}
          <section className="profile-sidebar invisible mb-4">
            <h3 className="text-lg font-semibold mb-2 text-gray-700">Disponibilidad</h3>
            <div className="bg-white border rounded-lg p-3 text-gray-700 text-sm shadow-sm">
              {isEditing ? (
                <>
                  <div className="edit-mode-item mb-2">
                    <span className="block text-sm font-medium text-gray-600">Selecciona los días:</span>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {daysOfWeek.map((day) => (
                        <label key={day} className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={Array.isArray(disponibilidad.dias) && disponibilidad.dias.includes(day)}
                            onChange={() => handleDaySelection(day)}
                            className="form-checkbox h-4 w-4 text-indigo-600"
                          />
                          <span className="text-gray-700 text-sm">{day}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="edit-mode-item flex gap-2 mt-2">
                    <input
                      type="time"
                      name="horaInicio"
                      value={disponibilidad.horaInicio || ''}
                      onChange={handleHourChange}
                      className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <input
                      type="time"
                      name="horaFin"
                      value={disponibilidad.horaFin || ''}
                      onChange={handleHourChange}
                      className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </>
              ) : (
                <div className="view-mode-item">
                  <p><strong>Días:</strong> {Array.isArray(disponibilidad.dias) && disponibilidad.dias.length > 0 ? disponibilidad.dias.join(', ') : 'No especificados'}</p>
                  <p><strong>Horas:</strong> {disponibilidad.horaInicio && disponibilidad.horaFin ? `${disponibilidad.horaInicio} - ${disponibilidad.horaFin}` : 'No especificadas'}</p>
                </div>
              )}
            </div>
          </section>

          {/* Añadir clase 'profile-sidebar' e 'invisible' */}
          <section className="profile-sidebar invisible bg-gray-50 rounded-lg p-3 text-sm text-gray-500">
            <div className="text-xs text-gray-400">Última actualización</div>
            <div className="font-medium text-gray-700 mt-1">{perfil?.updated_at ? new Date(perfil.updated_at).toLocaleDateString('es-CL') : 'Sin registro'}</div>
          </section>
        </aside>
      </div>

      {/* Añadir clase 'profile-button' e 'invisible' */}
      <button
        onClick={isEditing ? handleSave : toggleEditing} // Actualizado para llamar a handleSave
        className="profile-button invisible mt-3 px-4 py-2 bg-indigo-600 text-white rounded-md text-sm hover:bg-indigo-700 shadow"
      >
        {isEditing ? 'Guardar' : 'Editar'}
      </button>
    </div>
  );
}