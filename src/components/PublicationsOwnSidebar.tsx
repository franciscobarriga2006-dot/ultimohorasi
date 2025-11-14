"use client";

import React, { useState, useRef, useLayoutEffect } from "react";
import { gsap } from "gsap";
import { FileText, Users, PlusCircle, ChevronsLeft } from "lucide-react";

type View = "mis-publicaciones" | "mis-postulaciones" | "crear-publicacion";

const items: { id: View; label: string; Icon: React.ElementType }[] = [
  { id: "mis-publicaciones", label: "Mis Publicaciones", Icon: FileText },
  { id: "mis-postulaciones", label: "Mis Postulaciones", Icon: Users },
  { id: "crear-publicacion", label: "Crear Publicación", Icon: PlusCircle },
];

export default function PublicationsOwnNavbar({
  className = "",
  activeView,
  onViewChange,
  defaultView = "mis-publicaciones",
}: {
  className?: string;
  activeView?: View;
  onViewChange?: (v: View) => void;
  defaultView?: View;
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [localActive, setLocalActive] = useState<View>(activeView ?? defaultView);

  // refs
  const sidebarRef = useRef<HTMLElement | null>(null);
  const titleRef = useRef<HTMLHeadingElement | null>(null);
  const toggleIconWrapperRef = useRef<HTMLSpanElement | null>(null);
  const navButtonRefs = useRef<HTMLButtonElement[]>([]);
  const navLabelRefs = useRef<HTMLSpanElement[]>([]);

  // keep refs fresh
  navButtonRefs.current = [];
  navLabelRefs.current = [];

  const handleClick = (id: View) => {
    setLocalActive(id);
    onViewChange?.(id);
  };

  useLayoutEffect(() => {
    if (!sidebarRef.current) return;

    const expandedWidth = "15rem";
    const collapsedWidth = "4.5rem";

    gsap.set(sidebarRef.current, { width: collapsedWidth, autoAlpha: 1 });
    gsap.set(navLabelRefs.current, { autoAlpha: 0, x: 0 });
    gsap.set(navButtonRefs.current, { justifyContent: "center" });
    gsap.set(titleRef.current, { autoAlpha: 0 });
    gsap.set(toggleIconWrapperRef.current, { rotate: 180 });

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { duration: 0.28, ease: "power3.inOut" } });

      tl.fromTo(sidebarRef.current, { x: -10, autoAlpha: 0 }, { x: 0, autoAlpha: 1, duration: 0.22 });

      if (isCollapsed) {
        tl.to(sidebarRef.current, { width: collapsedWidth, duration: 0.35 }, "<")
          .to(navLabelRefs.current, { autoAlpha: 0, stagger: 0.02 }, "<")
          .to(navButtonRefs.current, { justifyContent: "center" }, "<")
          .to(titleRef.current, { autoAlpha: 0 }, "<")
          .to(toggleIconWrapperRef.current, { rotate: 180 }, "<");
      } else {
        tl.to(sidebarRef.current, { width: expandedWidth, duration: 0.35 }, "<")
          .to(navButtonRefs.current, { justifyContent: "flex-start" }, "<")
          .to(toggleIconWrapperRef.current, { rotate: 0 }, "<")
          .to(titleRef.current, { autoAlpha: 1, delay: 0.02 }, "<")
          .to(navLabelRefs.current, { autoAlpha: 1, stagger: 0.02, delay: 0.05 }, "<");
      }
    }, sidebarRef);

    return () => ctx.revert();
  }, [isCollapsed]);

  // keep external activeView in sync if provided
  React.useEffect(() => {
    if (activeView) setLocalActive(activeView);
  }, [activeView]);

  return (
    <aside
      ref={sidebarRef}
      className={`h-full min-h-[calc(100vh-4rem)] bg-white shadow-xl flex flex-col ${className} overflow-hidden`}
      aria-label="Publicaciones sidebar"
    >
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <h2 ref={titleRef} className="text-lg font-semibold text-gray-800 whitespace-nowrap overflow-hidden">
          Publicaciones
        </h2>

        <button
          onClick={() => setIsCollapsed((s) => !s)}
          className="p-1 rounded-full text-gray-600 hover:bg-gray-100 transition-colors"
          title={isCollapsed ? "Expandir" : "Colapsar"}
        >
          <span ref={toggleIconWrapperRef} className="inline-flex">
            <ChevronsLeft className="w-5 h-5" />
          </span>
        </button>
      </div>

      <nav className="flex-1 p-3">
        <ul className="flex flex-col gap-2">
          {items.map((it, idx) => {
            const isActive = localActive === it.id;
            const Icon = it.Icon;
            return (
              <li key={it.id}>
                <button
                  ref={(el) => {
                    if (!el) return;
                    navButtonRefs.current[idx] = el;
                  }}
                  onClick={() => handleClick(it.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive ? "bg-blue-600 text-white" : "text-gray-700 hover:bg-gray-100"
                  }`}
                  aria-current={isActive ? "true" : undefined}
                  title={it.label}
                >
                  <span className="flex-shrink-0">
                    <Icon className="w-5 h-5" />
                  </span>
                  <span
                    ref={(el) => {
                      if (!el) return;
                      navLabelRefs.current[idx] = el;
                    }}
                    className="whitespace-nowrap overflow-hidden"
                  >
                    {it.label}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
