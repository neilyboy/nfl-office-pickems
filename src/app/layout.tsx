export const dynamic = 'force-dynamic';
export const revalidate = 0;
import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { InstallPrompt } from "@/components/install-prompt";
import { NotificationManager } from '@/components/notification-manager';
import { ThemeProvider } from '@/contexts/theme-context';

export const metadata: Metadata = {
  title: "NFL Office Pickems",
  manifest: "/manifest.json",
  themeColor: "#3b82f6",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "NFL Pickems",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: '/icons/icon-192x192.svg',
    apple: '/icons/icon-192x192.svg',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#3b82f6",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.svg" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="NFL Pickems" />
        <meta name="theme-color" content="#3b82f6" />
      </head>
      <body className="font-sans">
        <ThemeProvider>
          <NotificationManager />
          {children}
          <Toaster />
          <InstallPrompt />
        </ThemeProvider>
      </body>
    </html>
  );
}
