import type { Metadata, Viewport } from 'next';
import { Inter, JetBrains_Mono, Sora } from 'next/font/google';
import { AuthProvider } from '@/lib/auth';
import { ThemeProvider, themeScript } from '@/lib/theme';
import './globals.css';

const sans = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const display = Sora({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-display',
  display: 'swap',
});

const mono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'ServiceFlow — ArcticAir HVAC Solutions',
    template: '%s · ArcticAir HVAC',
  },
  description:
    'ArcticAir HVAC Solutions — installation, emergency repair, preventive maintenance and annual service contracts for residential and commercial properties across Arizona.',
  keywords: ['HVAC', 'air conditioning', 'heating', 'emergency repair', 'maintenance plans', 'Arizona'],
  authors: [{ name: 'BranDive Media Solutions' }],
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#060A11' },
    { media: '(prefers-color-scheme: light)', color: '#F1F4F8' },
  ],
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${sans.variable} ${display.variable} ${mono.variable}`}>
      <head>
        {/* Paints the stored theme before first render so there is no flash. */}
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <ThemeProvider>
          <AuthProvider>
            <div className="relative z-10">{children}</div>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
