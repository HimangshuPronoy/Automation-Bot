'use client';

import { supabase } from '@/lib/supabase-client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Check, Loader2 } from 'lucide-react';
import { useState } from 'react';

export default function PricingPage() {
  const [loading, setLoading] = useState<string | null>(null);

  const handleSubscribe = async (plan: 'starter' | 'pro') => {
    setLoading(plan);
    try {
      // Get auth token
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        window.location.href = '/login';
        return;
      }

      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ plan }),
      });

      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert('Failed to start checkout');
      }
    } catch (e) {
      console.error(e);
      alert('Something went wrong');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white py-20 px-6">
      <div className="max-w-5xl mx-auto text-center">
        <h1 className="text-4xl font-bold mb-4">Simple Pricing</h1>
        <p className="text-slate-400 mb-12">Choose the plan that fits your agency needs</p>
        
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Starter */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-2xl">Starter</CardTitle>
              <CardDescription className="text-slate-400">Perfect for solo agents</CardDescription>
              <div className="text-4xl font-bold mt-4">$49<span className="text-lg text-slate-500 font-normal">/mo</span></div>
            </CardHeader>
            <CardContent className="space-y-4 text-left">
              <div className="flex gap-2"><Check className="text-green-500"/> 100 Leads / month</div>
              <div className="flex gap-2"><Check className="text-green-500"/> Google Maps Scraping</div>
              <div className="flex gap-2"><Check className="text-green-500"/> Basic AI Analysis</div>
              <div className="flex gap-2 text-slate-500"><Check/> Manual Calling only</div>
            </CardContent>
            <CardFooter>
              <Button className="w-full" onClick={() => handleSubscribe('starter')} disabled={!!loading}>
                {loading === 'starter' ? <Loader2 className="animate-spin"/> : 'Get Started'}
              </Button>
            </CardFooter>
          </Card>
          
          {/* Pro */}
          <Card className="bg-gradient-to-br from-purple-900 to-slate-800 border-purple-500 relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-purple-500 text-xs px-3 py-1 text-white font-bold rounded-bl">POPULAR</div>
            <CardHeader>
              <CardTitle className="text-2xl">Pro Agency</CardTitle>
              <CardDescription className="text-slate-300">For scaling agencies</CardDescription>
              <div className="text-4xl font-bold mt-4">$99<span className="text-lg text-slate-400 font-normal">/mo</span></div>
            </CardHeader>
            <CardContent className="space-y-4 text-left">
              <div className="flex gap-2"><Check className="text-purple-400"/> Unlimited Leads</div>
              <div className="flex gap-2"><Check className="text-purple-400"/> Priority Scraping</div>
              <div className="flex gap-2"><Check className="text-purple-400"/> Vapi AI Voice Agent</div>
              <div className="flex gap-2"><Check className="text-purple-400"/> Auto-Booking</div>
            </CardContent>
            <CardFooter>
              <Button className="w-full bg-purple-600 hover:bg-purple-700" onClick={() => handleSubscribe('pro')} disabled={!!loading}>
                 {loading === 'pro' ? <Loader2 className="animate-spin"/> : 'Upgrade to Pro'}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
