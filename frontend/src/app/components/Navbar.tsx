'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getUserProfile } from '@/app/lib/profile-api';
import { Home, LogOut, Scroll, User, Moon, Sun } from 'lucide-react';

// ✅ Define User type (adjust fields based on your API response)
type UserProfile = {
  name: string;
  email: string;
  roleId?: string;
};

export default function Navbar() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // ✅ Auth check
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
    <nav className="w-full bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Home decor</h1>

        <div className="flex items-center space-x-6">
          <Link href="/"><Home /></Link>
          <Link href="/wishlist"><Scroll /></Link>
          <Link href="/profile"><User /></Link>

          {/* Auth Links */}
          {!loading && !user ? (
            <>
              <Link
                href="/login"
                className="text-gray-700 dark:text-gray-200 hover:text-orange-500"
              >
                Login
              </Link>
              <Link
                href="/signup"
                className="px-4 py-2 bg-orange-500 text-white rounded-full hover:bg-orange-600 transition"
              >
                Sign Up
              </Link>
            </>
          ) : (
            !loading &&
            user && (
              <div className="flex items-center space-x-4">
                <Link
                  href="/profile"
                  className="text-gray-700 dark:text-gray-200 font-medium"
                >
                  {user.name}
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center text-gray-500 hover:text-red-500"
                >
                  <LogOut size={18} className="mr-1" />
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
