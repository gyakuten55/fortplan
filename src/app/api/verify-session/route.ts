import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';

export async function POST(request: NextRequest) {
  try {
    const { sessionId } = await request.json();

    if (!sessionId) {
      return NextResponse.json(
        { error: 'セッションIDが提供されていません' },
        { status: 400 }
      );
    }

    // Stripeセッションを検証
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== 'paid') {
      return NextResponse.json(
        { error: '決済が完了していません' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      session: {
        id: session.id,
        customer_email: session.customer_details?.email,
        payment_status: session.payment_status,
        amount_total: session.amount_total
      }
    });

  } catch (error) {
    console.error('Session verification failed:', error);
    return NextResponse.json(
      { error: 'セッション検証に失敗しました' },
      { status: 500 }
    );
  }
} 