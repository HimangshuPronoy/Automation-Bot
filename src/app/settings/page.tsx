'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/db';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Plus, Trash2, Building2, Save, Sparkles, BookOpen, Globe, Search } from 'lucide-react';
import { motion } from 'framer-motion';
import { AnimatedBackground } from '@/components/ui/animated-background';
import { toast } from 'sonner';

interface Settings {
  id?: string;
  company_name: string;
  services: string[];
  value_proposition: string;
  min_rating: number;
  max_rating: number;
  min_reviews: number;
  max_reviews: number;
  require_website: boolean;
}

interface KnowledgeItem {
  id: string;
  topic: string;
  content: string;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>({
    company_name: '',
    services: [],
    value_proposition: '',
    min_rating: 0,
    max_rating: 5,
    min_reviews: 0,
    max_reviews: 100,
    require_website: false
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newServiceName, setNewServiceName] = useState('');
  
  // Knowledge Base State
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [scanning, setScanning] = useState(false);
  const [knowledgeItems, setKnowledgeItems] = useState<KnowledgeItem[]>([]);
  const [newTopic, setNewTopic] = useState('');
  const [newContent, setNewContent] = useState('');

  const loadSettings = async () => {
    // setLoading(true); // Initial state is already true
    const { data: settingsData } = await db.from('settings').select('*').limit(1).single();
    if (settingsData) {
      setSettings({
        ...settingsData,
        services: settingsData.services || []
      });
      
      // Attempt to parse knowledge items from value_proposition if structured
      // This is a simple heuristic - if it starts with [KNOWLEDGE_BASE], we parse it
      if (settingsData.value_proposition?.startsWith('[KNOWLEDGE_BASE]')) {
        try {
          const jsonStr = settingsData.value_proposition.replace('[KNOWLEDGE_BASE]', '');
          const items = JSON.parse(jsonStr);
          if (Array.isArray(items)) {
            setKnowledgeItems(items);
          }
        } catch {
          // Fallback if parsing fails
          setKnowledgeItems([{ id: '1', topic: 'General', content: settingsData.value_proposition }]);
        }
      } else if (settingsData.value_proposition) {
        setKnowledgeItems([{ id: '1', topic: 'General Info', content: settingsData.value_proposition }]);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const saveSettings = async () => {
    setSaving(true);
    
    // Serialize knowledge items
    const serializedKnowledge = `[KNOWLEDGE_BASE]${JSON.stringify(knowledgeItems)}`;
    
    const settingsToSave = {
      ...settings,
      value_proposition: serializedKnowledge
    };

    if (settings?.id) {
      await db.from('settings').update(settingsToSave).eq('id', settings.id);
    } else {
      await db.from('settings').insert(settingsToSave);
    }
    setSaving(false);
    toast.success('Settings saved successfully!');
  };

  const addService = () => {
    if (!newServiceName.trim()) return;
    setSettings({
      ...settings,
      services: [...(settings.services || []), newServiceName.trim()]
    });
    setNewServiceName('');
  };

  const removeService = (index: number) => {
    const newServices = [...settings.services];
    newServices.splice(index, 1);
    setSettings({ ...settings, services: newServices });
  };

  // Knowledge Base Functions
  const scanWebsite = async () => {
    if (!websiteUrl) return;
    setScanning(true);
    
    try {
      const response = await fetch('/api/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: websiteUrl })
      });
      
      if (!response.ok) throw new Error('Failed to analyze website');
      
      const data = await response.json();
      
      // Update state with scraped data
      if (data.company_name) {
        setSettings(prev => ({
          ...prev,
          company_name: data.company_name,
          services: [...(prev.services || []), ...(data.services || [])].filter((v, i, a) => a.indexOf(v) === i), // unique
          value_proposition: prev.value_proposition || data.value_proposition
        }));
      }

      if (data.knowledge_items) {
        setKnowledgeItems(prev => [
          ...prev,
          ...data.knowledge_items.map((item: { topic: string; content: string }) => ({
            id: Date.now().toString() + Math.random().toString(),
            topic: item.topic,
            content: item.content
          }))
        ]);
      }
      
      toast.success('Website analyzed successfully!');
    } catch (error) {
      toast.error('Failed to scan website. Please try again.');
      console.error(error);
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
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-900/50 p-4 md:p-8 font-sans">
      <div className="fixed inset-0 z-[-1] opacity-60">
        <AnimatedBackground />
      </div>

      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white tracking-tight">
              Settings
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg font-light">
              Configure your AI agent with company info and rules
            </p>
          </div>
          <Button 
            onClick={saveSettings} 
            disabled={saving}
            className="rounded-full h-12 px-8 bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/20 transition-all hover:scale-105"
          >
            {saving ? <Loader2 className="h-5 w-5 mr-2 animate-spin" /> : <Save className="h-5 w-5 mr-2" />}
            Save Changes
          </Button>
        </div>

        <div className="space-y-8">
          {/* Company Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="rounded-[2.5rem] border-none shadow-xl shadow-slate-200/50 bg-white/80 backdrop-blur-xl overflow-hidden min-h-[500px]">
              <CardHeader className="p-8 border-b border-slate-100">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-2xl bg-indigo-100 text-indigo-600">
                    <Building2 className="h-6 w-6" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl font-bold text-slate-800">Company Profile</CardTitle>
                    <CardDescription>Basic information about your business</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-2 block">Company Name</label>
                  <Input
                    value={settings.company_name || ''}
                    onChange={(e) => setSettings({ ...settings, company_name: e.target.value })}
                    placeholder="e.g., Apex Marketing Solutions"
                    className="h-12 rounded-xl border-slate-200 focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>

                {/* Services Section */}
                <div>
                   <label className="text-sm font-medium text-slate-700 mb-2 block">Services Offered</label>
                   <div className="flex flex-wrap gap-3 mb-4">
                    {settings.services?.map((service: string, i: number) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                      >
                        <Badge 
                          variant="secondary" 
                          className="px-4 py-2 text-sm bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-full flex items-center gap-2"
                        >
                          {service}
                          <button 
                            onClick={() => removeService(i)}
                            className="ml-1 opacity-60 hover:opacity-100 transition-opacity"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </Badge>
                      </motion.div>
                    ))}
                    {settings.services?.length === 0 && (
                      <p className="text-slate-400 text-sm">No services added yet</p>
                    )}
                  </div>
                  <div className="flex gap-3">
                    <Input
                      placeholder="Add a service (e.g., SEO)..."
                      value={newServiceName}
                      onChange={(e) => setNewServiceName(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && addService()}
                      className="h-12 rounded-xl border-slate-200 focus:border-indigo-500 focus:ring-indigo-500 flex-1"
                    />
                    <Button 
                      onClick={addService} 
                      disabled={!newServiceName.trim()}
                      className="h-12 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Knowledge Base */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="rounded-[2.5rem] border-none shadow-xl shadow-slate-200/50 bg-white/80 backdrop-blur-xl overflow-hidden">
              <CardHeader className="p-8 border-b border-slate-100">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-2xl bg-emerald-100 text-emerald-600">
                    <BookOpen className="h-6 w-6" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl font-bold text-slate-800">Knowledge Base</CardTitle>
                    <CardDescription>Train your AI with specific business facts and Q&A</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-8 space-y-8">
                
                {/* Website Scanner */}
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-4">
                  <div className="flex items-center gap-2 text-slate-800 font-semibold">
                    <Globe className="h-5 w-5 text-indigo-500" />
                    <h3>Import from Website</h3>
                  </div>
                  <div className="flex gap-3">
                    <Input 
                      placeholder="https://example.com" 
                      value={websiteUrl}
                      onChange={(e) => setWebsiteUrl(e.target.value)}
                      className="h-12 rounded-xl border-slate-200 bg-white"
                    />
                    <Button 
                      onClick={scanWebsite}
                      disabled={scanning || !websiteUrl}
                      className="h-12 px-6 rounded-xl bg-slate-900 text-white hover:bg-slate-800"
                    >
                      {scanning ? <Loader2 className="h-4 w-4 mr-2 animate-spin"/> : <Search className="h-4 w-4 mr-2"/>}
                      Scan
                    </Button>
                  </div>
                  <p className="text-xs text-slate-500">
                    Our AI will analyze your website to extract your Company Name, Services, and key information automatically.
                  </p>
                </div>

                {/* Knowledge Items Grid */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-slate-700">Key Facts & Q/A</h3>
                    <Badge variant="outline" className="bg-slate-100">{knowledgeItems.length} items</Badge>
                  </div>
                  
                  {knowledgeItems.length === 0 ? (
                    <div className="text-center py-10 border-2 border-dashed border-slate-200 rounded-xl">
                      <Sparkles className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                      <p className="text-slate-500">No knowledge items yet. Add one below!</p>
                    </div>
                  ) : (
                    <div className="grid gap-4">
                      {knowledgeItems.map((item) => (
                        <div key={item.id} className="group relative p-4 bg-white rounded-xl border border-slate-200 hover:border-indigo-300 transition-colors shadow-sm">
                          <button 
                            onClick={() => removeKnowledgeItem(item.id)}
                            className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 transition-all"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                          <h4 className="font-bold text-slate-800 mb-1">{item.topic}</h4>
                          <p className="text-sm text-slate-600 leading-relaxed">{item.content}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Add New Item */}
                <div className="space-y-4 pt-4 border-t border-slate-100">
                  <h4 className="text-sm font-medium text-slate-500">Add Property / Question</h4>
                  <div className="space-y-3">
                    <Input 
                      placeholder="Topic (e.g., 'Pricing Model', 'Refund Policy')"
                      value={newTopic}
                      onChange={(e) => setNewTopic(e.target.value)}
                      className="h-11 rounded-xl"
                    />
                    <Textarea 
                      placeholder="Details or Answer..."
                      value={newContent}
                      onChange={(e) => setNewContent(e.target.value)}
                      className="min-h-[80px] rounded-xl resize-none"
                    />
                    <Button 
                      onClick={addKnowledgeItem}
                      disabled={!newTopic || !newContent}
                      variant="outline"
                      className="w-full rounded-xl border-dashed border-2 border-slate-300 hover:border-indigo-500 hover:text-indigo-600 hover:bg-indigo-50"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add to Knowledge Base
                    </Button>
                  </div>
                </div>

              </CardContent>
            </Card>
          </motion.div>
          
          {/* Mobile Save Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="md:hidden"
          >
            <Button 
              onClick={saveSettings} 
              disabled={saving}
              className="w-full h-14 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-lg shadow-lg shadow-indigo-500/20"
            >
              {saving ? <Loader2 className="h-5 w-5 mr-2 animate-spin" /> : <Save className="h-5 w-5 mr-2" />}
              Save Changes
            </Button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
