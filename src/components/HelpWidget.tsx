"use client";
import React, { createContext, useContext, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { fadeInUp, slideIn } from "./animations";

type Step = {
  title?: string;
  content: React.ReactNode;
};

type HelpContextType = {
  register: (steps: Step[]) => void;
  unregister: () => void;
};

const HelpContext = createContext<HelpContextType | null>(null);

export const useHelp = () => {
  const ctx = useContext(HelpContext);
  if (!ctx) throw new Error("useHelp must be used within HelpProvider");
  return ctx;
};

export function HelpProvider({ children }: { children: React.ReactNode }) {
  const [steps, setSteps] = useState<Step[] | null>(null);
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);

  const register = useCallback((s: Step[]) => {
    setSteps(s);
    setIndex(0);
  }, []);

  const unregister = useCallback(() => {
    setSteps(null);
    setIndex(0);
  }, []);

  return (
    <HelpContext.Provider value={{ register, unregister }}>
      {children}

      {/* Floating help button */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          style={{
            position: "fixed",
            right: 20,
            bottom: 20,
            zIndex: 9999,
          }}
        >
          <button
            onClick={() => setOpen(true)}
            aria-label="Como funciona"
            type="button"
            style={{
              background: "#0ea5e9",
              color: "white",
              borderRadius: 9999,
              padding: "14px 18px", /* más espacio en eje Y */
              boxShadow: "0 8px 24px rgba(2,6,23,0.22)",
              fontWeight: 700,
              border: "none",
              cursor: "pointer",
              fontSize: 15,
              lineHeight: "20px",
            }}
          >
            ¿Cómo funciona?
          </button>
        </motion.div>

      {/* Modal */}
        {open && (
          <motion.div
            role="dialog"
            aria-modal="true"
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            style={{
              position: "fixed",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "rgba(0,0,0,0.45)",
              zIndex: 99999,
              padding: 20,
            }}
            onClick={() => {
              /* click on backdrop closes */
              setOpen(false);
            }}
          >
            <motion.div
              onClick={(e) => e.stopPropagation()}
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
              style={{
                background: "white",
                width: "min(760px, 95%)",
                maxHeight: "82vh",
                overflow: "auto",
                borderRadius: 12,
                padding: 24,
                position: "relative",
              }}
            >
            {/* Close X */}
            <button
              aria-label="Cerrar ayuda"
              onClick={() => setOpen(false)}
              style={{
                position: "absolute",
                right: 12,
                top: 12,
                border: "none",
                background: "transparent",
                fontSize: 18,
                cursor: "pointer",
              }}
            >
              ✕
            </button>

            {/* Content */}
            <div style={{ paddingTop: 12, paddingBottom: 44, overflow: 'hidden' }}>
              <AnimatePresence mode="wait">
                <motion.div
                  key={index}
                  initial={{ x: 300, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -300, opacity: 0 }}
                  transition={{
                    duration: 0.2,
                    ease: "easeOut"
                  }}
                >
                  <h3 style={{ margin: 0, marginBottom: 10, fontSize: 20, lineHeight: "1.3" }}>
                    {steps && steps[index] && steps[index].title
                      ? steps[index].title
                      : "Cómo funciona esta página"}
                  </h3>
                  <div style={{ color: "#374151", fontSize: 16, lineHeight: "1.7" }}>
                    {steps && steps[index] ? (
                      <div style={{ marginBottom: 12 }}>{steps[index].content}</div>
                    ) : (
                      <div>
                        <p style={{ marginBottom: 0 }}>Esta página no tiene una guía específica.</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Footer navigation */}
            <div
              style={{
                position: "absolute",
                left: 28,
                right: 28,
                bottom: 24,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <motion.button
                  onClick={() => setIndex((i) => Math.max(0, i - 1))}
                  disabled={!steps || index <= 0}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  style={{
                    background: "#0ea5e9",
                    border: "none",
                    width: 44,
                    height: 44,
                    borderRadius: "50%",
                    cursor: index <= 0 ? "not-allowed" : "pointer",
                    opacity: index <= 0 ? 0.5 : 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <motion.svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    animate={{ x: [-2, 0, -2] }}
                    transition={{
                      repeat: Infinity,
                      duration: 1.5,
                      ease: "easeInOut",
                    }}
                    style={{
                      color: "white",
                      opacity: index <= 0 ? 0.5 : 0.85,
                    }}
                  >
                    <path
                      d="M15 18l-6-6 6-6"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </motion.svg>
                </motion.button>
              </div>

              <div style={{ display: "flex", gap: 8 }}>
                <motion.button
                  onClick={() => {
                    if (!steps) return setOpen(false);
                    if (index >= steps.length - 1) return setOpen(false);
                    setIndex((i) => i + 1);
                  }}
                  disabled={!steps || index >= (steps?.length ?? 0) - 1}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  style={{
                    background: "#0ea5e9",
                    border: "none",
                    width: 44,
                    height: 44,
                    borderRadius: "50%",
                    cursor: !steps || index >= (steps?.length ?? 0) - 1 ? "not-allowed" : "pointer",
                    opacity: !steps || index >= (steps?.length ?? 0) - 1 ? 0.5 : 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 6px 18px rgba(2,6,23,0.12)",
                  }}
                >
                  <motion.svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    animate={{ x: [2, 0, 2] }}
                    transition={{
                      repeat: Infinity,
                      duration: 1.5,
                      ease: "easeInOut",
                    }}
                    style={{
                      color: "white",
                      opacity: !steps || index >= (steps?.length ?? 0) - 1 ? 0.5 : 0.85,
                    }}
                  >
                    <path
                      d="M9 18l6-6-6-6"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </motion.svg>
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </HelpContext.Provider>
  );
}

export default HelpProvider;
