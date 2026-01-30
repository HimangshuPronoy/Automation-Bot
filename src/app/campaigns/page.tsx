'use client';

import { useState, useEffect } from 'react';
import { createCampaign, getCampaigns, triggerWorker } from '../actions-campaign';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Play, Loader2, BarChart, RefreshCw, Megaphone, Users, Zap } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { AnimatedBackground } from '@/components/ui/animated-background';

const STATUS_CONFIG: Record<string, { bgClass: string; textClass: string; label: string }> = {
  COMPLETED: { bgClass: 'bg-emerald-100', textClass: 'text-emerald-700', label: 'Completed' },
  PROCESSING: { bgClass: 'bg-amber-100', textClass: 'text-amber-700', label: 'Processing' },
  PENDING: { bgClass: 'bg-blue-100', textClass: 'text-blue-700', label: 'Pending' },
  FAILED: { bgClass: 'bg-red-100', textClass: 'text-red-700', label: 'Failed' },
};

interface Campaign {
  id: string;
  name: string;
  query: string;
  jobStatus: string;
  createdAt: string;
  _count?: {
    leads: number;
  };
}

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [newCampaignName, setNewCampaignName] = useState('');
  const [newCampaignQuery, setNewCampaignQuery] = useState('');
  const [autoCallEnabled, setAutoCallEnabled] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    loadCampaigns();
  }, []);

  const loadCampaigns = async () => {
    const res = await getCampaigns();
    if (res.success) setCampaigns(res.data || []);
  };

  const handleCreate = async () => {
    if (!newCampaignName || !newCampaignQuery) return;
    setLoading(true);
    const res = await createCampaign(newCampaignName, newCampaignQuery, undefined, autoCallEnabled);
    if (res.error) {
      toast.error('Failed to create campaign');
      setLoading(false);
      return;
    }
    
    toast.success('Campaign created successfully!');
    setNewCampaignName('');
    setNewCampaignQuery('');
    setAutoCallEnabled(true);
    setIsOpen(false);
    setLoading(false);
    loadCampaigns();
    
    handleProcess();
  };

  const handleProcess = async () => {
    setProcessing(true);
    toast.info('Starting lead scraper...');
    
    await triggerWorker();
    
    setTimeout(() => toast.info('AI analyzing leads...'), 1500);
    
    setTimeout(() => {
      loadCampaigns();
      setProcessing(false);
      toast.success('Processing complete! New leads found.');
    }, 4000);
  };

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-900/50 p-4 md:p-8 font-sans">
      <div className="fixed inset-0 z-[-1] opacity-60">
        <AnimatedBackground />
      </div>

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white tracking-tight">
              Campaigns
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg font-light">
              Create campaigns to find and qualify leads automatically
            </p>
          </div>
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              onClick={handleProcess} 
              disabled={processing}
              className="rounded-full h-12 px-6 bg-white/80 backdrop-blur-md border-slate-200 hover:bg-slate-50"
            >
              {processing ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <RefreshCw className="mr-2 h-4 w-4"/>}
              Process Jobs
            </Button>
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger asChild>
                <Button className="rounded-full h-12 px-8 bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/20 transition-all hover:scale-105">
                  <Plus className="mr-2 h-5 w-5"/>
                  New Campaign
                </Button>
              </DialogTrigger>
              <DialogContent className="rounded-[2rem] border-none shadow-2xl bg-white/95 backdrop-blur-xl">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-bold text-slate-800">Create New Campaign</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-2 block">Campaign Name</label>
                    <Input 
                      placeholder="e.g. Austin Plumbers" 
                      value={newCampaignName}
                      onChange={(e) => setNewCampaignName(e.target.value)}
                      className="h-12 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-2 block">Search Query</label>
                    <Input 
                      placeholder="e.g. Plumbers in Austin, TX" 
                      value={newCampaignQuery}
                      onChange={(e) => setNewCampaignQuery(e.target.value)}
                      className="h-12 rounded-xl"
                    />
                  </div>
                  <div className="flex items-center space-x-3 p-4 bg-indigo-50 rounded-2xl border border-indigo-100">
                    <input
                      type="checkbox"
                      id="autoCall"
                      checked={autoCallEnabled}
                      onChange={(e) => setAutoCallEnabled(e.target.checked)}
                      className="h-5 w-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <label htmlFor="autoCall" className="text-sm font-medium text-slate-700">
                      <Zap className="inline-block h-4 w-4 mr-1 text-indigo-500" />
                      Auto-Call qualified leads (AI will call them automatically)
                    </label>
                  </div>
                  <Button 
                    className="w-full h-14 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-lg shadow-lg shadow-indigo-500/25" 
                    onClick={handleCreate} 
                    disabled={loading}
                  >
                    {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin"/> : <Play className="mr-2 h-5 w-5"/>}
                    {loading ? 'Creating...' : 'Create & Start Scraping'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats */}
        <div className="flex gap-4 mb-8 flex-wrap">
          <div className="px-4 py-2 bg-white/80 backdrop-blur-md rounded-full border border-white/40 text-sm font-medium text-slate-600">
            <Megaphone className="inline-block mr-2 h-4 w-4" />
            {campaigns.length} Campaigns
          </div>
          <div className="px-4 py-2 bg-emerald-50 backdrop-blur-md rounded-full border border-emerald-200 text-sm font-medium text-emerald-700">
            <Users className="inline-block mr-2 h-4 w-4" />
            {campaigns.reduce((sum, c) => sum + (c._count?.leads || 0), 0)} Total Leads
          </div>
        </div>

        {/* Campaign Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {campaigns.map((camp, index) => (
            <motion.div
              key={camp.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ y: -5 }}
            >
              <Card className="rounded-[2rem] border-none shadow-lg bg-white/80 backdrop-blur-xl overflow-hidden hover:shadow-xl transition-all duration-300 h-full">
                <CardHeader className="p-6 pb-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="p-3 rounded-2xl bg-indigo-100 text-indigo-600">
                      <Megaphone className="h-5 w-5" />
                    </div>
                    <Badge className={`${STATUS_CONFIG[camp.jobStatus]?.bgClass || 'bg-slate-100'} ${STATUS_CONFIG[camp.jobStatus]?.textClass || 'text-slate-600'} border-none px-3 py-1`}>
                      {STATUS_CONFIG[camp.jobStatus]?.label || camp.jobStatus}
                    </Badge>
                  </div>
                  <CardTitle className="text-xl font-bold text-slate-800 mt-4">{camp.name}</CardTitle>
                  <CardDescription className="text-sm text-slate-500 italic">"{camp.query}"</CardDescription>
                </CardHeader>
                <CardContent className="p-6 pt-2">
                  <div className="flex items-center justify-between text-sm text-slate-600 mb-4 py-3 border-y border-slate-100">
                    <span className="flex items-center font-medium">
                      <Users className="h-4 w-4 mr-2 text-indigo-500"/>
                      {camp._count?.leads || 0} Leads
                    </span>
                    <span className="text-xs text-slate-400">{new Date(camp.createdAt).toLocaleDateString()}</span>
                  </div>
                  <Link href={`/campaigns/${camp.id}`}>
                    <Button 
                      variant="outline" 
                      className="w-full rounded-xl hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200"
                    >
                      View Leads
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>
          ))}

          {campaigns.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="col-span-full text-center py-20"
            >
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-indigo-50 flex items-center justify-center">
                <Megaphone className="h-10 w-10 text-indigo-500" />
              </div>
              <h3 className="text-xl font-semibold text-slate-700 mb-2">No campaigns yet</h3>
              <p className="text-slate-500">Create your first campaign to start finding leads</p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
