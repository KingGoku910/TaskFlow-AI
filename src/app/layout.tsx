import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import './globals.css';
import { cn } from '@/lib/utils';
import { Toaster } from "@/components/ui/toaster";
import Head from 'next/head';

export const metadata: Metadata = {
  title: 'TaskFlow AI',
  description: 'Transform ideas into actionable tasks.',
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <Head>
        <meta name="keywords" content="AI Solutions, Agency, Consultations, Software Development, Web Development, Web Design, George, Mossel Bay, Wilderness, Plettenberg Bay, Dana Baai, Hartenbos, Knysna, Oudtshoorn, Sedgefield, Groot Brak, Klein Brak, StilBaai, Cape Town, Western Cape, South Africa" />
        <meta name="geo.region" content="ZA" />
        <meta name="geo.placename" content="Western Cape" />
        <meta name="geo.position" content="-33.9249;18.4241" />
        <meta name="ICBM" content="-33.9249, 18.4241" />
        {/* Google AdSense */}
        <script data-ad-client="ca-pub-XXXXXXXXXXXXXXX" async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"></script>
      </Head>
      <body
        className={cn(
          'min-h-screen bg-background font-sans antialiased',
          GeistSans.variable,
          GeistMono.variable
        )}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
