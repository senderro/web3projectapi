// app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";

// Defina os metadados básicos da página
export const metadata: Metadata = {
  title: "Simple Next.js App",
  description: "A basic Next.js setup",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
