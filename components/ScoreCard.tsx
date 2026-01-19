import React from 'react';
import { ReadinessScoreDetails, Theme } from '../types';
import { getThemeColor } from '../services/theme';
import { 
  Server, 
  Database, 
  CheckCircle2, 
  Presentation, 
  GraduationCap,
  Eye,
  CalendarClock,
  Flag
} from 'lucide-react';

interface ScoreCardProps {
  data: ReadinessScoreDetails;
  onViewDetails: (data: ReadinessScoreDetails) => void;
  theme: Theme;
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

const ProgressBar = ({ value, color }: { value: number, color: string }) => (
  <div className="w-full bg-slate-100 rounded-full h-2">
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
  theme
}: { 
  icon: any, 
  label: string, 
  value: number, 
  isBinary?: boolean,
  detailText?: string,
  theme: Theme
}) => {
  const isComplete = value >= 0.99;
  const activeColor = getThemeColor(value, theme);
  const iconColor = isComplete ? activeColor : '#94a3b8'; // Slate-400 for inactive
  
  return (
    <div className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
      <div className="flex items-center gap-3 text-slate-600">
        <Icon size={16} style={{ color: iconColor }} />
        <span className="text-sm font-medium">
          {label}
          {detailText && <span className="text-xs text-slate-400 ml-2 font-normal">{detailText}</span>}
        </span>
      </div>
      <div className="flex items-center gap-3">
        {!isBinary && (
          <div className="w-16 hidden sm:block">
             <ProgressBar 
                value={value} 
                color={activeColor} 
             />
          </div>
        )}
        <span 
          className="text-sm font-bold"
          style={{ color: isComplete ? activeColor : '#64748b' }}
        >
          {isBinary ? (isComplete ? 'Done' : 'Pending') : formatPercent(value)}
        </span>
      </div>
    </div>
  );
};

export const ScoreCard: React.FC<ScoreCardProps> = ({ data, onViewDetails, theme }) => {
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

  return (
    <div 
      onClick={() => onViewDetails(data)}
      className="group bg-white rounded-xl shadow-sm hover:shadow-md hover:ring-2 hover:ring-opacity-20 transition-all duration-300 overflow-hidden border border-slate-100 flex flex-col h-full relative cursor-pointer"
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
          <h3 className="text-lg font-bold text-slate-800 group-hover:text-[var(--hover-color)] transition-colors" style={{ color: undefined }}>
            {data.department}
          </h3>
          
          <div className="relative h-6 min-w-[100px] flex justify-end">
            {/* Status Badge - Fades out on hover */}
            <div 
              className="absolute right-0 top-0 px-3 py-1 rounded-full text-xs font-bold transition-all duration-300 group-hover:opacity-0 group-hover:scale-95 origin-right border"
              style={{ 
                color: statusLabel === 'OVERDUE' ? '#ef4444' : mainColor, 
                backgroundColor: '#ffffff',
                borderColor: statusLabel === 'OVERDUE' ? '#fecaca' : `${mainColor}40`
              }}
            >
              {statusLabel}
            </div>

            {/* View Details Badge - Fades in on hover */}
            <div className="absolute right-0 top-0 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600 opacity-0 scale-95 translate-y-1 group-hover:opacity-100 group-hover:scale-100 group-hover:translate-y-0 transition-all duration-300 flex items-center gap-1.5 shadow-sm origin-right">
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
          <span className="text-sm font-semibold text-slate-400 mb-1.5">% Readiness</span>
        </div>

        <div className="w-full bg-slate-100 rounded-full h-3 mb-6">
          <div 
            className="h-3 rounded-full transition-all duration-1000" 
            style={{ width: `${data.totalScore * 100}%`, backgroundColor: mainColor }}
          />
        </div>
      </div>

      {/* Metrics Section */}
      <div className="bg-slate-50/50 p-6 pt-2 flex-1 border-t border-slate-100 group-hover:bg-slate-50 transition-colors">
        <div className="space-y-1">
          <MetricRow 
            icon={Server} 
            label="Device Install" 
            value={data.deviceRatio}
            detailText={`(${data.devicesInstalled}/${data.totalDevicesNeeded})`}
            theme={theme}
          />
          <MetricRow 
            icon={Database} 
            label="Master Data" 
            value={data.masterDataScore} 
            isBinary 
            theme={theme}
          />
          <MetricRow 
            icon={CheckCircle2} 
            label="Vendor Tasks" 
            value={data.vendorProgress} 
            detailText={data.vendorTasksTotal > 0 ? `(${data.vendorTasksCompleted}/${data.vendorTasksTotal})` : '(0/0)'}
            theme={theme}
          />
          <MetricRow 
            icon={Presentation} 
            label="Pre-Training" 
            value={data.preTrainingScore} 
            isBinary 
            theme={theme}
          />
          <MetricRow 
            icon={GraduationCap} 
            label="Staff Training" 
            value={data.trainingScore} 
            isBinary 
            theme={theme}
          />
        </div>
      </div>

      {/* Date Footer - Reveal on Hover */}
      <div className="px-6 bg-white border-slate-100 grid grid-cols-2 gap-4 max-h-0 opacity-0 overflow-hidden transition-all duration-300 ease-out group-hover:max-h-24 group-hover:py-3 group-hover:opacity-100 group-hover:border-t">
        <div>
          <p className="text-[10px] uppercase tracking-wider font-semibold text-slate-400">Next Milestone</p>
          <p className="text-xs font-medium text-slate-700 flex items-center gap-1.5 mt-0.5">
             <CalendarClock size={12} className="text-blue-500" />
             {data.nextMilestoneDate || 'N/A'}
          </p>
        </div>
        <div className="text-right">
          <p className="text-[10px] uppercase tracking-wider font-semibold text-slate-400">Est Completion</p>
          <p className="text-xs font-medium text-slate-700 flex items-center justify-end gap-1.5 mt-0.5">
             <Flag size={12} className="text-emerald-500" />
             {data.estCompletionDate || 'N/A'}
          </p>
        </div>
      </div>
    </div>
  );
};