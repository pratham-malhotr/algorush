import { NextResponse } from 'next/server';
import { 
  MERCHANT_BTC_ADDRESS, 
  PAYMENT_EXPIRY_MINUTES, 
  calculateBTCAmount, 
  generateBitcoinPaymentUri,
  BTCOrder 
} from '@/lib/payments/btc';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { plan = 'PRO', billingCycle = 'monthly', amountUSD = 59 } = body;

    const { btcAmount, btcPrice } = await calculateBTCAmount(amountUSD);
    const now = Date.now();
    const expiresAt = now + PAYMENT_EXPIRY_MINUTES * 60 * 1000;
    const orderId = `INV-BTC-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    const { bip21Uri, qrCodeUrl } = generateBitcoinPaymentUri(
      MERCHANT_BTC_ADDRESS,
      btcAmount,
      `AlgoText ${plan} Plan (${billingCycle})`
    );

    const order: BTCOrder = {
      orderId,
      plan,
      billingCycle,
      amountUSD,
      amountBTC: btcAmount,
      btcPriceUSD: btcPrice,
      walletAddress: MERCHANT_BTC_ADDRESS,
      qrCodeUrl,
      bip21Uri,
      createdAt: now,
      expiresAt,
      status: 'PENDING'
    };

    return NextResponse.json({
      success: true,
      order
    });
  } catch (error: any) {
    console.error('Error creating BTC payment order:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create Bitcoin payment order' },
      { status: 500 }
    );
  }
}
