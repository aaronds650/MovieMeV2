import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
// Removed Supabase import
import { cn } from '../../lib/utils';
import { Mail, ArrowLeft, AlertCircle, CheckCircle2 } from 'lucide-react';

export function PasswordReset() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Mock password reset
      await new Promise(resolve => setTimeout(resolve, 1000));
      const resetError = null; // Mock success

      if (resetError) throw resetError;
      setSuccess(true);
    } catch (err) {
      console.error('Password reset error:', err);
      setError(err instanceof Error ? err.message : 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 space-y-6">
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => navigate('/login')}
          className="text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-2xl font-bold">Reset Password</h1>
      </div>

      {success ? (
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <CheckCircle2 className="h-12 w-12 text-green-500" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900">Check your email</h2>
          <p className="text-gray-600">
            We've sent a password reset link to <strong>{email}</strong>. Click the link in the email to reset your password.
          </p>
          <div className="pt-4">
            <button
              onClick={() => navigate('/login')}
              className="text-indigo-600 hover:text-indigo-700 font-medium"
            >
              Return to Sign In
            </button>
          </div>
        </div>
      ) : (
        <>
          <p className="text-gray-600">
            Enter your email address and we'll send you a link to reset your password.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value.trim())}
                  className={cn(
                    "w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent",
                    "bg-white border-gray-300"
                  )}
                  required
                  placeholder="Enter your email"
                />
              </div>
            </div>

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
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Back to Sign In
              </button>
            </div>
          </form>
        </>
      )}
    </div>
  );
}