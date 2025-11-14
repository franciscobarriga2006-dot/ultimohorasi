// app/admin/layout.tsx  ← (segment layout, SIN <html>)
import React from "react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Admin · JobMatch" };

export default function AdminLayout({
  children,
}: { children: React.ReactNode }) {
  return <section className="min-h-screen">{children}</section>;
}
