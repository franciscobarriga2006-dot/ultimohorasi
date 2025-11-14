// app/publications/publications-view/layout.tsx
import "../../globals.css";

export default function PublicationsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <main className="min-h-screen">{children}</main>;
}
