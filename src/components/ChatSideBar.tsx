"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ContactCardItem } from "./ContactCard";
import api from "@/lib/api";
import { connectSocket, getSocket } from "@/lib/socket";

type ChatPreview = {
  id_chat: number;
  peer_id: number;
  name: string;
  lastMessage: string;
  fecha: string;
  avatarBg?: string;
};

const sortByFechaDesc = (arr: ChatPreview[]) =>
  [...arr].sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());

const BLOCKS_KEY = "chat_blocked_ids";
type AlertState = { type: "block" | "report"; name: string } | null;

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

export default function ChatSideBar({
  onSelectChat,
}: {
  onSelectChat?: (chat: { id: number; name: string; peerId: number }) => void;
}) {
  const [chats, setChats] = useState<ChatPreview[]>([]);
  const [selectedChatId, setSelectedChatId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [blocked, setBlocked] = useState<number[]>([]);
  const [alert, setAlert] = useState<AlertState>(null);

  const loadBlocks = () => { try { return JSON.parse(localStorage.getItem(BLOCKS_KEY) || "[]") as number[]; } catch { return []; } };
  const saveBlocks = (ids: number[]) => { try { localStorage.setItem(BLOCKS_KEY, JSON.stringify(ids)); } catch {} };

  // Carga inicial y unión a salas
  useEffect(() => {
    const fetchChats = async () => {
      try {
        const uid = Number(localStorage.getItem("uid") || localStorage.getItem("userId") || 0);
        const { data } = await api.get("/chats", { params: { userId: uid } });

        const mapped: ChatPreview[] = (data?.items ?? []).map((it: any) => ({
          id_chat: it.id_chat,
          peer_id: it.peer_id,               
          name: it.name,
          lastMessage: it.lastMessage || "",
          fecha: it.fecha,
          avatarBg: colorFromSeed(it.id_chat || it.name),
        }));
        setChats(sortByFechaDesc(mapped));

        const s = connectSocket();
        mapped.forEach((c) => s.emit("chat:join", { chatId: c.id_chat }, () => {}));
      } catch {
        setChats([]);
      } finally {
        setBlocked(loadBlocks());
      }
    };
    fetchChats();
  }, []);

  // Listener global de nuevos mensajes con cleanup correcto
  useEffect(() => {
    const s = connectSocket();
    const onNew = (m: any) => {
      if (!m?.id_chat) return;
      setChats(prev =>
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
    return () => { s.off("message:new", onNew); };
  }, []);

  useEffect(() => { saveBlocks(blocked); }, [blocked]);

  // Eventos locales desde ChatWindow
  useEffect(() => {
    const onUpdated = (ev: Event) => {
      const { chatId, lastMessage, timestamp } = (ev as CustomEvent).detail || {};
      if (!chatId) return;
      setChats(prev => sortByFechaDesc(prev.map(p => p.id_chat === chatId ? { ...p, lastMessage, fecha: timestamp } : p)));
    };
    const onBlock = (ev: Event) => {
      const { chatId, name } = (ev as CustomEvent).detail || {};
      if (!chatId) return;
      setBlocked(prev => prev.includes(chatId) ? prev : [...prev, chatId]);
      setAlert({ type: "block", name: name || "" });
    };
    window.addEventListener("chatUpdated", onUpdated as EventListener);
    window.addEventListener("blockUser", onBlock as EventListener);
    return () => {
      window.removeEventListener("chatUpdated", onUpdated as EventListener);
      window.removeEventListener("blockUser", onBlock as EventListener);
    };
  }, []);

  const isBlocked = (id: number) => blocked.includes(id);

  const filtered = chats.filter(c => {
    const s = searchTerm.trim().toLowerCase();
    if (!s) return true;
    return c.name.toLowerCase().includes(s) || c.lastMessage.toLowerCase().includes(s);
  });

  const handleSelect = (id?: number | string) => {
    if (!id) return;
    const numeric = typeof id === "number" ? id : parseInt(String(id), 10);
    if (isBlocked(numeric)) {
      setAlert({ type: "block", name: chats.find(x => x.id_chat === numeric)?.name || "" });
      return;
    }
    setSelectedChatId(numeric);
    const sel = chats.find(c => c.id_chat === numeric);
    if (sel && onSelectChat) onSelectChat({ id: numeric, name: sel.name, peerId: sel.peer_id });
  };

  const handleBlock = (c: ChatPreview) => {
    if (isBlocked(c.id_chat)) return;
    setBlocked(prev => [...prev, c.id_chat]);
    setAlert({ type: "block", name: c.name });
  };

  useEffect(() => {
    if (!alert) return;
    const t = setTimeout(() => setAlert(null), 2200);
    return () => clearTimeout(t);
  }, [alert]);

  return (
    <motion.aside
      initial={{ x: -50, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="w-96 h-full bg-gray-50 border-r border-gray-200 flex flex-col"
    >
      <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2, duration: 0.4 }} className="px-5 py-4 border-b border-gray-200 bg-white">
        <div className="mb-3 flex items-center justify-between">
          <motion.h2 initial={{ scale: 0.9 }} animate={{ scale: 1 }} transition={{ delay: 0.3, duration: 0.2 }} className="text-lg font-semibold text-gray-800">Mensajes</motion.h2>
          <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="text-xs text-gray-500">
            {blocked.length} bloqueado{blocked.length === 1 ? "" : "s"}
          </motion.span>
        </div>

        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3, duration: 0.4 }} className="relative">
          <input
            type="text"
            placeholder="Buscar chat o mensaje..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 pr-10 rounded-full bg-gray-100 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          />
          <svg className="w-5 h-5 absolute right-3 top-2.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </motion.div>

        {alert && (
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }} transition={{ duration: 0.2 }}
            className={`mt-3 text-sm rounded-md px-3 py-2 border ${alert.type === "block" ? "bg-red-50 text-red-700 border-red-200" : "bg-amber-50 text-amber-700 border-amber-200"}`}>
            {alert.type === "block" ? `Usuario bloqueado: ${alert.name}` : `Reporte enviado: ${alert.name}`}
          </motion.div>
        )}
      </motion.div>

      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
        <div className="space-y-0">
          {filtered.map((c) => {
            const blockedFlag = isBlocked(c.id_chat);
            return (
              <div key={c.id_chat} className="relative group">
                {selectedChatId === c.id_chat && <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600 z-10" />}
                {blockedFlag && (
                  <span className="absolute right-3 top-2 z-10 rounded-full bg-gray-200 text-gray-700 text-[10px] px-2 py-0.5 uppercase tracking-wide">Bloqueado</span>
                )}
                <ContactCardItem
                  id={c.id_chat}
                  name={c.name}
                  lastMessage={c.lastMessage}
                  fecha={c.fecha}
                  avatarBg={c.avatarBg}
                  onClick={handleSelect}
                  className={(selectedChatId === c.id_chat ? "bg-blue-50 hover:bg-blue-50 " : "bg-white hover:bg-gray-50 ") + (blockedFlag ? "opacity-60 pointer-events-none select-none" : "")}
                />
                <div className="absolute right-3 bottom-2 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    type="button"
                    disabled={blockedFlag}
                    onClick={() => handleBlock(c)}
                    className={
                      "inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-medium shadow-sm " +
                      (blockedFlag
                        ? "border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed"
                        : "border-red-200 bg-red-50 text-red-600 hover:border-red-300 hover:bg-red-100")
                    }
                    title={blockedFlag ? "Usuario bloqueado" : "Bloquear usuario"}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="h-3.5 w-3.5">
                      <circle cx="12" cy="12" r="9" /><path d="M8.5 8.5l7 7" />
                    </svg>
                    {blockedFlag ? "Bloqueado" : "Bloquear"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </motion.aside>
  );
}
