'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, Globe, Bot, Phone, BarChart3, ChevronRight, Play, Check, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import { Playfair_Display, Inter } from 'next/font/google';

// Load fonts
const playfair = Playfair_Display({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-serif',
});

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans',
});

export default function LandingPage() {
  return (
    <div className={`min-h-screen bg-slate-50 font-sans text-slate-900 overflow-x-hidden ${playfair.variable} ${inter.variable}`}>
      
      {/* Floating Glassmorphism Navbar */}
      <nav className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-5xl px-4">
        <div className="bg-white/80 backdrop-blur-xl border border-white/30 shadow-lg rounded-full px-6 py-3 flex justify-between items-center">
           {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-black rounded-xl flex items-center justify-center text-white">
               <Bot size={20} />
            </div>
            <span className="text-lg font-bold text-slate-900">AutoSales</span>
          </div>

          <div className="hidden md:flex items-center gap-6 font-medium text-sm text-slate-600">
            <Link href="#features" className="hover:text-black transition-colors">Features</Link>
            <Link href="#how-it-works" className="hover:text-black transition-colors">How it Works</Link>
            <Link href="#pricing" className="hover:text-black transition-colors">Pricing</Link>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-semibold text-slate-700 hover:text-black transition-colors hidden sm:block">
              Log in
            </Link>
            <Link href="/login">
              <Button className="rounded-full px-5 bg-black hover:bg-slate-800 text-white h-10 text-sm font-semibold shadow-md">
                Get Started Free
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Hero Section - WRAPPED IN GRAY CARD */}
      <section className="px-4 pt-24 pb-4">
        <div className="max-w-[1400px] mx-auto bg-[#e8e9eb] rounded-[3rem] p-8 md:p-16 overflow-hidden relative min-h-[85vh] flex items-center shadow-sm">
            
            {/* Background texture/noise if needed */}
            <div className="absolute inset-0 opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/noise.png')]"></div>

            <div className="relative z-10 w-full grid lg:grid-cols-2 gap-16 items-center">
            
              {/* Left Column */}
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="flex flex-col items-start max-w-xl"
              >
                {/* User Badge */}
                <div className="flex items-center gap-3 mb-10 bg-white/60 backdrop-blur-sm px-4 py-2 rounded-full border border-slate-200 w-fit">
                  <div className="flex -space-x-2">
                      <div className="w-8 h-8 rounded-full border-2 border-white bg-slate-200 overflow-hidden"><img src="https://i.pravatar.cc/100?img=1" alt="User" /></div>
                      <div className="w-8 h-8 rounded-full border-2 border-white bg-slate-300 overflow-hidden"><img src="https://i.pravatar.cc/100?img=5" alt="User" /></div>
                      <div className="w-8 h-8 rounded-full border-2 border-white bg-black text-white flex items-center justify-center text-xs font-bold">+5k</div>
                  </div>
                  <span className="text-sm font-semibold text-slate-700">5,000+ Sales Teams</span>
                </div>

                {/* Headline */}
                <h1 className={`${playfair.className} text-7xl lg:text-8xl leading-[0.9] font-medium text-black mb-8 tracking-tight`}>
                  Auto<span className="italic">Sales</span><sup className="text-4xl font-light font-sans top-[-0.5em]">AI</sup>
                </h1>

                {/* Subhead */}
                <p className="text-xl text-slate-600 leading-relaxed mb-10 max-w-lg">
                  AI-Powered Lead Generation &amp; Calling. Find, qualify, and convert leads automatically — <span className="text-slate-900 font-semibold">50× faster than manual outreach.</span>
                </p>

                {/* Footer of Left Col: Reviews */}
                <div className="w-full border-t border-slate-300 pt-8 mb-10">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-slate-100 overflow-hidden border border-white shadow-sm"><img src="https://i.pravatar.cc/100?img=32" alt="Reviewer" /></div>
                        <div>
                            <div className="flex gap-3 text-sm font-bold text-slate-900 items-center">
                                Loved the performance <span className="text-slate-400 font-light">/</span> <span className="flex items-center gap-1"><Star className="w-3 h-3 fill-black" /> 4.9</span>
                            </div>
                            <div className="text-xs text-slate-500 font-medium">100% Satisfied</div>
                        </div>
                    </div>
                </div>

                {/* Buttons */}
                <div className="flex items-center gap-5">
                  <Link href="/login">
                      <Button className="h-13 px-8 rounded-full bg-black text-white hover:bg-slate-800 text-base font-semibold shadow-xl transition-transform hover:scale-105">
                        Start Free Trial
                      </Button>
                  </Link>
                  <Link href="#features" className="flex items-center gap-2 text-slate-600 hover:text-black font-semibold text-sm">
                      See How It Works <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>

              </motion.div>

              {/* Right Column - Visual */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="relative h-[700px] w-full flex items-center justify-center lg:justify-end"
              >
                  {/* The Orange Background Shape */}
                  <div className="relative w-[450px] h-[650px] bg-gradient-to-t from-orange-400 to-orange-500 rounded-[3rem] overflow-hidden shadow-2xl">
                       {/* Image */}
                       <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=1000&auto=format&fit=crop')] bg-cover bg-center mix-blend-normal contrast-110"></div>
                       {/* Gradient Overlay for text readability if needed */}
                       <div className="absolute inset-0 bg-gradient-to-tr from-orange-500/20 to-transparent mix-blend-overlay"></div>
                  </div>

                  {/* Floating Elements */}
                  
                  {/* 1. Lead Qualified */}
                  <div className="absolute top-[25%] left-[2rem] lg:left-[5rem] bg-white rounded-xl shadow-xl p-2 pr-4 flex items-center gap-3 animate-bounce-slow">
                     <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-white shadow-sm">
                        <Check size={16} strokeWidth={4} />
                     </div>
                     <span className="text-sm font-bold text-slate-800">Lead Qualified!</span>
                  </div>

                  {/* 2. Call Scheduled */}
                  <div className="absolute top-[35%] left-[-1rem] lg:left-[2rem] bg-white rounded-xl shadow-xl p-2 pr-4 flex items-center gap-3 animate-bounce-delayed">
                     <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center text-white shadow-sm">
                        <Phone size={14} />
                     </div>
                     <span className="text-sm font-bold text-slate-800">AI Call Scheduled</span>
                  </div>

                   {/* 3. Stats Card (Top Right) */}
                  <div className="absolute top-[15%] right-0 bg-white/40 backdrop-blur-xl border border-white/50 p-6 rounded-3xl shadow-lg w-48">
                      <div className="text-[10px] font-bold text-slate-600 mb-1 uppercase tracking-wider">This Week</div>
                      <div className="text-5xl font-bold text-slate-900 mb-1 tracking-tighter">847</div>
                      <div className="text-xs font-semibold text-slate-700 leading-snug">Leads Generated</div>
                  </div>

                  {/* 4. Play button */}
                  <div className="absolute top-[45%] left-[45%] bg-white rounded-full w-20 h-20 flex items-center justify-center shadow-2xl z-20 cursor-pointer hover:scale-110 transition-transform">
                      <Play className="fill-black text-black ml-1" />
                  </div>

                  {/* 5. Conversion Card (Bottom Right) */}
                  <div className="absolute bottom-[10%] right-[-2rem] bg-white/30 backdrop-blur-2xl border border-white/60 p-5 rounded-[2rem] shadow-2xl w-64">
                      <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center text-white">
                             <BarChart3 size={20} />
                          </div>
                          <div className="text-sm font-bold text-slate-900">Conversion Rate</div>
                      </div>
                      <div className="text-3xl font-bold text-slate-900 mb-1">32.4%</div>
                      <div className="flex items-center gap-1 text-emerald-600 text-xs font-semibold">
                          <ArrowRight className="w-3 h-3 -rotate-45" /> +12% vs last week
                      </div>
                  </div>
              </motion.div>
            </div>


            </div>


        {/* Logos Ticker - Outside the Gray Card */}
        <div className="max-w-[1400px] mx-auto mt-12 flex flex-wrap justify-between items-center px-8 opacity-70 grayscale hover:grayscale-0 transition-all duration-500">
            {['Rakuten', 'NCR', 'monday.com', 'Disney', 'Dropbox'].map(logo => (
                <span key={logo} className="text-xl font-bold text-slate-900">{logo}</span>
            ))}
        </div>
      </section>

      {/* Keep existing sections below but styled lighter */}
      
      {/* Features Section */}
       <section id="features" className="container mx-auto px-6 py-24 bg-white rounded-[4rem] my-12">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-16"
        >
          <div>
            <h2 className={`${playfair.className} text-5xl md:text-6xl font-medium text-slate-900 mb-6`}>Different destinations</h2>
            <p className="text-slate-500 max-w-xl text-lg">
              We explore the diverse ways in which this technology can revolutionize work across industries.
            </p>
          </div>
          <Link href="#features" className="flex items-center gap-2 text-slate-900 font-medium hover:text-emerald-600 transition-colors border-b border-black pb-1">
            Discover all applications <ChevronRight className="w-4 h-4" />
          </Link>
        </motion.div>

        {/* Bento Grid Features */}
        <div className="grid md:grid-cols-3 gap-8">
          {/* Feature 1 - Large */}
          <div className="md:col-span-2 bg-slate-50 rounded-[3rem] p-10 border border-slate-100 hover:shadow-xl transition-all duration-300 group">
            <div className="flex items-start justify-between mb-8">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                <Globe className="w-8 h-8 text-black" />
              </div>
              <span className="text-xs font-bold text-slate-900 bg-white px-4 py-2 rounded-full shadow-sm border border-slate-100">LEAD GENERATION</span>
            </div>
            <h3 className={`${playfair.className} text-3xl font-medium text-slate-900 mb-4`}>Find Perfect Leads</h3>
            <p className="text-slate-500 text-lg leading-relaxed max-w-md">
              Deep scraping of Google Maps, directories, and databases to curate verified business opportunities.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="bg-black rounded-[3rem] p-10 text-white group relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-slate-800 rounded-full blur-[50px] -mr-10 -mt-10"></div>
            <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mb-8 backdrop-blur-md group-hover:scale-110 transition-transform relative z-10">
              <Bot className="w-8 h-8 text-white" />
            </div>
            <h3 className={`${playfair.className} text-3xl font-medium mb-4 relative z-10`}>AI Qualification</h3>
            <p className="text-slate-400 text-lg leading-relaxed relative z-10">
              Computer vision analyzes business data to identify perfect matches.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="bg-[#FF9A9E] rounded-[3rem] p-10 text-white group relative overflow-hidden">
             <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-black/10 to-transparent"></div>
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-8 backdrop-blur-md group-hover:scale-110 transition-transform relative z-10">
              <Phone className="w-8 h-8 text-white" />
            </div>
            <h3 className={`${playfair.className} text-3xl font-medium mb-4 relative z-10`}>Voice Agents</h3>
            <p className="text-white/90 text-lg leading-relaxed relative z-10">
              AI voice agents dial, pitch, and book meetings directly.
            </p>
          </div>

          {/* Feature 4 */}
          <div className="md:col-span-2 bg-slate-50 rounded-[3rem] p-10 border border-slate-100 hover:shadow-xl transition-all duration-300 group">
            <div className="flex items-start justify-between mb-8">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                <BarChart3 className="w-8 h-8 text-purple-600" />
              </div>
              <span className="text-xs font-bold text-slate-900 bg-white px-4 py-2 rounded-full shadow-sm border border-slate-100">ANALYTICS</span>
            </div>
            <h3 className={`${playfair.className} text-3xl font-medium text-slate-900 mb-4`}>Real-time Dashboard</h3>
            <p className="text-slate-500 text-lg leading-relaxed max-w-md">
              Track every lead, call, and conversion with beautiful analytics.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-6 pb-24">
        <div className="bg-black rounded-[4rem] p-16 md:p-32 text-center text-white relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-500/30 rounded-full blur-[120px] pointer-events-none"></div>
          
          <div className="relative z-10 max-w-3xl mx-auto">
            <h2 className={`${playfair.className} text-5xl md:text-7xl font-medium mb-8`}>Ready to <span className="italic">scale</span>?</h2>
            <p className="text-xl text-slate-400 mb-12">
              Join thousands of businesses already using AutoSales.ai to grow 50x faster.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
               <Link href="/login">
                  <Button className="h-16 px-12 rounded-full bg-white text-black hover:bg-slate-200 text-xl font-medium transition-transform hover:scale-105">
                     Start Free Trial
                  </Button>
               </Link>
               <span className="text-slate-500 text-sm mt-2 sm:mt-0 px-4">No credit card required</span>
            </div>
          </div>
        </div>
      </section>

      {/* Simple Footer */}
      <footer className="container mx-auto px-6 py-12 border-t border-slate-200 flex justify-between items-center text-sm text-slate-500">
         <p>© 2024 AutoSales.ai</p>
         <div className="flex gap-6">
            <a href="#" className="hover:text-black">Terms</a>
            <a href="#" className="hover:text-black">Privacy</a>
            <a href="#" className="hover:text-black">Twitter</a>
         </div>
      </footer>
    </div>
  );
}
