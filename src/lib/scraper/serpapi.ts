import { db } from '@/lib/db';
import { analyzeLead } from '@/lib/analysis/analyzer';

export interface SerpAPIResult {
  title: string;
  place_id?: string;
  address?: string;
  phone?: string;
  website?: string;
  rating?: number;
  reviews?: number;
  type?: string;
}

/**
 * Fetches Google Maps results using SerpAPI
 * @param query - Search query like "Plumbers in Austin, TX"
 * @param limit - Max results to fetch
 */
export async function scrapeWithSerpAPI(query: string, limit: number = 20): Promise<SerpAPIResult[]> {
  const apiKey = process.env.SERPAPI_KEY;
  
  if (!apiKey) {
    console.warn("SERPAPI_KEY not set. Using mock data for development.");
    return getMockResults(query, limit);
  }

  const params = new URLSearchParams({
    engine: 'google_maps',
    q: query,
    api_key: apiKey,
    type: 'search',
  });

  try {
    const response = await fetch(`https://serpapi.com/search?${params.toString()}`);
    
    if (!response.ok) {
      throw new Error(`SerpAPI request failed: ${response.statusText}`);
    }

    const data = await response.json();
    const localResults = data.local_results || [];

    return localResults.slice(0, limit).map((r: any) => ({
      title: r.title,
      place_id: r.place_id,
      address: r.address,
      phone: r.phone,
      website: r.website,
      rating: r.rating,
      reviews: r.reviews,
      type: r.type,
    }));
  } catch (error) {
    console.error("SerpAPI error:", error);
    throw error;
  }
}

/**
 * Process a single scrape job
 */
export async function processJob(jobId: string) {
  // 1. Get job details
  const { data: job, error: jobError } = await db
    .from('scrape_jobs')
    .select('*')
    .eq('id', jobId)
    .single();

  if (jobError || !job) {
    console.error("Job not found:", jobId);
    return;
  }

  // 2. Mark as processing
  await db.from('scrape_jobs').update({ status: 'PROCESSING' }).eq('id', jobId);

  try {
    // 3. Fetch results from SerpAPI
    const results = await scrapeWithSerpAPI(job.query, 20);

    // 4. Analyze and save each lead
    let savedCount = 0;
    for (const result of results) {
      // DEDUPLICATION: Check if lead already exists by place_id, phone, or business name
      let isDuplicate = false;

      // First check by place_id (most reliable - Google's unique identifier)
      if (result.place_id) {
        const { data: byPlaceId } = await db
          .from('leads')
          .select('id')
          .eq('place_id', result.place_id)
          .limit(1);
        
        if (byPlaceId && byPlaceId.length > 0) {
          console.log(`Skipping duplicate lead (place_id match): ${result.title}`);
          isDuplicate = true;
        }
      }

      // Then check by phone number (if not already found and phone exists)
      if (!isDuplicate && result.phone) {
        const { data: byPhone } = await db
          .from('leads')
          .select('id')
          .eq('phoneNumber', result.phone)
          .limit(1);
        
        if (byPhone && byPhone.length > 0) {
          console.log(`Skipping duplicate lead (phone match): ${result.title}`);
          isDuplicate = true;
        }
      }

      // Finally check by exact business name (least reliable but catches remaining duplicates)
      if (!isDuplicate) {
        const { data: byName } = await db
          .from('leads')
          .select('id')
          .eq('businessName', result.title)
          .limit(1);
        
        if (byName && byName.length > 0) {
          console.log(`Skipping duplicate lead (name match): ${result.title}`);
          isDuplicate = true;
        }
      }

      if (isDuplicate) {
        continue;
      }

      // Skip AI analysis for now (quota issues) - just save leads
      const analysis = null;
      // TODO: Re-enable when API quota is available
      // try {
      //   analysis = await analyzeLead({...});
      // } catch (e) {
      //   console.error("Analysis failed for", result.title);
      // }

      // Save lead with camelCase field names
      await db.from('leads').insert({
        businessName: result.title,
        place_id: result.place_id,
        phoneNumber: result.phone,
        website: result.website,
        address: result.address,
        rating: result.rating,
        reviewCount: result.reviews,
        status: 'NEW',
        weakPoints: '[]',
        suggestedPitch: '',
        campaignId: job.campaignId,
      });

      savedCount++;
    }

    // 5. Mark job as completed
    await db.from('scrape_jobs').update({
      status: 'COMPLETED',
      resultsCount: savedCount,
      processedAt: new Date().toISOString(),
    }).eq('id', jobId);

  } catch (error) {
    // Mark as failed
    await db.from('scrape_jobs').update({
      status: 'FAILED',
      error: String(error),
    }).eq('id', jobId);
  }
}

/**
 * Mock data for development without SerpAPI key
 */
function getMockResults(query: string, limit: number): SerpAPIResult[] {
  return Array.from({ length: Math.min(limit, 5) }, (_, i) => ({
    title: `Mock Business ${i + 1} - ${query.split(' ')[0]}`,
    address: `${100 + i} Main St, Austin, TX`,
    phone: `+1 555-000-${1000 + i}`,
    website: i % 2 === 0 ? `https://mockbusiness${i + 1}.com` : undefined,
    rating: 3.5 + (i * 0.3),
    reviews: 10 + (i * 15),
    type: 'Service',
  }));
}
