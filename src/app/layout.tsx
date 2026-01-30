'use client';

import { Inter } from "next/font/google";
import "./globals.css";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Settings, Package, LogOut, Home, DollarSign, FileText, BarChart2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from "next/navigation";
import { Toaster, toast } from "sonner";
import { supabase } from "@/lib/supabase-client";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from 'react';

const inter = Inter({ subsets: ["latin"] });

import { AnimatedBackground } from "@/components/ui/animated-background";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const router = useRouter();
  const [userEmail, setUserEmail] = useState<string>('');
  const [userName, setUserName] = useState<string>('');
  
  // Routes where we should show the sidebar navigation
  const showNav = ['/campaigns', '/settings', '/packages', '/pricing', '/dashboard', '/deals', '/leads', '/quotes', '/analytics'].some(path => pathname.startsWith(path));

  // Fetch user data on mount
  useEffect(() => {
    async function fetchUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserEmail(user.email || '');
        setUserName(user.user_metadata?.full_name || user.email?.split('@')[0] || 'User');
      }
    }
    fetchUser();
  }, []);

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      toast.success('Logged out successfully');
      router.push('/login');
      router.refresh();
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Failed to log out. Please try again.');
    }
  };

  return (
    <html lang="en">
      <body className={`${inter.className} overflow-x-hidden bg-background text-foreground`}>
        {/* Background Effects */}
        <AnimatedBackground />
        <div className="aurora-bg" />
        
        {showNav ? (
          <div className="flex min-h-screen relative font-sans">
            {/* Floating Glass Sidebar */}
            <aside className="fixed top-6 left-6 bottom-6 w-64 glass-panel rounded-2xl hidden md:flex flex-col z-50 border border-white/40 dark:border-white/10 shadow-2xl">
              <div className="p-8 pb-4">
                <div className="text-2xl font-bold tracking-tight text-gradient-brand">
                  AutoSales.ai
                </div>
                <div className="text-xs text-muted-foreground font-medium mt-1 tracking-wide">
                  INTELLIGENT AUTOMATION
                </div>
              </div>
              
              <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto custom-scrollbar">
                <div className="px-2 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Platform</div>
                <NavItem href="/dashboard" icon={<Home size={18}/>} label="Dashboard" active={pathname.startsWith('/dashboard')} />
                <NavItem href="/campaigns" icon={<LayoutDashboard size={18}/>} label="Campaigns" active={pathname.startsWith('/campaigns')} />
                <NavItem href="/leads" icon={<Package size={18}/>} label="Leads" active={pathname.startsWith('/leads')} />
                <NavItem href="/deals" icon={<DollarSign size={18}/>} label="Deals" active={pathname.startsWith('/deals')} />
                
                <div className="px-2 mt-8 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Management</div>
                <NavItem href="/quotes" icon={<FileText size={18}/>} label="Quotes" active={pathname.startsWith('/quotes')} />
                <NavItem href="/analytics" icon={<BarChart2 size={18}/>} label="Analytics" active={pathname.startsWith('/analytics')} />
                <NavItem href="/packages" icon={<Package size={18}/>} label="Packages" active={pathname.startsWith('/packages')} />
                <NavItem href="/settings" icon={<Settings size={18}/>} label="Settings" active={pathname.startsWith('/settings')} />
              </nav>

              <div className="p-4 m-2 glass mt-auto rounded-xl">
                 <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-teal-400 to-emerald-500 flex items-center justify-center text-white font-bold text-xs">
                       {userName.charAt(0).toUpperCase()}
                    </div>
                    <div className="overflow-hidden">
                       <p className="text-sm font-semibold truncate leading-none">{userName}</p>
                       <p className="text-xs text-muted-foreground truncate">{userEmail}</p>
                    </div>
                 </div>
                <Button variant="ghost" size="sm" className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50/50" onClick={handleLogout}>
                  <LogOut size={16} className="mr-2"/> Sign Out
                </Button>
              </div>
            </aside>

            {/* Mobile Header */}
            <div className="md:hidden fixed top-0 left-0 right-0 h-16 glass-panel z-50 flex items-center px-4 justify-between border-b-0 shadow-lg">
               <div className="font-bold text-lg text-gradient-brand">AutoSales.ai</div>
               {/* Mobile menu trigger could go here */}
            </div>

            {/* Main Content Area */}
            <main className="flex-1 md:pl-[20rem] pr-6 py-6 min-h-screen">
               <AnimatePresence mode="wait">
                  <motion.div
                    key={pathname}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="h-full"
                  >
                    {children}
                  </motion.div>
               </AnimatePresence>
            </main>
          </div>
        ) : (
          /* Landing/Login Layout */
          children
        )}
        <Toaster position="top-center" richColors theme="system" closeButton />
      </body>
    </html>
  );
}

function NavItem({ href, icon, label, active }: { href: string; icon: React.ReactNode; label: string; active?: boolean }) {
  return (
    <Link href={href} className="block">
      <div 
        className={`
          group relative flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 
          ${active 
            ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/20 dark:bg-white dark:text-slate-900' 
            : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800/50'
          }
        `}
      >
        <span className={`transition-transform duration-200 ${active ? 'scale-110' : 'group-hover:scale-110'}`}>
           {icon}
        </span>
        <span className="font-medium text-sm">{label}</span>
        
        {active && (
           <motion.div 
             layoutId="active-nav-indicator"
             className="absolute left-0 w-1 h-6 bg-teal-400 rounded-r-full hidden" 
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             transition={{ duration: 0.3 }}
           />
        )}
      </div>
    </Link>
  );
}
