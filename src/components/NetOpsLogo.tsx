import React from 'react';

const marks = [
  // 1. route nodes
  <svg key="route" viewBox="0 0 36 36" className="w-full h-full">
    <rect x="2" y="2" width="32" height="32" rx="8" fill="none" stroke="#22d3ee" strokeWidth="2" />
    <circle cx="10" cy="10" r="2.2" fill="#22d3ee" />
    <circle cx="18" cy="16" r="2.2" fill="#22d3ee" />
    <circle cx="26" cy="24" r="2.2" fill="#22d3ee" />
    <path d="M12 11.5 L16 14.5 M20 17.5 L24 22" stroke="#22d3ee" strokeWidth="1.6" />
    <path d="M14 26 h8" stroke="#22d3ee" strokeWidth="1.6" />
    <path d="M20 24 l2 2 -2 2" fill="none" stroke="#22d3ee" strokeWidth="1.6" />
  </svg>,
  // 2. hex packet
  <svg key="hex" viewBox="0 0 36 36" className="w-full h-full">
    <path d="M18 3 L31 10.5 V25.5 L18 33 L5 25.5 V10.5 Z" fill="none" stroke="#22d3ee" strokeWidth="1.8" />
    <rect x="13" y="15" width="10" height="6" rx="1.5" fill="#22d3ee" />
    <path d="M8 18 h4 M24 18 h4" stroke="#22d3ee" strokeWidth="1.4" />
  </svg>,
  // 3. gauge + flame
  <svg key="gauge" viewBox="0 0 36 36" className="w-full h-full">
    <path d="M8 22 A10 10 0 1 1 28 22" fill="none" stroke="#22d3ee" strokeWidth="2.2" strokeLinecap="round" />
    <path d="M16 20 c0-4 1.5-6 2-8 0.5 2 2 4 2 8 a2 2 0 1 1 -4 0z" fill="#22d3ee" />
    <rect x="20" y="16" width="6" height="7" rx="1" fill="#22d3ee" />
  </svg>,
  // 4. stacked layers
  <svg key="layers" viewBox="0 0 36 36" className="w-full h-full">
    <rect x="8" y="7" width="20" height="4" rx="2" fill="#22d3ee" />
    <rect x="6" y="15" width="24" height="4" rx="2" fill="#22d3ee" />
    <rect x="8" y="23" width="20" height="4" rx="2" fill="#22d3ee" />
    <path d="M16 9 q2 4 0 6 q-2 2 0 6" fill="none" stroke="#07111f" strokeWidth="1.2" strokeDasharray="1.5 1.5" />
  </svg>,
];

export function NetOpsLogo() {
  const day = new Date().getDay();
  const mark = marks[day % marks.length];
  return (
    <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
      <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#07111f] border border-cyan-400/40 flex items-center justify-center shadow-md shadow-cyan-500/20 group-hover:scale-105 transition-transform shrink-0">
        {mark}
      </div>
      <div className="min-w-0">
        <div className="font-extrabold text-sm sm:text-base tracking-tight truncate">
          <span className="text-slate-900 dark:text-white">Net</span>
          <span className="text-cyan-500">Ops</span>
        </div>
        <p className="text-[10px] text-slate-500 dark:text-slate-400 hidden sm:block truncate">сеть под контролем</p>
      </div>
    </div>
  );
}
