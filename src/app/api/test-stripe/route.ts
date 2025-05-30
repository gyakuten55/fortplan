import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';

export async function POST(request: NextRequest) {
  try {
    const results = {
      secretKeyValid: false,
      priceIdValid: false,
      connectionValid: false
    };

    // 1. シークレットキーの確認
    const secretKey = process.env.STRIPE_SECRET_KEY;
    results.secretKeyValid = !!(secretKey && secretKey.startsWith('sk_'));

    // 2. Stripe接続テスト
    try {
      await stripe.customers.list({ limit: 1 });
      results.connectionValid = true;
    } catch (error) {
      console.error('Stripe connection test failed:', error);
      results.connectionValid = false;
    }

    // 3. 価格IDの確認
    const priceId = process.env.STRIPE_PRICE_ID;
    if (priceId) {
      try {
        await stripe.prices.retrieve(priceId);
        results.priceIdValid = true;
      } catch (error) {
        console.error('Price ID validation failed:', error);
        results.priceIdValid = false;
      }
    }

    return NextResponse.json(results);
  } catch (error) {
    console.error('Stripe test failed:', error);
    return NextResponse.json(
      { 
        error: 'テストでエラーが発生しました',
        secretKeyValid: false,
        priceIdValid: false,
        connectionValid: false
      },
      { status: 500 }
    );
  }
} 