'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Eye, EyeOff, Shield } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { apiCall } from '../../lib/auth';
import { useAuth } from '../../context/authContext';

export default function ChangePasswordPage() {
  const [formData, setFormData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  const router = useRouter();
  const { user, loading, logout } = useAuth();

  useEffect(() => {
    setIsMounted(true);

    if (!loading && user !== null && !user?.isAuthenticated) {
      const redirectTimer = setTimeout(() => router.push('/login'), 100);
      return () => clearTimeout(redirectTimer);
    }

    if (typeof document !== 'undefined') {
      document.title = 'Change Password | Secure Your Account';
      const metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription) {
        metaDescription.setAttribute('content', 'Update your account password securely. Change your current password to a new one with enhanced security.');
      } else {
        const meta = document.createElement('meta');
        meta.name = 'description';
        meta.content = 'Update your account password securely. Change your current password to a new one with enhanced security.';
        document.head.appendChild(meta);
      }
    }
  }, [loading, user, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors.length > 0) setErrors([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors([]);

    const validationErrors: string[] = [];
    if (!formData.oldPassword) validationErrors.push('Current password is required');
    if (formData.newPassword.length < 6) validationErrors.push('New password must be at least 6 characters long');
    if (!/(?=.*[0-9])/.test(formData.newPassword)) validationErrors.push('New password must contain at least one number');
    if (formData.newPassword !== formData.confirmPassword) validationErrors.push('New passwords do not match');
    if (formData.oldPassword === formData.newPassword) validationErrors.push('New password must be different from current password');

    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      setIsLoading(false);
      return;
    }

    try {
      await apiCall('/auth/change-password', {
        method: 'PUT',
        body: JSON.stringify({
          oldPassword: formData.oldPassword,
          newPassword: formData.newPassword,
        }),
      });

      toast.success('Password changed successfully!');
      setFormData({ oldPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => router.push('/'), 2000);

    } catch (error: any) {
      if (error.response?.status === 401) {
        toast.error('Not logged in. Please log in first.');
        logout?.();
        router.push('/login');
      } else if (error.response?.status === 400) {
        toast.error('Incorrect current password. Please try again.');
      } else {
        toast.error(error.message || 'An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!isMounted || loading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 text-gray-900 dark:text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </main>
    );
  }

  if (user && !user.isAuthenticated) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 text-gray-900 dark:text-white flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6">
          <Shield className="w-20 h-20 text-red-500 mx-auto mb-6" />
          <h1 className="text-3xl font-bold mb-4">Access Denied</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8 text-lg">
            You need to be logged in to change your password.
          </p>
          <div className="space-y-4">
            <Link 
              href="/login"
              className="block w-full py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg transition-colors"
            >
              Go to Login
            </Link>
            <Link 
              href="/"
              className="block w-full py-3 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <>
      <Toaster position="top-right" reverseOrder={false} />
      <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 text-gray-900 dark:text-white">
        
        {/* Header - Desktop & Mobile Responsive */}
        <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center py-4 lg:py-6">
              {/* Mobile Back Button */}
              <button 
                onClick={() => router.back()}
                className="lg:hidden mr-4 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                aria-label="Go back to previous page"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              
              {/* Header Content */}
              <div className="flex items-center space-x-3">
                <Shield className="w-7 h-7 text-orange-500" />
                <h1 className="text-xl lg:text-2xl font-semibold text-gray-900 dark:text-white">
                  Change Password
                </h1>
              </div>

              {/* Desktop Navigation */}
              <div className="hidden lg:flex ml-auto space-x-4">
                <Link 
                  href="/"
                  className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-orange-500 font-medium transition-colors"
                >
                  Home
                </Link>
                <Link 
                  href="/profile"
                  className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-orange-500 font-medium transition-colors"
                >
                  Profile
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="py-8 lg:py-16">
          <div className="max-w-md lg:max-w-xl xl:max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
            
            {/* Card Container */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 lg:p-10">
              
              {/* Form Header */}
              <div className="text-center mb-8">
                <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  Update Your Password
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Keep your account secure with a strong password
                </p>
              </div>

              {/* Error Messages */}
              {errors.length > 0 && (
                <div className="mb-6 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-500/50 rounded-lg p-4" role="alert">
                  <div className="flex items-start">
                    <Shield className="w-5 h-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
                    <div>
                      {errors.map((error, index) => (
                        <p key={index} className="text-sm text-red-600 dark:text-red-200 mb-1 last:mb-0">
                          {error}
                        </p>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Current Password */}
                <div>
                  <label htmlFor="oldPassword" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Current Password
                  </label>
                  <div className="relative">
                    <input
                      id="oldPassword"
                      name="oldPassword"
                      type={showOldPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      required
                      className="w-full px-4 py-3 pr-12 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white transition-colors"
                      placeholder="Enter your current password"
                      value={formData.oldPassword}
                      onChange={handleInputChange}
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                      onClick={() => setShowOldPassword(!showOldPassword)}
                    >
                      {showOldPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* New Password */}
                <div>
                  <label htmlFor="newPassword" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      id="newPassword"
                      name="newPassword"
                      type={showNewPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      required
                      className="w-full px-4 py-3 pr-12 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white transition-colors"
                      placeholder="Choose a strong new password"
                      value={formData.newPassword}
                      onChange={handleInputChange}
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                      {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    Minimum 6 characters with at least one number
                  </p>
                </div>

                {/* Confirm New Password */}
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      required
                      className="w-full px-4 py-3 pr-12 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white transition-colors"
                      placeholder="Confirm your new password"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 lg:py-4 bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-800 disabled:opacity-60 disabled:cursor-not-allowed transform hover:scale-[1.02] disabled:hover:scale-100"
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Changing Password...
                      </div>
                    ) : (
                      'Change Password'
                    )}
                  </button>
                </div>
              </form>

              {/* Footer Links */}
              <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700 text-center space-y-4">
                <Link 
                  href="/" 
                  className="inline-flex items-center text-sm text-orange-500 hover:text-orange-600 font-medium transition-colors group"
                >
                  <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                  Back to Home
                </Link>
                
                <div className="hidden lg:block">
                  <div className="flex justify-center space-x-6 text-sm text-gray-500 dark:text-gray-400">
                    <Link href="/help" className="hover:text-orange-500 transition-colors">
                      Help Center
                    </Link>
                    <Link href="/security" className="hover:text-orange-500 transition-colors">
                      Security Tips
                    </Link>
                    <Link href="/contact" className="hover:text-orange-500 transition-colors">
                      Contact Support
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}