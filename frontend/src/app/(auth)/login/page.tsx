'use client';

import { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Eye, EyeOff, Facebook, Mail, Lock, Home } from 'lucide-react';
import { useAuth } from '../../context/authContext';

export default function LoginPage() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState<string[]>([]);
  const [showPassword, setShowPassword] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  const router = useRouter();
  const { login, loading } = useAuth();

  useEffect(() => {
    setIsMounted(true);
    document.title = 'Sign In | Welcome Back';
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute(
        'content',
        'Sign in to your account to access your marketplace dashboard. Secure login for buyers and sellers.'
      );
    } else {
      const meta = document.createElement('meta');
      meta.name = 'description';
      meta.content =
        'Sign in to your account to access your marketplace dashboard. Secure login for buyers and sellers.';
      document.head.appendChild(meta);
    }
  }, []);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors.length > 0) setErrors([]);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrors([]);
    try {
      await login(formData.email, formData.password);
    } catch (error) {
      setErrors([error instanceof Error ? error.message : 'An error occurred']);
    }
  };

  if (!isMounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          {/* Mobile Back Button */}
          <button 
            onClick={() => router.back()}
            className="lg:hidden p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-600 dark:text-gray-400"
            aria-label="Go back"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>

          {/* Desktop Home Link */}
          <Link 
            href="/"
            className="hidden lg:flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-orange-500 transition-colors"
          >
            <Home className="w-5 h-5" />
            <span className="font-medium">Home</span>
          </Link>

          {/* Logo/Brand */}
          <Link 
            href="/"
            className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white hover:text-orange-500 transition-colors"
          >
            Home Decor
          </Link>

          {/* Sign Up Link */}
          <Link
            href="/signup"
            className="px-4 py-2 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-lg hover:from-orange-600 hover:to-pink-600 font-medium transition-all transform hover:scale-105"
          >
            Sign Up
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex items-center justify-center min-h-screen p-4 pt-20">
        <div className="flex flex-col lg:flex-row w-full max-w-6xl bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden">
          
          {/* Left Illustration Panel */}
          <div className="hidden lg:flex lg:flex-1 bg-gray-900 dark:bg-gray-800 relative overflow-hidden mr-4">
            <div className="absolute inset-0 bg-black/5"></div>
            <div className="relative z-10 flex items-center justify-center w-full h-full p-8">
              <img
                src="/login.png"
                alt="Home Decor Logo"
                className="max-w-full max-h-full object-contain filter drop-shadow-xl"
              />
            </div>
          </div>

          {/* Right Login Form Panel */}
          <div className="flex-1 lg:max-w-md xl:max-w-lg p-8 sm:p-12 lg:p-16 flex flex-col justify-center">
            
            {/* Error Messages */}
            {errors.length > 0 && (
              <div
                className="mb-6 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-500/50 rounded-lg p-4"
                role="alert"
              >
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="w-5 h-5 text-red-500 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    {errors.map((error, index) => (
                      <p key={index} className="text-sm text-red-600 dark:text-red-200">
                        {error}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Form Header */}
            <div className="text-center lg:text-left mb-8">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2">
                Sign In
              </h2>
              <p className="text-gray-600 dark:text-gray-400 text-lg">
                Enter your credentials to access your account
              </p>
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white transition-colors"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-12 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Forgot Password Link */}
              <div className="flex justify-end">
                <Link
                  href="/forgot-password"
                  className="text-sm text-orange-500 hover:text-orange-600 font-medium transition-colors"
                >
                  Forgot your password?
                </Link>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 lg:py-4 bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-800 disabled:opacity-60 disabled:cursor-not-allowed transform hover:scale-[1.02] disabled:hover:scale-100"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Signing In...
                  </div>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="my-8 flex items-center">
              <div className="flex-1 border-t border-gray-300 dark:border-gray-600"></div>
              <div className="px-4 text-sm text-gray-500 dark:text-gray-400">or continue with</div>
              <div className="flex-1 border-t border-gray-300 dark:border-gray-600"></div>
            </div>

            {/* Social Login Buttons */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              <button
                type="button"
                className="flex items-center justify-center py-3 px-4 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 border border-gray-300 dark:border-gray-600 rounded-lg transition-colors group"
                aria-label="Sign in with Facebook"
              >
                <Facebook className="w-5 h-5 text-blue-600 group-hover:scale-110 transition-transform" />
                <span className="ml-2 text-gray-700 dark:text-gray-300 font-medium">Facebook</span>
              </button>

              <button
                type="button"
                className="flex items-center justify-center py-3 px-4 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 border border-gray-300 dark:border-gray-600 rounded-lg transition-colors group"
                aria-label="Sign in with Google"
              >
                <svg className="w-5 h-5 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                <span className="ml-2 text-gray-700 dark:text-gray-300 font-medium">Google</span>
              </button>
            </div>

            {/* Sign Up Link */}
            <div className="text-center">
              <p className="text-gray-600 dark:text-gray-400">
                Don't have an account?{' '}
                <Link
                  href="/signup"
                  className="text-orange-500 hover:text-orange-600 font-semibold transition-colors"
                >
                  Create one here
                </Link>
              </p>
            </div>

            {/* Additional Links */}
            <div className="hidden lg:block mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
              <div className="flex justify-center space-x-6 text-sm text-gray-500 dark:text-gray-400">
                <Link href="/help" className="hover:text-orange-500 transition-colors">
                  Help Center
                </Link>
                <Link href="/privacy" className="hover:text-orange-500 transition-colors">
                  Privacy Policy
                </Link>
                <Link href="/terms" className="hover:text-orange-500 transition-colors">
                  Terms of Service
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}