import React, { useMemo, useState } from 'react';
import { 
  Sun, Moon, Sunrise, Quote, Settings2, X, Check, 
  LayoutGrid, List, BarChart3, PanelTop, Image as ImageIcon,
  Calendar, Bell, CheckCircle2, AlertCircle, Palette, Monitor
} from 'lucide-react';
import { Theme, LayoutMode, BackgroundTheme, ReadinessScoreDetails } from '../types';
import { THEMES, BACKGROUNDS } from '../services/theme';

interface WelcomeCardProps {
  userName: string;
  readinessData: ReadinessScoreDetails[];
  currentTheme: Theme;
  onThemeChange: (theme: Theme) => void;
  showQuotes: boolean;
  onToggleQuotes: (show: boolean) => void;
  layoutMode: LayoutMode;
  onLayoutChange: (mode: LayoutMode) => void;
  showChart: boolean;
  onToggleChart: (show: boolean) => void;
  showStats: boolean;
  onToggleStats: (show: boolean) => void;
  currentBackground: BackgroundTheme;
  onBackgroundChange: (bg: BackgroundTheme) => void;
}

// 1. ENSURE THIS ARRAY EXISTS
const QUOTES = [
  // --- Executive & Business ---
  "The only way to do great work is to love what you do.",
  "Opportunities don't happen, you create them.",
  "The best way to predict the future is to create it.",
  "Perfection is not attainable, but if we chase perfection we can catch excellence.",
  "Efficiency is doing things right; effectiveness is doing the right things.",
  "Success is not final, failure is not fatal: it is the courage to continue that counts.",
  "Quality means doing it right when no one is looking.",
  "Productivity is never an accident. It is always the result of a commitment to excellence.",
  "Great things in business are never done by one person. They're done by a team.",
  "The secret of getting ahead is getting started.",
  "Identify your problems, but give your power and energy to solutions.",
  
  // --- Scientific Genius (Einstein, Newton, Da Vinci) ---
  "In the middle of difficulty lies opportunity.",
  "If I have seen further, it is by standing on the shoulders of giants.",
  "Imagination is more important than knowledge.",
  "Truth is ever to be found in simplicity, and not in the multiplicity and confusion of things.",
  "It is not that I'm so smart. But I stay with the questions much longer.",
  "Life is like riding a bicycle. To keep your balance, you must keep moving.",
  "Genius is one percent inspiration and ninety-nine percent perspiration.",
  "Simplicity is the ultimate sophistication.",
  "Learn from yesterday, live for today, hope for tomorrow.",

  // --- Arabic Wisdom & Philosophy ---
  "Yesterday I was clever, so I wanted to change the world. Today I am wise, so I am changing myself.",
  "A moment of patience in a moment of anger saves you a hundred moments of regret.",
  "Knowledge without action is like a tree without fruit.",
  "Time is like a sword; if you do not cut it, it will cut you.",
  "Ignorance leads to fear, fear leads to hate, and hate leads to violence.",
  "He who has health, has hope; and he who has hope, has everything.",
  "Trust in God, but tie your camel.",
  "Good character is the one thing that can make a person beautiful who is not beautiful.",
  "Do not grieve over the past, for it has gone. Live in the present and make it beautiful.",
  "A wise man makes his own decisions, an ignorant man follows the public opinion.",
  "The tongue is like a lion; if you let it loose, it will wound someone."
];

export const WelcomeCard: React.FC<WelcomeCardProps> = ({ 
  userName, 
  readinessData,
  currentTheme, 
  onThemeChange, 
  showQuotes, 
  onToggleQuotes,
  layoutMode,
  onLayoutChange,
  showChart, 
  onToggleChart,
  showStats,
  onToggleStats,
  currentBackground,
  onBackgroundChange
}) => {
  const [activeModal, setActiveModal] = useState<'none' | 'appearance' | 'settings'>('none');
  const isDark = currentBackground.isDark;

  // Time & Date Logic
  const timeInfo = useMemo(() => {
    const now = new Date();
    const hour = now.getHours();
    
    const dateString = now.toLocaleDateString('en-US', { 
      weekday: 'long', 
      month: 'short', 
      day: 'numeric' 
    });

    if (hour < 12) return { greeting: 'Good Morning', icon: Sunrise, color: 'text-amber-500', bg: 'bg-amber-500/10', date: dateString };
    if (hour < 18) return { greeting: 'Good Afternoon', icon: Sun, color: 'text-orange-500', bg: 'bg-orange-500/10', date: dateString };
    return { greeting: 'Good Evening', icon: Moon, color: 'text-indigo-400', bg: 'bg-indigo-500/10', date: dateString };
  }, []);

  const quote = useMemo(() => {
    return QUOTES[Math.floor(Math.random() * QUOTES.length)];
  }, []);

  // Daily Briefing Logic
  const briefing = useMemo(() => {
    if (!readinessData || readinessData.length === 0) return { type: 'neutral', message: "System synchronizing..." };

    const totalOverdue = readinessData.reduce((acc, curr) => acc + curr.vendorTasks.filter(t => t.isOverdue).length, 0);
    const fullyReady = readinessData.filter(d => d.totalScore >= 0.99).length;

    if (totalOverdue > 0) {
      return { 
        type: 'alert', 
        message: `You have ${totalOverdue} overdue task${totalOverdue > 1 ? 's' : ''} requiring attention.`,
      };
    }
    if (fullyReady === readinessData.length) {
      return { 
        type: 'success', 
        message: "All departments are fully ready for launch!",
      };
    }
    return { 
      type: 'info', 
      message: `${fullyReady} of ${readinessData.length} departments are fully ready.`,
    };
  }, [readinessData]);

  const Icon = timeInfo.icon;

  // Styles
  const cardClasses = isDark 
    ? 'bg-slate-900/60 backdrop-blur-xl border-white/10 text-white' 
    : 'bg-white/80 backdrop-blur-xl border-slate-200/60 text-slate-800';

  const btnBaseClass = `p-2 rounded-lg border transition-all flex items-center gap-2 text-sm font-medium ${
    isDark 
      ? 'hover:bg-white/10 text-slate-400 hover:text-white border-white/5 bg-slate-800/50' 
      : 'hover:bg-slate-100 text-slate-500 hover:text-slate-900 border-slate-200 bg-white'
  }`;

  const modalOverlayClass = "fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6";
  const modalBackdropClass = "absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity";
  
  const modalContentClass = `relative rounded-2xl shadow-2xl flex flex-col max-h-[85vh] ${
    isDark 
      ? 'bg-slate-900 border border-white/10 text-white' 
      : 'bg-white border border-slate-100 text-slate-900'
  }`;

  return (
    <>
      <div className={`rounded-2xl p-0 border shadow-sm mb-8 relative overflow-hidden group transition-all duration-500 ${cardClasses}`}>
        {/* Decorative Background Element */}
        <div className={`absolute -top-24 -right-24 w-96 h-96 rounded-full opacity-20 blur-3xl pointer-events-none transition-colors duration-1000 ${isDark ? 'bg-blue-600' : 'bg-blue-400'}`}></div>
        <div className={`absolute -bottom-24 -left-24 w-80 h-80 rounded-full opacity-20 blur-3xl pointer-events-none transition-colors duration-1000 ${isDark ? 'bg-indigo-600' : 'bg-indigo-300'}`}></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-stretch">
          
          {/* LEFT: Greeting & Context */}
          <div className="flex-1 p-6 md:p-8 flex flex-col justify-center">
             <div className="flex items-center gap-3 mb-2 opacity-80">
                <Calendar size={14} className={isDark ? 'text-blue-400' : 'text-blue-600'} />
                <span className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-300' : 'text-slate-500'}`}>
                  {timeInfo.date}
                </span>
             </div>
             
             <div className="flex items-center gap-4 mb-1">
               <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
                 {timeInfo.greeting}, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-indigo-500">{userName}</span>
               </h1>
               <div className={`hidden md:flex p-2 rounded-full ${timeInfo.bg}`}>
                  <Icon size={20} className={timeInfo.color} />
               </div>
             </div>
             
             {showQuotes && (
               /* 2. FIXED: Removed 'opacity-0' and 'animate-in' so text is always visible */
               <div className="mt-4 flex items-start gap-2 max-w-lg">
                  <Quote size={14} className={`${isDark ? 'text-slate-500' : 'text-slate-400'} mt-0.5 flex-shrink-0`} />
                  <p className={`text-sm italic ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{quote}</p>
               </div>
             )}
          </div>

          {/* DIVIDER */}
          <div className={`hidden md:block w-px my-6 ${isDark ? 'bg-white/10' : 'bg-slate-200'}`}></div>

          {/* RIGHT: Daily Briefing & Actions */}
          <div className={`p-6 md:p-8 md:w-[420px] flex flex-col justify-between ${isDark ? 'bg-black/10' : 'bg-slate-50/50'}`}>
              
              <div className="mb-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className={`text-sm font-bold uppercase tracking-wider flex items-center gap-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    <Bell size={14} /> Daily Briefing
                  </h3>
                  
                  {/* TWO SEPARATE BUTTONS */}
                  <div className="flex items-center gap-2">
                    <button 
                       onClick={() => setActiveModal('appearance')}
                       className={btnBaseClass}
                       title="Theme & Background"
                    >
                       <Palette size={16} />
                       <span className="sr-only sm:not-sr-only sm:text-xs">Theme</span>
                    </button>
                    <button 
                       onClick={() => setActiveModal('settings')}
                       className={btnBaseClass}
                       title="Dashboard Settings"
                    >
                       <Settings2 size={16} />
                       <span className="sr-only sm:not-sr-only sm:text-xs">View</span>
                    </button>
                  </div>
                </div>

                <div className={`p-4 rounded-xl border flex items-start gap-3 transition-colors ${
                  briefing.type === 'alert' 
                    ? (isDark ? 'bg-rose-500/10 border-rose-500/20' : 'bg-rose-50 border-rose-100') 
                    : briefing.type === 'success'
                    ? (isDark ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-emerald-50 border-emerald-100')
                    : (isDark ? 'bg-blue-500/10 border-blue-500/20' : 'bg-blue-50 border-blue-100')
                }`}>
                   <div className={`mt-0.5 ${
                     briefing.type === 'alert' ? 'text-rose-500' : briefing.type === 'success' ? 'text-emerald-500' : 'text-blue-500'
                   }`}>
                     {briefing.type === 'alert' ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
                   </div>
                   <div>
                     <p className={`text-sm font-medium leading-relaxed ${
                       briefing.type === 'alert' 
                         ? (isDark ? 'text-rose-200' : 'text-rose-700') 
                         : briefing.type === 'success'
                         ? (isDark ? 'text-emerald-200' : 'text-emerald-700')
                         : (isDark ? 'text-blue-200' : 'text-blue-700')
                     }`}>
                       {briefing.message}
                     </p>
                   </div>
                </div>
              </div>

          </div>
        </div>
      </div>

      {/* =========================================================
          MODAL 1: APPEARANCE (FORCED WIDE)
         ========================================================= */}
      {activeModal === 'appearance' && (
        <div className={modalOverlayClass}>
          <div className={modalBackdropClass} onClick={() => setActiveModal('none')}></div>
          
          <div className={`${modalContentClass} w-full md:w-[900px] max-w-[95vw]`}>
            
            {/* Header - Sticky */}
            <div className={`p-5 px-8 border-b flex items-center justify-between shrink-0 ${isDark ? 'bg-slate-900 border-white/10' : 'bg-slate-50/80 border-slate-100'}`}>
              <div>
                <h3 className={`text-xl font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-800'}`}>
                  <Palette size={20} className="text-blue-600" />
                  Visual Appearance
                </h3>
                <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Customize your workspace environment</p>
              </div>
              <button onClick={() => setActiveModal('none')} className={`p-2 rounded-full transition-colors ${isDark ? 'hover:bg-white/10 text-slate-400 hover:text-white' : 'hover:bg-slate-200 text-slate-500 hover:text-slate-900'}`}>
                <X size={20} />
              </button>
            </div>
            
            {/* Scrollable Content Area */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
              
              {/* SECTION 1: Backgrounds */}
              <div className="mb-10">
                  <div className="flex items-center justify-between mb-4">
                     <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                        <ImageIcon size={14} /> Background Atmosphere
                     </h4>
                     <span className={`text-xs px-2 py-0.5 rounded-full ${isDark ? 'bg-white/10 text-slate-300' : 'bg-slate-100 text-slate-500'}`}>
                        {BACKGROUNDS.length} Presets
                     </span>
                  </div>
                  
                  {/* Grid forced to 4 columns on MD and up */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                     {BACKGROUNDS.map(bg => {
                       const isActive = currentBackground.id === bg.id;
                       return (
                         <button
                           key={bg.id}
                           onClick={() => onBackgroundChange(bg)}
                           className={`group relative overflow-hidden rounded-xl border aspect-video transition-all duration-200 ${
                             isActive 
                               ? 'border-blue-500 ring-2 ring-blue-500/20 shadow-lg scale-[1.02]' 
                               : (isDark ? 'border-white/10 hover:border-white/30 opacity-80 hover:opacity-100' : 'border-slate-200 hover:border-blue-400 shadow-sm hover:shadow-md')
                           }`}
                         >
                           <div className={`absolute inset-0 w-full h-full ${bg.className} transition-transform duration-700 group-hover:scale-110`}></div>
                           {isActive && (
                             <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-[1px]">
                               <div className="bg-white rounded-full p-1.5 shadow-xl">
                                 <Check size={16} className="text-blue-600" />
                               </div>
                             </div>
                           )}
                           <div className="absolute bottom-0 left-0 w-full p-3 bg-gradient-to-t from-black/80 via-black/40 to-transparent text-left">
                               <span className="text-xs font-bold text-white shadow-sm tracking-wide">{bg.name}</span>
                           </div>
                         </button>
                       );
                     })}
                  </div>
              </div>

              <hr className={`my-8 ${isDark ? 'border-white/10' : 'border-slate-100'}`} />

              {/* SECTION 2: Themes */}
              <div>
                <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                   <Monitor size={14} /> Accent Theme
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                   {THEMES.map(theme => {
                     const isActive = currentTheme.id === theme.id;
                     return (
                       <button
                         key={theme.id}
                         onClick={() => onThemeChange(theme)}
                         className={`flex items-center justify-between p-4 rounded-xl border transition-all duration-200 ${
                             isActive 
                             ? 'border-blue-500 bg-blue-500/10 ring-1 ring-blue-500/20 shadow-md' 
                             : (isDark ? 'border-white/10 hover:border-white/30 hover:bg-white/5' : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50')
                         }`}
                       >
                          <div className="flex items-center gap-4">
                             <div className="flex -space-x-2">
                                <div className="w-6 h-6 rounded-full ring-2 ring-white dark:ring-slate-800 shadow-sm" style={{ backgroundColor: theme.ranges[0].color }}></div>
                                <div className="w-6 h-6 rounded-full ring-2 ring-white dark:ring-slate-800 shadow-sm" style={{ backgroundColor: theme.ranges[2].color }}></div>
                                <div className="w-6 h-6 rounded-full ring-2 ring-white dark:ring-slate-800 shadow-sm" style={{ backgroundColor: theme.ranges[4].color }}></div>
                             </div>
                             <div className="text-left">
                               <span className={`block font-bold text-sm ${isActive ? 'text-blue-500' : (isDark ? 'text-slate-200' : 'text-slate-700')}`}>
                                  {theme.name}
                               </span>
                               <span className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Professional Palette</span>
                             </div>
                          </div>
                          {isActive && <div className="bg-blue-600 text-white p-1 rounded-full"><Check size={14} /></div>}
                       </button>
                     );
                   })}
                </div>
              </div>
            </div>

            {/* Footer - Sticky */}
            <div className={`p-5 border-t flex justify-end shrink-0 ${isDark ? 'bg-slate-900 border-white/10' : 'bg-slate-50/80 border-slate-100'}`}>
                <button 
                  onClick={() => setActiveModal('none')}
                  className={`px-6 py-2.5 rounded-xl font-semibold transition-transform active:scale-95 text-sm shadow-lg ${isDark ? 'bg-white text-slate-900 hover:bg-slate-200' : 'bg-slate-900 text-white hover:bg-slate-800'}`}
                >
                  Apply Changes
                </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          MODAL 2: SETTINGS (Standard Width)
         ========================================================= */}
      {activeModal === 'settings' && (
        <div className={modalOverlayClass}>
          <div className={modalBackdropClass} onClick={() => setActiveModal('none')}></div>
          
          <div className={`${modalContentClass} w-full max-w-xl`}>
            
            <div className={`p-5 px-8 border-b flex items-center justify-between shrink-0 ${isDark ? 'bg-slate-900 border-white/10' : 'bg-slate-50/80 border-slate-100'}`}>
              <div>
                <h3 className={`text-xl font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-800'}`}>
                  <Settings2 size={20} className="text-blue-600" />
                  Dashboard View
                </h3>
              </div>
              <button onClick={() => setActiveModal('none')} className={`p-2 rounded-full transition-colors ${isDark ? 'hover:bg-white/10 text-slate-400 hover:text-white' : 'hover:bg-slate-200 text-slate-500 hover:text-slate-900'}`}>
                <X size={20} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
              
              {/* Layout Section */}
              <div className="mb-8">
                  <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Content Layout</h4>
                  <div className="grid grid-cols-2 gap-4">
                     <button 
                        onClick={() => onLayoutChange('grid')}
                        className={`relative overflow-hidden flex flex-col items-center justify-center gap-3 p-6 rounded-2xl border-2 transition-all ${
                          layoutMode === 'grid' 
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600' 
                          : (isDark ? 'border-white/5 hover:border-white/20 bg-white/5 text-slate-400' : 'border-slate-100 hover:border-slate-300 bg-slate-50 text-slate-600')
                        }`}
                     >
                        <div className="p-3 bg-white dark:bg-slate-800 rounded-full shadow-sm">
                           <LayoutGrid size={24} />
                        </div>
                        <span className="font-bold text-sm">Grid Cards</span>
                        {layoutMode === 'grid' && <div className="absolute top-3 right-3 text-blue-500"><CheckCircle2 size={18} /></div>}
                     </button>
                     <button 
                        onClick={() => onLayoutChange('list')}
                        className={`relative overflow-hidden flex flex-col items-center justify-center gap-3 p-6 rounded-2xl border-2 transition-all ${
                          layoutMode === 'list' 
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600' 
                          : (isDark ? 'border-white/5 hover:border-white/20 bg-white/5 text-slate-400' : 'border-slate-100 hover:border-slate-300 bg-slate-50 text-slate-600')
                        }`}
                     >
                        <div className="p-3 bg-white dark:bg-slate-800 rounded-full shadow-sm">
                           <List size={24} />
                        </div>
                        <span className="font-bold text-sm">List Rows</span>
                        {layoutMode === 'list' && <div className="absolute top-3 right-3 text-blue-500"><CheckCircle2 size={18} /></div>}
                     </button>
                  </div>
              </div>

              <hr className={`my-8 ${isDark ? 'border-white/10' : 'border-slate-100'}`} />

              {/* Visibility Options */}
              <div>
                  <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Widget Visibility</h4>
                  <div className="space-y-3">
                      {[
                        { label: 'Key Statistics', sub: 'Show top level metrics', checked: showStats, onChange: onToggleStats, icon: PanelTop },
                        { label: 'Performance Chart', sub: 'Show readiness graph', checked: showChart, onChange: onToggleChart, icon: BarChart3 },
                        { label: 'Inspirational Quotes', sub: 'Show daily motivation', checked: showQuotes, onChange: onToggleQuotes, icon: Quote },
                      ].map((opt, i) => (
                        <label key={i} className={`flex items-center justify-between p-4 rounded-xl border transition-colors cursor-pointer group ${isDark ? 'border-white/5 hover:bg-white/5' : 'border-slate-100 hover:bg-white hover:shadow-sm'}`}>
                           <div className="flex items-center gap-4">
                               <div className={`p-2.5 rounded-lg transition-all ${isDark ? 'bg-white/5 text-slate-300 group-hover:text-white' : 'bg-slate-100 text-slate-500 group-hover:text-blue-600 group-hover:bg-blue-50'}`}>
                                   <opt.icon size={20} />
                               </div>
                               <div>
                                  <span className={`block font-bold text-sm ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>{opt.label}</span>
                                  <span className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{opt.sub}</span>
                               </div>
                           </div>
                           
                           {/* Custom Switch UI */}
                           <div className={`w-12 h-7 rounded-full transition-colors flex items-center px-1 ${opt.checked ? 'bg-blue-600' : (isDark ? 'bg-slate-700' : 'bg-slate-200')}`}>
                              <div className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${opt.checked ? 'translate-x-5' : 'translate-x-0'}`}></div>
                           </div>
                           <input type="checkbox" checked={opt.checked} onChange={e => opt.onChange(e.target.checked)} className="hidden" />
                        </label>
                      ))}
                  </div>
              </div>
            </div>

            <div className={`p-5 border-t flex justify-end shrink-0 ${isDark ? 'bg-slate-900 border-white/10' : 'bg-slate-50/80 border-slate-100'}`}>
                <button 
                  onClick={() => setActiveModal('none')}
                  className={`px-6 py-2.5 rounded-xl font-semibold transition-transform active:scale-95 text-sm shadow-lg ${isDark ? 'bg-white text-slate-900 hover:bg-slate-200' : 'bg-slate-900 text-white hover:bg-slate-800'}`}
                >
                  Done
                </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
