
'use client';

import React, { useState, useEffect, useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { useRouter } from 'next/navigation';
import { signUpWithEmailPassword, handleForgotPassword, signOut as serverSignOut, type FormState } from './actions';
import { createClient } from '@/utils/supabase/client';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Mail, KeyRound, LogIn, UserPlus, AlertCircle, Loader2, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const GoogleIcon = () => <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-.97 2.47-1.94 3.21v2.75H21c1.74-1.57 2.74-4.02 2.74-6.97z"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.89-3.01c-.98.66-2.23 1.06-3.39 1.06-2.6 0-4.82-1.76-5.6-4.15H2.47v3.14C4.42 20.45 7.94 23 12 23z" /><path d="M5.6 14.31c-.17-.52-.27-1.07-.27-1.64s.1-1.12.27-1.64V7.91H2.47c-.64 1.28-1 2.68-1 4.19s.36 2.91 1 4.19l3.13-2.97z"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.27-3.27C17.45 2.09 14.97 1 12 1 7.94 1 4.42 3.55 2.47 7.91l3.13 3.01c.78-2.39 3-4.15 5.6-4.15z" fillRule="evenodd" clipRule="evenodd"/></svg>;
const GithubIcon = () => <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>;
const FacebookIcon = () => <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v7.009A9.996 9.996 0 0022 12z"/></svg>;
const LinkedInIcon = () => <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z"/></svg>;


function SubmitButton({ pendingText, children }: { pendingText: string, children: React.ReactNode }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" disabled={pending}>
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          {pendingText}
        </>
      ) : children}
    </Button>
  );
}

export default function AuthPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isClient, setIsClient] = useState(false);
  const [signInError, setSignInError] = useState<string | null>(null);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [showSignInPassword, setShowSignInPassword] = useState(false);
  const [showSignUpPassword, setShowSignUpPassword] = useState(false);

  const [signUpState, signUpAction] = useActionState(signUpWithEmailPassword, null);
  const [forgotPasswordState, forgotPasswordAction] = useActionState(handleForgotPassword, null);

  const [showForgotPassword, setShowForgotPassword] = useState(false);

  useEffect(() => {
    setIsClient(true);
    // Supabase Auth: No need for onAuthStateChanged, use session directly
  }, [router]);

  useEffect(() => {
    if (signUpState?.type === 'error') {
      toast({ title: "Sign Up Failed", description: signUpState.message, variant: "destructive" });
    }
    if (signUpState?.type === 'success') {
      toast({ title: "Sign Up Successful", description: "Redirecting to dashboard..." });
      // Redirect to dashboard after successful signup
      setTimeout(() => {
        router.push('/dashboard');
      }, 1000);
    }
  }, [signUpState, toast, router]);

  useEffect(() => {
    if (forgotPasswordState?.type === 'error') {
      toast({ title: "Error", description: forgotPasswordState.message, variant: "destructive" });
    }
    if (forgotPasswordState?.type === 'success') {
      toast({ title: "Success", description: forgotPasswordState.message });
      setShowForgotPassword(false);
    }
  }, [forgotPasswordState, toast]);

  const handleClientSignIn = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSigningIn(true);
    setSignInError(null);
    const formData = new FormData(event.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) {
        setSignInError(error.message || "Sign in failed. Please check your credentials.");
        setIsSigningIn(false);
        return;
      }

      if (data.user) {
        // Redirect to session refresh page to ensure proper authentication
        window.location.href = '/refresh-session';
      }
    } catch (error: any) {
      setSignInError(error.message || "Sign in failed. Please check your credentials.");
      setIsSigningIn(false);
    }
  };

  const handleOAuthSignIn = async (providerName: 'google' | 'github') => {
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOAuth({ provider: providerName });
      if (error) {
        toast({ title: "OAuth Sign In Failed", description: error.message || "Failed to sign in with provider.", variant: "destructive" });
      }
      // Supabase will redirect automatically
    } catch (error: any) {
      console.error("OAuth sign-in error:", error);
      toast({ title: "OAuth Sign In Failed", description: error.message || "Failed to sign in with provider.", variant: "destructive" });
    }
  };

  if (!isClient) {
    return <div className="flex justify-center items-center h-screen"><Loader2 className="h-16 w-16 animate-spin text-primary" /></div>;
  }

  if (showForgotPassword) {
    return (
      <Card className="border-primary/20 bg-card">
        <CardHeader className="border-b border-primary/10">
          <CardTitle className="text-primary">Forgot Password</CardTitle>
          <CardDescription>Enter your email to receive a password reset link.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={forgotPasswordAction} className="space-y-4">
            <div>
              <Label htmlFor="forgot-email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="forgot-email" name="email" type="email" placeholder="m@example.com" required className="pl-8" autoComplete="email" />
              </div>
            </div>
            {forgotPasswordState?.type === 'error' && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{forgotPasswordState.message}</AlertDescription>
              </Alert>
            )}
            <SubmitButton pendingText="Sending...">Send Reset Link</SubmitButton>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button variant="link" className="text-primary hover:text-primary/80" onClick={() => setShowForgotPassword(false)}>Back to Sign In</Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Tabs defaultValue="signin" className="w-full">
      <TabsList className="grid w-full grid-cols-2 border-primary/20">
        <TabsTrigger value="signin" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"><LogIn className="mr-2 h-4 w-4" />Sign In</TabsTrigger>
        <TabsTrigger value="signup" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"><UserPlus className="mr-2 h-4 w-4" />Sign Up</TabsTrigger>
      </TabsList>
      <TabsContent value="signin">
        <Card className="border-primary/20 bg-card">
          <CardHeader className="border-b border-primary/10">
            <CardTitle className="text-primary">Sign In</CardTitle>
            <CardDescription>Access your TaskFlow AI dashboard.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleClientSignIn} className="space-y-4">
              <div>
                <Label htmlFor="signin-email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input id="signin-email" name="email" type="email" placeholder="m@example.com" required className="pl-8" autoComplete="email" />
                </div>
              </div>
              <div>
                <div className="flex justify-between">
                  <Label htmlFor="signin-password">Password</Label>
                  <Button variant="link" size="sm" className="h-auto p-0 text-xs text-primary hover:text-primary/80" onClick={() => setShowForgotPassword(true)}>
                    Forgot password?
                  </Button>
                </div>
                <div className="relative">
                  <KeyRound className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="signin-password" 
                    name="password" 
                    type={showSignInPassword ? "text" : "password"} 
                    required 
                    className="pl-8 pr-10" 
                    autoComplete="current-password" 
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowSignInPassword(!showSignInPassword)}
                  >
                    {showSignInPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </div>
              {signInError && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Sign In Failed</AlertTitle>
                    <AlertDescription>{signInError}</AlertDescription>
                </Alert>
              )}
               <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" disabled={isSigningIn}>
                  {isSigningIn ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing In...
                    </>
                  ) : 'Sign In'}
                </Button>
            </form>
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or continue with
                </span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" className="border-primary/30 hover:bg-primary/10 hover:text-primary" onClick={() => handleOAuthSignIn('google')}><GoogleIcon /> Google</Button>
              <Button variant="outline" className="border-primary/30 hover:bg-primary/10 hover:text-primary" onClick={() => handleOAuthSignIn('github')}><GithubIcon /> GitHub</Button>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="signup">
        <Card className="border-primary/20 bg-card">
          <CardHeader className="border-b border-primary/10">
            <CardTitle className="text-primary">Sign Up</CardTitle>
            <CardDescription>Create your TaskFlow AI account.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form action={signUpAction} className="space-y-4">
              <div>
                <Label htmlFor="signup-username">Username</Label>
                <div className="relative">
                  <UserPlus className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input id="signup-username" name="username" type="text" placeholder="johndoe" required className="pl-8" autoComplete="username" />
                </div>
                <p className="text-xs text-muted-foreground mt-1">Choose a unique username to personalize your experience.</p>
              </div>
              <div>
                <Label htmlFor="signup-email">Email</Label>
                 <div className="relative">
                    <Mail className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input id="signup-email" name="email" type="email" placeholder="m@example.com" required className="pl-8" autoComplete="email" />
                </div>
              </div>
              <div>
                <Label htmlFor="signup-password">Password</Label>
                <div className="relative">
                  <KeyRound className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="signup-password" 
                    name="password" 
                    type={showSignUpPassword ? "text" : "password"} 
                    placeholder="••••••••" 
                    required 
                    className="pl-8 pr-10" 
                    autoComplete="new-password" 
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowSignUpPassword(!showSignUpPassword)}
                  >
                    {showSignUpPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
                 <p className="text-xs text-muted-foreground mt-1">Password must be at least 6 characters.</p>
              </div>
              {signUpState?.type === 'error' && (
                 <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Sign Up Failed</AlertTitle>
                    <AlertDescription>
                        {signUpState.message}
                        {signUpState.issues && (
                            <ul className="list-disc list-inside mt-1">
                                {signUpState.issues.map((issue, i) => <li key={i}>{issue}</li>)}
                            </ul>
                        )}
                    </AlertDescription>
                </Alert>
              )}
              <SubmitButton pendingText="Signing Up...">Create Account</SubmitButton>
            </form>
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or sign up with
                </span>
              </div>
            </div>
             <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" className="border-primary/30 hover:bg-primary/10 hover:text-primary" onClick={() => handleOAuthSignIn('google')}><GoogleIcon /> Google</Button>
              <Button variant="outline" className="border-primary/30 hover:bg-primary/10 hover:text-primary" onClick={() => handleOAuthSignIn('github')}><GithubIcon /> GitHub</Button>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
