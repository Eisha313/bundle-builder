import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { BundleProvider } from '@/context/BundleContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Bundle Builder - Create Custom Product Bundles',
  description: 'Build your own custom product bundles and save with tiered discounts',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <BundleProvider>
          {children}
        </BundleProvider>
      </body>
    </html>
  );
}
