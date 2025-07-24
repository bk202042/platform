import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

const searchSchema = z.object({
  query: z.string().min(1).max(100),
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query');

  const validation = searchSchema.safeParse({ query });

  if (!validation.success) {
    return NextResponse.json({ error: validation.error.format() }, { status: 400 });
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('apartments')
    .select('id, name, city:cities(id, name)')
    .textSearch('name', validation.data.query, {
      type: 'websearch',
      config: 'english',
    });

  if (error) {
    console.error('Error searching apartments:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }

  return NextResponse.json(data);
}
