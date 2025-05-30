import Stripe from 'stripe';
import { loadStripe } from '@stripe/stripe-js';

// サーバーサイド用Stripe設定
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

// クライアントサイド用Stripe設定
export const getStripe = () => {
  return loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
}; 