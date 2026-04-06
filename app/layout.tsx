import type { Metadata } from "next";
import { Inter, Outfit, Quicksand } from "next/font/google";
import "./globals.css";

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter",
});

const outfit = Outfit({ 
  subsets: ["latin"],
  variable: "--font-outfit",
});

const quicksand = Quicksand({ 
  subsets: ["latin"],
  variable: "--font-quicksand",
});

export const metadata: Metadata = {
  title: "BJJ Tournament Manager",
  description: "Sistema de gerenciamento de campeonatos de Jiu-Jitsu",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-br"
      // ⚠️ Corrigido: Agora usando as variáveis corretas das fontes arredondadas
      className={`${inter.variable} ${outfit.variable} ${quicksand.variable} dark h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-zinc-950 text-white font-sans">
        {children}
      </body>
    </html>
  );
}