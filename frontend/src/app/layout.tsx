import type { Metadata } from 'next';
import '@/app/globals.css';
import Navbar from './components/Navbar';
export const metadata: Metadata = {
  title: 'Your App Name',
  description: 'Your app description',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body  className='bg-white dark:bg-gray-800 text-black dark:text-white'>
        <Navbar />
        {children}
      </body>
    </html>
  );
}