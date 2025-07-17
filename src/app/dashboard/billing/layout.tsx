import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';

export default async function BillingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient();
  
  // Get authenticated user
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    redirect('/auth');
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      {children}
    </div>
  );
}