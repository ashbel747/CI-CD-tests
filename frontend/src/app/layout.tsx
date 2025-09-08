import type { Metadata } from 'next';
import '@/app/globals.css';
import { Toaster } from 'react-hot-toast'; // import Toaster
import Navbar from './components/Navbar';
import { WishlistProvider } from './context/WishlistContext';
import { AuthProvider } from './context/authContext'; // 🆕 Import the AuthProvider
import ChatbotButton from './components/ChatbotButton';

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
      <body className='bg-white dark:bg-gray-800 text-black dark:text-white'>
        {/* 🆕 Wrap the children with the AuthProvider */}
        <AuthProvider>
          <WishlistProvider>
            <Navbar />
            <ChatbotButton />
            {children}
          </WishlistProvider>
        </AuthProvider>

        {/* Toaster placed here so any page can show notifications */}
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
