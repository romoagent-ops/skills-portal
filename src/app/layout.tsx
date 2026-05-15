import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Skills Portal',
  description: 'Portal mobile-first para agrupar las skills de Romo.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
