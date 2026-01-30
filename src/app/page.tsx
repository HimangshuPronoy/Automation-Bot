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
      
      {/* Navbar with blur */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-6 px-6 pointer-events-none">
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-[1400px] flex justify-between items-center pointer-events-auto"
        >
           {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center text-white">
               <Bot size={24} />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">AutoSales.</span>
          </div>

          <div className="hidden md:flex items-center gap-1 bg-white/80 backdrop-blur-md px-4 py-2 rounded-full border border-white/20 shadow-sm">
            <Link href="#features" className="text-sm font-medium text-slate-600 hover:text-black px-4 py-2 rounded-full hover:bg-slate-100 transition-all">Features</Link>
            <Link href="#how-it-works" className="text-sm font-medium text-slate-600 hover:text-black px-4 py-2 rounded-full hover:bg-slate-100 transition-all">How it works</Link>
            <Link href="#pricing" className="text-sm font-medium text-slate-600 hover:text-black px-4 py-2 rounded-full hover:bg-slate-100 transition-all">Pricing</Link>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium text-slate-900 hover:text-slate-600 transition-colors hidden sm:block">
              Log in
            </Link>
            <Link href="/login">
              <Button className="rounded-full px-6 bg-black hover:bg-slate-800 text-white h-11 transition-all hover:scale-105">
                Get Started
              </Button>
            </Link>
          </div>
        </motion.div>
      </nav>

      {/* Main Hero Section */}
      <section className="relative pt-32 pb-12 lg:pt-40 lg:pb-24 px-6">
        <div className="max-w-[1400px] mx-auto grid lg:grid-cols-2 gap-16 items-center">
          
          {/* Left Column - Typography & Actions */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-start"
          >
            {/* User Badge */}
            <div className="flex items-center gap-4 mb-8 bg-white p-2 pr-6 rounded-full shadow-sm border border-slate-100 w-fit">
               <div className="flex -space-x-3">
                  <div className="w-10 h-10 rounded-full border-2 border-white bg-slate-200 flex items-center justify-center overflow-hidden"><img src="https://i.pravatar.cc/100?img=1" alt="User" /></div>
                  <div className="w-10 h-10 rounded-full border-2 border-white bg-slate-300 flex items-center justify-center overflow-hidden"><img src="https://i.pravatar.cc/100?img=5" alt="User" /></div>
                  <div className="w-10 h-10 rounded-full border-2 border-white bg-black text-white flex items-center justify-center text-xs font-bold">+2k</div>
               </div>
               <div>
                  <div className="text-sm font-bold text-slate-900">20M+ User</div>
                  <Link href="#testimonials" className="text-xs text-slate-500 hover:text-slate-900 underline decoration-slate-300 underline-offset-2">Read our Success Stories</Link>
               </div>
            </div>

            {/* Headline */}
            <h1 className={`${playfair.className} text-7xl lg:text-[7rem] leading-[0.9] font-medium text-slate-900 mb-8 tracking-tighter`}>
               Auto<span className="italic">Sales</span><sup className="text-4xl lg:text-5xl -top-8 lg:-top-16">+</sup>
            </h1>

            {/* Subhead */}
            <p className="text-lg text-slate-500 max-w-lg leading-relaxed mb-10 font-light">
               Drive Sales Growth, And Harness AI-Powered Automation to 
               find, qualify, and convert leads — <span className="font-medium text-slate-900">Up to 50x Faster.</span>
            </p>

            {/* Reviews */}
            <div className="flex items-center gap-4 mb-10 p-4 bg-white/50 rounded-2xl border border-slate-100 backdrop-blur-sm w-fit">
               <div className="w-10 h-10 rounded-full bg-slate-100 overflow-hidden"><img src="https://i.pravatar.cc/100?img=32" alt="Reviewer" /></div>
               <div>
                  <div className="flex gap-1 text-slate-400">
                     <p className="text-xs font-medium text-slate-900">Loved the performance</p>
                     <span>/</span>
                     <div className="flex text-black text-xs">
                        <Star className="w-3 h-3 fill-black" /> 4.9
                     </div>
                  </div>
                  <div className="text-xs text-slate-500">100% Satisfied</div>
               </div>
            </div>

            {/* Buttons */}
            <div className="flex items-center gap-6">
               <Link href="/login">
                  <Button className="h-14 px-10 rounded-full bg-black hover:bg-slate-800 text-white text-lg font-medium shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1">
                     Download — It&apos;s Free
                  </Button>
               </Link>
               <Link href="#pricing" className="flex items-center gap-1 text-slate-500 hover:text-black font-medium transition-colors border-b border-transparent hover:border-black pb-0.5">
                  Our Pricing <ArrowRight className="w-4 h-4 -rotate-45" />
               </Link>
            </div>

          </motion.div>

          {/* Right Column - Visual & Floating Cards */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="relative h-[600px] w-full"
          >
             {/* Main Image Container */}
             <div className="absolute inset-0 rounded-[3rem] overflow-hidden">
                {/* Background Gradient/Image */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#FF9A9E] to-[#FECFEF] opacity-30" />
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=2576&auto=format&fit=crop')] bg-cover bg-center mix-blend-multiply opacity-90 grayscale-[20%]" />
                
                {/* Overlay Gradient for consistency */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
             </div>

             {/* Floating Elements */}
             
             {/* 1. Fit Check (Top Left) */}
             <motion.div 
               initial={{ x: -20, opacity: 0 }}
               animate={{ x: 0, opacity: 1 }}
               transition={{ delay: 0.5, duration: 0.6 }}
               className="absolute top-20 left-10 flex items-center gap-3 bg-white/90 backdrop-blur-xl p-3 px-4 rounded-2xl shadow-lg border border-white/40"
             >
                <div className="w-6 h-6 bg-orange-500 rounded-md flex items-center justify-center text-white">
                   <Check size={14} strokeWidth={3} />
                </div>
                <span className="text-sm font-semibold text-slate-800">How is the fit?</span>
             </motion.div>

             {/* 2. Design Check (Top Left, lower) */}
             <motion.div 
               initial={{ x: -20, opacity: 0 }}
               animate={{ x: 0, opacity: 1 }}
               transition={{ delay: 0.7, duration: 0.6 }}
               className="absolute top-36 left-[-10px] flex items-center gap-3 bg-white/90 backdrop-blur-xl p-3 px-4 rounded-2xl shadow-lg border border-white/40"
             >
                <div className="w-6 h-6 bg-blue-500 rounded-md flex items-center justify-center text-white">
                   <Check size={14} strokeWidth={3} />
                </div>
                <span className="text-sm font-semibold text-slate-800">Do you like the design?</span>
             </motion.div>

             {/* 3. Sales Stats (Top Right) */}
             <motion.div 
               initial={{ y: -20, opacity: 0 }}
               animate={{ y: 0, opacity: 1 }}
               transition={{ delay: 0.9, duration: 0.6 }}
               className="absolute top-16 right-[-20px] lg:right-10 bg-white/80 backdrop-blur-2xl p-5 rounded-3xl shadow-xl border border-white/50 w-48"
             >
                <div className="text-xs text-slate-500 mb-1 uppercase tracking-wider font-medium">Up to</div>
                <div className="text-4xl font-bold text-slate-900 mb-1">60%</div>
                <div className="text-xs text-slate-600 leading-snug">More sales this week</div>
             </motion.div>

             {/* 4. Play Button (Center) */}
             <motion.div 
               initial={{ scale: 0 }}
               animate={{ scale: 1 }}
               transition={{ delay: 1.0, type: "spring" }}
               className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-2xl cursor-pointer hover:scale-110 transition-transform group"
             >
                <Play className="w-8 h-8 fill-slate-900 text-slate-900 ml-1 group-hover:text-emerald-500 group-hover:fill-emerald-500 transition-colors" />
             </motion.div>

             {/* 5. Product Card (Bottom Right) */}
             <motion.div 
               initial={{ y: 20, opacity: 0 }}
               animate={{ y: 0, opacity: 1 }}
               transition={{ delay: 1.1, duration: 0.6 }}
               className="absolute bottom-16 -right-6 lg:right-[-30px] bg-white/60 backdrop-blur-xl p-4 rounded-[2rem] shadow-2xl border border-white/40 flex items-center gap-4 w-64"
             >
                <div className="w-20 h-20 bg-orange-100 rounded-2xl overflow-hidden relative">
                   <img src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1000&auto=format&fit=crop" alt="Shoe" className="object-cover w-full h-full mix-blend-multiply" />
                </div>
                <div>
                   <div className="text-sm font-semibold text-slate-800 leading-tight mb-1">Standard Plan<br/>Campaign</div>
                   <div className="text-lg font-bold text-slate-900">$849.99</div>
                   <div className="flex items-center gap-1 mt-1 bg-white rounded-full px-2 py-0.5 w-fit shadow-sm">
                      <Star className="w-3 h-3 fill-black text-black" /> 
                      <span className="text-xs font-bold">4.6</span>
                   </div>
                </div>
             </motion.div>

          </motion.div>

        </div>

        {/* Logos Ticker */}
        <div className="max-w-[1400px] mx-auto mt-24 flex flex-wrap justify-between items-center gap-8 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
           {['Rakuten', 'NCR', 'monday.com', 'Disney', 'Dropbox'].map((logo) => (
              <span key={logo} className="text-2xl font-bold text-slate-800 font-sans tracking-tight">{logo}</span>
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
