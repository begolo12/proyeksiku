import './globals.css';
import { AuthProvider } from '@/app/context/AuthContext';

export const metadata = {
  title: 'ProyeksiKu — Rencana Anggaran & Proyeksi Keuangan',
  description: 'Buat rencana anggaran biaya dan proyeksi keuangan untuk usaha Anda. Presentasikan ke investor dengan slide deck interaktif.',
  manifest: '/manifest.json',
  icons: {
    icon: '/icons/icon-192.png',
    apple: '/icons/icon-192.png',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#6366f1',
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body suppressHydrationWarning>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
