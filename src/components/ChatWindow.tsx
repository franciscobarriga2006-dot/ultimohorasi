// ChatWindow.tsx
"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { fadeInUp, slideIn } from "./animations";
import api from "@/lib/api";
import InputMessage from "@/components/InputMessage";
import { connectSocket, getSocket } from "@/lib/socket";

type Message = { id: string; from: "me" | "them"; text: string; fecha: string };

export default function ChatWindow({
  selected,
}: {
  selected: { id: number; name: string; peerId: number } | null;
}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const storageKey = useMemo(() => (selected ? `chat_messages_${selected.id}` : ""), [selected]);

  const persist = (arr: Message[]) => { try { localStorage.setItem(storageKey, JSON.stringify(arr)); } catch {} };

  useEffect(() => { connectSocket(); }, []);

  // join + historial
  useEffect(() => {
    if (!selected) { setMessages([]); return; }

    const s = getSocket();
    s?.emit("chat:join", { chatId: selected.id }, (ack: any) => {
      if (!ack?.ok) console.warn("chat:join error:", ack?.error);
    });

    const uid = Number(localStorage.getItem("uid") || localStorage.getItem("userId") || 0);

    (async () => {
      setLoading(true); setErr(null);
      try {
        const { data } = await api.get(`/chats/${selected.id}/mensajes`, { params: { limit: 50, offset: 0 } });
        const mapped: Message[] = (data?.items ?? []).map((m: any) => ({
          id: String(m.id ?? m.id_mensaje),
          from: m.id_usuariotx === uid ? "me" : "them",
          text: m.mensaje ?? "",
          fecha: m.fecha || new Date().toISOString(),
        }));
        mapped.sort((a,b)=>new Date(a.fecha).getTime()-new Date(b.fecha).getTime());
        setMessages(mapped);
        persist(mapped);
      } catch (e: any) {
        setErr(e?.message || "Error al cargar mensajes");
        try { setMessages(JSON.parse(localStorage.getItem(storageKey) || "[]")); } catch { setMessages([]); }
      } finally {
        setLoading(false);
      }
    })();
  }, [selected, storageKey]);

  // realtime + reconciliación por client_id
  useEffect(() => {
    const s = getSocket();
    if (!s) return;
    const uid = Number(localStorage.getItem("uid") || localStorage.getItem("userId") || 0);

    const onNew = (m: any) => {
      if (!selected || m.id_chat !== selected.id) return;

      const incoming: Message = {
        id: String(m.id_mensaje ?? m.id ?? crypto.randomUUID()),
        from: m.id_usuariotx === uid ? "me" : "them",
        text: m.mensaje ?? "",
        fecha: m.fecha || new Date().toISOString(),
      };

      setMessages(prev => {
        // 1) si viene client_id, reemplaza el tmp
        if (m.client_id) {
          const idx = prev.findIndex(x => x.id === `tmp:${m.client_id}`);
          if (idx !== -1) {
            const next = [...prev];
            next[idx] = incoming; // reemplaza por el real
            persist(next);
            return next;
          }
        }
        // 2) dedupe por id
        if (prev.some(p => p.id === incoming.id)) return prev;

        const next = [...prev, incoming];
        persist(next);
        return next;
      });
    };

    s.on("message:new", onNew);
    return () => { s.off("message:new", onNew); };
  }, [selected, storageKey]);

  // autoscroll
  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (t: string) => {
    if (!selected) return;
    const uid = Number(localStorage.getItem("uid") || localStorage.getItem("userId") || 0);
    const client_id = crypto.randomUUID();

    // optimista
    const tmp: Message = { id: `tmp:${client_id}`, from: "me", text: t, fecha: new Date().toISOString() };
    setMessages(prev => { const next = [...prev, tmp]; persist(next); return next; });

    // NO uses window.dispatchEvent aquí. El Sidebar se actualiza por socket.

    await api.post("/mensajes", {
      chatId: selected.id,
      from: uid,
      to: selected.peerId,
      body: t,
      client_id,
    }).catch(() => {
      // rollback optimista
      setMessages(prev => {
        const next = prev.filter(m => m.id !== `tmp:${client_id}`);
        persist(next);
        return next;
      });
    });
  };

  const onBlock = () => {
    if (!selected) return;
    window.dispatchEvent(new CustomEvent("blockUser", { detail: { chatId: selected.id, name: selected.name } }));
  };

  const onReport = () => {
    if (!selected) return;
    const payload = { id_usuario: 1, id_reportado: selected.id, fecha: new Date().toISOString() };
    try {
      const raw = localStorage.getItem("chat_reports");
      const arr = raw ? JSON.parse(raw) : [];
      arr.push(payload);
      localStorage.setItem("chat_reports", JSON.stringify(arr));
    } catch {}
    alert(`Reporte enviado: ${selected.name}`);
  };

  return (
    <AnimatePresence mode="wait">
      {!selected ? (
        <motion.section key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 h-full grid place-items-center bg-white">
          <motion.p variants={fadeInUp} initial="hidden" animate="visible" className="text-gray-500">Selecciona una conversación</motion.p>
        </motion.section>
      ) : (
        <motion.section key="chat" variants={slideIn} initial="hidden" animate="visible" className="flex-1 h-full flex flex-col bg-white">
          <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200">
            <h3 className="font-semibold text-gray-900">{selected.name}</h3>
            <div className="flex items-center gap-2">
              <button type="button" onClick={onBlock} className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-4 py-1.5 text-sm font-medium text-red-600 shadow-sm hover:border-red-300 hover:bg-red-100">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="h-4 w-4"><circle cx="12" cy="12" r="9" /><path d="M8.5 8.5l7 7" /></svg>
                Bloquear
              </button>
              <button type="button" onClick={onReport} className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-4 py-1.5 text-sm font-medium text-amber-600 shadow-sm hover:border-amber-300 hover:bg-amber-100">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="h-4 w-4"><path d="M12 9v4m0 4h.01" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 3l9 18H3L12 3z" /></svg>
                Reportar
              </button>
            </div>
          </div>

          <motion.div ref={listRef} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="flex-1 overflow-y-auto p-4 space-y-3">
            {loading && <div className="text-xs text-gray-400">Cargando…</div>}
            {err && <div className="text-xs text-red-600">{err}</div>}
            {messages.map(m => (
              <div key={m.id} className={`flex ${m.from === "me" ? "justify-end" : "justify-start"}`}>
                <div className={`${m.from === "me" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-800"} rounded-2xl px-3 py-2 max-w-[75%]`}>
                  <div className="text-sm">{m.text}</div>
                  <div className={`mt-1 text-[10px] ${m.from === "me" ? "text-white/70" : "text-gray-500"}`}>
                    {new Date(m.fecha).toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit" })}
                  </div>
                </div>
              </div>
            ))}
          </motion.div>

          <div className="p-3 border-t border-gray-200">
            <InputMessage placeholder="Escribe un mensaje…" onSend={sendMessage} />
          </div>
        </motion.section>
      )}
    </AnimatePresence>
  );
}
