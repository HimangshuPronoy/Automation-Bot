import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { callLead } from '@/lib/voice/vapi';

/**
 * Auto-Caller Worker
 * Automatically calls qualified leads from campaigns with auto_call_enabled=true
 * 
 * GET /api/auto-caller
 */
export async function GET(req: NextRequest) {
  // Optional: Add auth check
  const authHeader = req.headers.get('authorization');
  const expectedKey = process.env.WORKER_SECRET;
  
  if (expectedKey && authHeader !== `Bearer ${expectedKey}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Find campaigns with auto-calling enabled
    const { data: campaigns } = await db
      .from('campaigns')
      .select('id')
      .eq('auto_call_enabled', true)
      .eq('status', 'ACTIVE');

    if (!campaigns || campaigns.length === 0) {
      return NextResponse.json({ message: 'No active auto-call campaigns', called: 0 });
    }

    const campaignIds = campaigns.map(c => c.id);

    // Find qualified leads that haven't been called yet
    const { data: leads } = await db
      .from('leads')
      .select('id, phoneNumber, businessName')
      .in('campaignId', campaignIds)
      .eq('status', 'QUALIFIED') // Only call qualified leads
      .not('phoneNumber', 'is', null)
      .limit(10); // Call max 10 at a time

    if (!leads || leads.length === 0) {
      return NextResponse.json({ message: 'No qualified leads to call', called: 0 });
    }

    // Call each lead
    const results = [];
    for (const lead of leads) {
      try {
        const result = await callLead(lead.id);
        results.push({ leadId: lead.id, success: result.success, callId: result.callId });
      } catch (e) {
        results.push({ leadId: lead.id, success: false, error: String(e) });
      }
    }

    return NextResponse.json({
      message: `Auto-called ${results.length} leads`,
      results,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Auto-caller failed', details: String(error) },
      { status: 500 }
    );
  }
}
