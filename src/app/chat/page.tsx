"use client";

import React, { useState, useEffect } from "react";
import ChatSideBar from "@/components/ChatSideBar";
import ChatWindow from "@/components/ChatWindow";
import { motion } from "framer-motion";
import { staggerContainer } from "@/components/animations";
import {useHelp} from "@/components/HelpWidget"

export default function ChatPage() {
  const [selected, setSelected] = useState<{ id: number; name: string; peerId: number } | null>(null);
  const { register, unregister } = useHelp();

  useEffect(() => {
    register([
      {
        title: "Conversaciones activas",
        content: (
          <div>
            <p>
              Aquí puedes ver y acceder a todas las conversaciones que has iniciado o recibido a
              través de publicaciones dentro de JobMatch.
            </p>
            <p style={{ marginTop: 8 }}>
              Selecciona un chat desde el panel izquierdo para ver los mensajes.
            </p>
          </div>
        ),
      },
      {
        title: "Comunicación con otros usuarios",
        content: (
          <div>
            <p>
              Cada chat está asociado a una publicación o postulación, para que ambos puedan
              coordinarse fácilmente.
            </p>
            <p style={{ marginTop: 8 }}>
              Puedes enviar mensajes, consultar dudas y acordar detalles del trabajo.
            </p>
          </div>
        ),
      },
      {
        title: "Bloquear o Reportar",
        content: (
          <div>
            <p>
              Si un usuario se comporta de forma inadecuada o tienes algún inconveniente, puedes 
              bloquearlo o reportarlo desde la ventana del chat.
            </p>
            <p style={{ marginTop: 8 }}>
              JobMatch procura un ambiente seguro para todos los usuarios. Usa estas funciones
              cuando sea necesario.
            </p>
          </div>
        ),
      },
      {
        title: "Tips al usar el chat",
        content: (
          <div>
            <p>
              Mantén la comunicación clara y respetuosa para lograr una buena coordinación con la
              otra persona.
            </p>
            <p style={{ marginTop: 8 }}>
              Si necesitas ayuda adicional, siempre puedes volver a abrir esta guía con el botón
              de ayuda.
            </p>
          </div>
        ),
      },
    ]);

    return () => unregister();
  }, [register, unregister]);

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      className="min-h-screen bg-gray-100 p-6"
    >
      <motion.div 
        variants={staggerContainer}
        className="mx-auto w-full max-w-6xl h-[85vh] rounded-2xl shadow-sm bg-white flex overflow-hidden"
      >
        <ChatSideBar onSelectChat={(c) => setSelected(c)} />
        <ChatWindow selected={selected} />
      </motion.div>
    </motion.div>
  );
}
