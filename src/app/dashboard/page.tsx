'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase-client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Users, Phone, CheckCircle, ArrowUpRight, TrendingUp, Clock, Calendar, ChevronRight, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { AutoCallToggle } from '@/components/dashboard/auto-call-toggle';
import { DashboardCharts } from '@/components/dashboard/dashboard-charts';
import { formatDistanceToNow } from 'date-fns';

interface Lead {
  id: string;
  business_name?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  status: string;
  created_at: string;
  campaign_id?: string;
  campaigns?: { name: string } | null;
}

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: string;
  trendUp?: boolean;
  highlight?: boolean;
  gradient?: string;
  delay?: number;
}

const StatsCard = ({ title, value, icon, trend, trendUp, highlight, gradient, delay = 0 }: StatsCardProps) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.5 }}
    whileHover={{ y: -5, scale: 1.02 }}
    className={`relative overflow-hidden rounded-[2rem] p-8 shadow-sm border transition-all duration-500 group ${
      gradient ? `bg-gradient-to-br ${gradient} text-white border-transparent` : 
      highlight ? 'bg-white border-white/60 shadow-xl shadow-slate-200/50' : 'bg-white/60 backdrop-blur-md border-white/40 hover:bg-white/90'
    }`}
  >
    <div className="flex justify-between items-start mb-6 relative z-10">
      <div className={`p-4 rounded-2xl transition-transform duration-500 group-hover:rotate-12 ${gradient ? 'bg-white/20 backdrop-blur-md' : 'bg-slate-50 shadow-inner'}`}>
        {icon}
      </div>
      {trend && (
        <div className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider ${
          gradient ? 'bg-white/20 text-white backdrop-blur-md' : 
          trendUp ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-600'
        }`}>
          {trendUp ? <TrendingUp size={14} /> : null}
          {trend}
        </div>
      )}
    </div>
    <div className="relative z-10">
      <h3 className={`text-sm font-semibold mb-1 uppercase tracking-wider ${gradient ? 'text-white/80' : 'text-slate-400'}`}>{title}</h3>
      <div className="text-5xl font-bold tracking-tight">{value}</div>
    </div>
    
    {/* Decorative Elements */}
    <div className={`absolute -bottom-6 -right-6 w-32 h-32 rounded-full blur-[60px] pointer-events-none transition-opacity duration-700 ${
        gradient ? 'bg-white/20 opacity-0 group-hover:opacity-100' : 'bg-gradient-to-br from-indigo-500/10 to-purple-500/10 opacity-50 group-hover:opacity-100'
    }`} />
  </motion.div>
);

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [recentLeads, setRecentLeads] = useState<Lead[]>([]);
  const [stats, setStats] = useState({
    totalLeads: 0,
    callsMade: 0,
    qualifiedLeads: 0,
    pendingLeads: 0
  });

  useEffect(() => {
    async function loadDashboardData() {
      setLoading(true);
      
      try {
        // Fetch lead counts
        const { count: totalLeads } = await supabase
          .from('leads')
          .select('*', { count: 'exact', head: true });

        const { count: qualifiedLeads } = await supabase
          .from('leads')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'QUALIFIED');

        const { count: callsMade } = await supabase
          .from('leads')
          .select('*', { count: 'exact', head: true })
          .in('status', ['CONTACTED', 'QUALIFIED', 'NOT_INTERESTED', 'CALL_BACK']);

        const { count: pendingLeads } = await supabase
          .from('leads')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'NEW');

        setStats({
          totalLeads: totalLeads || 0,
          callsMade: callsMade || 0,
          qualifiedLeads: qualifiedLeads || 0,
          pendingLeads: pendingLeads || 0
        });

        // Fetch recent leads
        const { data: leads } = await supabase
          .from('leads')
          .select('*, campaigns(name)')
          .order('created_at', { ascending: false })
          .limit(5);

        if (leads) {
          setRecentLeads(leads as Lead[]);
        }
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, []);

  const getLeadDisplayName = (lead: Lead) => {
    if (lead.business_name) return lead.business_name;
    if (lead.first_name || lead.last_name) return `${lead.first_name || ''} ${lead.last_name || ''}`.trim();
    return lead.email || 'Unknown Lead';
  };

  const getTimeAgo = (dateStr: string) => {
    try {
      return formatDistanceToNow(new Date(dateStr), { addSuffix: true });
    } catch {
      return 'Recently';
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'QUALIFIED':
        return 'bg-emerald-50 text-emerald-700 border-emerald-100 ring-emerald-500/20';
      case 'CONTACTED':
        return 'bg-blue-50 text-blue-700 border-blue-100 ring-blue-500/20';
      case 'NOT_INTERESTED':
        return 'bg-rose-50 text-rose-700 border-rose-100 ring-rose-500/20';
      case 'CALL_BACK':
        return 'bg-amber-50 text-amber-700 border-amber-100 ring-amber-500/20';
      default:
        return 'bg-slate-50 text-slate-600 border-slate-100 ring-slate-500/20';
    }
  };

  return (
    <div className="min-h-screen p-6 md:p-10 font-sans max-w-[1920px] mx-auto">
      
      {/* Header Section */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6"
      >
        <div>
           <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center justify-center w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-xs font-semibold uppercase tracking-widest text-slate-500">System Operational</span>
           </div>
          <h1 className="text-4xl md:text-6xl font-bold text-slate-900 tracking-tight">
            Dashboard
          </h1>
          <p className="text-slate-500 mt-2 text-lg font-light max-w-xl">
            Real-time overview of your AI agents, campaigns, and lead generation performance.
          </p>
        </div>
        <div className="flex gap-4">
           <Button variant="outline" className="h-12 px-6 rounded-xl border-slate-200 bg-white/50 backdrop-blur hover:bg-white text-slate-600">
              <Calendar className="mr-2 h-4 w-4" /> Today
           </Button>
           <Link href="/campaigns/new">
            <Button variant="shimmer" size="lg" className="h-12 rounded-xl shadow-xl shadow-teal-500/30">
              <ArrowUpRight className="mr-2 h-5 w-5" /> New Campaign
            </Button>
          </Link>
        </div>
      </motion.div>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        
        {/* Main Stats Row */}
        <div className="md:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
           <StatsCard 
             title="Total Leads" 
             value={stats.totalLeads.toLocaleString()} 
             icon={<Users className="h-6 w-6"/>} 
             trend={stats.totalLeads > 0 ? "+12%" : undefined}
             trendUp={stats.totalLeads > 0}
             gradient="from-teal-400 to-emerald-500"
             delay={0.1}
           />
           <StatsCard 
             title="Calls Made" 
             value={stats.callsMade.toLocaleString()} 
             icon={<Phone className="h-6 w-6 text-indigo-600"/>} 
             trend={stats.callsMade > 0 ? "Active" : undefined}
             trendUp={stats.callsMade > 0}
             delay={0.2}
           />
           <StatsCard 
             title="Qualified" 
             value={stats.qualifiedLeads.toLocaleString()} 
             icon={<CheckCircle className="h-6 w-6 text-purple-600"/>} 
             highlight={true}
             delay={0.3}
           />
           <StatsCard 
             title="Pending" 
             value={stats.pendingLeads.toLocaleString()} 
             icon={<Clock className="h-6 w-6 text-orange-600"/>} 
             delay={0.4}
           />
        </div>

        {/* Auto Call Controller */}
        <motion.div 
           initial={{ opacity: 0, x: 20 }}
           animate={{ opacity: 1, x: 0 }}
           transition={{ delay: 0.5 }}
           className="md:col-span-4 row-span-2 flex flex-col h-full"
        >
           {/* Temporary fix: using a div wrapper as AutoCallToggle might expect internal props */}
           <div className="h-full">
               <AutoCallToggle />
           </div>
        </motion.div>

        {/* Charts Area */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="md:col-span-8"
        >
           <DashboardCharts />
        </motion.div>

        {/* Recent Leads */}
        <div className="md:col-span-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <Card className="border-none shadow-2xl shadow-slate-200/50 bg-white/80 backdrop-blur-xl overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100/50 p-8">
                <div>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription className="mt-1">Live updates from your autopilot agents</CardDescription>
                </div>
                <Link href="/leads">
                  <Button variant="ghost" className="text-teal-600 hover:text-teal-700 hover:bg-teal-50 rounded-lg group">
                    View All Activity <ChevronRight className="ml-1 w-4 h-4 transition-transform group-hover:translate-x-1"/>
                  </Button>
                </Link>
              </CardHeader>
              <CardContent className="p-0">
                {loading ? (
                  <div className="p-20 text-center text-slate-400 flex flex-col items-center gap-4">
                    <div className="w-10 h-10 border-4 border-teal-500/30 border-t-teal-500 rounded-full animate-spin"></div>
                    <p className="font-medium animate-pulse">Syncing data...</p>
                  </div>
                ) : recentLeads.length === 0 ? (
                  <div className="p-20 text-center text-slate-400">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                       <Activity className="w-8 h-8 text-slate-300" />
                    </div>
                    <p className="text-lg font-medium text-slate-600">No activity yet</p>
                    <p className="text-sm text-slate-400 mt-1 max-w-xs mx-auto">Start a campaign to see your agents in action.</p>
                    <Link href="/campaigns/new">
                      <Button variant="link" className="text-teal-600 mt-4">Launch Campaign →</Button>
                    </Link>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {recentLeads.map((lead, i) => (
                      <Link key={lead.id} href={`/leads/${lead.id}`}>
                        <motion.div 
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.1 * i }}
                          className="p-6 flex items-center justify-between hover:bg-slate-50/80 transition-all cursor-pointer group"
                        >
                           <div className="flex items-center gap-5">
                              <div className="relative">
                                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-slate-100 to-slate-200 flex items-center justify-center font-bold text-lg text-slate-600 shadow-inner group-hover:scale-110 transition-transform duration-300">
                                    {getLeadDisplayName(lead).charAt(0).toUpperCase()}
                                  </div>
                                  <div className={`absolute -bottom-1 -right-1 w-4 h-4 border-2 border-white rounded-full ${lead.status === 'QUALIFIED' ? 'bg-emerald-500' : 'bg-slate-300'}`}></div>
                              </div>
                              <div>
                                 <div className="font-bold text-slate-900 text-lg group-hover:text-teal-600 transition-colors">
                                   {getLeadDisplayName(lead)}
                                 </div>
                                 <div className="text-sm font-medium text-slate-500 flex items-center gap-2">
                                   <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                                   {lead.campaigns?.name || 'No Campaign'}
                                 </div>
                              </div>
                           </div>
                           <div className="flex items-center gap-8">
                              <span className={`px-4 py-1.5 rounded-full text-xs font-bold tracking-wide border ring-1 ${getStatusStyle(lead.status)}`}>
                                {lead.status.replace(/_/g, ' ')}
                              </span>
                              <div className="text-right min-w-[100px]">
                                <span className="text-sm font-medium text-slate-900 block group-hover:translate-x-1 transition-transform">
                                  {getTimeAgo(lead.created_at)}
                                </span>
                                <span className="text-xs text-slate-400">Changed status</span>
                              </div>
                              <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-teal-500 transition-colors" />
                           </div>
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
    </div>
  );
}
