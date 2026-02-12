import { Theme, BackgroundTheme } from '../types';

export const THEMES: Theme[] = [
  {
    id: 'professional',
    name: 'Professional',
    ranges: [
      { min: 0, max: 0.20, color: '#64748b', label: 'Initiated' },   // Slate-500
      { min: 0.20, max: 0.40, color: '#60a5fa', label: 'Underway' },  // Blue-400
      { min: 0.40, max: 0.60, color: '#3b82f6', label: 'Developing' },// Blue-500
      { min: 0.60, max: 0.80, color: '#2563eb', label: 'Refining' },  // Blue-600
      { min: 0.80, max: 1.0, color: '#1e40af', label: 'Ready' },      // Blue-800
    ]
  },
  {
    id: 'forest',
    name: 'Forest',
    ranges: [
      { min: 0, max: 0.20, color: '#A3E4D7', label: 'Seed' },
      { min: 0.20, max: 0.40, color: '#76D7C4', label: 'Sprout' },
      { min: 0.40, max: 0.60, color: '#48C9B0', label: 'Growth' },
      { min: 0.60, max: 0.80, color: '#1ABC9C', label: 'Bloom' },
      { min: 0.80, max: 1.0, color: '#117864', label: 'Harvest' },
    ]
  },
  {
    id: 'traffic',
    name: 'Traffic',
    ranges: [
      { min: 0, max: 0.20, color: '#94a3b8', label: 'Stopped' },     // Slate-400
      { min: 0.20, max: 0.40, color: '#ef4444', label: 'Critical' },  // Red-500
      { min: 0.40, max: 0.60, color: '#f97316', label: 'Warning' },   // Orange-500
      { min: 0.60, max: 0.80, color: '#eab308', label: 'Progress' },  // Yellow-500
      { min: 0.80, max: 1.0, color: '#22c55e', label: 'Go' },         // Green-500
    ]
  },
  {
    id: 'royal',
    name: 'Royal',
    ranges: [
      { min: 0, max: 0.20, color: '#422006', label: 'Bronze' },
      { min: 0.20, max: 0.40, color: '#854d0e', label: 'Copper' },
      { min: 0.40, max: 0.60, color: '#a16207', label: 'Silver' },
      { min: 0.60, max: 0.80, color: '#ca8a04', label: 'Gold' },
      { min: 0.80, max: 1.0, color: '#eab308', label: 'Platinum' },
    ]
  },
  {
    id: 'ocean',
    name: 'Ocean',
    ranges: [
      { min: 0, max: 0.20, color: '#6A5ACD', label: 'Initiation' },
      { min: 0.20, max: 0.40, color: '#4169E1', label: 'Loading' },
      { min: 0.40, max: 0.60, color: '#00BFFF', label: 'Cruising' },
      { min: 0.60, max: 0.80, color: '#00CED1', label: 'Refining' },
      { min: 0.80, max: 1.0, color: '#20B2AA', label: 'Complete' },
    ]
  }
];

export const BACKGROUNDS: BackgroundTheme[] = [
  // LIGHT THEMES
  { 
    id: 'clean', 
    name: 'Clean', 
    className: 'bg-slate-50', 
    isDark: false 
  },
  { 
    id: 'air', 
    name: 'Air', 
    className: 'bg-gradient-to-br from-slate-50 via-blue-50 to-white', 
    isDark: false 
  },
  { 
    id: 'polar', 
    name: 'Polar', 
    className: 'bg-gradient-to-tr from-sky-50 via-slate-50 to-cyan-100', 
    isDark: false 
  },
  { 
    id: 'honey', 
    name: 'Honey', 
    className: 'bg-gradient-to-bl from-amber-50 via-orange-50 to-yellow-50', 
    isDark: false 
  },
  { 
    id: 'mint', 
    name: 'Mint', 
    className: 'bg-gradient-to-bl from-emerald-50 via-teal-50 to-slate-50', 
    isDark: false 
  },
  { 
    id: 'dawn', 
    name: 'Dawn', 
    className: 'bg-slate-50 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-rose-100 via-slate-50 to-blue-50', 
    isDark: false 
  },
  { 
    id: 'dusk', 
    name: 'Dusk', 
    className: 'bg-slate-50 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-orange-100 via-slate-50 to-slate-100', 
    isDark: false 
  },
  
  // DARK THEMES
  { 
    id: 'midnight', 
    name: 'Midnight', 
    className: 'bg-slate-900 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-800 via-slate-900 to-black', 
    isDark: true 
  },
  {
    id: 'deep-ocean',
    name: 'Deep Ocean',
    className: 'bg-gradient-to-br from-blue-900 via-slate-900 to-black',
    isDark: true
  },
  {
    id: 'obsidian',
    name: 'Obsidian',
    className: 'bg-neutral-950 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-neutral-800 via-neutral-950 to-black',
    isDark: true
  },
  {
    id: 'royal-dark',
    name: 'Royal',
    className: 'bg-gradient-to-br from-indigo-950 via-slate-900 to-purple-950',
    isDark: true
  },
  {
    id: 'forest-night',
    name: 'Forest',
    className: 'bg-gradient-to-b from-emerald-950 to-black',
    isDark: true
  },
  {
    id: 'volcano',
    name: 'Volcano',
    className: 'bg-gradient-to-tr from-red-950 via-slate-950 to-black',
    isDark: true
  },
  { 
    id: 'nebula', 
    name: 'Nebula', 
    className: 'bg-indigo-950 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900 via-slate-900 to-black', 
    isDark: true 
  },
  { 
    id: 'twilight', 
    name: 'Twilight', 
    className: 'bg-slate-950 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-purple-900 via-slate-900 to-black', 
    isDark: true 
  },
  { 
    id: 'aurora', 
    name: 'Aurora', 
    className: 'bg-emerald-950 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-900 via-slate-900 to-black', 
    isDark: true 
  }
];

export const getThemeColor = (value: number, theme: Theme): string => {
  // Clamp value between 0 and 1
  const v = Math.max(0, Math.min(1, value));
  
  // Find range. We use > min and <= max, except for 0 which is included in first range
  const match = theme.ranges.find(r => {
    if (r.min === 0) return v >= r.min && v <= r.max;
    return v > r.min && v <= r.max;
  });

  return match ? match.color : theme.ranges[0].color;
};

export const getThemeLabel = (value: number, theme: Theme): string => {
  const v = Math.max(0, Math.min(1, value));
  const match = theme.ranges.find(r => {
    if (r.min === 0) return v >= r.min && v <= r.max;
    return v > r.min && v <= r.max;
  });
  return match ? match.label : '';
};