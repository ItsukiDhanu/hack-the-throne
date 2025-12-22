import type { Metadata } from 'next';
import './globals.css';
import { clsx } from 'clsx';

export const metadata: Metadata = {
  title: 'Hack The Throne',
  description: 'Explore the Web with Hack The Throne.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={clsx('bg-base-900 text-base-50')}>{children}</body>
    </html>
  );
}
