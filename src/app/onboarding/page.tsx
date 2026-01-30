'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/db';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronRight, ChevronLeft, Building2, Briefcase, Package, Brain, Check, Plus, Trash2, Loader2 } from 'lucide-react';

const STEPS = [
  { id: 1, title: 'Company Info', icon: Building2 },
  { id: 2, title: 'Services', icon: Briefcase },
  { id: 3, title: 'Packages', icon: Package },
  { id: 4, title: 'AI Setup', icon: Brain },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  // Form data
  const [companyName, setCompanyName] = useState('');
  const [services, setServices] = useState<string[]>(['Web Design', 'SEO']);
  const [newService, setNewService] = useState('');
  const [packages, setPackages] = useState([
    { name: 'Starter', price: 1500, description: 'Basic package' },
    { name: 'Pro', price: 3500, description: 'Complete solution' },
  ]);
  const [aiPersonality, setAiPersonality] = useState('friendly');
  const [openingMessage, setOpeningMessage] = useState('');
  
  const addService = () => {
    if (newService.trim()) {
      setServices([...services, newService.trim()]);
      setNewService('');
    }
  };
  
  const removeService = (index: number) => {
    setServices(services.filter((_, i) => i !== index));
  };
  
  const addPackage = () => {
    setPackages([...packages, { name: '', price: 0, description: '' }]);
  };
  
  const updatePackage = (index: number, field: string, value: string | number) => {
    const updated = [...packages];
    updated[index] = { ...updated[index], [field]: value };
    setPackages(updated);
  };
  
  const completeOnboarding = async () => {
    setLoading(true);
    
    // Save settings
    await db.from('settings').upsert({
      id: 'default',
      company_name: companyName,
      services: services,
      ai_personality: aiPersonality,
      opening_message: openingMessage,
      onboarding_complete: true,
    });
    
    // Save packages
    for (const pkg of packages) {
      if (pkg.name) {
        await db.from('packages').insert({
          name: pkg.name,
          description: pkg.description,
          price_min: pkg.price * 100,
          price_max: pkg.price * 100,
          is_fixed_price: true,
        });
      }
    }
    
    setLoading(false);
    router.push('/dashboard');
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        {/* Progress Steps */}
        <div className="flex justify-center mb-8">
          {STEPS.map((s, i) => (
            <div key={s.id} className="flex items-center">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                step >= s.id ? 'bg-purple-600 border-purple-600 text-white' : 'border-slate-600 text-slate-500'
              }`}>
                {step > s.id ? <Check size={20}/> : <s.icon size={18}/>}
              </div>
              {i < STEPS.length - 1 && (
                <div className={`w-16 h-1 mx-2 ${step > s.id ? 'bg-purple-600' : 'bg-slate-700'}`}/>
              )}
            </div>
          ))}
        </div>
        
        <Card className="bg-slate-800/80 border-slate-700 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-2xl text-white">{STEPS[step - 1].title}</CardTitle>
            <CardDescription className="text-slate-400">
              {step === 1 && "Tell us about your company"}
              {step === 2 && "What services do you offer?"}
              {step === 3 && "Define your pricing packages"}
              {step === 4 && "Configure your AI sales agent"}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Step 1: Company Info */}
            {step === 1 && (
              <div className="space-y-6">
                
                {/* Auto-Import Feature */}
                <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700">
                    <label className="text-sm font-semibold text-purple-400 mb-2 block flex items-center gap-2">
                       <Brain size={14} /> Auto-Fill from Website
                    </label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="https://your-company.com"
                        id="import-url"
                        className="bg-slate-900 border-slate-600 text-white"
                      />
                      <Button 
                        size="sm"
                        variant="secondary"
                        onClick={async () => {
                          const urlInput = document.getElementById('import-url') as HTMLInputElement;
                          if (!urlInput?.value) return;
                          
                          setLoading(true);
                          try {
                             const res = await fetch('/api/scrape', {
                                method: 'POST',
                                body: JSON.stringify({ url: urlInput.value }),
                             });
                             const data = await res.json();
                             if (data.company_name) setCompanyName(data.company_name);
                             if (data.services) setServices(data.services);
                             // Could also set description/value prop into a state if we had it
                             
                             // Clean up mock packages? Or update them?
                             
                          } catch (e) {
                             console.error(e);
                          } finally {
                             setLoading(false);
                          }
                        }}
                      >
                         {loading ? <Loader2 className="animate-spin w-4 h-4"/> : "Import"}
                      </Button>
                    </div>
                </div>

                <div>
                  <label className="text-sm text-slate-300 mb-2 block">Company Name</label>
                  <Input
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="e.g., Marketing Solutions Inc."
                    className="bg-slate-900 border-slate-600 text-white"
                  />
                </div>
              </div>
            )}
            
            {/* Step 2: Services */}
            {step === 2 && (
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {services.map((service, i) => (
                    <Badge key={i} variant="secondary" className="flex items-center gap-2 py-2 px-3">
                      {service}
                      <Trash2 size={14} className="cursor-pointer text-red-400" onClick={() => removeService(i)}/>
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    value={newService}
                    onChange={(e) => setNewService(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addService()}
                    placeholder="Add a service..."
                    className="bg-slate-900 border-slate-600 text-white"
                  />
                  <Button onClick={addService} variant="secondary">
                    <Plus size={18}/>
                  </Button>
                </div>
              </div>
            )}
            
            {/* Step 3: Packages */}
            {step === 3 && (
              <div className="space-y-4">
                {packages.map((pkg, i) => (
                  <div key={i} className="grid grid-cols-3 gap-2">
                    <Input
                      value={pkg.name}
                      onChange={(e) => updatePackage(i, 'name', e.target.value)}
                      placeholder="Package name"
                      className="bg-slate-900 border-slate-600 text-white"
                    />
                    <Input
                      type="number"
                      value={pkg.price}
                      onChange={(e) => updatePackage(i, 'price', parseInt(e.target.value) || 0)}
                      placeholder="Price ($)"
                      className="bg-slate-900 border-slate-600 text-white"
                    />
                    <Input
                      value={pkg.description}
                      onChange={(e) => updatePackage(i, 'description', e.target.value)}
                      placeholder="Description"
                      className="bg-slate-900 border-slate-600 text-white"
                    />
                  </div>
                ))}
                <Button onClick={addPackage} variant="ghost" className="text-slate-400">
                  <Plus size={18} className="mr-2"/> Add Package
                </Button>
              </div>
            )}
            
            {/* Step 4: AI Setup */}
            {step === 4 && (
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-slate-300 mb-2 block">AI Personality</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['friendly', 'professional', 'enthusiastic'].map((p) => (
                      <Button
                        key={p}
                        variant={aiPersonality === p ? 'default' : 'outline'}
                        onClick={() => setAiPersonality(p)}
                        className="capitalize"
                      >
                        {p}
                      </Button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-sm text-slate-300 mb-2 block">Custom Opening Message (Optional)</label>
                  <Input
                    value={openingMessage}
                    onChange={(e) => setOpeningMessage(e.target.value)}
                    placeholder={`Hi! Is this {business_name}? This is Sarah from ${companyName || 'our company'}...`}
                    className="bg-slate-900 border-slate-600 text-white"
                  />
                </div>
              </div>
            )}
            
            {/* Navigation */}
            <div className="flex justify-between pt-6">
              <Button
                variant="ghost"
                onClick={() => setStep(step - 1)}
                disabled={step === 1}
                className="text-slate-400"
              >
                <ChevronLeft className="mr-2"/> Back
              </Button>
              
              {step < 4 ? (
                <Button onClick={() => setStep(step + 1)}>
                  Next <ChevronRight className="ml-2"/>
                </Button>
              ) : (
                <Button onClick={completeOnboarding} disabled={loading} className="bg-green-600 hover:bg-green-700">
                  {loading ? <Loader2 className="animate-spin mr-2"/> : <Check className="mr-2"/>}
                  Complete Setup
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
