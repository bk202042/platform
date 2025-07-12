import { NextResponse } from 'next/server';
import { getApartments } from '@/lib/data/community';

export async function GET() {
  try {
    const apartments = await getApartments();
    return NextResponse.json(apartments);
  } catch (error) {
    console.error('Failed to fetch apartments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch apartments' },
      { status: 500 }
    );
  }
}
