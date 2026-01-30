'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/db';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Send, CreditCard, Loader2, FileText, Receipt } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { AnimatedBackground } from '@/components/ui/animated-background';

interface Quote {
  id: string;
  amount: number;
  status: string;
  sent_via: string;
  sent_at: string;
  created_at: string;
  stripe_payment_link?: string;
  deals: {
    id: string;
    leads: {
      businessName: string;
      phoneNumber: string;
    };
  };
  packages: {
    name: string;
  };
}

interface Package {
  id: string;
  name: string;
  price_min: number;
  price_max: number;
  is_fixed_price: boolean;
}

interface Deal {
  id: string;
  stage: string;
  leads: {
    businessName: string;
    phoneNumber: string;
  } | null;
}

const STATUS_STYLES: Record<string, { bg: string; text: string }> = {
  DRAFT: { bg: 'bg-slate-100', text: 'text-slate-600' },
  SENT: { bg: 'bg-blue-100', text: 'text-blue-600' },
  ACCEPTED: { bg: 'bg-emerald-100', text: 'text-emerald-600' },
  PAID: { bg: 'bg-green-100', text: 'text-green-700' },
  REJECTED: { bg: 'bg-red-100', text: 'text-red-600' },
};

export default function QuotesPage() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  
  const [showForm, setShowForm] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState('');
  const [selectedPackage, setSelectedPackage] = useState('');
  const [customAmount, setCustomAmount] = useState(0);

  const loadData = async () => {
    setLoading(true);
    
    const [quotesRes, packagesRes, dealsRes] = await Promise.all([
      db.from('quotes').select('*, deals(id, leads(businessName, phoneNumber)), packages(name)').order('created_at', { ascending: false }),
      db.from('packages').select('*'),
      db.from('deals').select('id, stage, leads(businessName, phoneNumber)').in('stage', ['INTERESTED', 'QUOTE_SENT', 'NEGOTIATING']),
    ]);
    
    if (quotesRes.data) setQuotes(quotesRes.data as unknown as Quote[]);
    if (packagesRes.data) setPackages(packagesRes.data as unknown as Package[]);
    if (dealsRes.data) setDeals(dealsRes.data as unknown as Deal[]);
    
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const createQuote = async () => {
    if (!selectedDeal || customAmount <= 0) return;
    
    setCreating(true);
    
    await db.from('quotes').insert({
      deal_id: selectedDeal,
      package_id: selectedPackage || null,
      amount: customAmount * 100,
      status: 'DRAFT',
    });
    
    await db.from('deals').update({ stage: 'QUOTE_SENT' }).eq('id', selectedDeal);
    
    setShowForm(false);
    setSelectedDeal('');
    setSelectedPackage('');
    setCustomAmount(0);
    setCreating(false);
    loadData();
  };

  const sendQuote = async (quoteId: string, via: 'WHATSAPP' | 'EMAIL') => {
    const quote = quotes.find(q => q.id === quoteId);
    if (!quote) return;

    const res = await fetch('/api/stripe/payment-link', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        quoteId,
        amount: quote.amount,
        description: `Quote for ${quote.deals?.leads?.businessName}`,
      }),
    });
    
    const { paymentLink } = await res.json();
    
    if (via === 'WHATSAPP' && quote.deals?.leads?.phoneNumber) {
      await fetch('/api/send-whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: quote.deals.leads.phoneNumber,
          message: `Hi! Here's your quote for $${(quote.amount / 100).toLocaleString()}. Pay here: ${paymentLink}`,
        }),
      });
    }
    
    await db.from('quotes').update({
      status: 'SENT',
      sent_via: via,
      sent_at: new Date().toISOString(),
      stripe_payment_link: paymentLink,
    }).eq('id', quoteId);
    
    loadData();
    toast.success(`Quote sent via ${via}!`);
  };

  const handlePackageSelect = (pkgId: string) => {
    setSelectedPackage(pkgId);
    const pkg = packages.find(p => p.id === pkgId);
    if (pkg) {
      setCustomAmount(pkg.price_min / 100);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-900/50 p-4 md:p-8 font-sans">
      <div className="fixed inset-0 z-[-1] opacity-60">
        <AnimatedBackground />
      </div>

      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white tracking-tight">
              Quotes
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg font-light">
              Generate and send quotes to prospects
            </p>
          </div>
          <Button 
            onClick={() => setShowForm(true)}
            className="rounded-full h-12 px-8 bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/20 transition-all hover:scale-105"
          >
            <Plus className="mr-2 h-5 w-5"/>
            New Quote
          </Button>
        </div>

        {/* Stats */}
        <div className="flex gap-4 flex-wrap">
          <div className="px-4 py-2 bg-white/80 backdrop-blur-md rounded-full border border-white/40 text-sm font-medium text-slate-600">
            <Receipt className="inline-block mr-2 h-4 w-4" />
            {quotes.length} Total Quotes
          </div>
          <div className="px-4 py-2 bg-emerald-50 backdrop-blur-md rounded-full border border-emerald-200 text-sm font-medium text-emerald-700">
            ${quotes.filter(q => q.status === 'PAID').reduce((sum, q) => sum + q.amount, 0) / 100} Collected
          </div>
        </div>

        {/* New Quote Form */}
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="rounded-[2.5rem] border-none shadow-xl shadow-slate-200/50 bg-white/80 backdrop-blur-xl overflow-hidden">
              <CardHeader className="p-8 border-b border-slate-100">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-2xl bg-indigo-100 text-indigo-600">
                    <FileText className="h-6 w-6" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl font-bold text-slate-800">Create New Quote</CardTitle>
                    <CardDescription>Select a deal and set the price</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                <div className="grid md:grid-cols-3 gap-6">
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-2 block">Select Deal</label>
                    <Select value={selectedDeal} onValueChange={setSelectedDeal}>
                      <SelectTrigger className="h-12 rounded-xl">
                        <SelectValue placeholder="Choose a deal..." />
                      </SelectTrigger>
                      <SelectContent>
                        {deals.map(deal => (
                          <SelectItem key={deal.id} value={deal.id}>
                            {deal.leads?.businessName} ({deal.stage})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-2 block">Package (Optional)</label>
                    <Select value={selectedPackage} onValueChange={handlePackageSelect}>
                      <SelectTrigger className="h-12 rounded-xl">
                        <SelectValue placeholder="Select package..." />
                      </SelectTrigger>
                      <SelectContent>
                        {packages.map(pkg => (
                          <SelectItem key={pkg.id} value={pkg.id}>
                            {pkg.name} (${pkg.price_min / 100})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-2 block">Amount ($)</label>
                    <Input
                      type="number"
                      value={customAmount}
                      onChange={(e) => setCustomAmount(parseInt(e.target.value) || 0)}
                      placeholder="Enter amount"
                      className="h-12 rounded-xl"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-3">
                  <Button variant="ghost" onClick={() => setShowForm(false)} className="rounded-xl">
                    Cancel
                  </Button>
                  <Button 
                    onClick={createQuote} 
                    disabled={creating || !selectedDeal || customAmount <= 0}
                    className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white"
                  >
                    {creating ? <Loader2 className="animate-spin mr-2 h-4 w-4"/> : <FileText className="mr-2 h-4 w-4"/>}
                    Create Quote
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Quotes List */}
        <div className="grid gap-4">
          {quotes.map((quote, index) => (
            <motion.div
              key={quote.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ y: -2 }}
            >
              <Card className="rounded-[1.5rem] border-none shadow-lg bg-white/80 backdrop-blur-xl overflow-hidden hover:shadow-xl transition-all">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <h3 className="font-bold text-lg text-slate-800">{quote.deals?.leads?.businessName}</h3>
                      <p className="text-sm text-slate-500">
                        {quote.packages?.name || 'Custom Quote'} • Created {new Date(quote.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <span className="text-2xl font-bold text-emerald-600">
                          ${(quote.amount / 100).toLocaleString()}
                        </span>
                        <Badge className={`ml-3 ${STATUS_STYLES[quote.status]?.bg} ${STATUS_STYLES[quote.status]?.text} border-none`}>
                          {quote.status}
                        </Badge>
                      </div>
                      {quote.status === 'DRAFT' && (
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            onClick={() => sendQuote(quote.id, 'WHATSAPP')}
                            className="rounded-xl bg-green-500 hover:bg-green-600"
                          >
                            <Send className="h-4 w-4 mr-1"/>
                            WhatsApp
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => sendQuote(quote.id, 'EMAIL')}
                            className="rounded-xl"
                          >
                            <Send className="h-4 w-4 mr-1"/>
                            Email
                          </Button>
                        </div>
                      )}
                      {quote.status === 'SENT' && quote.stripe_payment_link && (
                        <a href={quote.stripe_payment_link} target="_blank">
                          <Button size="sm" variant="outline" className="rounded-xl">
                            <CreditCard className="h-4 w-4 mr-1"/>
                            Payment Link
                          </Button>
                        </a>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}

          {quotes.length === 0 && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-indigo-50 flex items-center justify-center">
                <FileText className="h-10 w-10 text-indigo-500" />
              </div>
              <h3 className="text-xl font-semibold text-slate-700 mb-2">No quotes yet</h3>
              <p className="text-slate-500">Create your first quote to get started</p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
