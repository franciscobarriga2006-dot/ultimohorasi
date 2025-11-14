// app/auth/layout.tsx
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="auth-layout">
      {/* Este div envuelve el contenido sin Header/Footer */}
      {children}
    </div>
  );
}
