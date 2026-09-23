import type { Metadata, Viewport } from "next";
import { Atkinson_Hyperlegible } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { ptPT } from "@clerk/localizations";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

// Atkinson Hyperlegible: desenhada para leitura difícil. Ecrã ao sol conta.
const atkinson = Atkinson_Hyperlegible({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-atkinson",
});

export const metadata: Metadata = {
  title: "NegocioSocos",
  description: "Máquinas, festas, apuros e despesas.",
};

export const viewport: Viewport = {
  themeColor: "#1e293b",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider localization={ptPT}>
      <html lang="pt-PT" className={atkinson.variable}>
        <body className="min-h-dvh font-sans antialiased">
          {children}
          <Toaster position="top-center" richColors />
        </body>
      </html>
    </ClerkProvider>
  );
}
