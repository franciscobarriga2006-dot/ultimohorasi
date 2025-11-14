"use client";
import React, { useState, useRef, useLayoutEffect } from "react";
import { gsap } from "gsap";
import {
  User,
  Database,
  Clock,
  Star,
  History,
  Ban,
  ChevronsLeft,
  LayoutDashboard,
  ChevronDown,
  FileText,
  Users,
} from "lucide-react";

type NavItem = {
  id: string;
  label: string;
  icon: React.ElementType;
  children?: { id: string; label: string; icon: React.ElementType }[];
};

const items: NavItem[] = [
  { id: "personal", label: "Información", icon: User },
  { id: "datos", label: "Datos personales", icon: Database },
  {
    id: "panel",
    label: "Panel de Control",
    icon: LayoutDashboard,
    children: [
      { id: "publicaciones", label: "Publicaciones", icon: FileText },
      { id: "postulaciones", label: "Postulaciones", icon: Users },
    ],
  },
  { id: "pendientes", label: "Pendientes", icon: Clock },
  { id: "favoritos", label: "Favoritos", icon: Star },
  { id: "historial", label: "Historial", icon: History },
  { id: "bloqueados", label: "Bloqueados", icon: Ban },
];

export default function ProfileSidebar({
  className = "",
  activeSection,
  onSectionChange,
}: {
  className?: string;
  activeSection: string;
  onSectionChange: (section: string) => void;
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [expandedPanel, setExpandedPanel] = useState<string | null>(null);

  const sidebarRef = useRef<HTMLElement | null>(null);
  const titleRef = useRef<HTMLHeadingElement | null>(null);
  const toggleIconWrapperRef = useRef<HTMLSpanElement | null>(null);

  const navButtonRefs = useRef<HTMLButtonElement[]>([]);
  const navLabelRefs = useRef<HTMLSpanElement[]>([]);
  const subMenuRefs = useRef<HTMLDivElement[]>([]);

  navButtonRefs.current = [];
  navLabelRefs.current = [];
  subMenuRefs.current = [];

  const handleClick = (id: string, hasChildren: boolean) => {
    if (hasChildren) {
      setExpandedPanel(expandedPanel === id ? null : id);
    } else {
      onSectionChange(id);
    }
  };

  useLayoutEffect(() => {
    if (!sidebarRef.current) return;

    const expandedWidth = "16rem";
    const collapsedWidth = "5rem";

    gsap.set(sidebarRef.current, { width: collapsedWidth, autoAlpha: 1 });
    gsap.set(navLabelRefs.current, { autoAlpha: 0, x: 0 });
    gsap.set(navButtonRefs.current, { justifyContent: "center" });
    gsap.set(titleRef.current, { autoAlpha: 0 });
    gsap.set(toggleIconWrapperRef.current, { rotate: 180 });

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        defaults: { duration: 0.28, ease: "power3.inOut" },
      });

      tl.fromTo(
        sidebarRef.current,
        { x: -12, autoAlpha: 0 },
        { x: 0, autoAlpha: 1, duration: 0.22 }
      );

      if (isCollapsed) {
        tl.to(
          sidebarRef.current,
          { width: collapsedWidth, duration: 0.35 },
          "<"
        )
          .to(navLabelRefs.current, { autoAlpha: 0, stagger: 0.02 }, "<")
          .to(navButtonRefs.current, { justifyContent: "center" }, "<")
          .to(titleRef.current, { autoAlpha: 0 }, "<")
          .to(toggleIconWrapperRef.current, { rotate: 180 }, "<")
          .to(subMenuRefs.current, { height: 0, autoAlpha: 0 }, "<");
      } else {
        tl.to(sidebarRef.current, { width: expandedWidth, duration: 0.35 }, "<")
          .to(navButtonRefs.current, { justifyContent: "flex-start" }, "<")
          .to(toggleIconWrapperRef.current, { rotate: 0 }, "<")
          .to(titleRef.current, { autoAlpha: 1, delay: 0.02 }, "<")
          .to(
            navLabelRefs.current,
            { autoAlpha: 1, stagger: 0.02, delay: 0.05 },
            "<"
          );
      }
    }, sidebarRef);

    return () => ctx.revert();
  }, [isCollapsed]);

  // Animación de submenús
  useLayoutEffect(() => {
    subMenuRefs.current.forEach((subMenu, idx) => {
      if (!subMenu) return;
      const item = items.find((_, i) => i === idx);
      if (!item?.children) return;

      if (expandedPanel === item.id && !isCollapsed) {
        gsap.to(subMenu, {
          height: "auto",
          autoAlpha: 1,
          duration: 0.3,
          ease: "power2.out",
        });
      } else {
        gsap.to(subMenu, {
          height: 0,
          autoAlpha: 0,
          duration: 0.3,
          ease: "power2.in",
        });
      }
    });
  }, [expandedPanel, isCollapsed]);

  let buttonIndex = 0;
  let labelIndex = 0;
  let subMenuIndex = 0;

  return (
    <aside
      ref={sidebarRef}
      className={`h-screen bg-white shadow-xl flex flex-col ${className} overflow-hidden`}
      aria-label="Perfil navigation"
    >
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <h2
          ref={titleRef}
          className="text-lg font-semibold text-gray-800 whitespace-nowrap overflow-hidden"
        >
          Mi Perfil
        </h2>

        <button
          onClick={() => setIsCollapsed((s) => !s)}
          className="p-1 rounded-full text-gray-600 hover:bg-gray-100 transition-colors"
          title={isCollapsed ? "Expandir" : "Colapsar"}
        >
          <span ref={toggleIconWrapperRef} className="inline-flex">
            <ChevronsLeft className="w-6 h-6" />
          </span>
        </button>
      </div>

      <nav className="flex-1 p-4 overflow-y-auto">
        <ul className="flex flex-col gap-2">
          {items.map((it) => {
            const Icon = it.icon;
            const isActive = activeSection === it.id;
            const hasChildren = !!it.children;
            const isExpanded = expandedPanel === it.id;
            const currentButtonIndex = buttonIndex++;
            const currentLabelIndex = labelIndex++;
            const currentSubMenuIndex = subMenuIndex++;

            return (
              <li key={it.id}>
                <button
                  ref={(el) => {
                    if (!el) return;
                    navButtonRefs.current[currentButtonIndex] = el;
                  }}
                  className={`nav-button w-full flex items-center justify-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive || (hasChildren && isExpanded)
                      ? "bg-indigo-600 text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                  onClick={() => handleClick(it.id, hasChildren)}
                  aria-current={isActive}
                  title={it.label}
                >
                  <Icon className="w-5 h-5 shrink-0" />
                  <span
                    ref={(el) => {
                      if (!el) return;
                      navLabelRefs.current[currentLabelIndex] = el;
                    }}
                    className="nav-label whitespace-nowrap overflow-hidden flex-1 text-left"
                  >
                    {it.label}
                  </span>
                  {hasChildren && !isCollapsed && (
                    <ChevronDown
                      className={`w-4 h-4 shrink-0 transition-transform ${
                        isExpanded ? "rotate-180" : ""
                      }`}
                    />
                  )}
                </button>

                {/* Submenú */}
                {hasChildren && (
                  <div
                    ref={(el) => {
                      if (!el) return;
                      subMenuRefs.current[currentSubMenuIndex] = el;
                    }}
                    className="overflow-hidden"
                    style={{ height: 0, opacity: 0 }}
                  >
                    <ul className="mt-1 ml-4 space-y-1 border-l-2 border-gray-200 pl-3">
                      {it.children?.map((child) => {
                        const ChildIcon = child.icon;
                        const isChildActive = activeSection === child.id;

                        return (
                          <li key={child.id}>
                            <button
                              onClick={() => onSectionChange(child.id)}
                              className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                                isChildActive
                                  ? "bg-indigo-50 text-indigo-700"
                                  : "text-gray-600 hover:bg-gray-50"
                              }`}
                              title={child.label}
                            >
                              <ChildIcon className="w-4 h-4 shrink-0" />
                              <span className="whitespace-nowrap overflow-hidden">
                                {child.label}
                              </span>
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
