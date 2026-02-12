import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { processAllData } from './services/calculator';
import { MOCK_SHEET_A_TASKS, MOCK_SHEET_B_ROWS } from './services/mockData';
import { fetchRealData } from './services/api';
import { ReadinessScoreDetails, Theme, LayoutMode, BackgroundTheme } from './types';
import { ScoreCard } from './components/ScoreCard';
import { TaskModal } from './components/TaskModal';
import { WelcomeCard } from './components/WelcomeCard';
import { Onboarding } from './components/Onboarding';
import { AppearanceMenu } from './components/AppearanceMenu'; // <--- NEW IMPORT
import { THEMES, BACKGROUNDS, getThemeColor } from './services/theme';
import { 
  BarChart3, 
  AlertCircle,
  CheckCircle,
  Wifi,
  WifiOff,
  RefreshCw,
  LogOut
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell 
} from 'recharts';

function AppContent() {
  const [readinessData, setReadinessData] = useState<ReadinessScoreDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [usingRealData, setUsingRealData] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState<ReadinessScoreDetails | null>(null);
   
  // User Preferences State
  const [userName, setUserName] = useState<string | null>(null);
  const [currentTheme, setCurrentTheme] = useState<Theme>(THEMES[0]);
  const [showQuotes, setShowQuotes] = useState(true);
   
  // UI Customization State
  const [layoutMode, setLayoutMode] = useState<LayoutMode>('grid');
  const [showChart, setShowChart] = useState(true);
  const [showStats, setShowStats] = useState(true);
  const [currentBackground, setCurrentBackground] = useState<BackgroundTheme>(BACKGROUNDS[0]);

  const [hasCheckedOnboarding, setHasCheckedOnboarding] = useState(false);

  // Initialize from LocalStorage
  useEffect(() => {
    const storedName = localStorage.getItem('erpUserName');
    const storedThemeId = localStorage.getItem('erpThemeId');
    const storedShowQuotes = localStorage.getItem('erpShowQuotes');
    const storedLayout = localStorage.getItem('erpLayoutMode');
    const storedShowChart = localStorage.getItem('erpShowChart');
    const storedShowStats = localStorage.getItem('erpShowStats');
    const storedBackgroundId = localStorage.getItem('erpBackgroundId');
    
    if (storedName) setUserName(storedName);
    
    if (storedThemeId) {
      const savedTheme = THEMES.find(t => t.id === storedThemeId);
      if (savedTheme) setCurrentTheme(savedTheme);
    }

    if (storedShowQuotes !== null) setShowQuotes(storedShowQuotes === 'true');
    if (storedLayout) setLayoutMode(storedLayout as LayoutMode);
    if (storedShowChart !== null) setShowChart(storedShowChart === 'true');
    if (storedShowStats !== null) setShowStats(storedShowStats === 'true');
    
    if (storedBackgroundId) {
       const savedBg = BACKGROUNDS.find(b => b.id === storedBackgroundId);
       if (savedBg) setCurrentBackground(savedBg);
    }
    
    setHasCheckedOnboarding(true);
  }, []);

  // Handlers for Persistence
  const handleOnboardingComplete = (name: string, theme: Theme, background: BackgroundTheme) => {
    localStorage.setItem('erpUserName', name);
    localStorage.setItem('erpThemeId', theme.id);
    localStorage.setItem('erpBackgroundId', background.id);
    setUserName(name);
    setCurrentTheme(theme);
    setCurrentBackground(background);
  };

  const handleThemeChange = (theme: Theme) => {
    setCurrentTheme(theme);
    localStorage.setItem('erpThemeId', theme.id);
  };

  const handleToggleQuotes = (show: boolean) => {
    setShowQuotes(show);
    localStorage.setItem('erpShowQuotes', String(show));
  };

  const handleLayoutChange = (mode: LayoutMode) => {
    setLayoutMode(mode);
    localStorage.setItem('erpLayoutMode', mode);
  };

  const handleToggleChart = (show: boolean) => {
    setShowChart(show);
    localStorage.setItem('erpShowChart', String(show));
  };

  const handleToggleStats = (show: boolean) => {
    setShowStats(show);
    localStorage.setItem('erpShowStats', String(show));
  };

  const handleBackgroundChange = (bg: BackgroundTheme) => {
       setCurrentBackground(bg);
       localStorage.setItem('erpBackgroundId', bg.id);
  };

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to reset your profile?")) {
      localStorage.clear();
      window.location.reload();
    }
  };

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const { vendorData, rows } = await fetchRealData();
      if (rows.length > 0) {
        const results = processAllData(vendorData, rows);
        setReadinessData(results);
        setUsingRealData(true);
      } else {
        throw new Error("Empty data received");
      }
    } catch (error) {
      console.warn("Using fallback data due to fetch error:", error);
      const mockVendorData = {
        tasks: MOCK_SHEET_A_TASKS, 
        departmentStats: [], 
        overallProgress: 0
      };
      
      const statsMap = new Map<string, any>();
      MOCK_SHEET_A_TASKS.forEach(t => {
         if(!statsMap.has(t.department)) statsMap.set(t.department, { departmentName: t.department, totalTasks: 0, completedTasks: 0, percentage: 0 });
         const s = statsMap.get(t.department);
         s.totalTasks++;
         if(t.status === 'Done') s.completedTasks++;
         s.percentage = s.completedTasks / s.totalTasks;
      });
      mockVendorData.departmentStats = Array.from(statsMap.values());

      const results = processAllData(mockVendorData, MOCK_SHEET_B_ROWS);
      setReadinessData(results);
      setUsingRealData(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (userName) {
      loadData();
    }
  }, [loadData, userName]);

  const stats = useMemo(() => {
    if (!readinessData.length) return { avg: 0, ready: 0, overdue: 0 };
    const avg = readinessData.reduce((acc, curr) => acc + curr.totalScore, 0) / readinessData.length;
    const ready = readinessData.filter(d => d.totalScore >= 0.8).length;
    const overdue = readinessData.reduce((acc, curr) => {
      const deptOverdue = curr.vendorTasks.filter(t => t.isOverdue).length;
      return acc + deptOverdue;
    }, 0);
    return { avg, ready, overdue };
  }, [readinessData]);

  // Derived Classes for Light/Dark mode adaptation
  const isDark = currentBackground.isDark;
  
  const textClasses = {
      primary: isDark ? 'text-white' : 'text-slate-900',
      secondary: isDark ? 'text-slate-300' : 'text-slate-500',
      muted: isDark ? 'text-slate-400' : 'text-slate-400',
      heading: isDark ? 'text-white' : 'text-slate-800'
  };

  const headerClasses = isDark 
      ? 'bg-slate-900/20 border-white/10 backdrop-blur-xl' 
      : 'bg-white/50 border-slate-200/50 backdrop-blur-xl';

  const footerClasses = isDark
      ? 'bg-slate-900/20 border-white/10 backdrop-blur-sm'
      : 'bg-white/50 border-slate-200/50 backdrop-blur-sm';

  const cardDarkClasses = 'bg-slate-900/70 backdrop-blur-md border-white/10';
  const cardLightClasses = 'bg-white border-slate-100 shadow-sm';

  if (!hasCheckedOnboarding) return null;

  if (!userName) {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  if (loading && readinessData.length === 0) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${currentBackground.className}`}>
        <div className="animate-pulse flex flex-col items-center p-8 bg-white/90 rounded-2xl backdrop-blur-sm shadow-xl">
          <div className="h-12 w-12 bg-blue-600 rounded-full mb-4 animate-bounce"></div>
          <h2 className="text-slate-500 font-medium">Syncing with Google Sheets...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex flex-col font-sans selection:bg-blue-100 transition-colors duration-500 ${currentBackground.className}`}>
      {/* Header */}
      <header className={`sticky top-0 z-30 shadow-sm transition-all duration-500 border-b ${headerClasses}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-5">
            <div className="flex-shrink-0">
               <img 
                 src="https://static.wixstatic.com/media/756a6a_da52fb55ba344f6382055c1308c97eba~mv2.png" 
                 alt="Company Logo" 
                 className="h-12 w-12 object-contain rounded-md bg-white p-0.5 shadow-sm" 
               />
            </div>
            <div className={`h-10 w-px hidden sm:block ${isDark ? 'bg-white/20' : 'bg-slate-200'}`}></div>
            <div className="hidden sm:block">
               <h1 className={`text-2xl font-bold tracking-tight leading-none ${textClasses.primary}`}>
                 ERP Tracker <span className={`${textClasses.muted} font-light`}>v2.0</span>
               </h1>
               <p className={`text-sm mt-1.5 font-medium flex items-center gap-1.5 ${textClasses.secondary}`}>
                 Implementation Dashboard <span className={`${isDark ? 'text-slate-600' : 'text-slate-300'}`}>•</span> Part of <span className="text-indigo-500 font-bold">(MG Tools)</span>
               </p>
            </div>
            <div className="sm:hidden">
               <h1 className={`text-xl font-bold ${textClasses.primary}`}>ERP Tracker</h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
             <div className={`hidden sm:flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-full backdrop-blur-md ${isDark ? 'bg-white/10 text-slate-200 border border-white/10' : 'bg-white/60 text-slate-600 border border-slate-200'}`}>
                {usingRealData ? (
                  <>
                    <Wifi size={14} className="text-emerald-500" />
                    <span>Live Data</span>
                  </>
                ) : (
                  <>
                    <WifiOff size={14} className="text-amber-500" />
                    <span>Offline Mode</span>
                  </>
                )}
             </div>
             
             {/* NEW: Appearance Menu Button */}
             <AppearanceMenu 
                currentTheme={currentTheme}
                onThemeChange={handleThemeChange}
                currentBackground={currentBackground}
                onBackgroundChange={handleBackgroundChange}
                isDark={isDark}
             />

             <button 
                onClick={loadData}
                disabled={loading}
                className={`p-2 rounded-lg transition-all backdrop-blur-md border ${isDark ? 'text-slate-300 hover:text-blue-400 hover:bg-white/10 border-white/5' : 'text-slate-500 hover:text-blue-600 hover:bg-white border-transparent shadow-sm'} ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                title="Refresh Data"
             >
                <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
             </button>

             <button
                onClick={handleLogout}
                className={`p-2 rounded-lg transition-all ml-1 backdrop-blur-md border ${isDark ? 'text-slate-300 hover:text-rose-400 hover:bg-white/10 border-white/5' : 'text-slate-400 hover:text-rose-600 hover:bg-white border-transparent shadow-sm'} ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                title="Reset Profile"
             >
                <LogOut size={20} />
             </button>
          </div>
        </div>
      </header>

      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        
        {/* WELCOME SECTION - Removed Theme/Background props */}
        <WelcomeCard 
          userName={userName || 'User'} 
          readinessData={readinessData}
          showQuotes={showQuotes}
          onToggleQuotes={handleToggleQuotes}
          layoutMode={layoutMode}
          onLayoutChange={handleLayoutChange}
          showChart={showChart}
          onToggleChart={handleToggleChart}
          showStats={showStats}
          onToggleStats={handleToggleStats}
          // Removed: currentTheme, onThemeChange, currentBackground, onBackgroundChange
        />

        {/* TOP STATS */}
        {showStats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
            {/* Avg Readiness */}
            <div className={`p-6 rounded-2xl border transition-all hover:shadow-md ${isDark ? cardDarkClasses : cardLightClasses}`}>
              <div className="flex justify-between items-start">
                <div>
                  <p className={`text-sm font-semibold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-400'}`}>Avg Readiness</p>
                  <p className={`text-3xl font-extrabold mt-2 ${textClasses.primary}`}>
                    {Math.round(stats.avg * 100)}%
                  </p>
                </div>
                <div className={`p-3 rounded-xl ${isDark ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-50 text-blue-600'}`}>
                  <BarChart3 size={24} />
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2">
                 <div className={`text-xs font-bold px-2 py-0.5 rounded-full ${isDark ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-100 text-emerald-700'}`}>
                   +2.4%
                 </div>
                 <span className={`text-xs ${textClasses.secondary}`}>from last week</span>
              </div>
            </div>

            {/* Departments Ready */}
            <div className={`p-6 rounded-2xl border transition-all hover:shadow-md ${isDark ? cardDarkClasses : cardLightClasses}`}>
              <div className="flex justify-between items-start">
                <div>
                  <p className={`text-sm font-semibold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-400'}`}>Departments Ready</p>
                  <p className={`text-3xl font-extrabold mt-2 ${textClasses.primary}`}>
                    {stats.ready} <span className={`text-lg font-normal ${textClasses.secondary}`}>/ {readinessData.length}</span>
                  </p>
                </div>
                <div className={`p-3 rounded-xl ${isDark ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-50 text-emerald-600'}`}>
                  <CheckCircle size={24} />
                </div>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-1.5 mt-6 dark:bg-white/10">
                <div className="bg-emerald-500 h-1.5 rounded-full transition-all duration-1000" style={{ width: `${(stats.ready / readinessData.length) * 100}%` }}></div>
              </div>
            </div>

            {/* Overdue Tasks */}
            <div className={`p-6 rounded-2xl border transition-all hover:shadow-md ${isDark ? cardDarkClasses : cardLightClasses}`}>
              <div className="flex justify-between items-start">
                <div>
                  <p className={`text-sm font-semibold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-400'}`}>Overdue Tasks</p>
                  <p className={`text-3xl font-extrabold mt-2 ${stats.overdue > 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
                    {stats.overdue}
                  </p>
                </div>
                <div className={`p-3 rounded-xl ${stats.overdue > 0 ? (isDark ? 'bg-rose-500/20 text-rose-400' : 'bg-rose-50 text-rose-600') : (isDark ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-50 text-emerald-600')}`}>
                  <AlertCircle size={24} />
                </div>
              </div>
              <p className={`text-xs mt-4 font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                {stats.overdue > 0 ? "Requires immediate attention" : "All clear, great job!"}
              </p>
            </div>
          </div>
        )}

        {/* ANALYTICS CHART */}
        {showChart && readinessData.length > 0 && (
          <div className={`mb-8 p-6 rounded-2xl border transition-all shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200 ${isDark ? cardDarkClasses : cardLightClasses}`}>
             <div className="flex justify-between items-end mb-6">
                <div>
                   <h3 className={`text-lg font-bold ${textClasses.primary}`}>Readiness Overview</h3>
                   <p className={`text-sm ${textClasses.secondary}`}>Comparison across all departments</p>
                </div>
             </div>
             
             <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                   <BarChart data={readinessData.map(d => ({ name: d.department, score: d.totalScore }))} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? "rgba(255,255,255,0.1)" : "#e2e8f0"} />
                      <XAxis 
                        dataKey="name" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: isDark ? '#94a3b8' : '#64748b', fontSize: 12, fontWeight: 500 }} 
                        dy={10} 
                      />
                      <YAxis 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: isDark ? '#94a3b8' : '#64748b', fontSize: 12 }} 
                        tickFormatter={(val) => `${Math.round(val * 100)}%`} 
                      />
                      <Tooltip 
                        cursor={{ fill: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }}
                        contentStyle={{ 
                           borderRadius: '12px', 
                           border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #e2e8f0', 
                           boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                           backgroundColor: isDark ? '#0f172a' : '#ffffff',
                           color: isDark ? '#f8fafc' : '#0f172a'
                        }}
                        formatter={(value: number) => [`${Math.round(value * 100)}%`, 'Readiness']}
                      />
                      <Bar dataKey="score" radius={[4, 4, 0, 0]}>
                        {readinessData.map((entry, index) => (
                           <Cell key={`cell-${index}`} fill={getThemeColor(entry.totalScore, currentTheme)} />
                        ))}
                      </Bar>
                   </BarChart>
                </ResponsiveContainer>
             </div>
          </div>
        )}

        {/* DEPARTMENT GRID/LIST */}
        <div className="mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300">
           <div className="flex items-center justify-between mb-6">
              <h3 className={`text-xl font-bold ${textClasses.primary}`}>Department Detail</h3>
              <div className={`px-3 py-1 rounded-full text-xs font-semibold ${isDark ? 'bg-white/10 text-slate-300' : 'bg-slate-100 text-slate-500'}`}>
                 {readinessData.length} Departments
              </div>
           </div>
           
           <div className={`grid gap-6 ${layoutMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
              {readinessData.map((data) => (
                <ScoreCard 
                  key={data.department} 
                  data={data} 
                  onViewDetails={setSelectedDepartment} 
                  theme={currentTheme}
                  mode={layoutMode}
                  isDark={isDark}
                />
              ))}
           </div>
        </div>

      </main>

      {/* Footer */}
      <footer className={`border-t py-8 mt-auto ${footerClasses}`}>
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
           <p className={`text-sm font-medium ${textClasses.secondary}`}>
             © 2024 MG Tools. All rights reserved.
           </p>
           <div className="flex items-center gap-6">
              <a href="#" className={`text-sm font-medium hover:underline ${textClasses.secondary}`}>Documentation</a>
              <a href="#" className={`text-sm font-medium hover:underline ${textClasses.secondary}`}>Support</a>
              <div className="flex items-center gap-1.5 text-sm font-medium text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
                 <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                 System Operational
              </div>
           </div>
        </div>
      </footer>

      {/* MODAL */}
      {selectedDepartment && (
        <TaskModal 
          isOpen={!!selectedDepartment}
          onClose={() => setSelectedDepartment(null)}
          departmentName={selectedDepartment.department}
          tasks={selectedDepartment.vendorTasks}
          completedCount={selectedDepartment.vendorTasksCompleted}
          totalCount={selectedDepartment.vendorTasksTotal}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter basename="/ERP2">
      <AppContent />
    </BrowserRouter>
  );
}
