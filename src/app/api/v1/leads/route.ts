import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

/**
 * Public API for AutoSales.ai
 * 
 * GET /api/v1/leads - Get all leads
 * POST /api/v1/leads - Create a lead
 */

// Simple API key authentication
function validateApiKey(req: NextRequest): boolean {
  const apiKey = req.headers.get('x-api-key');
  // In production, validate against stored API keys
  return apiKey === process.env.PUBLIC_API_KEY;
}

export async function GET(req: NextRequest) {
  if (!validateApiKey(req)) {
    return NextResponse.json({ error: 'Invalid API key' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const campaignId = searchParams.get('campaignId');
  const status = searchParams.get('status');
  const limit = parseInt(searchParams.get('limit') || '50');
  const offset = parseInt(searchParams.get('offset') || '0');

  let query = db.from('leads').select('*');

  if (campaignId) query = query.eq('campaignId', campaignId);
  if (status) query = query.eq('status', status);

  const { data, error, count } = await query
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    data,
    meta: {
      total: count,
      limit,
      offset,
    },
  });
}

export async function POST(req: NextRequest) {
  if (!validateApiKey(req)) {
    return NextResponse.json({ error: 'Invalid API key' }, { status: 401 });
  }

  try {
    const body = await req.json();

    const { businessName, phoneNumber, website, campaignId, status = 'NEW' } = body;

    if (!businessName || !campaignId) {
      return NextResponse.json(
        { error: 'businessName and campaignId are required' },
        { status: 400 }
      );
    }

    const { data, error } = await db.from('leads').insert({
      businessName,
      phoneNumber,
      website,
      campaignId,
      status,
    }).select().single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
}
