'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { validateResetToken, resetPassword, getResetTokenInfo } from '@/lib/admin-auth';

export default function ResetPassword() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [tokenValid, setTokenValid] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const urlToken = searchParams.get('token');
    if (urlToken) {
      setToken(urlToken);
    }
  }, [searchParams]);

  useEffect(() => {
    if (token) {
      setChecking(true);
      const isValid = validateResetToken(token);
      setTokenValid(isValid);
      
      if (!isValid) {
        setError('Invalid or expired reset token');
      } else {
        setError('');
      }
      
      setChecking(false);
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Validation
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      setIsLoading(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    try {
      const success = resetPassword(token, newPassword);
      
      if (success) {
        setSuccess(true);
        // Redirect to login after 3 seconds
        setTimeout(() => {
          router.push('/admin/login');
        }, 3000);
      } else {
        setError('Failed to reset password. Token may be invalid or expired.');
      }
    } catch (error) {
      setError('Failed to reset password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (checking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-red-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 shadow-2xl w-full max-w-md text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Validating reset token...</p>
        </div>
      </div>
    );
  }

  if (!tokenValid && !success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-red-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 shadow-2xl w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-600 rounded-full mb-4">
              <i className="fas fa-exclamation-triangle text-white text-xl"></i>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Invalid Token</h1>
            <p className="text-gray-600">The reset token is invalid or has expired</p>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800 text-sm">
              <i className="fas fa-info-circle mr-2"></i>
              Reset tokens expire after 15 minutes. Please request a new one.
            </p>
          </div>

          <div className="space-y-3">
            <Link
              href="/admin/forgot-password"
              className="block w-full py-3 px-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg font-semibold hover:from-orange-600 hover:to-orange-700 transition-all duration-300 transform hover:scale-105 shadow-lg text-center"
            >
              <i className="fas fa-key mr-2"></i>
              Get New Reset Token
            </Link>
            
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

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-red-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 shadow-2xl w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-600 rounded-full mb-4">
              <i className="fas fa-check text-white text-xl"></i>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Password Reset Successful</h1>
            <p className="text-gray-600">Your password has been updated successfully</p>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <p className="text-green-800 text-sm">
              <i className="fas fa-info-circle mr-2"></i>
              You can now login with your new password. Redirecting to login page...
            </p>
          </div>

          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-500 text-sm">Redirecting in 3 seconds...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-red-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-8 shadow-2xl w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-600 rounded-full mb-4">
            <i className="fas fa-lock text-white text-xl"></i>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Reset Password</h1>
          <p className="text-gray-600">Enter your new admin password</p>
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
            <label htmlFor="token" className="block text-sm font-semibold text-gray-700 mb-2">
              <i className="fas fa-key mr-2 text-gray-500"></i>
              Reset Token
            </label>
            <input
              type="text"
              id="token"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:ring-4 focus:ring-green-500/20 transition-all duration-300"
              placeholder="Enter reset token"
              required
            />
          </div>

          <div>
            <label htmlFor="newPassword" className="block text-sm font-semibold text-gray-700 mb-2">
              <i className="fas fa-lock mr-2 text-gray-500"></i>
              New Password
            </label>
            <input
              type="password"
              id="newPassword"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:ring-4 focus:ring-green-500/20 transition-all duration-300"
              placeholder="Enter new password"
              required
              minLength={6}
            />
            <p className="text-xs text-gray-500 mt-1">
              <i className="fas fa-info-circle mr-1"></i>
              Minimum 6 characters
            </p>
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 mb-2">
              <i className="fas fa-lock mr-2 text-gray-500"></i>
              Confirm New Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-green-500 focus:ring-4 focus:ring-green-500/20 transition-all duration-300"
              placeholder="Confirm new password"
              required
              minLength={6}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-semibold hover:from-green-600 hover:to-green-700 transition-all duration-300 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2 inline-block"></div>
                Updating Password...
              </>
            ) : (
              <>
                <i className="fas fa-save mr-2"></i>
                Update Password
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
            <i className="fas fa-shield-alt mr-1"></i>
            Secure password reset for IT Services Freetown
          </p>
        </div>
      </div>
    </div>
  );
}