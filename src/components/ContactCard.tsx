"use client";

import React, { useEffect, useState } from "react";
import api from "@/lib/api";
import { connectSocket } from "@/lib/socket";

/* =========================
   Tipos
   ========================= */
type ChatPreview = {
  id_chat: number;
  name: string;
  lastMessage: string;
  fecha: string;
  avatarBg?: string;
};

type ContactCardItemProps = {
  id?: number | string;
  name?: string;
  lastMessage?: string;
  fecha?: string; // ISO
  unread?: number;
  className?: string;
  onClick?: (id?: number | string) => void;
  avatarBg?: string;
};

/* =========================
   Paleta y utilidades
   ========================= */
const PALETTE = [
  "bg-blue-100 text-blue-700","bg-green-100 text-green-700","bg-purple-100 text-purple-700",
  "bg-pink-100 text-pink-700","bg-yellow-100 text-yellow-700","bg-indigo-100 text-indigo-700",
  "bg-red-100 text-red-700","bg-emerald-100 text-emerald-700","bg-cyan-100 text-cyan-700",
  "bg-lime-100 text-lime-700","bg-rose-100 text-rose-700","bg-violet-100 text-violet-700",
  "bg-teal-100 text-teal-700","bg-stone-100 text-stone-700","bg-orange-100 text-orange-700","bg-sky-100 text-sky-700"
];
const colorFromSeed = (seed: number | string) => {
  const n = typeof seed === "number" ? seed : Array.from(String(seed)).reduce((a, c) => a + c.charCodeAt(0), 0);
  return PALETTE[n % PALETTE.length];
};
const sortByFechaDesc = (arr: ChatPreview[]) =>
  [...arr].sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());

/* =========================
   ContactCardItem (export named)
   ========================= */
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
    try { return new Date(fecha).toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit" }); }
    catch { return ""; }
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
          <div className="text-sm font-semibold text-gray-900 truncate">{name}</div>
          <div className="text-xs text-gray-400 flex-shrink-0">{time}</div>
        </div>
        <div className="text-sm text-gray-600 truncate">
          {lastMessage}{unread ? ` • ${unread}` : ""}
        </div>
      </div>
    </button>
  );
}

/* =========================
   ContactCard (default export)
   ========================= */
export default function ContactCard({ count = 5, className = "" }: { count?: number; className?: string }) {
  const [items, setItems] = useState<ChatPreview[]>([]);

  useEffect(() => {
    let unsub: (() => void) | undefined;

    (async () => {
      try {
        const uid = Number(localStorage.getItem("uid") || localStorage.getItem("userId") || 0);
        const { data } = await api.get("/chats", { params: { userId: uid } });

        const mapped: ChatPreview[] = (data?.items ?? []).map((it: any) => ({
          id_chat: it.id_chat,
          name: it.name,
          lastMessage: it.lastMessage || "",
          fecha: it.fecha,
          avatarBg: colorFromSeed(it.id_chat || it.name),
        }));

        setItems(sortByFechaDesc(mapped));

        // Socket: unirse a salas y escuchar actualizaciones
        const s = connectSocket();
        mapped.forEach((c) => s.emit("chat:join", { chatId: c.id_chat }, () => {}));

        const onNew = (m: any) => {
          if (!m?.id_chat) return;
          setItems(prev =>
            sortByFechaDesc(
              prev.map(c =>
                c.id_chat === m.id_chat
                  ? { ...c, lastMessage: m.mensaje ?? c.lastMessage, fecha: m.fecha ?? c.fecha }
                  : c
              )
            )
          );
        };

        s.on("message:new", onNew);
        unsub = () => s.off("message:new", onNew);
      } catch {
        setItems([]);
      }
    })();

    return () => { unsub?.(); };
  }, []);

  return (
    <div className={`space-y-0 ${className}`} aria-hidden>
      {items.slice(0, count).map((m) => (
        <ContactCardItem
          key={m.id_chat}
          id={m.id_chat}
          name={m.name}
          lastMessage={m.lastMessage}
          fecha={m.fecha}
          avatarBg={m.avatarBg}
        />
      ))}
    </div>
  );
}
