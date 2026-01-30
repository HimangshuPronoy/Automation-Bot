'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { getCampaignLeads } from '../../actions-campaign';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Phone, Globe, MapPin, Star, AlertTriangle, CheckCircle, Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function CampaignDetailPage() {
  const params = useParams();
  const campaignId = params.id as string;
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [callingId, setCallingId] = useState<string | null>(null);

  useEffect(() => {
    loadLeads();
  }, [campaignId]);

  const loadLeads = async () => {
    setLoading(true);
    const res = await getCampaignLeads(campaignId);
    if (res.success) setLeads(res.data || []);
    setLoading(false);
  };

  const handleCall = async (leadId: string) => {
    setCallingId(leadId);
    try {
      const res = await fetch('/api/call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadId }),
      });
      const data = await res.json();
      if (data.success) {
        alert(`Call initiated! Call ID: ${data.callId}`);
        loadLeads(); // Refresh to show updated status
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (e) {
      alert('Failed to initiate call');
    } finally {
      setCallingId(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'QUALIFIED': return 'bg-green-600';
      case 'CONTACTED': return 'bg-blue-600';
      case 'CONVERTED': return 'bg-purple-600';
      case 'DISQUALIFIED': return 'bg-red-600';
      default: return 'bg-slate-500';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-6">
      <header className="max-w-7xl mx-auto mb-8">
        <Link href="/campaigns" className="flex items-center text-slate-500 hover:text-slate-700 mb-4">
          <ArrowLeft className="h-4 w-4 mr-1"/> Back to Campaigns
        </Link>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Campaign Leads</h1>
        <p className="text-slate-500 mt-1">{leads.length} leads found</p>
      </header>

      {loading ? (
        <div className="text-center py-20">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-slate-400"/>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {leads.map((lead) => {
            const weakPoints = lead.weakPoints ? JSON.parse(lead.weakPoints) : [];
            return (
              <Card key={lead.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg font-semibold">{lead.businessName}</CardTitle>
                      <div className="flex items-center gap-1 text-sm text-yellow-500 mt-1">
                        <Star className="h-3 w-3 fill-current" />
                        <span className="font-medium">{lead.rating || 'N/A'}</span>
                        <span className="text-slate-400 text-xs">({lead.reviewCount || 0} reviews)</span>
                      </div>
                    </div>
                    <Badge className={getStatusColor(lead.status)}>{lead.status}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
                    {lead.address && (
                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 shrink-0 mt-0.5 text-slate-400" />
                        <span>{lead.address}</span>
                      </div>
                    )}
                    {lead.phoneNumber && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-slate-400" />
                        <span>{lead.phoneNumber}</span>
                      </div>
                    )}
                    {lead.website && (
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4 text-slate-400" />
                        <a href={lead.website} target="_blank" className="text-blue-600 hover:underline truncate max-w-[200px]">
                          {lead.website}
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Weak Points */}
                  <div className="pt-3 border-t">
                    <h4 className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wide">Analysis</h4>
                    {weakPoints.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {weakPoints.map((wp: string, i: number) => (
                          <Badge key={i} variant="outline" className="text-xs border-red-200 bg-red-50 text-red-700">
                            <AlertTriangle className="h-3 w-3 mr-1" /> {wp}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-green-600 text-sm">
                        <CheckCircle className="h-4 w-4" /> Strong Online Presence
                      </div>
                    )}
                  </div>

                  {/* Suggested Pitch */}
                  {lead.suggestedPitch && (
                    <div className="text-xs text-slate-500 italic bg-slate-100 dark:bg-slate-800 p-2 rounded">
                      &ldquo;{lead.suggestedPitch}&rdquo;
                    </div>
                  )}

                  {/* Actions */}
                  <div className="pt-2 flex gap-2">
                    <Button 
                      className="w-full bg-green-600 hover:bg-green-700" 
                      size="sm" 
                      disabled={!lead.phoneNumber || callingId === lead.id}
                      onClick={() => handleCall(lead.id)}
                    >
                      {callingId === lead.id ? (
                        <><Loader2 className="h-4 w-4 mr-1 animate-spin"/> Calling...</>
                      ) : (
                        <><Phone className="h-4 w-4 mr-1"/> Call Now</>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}

          {leads.length === 0 && (
            <div className="col-span-full text-center py-20 text-slate-400 bg-white dark:bg-slate-950 rounded-lg border border-dashed">
              No leads found for this campaign yet. Check back after the scraper finishes.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
