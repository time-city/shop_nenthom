import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { OrderService } from '@/src/lib/services/order.service';
import prisma from '@/src/lib/prisma';

function verifySePaySignature(secretKey: string, signatureHeader: string | null, rawBody: string): boolean {
  if (!signatureHeader || !secretKey) return false;
  
  // Method 1: Check if it's the exact HMAC of the raw body
  const expectedHash = crypto.createHmac('sha256', secretKey).update(rawBody).digest('hex');
  if (expectedHash === signatureHeader.replace('sha256=', '')) {
    return true;
  }
  
  return false;
}

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('Authorization')?.replace('Apikey ', '') 
      || req.headers.get('x-sepay-signature') 
      || req.headers.get('sepay-signature');

    const secret = process.env.SEPAY_WEBHOOK_SECRET;

    // First try: Simple token match (API Key mode)
    let isVerified = false;
    if (signature === secret) {
      isVerified = true;
    } 
    // Second try: HMAC-SHA256
    else if (secret && signature && verifySePaySignature(secret, signature, rawBody)) {
      isVerified = true;
    }

    if (!isVerified) {
      console.error('[SePay Webhook] Authentication failed.');
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const payload = JSON.parse(rawBody);
    console.log('[SePay Webhook] Incoming Payload:', JSON.stringify(payload, null, 2));

    // Validate payload
    if (!payload || !payload.id || !payload.transferAmount || !payload.content) {
      return NextResponse.json({ success: false, message: 'Invalid payload' }, { status: 400 });
    }

    // Check idempotency early
    const existingLog = await prisma.webhookLog.findUnique({
      where: { event_id: String(payload.id) }
    });
    if (existingLog) {
      console.log(`[SePay Webhook] Event ${payload.id} already processed.`);
      return NextResponse.json({ success: true, message: 'Already processed' });
    }

    const result = await OrderService.confirmSepayPayment({
      amountIn: Number(payload.transferAmount),
      orderNumber: payload.content, // OrderService uses includes() to match
      transactionDate: payload.transactionDate,
      transactionId: String(payload.referenceCode || payload.id),
      eventId: String(payload.id),
    });

    console.log('[SePay Webhook] Processed Successfully. Result:', result);

    return NextResponse.json({ success: true, result });
  } catch (error: any) {
    console.error('[SePay Webhook] Error:', error);
    // Return 200 so SePay doesn't retry infinitely on business logic errors like "Order not found"
    return NextResponse.json({ success: false, message: error.message }, { status: 200 }); 
  }
}
