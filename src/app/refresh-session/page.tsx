'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';

export default function SessionRefreshPage() {
  const [status, setStatus] = useState('Checking session...');
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const refreshSession = async () => {
      try {
        setStatus('Refreshing session...');
        
        // First check if we have a session
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Session error:', sessionError);
          setStatus('Session error: ' + sessionError.message);
          return;
        }

        if (sessionData.session) {
          setStatus('Session found! Checking user...');
          
          // Verify the user
          const { data: userData, error: userError } = await supabase.auth.getUser();
          
          if (userError) {
            console.error('User error:', userError);
            setStatus('User error: ' + userError.message);
            return;
          }

          if (userData.user) {
            setStatus('✅ Authentication successful! Redirecting to dashboard...');
            
            // Force a full page reload to ensure middleware picks up the session
            setTimeout(() => {
              window.location.href = '/dashboard';
            }, 1000);
          } else {
            setStatus('❌ No user found. Please sign in again.');
            setTimeout(() => {
              router.push('/auth');
            }, 2000);
          }
        } else {
          setStatus('❌ No session found. Please sign in again.');
          setTimeout(() => {
            router.push('/auth');
          }, 2000);
        }
      } catch (error: any) {
        console.error('Refresh error:', error);
        setStatus('Error: ' + error.message);
      }
    };

    refreshSession();
  }, [router, supabase]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Refreshing Session</h1>
        <p className="text-gray-600">{status}</p>
      </div>
    </div>
  );
}
