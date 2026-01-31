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
    // First, let's see what statuses exist
    const { data: allJobs } = await db
      .from('scrape_jobs')
      .select('id, status, campaignId')
      .limit(10);
    console.log('Worker: All jobs in DB:', allJobs?.map(j => ({ id: j.id.slice(0,8), status: j.status })));
    
    // Fetch pending jobs - check for both uppercase and lowercase status
    let { data: jobs, error } = await db
      .from('scrape_jobs')
      .select('id, status')
      .in('status', ['PENDING', 'pending', 'Pending', 'PROCESSING', 'processing'])
      .order('createdAt', { ascending: true })
      .limit(5);

    console.log('Worker: Found pending/processing jobs:', jobs?.length || 0, jobs?.map(j => j.status));

    if (error) {
      console.error('Worker: Error fetching jobs:', error);
      throw error;
    }

    // If no pending jobs, check for campaigns without recent jobs and create them
    if (!jobs || jobs.length === 0) {
      console.log('Worker: No pending jobs. Checking for campaigns without jobs...');
      
      // Get all campaigns
      const { data: campaigns, error: campError } = await db
        .from('campaigns')
        .select('id, query')
        .limit(5);
      
      console.log('Worker: Found campaigns:', campaigns?.length || 0, campError);
      
      if (campaigns && campaigns.length > 0) {
        // Create pending jobs for campaigns without PENDING or PROCESSING jobs
        for (const camp of campaigns) {
          // Check if campaign has an active job (PENDING or PROCESSING)
          const { data: existingJob, error: jobErr } = await db
            .from('scrape_jobs')
            .select('id, status')
            .eq('campaignId', camp.id)
            .in('status', ['PENDING', 'PROCESSING'])
            .limit(1);
          
          console.log(`Worker: Campaign ${camp.id} has active job:`, existingJob?.length || 0, jobErr);
          
          if (!existingJob || existingJob.length === 0) {
            console.log('Worker: Creating job for campaign:', camp.id, 'query:', camp.query);
            const { error: insertErr } = await db.from('scrape_jobs').insert({
              campaignId: camp.id,
              query: camp.query,
              status: 'PENDING'
            });
            if (insertErr) {
              console.error('Worker: Failed to create job:', insertErr);
            }
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
