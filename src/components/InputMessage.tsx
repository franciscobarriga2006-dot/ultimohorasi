"use client";

import React, { useState } from "react";

type Props = {
  placeholder?: string;
  initialValue?: string;
  disabled?: boolean;
  sendLabel?: string;
  className?: string;
  onSend?: (text: string) => void | Promise<void>;
};

/**
 * InputMessage
 * - simple single-line input + send button (visual como la imagen)
 * - Enter envía (Shift+Enter permite salto si se cambia a textarea en el futuro)
 * - onSend puede ser async; el componente muestra estado de envío/deshabilita mientras
 */
export default function InputMessage({
  placeholder = "Escribe un mensaje...",
  initialValue = "",
  disabled = false,
  sendLabel = "Enviar",
  className = "",
  onSend,
}: Props) {
  const [value, setValue] = useState(initialValue);
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    const text = (value ?? "").trim();
    if (!text || disabled || sending) return;
    try {
      const res = onSend?.(text);
      if (res && typeof (res as Promise<void>).then === "function") {
        setSending(true);
        await res;
      }
      setValue("");
    } catch (e) {
      // no mostrar stack, solo permitir que el caller maneje errores
    } finally {
      setSending(false);
    }
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        disabled={disabled || sending}
        aria-label={placeholder}
        className="
          flex-1 rounded-full border border-gray-200 px-4 py-3 text-sm
          focus:outline-none focus:ring-2 focus:ring-blue-300
          disabled:opacity-60 disabled:cursor-not-allowed
        "
      />

      <button
        type="button"
        onClick={handleSend}
        disabled={disabled || sending || !value.trim()}
        className={`
          rounded-full px-4 py-2 text-sm font-medium text-white
          ${sending ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700"}
          disabled:opacity-60 disabled:cursor-not-allowed
        `}
        aria-label={sendLabel}
      >
        {sending ? "Enviando..." : sendLabel}
      </button>
    </div>
  );
}