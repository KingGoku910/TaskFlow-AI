'use client';
export const dynamic = 'force-dynamic';

import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';

export default function FixAuthPage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const router = useRouter();
  const supabase = createClient();

  const handleSignIn = async () => {
    setLoading(true);
    setMessage('');

    try {
      // First try to get the current session
      const { data: session } = await supabase.auth.getSession();
      console.log('Current session:', session);

      // If no session, try to refresh
      if (!session.session) {
        const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
        console.log('Refresh attempt:', refreshData, refreshError);
        
        if (refreshError) {
          setMessage(`Refresh failed: ${refreshError.message}`);
          return;
        }
      }

      // Check if user exists
      const { data: user, error: userError } = await supabase.auth.getUser();
      console.log('User check:', user, userError);

      if (user.user) {
        setMessage('✅ User authenticated successfully! Redirecting to dashboard...');
        setTimeout(() => {
          router.push('/dashboard');
        }, 2000);
      } else {
        setMessage('❌ No user found. You may need to sign in again.');
      }

    } catch (error: any) {
      console.error('Auth fix error:', error);
      setMessage(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleManualSignIn = async () => {
    setLoading(true);
    setMessage('');

    try {
      // Try to sign in with the known email
      const { data, error } = await supabase.auth.signInWithOtp({
        email: 'ryno.rossouw@outlook.com',
        options: {
          shouldCreateUser: false // Don't create a new user
        }
      });

      if (error) {
        setMessage(`Sign in failed: ${error.message}`);
        console.error('Sign in error:', error);
        return;
      }

      setMessage('✅ Magic link sent! Check your email and click the link to complete sign in.');

    } catch (error: any) {
      console.error('Manual sign in error:', error);
      setMessage(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleClearSession = async () => {
    setLoading(true);
    setMessage('');

    try {
      await supabase.auth.signOut();
      setMessage('✅ Session cleared. You can now try signing in again.');
      
      // Clear local storage
      localStorage.clear();
      sessionStorage.clear();
      
      // Redirect to home
      setTimeout(() => {
        router.push('/');
      }, 2000);

    } catch (error: any) {
      console.error('Clear session error:', error);
      setMessage(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-lg">
      <h1 className="text-2xl font-bold mb-6 text-center">🔧 Fix Authentication</h1>
      
      <div className="space-y-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="font-semibold text-blue-800">Your Account Details:</h3>
          <p className="text-sm text-blue-600">Email: ryno.rossouw@outlook.com</p>
          <p className="text-sm text-blue-600">UID: b379b911-7ad3-4c04-af6b-7f1e9bed0f33</p>
          <p className="text-sm text-blue-600">Last signed in: Today at 12:09</p>
        </div>

        <button
          onClick={handleSignIn}
          disabled={loading}
          className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? 'Checking...' : '1. Check Current Session'}
        </button>

        <button
          onClick={handleManualSignIn}
          disabled={loading}
          className="w-full bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 disabled:opacity-50"
        >
          {loading ? 'Sending...' : '2. Send Magic Link'}
        </button>

        <button
          onClick={handleClearSession}
          disabled={loading}
          className="w-full bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600 disabled:opacity-50"
        >
          {loading ? 'Clearing...' : '3. Clear Session & Restart'}
        </button>

        {message && (
          <div className={`p-3 rounded-lg ${
            message.includes('✅') ? 'bg-green-50 text-green-700' : 
            message.includes('❌') ? 'bg-red-50 text-red-700' : 
            'bg-yellow-50 text-yellow-700'
          }`}>
            {message}
          </div>
        )}
      </div>
    </div>
  );
}
