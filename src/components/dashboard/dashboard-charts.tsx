'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase-client';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';

interface DayData {
  name: string;
  leads: number;
  qualified: number;
}

interface HourData {
  name: string;
  calls: number;
}

export function DashboardCharts() {
  const [leadData, setLeadData] = useState<DayData[]>([]);
  const [callData, setCallData] = useState<HourData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadChartData() {
      setLoading(true);
      
      try {
        // Generate last 7 days for x-axis
        const last7Days = Array.from({ length: 7 }, (_, i) => {
          const date = subDays(new Date(), 6 - i);
          return {
            date,
            name: format(date, 'EEE'),
            leads: 0,
            qualified: 0
          };
        });

        // Fetch leads from last 7 days
        const sevenDaysAgo = subDays(new Date(), 7);
        const { data: leads } = await supabase
          .from('leads')
          .select('created_at, status')
          .gte('created_at', sevenDaysAgo.toISOString());

        if (leads) {
          leads.forEach(lead => {
            const leadDate = new Date(lead.created_at);
            const dayIndex = last7Days.findIndex(d => 
              format(d.date, 'yyyy-MM-dd') === format(leadDate, 'yyyy-MM-dd')
            );
            if (dayIndex !== -1) {
              last7Days[dayIndex].leads += 1;
              if (lead.status === 'QUALIFIED') {
                last7Days[dayIndex].qualified += 1;
              }
            }
          });
        }

        setLeadData(last7Days.map(d => ({ name: d.name, leads: d.leads, qualified: d.qualified })));

        // Generate hourly data for today's calls
        const todayStart = startOfDay(new Date());
        const todayEnd = endOfDay(new Date());
        
        const hours = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'];
        const hourlyData: HourData[] = hours.map(h => ({ name: h, calls: 0 }));

        // Fetch today's contacted leads (as proxy for calls)
        const { data: todayLeads } = await supabase
          .from('leads')
          .select('created_at, status')
          .gte('created_at', todayStart.toISOString())
          .lte('created_at', todayEnd.toISOString())
          .in('status', ['CONTACTED', 'QUALIFIED', 'NOT_INTERESTED', 'CALL_BACK']);

        if (todayLeads) {
          todayLeads.forEach(lead => {
            const hour = new Date(lead.created_at).getHours();
            const hourIndex = hour - 9; // Map 9AM = index 0
            if (hourIndex >= 0 && hourIndex < hourlyData.length) {
              hourlyData[hourIndex].calls += 1;
            }
          });
        }

        setCallData(hourlyData);
      } catch (error) {
        console.error('Error loading chart data:', error);
        // Fallback to empty data
        setLeadData([
          { name: 'Mon', leads: 0, qualified: 0 },
          { name: 'Tue', leads: 0, qualified: 0 },
          { name: 'Wed', leads: 0, qualified: 0 },
          { name: 'Thu', leads: 0, qualified: 0 },
          { name: 'Fri', leads: 0, qualified: 0 },
          { name: 'Sat', leads: 0, qualified: 0 },
          { name: 'Sun', leads: 0, qualified: 0 },
        ]);
        setCallData([
          { name: '09:00', calls: 0 },
          { name: '10:00', calls: 0 },
          { name: '11:00', calls: 0 },
          { name: '12:00', calls: 0 },
          { name: '13:00', calls: 0 },
          { name: '14:00', calls: 0 },
          { name: '15:00', calls: 0 },
        ]);
      } finally {
        setLoading(false);
      }
    }

    loadChartData();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 my-8">
        <Card className="glass border-white/60 shadow-sm rounded-3xl h-[380px] flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        </Card>
        <Card className="glass border-white/60 shadow-sm rounded-3xl h-[380px] flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 my-8">
      {/* Lead Velocity Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="glass border-white/60 dark:border-white/10 shadow-sm rounded-3xl overflow-hidden hover:shadow-xl transition-all duration-300">
           <CardHeader>
             <CardTitle className="text-deep-gray dark:text-white font-medium text-lg">Lead Velocity</CardTitle>
             <CardDescription>New leads vs Qualified leads over the last 7 days</CardDescription>
           </CardHeader>
           <CardContent className="h-[300px] w-full pt-4">
             <ResponsiveContainer width="100%" height="100%">
               <AreaChart data={leadData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                 <defs>
                   <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                     <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                     <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                   </linearGradient>
                   <linearGradient id="colorQualified" x1="0" y1="0" x2="0" y2="1">
                     <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                     <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                   </linearGradient>
                 </defs>
                 <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                 <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                 <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                 <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                 />
                 <Area type="monotone" dataKey="leads" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorLeads)" name="Total Leads" />
                 <Area type="monotone" dataKey="qualified" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorQualified)" name="Qualified" />
               </AreaChart>
             </ResponsiveContainer>
           </CardContent>
        </Card>
      </motion.div>

      {/* Call Volume Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="glass border-white/60 dark:border-white/10 shadow-sm rounded-3xl overflow-hidden hover:shadow-xl transition-all duration-300">
           <CardHeader>
             <CardTitle className="text-deep-gray dark:text-white font-medium text-lg">Call Volume (Today)</CardTitle>
             <CardDescription>AI Agent outbound activity by hour</CardDescription>
           </CardHeader>
           <CardContent className="h-[300px] w-full pt-4">
             <ResponsiveContainer width="100%" height="100%">
               <BarChart data={callData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                 <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                 <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                 <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                 <Tooltip 
                    cursor={{fill: 'rgba(255,255,255,0.2)'}}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                 />
                 <Bar dataKey="calls" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={40}>
                    {callData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#3b82f6' : '#60a5fa'} />
                    ))}
                 </Bar>
               </BarChart>
             </ResponsiveContainer>
           </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
