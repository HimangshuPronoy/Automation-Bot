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
    // Fetch pending jobs - check for both uppercase and lowercase status
    let { data: jobs, error } = await db
      .from('scrape_jobs')
      .select('id, status')
      .in('status', ['PENDING', 'pending', 'Pending'])
      .order('createdAt', { ascending: true })
      .limit(5);

    console.log('Worker: Found pending jobs:', jobs?.length || 0);

    if (error) {
      console.error('Worker: Error fetching jobs:', error);
      throw error;
    }

    // If no pending jobs, check for campaigns without recent jobs and create them
    if (!jobs || jobs.length === 0) {
      console.log('Worker: No pending jobs. Checking for campaigns without jobs...');
      
      // Get campaigns that have no completed jobs
      const { data: campaigns } = await db
        .from('campaigns')
        .select('id, query')
        .limit(5);
      
      if (campaigns && campaigns.length > 0) {
        // Create pending jobs for these campaigns
        for (const camp of campaigns) {
          // Check if campaign already has a recent job
          const { data: existingJob } = await db
            .from('scrape_jobs')
            .select('id')
            .eq('campaignId', camp.id)
            .limit(1);
          
          if (!existingJob || existingJob.length === 0) {
            console.log('Worker: Creating job for campaign:', camp.id);
            await db.from('scrape_jobs').insert({
              campaignId: camp.id,
              query: camp.query,
              status: 'PENDING'
            });
          }
        }
        
        // Re-fetch jobs
        const { data: newJobs } = await db
          .from('scrape_jobs')
          .select('id, status')
          .eq('status', 'PENDING')
          .limit(5);
        
        jobs = newJobs || [];
        console.log('Worker: Created and found jobs:', jobs.length);
      }
    }

    if (!jobs || jobs.length === 0) {
      return NextResponse.json({ message: 'No pending jobs', processed: 0 });
    }

    // Process each job
    const results = [];
    for (const job of jobs) {
      try {
        console.log('Worker: Processing job:', job.id);
        await processJob(job.id);
        results.push({ id: job.id, status: 'processed' });
      } catch (e) {
        console.error('Worker: Job failed:', job.id, e);
        results.push({ id: job.id, status: 'failed', error: String(e) });
      }
    }

    return NextResponse.json({
      message: `Processed ${results.length} jobs`,
      results,
    });
  } catch (error) {
    console.error('Worker: Fatal error:', error);
    return NextResponse.json(
      { error: 'Worker failed', details: String(error) },
      { status: 500 }
    );
  }
}
