import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import { Providers } from './providers';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'Loumi - Privacy-First AI Chat',
    template: '%s | Loumi',
  },
  description:
    'A unified interface to all major AI models with privacy as the core product. Access GPT-4, Claude, and Gemini in one place with three privacy tiers.',
  keywords: [
    'AI chat',
    'privacy',
    'ChatGPT alternative',
    'Claude',
    'Gemini',
    'unified AI',
    'secure chat',
  ],
  authors: [{ name: 'Loumi' }],
  creator: 'Loumi',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'Loumi',
    title: 'Loumi - Privacy-First AI Chat',
    description:
      'A unified interface to all major AI models with privacy as the core product.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Loumi - Privacy-First AI Chat',
    description:
      'A unified interface to all major AI models with privacy as the core product.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
