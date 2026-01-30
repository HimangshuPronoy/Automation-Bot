'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/db';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Plus, Trash2, Package, DollarSign } from 'lucide-react';
import { motion } from 'framer-motion';
import { AnimatedBackground } from '@/components/ui/animated-background';

interface PackageItem {
  id: string;
  name: string;
  description: string;
  price_min: number;
  price_max: number;
  is_fixed_price: boolean;
  created_at: string;
}

export default function PackagesPage() {
  const [packages, setPackages] = useState<PackageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newPackage, setNewPackage] = useState({
    name: '',
    description: '',
    price_min: 0,
    price_max: 0,
    is_fixed_price: false
  });

  const loadPackages = async () => {
    setLoading(true);
    const { data } = await db.from('packages').select('*').order('created_at', { ascending: true });
    if (data) setPackages(data);
    setLoading(false);
  };

  useEffect(() => {
    loadPackages();
  }, []);

  const createPackage = async () => {
    if (!newPackage.name) return;
    setCreating(true);
    
    await db.from('packages').insert({
      name: newPackage.name,
      description: newPackage.description,
      price_min: newPackage.price_min * 100,
      price_max: newPackage.price_max * 100,
      is_fixed_price: newPackage.is_fixed_price
    });
    
    setNewPackage({ name: '', description: '', price_min: 0, price_max: 0, is_fixed_price: false });
    setCreating(false);
    loadPackages();
  };

  const deletePackage = async (id: string) => {
    if (confirm('Are you sure you want to delete this package?')) {
      await db.from('packages').delete().eq('id', id);
      loadPackages();
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

      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white tracking-tight">
              Packages
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg font-light">
              Define services and pricing for your AI agent to sell
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="px-4 py-2 bg-white/60 backdrop-blur-md rounded-full border border-white/40 text-sm text-slate-600">
              <Package className="inline-block mr-2 h-4 w-4" />
              {packages.length} Packages
            </div>
          </div>
        </div>

        {/* Create New Package Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="rounded-[2.5rem] border-none shadow-xl shadow-slate-200/50 bg-white/80 backdrop-blur-xl overflow-hidden mb-8">
            <CardHeader className="p-8 border-b border-slate-100">
              <CardTitle className="text-2xl font-bold text-slate-800">Add New Package</CardTitle>
              <CardDescription>Create a service package for the AI agent to offer</CardDescription>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-2 block">Package Name</label>
                  <Input 
                    placeholder="e.g. Starter SEO Package" 
                    value={newPackage.name}
                    onChange={(e) => setNewPackage({ ...newPackage, name: e.target.value })}
                    className="h-12 rounded-xl border-slate-200 focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-2 block">Description</label>
                  <Input 
                    placeholder="Brief description of what's included" 
                    value={newPackage.description}
                    onChange={(e) => setNewPackage({ ...newPackage, description: e.target.value })}
                    className="h-12 rounded-xl border-slate-200 focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
              </div>
              
              <div className="grid md:grid-cols-3 gap-6 items-end">
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-2 block">
                    <DollarSign className="inline-block h-4 w-4 mr-1" />
                    Min Price
                  </label>
                  <Input 
                    type="number" 
                    value={newPackage.price_min}
                    onChange={(e) => setNewPackage({ ...newPackage, price_min: parseInt(e.target.value) || 0 })}
                    className="h-12 rounded-xl border-slate-200 focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
                {!newPackage.is_fixed_price && (
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-2 block">
                      <DollarSign className="inline-block h-4 w-4 mr-1" />
                      Max Price
                    </label>
                    <Input 
                      type="number" 
                      value={newPackage.price_max}
                      onChange={(e) => setNewPackage({ ...newPackage, price_max: parseInt(e.target.value) || 0 })}
                      className="h-12 rounded-xl border-slate-200 focus:border-indigo-500 focus:ring-indigo-500"
                    />
                  </div>
                )}
                <div className="flex items-center gap-3 h-12 px-4 bg-slate-50 rounded-xl">
                  <input 
                    type="checkbox" 
                    id="fixedPrice"
                    checked={newPackage.is_fixed_price}
                    onChange={(e) => setNewPackage({ ...newPackage, is_fixed_price: e.target.checked })}
                    className="h-5 w-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <label htmlFor="fixedPrice" className="text-sm font-medium text-slate-700">Fixed Price</label>
                </div>
              </div>

              <Button 
                onClick={createPackage} 
                disabled={creating || !newPackage.name}
                className="w-full h-14 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-lg shadow-lg shadow-indigo-500/20 transition-all hover:scale-[1.02]"
              >
                {creating ? (
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                ) : (
                  <Plus className="h-5 w-5 mr-2" />
                )}
                Create Package
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Packages List */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {packages.map((pkg, index) => (
            <motion.div
              key={pkg.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.05 }}
              whileHover={{ y: -5 }}
            >
              <Card className="rounded-[2rem] border-none shadow-lg bg-white/80 backdrop-blur-xl overflow-hidden hover:shadow-xl transition-all duration-300 h-full">
                <CardContent className="p-6 flex flex-col h-full">
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-3 rounded-2xl bg-indigo-100 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-400">
                      <Package className="h-6 w-6" />
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => deletePackage(pkg.id)}
                      className="text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <h3 className="text-xl font-bold text-slate-800 mb-2">{pkg.name}</h3>
                  <p className="text-sm text-slate-500 mb-4 flex-1">{pkg.description || 'No description'}</p>
                  
                  <div className="pt-4 border-t border-slate-100">
                    <span className="text-2xl font-bold text-slate-900 dark:text-white">
                      {pkg.is_fixed_price 
                        ? `$${pkg.price_min / 100}` 
                        : `$${pkg.price_min / 100} - $${pkg.price_max / 100}`
                      }
                    </span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {packages.length === 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
              <Package className="h-10 w-10 text-indigo-500" />
            </div>
            <h3 className="text-xl font-semibold text-slate-700 mb-2">No packages yet</h3>
            <p className="text-slate-500">Create your first package above to get started</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
