import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { processJob } from '@/lib/scraper/serpapi';

/**
 * Background worker API route
 * Can be triggered by:
 * 1. Vercel Cron (add to vercel.json)
 * 2. Supabase Edge Function
 * 3. External cron service (cron-job.org)
 * 
 * GET /api/worker - Processes pending jobs
 */
export async function GET(req: NextRequest) {
  // Optional: Add a secret key check for security
  const authHeader = req.headers.get('authorization');
  const expectedKey = process.env.WORKER_SECRET;
  
  if (expectedKey && authHeader !== `Bearer ${expectedKey}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Fetch pending jobs
    const { data: jobs, error } = await db
      .from('scrape_jobs')
      .select('id')
      .eq('status', 'PENDING')
      .order('createdAt', { ascending: true })
      .limit(5); // Process 5 at a time

    if (error) {
      throw error;
    }

    if (!jobs || jobs.length === 0) {
      return NextResponse.json({ message: 'No pending jobs', processed: 0 });
    }

    // Process each job
    const results = [];
    for (const job of jobs) {
      try {
        await processJob(job.id);
        results.push({ id: job.id, status: 'processed' });
      } catch (e) {
        results.push({ id: job.id, status: 'failed', error: String(e) });
      }
    }

    return NextResponse.json({
      message: `Processed ${results.length} jobs`,
      results,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Worker failed', details: String(error) },
      { status: 500 }
    );
  }
}
