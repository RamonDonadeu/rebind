import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ReBind — Digital Pokémon TCG Binders",
  description: "Organize your Pokémon card collections in digital binders.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
