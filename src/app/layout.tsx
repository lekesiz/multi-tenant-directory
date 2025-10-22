import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";
import ToastProvider from "@/components/ToastProvider";
import CookieBanner from "@/components/CookieBanner";
import { WebVitals } from "@/components/WebVitals";
import { PerformanceMonitor } from "@/components/PerformanceMonitor";
import ServiceWorkerRegistration from "@/components/ServiceWorkerRegistration";
import AnalyticsScripts from "@/components/AnalyticsScripts";
import BodyScripts from "@/components/BodyScripts";
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import type { Metadata } from 'next';

// Revalidate every 5 minutes for better performance
export const revalidate = 300;

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    template: '%s',
    default: 'Annuaire des Professionnels',
  },
  description: "Plateforme d'annuaire multi-domaines pour les entreprises locales",
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Haguenau.pro',
  },
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/icons/icon-192x192.svg', sizes: '192x192', type: 'image/svg+xml' },
      { url: '/icons/icon-512x512.svg', sizes: '512x512', type: 'image/svg+xml' },
    ],
    apple: [
      { url: '/apple-touch-icon.svg', type: 'image/svg+xml', sizes: '180x180' },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link rel="dns-prefetch" href="//maps.googleapis.com" />
        <link rel="dns-prefetch" href="//res.cloudinary.com" />
        <meta name="theme-color" content="#3B82F6" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <AnalyticsScripts />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <BodyScripts />
        <Providers>
          <ServiceWorkerRegistration />
          <WebVitals />
          <PerformanceMonitor />
          <ToastProvider />
          {children}
          <CookieBanner />
          <Analytics />
          <SpeedInsights />
        </Providers>
      </body>
    </html>
  );
}
