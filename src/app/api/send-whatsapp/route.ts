import { NextRequest, NextResponse } from 'next/server';
import twilio from 'twilio';

/**
 * Send WhatsApp message via Twilio
 * POST /api/send-whatsapp
 */
export async function POST(req: NextRequest) {
  try {
    const { to, message } = await req.json();

    if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
      // If Twilio not configured, log and return success (for dev)
      console.log(`[WhatsApp Mock] To: ${to}, Message: ${message}`);
      return NextResponse.json({ success: true, mock: true });
    }

    const client = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );

    // Format phone number for WhatsApp
    let formattedPhone = to.replace(/\D/g, '');
    if (!formattedPhone.startsWith('1') && formattedPhone.length === 10) {
      formattedPhone = '1' + formattedPhone; // Add US country code
    }

    const result = await client.messages.create({
      body: message,
      from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
      to: `whatsapp:+${formattedPhone}`,
    });

    return NextResponse.json({ success: true, sid: result.sid });
  } catch (error) {
    console.error('WhatsApp error:', error);
    return NextResponse.json({ error: 'Failed to send WhatsApp message' }, { status: 500 });
  }
}
