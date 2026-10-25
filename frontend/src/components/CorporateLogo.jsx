import React from 'react';

/**
 * CorporateLogo — Clean orange-square brand mark for PrepRoom
 */
export default function CorporateLogo({ size = 'md', showText = true, subtitle = 'AI-Powered Interview Simulator' }) {
  const isSm = size === 'sm';
  const isLg = size === 'lg';
  const boxSize = isSm ? 'w-8 h-8' : isLg ? 'w-12 h-12' : 'w-10 h-10';
  const textSize = isSm ? 'text-base' : isLg ? 'text-xl' : 'text-lg';

  return (
    <div className="flex items-center gap-2.5 select-none">
      {/* Orange rounded square logo mark */}
      <div className={`${boxSize} rounded-xl bg-orange-600 flex items-center justify-center shrink-0 shadow-sm`}>
        <span className={`text-white font-black ${isSm ? 'text-sm' : isLg ? 'text-xl' : 'text-base'}`}>P</span>
      </div>

      {showText && (
        <div className="flex flex-col leading-tight">
          <span className={`font-black text-gray-900 tracking-tight ${textSize}`}>
            PrepRoom
          </span>
          {subtitle && (
            <span className="text-[10px] text-gray-400 font-medium tracking-tight mt-0.5">
              {subtitle}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
