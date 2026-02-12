import React from 'react';
import { ReadinessScoreDetails, Theme, LayoutMode } from '../types';
import { getThemeColor } from '../services/theme';
import { 
  Server, 
  Database, 
  CheckCircle2, 
  Presentation, 
  GraduationCap,
  Eye,
  CalendarClock,
  Flag,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';

interface ScoreCardProps {
  data: ReadinessScoreDetails;
  onViewDetails: (data: ReadinessScoreDetails) => void;
  theme: Theme;
  mode?: LayoutMode;
  isDark?: boolean;
}

const formatPercent = (val: number) => `${Math.round(val * 100)}%`;

// Generate a consistent unique color for a department string
const getDepartmentColor = (dept: string) => {
  const colors = [
    '#3b82f6', // Blue-500
    '#8b5cf6', // Violet-500
    '#ec4899', // Pink-500
    '#f59e0b', // Amber-500
    '#10b981', // Emerald-500
    '#06b6d4', // Cyan-500
    '#f43f5e', // Rose-500
    '#6366f1', // Indigo-500
    '#14b8a6', // Teal-500
    '#d946ef', // Fuchsia-500
  ];
  let hash = 0;
  for (let i = 0; i < dept.length; i++) {
    hash = dept.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

const ProgressBar = ({ value, color, isDark }: { value: number, color: string, isDark?: boolean }) => (
  <div className={`w-full rounded-full h-2 ${isDark ? 'bg-white/10' : 'bg-slate-100'}`}>
    <div 
      className="h-2 rounded-full transition-all duration-500" 
      style={{ width: `${value * 100}%`, backgroundColor: color }}
    />
  </div>
);

const MetricRow = ({ 
  icon: Icon, 
  label, 
  value, 
  isBinary,
  detailText,
  theme,
  isDark
}: { 
  icon: any, 
  label: string, 
  value: number, 
  isBinary?: boolean,
  detailText?: string,
  theme: Theme,
  isDark?: boolean
}) => {
  const isComplete = value >= 0.99;
  const activeColor = getThemeColor(value, theme);
  const iconColor = isComplete ? activeColor : (isDark ? '#64748b' : '#94a3b8'); // Slate-400 for inactive
  
  return (
    <div className={`flex items-center justify-between py-2 border-b last:border-0 ${isDark ? 'border-white/5' : 'border-slate-50'}`}>
      <div className={`flex items-center gap-3 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
        <Icon size={16} style={{ color: iconColor }} />
        <span className="text-sm font-medium">
          {label}
          {detailText && <span className={`text-xs ml-2 font-normal ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{detailText}</span>}
        </span>
      </div>
      <div className="flex items-center gap-3">
        {!isBinary && (
          <div className="w-16 hidden sm:block">
             <ProgressBar 
                value={value} 
                color={activeColor} 
                isDark={isDark}
             />
          </div>
        )}
        <span 
          className="text-sm font-bold"
          style={{ color: isComplete ? activeColor : (isDark ? '#64748b' : '#64748b') }}
        >
          {isBinary ? (isComplete ? 'Done' : 'Pending') : formatPercent(value)}
        </span>
      </div>
    </div>
  );
};

export const ScoreCard: React.FC<ScoreCardProps> = ({ data, onViewDetails, theme, mode = 'grid', isDark = false }) => {
  const mainColor = getThemeColor(data.totalScore, theme);
  const deptColor = getDepartmentColor(data.department);
  
  // Determine Status Label
  const hasOverdue = data.vendorTasks.some(t => t.isOverdue);
  let statusLabel = 'IN PROGRESS';
  
  if (data.totalScore >= 0.99) {
    statusLabel = 'READY';
  } else if (hasOverdue) {
    statusLabel = 'OVERDUE';
  }

  // Common Styles based on isDark
  const cardClasses = isDark 
     ? 'bg-slate-900/60 backdrop-blur-md border-white/10 text-white' 
     : 'bg-white border-slate-100 text-slate-900';
  
  const hoverBorder = isDark ? 'hover:border-white/20' : 'hover:border-blue-200';

  // --- LIST MODE RENDER ---
  if (mode === 'list') {
    return (
      <div 
        onClick={() => onViewDetails(data)}
        className={`group rounded-xl shadow-sm hover:shadow-md border transition-all duration-300 cursor-pointer flex items-center p-4 gap-6 ${cardClasses} ${hoverBorder}`}
      >
        {/* Department Color Strip */}
        <div className="w-1.5 h-12 rounded-full self-center" style={{ backgroundColor: deptColor }}></div>
        
        {/* Basic Info */}
        <div className="w-48 flex-shrink-0">
          <h3 className={`font-bold text-lg ${isDark ? 'text-white' : 'text-slate-800'}`}>{data.department}</h3>
          <div 
            className="inline-flex items-center gap-1.5 mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wide"
            style={{ 
              color: statusLabel === 'OVERDUE' ? '#ef4444' : mainColor, 
              backgroundColor: statusLabel === 'OVERDUE' ? (isDark ? '#450a0a' : '#fef2f2') : `${mainColor}10`,
              borderColor: statusLabel === 'OVERDUE' ? (isDark ? '#7f1d1d' : '#fecaca') : `${mainColor}30`
            }}
          >
            {statusLabel}
          </div>
        </div>

        {/* Progress Section */}
        <div className="flex-1 flex flex-col justify-center min-w-[200px]">
           <div className="flex justify-between text-xs mb-1.5">
              <span className={`${isDark ? 'text-slate-400' : 'text-slate-500'} font-medium`}>Implementation Readiness</span>
              <span className="font-bold" style={{color: mainColor}}>{Math.round(data.totalScore * 100)}%</span>
           </div>
           <div className={`h-2.5 w-full rounded-full overflow-hidden ${isDark ? 'bg-white/10' : 'bg-slate-100'}`}>
               <div className="h-full transition-all duration-1000" style={{ width: `${data.totalScore * 100}%`, backgroundColor: mainColor }} />
           </div>
        </div>

        {/* Mini Status Indicators (Hidden on small screens) */}
        <div className={`hidden xl:flex items-center gap-4 px-4 border-l h-10 ${isDark ? 'border-white/10 text-slate-500' : 'border-slate-100 text-slate-300'}`}>
           <div className="flex flex-col items-center gap-1" title="Devices">
              <Server size={14} className={data.deviceRatio >= 1 ? 'text-emerald-500' : ''} />
           </div>
           <div className="flex flex-col items-center gap-1" title="Master Data">
              <Database size={14} className={data.masterDataScore >= 1 ? 'text-emerald-500' : ''} />
           </div>
           <div className="flex flex-col items-center gap-1" title="Vendor Tasks">
              <CheckCircle2 size={14} className={data.vendorProgress >= 1 ? 'text-emerald-500' : ''} />
           </div>
           <div className="flex flex-col items-center gap-1" title="Training">
              <GraduationCap size={14} className={data.trainingScore >= 1 ? 'text-emerald-500' : ''} />
           </div>
        </div>

        {/* Action Icon */}
        <div className="pl-2">
           <div className={`p-2 rounded-full transition-colors ${isDark ? 'bg-white/5 group-hover:bg-white/10 text-slate-400 group-hover:text-blue-400' : 'bg-slate-50 group-hover:bg-blue-50 text-slate-400 group-hover:text-blue-600'}`}>
              <ChevronRight size={20} />
           </div>
        </div>
      </div>
    );
  }

  // --- GRID MODE RENDER (Default) ---
  return (
    <div 
      onClick={() => onViewDetails(data)}
      className={`group rounded-xl shadow-sm hover:shadow-md hover:ring-2 hover:ring-opacity-20 transition-all duration-300 overflow-hidden border flex flex-col h-full relative cursor-pointer ${cardClasses}`}
      style={{ 
        '--hover-color': mainColor,
        borderTopWidth: '4px',
        borderTopColor: deptColor
      } as React.CSSProperties}
    >
      <style>{`
        .group:hover { box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); }
        .group:hover { ring-color: ${mainColor}20; } /* 20 is hex alpha for ~12% */
      `}</style>

      {/* Top Section */}
      <div className="p-6 pb-4">
        <div className="flex justify-between items-start mb-4">
          <h3 className={`text-lg font-bold group-hover:text-[var(--hover-color)] transition-colors ${isDark ? 'text-white' : 'text-slate-800'}`} style={{ color: undefined }}>
            {data.department}
          </h3>
          
          <div className="relative h-6 min-w-[100px] flex justify-end">
            {/* Status Badge - Fades out on hover */}
            <div 
              className="absolute right-0 top-0 px-3 py-1 rounded-full text-xs font-bold transition-all duration-300 group-hover:opacity-0 group-hover:scale-95 origin-right border"
              style={{ 
                color: statusLabel === 'OVERDUE' ? '#ef4444' : mainColor, 
                backgroundColor: isDark ? (statusLabel === 'OVERDUE' ? '#450a0a' : '#00000000') : '#ffffff',
                borderColor: statusLabel === 'OVERDUE' ? (isDark ? '#7f1d1d' : '#fecaca') : `${mainColor}40`
              }}
            >
              {statusLabel}
            </div>

            {/* View Details Badge - Fades in on hover */}
            <div className={`absolute right-0 top-0 px-3 py-1 rounded-full text-xs font-bold opacity-0 scale-95 translate-y-1 group-hover:opacity-100 group-hover:scale-100 group-hover:translate-y-0 transition-all duration-300 flex items-center gap-1.5 shadow-sm origin-right ${isDark ? 'bg-white/10 text-slate-200' : 'bg-slate-100 text-slate-600'}`}>
              <Eye size={14} />
              View Details
            </div>
          </div>
        </div>

        <div className="flex items-end gap-2 mb-6">
          <span 
            className="text-4xl font-extrabold" 
            style={{ color: mainColor }}
          >
            {Math.round(data.totalScore * 100)}
          </span>
          <span className={`text-sm font-semibold mb-1.5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>% Readiness</span>
        </div>

        <div className={`w-full rounded-full h-3 mb-6 ${isDark ? 'bg-white/10' : 'bg-slate-100'}`}>
          <div 
            className="h-3 rounded-full transition-all duration-1000" 
            style={{ width: `${data.totalScore * 100}%`, backgroundColor: mainColor }}
          />
        </div>
      </div>

      {/* Metrics Section */}
      <div className={`p-6 pt-2 flex-1 border-t transition-colors ${isDark ? 'bg-slate-900/30 border-white/5 group-hover:bg-slate-900/50' : 'bg-slate-50/50 border-slate-100 group-hover:bg-slate-50'}`}>
        <div className="space-y-1">
          <MetricRow 
            icon={Server} 
            label="Device Install" 
            value={data.deviceRatio}
            detailText={`(${data.devicesInstalled}/${data.totalDevicesNeeded})`}
            theme={theme}
            isDark={isDark}
          />
          <MetricRow 
            icon={Database} 
            label="Master Data" 
            value={data.masterDataScore} 
            isBinary 
            theme={theme}
            isDark={isDark}
          />
          <MetricRow 
            icon={CheckCircle2} 
            label="Vendor Tasks" 
            value={data.vendorProgress} 
            detailText={data.vendorTasksTotal > 0 ? `(${data.vendorTasksCompleted}/${data.vendorTasksTotal})` : '(0/0)'}
            theme={theme}
            isDark={isDark}
          />
          <MetricRow 
            icon={Presentation} 
            label="Pre-Training" 
            value={data.preTrainingScore} 
            isBinary 
            theme={theme}
            isDark={isDark}
          />
          <MetricRow 
            icon={GraduationCap} 
            label="Staff Training" 
            value={data.trainingScore} 
            isBinary 
            theme={theme}
            isDark={isDark}
          />
          <MetricRow 
            icon={ShieldCheck} 
            label="User & Access" 
            value={data.userReadinessScore} 
            theme={theme}
            isDark={isDark}
          />
        </div>
      </div>

      {/* Date Footer - Reveal on Hover */}
      <div className={`px-6 grid grid-cols-2 gap-4 max-h-0 opacity-0 overflow-hidden transition-all duration-300 ease-out group-hover:max-h-24 group-hover:py-3 group-hover:opacity-100 group-hover:border-t ${isDark ? 'bg-slate-900 border-white/10' : 'bg-white border-slate-100'}`}>
        <div>
          <p className={`text-[10px] uppercase tracking-wider font-semibold ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Next Milestone</p>
          <p className={`text-xs font-medium flex items-center gap-1.5 mt-0.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
             <CalendarClock size={12} className="text-blue-500" />
             {data.nextMilestoneDate || 'N/A'}
          </p>
        </div>
        <div className="text-right">
          <p className={`text-[10px] uppercase tracking-wider font-semibold ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Est Completion</p>
          <p className={`text-xs font-medium flex items-center justify-end gap-1.5 mt-0.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
             <Flag size={12} className="text-emerald-500" />
             {data.estCompletionDate || 'N/A'}
          </p>
        </div>
      </div>
    </div>
  );
};