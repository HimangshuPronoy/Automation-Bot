'use server';

import { scrapeGoogleMaps } from '@/lib/scraper/google-maps';
import { analyzeLead } from '@/lib/analysis/analyzer';
import { db } from '@/lib/db';

export async function scrapeAndAnalyze(query: string, limit: number = 5) {
  if (!query) return { error: 'Query required' };

  try {
    // 1. Scrape
    console.log(`Scraping for: ${query}`);
    const businesses = await scrapeGoogleMaps(query, limit);
    console.log(`Found ${businesses.length} businesses`);

    const results = [];

    // 2. Analyze and Save
    for (const bus of businesses) {
       // Check if exists
       const { data: existing } = await db.from('leads').select('*').eq('businessName', bus.name).single();

       if (existing) {
         results.push(existing);
         continue;
       }

       // Analyze
       let analysis = null;
       try {
         analysis = await analyzeLead(bus);
       } catch (e) {
         console.error("Analysis failed for", bus.name, e);
       }

       // Save to DB
       // Note: Supabase returns array by default, use select().single() to get object
       const { data: lead } = await db.from('leads').insert({
           businessName: bus.name,
           phoneNumber: bus.phone,
           website: bus.website,
           address: bus.address,
           rating: bus.rating,
           reviewCount: bus.reviews || 0,
           status: analysis?.qualified ? 'QUALIFIED' : 'NEW',
           weakPoints: analysis ? JSON.stringify(analysis.weakPoints) : '[]',
       }).select().single();
       
       results.push({ ...lead, analysis });
    }

    return { success: true, data: results };

  } catch (error) {
    console.error("Action Failed:", error);
    return { error: 'Failed to process request' };
  }
}
