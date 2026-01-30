'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase-client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Loader2, Search, Phone, Building2, MapPin, Star, ChevronRight, Filter } from 'lucide-react';
import { motion } from 'framer-motion';
import { AnimatedBackground } from '@/components/ui/animated-background';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';

interface Lead {
  id: string;
  businessName: string;
  phoneNumber: string;
  email?: string;
  website?: string;
  address?: string;
  rating?: number;
  reviewCount?: number;
  status: string;
  createdAt: string;
  campaignId?: string;
  campaigns?: { name: string } | null;
}

export default function LeadsPage() {
  const [loading, setLoading] = useState(true);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  useEffect(() => {
    loadLeads();
  }, []);

  const loadLeads = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('leads')
      .select('*, campaigns(name)')
      .order('createdAt', { ascending: false });

    if (!error && data) {
      setLeads(data as Lead[]);
    }
    setLoading(false);
  };

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = lead.businessName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          lead.phoneNumber?.includes(searchQuery) ||
                          lead.email?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || lead.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'QUALIFIED': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'CONTACTED': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'NOT_INTERESTED': return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'CALL_BACK': return 'bg-amber-50 text-amber-700 border-amber-200';
      default: return 'bg-slate-50 text-slate-600 border-slate-200';
    }
  };

  const getTimeAgo = (dateStr: string) => {
    try {
      return formatDistanceToNow(new Date(dateStr), { addSuffix: true });
    } catch {
      return 'Unknown';
    }
  };

  const statuses = ['ALL', 'NEW', 'CONTACTED', 'QUALIFIED', 'NOT_INTERESTED', 'CALL_BACK'];

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-900/50 p-4 md:p-8 font-sans">
      <div className="fixed inset-0 z-[-1] opacity-60">
        <AnimatedBackground />
      </div>

      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white tracking-tight">
              Leads
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg font-light">
              Manage and track all your sales leads.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="secondary" className="px-4 py-2 text-base">
              {leads.length} Total
            </Badge>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <Input
              placeholder="Search by name, phone, or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-12 rounded-xl bg-white border-slate-200"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {statuses.map(status => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  statusFilter === status 
                    ? 'bg-slate-900 text-white' 
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {status.replace(/_/g, ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Leads List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="rounded-[2rem] border-none shadow-xl bg-white/80 backdrop-blur-xl overflow-hidden">
            <CardHeader className="p-6 border-b border-slate-100">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-indigo-100 text-indigo-600">
                  <Building2 className="h-6 w-6" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold text-slate-800">All Leads</CardTitle>
                  <CardDescription>Click on a lead to view details</CardDescription>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="p-0">
              {loading ? (
                <div className="p-20 text-center">
                  <Loader2 className="w-8 h-8 animate-spin text-indigo-500 mx-auto" />
                  <p className="text-slate-500 mt-4">Loading leads...</p>
                </div>
              ) : filteredLeads.length === 0 ? (
                <div className="p-20 text-center">
                  <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-slate-900">No leads found</h3>
                  <p className="text-slate-500 max-w-sm mx-auto mt-2">
                    {searchQuery || statusFilter !== 'ALL' 
                      ? 'Try adjusting your filters.' 
                      : 'Create a campaign to start generating leads.'}
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {filteredLeads.map((lead, i) => (
                    <Link key={lead.id} href={`/leads/${lead.id}`}>
                      <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.03 }}
                        className="p-5 flex items-center gap-4 hover:bg-slate-50/80 transition-colors cursor-pointer group"
                      >
                        {/* Avatar */}
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center font-bold text-lg text-slate-600 group-hover:scale-105 transition-transform">
                          {lead.businessName?.charAt(0).toUpperCase() || '?'}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-slate-900 truncate group-hover:text-indigo-600 transition-colors">
                            {lead.businessName || 'Unknown Business'}
                          </p>
                          <div className="flex items-center gap-4 text-sm text-slate-500">
                            {lead.phoneNumber && (
                              <span className="flex items-center gap-1">
                                <Phone size={12} /> {lead.phoneNumber}
                              </span>
                            )}
                            {lead.address && (
                              <span className="flex items-center gap-1 hidden md:flex">
                                <MapPin size={12} /> {lead.address.substring(0, 30)}...
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Rating */}
                        {lead.rating && (
                          <div className="hidden md:flex items-center gap-1 text-amber-500">
                            <Star size={14} fill="currentColor" />
                            <span className="font-medium">{lead.rating}</span>
                          </div>
                        )}

                        {/* Campaign */}
                        {lead.campaigns?.name && (
                          <span className="hidden lg:block text-xs text-slate-400 bg-slate-100 px-2 py-1 rounded-full">
                            {lead.campaigns.name}
                          </span>
                        )}

                        {/* Status */}
                        <Badge className={`${getStatusStyle(lead.status)} border`}>
                          {lead.status.replace(/_/g, ' ')}
                        </Badge>

                        {/* Time */}
                        <span className="text-xs text-slate-400 hidden md:block w-24 text-right">
                          {getTimeAgo(lead.createdAt)}
                        </span>

                        <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-indigo-500 transition-colors" />
                      </motion.div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
