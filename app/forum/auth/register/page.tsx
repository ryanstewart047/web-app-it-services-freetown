'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForum } from '../../layout';

export default function Register() {
  const router = useRouter();
  const { setUser } = useForum();
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', expertise: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/forum/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setUser(data.user);
        router.push('/forum');
      } else {
        setError(data.error || 'Registration failed');
      }
    } catch (e) {
      setError('A network error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg border border-gray-100">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Join the Forum
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link href="/forum/auth/login" className="font-medium text-blue-600 hover:text-blue-500">
              Sign in
            </Link>
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleRegister}>
          {error && <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm font-medium">{error}</div>}
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Full Name</label>
              <input
                type="text" required
                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm mt-1"
                placeholder="John Doe"
                value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Email Address</label>
              <input
                type="email" required
                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm mt-1"
                placeholder="tech@example.com"
                value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Phone Number (Optional)</label>
              <input
                type="tel"
                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm mt-1"
                placeholder="+232 XX XXX XXX"
                value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Area of Expertise</label>
              <input
                type="text" required
                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm mt-1"
                placeholder="e.g. Hardware Repair, Networking..."
                value={formData.expertise} onChange={e => setFormData({...formData, expertise: e.target.value})}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Password</label>
              <input
                type="password" required
                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm mt-1"
                placeholder="••••••••"
                value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})}
              />
            </div>
          </div>

          <div>
            <button
              type="submit" disabled={loading}
              className="w-full flex justify-center py-2.5 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Registering...' : 'Create Account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
