'use client';

import { useState } from 'react';
import RegisterHelp from '@/components/RegisterHelp';

export default function SupportPage() {
  const faqs = [
    {
      question: '¿Cómo puedo recuperar mi contraseña?',
      answer: 'Haz clic en "Olvidé mi contraseña" en la página de inicio de sesión y sigue las instrucciones.',
    },
    {
      question: '¿Cómo contacto al soporte técnico?',
      answer: 'Utiliza el formulario de contacto en la sección "Contáctanos".',
    },
    {
      question: '¿Cómo puedo eliminar mi cuenta?',
      answer: 'Accede a tu perfil y selecciona la opción "Eliminar cuenta".',
    },
    {
      question: '¿Cómo puedo cambiar mi correo electrónico registrado?',
      answer: 'Accede a tu perfil y selecciona la opción para editar tu correo electrónico.',
    },
    {
      question: '¿Qué hago si no puedo iniciar sesión?',
      answer: 'Verifica que tu correo y contraseña sean correctos. Si el problema persiste, utiliza la opción "Olvidé mi contraseña".',
    },
    {
      question: '¿Cómo puedo reportar un problema técnico?',
      answer: 'Envíanos un mensaje a través del formulario de contacto explicando el problema con detalles.',
    },
    {
      question: '¿Cómo puedo actualizar mi información personal?',
      answer: 'Accede a tu perfil y selecciona la opción para editar tu información personal.',
    },
    {
      question: '¿Qué hago si mi cuenta ha sido suspendida?',
      answer: 'Contacta al soporte técnico para obtener más información sobre la suspensión de tu cuenta.',
    },
    {
      question: '¿Cómo puedo cambiar mi contraseña?',
      answer: 'Accede a tu perfil y selecciona la opción para cambiar tu contraseña.',
    },
    {
      question: '¿Cómo puedo verificar mi cuenta?',
      answer: 'Sigue las instrucciones enviadas a tu correo electrónico para verificar tu cuenta.',
    },
  ];

  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div>
      <main className="p-6">
        <RegisterHelp
          steps={[
            {
              title: 'Soporte y FAQs',
              content: (
                <div>
                  <p>Consulta las preguntas frecuentes y expande cada tarjeta para ver la respuesta.</p>
                </div>
              ),
            },
          ]}
        />
        <h1 className="text-4xl font-bold text-center mb-8">Soporte al Cliente</h1>
        <div className="bg-gray-100 p-6 rounded-md shadow-md max-w-3xl mx-auto space-y-6">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className={`bg-white p-4 rounded-md shadow-md cursor-pointer transition-all duration-300 ${
                openIndex === index ? 'max-h-screen' : 'max-h-16 overflow-hidden'
              }`}
              onClick={() => toggleFaq(index)}
            >
              <h2 className="text-lg font-semibold">{faq.question}</h2>
              {openIndex === index && (
                <p className="mt-4 text-base text-gray-700 transition-opacity duration-300">{faq.answer}</p>
              )}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}