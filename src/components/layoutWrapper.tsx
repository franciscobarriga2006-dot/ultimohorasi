// components/layout-wrapper.tsx
"use client";

import { usePathname } from "next/navigation";
import Header from "./header";
import HeaderAuth from "./header-auth";
import Footer from "./footer";

const AUTH_ROUTES = [
  "/auth/login",
  "/auth/register",
  "/auth/reset",
  "/auth/homepublic",
];

export default function LayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Verifica si estamos en una ruta de autenticación
  const isAuthRoute = AUTH_ROUTES.some((route) => pathname?.startsWith(route));

  if (isAuthRoute) {
    // Rutas de auth: HeaderAuth
    return (
      <>
        <HeaderAuth />
        {children}
        <Footer />
      </>
    );
  }

  // Rutas normales: Header + Footer
  return (
    <>
      <Header />
      {children}
      <Footer />
    </>
  );
}
