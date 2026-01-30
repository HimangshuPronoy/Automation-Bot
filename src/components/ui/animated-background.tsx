'use client';

export const AnimatedBackground = () => {
  return (
    <div className="fixed inset-0 z-[-1] overflow-hidden bg-soft-white dark:bg-slate-950">
      {/* Noise Texture Overlay */}
      <div 
        className="absolute inset-0 opacity-[0.03] dark:opacity-[0.06] z-10 pointer-events-none mix-blend-overlay"
        style={{ 
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
        }}
      />

      {/* Orbital Gradient Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[60vw] h-[60vw] bg-purple-200/40 dark:bg-purple-900/20 rounded-full blur-[100px] animate-orbit-slow mix-blend-multiply dark:mix-blend-screen" />
      <div className="absolute top-[20%] right-[-10%] w-[50vw] h-[50vw] bg-sakura/40 dark:bg-pink-900/20 rounded-full blur-[100px] animate-orbit-medium animation-delay-2000 mix-blend-multiply dark:mix-blend-screen" />
      <div className="absolute bottom-[-20%] left-[20%] w-[70vw] h-[70vw] bg-blue-200/40 dark:bg-blue-900/20 rounded-full blur-[120px] animate-orbit-fast animation-delay-4000 mix-blend-multiply dark:mix-blend-screen" />
    </div>
  );
};
