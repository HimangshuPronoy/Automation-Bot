'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/db';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Handshake, XCircle } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { AnimatedBackground } from '@/components/ui/animated-background';

interface Deal {
  id: string;
  stage: string;
  requirements: string;
  quote_amount: number;
  notes: string;
  created_at: string;
  leads: {
    id: string;
    businessName: string;
    phoneNumber: string;
  };
}

const STAGES = ['NEW', 'INTERESTED', 'QUOTE_SENT', 'NEGOTIATING', 'WON', 'LOST'];

const STAGE_CONFIG: Record<string, { bgClass: string; label: string }> = {
  NEW: { bgClass: 'bg-slate-50 border-slate-200', label: 'New' },
  INTERESTED: { bgClass: 'bg-blue-50 border-blue-200', label: 'Interested' },
  QUOTE_SENT: { bgClass: 'bg-purple-50 border-purple-200', label: 'Quote Sent' },
  NEGOTIATING: { bgClass: 'bg-amber-50 border-amber-200', label: 'Negotiating' },
  WON: { bgClass: 'bg-emerald-50 border-emerald-200', label: 'Won' },
  LOST: { bgClass: 'bg-red-50 border-red-200', label: 'Lost' },
};

export default function DealsPage() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);

  const loadDeals = async () => {
    setLoading(true);
    const { data } = await db
      .from('deals')
      .select('*, leads(id, businessName, phoneNumber)')
      .order('created_at', { ascending: false });
    
    if (data) setDeals(data);
    setLoading(false);
  };

  useEffect(() => {
    loadDeals();
  }, []);

  const moveDeal = async (dealId: string, newStage: string) => {
    await db.from('deals').update({ stage: newStage }).eq('id', dealId);
    loadDeals();
  };

  const dealsByStage = STAGES.reduce((acc, stage) => {
    acc[stage] = deals.filter(d => d.stage === stage);
    return acc;
  }, {} as Record<string, Deal[]>);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-900/50 p-4 md:p-6 font-sans">
      <div className="fixed inset-0 z-[-1] opacity-60">
        <AnimatedBackground />
      </div>

      <div className="max-w-full mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white tracking-tight">
            Deals Pipeline
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg font-light">
            Track your deals from interested leads to closed wins
          </p>
        </div>

        {/* Stats bar */}
        <div className="flex gap-4 mb-8 flex-wrap">
          {STAGES.filter(s => s !== 'LOST').map((stage) => (
            <div 
              key={stage}
              className={`px-4 py-2 rounded-full bg-white/80 backdrop-blur-md border border-white/40 text-sm font-medium text-slate-600 flex items-center gap-2`}
            >
              <span className={`w-2 h-2 rounded-full ${STAGE_CONFIG[stage].bgClass.split(' ')[0]}`}></span>
              {STAGE_CONFIG[stage].label}: {dealsByStage[stage]?.length || 0}
            </div>
          ))}
        </div>

        {/* Kanban Board */}
        <div className="flex gap-5 overflow-x-auto pb-4">
          {STAGES.filter(s => s !== 'LOST').map((stage, stageIndex) => (
            <motion.div 
              key={stage} 
              className="flex-shrink-0 w-80"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: stageIndex * 0.1 }}
            >
              {/* Column Header */}
              <div className={`rounded-t-2xl px-5 py-4 bg-white border border-slate-200 text-slate-800 font-semibold flex justify-between items-center shadow-sm`}>
                <span className="text-lg">{STAGE_CONFIG[stage].label}</span>
                <Badge variant="secondary" className="bg-slate-100 text-slate-600 border border-slate-200 px-3 py-1 text-sm">
                  {dealsByStage[stage]?.length || 0}
                </Badge>
              </div>

              {/* Column Body */}
              <div className={`${STAGE_CONFIG[stage].bgClass} rounded-b-2xl p-3 min-h-[450px] space-y-3 border-x border-b border-slate-200`}>
                {dealsByStage[stage]?.map((deal, index) => (
                  <motion.div
                    key={deal.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ y: -2 }}
                  >
                    <Card className="rounded-xl border-none shadow-md bg-white/90 backdrop-blur-sm hover:shadow-lg transition-all">
                      <CardContent className="p-4">
                        <Link href={`/leads/${deal.leads?.id}`}>
                          <h3 className="font-semibold text-base text-slate-800 mb-2 hover:text-indigo-600 transition-colors">
                            {deal.leads?.businessName}
                          </h3>
                        </Link>
                        
                        {deal.quote_amount && (
                          <p className="text-lg font-bold text-emerald-600">
                            ${(deal.quote_amount / 100).toLocaleString()}
                          </p>
                        )}
                        
                        {deal.notes && (
                          <p className="text-xs text-slate-500 mt-2 line-clamp-2">{deal.notes}</p>
                        )}

                        {stage !== 'WON' && (
                          <div className="flex gap-2 mt-4 pt-3 border-t border-slate-100">
                            <Button 
                              size="sm" 
                              variant="ghost"
                              onClick={() => moveDeal(deal.id, STAGES[STAGES.indexOf(stage) + 1])}
                              className="flex-1 rounded-lg hover:bg-indigo-50 hover:text-indigo-600"
                            >
                              <ArrowRight className="h-4 w-4 mr-1"/>
                              Advance
                            </Button>
                            <Button 
                              size="sm" 
                              variant="ghost"
                              onClick={() => moveDeal(deal.id, 'LOST')}
                              className="rounded-lg text-red-500 hover:bg-red-50 hover:text-red-600"
                            >
                              <XCircle className="h-4 w-4"/>
                            </Button>
                          </div>
                        )}

                        {stage === 'WON' && (
                          <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-100 text-emerald-600">
                            <Handshake className="h-4 w-4" />
                            <span className="text-sm font-medium">Deal Closed!</span>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}

                {dealsByStage[stage]?.length === 0 && (
                  <div className="text-center py-10 text-slate-400 text-sm">
                    No deals in this stage
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Lost Deals Section */}
        {dealsByStage['LOST']?.length > 0 && (
          <motion.div 
            className="mt-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <h2 className="text-xl font-bold text-red-600 mb-4 flex items-center gap-2">
              <XCircle className="h-5 w-5" />
              Lost Deals ({dealsByStage['LOST'].length})
            </h2>
            <div className="grid md:grid-cols-4 gap-4">
              {dealsByStage['LOST'].map((deal) => (
                <Card key={deal.id} className="rounded-xl border-none shadow-md bg-white/60 backdrop-blur-sm opacity-70">
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-sm text-slate-600">{deal.leads?.businessName}</h3>
                    {deal.notes && <p className="text-xs text-slate-400 mt-1">{deal.notes}</p>}
                  </CardContent>
                </Card>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
