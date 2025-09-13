'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
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
          const profile = await getUserProfile();
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
      className="fixed top-0 z-50 w-full bg-white dark:bg-gray-900 text-black dark:text-white border-b border-gray-200 dark:border-gray-700 shadow-sm"
      aria-label="Main Navigation"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-2 text-xl lg:text-2xl font-bold text-gray-900 dark:text-white hover:text-pink-500 transition-colors">
          <Image
            src="/luxe.png"
            alt="The Luxe Logo"
            width={32}
            height={32}
            className="w-8 h-8"
          />
          <span>The Luxe</span>
        </Link>

        <div className="flex items-center space-x-4 lg:space-x-6">
          <Link 
            href="/" 
            title="Home"
            className="p-2 hover:text-pink-500 transition-colors"
          >
            <Home className="w-5 h-5" />
          </Link>

          {/* Auth Links */}
          {!loading && !user ? (
            <>
              <Link
                href="/login"
                className="text-black dark:text-gray-200 hover:text-pink-500 font-medium transition-colors"
              >
                Login
              </Link>
              <Link
                href="/signup"
                className="px-4 py-2 bg-gradient-to-r from-pink-500 to-orange-500 text-white rounded-lg hover:from-pink-600 hover:to-orange-600 active:scale-95 transition-all font-medium"
              >
                Sign Up
              </Link>
            </>
          ) : (
            !loading &&
            user && (
              <div className="flex items-center space-x-3 lg:space-x-4">
                {user.role === "seller" && (
                  <>
                    <Link
                      href="/products/create"
                      className="hidden md:block text-gray-700 dark:text-gray-200 hover:text-pink-500 font-medium transition-colors"
                    >
                      Create new product
                    </Link>
                    <Link
                      href="/products/my-products"
                      className="hidden md:block text-gray-700 dark:text-gray-200 hover:text-pink-500 font-medium transition-colors"
                    >
                      My Products
                    </Link>
                  </>
                )}
                
                <Link 
                  href="/wishlist" 
                  title="Wishlist"
                  className="p-2 hover:text-pink-500 transition-colors"
                >
                  <Scroll className="w-5 h-5" />
                </Link>
                
                <Link 
                  href="/cart" 
                  title="Cart"
                  className="p-2 hover:text-pink-500 transition-colors"
                >
                  <ShoppingBasket className="w-5 h-5" />
                </Link>
                
                <Link
                  href="/profile"
                  className="flex items-center space-x-2 text-gray-700 dark:text-gray-200 font-medium hover:text-pink-500 transition-colors"
                >
                  <User className="w-5 h-5" />
                  <span className="hidden sm:block">{user.name}</span>
                </Link>
                
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1 text-gray-500 hover:text-red-500 transition-colors p-2"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="hidden lg:block text-sm">Logout</span>
                </button>
              </div>
            )
          )}
        </div>
      </div>
    </nav>
  );
}