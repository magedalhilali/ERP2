import React, { useMemo, useState, useEffect } from 'react';
import { 
  Sun, Moon, Sunrise, Quote, Settings2, X, Check, 
  LayoutGrid, List, BarChart3, PanelTop, Image as ImageIcon,
  Calendar, Bell, CheckCircle2, AlertCircle, ArrowRight
} from 'lucide-react';
import { Theme, LayoutMode, BackgroundTheme, ReadinessScoreDetails } from '../types';
import { THEMES, BACKGROUNDS } from '../services/theme';

interface WelcomeCardProps {
  userName: string;
  readinessData: ReadinessScoreDetails[]; // Added for Daily Briefing
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

const QUOTES = [
  "Quality means doing it right when no one is looking.",
  "Productivity is never an accident. It is always the result of a commitment to excellence.",
  "The secret of getting ahead is getting started.",
  "Efficiency is doing things right; effectiveness is doing the right things.",
  "Success is the sum of small efforts, repeated day in and day out.",
  "Great things in business are never done by one person. They're done by a team.",
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
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const isDark = currentBackground.isDark;

  // Time & Date Logic
  const timeInfo = useMemo(() => {
    const now = new Date();
    const hour = now.getHours();
    
    // Format Date: "Wednesday, Oct 24"
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
        action: 'View Tasks'
      };
    }
    if (fullyReady === readinessData.length) {
      return { 
        type: 'success', 
        message: "All departments are fully ready for launch!",
        action: 'View Report'
      };
    }
    return { 
      type: 'info', 
      message: `${fullyReady} of ${readinessData.length} departments are fully ready.`,
      action: 'Check Status'
    };
  }, [readinessData]);

  const Icon = timeInfo.icon;

  // Dynamic Styles
  const cardClasses = isDark 
    ? 'bg-slate-900/60 backdrop-blur-xl border-white/10 text-white' 
    : 'bg-white/80 backdrop-blur-xl border-slate-200/60 text-slate-800';

  const settingsBtnClass = isDark
    ? 'hover:bg-white/10 text-slate-400 hover:text-white border-white/5'
    : 'hover:bg-slate-100 text-slate-500 hover:text-slate-900 border-slate-200';

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
               <div className="mt-4 flex items-start gap-2 max-w-lg opacity-0 animate-in fade-in slide-in-from-bottom-2 duration-700 delay-100">
                  <Quote size={14} className={`${isDark ? 'text-slate-500' : 'text-slate-400'} mt-0.5 flex-shrink-0`} />
                  <p className={`text-sm italic ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{quote}</p>
               </div>
             )}
          </div>

          {/* DIVIDER */}
          <div className={`hidden md:block w-px my-6 ${isDark ? 'bg-white/10' : 'bg-slate-200'}`}></div>

          {/* RIGHT: Daily Briefing & Actions */}
          <div className={`p-6 md:p-8 md:w-[400px] flex flex-col justify-between ${isDark ? 'bg-black/10' : 'bg-slate-50/50'}`}>
             
             {/* Briefing Card */}
             <div className="mb-4">
               <div className="flex items-center justify-between mb-3">
                 <h3 className={`text-sm font-bold uppercase tracking-wider flex items-center gap-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                   <Bell size={14} /> Daily Briefing
                 </h3>
                 <button 
                    onClick={() => setIsSettingsOpen(true)}
                    className={`p-1.5 rounded-lg border transition-all ${settingsBtnClass}`}
                    title="Customize"
                 >
                    <Settings2 size={16} />
                 </button>
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

      {/* Settings Modal */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" 
            onClick={() => setIsSettingsOpen(false)}
          ></div>
          <div className={`relative rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh] ${isDark ? 'bg-slate-900 border border-white/10 text-white' : 'bg-white text-slate-900'}`}>
            <div className={`p-6 border-b flex items-center justify-between shrink-0 ${isDark ? 'border-white/10' : 'border-slate-100'}`}>
              <h3 className={`text-lg font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-800'}`}>
                <Settings2 size={18} className="text-blue-600" />
                Dashboard Settings
              </h3>
              <button onClick={() => setIsSettingsOpen(false)} className={`text-slate-400 ${isDark ? 'hover:text-white' : 'hover:text-slate-600'}`}>
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 space-y-8 overflow-y-auto custom-scrollbar">
              
              {/* Background Style Section */}
              <div>
                 <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1">
                    <ImageIcon size={12} /> Background Style
                 </h4>
                 <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {BACKGROUNDS.map(bg => {
                      const isActive = currentBackground.id === bg.id;
                      const activeClass = isActive 
                        ? 'border-blue-500 ring-2 ring-blue-500/20' 
                        : (isDark ? 'border-white/10 hover:border-white/30' : 'border-slate-200 hover:border-blue-300');
                      
                      return (
                        <button
                          key={bg.id}
                          onClick={() => onBackgroundChange(bg)}
                          className={`group relative overflow-hidden rounded-xl border aspect-[1.5] transition-all ${activeClass}`}
                        >
                          {/* Background Preview */}
                          <div className={`absolute inset-0 w-full h-full ${bg.className}`}></div>
                          
                          {/* Checkmark overlay */}
                          {isActive && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-[1px]">
                              <div className="bg-white rounded-full p-1 shadow-sm">
                                <Check size={14} className="text-blue-600" />
                              </div>
                            </div>
                          )}

                          {/* Label */}
                          <div className="absolute bottom-0 left-0 w-full p-2 bg-gradient-to-t from-black/60 to-transparent text-left">
                              <span className="text-[10px] font-bold text-white shadow-sm">{bg.name}</span>
                          </div>
                        </button>
                      );
                    })}
                 </div>
              </div>

              <hr className={isDark ? 'border-white/10' : 'border-slate-100'} />

              {/* UI Layout Section */}
              <div>
                 <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">View Layout</h4>
                 <div className="grid grid-cols-2 gap-3">
                    <button 
                       onClick={() => onLayoutChange('grid')}
                       className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl border transition-all ${
                         layoutMode === 'grid' 
                         ? 'border-blue-500 bg-blue-500/10 text-blue-500 ring-1 ring-blue-500/20' 
                         : (isDark ? 'border-white/10 hover:bg-white/5 text-slate-400' : 'border-slate-200 hover:bg-slate-50 text-slate-600')
                       }`}
                    >
                       <LayoutGrid size={24} />
                       <span className="text-sm font-semibold">Grid View</span>
                    </button>
                    <button 
                       onClick={() => onLayoutChange('list')}
                       className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl border transition-all ${
                         layoutMode === 'list' 
                         ? 'border-blue-500 bg-blue-500/10 text-blue-500 ring-1 ring-blue-500/20' 
                         : (isDark ? 'border-white/10 hover:bg-white/5 text-slate-400' : 'border-slate-200 hover:bg-slate-50 text-slate-600')
                       }`}
                    >
                       <List size={24} />
                       <span className="text-sm font-semibold">List View</span>
                    </button>
                 </div>
              </div>

              {/* Visibility Options */}
              <div>
                 <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Visibility</h4>
                 <div className="space-y-3">
                     {[
                       { label: 'Top Statistics', checked: showStats, onChange: onToggleStats, icon: PanelTop },
                       { label: 'Analytics Chart', checked: showChart, onChange: onToggleChart, icon: BarChart3 },
                       { label: 'Daily Quotes', checked: showQuotes, onChange: onToggleQuotes, icon: Quote },
                     ].map((opt, i) => (
                       <label key={i} className={`flex items-center justify-between p-3 rounded-xl border transition-colors cursor-pointer group ${isDark ? 'border-white/10 hover:bg-white/5' : 'border-slate-100 hover:bg-slate-50'}`}>
                          <div className="flex items-center gap-3">
                              <div className={`p-2 rounded-lg transition-all ${isDark ? 'bg-white/5 text-slate-300 group-hover:bg-white/10' : 'bg-slate-100 text-slate-600 group-hover:bg-white group-hover:shadow-sm'}`}>
                                  <opt.icon size={18} />
                              </div>
                              <span className={`font-medium ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>{opt.label}</span>
                          </div>
                          <input type="checkbox" checked={opt.checked} onChange={e => opt.onChange(e.target.checked)} className="accent-blue-600 w-5 h-5" />
                       </label>
                     ))}
                 </div>
              </div>

              <hr className={isDark ? 'border-white/10' : 'border-slate-100'} />

              {/* Theme Selector */}
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Color Theme</h4>
                <div className="grid grid-cols-1 gap-2">
                   {THEMES.map(theme => {
                     const isActive = currentTheme.id === theme.id;
                     return (
                       <button
                          key={theme.id}
                          onClick={() => onThemeChange(theme)}
                          className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                              isActive 
                              ? 'border-blue-500 bg-blue-500/10 ring-1 ring-blue-500/20' 
                              : (isDark ? 'border-white/10 hover:border-white/30 hover:bg-white/5' : 'border-slate-100 hover:border-slate-300 hover:bg-slate-50')
                          }`}
                       >
                          <div className="flex items-center gap-3">
                             <div className="flex gap-1">
                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: theme.ranges[0].color }}></div>
                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: theme.ranges[2].color }}></div>
                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: theme.ranges[4].color }}></div>
                             </div>
                             <span className={`font-medium ${isActive ? 'text-blue-500' : (isDark ? 'text-slate-300' : 'text-slate-700')}`}>
                                {theme.name}
                             </span>
                          </div>
                          {isActive && <Check size={16} className="text-blue-600" />}
                       </button>
                     );
                   })}
                </div>
              </div>
            </div>

            <div className={`p-4 flex justify-end shrink-0 rounded-b-2xl ${isDark ? 'bg-white/5' : 'bg-slate-50'}`}>
                <button 
                  onClick={() => setIsSettingsOpen(false)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors text-sm ${isDark ? 'bg-white text-slate-900 hover:bg-slate-200' : 'bg-slate-900 text-white hover:bg-slate-800'}`}
                >
                  Close
                </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};