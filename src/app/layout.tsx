import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Toaster } from 'sonner';
import { Navigation } from '@/components/navigation';
import { Footer } from '@/components/footer';
import { ErrorBoundary } from '@/components/error-boundary';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Digital Cluster 25 - AI-Powered Entrepreneurial Community',
  description:
    'Пионерское онлайн-сообщество на базе искусственного интеллекта для предпринимателей. Умное сопоставление, глобальные связи и персонализированный опыт.',
  keywords: [
    'AI',
    'предпринимательство',
    'нетворкинг',
    'сообщество',
    'искусственный интеллект',
    'Digital Cluster 25',
  ],
  authors: [{ name: 'Digital Cluster 25 Team' }],
  creator: 'Digital Cluster 25',
  publisher: 'Digital Cluster 25',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'ru_RU',
    url: 'https://digital-cluster-25.vercel.app',
    title: 'Digital Cluster 25 - AI-Powered Entrepreneurial Community',
    description:
      'Пионерское онлайн-сообщество на базе искусственного интеллекта для предпринимателей',
    siteName: 'Digital Cluster 25',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Digital Cluster 25 - AI-Powered Entrepreneurial Community',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Digital Cluster 25 - AI-Powered Entrepreneurial Community',
    description:
      'Пионерское онлайн-сообщество на базе искусственного интеллекта для предпринимателей',
    images: ['/og-image.jpg'],
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
  },
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0a' },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en' className="h-full">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased h-full flex flex-col`}
      >
        <ErrorBoundary>
          <div className="flex flex-col min-h-screen">
            <Navigation />
            <main className="flex-1">
              {children}
            </main>
            <Footer />
          </div>
          <Toaster />
        </ErrorBoundary>
      </body>
    </html>
  );
}
