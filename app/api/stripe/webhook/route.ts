import Stripe from 'stripe';
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

export const runtime = 'nodejs';

function stripeClient() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error('STRIPE_SECRET_KEY is not configured');
  return new Stripe(key);
}

async function enrollFromPayment(email: string | null, metadata: Stripe.Metadata | null | undefined) {
  const courseId = metadata?.course_id;
  if (!email || !courseId) throw new Error('Stripe event is missing customer email or metadata.course_id');
  const db = supabaseAdmin();
  const { data: profile, error: profileError } = await db.from('profiles').select('id').ilike('email', email).maybeSingle();
  if (profileError) throw profileError;
  if (!profile) throw new Error(`No OMB profile exists for ${email}`);
  const { data: course, error: courseError } = await db.from('courses').select('id').eq('id', courseId).maybeSingle();
  if (courseError) throw courseError;
  if (!course) throw new Error(`Unknown course_id ${courseId}`);
  const { error } = await db.from('enrollments').upsert({ user_id: profile.id, course_id: course.id }, { onConflict: 'user_id,course_id', ignoreDuplicates: true });
  if (error) throw error;
}

export async function POST(request: Request) {
  const signature = request.headers.get('stripe-signature');
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!signature || !secret) return NextResponse.json({ error: 'Stripe webhook is not configured' }, { status: 500 });
  let event: Stripe.Event;
  try { event = stripeClient().webhooks.constructEvent(await request.text(), signature, secret); }
  catch { return NextResponse.json({ error: 'Invalid Stripe signature' }, { status: 400 }); }
  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const email = session.customer_details?.email ?? session.customer_email;
      await enrollFromPayment(email, session.metadata);
    } else if (event.type === 'payment_intent.succeeded') {
      const intent = event.data.object as Stripe.PaymentIntent;
      await enrollFromPayment(intent.receipt_email, intent.metadata);
    }
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('stripe_enrollment_failed', { eventId: event.id, error: error instanceof Error ? error.message : 'unknown' });
    return NextResponse.json({ error: 'Enrollment processing failed' }, { status: 500 });
  }
}
