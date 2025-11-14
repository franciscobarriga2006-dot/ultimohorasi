'use client';

import { useState, useEffect } from 'react';
import { useHelp } from '@/components/HelpWidget';
import RegisterHelp from '@/components/RegisterHelp';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    reason: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState({
    name: false,
    email: false,
    reason: false,
    message: false,
  });

  const validateForm = () => {
    const newErrors = {
      name: !formData.name,
      email: !formData.email || !formData.email.includes('@'),
      reason: !formData.reason,
      message: !formData.message,
    };
    setErrors(newErrors);
    return !Object.values(newErrors).some((error) => error);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: false }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setFormData({ name: '', email: '', reason: '', message: '' });
      }, 3000);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <main className="p-6 flex-grow">
        <RegisterHelp
          steps={[
            {
              title: 'Contacto y soporte',
              content: (
                <div>
                  <p>Rellena el formulario y pulsa "Enviar" para contactarnos.</p>
                  <p>Recibirás respuesta por correo según el motivo seleccionado.</p>
                </div>
              ),
            },
          ]}
        />
        <h1 className="text-4xl font-bold text-center mb-8">Contáctanos</h1>
        <div className="bg-gray-100 p-6 rounded-md shadow-md max-w-3xl mx-auto">
          {submitted ? (
            <div className="text-center animate-fade-in">
              <h2 className="text-2xl font-semibold text-green-600 mb-4">Mensaje enviado</h2>
              <p className="text-lg">Gracias por contactarnos. Hemos recibido tu mensaje.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="bg-white p-4 rounded-md shadow-md">
                <label htmlFor="name" className="block text-lg font-medium mb-2">Nombre</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`w-full border rounded p-2 text-base ${errors.name ? 'border-red-500' : ''}`}
                  placeholder="Tu nombre"
                />
                {errors.name && <p className="text-red-500 text-sm">Por favor completa esta casilla.</p>}
              </div>
              <div className="bg-white p-4 rounded-md shadow-md">
                <label htmlFor="email" className="block text-lg font-medium mb-2">Correo Electrónico</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full border rounded p-2 text-base ${errors.email ? 'border-red-500' : ''}`}
                  placeholder="Tu correo electrónico"
                />
                {errors.email && <p className="text-red-500 text-sm">Por favor ingresa un correo válido.</p>}
              </div>
              <div className="bg-white p-4 rounded-md shadow-md">
                <label htmlFor="reason" className="block text-lg font-medium mb-2">Motivo de Contacto</label>
                <select
                  id="reason"
                  name="reason"
                  value={formData.reason}
                  onChange={handleChange}
                  className={`w-full border rounded p-2 text-base ${errors.reason ? 'border-red-500' : ''}`}
                >
                  <option value="">Selecciona un motivo</option>
                  <option value="Soporte Técnico">Soporte Técnico</option>
                  <option value="Consulta General">Consulta General</option>
                  <option value="Sugerencia">Sugerencia</option>
                  <option value="Reporte de Problema">Reporte de Problema</option>
                </select>
                {errors.reason && <p className="text-red-500 text-sm">Por favor selecciona un motivo.</p>}
              </div>
              <div className="bg-white p-4 rounded-md shadow-md">
                <label htmlFor="message" className="block text-lg font-medium mb-2">Mensaje</label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  className={`w-full border rounded p-2 text-base ${errors.message ? 'border-red-500' : ''}`}
                  placeholder="Tu mensaje"
                  rows={4}
                ></textarea>
                {errors.message && <p className="text-red-500 text-sm">Por favor completa esta casilla.</p>}
              </div>
              <button
                type="submit"
                className="bg-blue-500 text-white px-4 py-2 rounded text-lg hover:bg-blue-600 transition-colors"
              >
                Enviar
              </button>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}