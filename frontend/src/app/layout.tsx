import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import AppShell from "@/components/AppShell";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Garuda NMS — Unified Network Operations",
  description: "Next-gen enterprise network monitoring and operations cloud",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const t = localStorage.getItem('garuda-theme');
                if (t === 'dark') {
                  document.documentElement.classList.add('dark');
                } else if (t === 'light') {
                  document.documentElement.classList.remove('dark');
                }

                // Synchronize auth cookie from localStorage so SSR and Next.js middleware recognize active session
                const token = localStorage.getItem('garuda_auth_token');
                const userStr = localStorage.getItem('garuda_auth_user');
                if ((token || userStr) && !document.cookie.includes('garuda_auth_token=')) {
                  const val = token || 'authenticated-session';
                  document.cookie = 'garuda_auth_token=' + encodeURIComponent(val) + '; path=/; max-age=604800; SameSite=Lax';
                }

                // Synchronize last visited route cookie so refresh and root landing persist current page
                const lastRoute = localStorage.getItem('garuda_last_route');
                if (lastRoute && !document.cookie.includes('garuda_last_route=')) {
                  document.cookie = 'garuda_last_route=' + encodeURIComponent(lastRoute) + '; path=/; max-age=604800; SameSite=Lax';
                }
              } catch (_) {}
            `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-white dark:bg-[#070e19] text-slate-800 dark:text-slate-100 transition-colors">
        <AppShell>{children}</AppShell>
        <Toaster
          position="top-right"
          theme="light"
          richColors
          closeButton
          toastOptions={{
            style: {
              background: "#ffffff",
              borderColor: "#e2e8f0",
              color: "#0f172a",
              boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.12), 0 8px 10px -6px rgba(0, 0, 0, 0.08)",
            },
          }}
        />
      </body>
    </html>
  );
}
