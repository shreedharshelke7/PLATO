import type { Metadata, Viewport } from "next";
import { Cinzel, Inter } from "next/font/google";
import "./globals.css";

const cinzel = Cinzel({
  subsets: ["latin"],
  variable: "--font-cinzel",
  display: "swap",
  weight: ["400", "600", "700", "800", "900"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "PLATO | Ambrosia — Fuel Like a God",
  description:
    "AI-powered nutrition, smart hydration, and Divine Swaps for mortals and Olympians. Track macros, scan Indian and global meals, and master your junk budget.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Ambrosia",
  },
  icons: {
    icon: "/icon.png",
    apple: "/apple-icon.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#c89b3c",
};

import { ServiceWorkerRegister } from "@/components/pwa/ServiceWorkerRegister";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${cinzel.variable} ${inter.variable}`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var stored = localStorage.getItem('ambrosia_theme');
                  var theme = stored || 'auto';
                  if (theme === 'auto') {
                    var hour = new Date().getHours();
                    if (hour >= 6 && hour < 17) theme = 'olympus';
                    else if (hour >= 17 && hour < 20) theme = 'athena';
                    else theme = 'nyx';
                  }
                  document.documentElement.setAttribute('data-theme', theme);
                } catch (e) {
                  document.documentElement.setAttribute('data-theme', 'olympus');
                }
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-screen bg-bg-base text-text-primary antialiased selection:bg-accent-gold/20 selection:text-accent-gold">
        <ServiceWorkerRegister />
        {children}
      </body>
    </html>
  );
}
