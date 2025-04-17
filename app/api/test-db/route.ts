import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();
    
    // Simple query to test connection
    const { data, error } = await supabase
      .from('property_listings')
      .select('count()', { count: 'exact' })
      .limit(1);
    
    if (error) throw error;
    
    return NextResponse.json({ 
      success: true, 
      message: 'Database connection successful', 
      count: data.length > 0 ? data[0].count : 0
    });
  } catch (error) {
    console.error('Database connection error:', error);
    return NextResponse.json(
      { success: false, message: 'Database connection failed', error },
      { status: 500 }
    );
  }
}
