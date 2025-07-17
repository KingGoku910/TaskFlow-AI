'use client';

import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createTestUser, checkAuthStatus } from './actions';
import { listAllUsers, deleteTestUser, checkUserByEmail } from './user-actions';

export default function DebugAuthPage() {
  const [authInfo, setAuthInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('test@example.com');

  const checkAuth = async () => {
    setLoading(true);
    try {
      const supabase = createClient();
      
      // Get current session
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      // Get current user
      const { data: userData, error: userError } = await supabase.auth.getUser();

      // Also check server-side auth
      const serverAuth = await checkAuthStatus();

      setAuthInfo({
        client: {
          session: sessionData,
          sessionError,
          user: userData,
          userError,
        },
        server: serverAuth,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      setAuthInfo({
        error: error,
        timestamp: new Date().toISOString()
      });
    } finally {
      setLoading(false);
    }
  };

  const testSignIn = async () => {
    setLoading(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email: 'test@example.com',
        password: 'testpassword'
      });
      
      setAuthInfo({
        signInResult: { data, error },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      setAuthInfo({
        signInError: error,
        timestamp: new Date().toISOString()
      });
    } finally {
      setLoading(false);
    }
  };

  const createUser = async () => {
    setLoading(true);
    try {
      const result = await createTestUser();
      setAuthInfo({
        createUserResult: result,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      setAuthInfo({
        createUserError: error,
        timestamp: new Date().toISOString()
      });
    } finally {
      setLoading(false);
    }
  };

  const listUsers = async () => {
    setLoading(true);
    try {
      const result = await listAllUsers();
      setAuthInfo({
        allUsers: result,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      setAuthInfo({
        listUsersError: error,
        timestamp: new Date().toISOString()
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async () => {
    setLoading(true);
    try {
      const result = await deleteTestUser();
      setAuthInfo({
        deleteUserResult: result,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      setAuthInfo({
        deleteUserError: error,
        timestamp: new Date().toISOString()
      });
    } finally {
      setLoading(false);
    }
  };

  const checkSpecificUser = async () => {
    setLoading(true);
    try {
      const result = await checkUserByEmail(email);
      setAuthInfo({
        userCheck: result,
        email,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      setAuthInfo({
        userCheckError: error,
        timestamp: new Date().toISOString()
      });
    } finally {
      setLoading(false);
    }
  };

  const clearAuth = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setAuthInfo(null);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Authentication Debug</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="font-medium mb-3">Authentication Testing</h3>
            <div className="flex gap-4 flex-wrap">
              <Button onClick={checkAuth} disabled={loading}>
                Check Auth Status
              </Button>
              <Button onClick={testSignIn} disabled={loading}>
                Test Sign In
              </Button>
              <Button onClick={clearAuth} variant="outline">
                Clear Auth
              </Button>
            </div>
          </div>

          <div>
            <h3 className="font-medium mb-3">User Management</h3>
            <div className="flex gap-4 flex-wrap">
              <Button onClick={listUsers} disabled={loading}>
                List All Users
              </Button>
              <Button onClick={createUser} disabled={loading}>
                Create Test User
              </Button>
              <Button onClick={deleteUser} disabled={loading} variant="destructive">
                Delete Test User
              </Button>
            </div>
          </div>

          <div>
            <h3 className="font-medium mb-3">Check Specific User</h3>
            <div className="flex gap-4 items-end">
              <div className="flex-1">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter email to check"
                />
              </div>
              <Button onClick={checkSpecificUser} disabled={loading}>
                Check User
              </Button>
            </div>
          </div>
          
          {authInfo && (
            <div className="bg-gray-100 p-4 rounded-md">
              <pre className="text-sm overflow-auto max-h-96">
                {JSON.stringify(authInfo, null, 2)}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
