import { NextRequest, NextResponse } from 'next/server';
import { scrapeGoogleMaps } from '@/lib/scraper/google-maps';

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const query = searchParams.get('query');
  const limit = parseInt(searchParams.get('limit') || '5');

  if (!query) {
    return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
  }

  try {
    const data = await scrapeGoogleMaps(query, limit);
    return NextResponse.json({ success: true, count: data.length, data });
  } catch (error) {
    return NextResponse.json({ error: 'Scraping failed', details: String(error) }, { status: 500 });
  }
}
