'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/db';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Plus, Trash2, Save, Sparkles, BookOpen, Globe, Search, Brain } from 'lucide-react';
import { motion } from 'framer-motion';
import { AnimatedBackground } from '@/components/ui/animated-background';
import { toast } from 'sonner';

interface KnowledgeItem {
  id: string;
  topic: string;
  content: string;
}

export default function KnowledgePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Knowledge Base State
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [scanning, setScanning] = useState(false);
  const [knowledgeItems, setKnowledgeItems] = useState<KnowledgeItem[]>([]);
  const [newTopic, setNewTopic] = useState('');
  const [newContent, setNewContent] = useState('');
  const [settingsId, setSettingsId] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    const { data: settingsData } = await db.from('settings').select('*').limit(1).single();
    if (settingsData) {
      setSettingsId(settingsData.id);
      
      // Parse knowledge items
      if (settingsData.value_proposition?.startsWith('[KNOWLEDGE_BASE]')) {
        try {
          const jsonStr = settingsData.value_proposition.replace('[KNOWLEDGE_BASE]', '');
          const items = JSON.parse(jsonStr);
          if (Array.isArray(items)) {
            setKnowledgeItems(items);
          }
        } catch {
          setKnowledgeItems([{ id: '1', topic: 'General', content: settingsData.value_proposition }]);
        }
      } else if (settingsData.value_proposition) {
        setKnowledgeItems([{ id: '1', topic: 'General Info', content: settingsData.value_proposition }]);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const saveKnowledge = async () => {
    setSaving(true);
    
    // Serialize
    const serializedKnowledge = `[KNOWLEDGE_BASE]${JSON.stringify(knowledgeItems)}`;
    
    if (settingsId) {
      await db.from('settings').update({ value_proposition: serializedKnowledge }).eq('id', settingsId);
    } else {
      // Create new if doesn't exist (edge case)
      await db.from('settings').insert({ id: 'default', value_proposition: serializedKnowledge });
    }
    setSaving(false);
    toast.success('Knowledge Base saved!');
  };

  const scanWebsite = async () => {
    if (!websiteUrl) return;
    setScanning(true);
    
    try {
      const response = await fetch('/api/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: websiteUrl })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        // Show the actual error from the API
        throw new Error(data.error || 'Failed to analyze website');
      }
      
      // We only care about knowledge items here, but usually we'd want to save company info too.
      // For this page, let's focus on the Q&A items.
      if (data.knowledge_items && data.knowledge_items.length > 0) {
        setKnowledgeItems(prev => [
          ...prev,
          ...data.knowledge_items.map((item: { topic: string; content: string }) => ({
            id: Date.now().toString() + Math.random().toString(),
            topic: item.topic,
            content: item.content
          }))
        ]);
        toast.success(`Extracted ${data.knowledge_items.length} knowledge items!`);
      } else {
        toast.info('No specific Q&A items found, but check Company Info in Settings.');
      }
      
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Failed to scan website';
      toast.error(msg);
      console.error('Scan error:', error);
    } finally {
      setScanning(false);
    }
  };

  const addKnowledgeItem = () => {
    if (!newTopic || !newContent) return;
    setKnowledgeItems(prev => [...prev, {
      id: Date.now().toString(),
      topic: newTopic,
      content: newContent
    }]);
    setNewTopic('');
    setNewContent('');
  };

  const removeKnowledgeItem = (id: string) => {
    setKnowledgeItems(prev => prev.filter(item => item.id !== id));
  };

  if (loading) {
    return (
        <div className="min-h-screen flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-900/50 p-4 md:p-8 font-sans">
      <div className="fixed inset-0 z-[-1] opacity-60">
        <AnimatedBackground />
      </div>

      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white tracking-tight">
              Knowledge Base
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg font-light">
              Train your AI agent with specific business facts, pricing, and policies.
            </p>
          </div>
          <Button 
            onClick={saveKnowledge} 
            disabled={saving}
            className="rounded-full h-12 px-8 bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/20 transition-all hover:scale-105"
          >
            {saving ? <Loader2 className="h-5 w-5 mr-2 animate-spin" /> : <Save className="h-5 w-5 mr-2" />}
            Save Changes
          </Button>
        </div>

        <div className="grid gap-8">
            {/* Scanner Card */}
             <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
             >
                <Card className="rounded-[2rem] border-none shadow-xl bg-white/80 backdrop-blur-xl overflow-hidden">
                    <CardHeader className="p-8 border-b border-slate-100 bg-gradient-to-r from-indigo-50 to-purple-50">
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-2xl bg-white text-indigo-600 shadow-sm">
                                <Brain className="h-6 w-6" />
                            </div>
                            <div>
                                <CardTitle className="text-xl font-bold text-slate-800">Auto-Train from Website</CardTitle>
                                <CardDescription>Enter your URL to automatically extract facts</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-8">
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="flex-1 relative">
                                <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                                <Input 
                                    className="pl-12 h-14 rounded-2xl bg-slate-50 border-slate-200 text-lg" 
                                    placeholder="https://your-company.com"
                                    value={websiteUrl}
                                    onChange={(e) => setWebsiteUrl(e.target.value)}
                                />
                            </div>
                            <Button 
                                onClick={scanWebsite} 
                                disabled={scanning || !websiteUrl}
                                className="h-14 px-8 rounded-2xl bg-slate-900 text-white text-lg font-medium shadow-xl hover:bg-slate-800 hover:scale-105 transition-all"
                            >
                                {scanning ? <Loader2 className="animate-spin mr-2"/> : <Sparkles className="mr-2 w-5 h-5 text-yellow-400 fill-yellow-400" />}
                                Analyze Site
                            </Button>
                        </div>
                    </CardContent>
                </Card>
             </motion.div>

             {/* Knowledge Items */}
             <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
             >
                <Card className="rounded-[2.5rem] border-none shadow-xl bg-white/80 backdrop-blur-xl overflow-hidden min-h-[500px]">
                    <CardHeader className="p-8 border-b border-slate-100 flex flex-row justify-between items-center">
                         <div className="flex items-center gap-4">
                            <div className="p-3 rounded-2xl bg-emerald-100 text-emerald-600">
                                <BookOpen className="h-6 w-6" />
                            </div>
                            <div>
                                <CardTitle className="text-2xl font-bold text-slate-800">Knowledge Facts</CardTitle>
                                <CardDescription>Q&A pairs your AI uses to answer questions</CardDescription>
                            </div>
                        </div>
                        <Badge variant="secondary" className="px-4 py-1 text-base">{knowledgeItems.length} Facts</Badge>
                    </CardHeader>
                    
                    <CardContent className="p-8 space-y-6">
                        {knowledgeItems.length === 0 ? (
                            <div className="text-center py-20 border-2 border-dashed border-slate-100 rounded-3xl bg-slate-50/50">
                                <Search className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                                <h3 className="text-lg font-semibold text-slate-900">No knowledge yet</h3>
                                <p className="text-slate-500 max-w-sm mx-auto mt-2">Add facts manually below or use the website scanner above to get started.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {knowledgeItems.map((item) => (
                                    <div key={item.id} className="group relative p-6 bg-white rounded-2xl border border-slate-100 hover:border-indigo-200 hover:shadow-lg transition-all duration-300">
                                        <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button 
                                                onClick={() => removeKnowledgeItem(item.id)}
                                                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                        <h4 className="font-bold text-slate-800 mb-2 pr-10 text-lg">{item.topic}</h4>
                                        <p className="text-slate-600 leading-relaxed text-sm">{item.content}</p>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Add New */}
                        <div className="mt-8 pt-8 border-t border-slate-100">
                             <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Add New Fact</h4>
                             <div className="flex flex-col md:flex-row gap-4 items-start">
                                <div className="flex-1 space-y-3 w-full">
                                    <Input 
                                        placeholder="Topic (e.g., 'Return Policy')" 
                                        value={newTopic}
                                        onChange={e => setNewTopic(e.target.value)}
                                        className="h-12 rounded-xl border-slate-200 bg-slate-50/50"
                                    />
                                    <Textarea 
                                        placeholder="The answer or details..." 
                                        value={newContent}
                                        onChange={e => setNewContent(e.target.value)}
                                        className="min-h-[100px] rounded-xl border-slate-200 bg-slate-50/50 resize-none"
                                    />
                                </div>
                                <Button 
                                    onClick={addKnowledgeItem}
                                    disabled={!newTopic || !newContent}
                                    className="h-12 md:h-auto md:self-stretch px-6 rounded-xl bg-slate-900 text-white hover:bg-indigo-600 transition-colors"
                                >
                                    <Plus className="w-5 h-5" />
                                </Button>
                             </div>
                        </div>
                    </CardContent>
                </Card>
             </motion.div>
        </div>
      </div>
    </div>
  );
}
