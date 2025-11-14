"use client";

import React from "react";

type ContactCardItemProps = {
  id?: number | string;
  name?: string;
  lastMessage?: string;
  fecha?: string; // ISO datetime
  unread?: number;
  className?: string;
  onClick?: (id?: number | string) => void;
  avatarBg?: string;
};

/**
 * ContactCardItem - single contact visual.
 * Diseño con colores de JobMatch. Reutilizable por un Sidebar/Parent.
 */
export function ContactCardItem({
  id,
  name = "Sin nombre",
  lastMessage = "",
  fecha,
  unread = 0,
  className = "",
  onClick,
  avatarBg = "bg-gray-200 text-gray-600",
}: ContactCardItemProps) {
  const initials = (name || "")
    .split(" ")
    .map((s) => s.charAt(0))
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const time = (() => {
    if (!fecha) return "";
    try {
      const d = new Date(fecha);
      return d.toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit" });
    } catch {
      return "";
    }
  })();

  return (
    <button
      type="button"
      onClick={() => onClick?.(id)}
      className={`w-full px-5 py-3.5 bg-white hover:bg-gray-50 border-b border-gray-100 flex items-center gap-3 transition-colors text-left ${className}`}
      aria-label={`Abrir chat con ${name}`}
    >
      <div className={`h-12 w-12 rounded-full flex items-center justify-center font-semibold text-sm flex-shrink-0 ${avatarBg}`}>
        {initials}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-1">
          <div className="text-sm font-semibold text-gray-900 truncate">
            {name}
          </div>
          <div className="text-xs text-gray-400 flex-shrink-0">{time}</div>
        </div>

        <div className="text-sm text-gray-600 truncate">
          {lastMessage}
        </div>
      </div>
    </button>
  );
}

/* --- Mock list (preview) - export default para ver varios items en la UI --- */
type MockItem = { id: number; name: string; lastMessage: string; fecha: string; unread?: number; avatarBg?: string };

const MOCK: MockItem[] = [
  { id: 1, name: "Ricardo López", lastMessage: "Hola Ricardo te dejo la información que pediste sobre la oferta.", fecha: new Date().toISOString(), avatarBg: "bg-blue-100 text-blue-700" },
  { id: 2, name: "Ana García", lastMessage: "Entendido, gracias por confirmar. Te envío todo en la tarde.", fecha: new Date(Date.now() - 1000 * 60 * 60).toISOString(), unread: 2, avatarBg: "bg-green-100 text-green-700" },
  { id: 3, name: "Carlos Ruiz", lastMessage: "Perfecto, nos vemos el miércoles para la clase.", fecha: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), avatarBg: "bg-purple-100 text-purple-700" },
  { id: 4, name: "Sofía Martínez", lastMessage: "¿Podrías enviarme tu portafolio?", fecha: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(), unread: 1, avatarBg: "bg-pink-100 text-pink-700" },
  { id: 5, name: "Javier Pérez", lastMessage: "Sí, el plazo de entrega es el viernes.", fecha: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(), avatarBg: "bg-yellow-100 text-yellow-700" },
  { id: 6, name: "Alberto Caro", lastMessage: "Si no estudias, estas frito!!.", fecha: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(), avatarBg: "bg-indigo-100 text-indigo-700" },
];

export default function ContactCard({ count = 5, className = "" }: { count?: number; className?: string }) {
  return (
    <div className={`space-y-0 ${className}`} aria-hidden>
      {MOCK.slice(0, count).map((m) => (
        <ContactCardItem
          key={m.id}
          id={m.id}
          name={m.name}
          lastMessage={m.lastMessage}
          fecha={m.fecha}
          unread={m.unread}
          avatarBg={m.avatarBg}
        />
      ))}
    </div>
  );
}