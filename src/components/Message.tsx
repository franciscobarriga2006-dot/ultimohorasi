"use client";

import React from "react";

export type MessageRow = {
  id_mensaje: number;
  id_chat: number;
  id_usuariotx: number;
  id_usuariorx: number;
  mensaje: string;
  fecha: string; // DATETIME string from DB
};

type Props = {
  message: MessageRow;
  currentUserId?: number | string; // para alinear a la derecha si el remitente es el usuario actual
  showDate?: boolean; // mostrar fecha completa encima del bubble (por conversación larga)
  className?: string;
};

/**
 * Message - renderiza un único mensaje como bubble alineado según remitente.
 * - Usa message.mensaje y message.fecha (YYYY-MM-DDTHH:MM:SS)
 * - Si currentUserId === message.id_usuariotx => bubble a la derecha (mensaje propio)
 */
export default function Message({ message, currentUserId, showDate = false, className = "" }: Props) {
  const isMine =
    currentUserId !== undefined &&
    String(currentUserId) === String(message.id_usuariotx);

  const dateLabel = (() => {
    try {
      const d = new Date(message.fecha);
      const time = d.toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit" });
      const date = d.toLocaleDateString("es-CL");
      return { time, date };
    } catch {
      return { time: "", date: "" };
    }
  })();

  return (
    <div className={`w-full flex ${isMine ? "justify-end" : "justify-start"} ${className}`}>
      <div className="max-w-[78%]">
        {showDate && (
          <div className="text-center text-xs text-gray-400 mb-2">
            {dateLabel.date}
          </div>
        )}

        <div
          className={`inline-block px-4 py-2 rounded-2xl break-words text-sm ${
            isMine
              ? "bg-blue-600 text-white rounded-br-none" // propio: azul
              : "bg-gray-100 text-gray-800 rounded-bl-none" // otro: gris
          }`}
        >
          <div className="whitespace-pre-wrap">{message.mensaje}</div>
        </div>

        {dateLabel.time && (
          <div className={`mt-1 text-[11px] ${isMine ? "text-right text-gray-200" : "text-left text-gray-400"}`}>
            {dateLabel.time}
          </div>
        )}
      </div>
    </div>
  );
}