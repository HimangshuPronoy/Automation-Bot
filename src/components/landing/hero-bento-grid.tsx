'use client';

import { motion } from 'framer-motion';
import { Bot, Phone, CheckCircle2, Globe } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';

// Mock data for mini-chart
const data = [
  { value: 40 }, { value: 30 }, { value: 45 }, { value: 80 }, { value: 55 }, { value: 90 }, { value: 70 }, { value: 100 }
];

export const HeroBentoGrid = () => {
  return (
    <div className="relative w-full max-w-7xl mx-auto h-[600px] md:h-[700px] perspective-2000">
      
      {/* Central Dashboard Hub */}
      <motion.div 
        initial={{ opacity: 0, y: 100, rotateX: 20 }}
        animate={{ opacity: 1, y: 0, rotateX: 0 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="absolute left-1/2 top-[10%] -translate-x-1/2 w-[90%] md:w-[700px] h-[400px] md:h-[500px] bg-white/40 dark:bg-black/40 backdrop-blur-3xl border border-white/50 dark:border-white/10 rounded-[40px] shadow-2xl shadow-purple-500/10 z-10 overflow-hidden"
      >
        {/* Glossy Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-transparent pointer-events-none" />
        
        {/* Dashboard Content */}
        <div className="p-8 h-full flex flex-col">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
             <div className="flex items-center gap-4">
               <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white shadow-lg">
                 <Bot size={24} />
               </div>
               <div>
                 <div className="text-lg font-semibold text-deep-gray dark:text-white">AutoSales Agent</div>
                 <div className="text-sm text-deep-gray/60 dark:text-white/60">Active • 24/7 Monitoring</div>
               </div>
             </div>
             <div className="px-3 py-1 rounded-full bg-green-500/20 text-green-700 dark:text-green-300 text-xs font-medium flex items-center gap-2 border border-green-500/20">
               <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
               Live System
             </div>
          </div>

          {/* Main Chart Area */}
          <div className="flex-1 rounded-3xl bg-white/30 dark:bg-white/5 border border-white/40 dark:border-white/10 p-6 relative overflow-hidden group">
             <div className="absolute top-6 left-6 z-10">
               <div className="text-sm text-deep-gray/60 dark:text-white/60">Revenue Generated</div>
               <div className="text-4xl font-bold text-deep-gray dark:text-white mt-1">$124,500.00</div>
             </div>
             
             <div className="absolute inset-0 pt-20">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data}>
                    <defs>
                      <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <Area type="monotone" dataKey="value" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
                  </AreaChart>
                </ResponsiveContainer>
             </div>
          </div>
        </div>
      </motion.div>

      {/* Floating Widget: Live Call Analysis */}
      <motion.div 
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, delay: 0.5 }}
        className="absolute top-[20%] left-[5%] md:left-[0%] w-[260px] bg-white/60 dark:bg-black/60 backdrop-blur-2xl border border-white/60 dark:border-white/10 rounded-3xl p-5 shadow-xl shadow-blue-500/10 z-20"
      >
        <div className="flex justify-between items-center mb-4">
           <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
               <Phone size={18} />
             </div>
             <div className="text-sm font-medium text-deep-gray dark:text-white">Live Call</div>
           </div>
           <div className="text-xs font-mono text-deep-gray/50">02:14</div>
        </div>
        <div className="space-y-2">
           {/* Fake Waveform */}
           <div className="flex items-center justify-center gap-1 h-8">
              {[1,2,3,4,5,6,7,8,9,10,11,12].map((i) => (
                <motion.div 
                   key={i}
                   animate={{ height: [10, 25, 10] }}
                   transition={{ repeat: Infinity, duration: 1, delay: i * 0.1 }}
                   className="w-1.5 bg-blue-500/50 rounded-full"
                />
              ))}
           </div>
           <div className="text-xs text-center text-deep-gray/60 dark:text-white/60">Pitching Value Prop...</div>
        </div>
      </motion.div>

      {/* Floating Widget: Success Notification */}
      <motion.div 
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, delay: 0.8 }}
        className="absolute top-[30%] right-[5%] md:right-[0%] w-[280px] bg-white/70 dark:bg-black/70 backdrop-blur-2xl border border-white/60 dark:border-white/10 rounded-3xl p-4 flex items-center gap-4 shadow-xl shadow-green-500/10 z-20"
      >
        <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400 flex-shrink-0">
           <CheckCircle2 size={24} />
        </div>
        <div>
           <div className="text-sm font-bold text-deep-gray dark:text-white">Meeting Booked</div>
           <div className="text-xs text-deep-gray/60 dark:text-white/60">Sarah just booked a demo</div>
        </div>
      </motion.div>
      
      {/* Floating Widget: Global Reach */}
      <motion.div 
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 1.1 }}
        className="absolute bottom-[20%] left-[10%] md:left-[5%] w-[200px] bg-white/50 dark:bg-black/50 backdrop-blur-xl border border-white/40 dark:border-white/10 rounded-3xl p-4 shadow-lg z-0"
      >
         <div className="flex items-center gap-3 mb-2">
            <Globe size={16} className="text-purple-500" />
            <span className="text-xs font-semibold text-deep-gray dark:text-white">Global Reach</span>
         </div>
         <div className="flex -space-x-2">
            {[1,2,3,4].map((i) => (
               <div key={i} className="w-8 h-8 rounded-full border-2 border-white dark:border-black bg-gray-200 dark:bg-gray-800" />
            ))}
            <div className="w-8 h-8 rounded-full border-2 border-white dark:border-black bg-gray-100 flex items-center justify-center text-[10px] text-gray-500 font-bold">+12</div>
         </div>
      </motion.div>

      {/* Decorative gradient blobs behind dashboard to enhance depth */}
      <div className="absolute top-[20%] left-[20%] w-[400px] h-[400px] bg-purple-400/20 blur-[100px] rounded-full pointer-events-none z-0" />
      <div className="absolute top-[40%] right-[20%] w-[300px] h-[300px] bg-pink-400/20 blur-[100px] rounded-full pointer-events-none z-0" />

    </div>
  );
};
