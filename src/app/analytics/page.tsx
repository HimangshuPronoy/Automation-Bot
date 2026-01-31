'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/db';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, TrendingUp, Users, Phone, DollarSign, Target, BarChart3 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { motion } from 'framer-motion';
import { AnimatedBackground } from '@/components/ui/animated-background';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

interface DayData {
  day: string;
  leads: number;
}

interface StatusData {
  name: string;
  value: number;
}

interface RevenueData {
  month: string;
  revenue: number;
}

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalLeads: 0,
    qualifiedLeads: 0,
    callsMade: 0,
    dealsWon: 0,
    revenue: 0,
    conversionRate: 0,
  });
  const [leadsByDay, setLeadsByDay] = useState<DayData[]>([]);
  const [leadsByStatus, setLeadsByStatus] = useState<StatusData[]>([]);
  const [revenueByMonth, setRevenueByMonth] = useState<RevenueData[]>([]);

  const loadAnalytics = async () => {
    setLoading(true);

    const [leadsRes, qualifiedRes, callsRes, dealsRes, quotesRes] = await Promise.all([
      db.from('leads').select('*', { count: 'exact', head: true }),
      db.from('leads').select('*', { count: 'exact', head: true }).eq('status', 'QUALIFIED'),
      db.from('calls').select('*', { count: 'exact', head: true }),
      db.from('deals').select('*', { count: 'exact', head: true }).eq('stage', 'WON'),
      db.from('quotes').select('amount').eq('status', 'PAID'),
    ]);

    const totalLeads = leadsRes.count || 0;
    const qualifiedLeads = qualifiedRes.count || 0;
    const revenue = quotesRes.data?.reduce((sum, q) => sum + (q.amount || 0), 0) || 0;

    setStats({
      totalLeads,
      qualifiedLeads,
      callsMade: callsRes.count || 0,
      dealsWon: dealsRes.count || 0,
      revenue,
      conversionRate: totalLeads > 0 ? Math.round((qualifiedLeads / totalLeads) * 100) : 0,
    });

    const { data: allLeads } = await db.from('leads').select('status');
    const statusCounts: Record<string, number> = {};
    allLeads?.forEach(lead => {
      statusCounts[lead.status] = (statusCounts[lead.status] || 0) + 1;
    });
    setLeadsByStatus(Object.entries(statusCounts).map(([name, value]) => ({ name, value })));

    const { data: recentLeads } = await db
      .from('leads')
      .select('createdAt')
      .gte('createdAt', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

    const dayMap: Record<string, number> = {};
    for (let i = 6; i >= 0; i--) {
      const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      const key = date.toLocaleDateString('en-US', { weekday: 'short' });
      dayMap[key] = 0;
    }
    recentLeads?.forEach(lead => {
      const key = new Date(lead.createdAt).toLocaleDateString('en-US', { weekday: 'short' });
      if (dayMap[key] !== undefined) dayMap[key]++;
    });
    setLeadsByDay(Object.entries(dayMap).map(([day, leads]) => ({ day, leads })));

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const { data: paidQuotes } = await db
      .from('quotes')
      .select('amount, createdAt')
      .eq('status', 'PAID')
      .gte('createdAt', sixMonthsAgo.toISOString());
    
    const monthlyRevenue: Record<string, number> = {};
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const monthKey = monthNames[d.getMonth()];
      monthlyRevenue[monthKey] = 0;
    }
    
    paidQuotes?.forEach(quote => {
      const quoteDate = new Date(quote.createdAt);
      const monthKey = monthNames[quoteDate.getMonth()];
      if (monthlyRevenue[monthKey] !== undefined) {
        monthlyRevenue[monthKey] += (quote.amount || 0) / 100;
      }
    });
    
    setRevenueByMonth(Object.entries(monthlyRevenue).map(([month, revenue]) => ({ month, revenue })));
    setLoading(false);
  };

  useEffect(() => {
    loadAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const statCards = [
    { title: 'Total Leads', value: stats.totalLeads, icon: <Users className="h-5 w-5" />, color: 'bg-indigo-100 text-indigo-600' },
    { title: 'Qualified', value: stats.qualifiedLeads, icon: <Target className="h-5 w-5" />, color: 'bg-emerald-100 text-emerald-600' },
    { title: 'Calls Made', value: stats.callsMade, icon: <Phone className="h-5 w-5" />, color: 'bg-blue-100 text-blue-600' },
    { title: 'Deals Won', value: stats.dealsWon, icon: <TrendingUp className="h-5 w-5" />, color: 'bg-purple-100 text-purple-600' },
    { title: 'Revenue', value: `$${(stats.revenue / 100).toLocaleString()}`, icon: <DollarSign className="h-5 w-5" />, color: 'bg-green-100 text-green-600' },
    { title: 'Conversion', value: `${stats.conversionRate}%`, icon: <BarChart3 className="h-5 w-5" />, color: 'bg-orange-100 text-orange-600' },
  ];

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-900/50 p-4 md:p-8 font-sans">
      <div className="fixed inset-0 z-[-1] opacity-60">
        <AnimatedBackground />
      </div>

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white tracking-tight">
            Analytics
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg font-light">
            Track your sales performance and metrics
          </p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          {statCards.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ y: -5 }}
            >
              <Card className="rounded-[1.5rem] border-none shadow-lg bg-white/80 backdrop-blur-xl overflow-hidden hover:shadow-xl transition-all duration-300">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">{stat.title}</span>
                    <div className={`p-2 rounded-xl ${stat.color}`}>
                      {stat.icon}
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-slate-800">{stat.value}</div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Charts */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Leads This Week */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="rounded-[2rem] border-none shadow-xl bg-white/80 backdrop-blur-xl overflow-hidden">
              <CardHeader className="p-6 border-b border-slate-100">
                <CardTitle className="text-xl font-bold text-slate-800">Leads This Week</CardTitle>
                <CardDescription>Daily lead acquisition trend</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={leadsByDay}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="day" stroke="#94a3b8" fontSize={12} />
                    <YAxis stroke="#94a3b8" fontSize={12} />
                    <Tooltip 
                      contentStyle={{ 
                        borderRadius: '12px', 
                        border: 'none', 
                        boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
                        background: 'white'
                      }} 
                    />
                    <Line 
                      type="monotone" 
                      dataKey="leads" 
                      stroke="#6366f1" 
                      strokeWidth={3}
                      dot={{ fill: '#6366f1', strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, fill: '#6366f1' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>

          {/* Lead Status Distribution */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="rounded-[2rem] border-none shadow-xl bg-white/80 backdrop-blur-xl overflow-hidden">
              <CardHeader className="p-6 border-b border-slate-100">
                <CardTitle className="text-xl font-bold text-slate-800">Lead Status Distribution</CardTitle>
                <CardDescription>Breakdown by current status</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie
                      data={leadsByStatus}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      innerRadius={60}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                      labelLine={false}
                    >
                      {leadsByStatus.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        borderRadius: '12px', 
                        border: 'none', 
                        boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
                        background: 'white'
                      }} 
                    />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>

          {/* Revenue Trend */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="lg:col-span-2"
          >
            <Card className="rounded-[2rem] border-none shadow-xl bg-white/80 backdrop-blur-xl overflow-hidden">
              <CardHeader className="p-6 border-b border-slate-100">
                <CardTitle className="text-xl font-bold text-slate-800">Revenue Trend</CardTitle>
                <CardDescription>Monthly revenue from paid quotes (last 6 months)</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={revenueByMonth}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
                    <YAxis stroke="#94a3b8" fontSize={12} />
                    <Tooltip 
                      formatter={(value) => [`$${value}`, 'Revenue']}
                      contentStyle={{ 
                        borderRadius: '12px', 
                        border: 'none', 
                        boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
                        background: 'white'
                      }} 
                    />
                    <Bar 
                      dataKey="revenue" 
                      fill="#10b981" 
                      radius={[8, 8, 0, 0]} 
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
