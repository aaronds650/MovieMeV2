import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
// Removed Supabase import
import { cn } from '../../lib/utils';
import { Mail, Lock, User, AlertCircle, CheckCircle2 } from 'lucide-react';

export function AuthForm() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    emailOrUsername: '',
    password: '',
    confirmPassword: '',
    username: '',
  });

  useEffect(() => {
    // Check if user came from password reset
    if (searchParams.get('reset') === 'true') {
      setSuccess('Your password has been reset successfully. Please sign in with your new password.');
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const isEmail = formData.emailOrUsername.includes('@');
      
      if (isSignUp) {
        // Validate password confirmation
        if (formData.password !== formData.confirmPassword) {
          throw new Error('Passwords do not match');
        }

        if (!formData.username) {
          throw new Error('Username is required');
        }

        // Validate username format
        if (!/^[a-zA-Z0-9_]{3,30}$/.test(formData.username)) {
          throw new Error('Username must be 3-30 characters and can only contain letters, numbers, and underscores');
        }

        if (!isEmail) {
          throw new Error('Please enter a valid email address');
        }

        // Check if username is already taken
        const { data: existingProfiles, error: profileError } = await supabase
          .from('profiles')
          .select('username')
          .eq('username', formData.username)
          .maybeSingle();

        if (profileError) {
          console.error('Profile check error:', profileError);
          throw new Error('Error checking username availability');
        }
        
        if (existingProfiles) {
          throw new Error('Username is already taken');
        }

        // Create new user account
        // Mock sign up - simulate successful registration
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
        const signUpData = { user: { id: 'dev-user-1' } };
        const signUpError = null;
        
        if (signUpError) {
          console.error('Sign up error:', signUpError);
          throw signUpError;
        }

        if (!signUpData.user) {
          throw new Error('Failed to create account');
        }
      } else {
        let email = formData.emailOrUsername;

        // If input is not an email, look up the email by username
        if (!isEmail) {
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('email')
            .eq('username', formData.emailOrUsername)
            .maybeSingle();

          if (profileError) {
            console.error('Profile lookup error:', profileError);
            throw new Error('Error looking up username');
          }
          
          if (!profile?.email) {
            throw new Error('Invalid username or password');
          }

          email = profile.email;
        }

        // Sign in with email and password
        // Mock sign in - simulate successful login
        await new Promise(resolve => setTimeout(resolve, 800)); // Simulate network delay
        const signInError = null;

        if (signInError) {
          console.error('Sign in error:', signInError);
          throw signInError;
        }
      }
      
      // After successful authentication, navigate to the homepage
      navigate('/');
    } catch (err) {
      console.error('Auth error:', err);
      let errorMessage = 'An error occurred during authentication';
      
      if (err instanceof Error) {
        switch (true) {
          case err.message.includes('Invalid login credentials'):
            errorMessage = 'Invalid username/email or password';
            break;
          case err.message.includes('Email not confirmed'):
            errorMessage = 'Please confirm your email address before signing in';
            break;
          case err.message.includes('Username is already taken'):
            errorMessage = 'This username is already taken';
            break;
          case err.message.includes('Password should be at least'):
            errorMessage = 'Password should be at least 6 characters long';
            break;
          case err.message.includes('Invalid email'):
            errorMessage = 'Please enter a valid email address';
            break;
          case err.message.includes('Passwords do not match'):
            errorMessage = 'Passwords do not match';
            break;
          case err.message.includes('Username must be'):
            errorMessage = 'Username must be 3-30 characters and can only contain letters, numbers, and underscores';
            break;
          case err.message.includes('Rate limit'):
            errorMessage = 'Too many attempts. Please try again later.';
            break;
          default:
            errorMessage = err.message;
        }
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">{isSignUp ? 'Create Account' : 'Welcome Back'}</h1>
        <p className="text-gray-500">
          {isSignUp ? 'Sign up to get personalized movie recommendations' : 'Sign in to continue your movie journey'}
        </p>
      </div>

      {success && (
        <div className="p-3 rounded bg-green-50 text-green-600 text-sm flex items-start gap-2">
          <CheckCircle2 className="h-5 w-5 flex-shrink-0 mt-0.5" />
          <span>{success}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {isSignUp && (
          <div className="space-y-2">
            <label htmlFor="username" className="text-sm font-medium">
              Username
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                id="username"
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value.trim() })}
                className={cn(
                  "w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent",
                  "bg-white border-gray-300"
                )}
                required
                minLength={3}
                maxLength={30}
                pattern="[a-zA-Z0-9_]+"
                title="Username can only contain letters, numbers, and underscores"
              />
            </div>
            <p className="text-xs text-gray-500">
              Username must be 3-30 characters and can only contain letters, numbers, and underscores
            </p>
          </div>
        )}

        <div className="space-y-2">
          <label htmlFor="emailOrUsername" className="text-sm font-medium">
            {isSignUp ? 'Email' : 'Email or Username'}
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              id="emailOrUsername"
              type={isSignUp ? "email" : "text"}
              value={formData.emailOrUsername}
              onChange={(e) => setFormData({ ...formData, emailOrUsername: e.target.value.trim() })}
              className={cn(
                "w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent",
                "bg-white border-gray-300"
              )}
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="password" className="text-sm font-medium">
            Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className={cn(
                "w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent",
                "bg-white border-gray-300"
              )}
              required
              minLength={6}
            />
          </div>
          {isSignUp && (
            <p className="text-xs text-gray-500">
              Password must be at least 6 characters long
            </p>
          )}
        </div>

        {isSignUp && (
          <div className="space-y-2">
            <label htmlFor="confirmPassword" className="text-sm font-medium">
              Confirm Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                id="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className={cn(
                  "w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent",
                  "bg-white border-gray-300"
                )}
                required
                minLength={6}
              />
            </div>
          </div>
        )}

        {error && (
          <div className="p-3 rounded bg-red-50 text-red-600 text-sm flex items-start gap-2">
            <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className={cn(
            "w-full py-2 px-4 rounded-lg text-white font-medium",
            "bg-indigo-600 hover:bg-indigo-700 focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500",
            "transition-colors duration-200",
            loading && "opacity-50 cursor-not-allowed"
          )}
        >
          {loading ? 'Please wait...' : isSignUp ? 'Create Account' : 'Sign In'}
        </button>

        <div className="text-center space-y-2">
          <p className="text-sm text-gray-600">
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setFormData({ emailOrUsername: '', password: '', confirmPassword: '', username: '' });
                setError(null);
                setSuccess(null);
              }}
              className="text-indigo-600 hover:text-indigo-700 font-medium"
            >
              {isSignUp ? 'Sign In' : 'Sign Up'}
            </button>
          </p>
          {!isSignUp && (
            <Link
              to="/reset-password"
              className="block text-sm text-indigo-600 hover:text-indigo-700"
            >
              Forgot your password?
            </Link>
          )}
        </div>
      </form>

      <div className="text-center text-sm text-gray-500">
        By {isSignUp ? 'creating an account' : 'signing in'}, you agree to our{' '}
        <Link
          to="/terms"
          className="text-indigo-600 hover:text-indigo-700"
        >
          Terms of Service
        </Link>{' '}
        and{' '}
        <Link
          to="/privacy"
          className="text-indigo-600 hover:text-indigo-700"
        >
          Privacy Policy
        </Link>
      </div>
    </div>
  );
}