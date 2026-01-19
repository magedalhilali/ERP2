import React, { useState, useMemo } from 'react';
import { VendorTask } from '../types';
import { 
  X, 
  Search, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  ArrowUp, 
  ArrowDown,
  AlertCircle
} from 'lucide-react';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  departmentName: string;
  tasks: VendorTask[];
  completedCount: number;
  totalCount: number;
}

type SortKey = 'description' | 'date' | 'status';
type SortDirection = 'asc' | 'desc';

interface SortConfig {
  key: SortKey;
  direction: SortDirection;
}

export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  departmentName,
  tasks,
  completedCount,
  totalCount
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'completed' | 'pending'>('all');
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'date', direction: 'asc' });

  const handleSort = (key: SortKey) => {
    setSortConfig(current => ({
      key,
      direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const filteredTasks = useMemo(() => {
    let result = [...tasks];

    // 1. Search Filter
    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      result = result.filter(t => t.description.toLowerCase().includes(lower));
    }

    // 2. Status Filter
    if (filterStatus !== 'all') {
      result = result.filter(t => {
        const isDone = ['done', 'completed', 'complete', 'finished', 'yes'].includes(t.status.toLowerCase());
        return filterStatus === 'completed' ? isDone : !isDone;
      });
    }

    // 3. Sorting
    result.sort((a, b) => {
      const directionMult = sortConfig.direction === 'asc' ? 1 : -1;
      
      switch (sortConfig.key) {
        case 'description':
          return a.description.localeCompare(b.description) * directionMult;
        case 'status':
          // Rank: Done (0) < Overdue (1) < Pending (2)
          // Ascending: Done -> Overdue -> Pending
          const getRank = (t: VendorTask) => {
             const isDone = ['done', 'completed', 'complete', 'finished', 'yes'].includes(t.status.toLowerCase());
             if (isDone) return 0;
             if (t.isOverdue) return 1;
             return 2;
          };
          const rankA = getRank(a);
          const rankB = getRank(b);
          return (rankA - rankB) * directionMult;
          
        case 'date':
          // Handle empty dates (push to bottom usually)
          if (!a.date && !b.date) return 0;
          if (!a.date) return 1;
          if (!b.date) return -1;
          
          const dateA = new Date(a.date).getTime();
          const dateB = new Date(b.date).getTime();
          
          if (isNaN(dateA)) return 1;
          if (isNaN(dateB)) return -1;
          
          return (dateA - dateB) * directionMult;
        default:
          return 0;
      }
    });

    return result;
  }, [tasks, searchTerm, filterStatus, sortConfig]);

  if (!isOpen) return null;

  const SortHeader = ({ label, columnKey, className = "" }: { label: string, columnKey: SortKey, className?: string }) => {
    const isActive = sortConfig.key === columnKey;
    return (
      <button 
        onClick={() => handleSort(columnKey)}
        className={`flex items-center gap-1 transition-colors hover:text-slate-800 ${isActive ? 'text-blue-600 font-bold' : 'text-slate-500 font-semibold'} ${className}`}
      >
        {label}
        {isActive && (
          sortConfig.direction === 'asc' 
            ? <ArrowUp size={14} className="text-blue-600" /> 
            : <ArrowDown size={14} className="text-blue-600" />
        )}
      </button>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative w-full max-w-4xl bg-white rounded-xl shadow-2xl flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-start justify-between bg-white rounded-t-xl z-10">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">{departmentName}</h2>
            <p className="text-slate-500 mt-1">
              {completedCount} / {totalCount} tasks completed
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Toolbar */}
        <div className="px-6 py-4 bg-slate-50/50 border-b border-slate-100 flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div className="relative w-full sm:w-1/2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search tasks..." 
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg p-1 w-full sm:w-auto">
              <button 
                onClick={() => setFilterStatus('all')}
                className={`flex-1 sm:flex-none px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${filterStatus === 'all' ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
              >
                All
              </button>
              <button 
                onClick={() => setFilterStatus('completed')}
                className={`flex-1 sm:flex-none px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${filterStatus === 'completed' ? 'bg-emerald-50 text-emerald-700' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Completed
              </button>
              <button 
                onClick={() => setFilterStatus('pending')}
                className={`flex-1 sm:flex-none px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${filterStatus === 'pending' ? 'bg-amber-50 text-amber-700' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Pending
              </button>
            </div>
          </div>
        </div>

        {/* List Header - Sortable */}
        <div className="grid grid-cols-12 px-6 py-3 bg-slate-50 border-b border-slate-100 text-xs uppercase tracking-wider select-none">
          <div className="col-span-7">
            <SortHeader label="Task Description" columnKey="description" />
          </div>
          <div className="col-span-3">
             <SortHeader label="EDD / Date" columnKey="date" />
          </div>
          <div className="col-span-2 flex justify-end">
             <SortHeader label="Status" columnKey="status" className="justify-end" />
          </div>
        </div>

        {/* Scrollable List */}
        <div className="overflow-y-auto flex-1 p-0 bg-white min-h-[300px]">
          {filteredTasks.length > 0 ? (
            filteredTasks.map((task) => {
              const isDone = ['done', 'completed', 'complete', 'finished', 'yes'].includes(task.status.toLowerCase());
              
              return (
                <div key={task.id} className="grid grid-cols-12 px-6 py-4 border-b border-slate-50 hover:bg-slate-50/80 transition-colors items-center group">
                  <div className="col-span-7 pr-4">
                    <span className="text-sm text-slate-700 font-medium block">
                      {task.description}
                    </span>
                  </div>
                  <div className="col-span-3 flex items-center gap-2 text-slate-500 text-sm">
                    {task.date ? (
                      <>
                        <Calendar size={14} className={task.isOverdue && !isDone ? "text-rose-500" : "text-slate-400"} />
                        <span className={task.isOverdue && !isDone ? "text-rose-600 font-medium" : ""}>{task.date}</span>
                      </>
                    ) : (
                      <span className="text-slate-300 italic text-xs">No date set</span>
                    )}
                  </div>
                  <div className="col-span-2 flex justify-end">
                    {isDone ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">
                        <CheckCircle2 size={12} />
                        Done
                      </span>
                    ) : task.isOverdue ? (
                       <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-rose-50 text-rose-700 border border-rose-100">
                        <AlertCircle size={12} />
                        Overdue
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
                        <Clock size={12} />
                        Pending
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="flex flex-col items-center justify-center h-48 text-slate-400">
              <Search size={32} className="mb-2 opacity-20" />
              <p>No tasks found matching your filters.</p>
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 rounded-b-xl text-xs text-slate-400 flex justify-between">
          <span>Showing {filteredTasks.length} tasks</span>
          <span>Syncs with Vendor Task Sheet</span>
        </div>

      </div>
    </div>
  );
};