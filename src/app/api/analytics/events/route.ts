import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function GET() {
  const supabase = createRouteHandlerClient({ cookies });
  // Note: The 'group' method is not directly available on the Supabase client for aggregation.
  // To get event counts, consider creating a PostgreSQL function/view in Supabase and calling it via .rpc(),
  // or fetching all events and performing client-side aggregation if the dataset is small.
  const { data: events, error } = await supabase.from('analytics').select('event');

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(events);
}
