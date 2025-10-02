'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { generateResetToken } from '@/lib/admin-auth';
import { sendResetNotification } from '@/lib/reset-notifications';

export default function ForgotPassword() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [resetToken, setResetToken] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess(false);

    try {
      const token = generateResetToken(username);
      
      if (token) {
        // Send notification (logs to console in development)
        await sendResetNotification(token);
        
        setResetToken(token);
        setSuccess(true);
        
        // In production, you'd send this token via email
        // For now, we'll display it on screen
      } else {
        setError('Username not found');
      }
    } catch (error) {
      setError('Failed to generate reset token. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(e.target.value);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-red-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 shadow-2xl w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-600 rounded-full mb-4">
              <i className="fas fa-check text-white text-xl"></i>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Reset Token Generated</h1>
            <p className="text-gray-600">Your password reset token has been created</p>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="flex items-center mb-2">
              <i className="fas fa-info-circle text-green-500 mr-2"></i>
              <span className="text-green-800 font-semibold">Reset Token:</span>
            </div>
            <div className="bg-white border rounded p-3 font-mono text-sm break-all">
              {resetToken}
            </div>
            <p className="text-xs text-green-700 mt-2">
              <i className="fas fa-clock mr-1"></i>
              Token expires in 15 minutes
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-blue-800 text-sm">
              <i className="fas fa-lightbulb mr-2"></i>
              Copy the token above and use it on the reset password page.
            </p>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => router.push(`/admin/reset-password?token=${resetToken}`)}
              className="w-full py-3 px-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-semibold hover:from-green-600 hover:to-green-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              <i className="fas fa-key mr-2"></i>
              Reset Password Now
            </button>
            
            <Link
              href="/admin/login"
              className="block w-full py-3 px-4 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-all duration-300 text-center"
            >
              <i className="fas fa-arrow-left mr-2"></i>
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-red-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-8 shadow-2xl w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-600 rounded-full mb-4">
            <i className="fas fa-key text-white text-xl"></i>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Forgot Password</h1>
          <p className="text-gray-600">Enter your username to reset your password</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <i className="fas fa-exclamation-triangle text-red-500 mr-2"></i>
                <span className="text-red-700">{error}</span>
              </div>
            </div>
          )}

          <div>
            <label htmlFor="username" className="block text-sm font-semibold text-gray-700 mb-2">
              <i className="fas fa-user mr-2 text-gray-500"></i>
              Username
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={username}
              onChange={handleChange}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:ring-4 focus:ring-orange-500/20 transition-all duration-300"
              placeholder="Enter your admin username"
              required
              autoComplete="username"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg font-semibold hover:from-orange-600 hover:to-orange-700 transition-all duration-300 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2 inline-block"></div>
                Generating Token...
              </>
            ) : (
              <>
                <i className="fas fa-paper-plane mr-2"></i>
                Generate Reset Token
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-gray-200 text-center space-y-2">
          <Link
            href="/admin/login"
            className="text-gray-600 hover:text-gray-800 transition-colors text-sm"
          >
            <i className="fas fa-arrow-left mr-1"></i>
            Back to Login
          </Link>
          
          <p className="text-xs text-gray-500">
            <i className="fas fa-info-circle mr-1"></i>
            Reset tokens expire after 15 minutes
          </p>
        </div>
      </div>
    </div>
  );
}