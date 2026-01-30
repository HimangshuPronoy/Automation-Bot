'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { db } from '@/lib/db';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Phone, Globe, MapPin, Star, Clock, Play, MessageSquare, DollarSign, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

interface Lead {
  id: string;
  businessName: string;
  phoneNumber: string;
  website: string;
  address: string;
  rating: number;
  reviewCount: number;
  status: string;
  weakPoints: string;
  suggestedPitch: string;
  campaignId: string;
  created_at: string;
}

interface Call {
  id: string;
  status: string;
  duration: number;
  outcome: string;
  transcript: string;
  created_at: string;
}

export default function LeadDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [lead, setLead] = useState<Lead | null>(null);
  const [calls, setCalls] = useState<Call[]>([]);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [calling, setCalling] = useState(false);

  useEffect(() => {
    loadLead();
  }, [params.id]);

  const loadLead = async () => {
    setLoading(true);
    const { data: leadData } = await db
      .from('leads')
      .select('*')
      .eq('id', params.id)
      .single();
    
    if (leadData) setLead(leadData);
    
    // Load call history
    const { data: callData } = await db
      .from('calls')
      .select('*')
      .eq('lead_id', params.id)
      .order('created_at', { ascending: false });
    
    if (callData) setCalls(callData);
    setLoading(false);
  };

  const handleCall = async () => {
    setCalling(true);
    try {
      const res = await fetch('/api/call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadId: lead?.id }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Call initiated! AI agent is dialing...');
        loadLead(); // Refresh to show new call
      }
    } catch (e) {
      toast.error('Failed to initiate call');
    }
    setCalling(false);
  };

  const createDeal = async () => {
    await db.from('deals').insert({
      lead_id: lead?.id,
      stage: 'INTERESTED',
      notes: notes,
    });
    await db.from('leads').update({ status: 'INTERESTED' }).eq('id', lead?.id);
    router.push('/deals');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin"/>
      </div>
    );
  }

  if (!lead) {
    return <div className="p-8 text-center">Lead not found</div>;
  }

  const weakPoints = lead.weakPoints ? JSON.parse(lead.weakPoints) : [];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href={`/campaigns/${lead.campaignId}`}>
              <Button variant="ghost" size="icon">
                <ArrowLeft/>
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold">{lead.businessName}</h1>
              <div className="flex items-center gap-2 text-sm text-slate-500">
                {lead.rating && (
                  <span className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-yellow-500"/> {lead.rating} ({lead.reviewCount} reviews)
                  </span>
                )}
              </div>
            </div>
          </div>
          <Badge variant={
            lead.status === 'QUALIFIED' ? 'default' :
            lead.status === 'INTERESTED' ? 'secondary' :
            lead.status === 'CONTACTED' ? 'outline' : 'secondary'
          }>
            {lead.status}
          </Badge>
        </div>

        {/* Contact Info & Actions */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {lead.phoneNumber && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-slate-500"/>
                  <span>{lead.phoneNumber}</span>
                </div>
              )}
              {lead.website && (
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-slate-500"/>
                  <a href={lead.website} target="_blank" className="text-blue-600 hover:underline">{lead.website}</a>
                </div>
              )}
              {lead.address && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-slate-500"/>
                  <span>{lead.address}</span>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full" onClick={handleCall} disabled={calling || !lead.phoneNumber}>
                {calling ? <Loader2 className="animate-spin mr-2"/> : <Phone className="mr-2"/>}
                Call Now
              </Button>
              <Button variant="outline" className="w-full" onClick={createDeal}>
                <DollarSign className="mr-2"/> Create Deal
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Weak Points */}
        {weakPoints.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Identified Weak Points</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {weakPoints.map((wp: string, i: number) => (
                  <Badge key={i} variant="destructive">{wp}</Badge>
                ))}
              </div>
              {lead.suggestedPitch && (
                <p className="mt-4 text-sm text-slate-600 italic">&quot;{lead.suggestedPitch}&quot;</p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Call History */}
        <Card>
          <CardHeader>
            <CardTitle>Call History</CardTitle>
          </CardHeader>
          <CardContent>
            {calls.length === 0 ? (
              <p className="text-slate-500 text-center py-4">No calls yet</p>
            ) : (
              <div className="space-y-4">
                {calls.map((call) => (
                  <div key={call.id} className="flex items-start justify-between p-4 bg-slate-100 dark:bg-slate-800 rounded-lg">
                    <div>
                      <div className="flex items-center gap-2">
                        <Badge variant={call.outcome === 'INTERESTED' ? 'default' : 'secondary'}>
                          {call.outcome || call.status}
                        </Badge>
                        <span className="text-xs text-slate-500">
                          {new Date(call.created_at).toLocaleString()}
                        </span>
                      </div>
                      {call.duration && (
                        <p className="text-sm text-slate-500 mt-1">
                          <Clock className="inline h-3 w-3 mr-1"/> {Math.floor(call.duration / 60)}m {call.duration % 60}s
                        </p>
                      )}
                      {call.transcript && (
                        <details className="mt-2">
                          <summary className="text-sm cursor-pointer text-blue-600">View Transcript</summary>
                          <p className="text-sm mt-2 p-2 bg-white dark:bg-slate-700 rounded">{call.transcript}</p>
                        </details>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Notes */}
        <Card>
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <Input
              placeholder="Add notes about this lead..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
