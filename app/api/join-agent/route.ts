import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { AgentRegistrationSchema } from '@/lib/validation/agent-registration';
import AgentRegistrationEmail from '@/app/emails/AgentRegistrationEmail';
// Uncomment if database storage is needed
// import { createClient } from '@/lib/supabase/server';

// Initialize Resend email client
const resend = new Resend(process.env.RESEND_API_KEY);

// Environment variables for email configuration
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@bkmind.com';
const FROM_EMAIL = process.env.FROM_EMAIL || 'admin@bkmind.com';

// Rate limiting for submissions (simple in-memory implementation)
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour in milliseconds
const MAX_REQUESTS_PER_IP = 5;
const ipRequestCounts: Record<string, { count: number; timestamp: number }> = {};

/**
 * Clean up old rate limit entries
 */
function cleanupRateLimits() {
  const now = Date.now();
  for (const [ip, data] of Object.entries(ipRequestCounts)) {
    if (now - data.timestamp > RATE_LIMIT_WINDOW) {
      delete ipRequestCounts[ip];
    }
  }
}

/**
 * Check if IP is rate limited
 */
function isRateLimited(ip: string): boolean {
  cleanupRateLimits();
  const now = Date.now();
  
  if (!ipRequestCounts[ip]) {
    ipRequestCounts[ip] = { count: 1, timestamp: now };
    return false;
  }
  
  if (now - ipRequestCounts[ip].timestamp > RATE_LIMIT_WINDOW) {
    ipRequestCounts[ip] = { count: 1, timestamp: now };
    return false;
  }
  
  if (ipRequestCounts[ip].count >= MAX_REQUESTS_PER_IP) {
    return true;
  }
  
  ipRequestCounts[ip].count++;
  return false;
}

export async function POST(req: NextRequest) {
  try {
    // Extract client IP for rate limiting
    const ip = req.headers.get('x-forwarded-for') || 'unknown';
    
    // Check rate limiting
    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }
    
    // Parse and validate request body
    const body = await req.json();
    const result = AgentRegistrationSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.format() },
        { status: 400 }
      );
    }

    const { firstName, lastName, salesVolume, email, phone, zipCode } = result.data;
    
    // Get Supabase client (optional - if you want to store registrations in DB)
    // Uncomment if you want to save to database
    /*
    const supabase = createClient();
    const { error: dbError } = await supabase
      .from('agent_registrations')
      .insert({
        first_name: firstName,
        last_name: lastName,
        sales_volume: salesVolume,
        email,
        phone,
        zip_code: zipCode
      });
    
    if (dbError) {
      console.error('Database error:', dbError);
      return NextResponse.json(
        { error: 'Failed to store registration' },
        { status: 500 }
      );
    }
    */

    // Send email notification
    const emailResponse = await resend.emails.send({
      from: FROM_EMAIL,
      to: [ADMIN_EMAIL],
      cc: [email],
      subject: 'New Agent Registration - VinaHome',
      react: AgentRegistrationEmail({ 
        firstName, 
        lastName, 
        salesVolume, 
        email, 
        phone, 
        zipCode 
      }) as React.ReactElement,
    });

    if (emailResponse.error) {
      console.error('Email error:', emailResponse.error);
      return NextResponse.json(
        { error: 'Failed to send email notification' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true,
      message: 'Agent registration submitted successfully'
    });
    
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
