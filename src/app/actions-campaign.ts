'use server';

import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function createCampaign(name: string, query: string, description?: string) {
  try {
    // 1. Create campaign
    const { data: campaign, error: campaignError } = await db.from('campaigns').insert({
      name,
      description,
      query,
      status: 'ACTIVE'
    }).select().single();

    if (campaignError) throw campaignError;

    // 2. Create scrape job for this campaign
    const { error: jobError } = await db.from('scrape_jobs').insert({
      campaignId: campaign.id,
      query,
      status: 'PENDING'
    });

    if (jobError) throw jobError;

    revalidatePath('/campaigns');
    return { success: true, data: campaign };
  } catch (error) {
    console.error("Failed to create campaign:", error);
    return { error: 'Failed to create campaign' };
  }
}

export async function getCampaigns() {
  try {
    const { data: campaigns, error } = await db
      .from('campaigns')
      .select('*, leads:leads(count), jobs:scrape_jobs(status)')
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Transform for UI
    const transformed = campaigns?.map((c: { id: string; name: string; query: string; description?: string; created_at: string; leads?: { count: number }[]; jobs?: { status: string }[] }) => ({
      ...c,
      createdAt: c.created_at,
      _count: { leads: c.leads?.[0]?.count || 0 },
      jobStatus: c.jobs?.[0]?.status || 'NONE'
    }));

    return { success: true, data: transformed };
  } catch (e) {
    console.error("Failed to fetch campaigns:", e);
    return { error: 'Failed to fetch campaigns' };
  }
}

export async function getCampaignLeads(campaignId: string) {
  try {
    const { data: leads, error } = await db
      .from('leads')
      .select('*')
      .eq('campaign_id', campaignId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { success: true, data: leads };
  } catch (e) {
    return { error: 'Failed to fetch leads' };
  }
}

export async function triggerWorker() {
  // Call the worker endpoint
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  try {
    const res = await fetch(`${baseUrl}/api/worker`, {
      headers: {
        'Authorization': `Bearer ${process.env.WORKER_SECRET || ''}`
      }
    });
    return await res.json();
  } catch (e) {
    return { error: 'Failed to trigger worker' };
  }
}
