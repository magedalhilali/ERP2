import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { processAllData } from './services/calculator';
import { MOCK_SHEET_A_TASKS, MOCK_SHEET_B_ROWS } from './services/mockData';
import { fetchRealData } from './services/api';
import { ReadinessScoreDetails, Theme } from './types';
import { ScoreCard } from './components/ScoreCard';
import { TaskModal } from './components/TaskModal';
import { THEMES, getThemeColor } from './services/theme';
import { 
  LayoutDashboard, 
  BarChart3, 
  AlertCircle,
  CheckCircle,
  ArrowUpRight,
  Wifi,
  WifiOff,
  RefreshCw,
  Palette
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

function App() {
  const [readinessData, setReadinessData] = useState<ReadinessScoreDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [usingRealData, setUsingRealData] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState<ReadinessScoreDetails | null>(null);
  
  // Theme State
  const [currentTheme, setCurrentTheme] = useState<Theme>(THEMES[0]);
  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      // Attempt to fetch real data
      const { vendorData, rows } = await fetchRealData();
      
      // Basic validation
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
    loadData();
  }, [loadData]);

  const stats = useMemo(() => {
    if (!readinessData.length) return { avg: 0, ready: 0, overdue: 0 };
    const avg = readinessData.reduce((acc, curr) => acc + curr.totalScore, 0) / readinessData.length;
    const ready = readinessData.filter(d => d.totalScore >= 0.8).length;
    
    // Calculate total overdue tasks across all departments
    const overdue = readinessData.reduce((acc, curr) => {
      const deptOverdue = curr.vendorTasks.filter(t => t.isOverdue).length;
      return acc + deptOverdue;
    }, 0);

    return { avg, ready, overdue };
  }, [readinessData]);

  if (loading && readinessData.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-12 w-12 bg-blue-600 rounded-full mb-4 animate-bounce"></div>
          <h2 className="text-slate-500 font-medium">Syncing with Google Sheets...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-blue-100">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-5">
            {/* Logo Section - Replace src with your logo URL */}
            <div className="flex-shrink-0">
               <img 
                 src="https://static.wixstatic.com/media/756a6a_da52fb55ba344f6382055c1308c97eba~mv2.png" 
                 alt="Company Logo" 
                 className="h-12 w-12 object-contain rounded-md" 
               />
            </div>
            
            {/* Vertical Divider */}
            <div className="h-10 w-px bg-slate-200 hidden sm:block"></div>
            
            {/* Title Section */}
            <div className="hidden sm:block">
               <h1 className="text-2xl font-bold tracking-tight text-slate-900 leading-none">
                 ERP Tracker <span className="text-slate-400 font-light">v2.0</span>
               </h1>
               <p className="text-sm text-slate-500 mt-1.5 font-medium flex items-center gap-1.5">
                 Implementation Dashboard <span className="text-slate-300">•</span> Part of <span className="text-indigo-600 font-bold">(MG Tools)</span>
               </p>
            </div>
            {/* Mobile Title */}
            <div className="sm:hidden">
               <h1 className="text-xl font-bold text-slate-900">ERP Tracker</h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
             {/* Theme Selector */}
             <div className="relative">
                <button 
                  onClick={() => setIsThemeMenuOpen(!isThemeMenuOpen)}
                  className="p-2 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-slate-50 transition-all flex items-center gap-2"
                  title="Change Theme"
                >
                  <Palette size={20} />
                  <span className="text-sm font-medium hidden md:inline">{currentTheme.name}</span>
                </button>

                {isThemeMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setIsThemeMenuOpen(false)}></div>
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-100 py-2 z-20 animate-in fade-in slide-in-from-top-2">
                      {THEMES.map(theme => (
                        <button
                          key={theme.id}
                          onClick={() => { setCurrentTheme(theme); setIsThemeMenuOpen(false); }}
                          className={`w-full text-left px-4 py-2 text-sm flex items-center gap-2 hover:bg-slate-50 transition-colors ${currentTheme.id === theme.id ? 'text-blue-600 font-bold bg-blue-50' : 'text-slate-600'}`}
                        >
                          <div className="w-3 h-3 rounded-full" style={{ background: `linear-gradient(to right, ${theme.ranges[0].color}, ${theme.ranges[4].color})` }}></div>
                          {theme.name}
                        </button>
                      ))}
                    </div>
                  </>
                )}
             </div>

             <div className="h-6 w-px bg-slate-200 mx-1 hidden sm:block"></div>

             <div className="hidden sm:flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-full bg-slate-100 text-slate-600">
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
             
             <button 
                onClick={loadData}
                disabled={loading}
                className={`p-2 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-slate-50 transition-all ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                title="Refresh Data"
             >
                <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
             </button>
          </div>
        </div>
      </header>

      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        
        {/* Top Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm flex items-center justify-between group hover:border-blue-100 transition-colors">
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1 group-hover:text-blue-500 transition-colors">Overall Readiness</p>
              <h2 className="text-3xl font-extrabold text-slate-900">{Math.round(stats.avg * 100)}%</h2>
            </div>
            <div className="bg-blue-50 p-3 rounded-full group-hover:scale-110 transition-transform">
              <BarChart3 className="text-blue-600" size={24} />
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm flex items-center justify-between group hover:border-emerald-100 transition-colors">
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1 group-hover:text-emerald-500 transition-colors">Ready Departments</p>
              <h2 className="text-3xl font-extrabold text-emerald-600">{stats.ready}</h2>
            </div>
            <div className="bg-emerald-50 p-3 rounded-full group-hover:scale-110 transition-transform">
              <CheckCircle className="text-emerald-600" size={24} />
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm flex items-center justify-between group hover:border-rose-100 transition-colors">
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1 group-hover:text-rose-500 transition-colors">Tasks Overdue</p>
              <h2 className="text-3xl font-extrabold text-rose-600">{stats.overdue}</h2>
            </div>
            <div className="bg-rose-50 p-3 rounded-full group-hover:scale-110 transition-transform">
              <AlertCircle className="text-rose-600" size={24} />
            </div>
          </div>
        </div>

        {/* Chart Section */}
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm mb-10">
          <div className="flex items-center justify-between mb-6">
             <h3 className="text-lg font-bold text-slate-800">Department Overview</h3>
             <span className="text-sm text-slate-500 flex items-center gap-1">
               <ArrowUpRight size={14} /> Sorted by readiness
             </span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={readinessData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="department" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tickFormatter={(val) => `${val * 100}%`}
                  tick={{ fill: '#64748b', fontSize: 12 }} 
                />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  formatter={(value: number) => [`${Math.round(value * 100)}%`, 'Readiness']}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ color: '#1e293b', fontWeight: 600 }}
                />
                <Bar dataKey="totalScore" radius={[4, 4, 0, 0]} maxBarSize={60}>
                  {readinessData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={getThemeColor(entry.totalScore, currentTheme)} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Detailed Cards Grid */}
        <div className="flex items-center justify-between mb-6">
           <h3 className="text-lg font-bold text-slate-800">Department Details</h3>
           <div className="text-xs text-slate-400 font-medium bg-white px-3 py-1 rounded-full border border-slate-100 shadow-sm">
             Real-time Sync
           </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {readinessData.map((deptData) => (
            <ScoreCard 
              key={deptData.department} 
              data={deptData} 
              onViewDetails={setSelectedDepartment}
              theme={currentTheme}
            />
          ))}
        </div>

      </main>

      {/* Footer */}
      <footer className="py-8 bg-white border-t border-slate-200 mt-auto">
         <div className="max-w-7xl mx-auto px-4 text-center">
            <p className="text-sm text-slate-500 font-medium">
               ERP Implementation Tracker © 2026 
               <span className="mx-2 text-slate-300">•</span>
               Data synced from Google Sheets 
               <span className="mx-2 text-slate-300">•</span>
               Developed by <a href="https://magedalhilali.github.io/Portfolio/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 hover:underline transition-all font-semibold">Maged Al Hilali</a>
            </p>
         </div>
      </footer>

      {/* Task Modal */}
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

export default App;