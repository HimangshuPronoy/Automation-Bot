import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

/**
 * Public API for Campaigns
 * 
 * GET /api/v1/campaigns - Get all campaigns
 * POST /api/v1/campaigns - Create a campaign
 */

function validateApiKey(req: NextRequest): boolean {
  const apiKey = req.headers.get('x-api-key');
  return apiKey === process.env.PUBLIC_API_KEY;
}

export async function GET(req: NextRequest) {
  if (!validateApiKey(req)) {
    return NextResponse.json({ error: 'Invalid API key' }, { status: 401 });
  }

  const { data, error } = await db
    .from('campaigns')
    .select('*')
    .order('createdAt', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}

export async function POST(req: NextRequest) {
  if (!validateApiKey(req)) {
    return NextResponse.json({ error: 'Invalid API key' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { name, query, autoCallEnabled = false } = body;

    if (!name || !query) {
      return NextResponse.json(
        { error: 'name and query are required' },
        { status: 400 }
      );
    }

    const { data, error } = await db.from('campaigns').insert({
      name,
      query,
      status: 'ACTIVE',
      auto_call_enabled: autoCallEnabled,
    }).select().single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Also create scrape job
    await db.from('scrape_jobs').insert({
      campaignId: data.id,
      query,
      status: 'PENDING',
    });

    return NextResponse.json({ data }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
}
