import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { RequestInfoSchema } from '@/lib/validation/request-info';
import RequestInfoEmail from '@/app/emails/RequestInfoEmail';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = RequestInfoSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.format() },
        { status: 400 }
      );
    }

    const { name, email, phone, message } = result.data;

    const data = await resend.emails.send({
      from: 'admin@bkmind.com',
      to: ['admin@bkmind.com'],
      cc: [email],
      subject: 'Property Info Request',
      react: RequestInfoEmail({ name, email, phone, message })
    });

    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Server error' }, { status: 500 });
  }
}
