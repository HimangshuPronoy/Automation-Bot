import { NextResponse } from 'next/server';

const VAPI_API_URL = 'https://api.vapi.ai';

/**
 * GET /api/recordings
 * Fetches recent calls with recordings from Vapi
 */
export async function GET() {
  const apiKey = process.env.VAPI_API_KEY;
  
  if (!apiKey) {
    return NextResponse.json({ error: 'VAPI_API_KEY not configured' }, { status: 500 });
  }

  try {
    // Fetch recent calls from Vapi
    const response = await fetch(`${VAPI_API_URL}/call?limit=50`, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch calls from Vapi');
    }

    const calls = await response.json();

    // Filter calls that have recordings and map to a cleaner format
    const recordings = calls
      .filter((call: { recordingUrl?: string }) => call.recordingUrl)
      .map((call: {
        id: string;
        recordingUrl: string;
        customer?: { number?: string };
        metadata?: { businessName?: string; leadId?: string };
        status: string;
        startedAt?: string;
        endedAt?: string;
        duration?: number;
      }) => ({
        id: call.id,
        recordingUrl: call.recordingUrl,
        phoneNumber: call.customer?.number || 'Unknown',
        businessName: call.metadata?.businessName || 'Unknown Business',
        leadId: call.metadata?.leadId,
        status: call.status,
        startedAt: call.startedAt,
        endedAt: call.endedAt,
        duration: call.duration,
      }));

    return NextResponse.json({ recordings });
  } catch (error) {
    console.error('Failed to fetch recordings:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch recordings' },
      { status: 500 }
    );
  }
}
