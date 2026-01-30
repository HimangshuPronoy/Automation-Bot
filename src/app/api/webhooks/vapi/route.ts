import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

/**
 * Webhook endpoint for Vapi call status updates
 * POST /api/webhooks/vapi
 * 
 * Configure this URL in your Vapi dashboard under Webhooks
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Vapi sends various event types
    const { type, call } = body;
    
    console.log('Vapi Webhook:', type, call?.id);

    // Handle different event types
    switch (type) {
      case 'call-started':
        // Call has started
        console.log('Call started:', call.id);
        break;
        
      case 'call-ended':
        // Call has ended
        console.log('Call ended:', call.id, 'Duration:', call.duration);
        
        // Update lead status based on call outcome
        if (call.metadata?.leadId) {
          const status = call.endedReason === 'customer-ended' ? 'CONTACTED' : 'NEW';
          await db.from('leads').update({
            status,
            updatedAt: new Date().toISOString(),
          }).eq('id', call.metadata.leadId);
        }
        break;
        
      case 'transcript':
        // Real-time transcript update
        console.log('Transcript:', call.transcript);
        break;
        
      case 'function-call':
        // Handle function calls from the AI (e.g., book_meeting)
        console.log('Function call:', body.functionCall);
        break;
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
