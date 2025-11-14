// components/Header.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { Bell } from "lucide-react";
import api from "@/lib/api";

const LINKS = [
  { href: "/", label: "Inicio" },
  { href: "/publications/publications_view", label: "Publicaciones" },
  { href: "/publications/publications_own", label: "Mis Publicaciones" },
  { href: "/chat", label: "Mis Chats" },
  { href: "/forum", label: "Foro" },
];

const NOTIFICATIONS = [
  {
    id: 1,
    title: "Nueva postulación",
    description: "Camila Duarte aplicó a tu publicación de Diseñador UX.",
    time: "Hace 15 minutos",
    read: false,
  },
  {
    id: 2,
    title: "Mensaje recibido",
    description: "Revisa el chat con Alejandro Flores para coordinar la entrevista.",
    time: "Hace 1 hora",
    read: false,
  },
  {
    id: 3,
    title: "Publicación destacada",
    description: "Tu oferta de Desarrollador Frontend fue destacada por buen desempeño.",
    time: "Hace 1 día",
    read: true,
  },
];

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [animatingItems, setAnimatingItems] = useState(false);
  const [animatingNotifications, setAnimatingNotifications] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);

  const isActive = (href: string) =>
    pathname === href || pathname?.startsWith(href + "/");

  const logout = async () => {
    try {
      setSigningOut(true);
      if (typeof window !== "undefined") localStorage.removeItem("uid");
      await api.post("/auth/logout").catch(() => {});
    } finally {
      setSigningOut(false);
      router.push("/auth/homepublic");
      router.refresh();
    }
  };

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }

      if (
        notificationsRef.current &&
        !notificationsRef.current.contains(event.target as Node)
      ) {
        setNotificationsOpen(false);
      }
    };

    if (dropdownOpen || notificationsOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownOpen, notificationsOpen]);

  // Activar animación cuando se abre el dropdown
  useEffect(() => {
    if (dropdownOpen) {
      setAnimatingItems(false);
      const timer = setTimeout(() => setAnimatingItems(true), 10);
      return () => clearTimeout(timer);
    } else {
      setAnimatingItems(false);
    }
  }, [dropdownOpen]);

  useEffect(() => {
    if (notificationsOpen) {
      setAnimatingNotifications(false);
      const timer = setTimeout(() => setAnimatingNotifications(true), 10);
      return () => clearTimeout(timer);
    }

    setAnimatingNotifications(false);
  }, [notificationsOpen]);

  const unreadNotifications = NOTIFICATIONS.filter(
    (notification) => !notification.read
  ).length;

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6">
        <div className="grid grid-cols-[auto_1fr_auto] items-center h-16">
          {/* Izquierda: Logo + nombre */}
          <div className="flex items-center gap-2 justify-self-start">
            <img
              src="/JobMatch.png"
              alt="JobMatch Logo"
              className="h-16 w-16"
            />
            <span className="text-2xl font-bold text-blue-600">JobMatch</span>
          </div>

          {/* Centro: Nav */}
          <nav className="hidden md:flex justify-center items-center gap-8">
            {LINKS.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                aria-current={isActive(href) ? "page" : undefined}
                className={[
                  "text-sm font-medium transition-colors duration-200",
                  isActive(href)
                    ? "text-blue-600"
                    : "text-gray-700 hover:text-blue-600",
                ].join(" ")}
              >
                {label}
              </Link>
            ))}
          </nav>

          {/* Derecha: Notificaciones + Avatar con dropdown */}
          <div className="justify-self-end flex items-center gap-4">
            <div className="relative z-[999]" ref={notificationsRef}>
              <button
                onClick={() => {
                  setNotificationsOpen((prev) => !prev);
                  setDropdownOpen(false);
                }}
                aria-label="Notificaciones"
                title="Ver notificaciones"
                className="relative flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white shadow-sm transition-colors duration-200 hover:border-blue-200 hover:text-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                type="button"
              >
                <Bell className="h-5 w-5 text-gray-600" aria-hidden="true" />
                {unreadNotifications > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-red-500 px-1 text-xs font-semibold text-white shadow-sm">
                    {unreadNotifications}
                  </span>
                )}
              </button>

              {notificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 max-w-sm overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg z-70">
                  <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
                    <p className="text-sm font-semibold text-gray-900">
                      Notificaciones
                    </p>
                    <span className="text-xs font-medium uppercase text-gray-400">
                      {unreadNotifications} nuevas
                    </span>
                  </div>
                  <ul className="max-h-80 divide-y divide-gray-100 overflow-y-auto">
                    {NOTIFICATIONS.map((notification, index) => (
                      <li
                        key={notification.id}
                        style={{
                          opacity: animatingNotifications ? 1 : 0,
                          transform: animatingNotifications
                            ? "translateY(0)"
                            : "translateY(-8px)",
                          transition: "opacity 0.3s ease, transform 0.3s ease",
                          transitionDelay: `${index * 60}ms`,
                        }}
                        className="bg-white px-4 py-3 transition-colors duration-200 hover:bg-blue-50"
                      >
                        <p className="text-sm font-semibold text-gray-900">
                          {notification.title}
                        </p>
                        <p className="mt-1 text-sm text-gray-600">
                          {notification.description}
                        </p>
                        <p className="mt-2 text-xs font-medium uppercase tracking-wide text-gray-400">
                          {notification.time}
                        </p>
                      </li>
                    ))}
                    {NOTIFICATIONS.length === 0 && (
                      <li className="px-4 py-6 text-center text-sm text-gray-500">
                        No tienes notificaciones pendientes.
                      </li>
                    )}
                  </ul>
                  <button
                    type="button"
                    className="w-full bg-gray-50 px-4 py-2 text-center text-sm font-medium text-blue-600 transition-colors duration-200 hover:bg-blue-50"
                    onClick={() => {
                      setNotificationsOpen(false);
                      router.push("/notifications");
                    }}
                  >
                    Ver todas las notificaciones
                  </button>
                </div>
              )}
            </div>

            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                aria-label="Menú de usuario"
                title="Abrir menú"
                className="group relative inline-block h-10 w-10 rounded-full p-[2px]
                           bg-gradient-to-tr from-blue-600 via-cyan-400 to-purple-500
                           transition-transform duration-200 hover:scale-105
                           focus-visible:outline-none focus-visible:ring-2
                           focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                type="button"
              >
              <span
                className="pointer-events-none absolute inset-0 rounded-full blur-[6px]
                           opacity-40 group-hover:opacity-70
                           bg-gradient-to-tr from-blue-600/40 via-cyan-400/40 to-purple-500/40"
                aria-hidden="true"
              />
              <span className="relative block h-full w-full rounded-full overflow-hidden bg-white ring-1 ring-black/5">
                <Image
                  src="/avatar.png"
                  alt="Foto de perfil"
                  fill
                  sizes="40px"
                  className="object-cover"
                  priority
                />
              </span>
              <span
                className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-white"
                aria-hidden="true"
              />
            </button>

            {/* Dropdown menu */}
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                <Link
                  href="/profile"
                  onClick={() => setDropdownOpen(false)}
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-blue-600 transition-colors duration-200"
                  style={{
                    opacity: animatingItems ? 1 : 0,
                    transform: animatingItems
                      ? "translateY(0)"
                      : "translateY(-10px)",
                    transition: "opacity 0.3s ease, transform 0.3s ease",
                    transitionDelay: "0ms",
                  }}
                >
                  Ver perfil
                </Link>
                <button
                  type="button"
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-blue-600 transition-colors duration-200"
                  style={{
                    opacity: animatingItems ? 1 : 0,
                    transform: animatingItems
                      ? "translateY(0)"
                      : "translateY(-10px)",
                    transition: "opacity 0.3s ease, transform 0.3s ease",
                    transitionDelay: "80ms",
                  }}
                >
                  Ayuda
                </button>
                <div
                  className="border-t border-gray-100 my-1"
                  style={{
                    opacity: animatingItems ? 1 : 0,
                    transition: "opacity 0.3s ease",
                    transitionDelay: "160ms",
                  }}
                ></div>
                <button
                  onClick={() => {
                    setDropdownOpen(false);
                    logout();
                  }}
                  disabled={signingOut}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-blue-600 disabled:opacity-60 transition-colors duration-200"
                  type="button"
                  style={{
                    opacity: animatingItems ? 1 : 0,
                    transform: animatingItems
                      ? "translateY(0)"
                      : "translateY(-10px)",
                    transition: "opacity 0.3s ease, transform 0.3s ease",
                    transitionDelay: "240ms",
                  }}
                >
                  Cerrar sesión
                </button>
              </div>
            )}
            </div>
          </div>
        </div>

        {/* Mobile nav */}
        <div className="md:hidden border-t border-gray-200 py-2">
          <nav className="flex justify-center flex-wrap gap-4">
            {LINKS.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                aria-current={isActive(href) ? "page" : undefined}
                className={[
                  "text-xs font-medium transition-colors duration-200",
                  isActive(href)
                    ? "text-blue-600"
                    : "text-gray-700 hover:text-blue-600",
                ].join(" ")}
              >
                {label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
}

