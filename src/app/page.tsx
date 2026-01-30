'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, Globe, Bot, Phone, Sparkles, Users, BarChart3, Zap, ChevronRight, Play } from 'lucide-react';
import { motion } from 'framer-motion';



export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans text-slate-900 overflow-x-hidden">
      
      {/* Floating Navigation */}
      <div className="fixed top-6 left-0 right-0 z-50 flex justify-center px-6">
        <motion.nav 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-5xl bg-white/90 backdrop-blur-xl border border-white/20 shadow-2xl shadow-slate-200/20 rounded-full px-6 py-3 flex justify-between items-center"
        >
          <div className="flex items-center gap-2 pl-2">
            <span className="text-lg font-bold tracking-tight text-slate-900">AutoSales.ai</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <Link href="#features" className="text-sm font-medium text-slate-600 hover:text-emerald-600 transition-colors">Features</Link>
            <Link href="#how-it-works" className="text-sm font-medium text-slate-600 hover:text-emerald-600 transition-colors">How it works</Link>
            <Link href="#pricing" className="text-sm font-medium text-slate-600 hover:text-emerald-600 transition-colors">Pricing</Link>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium text-slate-600 hover:text-emerald-600 transition-colors hidden sm:block">
              Log in
            </Link>
            <Link href="/login">
              <Button className="rounded-full px-6 bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/25 transition-all hover:scale-105 h-10">
                Get Started
              </Button>
            </Link>
          </div>
        </motion.nav>
      </div>

      {/* Hero Section with Dark Card */}
      <section className="container mx-auto px-6 pt-32 pb-24">
        <div className="relative">
          {/* Dark Hero Card */}
          <div className="relative bg-[#0f172a] rounded-[2.5rem] p-8 md:p-16 overflow-hidden shadow-2xl shadow-slate-200">
            {/* Background decorations */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-500/10 rounded-full blur-[100px] pointer-events-none" />
            
            <div className="relative z-10 grid lg:grid-cols-2 gap-12 items-center">
              {/* Left Content */}
              <div className="text-left">
                <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold text-white leading-[1.1] mb-6 tracking-tight">
                  Unleash the full potential of{' '}
                  <span className="text-emerald-400">AI Sales</span>
                </h1>
                
                <p className="text-lg text-slate-400 mb-8 max-w-lg leading-relaxed">
                  AutoSales.ai is a versatile assistant that utilizes state-of-the-art AI to find leads, 
                  qualify them, and book meetings — all autonomously.
                </p>
                
                <div className="flex flex-wrap gap-4 mb-12">
                  <Link href="/login">
                    <Button size="lg" className="h-14 px-8 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white text-base font-medium shadow-xl shadow-emerald-500/20 transition-all hover:scale-105">
                      Get the App <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                  <Button size="lg" variant="outline" className="h-14 px-8 rounded-full border-slate-700 text-slate-300 bg-transparent hover:bg-slate-800 hover:text-white hover:border-slate-600">
                    <Play className="mr-2 h-4 w-4 fill-current" /> Watch Demo
                  </Button>
                </div>
                
                {/* Stats */}
                <div className="flex gap-12 border-t border-slate-800 pt-8">
                  <div>
                    <div className="text-3xl font-bold text-white mb-1">4.8</div>
                    <div className="text-sm font-medium text-slate-500">Rating on AppStore</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-white mb-1">700k+</div>
                    <div className="text-sm font-medium text-slate-500">Active users</div>
                  </div>
                </div>
              </div>
              
              {/* Right Side - Desktop Mockup */}
              <motion.div 
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="relative flex justify-center lg:justify-end"
              >
                <div className="relative w-full max-w-md">
                   {/* Clean Glassy Card Mockup for Desktop App feeling */}
                   <div className="relative bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-1 shadow-2xl">
                      {/* Window Controls */}
                      <div className="h-8 bg-slate-800/50 rounded-t-xl flex items-center px-4 gap-2 border-b border-slate-700/50">
                        <div className="w-3 h-3 rounded-full bg-red-500/80" />
                        <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                        <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                      </div>
                      
                      {/* Dashboard Content */}
                      <div className="bg-slate-900 rounded-b-xl p-6 min-h-[300px] flex flex-col gap-4">
                         {/* Header */}
                         <div className="flex justify-between items-center mb-2">
                            <div>
                               <div className="text-sm font-medium text-slate-300">Dashboard</div>
                               <div className="text-xs text-slate-500">Welcome back</div>
                            </div>
                            <div className="p-2 bg-emerald-500/10 rounded-lg">
                               <Bot className="w-4 h-4 text-emerald-400" />
                            </div>
                         </div>
                         
                         {/* Stats Row */}
                         <div className="grid grid-cols-2 gap-3">
                            <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700/50">
                               <div className="text-xs text-slate-400 mb-1">Total Leads</div>
                               <div className="text-xl font-bold text-white">1,284</div>
                            </div>
                            <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700/50">
                               <div className="text-xs text-slate-400 mb-1">Qualified</div>
                               <div className="text-xl font-bold text-emerald-400">342</div>
                            </div>
                         </div>

                         {/* Chart Placeholder */}
                         <div className="bg-slate-800/30 rounded-xl p-3 border border-slate-700/50 flex-1 flex items-end gap-2 h-32 relative">
                            {/* Mock bars */}
                            <div className="w-1/6 bg-slate-700/50 h-[40%] rounded-t-sm" />
                            <div className="w-1/6 bg-slate-700/50 h-[60%] rounded-t-sm" />
                            <div className="w-1/6 bg-emerald-500/50 h-[80%] rounded-t-sm" />
                            <div className="w-1/6 bg-emerald-500 h-[65%] rounded-t-sm" />
                            <div className="w-1/6 bg-slate-700/50 h-[50%] rounded-t-sm" />
                            <div className="w-1/6 bg-slate-700/50 h-[75%] rounded-t-sm" />
                         </div>
                      </div>
                   </div>

                   {/* Floating Badge */}
                   <div className="absolute -left-6 top-1/2 -translate-y-1/2 bg-white p-4 rounded-xl shadow-xl shadow-black/20 animate-pulse">
                      <div className="flex items-center gap-3">
                         <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                            <Phone className="w-5 h-5 text-emerald-600" />
                         </div>
                         <div>
                            <div className="text-xs text-slate-500 font-medium">Auto-Dialer</div>
                            <div className="text-sm font-bold text-slate-900">Active</div>
                         </div>
                      </div>
                   </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section Title */}
      <section id="features" className="container mx-auto px-6 py-16">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12"
        >
          <div>
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 italic mb-4">Different destinations</h2>
            <p className="text-slate-600 max-w-xl">
              We explore the diverse ways in which this technology can revolutionize work across industries.
            </p>
          </div>
          <Link href="#features" className="flex items-center gap-2 text-slate-900 font-medium hover:text-emerald-600 transition-colors">
            Discover all applications <ChevronRight className="w-4 h-4" />
          </Link>
        </motion.div>

        {/* Bento Grid Features */}
        <div className="grid md:grid-cols-3 gap-6">
          {/* Feature 1 - Large */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="md:col-span-2 bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 group"
          >
            <div className="flex items-start justify-between mb-6">
              <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <Globe className="w-7 h-7 text-emerald-600" />
              </div>
              <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">LEAD GENERATION</span>
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-3">Find Perfect Leads</h3>
            <p className="text-slate-600 leading-relaxed">
              Deep scraping of Google Maps, directories, and databases to curate verified business opportunities 
              that match your ideal customer profile.
            </p>
          </motion.div>

          {/* Feature 2 */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="bg-slate-900 rounded-[2rem] p-8 text-white group"
          >
            <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Bot className="w-7 h-7 text-emerald-400" />
            </div>
            <h3 className="text-2xl font-bold mb-3">AI Qualification</h3>
            <p className="text-slate-400 leading-relaxed">
              Computer vision analyzes business data to identify perfect matches for your offering.
            </p>
          </motion.div>

          {/* Feature 3 */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-[2rem] p-8 text-white group"
          >
            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Phone className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-2xl font-bold mb-3">Voice Agents</h3>
            <p className="text-emerald-100 leading-relaxed">
              AI voice agents dial, pitch, and book meetings directly into your calendar.
            </p>
          </motion.div>

          {/* Feature 4 */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="md:col-span-2 bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 group"
          >
            <div className="flex items-start justify-between mb-6">
              <div className="w-14 h-14 bg-purple-100 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <BarChart3 className="w-7 h-7 text-purple-600" />
              </div>
              <span className="text-xs font-medium text-purple-600 bg-purple-50 px-3 py-1 rounded-full">ANALYTICS</span>
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-3">Real-time Dashboard</h3>
            <p className="text-slate-600 leading-relaxed">
              Track every lead, call, and conversion with beautiful analytics. Know exactly what&apos;s working 
              and optimize your campaigns in real-time.
            </p>
          </motion.div>
        </div>
      </section>

      {/* How it Works */}
      <section id="how-it-works" className="container mx-auto px-6 py-24">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">How it works</h2>
          <p className="text-lg text-slate-600">Three simple steps to automate your entire sales pipeline</p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            { num: "01", title: "Connect", desc: "Link your CRM, calendar, and phone system in minutes.", icon: <Zap className="w-6 h-6" /> },
            { num: "02", title: "Configure", desc: "Define your ideal customer profile and let AI handle the rest.", icon: <Users className="w-6 h-6" /> },
            { num: "03", title: "Convert", desc: "Watch as qualified meetings appear in your calendar.", icon: <Sparkles className="w-6 h-6" /> },
          ].map((step, i) => (
            <motion.div 
              key={step.num}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="relative bg-white rounded-[2rem] p-10 border border-slate-100 shadow-sm hover:shadow-lg transition-all group"
            >
              <div className="text-6xl font-bold text-slate-100 absolute top-6 right-8 group-hover:text-emerald-100 transition-colors">{step.num}</div>
              <div className="relative z-10">
                <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center mb-6 text-emerald-600 group-hover:scale-110 transition-transform">
                  {step.icon}
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-3">{step.title}</h3>
                <p className="text-slate-600">{step.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="container mx-auto px-6 py-24">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">Simple pricing</h2>
          <p className="text-lg text-slate-600">No hidden fees. Cancel anytime.</p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {[
            { name: "Starter", price: "Free", desc: "For exploration", features: ["1 Campaign", "20 Leads/mo", "Manual Calling"] },
            { name: "Pro", price: "$49", desc: "For acceleration", features: ["Unlimited Campaigns", "500 Leads/mo", "AI Voice Agents", "WhatsApp Integration"], popular: true },
            { name: "Agency", price: "$199", desc: "For dominance", features: ["Unlimited Everything", "Team Seats", "API Access", "White Label"] }
          ].map((plan, i) => (
            <motion.div 
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={`relative rounded-[2rem] p-8 ${plan.popular ? 'bg-slate-900 text-white scale-105 shadow-2xl' : 'bg-white border border-slate-200'}`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-emerald-500 text-white text-xs font-bold rounded-full">
                  MOST POPULAR
                </div>
              )}
              <div className={`text-lg font-medium mb-2 ${plan.popular ? 'text-emerald-400' : 'text-slate-900'}`}>{plan.name}</div>
              <div className="mb-6">
                <span className="text-5xl font-bold">{plan.price}</span>
                {plan.price !== 'Free' && <span className={`text-lg ${plan.popular ? 'text-slate-400' : 'text-slate-500'}`}>/mo</span>}
              </div>
              <p className={`mb-8 ${plan.popular ? 'text-slate-400' : 'text-slate-600'}`}>{plan.desc}</p>
              <ul className="space-y-4 mb-8">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center ${plan.popular ? 'bg-emerald-500' : 'bg-emerald-100'}`}>
                      <svg className={`w-3 h-3 ${plan.popular ? 'text-white' : 'text-emerald-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className={plan.popular ? 'text-slate-300' : 'text-slate-600'}>{f}</span>
                  </li>
                ))}
              </ul>
              <Button className={`w-full h-12 rounded-full font-medium ${plan.popular ? 'bg-emerald-500 hover:bg-emerald-600 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-900'}`}>
                Get Started
              </Button>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-6 py-24">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-[3rem] p-16 md:p-24 text-center text-white relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-[80px]" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-400/20 rounded-full blur-[100px]" />
          
          <div className="relative z-10">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to automate your sales?</h2>
            <p className="text-lg text-emerald-100 mb-10 max-w-xl mx-auto">
              Join thousands of businesses already using AutoSales.ai to grow faster.
            </p>
            <Link href="/login">
              <Button size="lg" className="h-14 px-10 rounded-full bg-white text-emerald-600 hover:bg-emerald-50 text-base font-medium shadow-xl transition-transform hover:scale-105">
                Start Free Trial <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-6 py-12 border-t border-slate-100">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold">AutoSales.ai</span>
          </div>
          <div className="flex gap-8 text-sm text-slate-500">
            <Link href="#" className="hover:text-slate-900 transition-colors">Privacy</Link>
            <Link href="#" className="hover:text-slate-900 transition-colors">Terms</Link>
            <Link href="#" className="hover:text-slate-900 transition-colors">Contact</Link>
          </div>
          <p className="text-sm text-slate-400">
            © {new Date().getFullYear()} AutoSales.ai. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
