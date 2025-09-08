'use client';

import { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Eye, EyeOff, Facebook } from 'lucide-react';
import { useAuth } from '../../context/authContext'; // Import the new hook

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
  const { signup } = useAuth(); // Assume 'signup' function is added to your AuthContext

  // Handle client-side mounting and SEO
  useEffect(() => {
    setIsMounted(true);

    // SEO Meta Tags - only on client side
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

    // Client-side validation
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
      // Call the centralized signup function from the context
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
    return null;
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
      
      <main className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white transition-colors">
        <header className="flex items-center p-6 border-b border-gray-200 dark:border-gray-700">
          <button 
            onClick={() => router.back()}
            className="mr-4 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            aria-label="Go back to previous page"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-semibold">Create Account</h1>
        </header>

        <div className="px-6 py-8 max-w-md mx-auto">
          {errors.length > 0 && (
            <div className="mb-6 bg-red-50 dark:bg-red-900/50 border border-red-200 dark:border-red-500/50 rounded-lg p-4" role="alert">
              {errors.map((error, index) => (
                <p key={index} className="text-sm text-red-600 dark:text-red-200">{error}</p>
              ))}
            </div>
          )}

          {successMessage && (
            <div className="mb-6 bg-green-50 dark:bg-green-900/50 border border-green-200 dark:border-green-500/50 rounded-lg p-4" role="alert">
              <p className="text-sm text-green-600 dark:text-green-200">{successMessage}</p>
            </div>
          )}

          <div className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Full Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                required
                className="w-full px-4 py-3 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-full border-0 focus:outline-none focus:ring-2 focus:ring-orange-400 placeholder-gray-500 dark:placeholder-gray-400"
                placeholder="John Doe"
                value={formData.name}
                onChange={handleInputChange}
                aria-describedby="name-help"
              />
              <div id="name-help" className="sr-only">Enter your complete first and last name</div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="w-full px-4 py-3 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-full border-0 focus:outline-none focus:ring-2 focus:ring-orange-400 placeholder-gray-500 dark:placeholder-gray-400"
                placeholder="example@example.com"
                value={formData.email}
                onChange={handleInputChange}
                aria-describedby="email-help"
              />
              <div id="email-help" className="sr-only">We'll use this email for account verification and communication</div>
            </div>

            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Account Type
              </label>
              <select
                id="role"
                name="role"
                required
                className="w-full px-4 py-3 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-full border-0 focus:outline-none focus:ring-2 focus:ring-orange-500 appearance-none cursor-pointer"
                value={formData.role}
                onChange={handleInputChange}
                aria-describedby="role-help"
              >
                <option value="buyer">Buyer - Browse and purchase items</option>
                <option value="seller">Seller - List and sell items</option>
              </select>
              <div id="role-help" className="sr-only">Choose whether you want to buy items, sell items, or both</div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  className="w-full px-4 py-3 pr-12 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-full border-0 focus:outline-none focus:ring-2 focus:ring-orange-500 placeholder-gray-500 dark:placeholder-gray-400"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleInputChange}
                  aria-describedby="password-help"
                />
                <button
                  type="button"
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <div id="password-help" className="text-xs text-gray-400 mt-1">
                Minimum 6 characters with at least one number
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  className="w-full px-4 py-3 pr-12 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-full border-0 focus:outline-none focus:ring-2 focus:ring-orange-400 placeholder-gray-500 dark:placeholder-gray-400"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  aria-describedby="confirm-password-help"
                />
                <button
                  type="button"
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label={showConfirmPassword ? 'Hide password confirmation' : 'Show password confirmation'}
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <div id="confirm-password-help" className="sr-only">Re-enter your password to confirm</div>
            </div>

            <div className="text-center text-sm text-gray-500 dark:text-gray-400">
              By continuing, you agree to{' '}
              <Link href="/terms" className="text-orange-500 hover:text-orange-400 underline">
                Terms of Use
              </Link>{' '}
              and{' '}
              <Link href="/privacy" className="text-orange-500 hover:text-orange-400 underline">
                Privacy Policy
              </Link>
              .
            </div>

            <button
              type="submit"
              disabled={isLoading}
              onClick={handleSubmit}
              className="w-full py-3 custom-button font-semibold rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-900"
            >
              {isLoading ? 'Creating Account...' : 'Sign Up'}
            </button>
          </div>

          <div className="my-8 text-center text-sm text-gray-400">
            or sign up with
          </div>

          <div className="flex space-x-4 mb-8">
            <button 
              type="button"
              className="flex-1 flex items-center justify-center py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500"
              aria-label="Sign up with Facebook (coming soon)"
            >
              <Facebook className="w-5 h-5 text-blue-500" />
            </button>
            <button 
              type="button"
              className="flex-1 flex items-center justify-center py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500"
              aria-label="Sign up with Google (coming soon)"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            </button>
          </div>

          <div className="text-center text-sm text-gray-500 dark:text-gray-400">
            Already have an account?{' '}
            <Link href="/login" className="text-orange-500 hover:text-orange-400 font-medium underline">
              Log in
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}