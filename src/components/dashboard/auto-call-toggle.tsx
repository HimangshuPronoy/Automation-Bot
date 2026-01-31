'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase-client';
import { Phone, Zap, Play, Pause, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface CurrentCall {
  leadId: string;
  businessName: string;
  phoneNumber: string;
  status: 'dialing' | 'connected' | 'ended';
}

export function AutoCallToggle() {
  const [isActive, setIsActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [currentCall, setCurrentCall] = useState<CurrentCall | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    async function loadPendingCount() {
      const { count } = await supabase
        .from('leads')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'NEW');
      
      setPendingCount(count || 0);
    }
    loadPendingCount();
  }, []);

  const processNextCall = async () => {
    // Get next NEW lead
    const { data: leads } = await supabase
      .from('leads')
      .select('id, businessName, phoneNumber')
      .eq('status', 'NEW')
      .limit(1);
    
    if (!leads || leads.length === 0) {
      setIsActive(false);
      toast.info('All leads have been contacted!');
      return;
    }
    
    const lead = leads[0];
    
    // Update UI to show calling
    setCurrentCall({
      leadId: lead.id,
      businessName: lead.businessName || 'Unknown Business',
      phoneNumber: lead.phoneNumber || 'No phone',
      status: 'dialing'
    });
    
    try {
      const res = await fetch('/api/call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadId: lead.id })
      });
      
      if (res.ok) {
        setCurrentCall(prev => prev ? { ...prev, status: 'connected' } : null);
        setPendingCount(prev => Math.max(0, prev - 1));
      } else {
        const err = await res.json();
        console.error('Call failed:', err);
      }
    } catch (e) {
      console.error('Call error:', e);
    }
  };

  // Auto-call loop
  useEffect(() => {
    if (isActive && !intervalRef.current) {
      processNextCall();
      intervalRef.current = setInterval(processNextCall, 30000); // Every 30s
    }
    
    if (!isActive && intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
      setCurrentCall(null);
    }
    
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive]);

  const toggleAutoCall = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    
    setIsActive(!isActive);
    setIsLoading(false);
    
    if (!isActive) {
      toast.success("Auto-Caller Activated", {
        description: `Bot will now call ${pendingCount} pending leads...`,
      });
    } else {
      toast.info("Auto-Caller Paused");
    }
  };

  return (
    <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-slate-900 to-slate-800 p-8 text-white shadow-xl h-full flex flex-col justify-between group">
       {/* Background Effects */}
       <div className="absolute top-0 right-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-purple-500/20 blur-3xl group-hover:bg-purple-500/30 transition-all duration-700"></div>
       <div className="absolute bottom-0 left-0 -ml-16 -mb-16 h-64 w-64 rounded-full bg-blue-500/20 blur-3xl group-hover:bg-blue-500/30 transition-all duration-700"></div>

       <div className="relative z-10 flex justify-between items-start">
          <div>
             <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium backdrop-blur-md mb-4 border border-white/10">
                <Zap size={12} className={isActive ? "text-yellow-400 fill-yellow-400" : "text-slate-400"} />
                {isActive ? "SYSTEM ACTIVE" : "SYSTEM IDLE"}
             </div>
             <h3 className="text-3xl font-light tracking-tight">Auto Caller</h3>
             <p className="text-slate-400 mt-2 font-light">
                {isActive 
                  ? "Autonomous agents are currently processing your lead list." 
                  : "Activate to start autonomous outbound calling campaigns."}
             </p>
          </div>
          
          <div className="bg-white/10 p-3 rounded-2xl backdrop-blur-sm">
             <Phone className="text-white/80" size={24} />
          </div>
       </div>

       {/* Current Call Display */}
       {currentCall && (
         <div className="relative z-10 mt-6 p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
           <div className="flex items-center gap-3">
             <div className={`w-3 h-3 rounded-full ${currentCall.status === 'dialing' ? 'bg-yellow-400 animate-pulse' : 'bg-green-400 animate-pulse'}`}></div>
             <div className="flex-1">
               <p className="text-sm font-medium text-white">{currentCall.businessName}</p>
               <p className="text-lg font-mono text-emerald-400 tracking-wider">{currentCall.phoneNumber}</p>
             </div>
             <span className="text-xs uppercase tracking-wider text-slate-400 bg-white/10 px-2 py-1 rounded-full">
               {currentCall.status}
             </span>
           </div>
         </div>
       )}

       <div className="relative z-10 mt-8">
          <button 
            onClick={toggleAutoCall}
            disabled={isLoading || pendingCount === 0}
            className={`w-full relative overflow-hidden rounded-2xl p-4 transition-all duration-300 flex items-center justify-between group/btn ${
              isActive ? 'bg-red-500/20 border border-red-500/50 hover:bg-red-500/30' : 
              pendingCount === 0 ? 'bg-slate-600 text-slate-300 cursor-not-allowed' :
              'bg-white text-slate-900 hover:bg-slate-50'
            }`}
          >
             <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${isActive ? 'bg-red-500 text-white' : 'bg-slate-900 text-white'}`}>
                   {isLoading ? <Loader2 size={20} className="animate-spin" /> : (isActive ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" />)}
                </div>
                <div className="text-left">
                   <div className={`font-semibold ${isActive ? 'text-red-200' : pendingCount === 0 ? 'text-slate-300' : 'text-slate-900'}`}>
                      {isActive ? "Stop Calling" : pendingCount === 0 ? "No Leads" : "Start Campaign"}
                   </div>
                   <div className={`text-xs ${isActive ? 'text-red-300' : 'text-slate-500'}`}>
                      {isActive ? "Click to pause" : `${pendingCount} leads pending`}
                   </div>
                </div>
             </div>
             
             {/* Pulse Effect when Active */}
             {isActive && (
                <div className="absolute right-4 flex h-3 w-3">
                   <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                   <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                </div>
             )}
          </button>
       </div>
    </div>
  );
}
