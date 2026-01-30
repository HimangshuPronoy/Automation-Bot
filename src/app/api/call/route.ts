import { NextRequest, NextResponse } from 'next/server';
import { callLead } from '@/lib/voice/vapi';

/**
 * API route to initiate a call to a lead
 * POST /api/call
 * Body: { leadId: string }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { leadId } = body;

    if (!leadId) {
      return NextResponse.json({ error: 'leadId is required' }, { status: 400 });
    }

    const result = await callLead(leadId);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      callId: result.callId,
      message: 'Call initiated successfully',
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to initiate call', details: String(error) },
      { status: 500 }
    );
  }
}
