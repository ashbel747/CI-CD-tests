'use client';

import { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Eye, EyeOff, Facebook, User, Mail, Lock, Home } from 'lucide-react';
import { useAuth } from '../../context/authContext';

type UserRole = 'buyer' | 'seller';

export default function SignupPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'buyer' as UserRole
  });
  const [errors, setErrors] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  const router = useRouter();
  const { signup } = useAuth();

  useEffect(() => {
    setIsMounted(true);

    document.title = 'Create Account | Join Our Marketplace - Sign Up Today';
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Create your free account to start buying and selling. Join thousands of users in our secure marketplace. Quick signup process with buyer and seller options.');
    } else {
      const meta = document.createElement('meta');
      meta.name = 'description';
      meta.content = 'Create your free account to start buying and selling. Join thousands of users in our secure marketplace. Quick signup process with buyer and seller options.';
      document.head.appendChild(meta);
    }
  }, []);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors.length > 0) {
      setErrors([]);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors([]);
    setSuccessMessage('');

    const validationErrors: string[] = [];
    if (formData.password.length < 6) {
      validationErrors.push('Password must be at least 6 characters long');
    }
    if (!/(?=.*[0-9])/.test(formData.password)) {
      validationErrors.push('Password must contain at least one number');
    }
    if (formData.password !== formData.confirmPassword) {
      validationErrors.push('Passwords do not match');
    }

    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      setIsLoading(false);
      return;
    }

    try {
      await signup({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role
      });
      
      setSuccessMessage('Account created successfully! Redirecting to login...');
      setTimeout(() => {
        router.push('/login');
      }, 2000);

    } catch (error) {
      setErrors([error instanceof Error ? error.message : 'An unexpected error occurred']);
    } finally {
      setIsLoading(false);
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
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            "name": "Create Account",
            "description": "Create your free account to join our marketplace",
            "url": typeof window !== 'undefined' ? window.location.href : '',
            "mainEntity": {
              "@type": "WebApplication",
              "name": "Marketplace Signup",
              "applicationCategory": "BusinessApplication"
            }
          })
        }}
      />
      
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

            {/* Sign In Link */}
            <Link
              href="/login"
              className="px-4 py-2 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-lg hover:from-orange-600 hover:to-pink-600 font-medium transition-all transform hover:scale-105"
            >
              Sign In
            </Link>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex items-center justify-center min-h-screen p-4 pt-20">
          <div className="flex flex-col lg:flex-row w-full max-w-7xl bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden">
            
            {/* Left Image Panel */}
            <div className="hidden lg:flex lg:flex-1 bg-gray-900 dark:bg-gray-800 relative overflow-hidden">
              <div className="absolute inset-0 bg-black/5"></div>
              
              {/* Floating Background Elements */}
              <div className="absolute top-10 right-10 w-20 h-20 bg-orange-400/20 rounded-full animate-pulse"></div>
              <div className="absolute bottom-20 left-10 w-32 h-32 bg-pink-400/15 rounded-full animate-bounce" style={{animationDuration: '3s'}}></div>
              <div className="absolute top-1/3 left-5 w-16 h-16 bg-purple-400/20 rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
              <div className="absolute bottom-10 right-20 w-24 h-24 bg-orange-300/15 rounded-full animate-bounce" style={{animationDuration: '4s', animationDelay: '0.5s'}}></div>
              
              {/* Main Image Container - Full Height */}
              <div className="relative z-10 flex items-center justify-center w-full h-full p-8">
                <div className="w-full h-full flex items-center justify-center animate-float">
                  <img
                    src="/signup.png"
                    alt="Sign Up Illustration"
                    className="w-full h-full object-contain filter drop-shadow-2xl transform transition-transform duration-300 hover:scale-105"
                  />
                </div>
              </div>
              
              {/* Custom CSS for floating animation */}
              <style jsx>{`
                @keyframes float {
                  0%, 100% { transform: translateY(0px) rotate(0deg); }
                  33% { transform: translateY(-10px) rotate(1deg); }
                  66% { transform: translateY(5px) rotate(-1deg); }
                }
                .animate-float {
                  animation: float 6s ease-in-out infinite;
                }
              `}</style>
            </div>

            {/* Right Signup Form Panel */}
            <div className="flex-1 lg:max-w-lg xl:max-w-xl p-8 sm:p-12 lg:p-16 flex flex-col justify-center">
              
              {/* Error Messages */}
              {errors.length > 0 && (
                <div className="mb-6 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-500/50 rounded-lg p-4" role="alert">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <svg className="w-5 h-5 text-red-500 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      {errors.map((error, index) => (
                        <p key={index} className="text-sm text-red-600 dark:text-red-200 mb-1 last:mb-0">
                          {error}
                        </p>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Success Message */}
              {successMessage && (
                <div className="mb-6 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-500/50 rounded-lg p-4" role="alert">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <svg className="w-5 h-5 text-green-500 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-green-600 dark:text-green-200">{successMessage}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Form Header */}
              <div className="text-center lg:text-left mb-8">
                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2">
                  Create Account
                </h2>
                <p className="text-gray-600 dark:text-gray-400 text-lg">
                  Join our marketplace and start your journey
                </p>
              </div>

              {/* Signup Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Full Name */}
                <div>
                  <label htmlFor="name" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      autoComplete="name"
                      required
                      placeholder="Enter your full name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white transition-colors"
                    />
                  </div>
                </div>

                {/* Email */}
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

                {/* Account Type */}
                <div>
                  <label htmlFor="role" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Account Type
                  </label>
                  <select
                    id="role"
                    name="role"
                    required
                    value={formData.role}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900 dark:text-white appearance-none cursor-pointer transition-colors"
                  >
                    <option value="buyer">Buyer - Browse and purchase items</option>
                    <option value="seller">Seller - List and sell items</option>
                  </select>
                </div>

                {/* Password */}
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
                      autoComplete="new-password"
                      required
                      placeholder="Create a strong password"
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
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    Minimum 6 characters with at least one number
                  </p>
                </div>

                {/* Confirm Password */}
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      required
                      placeholder="Confirm your password"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-12 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                      aria-label={showConfirmPassword ? 'Hide password confirmation' : 'Show password confirmation'}
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Terms and Privacy */}
                <div className="text-center text-sm text-gray-500 dark:text-gray-400">
                  By continuing, you agree to our{' '}
                  <Link href="/terms" className="text-orange-500 hover:text-orange-600 font-medium transition-colors">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link href="/privacy" className="text-orange-500 hover:text-orange-600 font-medium transition-colors">
                    Privacy Policy
                  </Link>
                </div>

                {/* Submit Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 lg:py-4 bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-800 disabled:opacity-60 disabled:cursor-not-allowed transform hover:scale-[1.02] disabled:hover:scale-100"
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Creating Account...
                      </div>
                    ) : (
                      'Create Account'
                    )}
                  </button>
                </div>
              </form>

              {/* Divider */}
              <div className="my-8 flex items-center">
                <div className="flex-1 border-t border-gray-300 dark:border-gray-600"></div>
                <div className="px-4 text-sm text-gray-500 dark:text-gray-400">or sign up with</div>
                <div className="flex-1 border-t border-gray-300 dark:border-gray-600"></div>
              </div>

              {/* Social Signup Buttons */}
              <div className="grid grid-cols-2 gap-4 mb-8">
                <button
                  type="button"
                  className="flex items-center justify-center py-3 px-4 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 border border-gray-300 dark:border-gray-600 rounded-lg transition-colors group"
                  aria-label="Sign up with Facebook"
                >
                  <Facebook className="w-5 h-5 text-blue-600 group-hover:scale-110 transition-transform" />
                  <span className="ml-2 text-gray-700 dark:text-gray-300 font-medium">Facebook</span>
                </button>

                <button
                  type="button"
                  className="flex items-center justify-center py-3 px-4 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 border border-gray-300 dark:border-gray-600 rounded-lg transition-colors group"
                  aria-label="Sign up with Google"
                >
                  <svg className="w-5 h-5 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  <span className="ml-2 text-gray-700 dark:text-gray-300 font-medium">Google</span>
                </button>
              </div>

              {/* Sign In Link */}
              <div className="text-center">
                <p className="text-gray-600 dark:text-gray-400">
                  Already have an account?{' '}
                  <Link
                    href="/login"
                    className="text-orange-500 hover:text-orange-600 font-semibold transition-colors"
                  >
                    Sign in here
                  </Link>
                </p>
              </div>

              {/* Additional Links */}
              <div className="hidden lg:block mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                <div className="flex justify-center space-x-6 text-sm text-gray-500 dark:text-gray-400">
                  <Link href="/help" className="hover:text-orange-500 transition-colors">
                    Help Center
                  </Link>
                  <Link href="/contact" className="hover:text-orange-500 transition-colors">
                    Contact Support
                  </Link>
                  <Link href="/about" className="hover:text-orange-500 transition-colors">
                    About Us
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}