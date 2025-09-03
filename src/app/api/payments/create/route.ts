import { NextResponse } from 'next/server';
import crypto from 'crypto';

function generateSignature(data: Record<string, any>, passPhrase?: string) {
  const sortedKeys = Object.keys(data).sort();
  const queryString = sortedKeys
    .map(key => `${key}=${encodeURIComponent(data[key]).replace(/%20/g, '+')}`)
    .join('&');
  
  const stringToHash = passPhrase
    ? `${queryString}&passphrase=${encodeURIComponent(passPhrase)}` 
    : queryString;
  
  console.log("String to hash:", stringToHash); // Temporary log for debugging
  console.log("Passphrase used:", passPhrase); // Temporary log for debugging
  
  return crypto.createHash('md5').update(stringToHash).digest('hex');
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const rawAmount = body.amount; // Assuming amount comes from the request body
    const customerEmail = body.email_address; // Assuming email comes from the request body

    // Always round to exactly 2 decimal places
    const amount = parseFloat(rawAmount).toFixed(2); // "4024.99"

    // Build PayFast params
    const payfastData = {
      merchant_id: process.env.PAYFAST_MERCHANT_ID,
      merchant_key: process.env.PAYFAST_MERCHANT_KEY,
      return_url: 'https://yourdomain.com/payment/success', // Placeholder
      cancel_url: 'https://yourdomain.com/payment/cancel', // Placeholder
      notify_url: 'https://yourdomain.com/api/payments/notify', // Placeholder
      amount, // must match exactly
      item_name: 'Your Order', // Placeholder
      email_address: customerEmail,
      m_payment_id: body.orderId || `ORDER_temp-order-id_${Date.now()}` // Use orderId from body or generate a temporary one
    };

    // Generate signature
    const signature = generateSignature(payfastData, process.env.PAYFAST_PASSPHRASE);

    // In a real application, you would now send this data to PayFast or return it to the client.
    // For this fix, we are focusing on the amount and signature generation.

    return NextResponse.json({ 
      message: 'Payment data processed successfully', 
      payfastData, 
      signature 
    });

  } catch (error) {
    console.error('Error processing payment:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
