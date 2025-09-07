'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getUserProfile } from '@/app/lib/profile-api';
import { Home, LogOut, Scroll, ShoppingBasket, User } from 'lucide-react';

// User type
type UserProfile = {
  name: string;
  email: string;
  role: string;
};

export default function Navbar() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Auth check
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('accessToken');
      if (token) {
        try {
          const profile = await getUserProfile(token);
          setUser(profile);
        } catch {
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    };

    checkAuth();

    const handleAuthChange = () => checkAuth();
    window.addEventListener('authChange', handleAuthChange);

    return () => {
      window.removeEventListener('authChange', handleAuthChange);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userId');

    window.dispatchEvent(new Event('authChange'));

    setUser(null);
    window.location.href = '/';
  };

  return (
    <nav 
      className="fixed top-0 z-50 w-full bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-sm"
      aria-label="Main Navigation"
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Home decor</h1>

        <div className="flex items-center space-x-6">
          <Link href="/"><Home className='hover:text-pink-500'/></Link>

          {/* Auth Links */}
          {!loading && !user ? (
            <>
              <Link
                href="/login"
                className="text-black dark:text-gray-200 hover:text-pink-500"
              >
                Login
              </Link>
              <Link
                href="/signup"
                className="px-4 py-2 bg-pink-500 text-white rounded hover:opacity-75 active:opacity-25 transition"
              >
                Sign Up
              </Link>
            </>
          ) : (
            !loading &&
            user && (
              <div className="flex items-center space-x-4">
                {user.role === "seller" && (
                  <>
                    <Link
                      href="/products/my-products"
                      className="text-gray-700 dark:text-gray-200 hover:text-orange-500"
                    >
                      My products
                    </Link>
                  </>
                )}
                <Link href="/wishlist"><Scroll className='hover:text-pink-500'/></Link>
                <Link href="/cart"><ShoppingBasket className='hover:text-pink-500'/></Link>
                <Link
                  href="/profile"
                  className="text-gray-700 dark:text-gray-200 font-medium flex justify-center hover:text-pink-500"
                >
                  <User/>{user.name}
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center text-gray-500 hover:text-red-500"
                >
                  <LogOut size={18} className="mr-1 hover:text-pink-500" />
                  Logout
                </button>
              </div>
            )
          )}
        </div>
      </div>
    </nav>
  );
}
