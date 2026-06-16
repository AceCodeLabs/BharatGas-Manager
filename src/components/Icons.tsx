import React from 'react';
import { cn } from '../lib/utils';

export const BharatGasIcon = ({ className }: { className?: string }) => (
  <div className={cn("flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-orange-400 shadow-lg shadow-orange-500/20", className)}>
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      color="currentColor" 
      className="size-6 text-white" 
      strokeWidth="2" 
      stroke="currentColor"
    >
      <path 
        d="M13.8561 22C26.0783 19 19.2338 7 10.9227 2C9.9453 5.5 8.47838 6.5 5.54497 10C1.66121 14.6339 3.5895 20 8.96719 22C8.1524 21 6.04958 18.9008 7.5 16C8 15 9 14 8.5 12C9.47778 12.5 11.5 13 12 15.5C12.8148 14.5 13.6604 12.4 12.8783 10C19 14.5 16.5 19 13.8561 22Z" 
        stroke="currentColor" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        strokeWidth="2"
      />
    </svg>
  </div>
);
