'use client';
export const dynamic = 'force-dynamic';

import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';

export default function QuickSignInPage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const router = useRouter();
  const supabase = createClient();

  const handleQuickSignIn = async () => {
    setLoading(true);
    setMessage('Sending magic link...');

    try {
      const emailRedirectTo = typeof window !== 'undefined' ? `${window.location.origin}/refresh-session` : undefined;
      const { data, error } = await supabase.auth.signInWithOtp({
        email: 'ryno.rossouw@outlook.com',
        options: {
          shouldCreateUser: false,
          emailRedirectTo
        }
      });

      if (error) {
        setMessage(`❌ Error: ${error.message}`);
        console.error('Magic link error:', error);
        return;
      }

      setMessage('✅ Magic link sent to ryno.rossouw@outlook.com! Check your email and click the link to sign in.');

    } catch (error: any) {
      console.error('Quick sign in error:', error);
      setMessage(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    setLoading(true);
    setMessage('Sending password reset...');

    try {
      const redirectTo = typeof window !== 'undefined' ? `${window.location.origin}/reset-password` : undefined;
      const { error } = await supabase.auth.resetPasswordForEmail('ryno.rossouw@outlook.com', {
        redirectTo
      });

      if (error) {
        setMessage(`❌ Error: ${error.message}`);
        console.error('Password reset error:', error);
        return;
      }

      setMessage('✅ Password reset link sent to ryno.rossouw@outlook.com! Check your email.');

    } catch (error: any) {
      console.error('Password reset error:', error);
      setMessage(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-lg">
      <h1 className="text-2xl font-bold mb-6 text-center">🚀 Quick Sign In</h1>
      
      <div className="space-y-4">
        <div className="bg-green-50 p-4 rounded-lg">
          <h3 className="font-semibold text-green-800">Your Account:</h3>
          <p className="text-sm text-green-600">ryno.rossouw@outlook.com</p>
          <p className="text-sm text-green-600">✅ Confirmed and active</p>
        </div>

        <button
          onClick={handleQuickSignIn}
          disabled={loading}
          className="w-full bg-blue-500 text-white py-3 px-4 rounded-lg hover:bg-blue-600 disabled:opacity-50 font-medium"
        >
          {loading ? 'Sending...' : '🔐 Send Magic Link'}
        </button>

        <div className="text-center text-gray-500">or</div>

        <button
          onClick={handlePasswordReset}
          disabled={loading}
          className="w-full bg-orange-500 text-white py-3 px-4 rounded-lg hover:bg-orange-600 disabled:opacity-50 font-medium"
        >
          {loading ? 'Sending...' : '🔑 Reset Password'}
        </button>

        <button
          onClick={() => router.push('/auth')}
          className="w-full bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600 font-medium"
        >
          ← Back to Auth Page
        </button>

        {message && (
          <div className={`p-3 rounded-lg ${
            message.includes('✅') ? 'bg-green-50 text-green-700' : 
            message.includes('❌') ? 'bg-red-50 text-red-700' : 
            'bg-blue-50 text-blue-700'
          }`}>
            {message}
          </div>
        )}
      </div>
    </div>
  );
}
