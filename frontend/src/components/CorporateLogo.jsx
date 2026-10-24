import React from 'react';

/**
 * CorporateLogo — Executive Corporate Brand Insignia
 * Clean architectural skyscraper/shield geometry with glowing cyan-indigo gradient.
 */
export default function CorporateLogo({ size = 'md', showText = true, subtitle = 'Enterprise Talent & Operations' }) {
  const isSm = size === 'sm';
  const isLg = size === 'lg';

  const iconSize = isSm ? 'w-8 h-8' : isLg ? 'w-12 h-12' : 'w-10 h-10';

  return (
    <div className="flex items-center gap-3 select-none">
      {/* Geometric Corporate Monolith Emblem */}
      <div className={`relative ${iconSize} shrink-0 group`}>
        <div className="w-full h-full rounded-2xl bg-gradient-to-tr from-cyan-500 via-indigo-600 to-purple-600 p-[1.5px] shadow-[0_0_20px_rgba(6,182,212,0.35)] transition-transform duration-300 group-hover:scale-105">
          <div className="w-full h-full rounded-[14px] bg-[#080C1A] flex items-center justify-center relative overflow-hidden">
            {/* Subtle internal grid/specular highlight */}
            <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />
            
            {/* Architectural Corporate Skyscraper Crest */}
            <svg 
              viewBox="0 0 24 24" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
              className={isSm ? 'w-4 h-4' : isLg ? 'w-6 h-6' : 'w-5 h-5'}
            >
              {/* Outer Corporate Shield / Monolith */}
              <path 
                d="M12 2L4 6V12C4 16.5 7.4 20.7 12 22C16.6 20.7 20 16.5 20 12V6L12 2Z" 
                stroke="url(#corpLogoGrad)" 
                strokeWidth="1.75" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              />
              {/* Corporate Tower Pillars */}
              <path 
                d="M9 14V10L12 8L15 10V14" 
                stroke="#38BDF8" 
                strokeWidth="1.5" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
              />
              <path 
                d="M12 8V17" 
                stroke="#818CF8" 
                strokeWidth="1.5" 
                strokeLinecap="round" 
              />
              <defs>
                <linearGradient id="corpLogoGrad" x1="4" y1="2" x2="20" y2="22" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#38BDF8" />
                  <stop offset="0.5" stopColor="#818CF8" />
                  <stop offset="1" stopColor="#C084FC" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>
      </div>

      {/* Corporate Typography */}
      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="font-extrabold text-white tracking-wider text-sm sm:text-base leading-none">
              NEXUS
            </span>
            <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-md bg-cyan-500/15 text-cyan-300 border border-cyan-400/30 tracking-tight leading-none">
              CORP
            </span>
          </div>
          {subtitle && (
            <span className="text-[10px] text-slate-400 font-medium tracking-tight mt-1 leading-none">
              {subtitle}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
