'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForum } from '../layout';
import Link from 'next/link';

function VerifyEngine() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const { setUser } = useForum();
  
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setErrorMessage('No verification token provided in the URL.');
      return;
    }

    const verify = async () => {
      try {
         const res = await fetch('/api/forum/auth/verify', {
           method: 'POST',
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify({ token })
         });
         
         const data = await res.json();
         if (res.ok && data.success) {
            setUser(data.user);
            setStatus('success');
            // Wait 2 seconds so they see the success message
            setTimeout(() => {
               router.push('/forum');
            }, 2000);
         } else {
            setStatus('error');
            setErrorMessage(data.error || 'Verification failed. The link may have expired or is invalid.');
         }
      } catch (err) {
         setStatus('error');
         setErrorMessage('Network error occurred during verification.');
      }
    };

    verify();
  }, [token, router, setUser]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
       {status === 'verifying' && (
         <div className="flex flex-col items-center animate-pulse">
            <div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mb-6"></div>
            <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-500">Securing Authentication...</h2>
            <p className="text-slate-400 mt-2">Checking cryptographic token...</p>
         </div>
       )}

       {status === 'success' && (
         <div className="flex flex-col items-center animate-fadeIn text-center">
            <div className="w-16 h-16 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center mb-6 ring-2 ring-green-500/50">
               <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">Access Granted</h2>
            <p className="text-slate-400">Email verified successfully. Initiating session and redirecting you to dashboard...</p>
         </div>
       )}

       {status === 'error' && (
         <div className="flex flex-col items-center animate-fadeIn text-center max-w-md">
            <div className="w-16 h-16 bg-red-500/20 text-red-500 rounded-full flex items-center justify-center mb-6 ring-2 ring-red-500/50">
               <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-4">Verification Failed</h2>
            <p className="text-slate-400 bg-slate-800/50 p-4 rounded-lg border border-slate-700 w-full mb-6">
               {errorMessage}
            </p>
            <Link href="/forum/auth/login" className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-lg transition-colors">
               Return to Login
            </Link>
         </div>
       )}
    </div>
  );
}

export default function VerifyPage() {
  return (
    <div className="min-h-screen bg-[#04091a] relative overflow-hidden flex items-center justify-center px-4">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-[30rem] h-[30rem] bg-indigo-600/20 rounded-full blur-[150px] pointer-events-none"></div>
      
      <div className="w-full max-w-lg relative z-10 bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-2xl p-8">
         <Suspense fallback={<div className="text-center text-slate-400">Loading token context...</div>}>
            <VerifyEngine />
         </Suspense>
      </div>
    </div>
  );
}
