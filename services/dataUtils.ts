import Papa from 'papaparse';
import { VendorTask, DepartmentStats, DashboardData } from '../types';

// 1. Keyword Dictionary
const KEYWORDS: Record<string, string[]> = {
  'HR & Payroll': ['employee', 'payroll', 'leave', 'salary', 'wps', 'recruit', 'candidate', 'personnel', 'hr', 'h.r'],
  'Finance': ['finance', 'account', 'payment', 'voucher', 'ledger', 'asset', 'bank', 'tax', 'p&l', 'balance', 'audit', 'vat'],
  'Procurement': ['purchase', 'supplier', 'lpo', 'quotation', 'procurement', 'vendor', 'sourcing'],
  'Logistics': [
    'stock', 'inventory', 'material', 'store', 'warehouse', 'item', 'goods', 'logistics', 
    'equipment', 'workshop', 'vehicle', 'service', 'maintenance', 'repair', 'machinery', 'fleet'
  ],
  'Projects & Sales': ['project', 'boq', 'job', 'costing', 'estimate', 'tender', 'sales', 'crm', 'contract', 'customer'],
  'Setup & Admin': ['srs', 'database', 'master', 'installation', 'setup', 'admin', 'user', 'role', 'configuration', 'meeting', 'kickoff', 'go-live']
};

// Helper: Classify text into a department
const assignDepartment = (text: string): string => {
  const lowerText = (text || '').toLowerCase();
  
  for (const [dept, words] of Object.entries(KEYWORDS)) {
    if (words.some(word => lowerText.includes(word))) {
      return dept;
    }
  }
  return 'General';
};

// Helper: Check if task is overdue
const checkOverdue = (status: string, dateStr: string): boolean => {
  const isDone = ['done', 'completed', 'complete', 'finished', 'yes'].includes(status.toLowerCase().trim());
  if (isDone) return false;
  
  // Simple date parsing if available
  if (!dateStr) return false;
  const taskDate = new Date(dateStr);
  if (isNaN(taskDate.getTime())) return false;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  return taskDate < today;
};

// 2. Data Fetching & Parsing Strategy
export const parseVendorSheet = (csvText: string): DashboardData => {
  // Use header: false to gain index control for specific columns like "Column R"
  const result = Papa.parse(csvText, {
    header: false,
    skipEmptyLines: true,
  });

  const rawData = result.data as string[][];
  const tasks: VendorTask[] = [];

  if (!rawData || rawData.length < 2) {
    return { tasks: [], departmentStats: [], overallProgress: 0 };
  }

  // 1. Detect Header and Column Indices
  let headerRowIndex = 0;
  let descriptionIdx = 1; // Default to Column B
  let statusIdx = 17;     // Default to Column R (Index 17) as requested
  let dateIdx = 23;       // Default to Column X (Index 23) as requested/fallback

  // Scan first few rows to find a likely header row
  for (let i = 0; i < Math.min(20, rawData.length); i++) {
    const row = rawData[i].map(c => (c || '').toLowerCase().trim());
    
    const dIdx = row.findIndex(c => c.includes('activity') || c.includes('task name') || c.includes('description'));
    
    if (dIdx !== -1) {
      headerRowIndex = i;
      descriptionIdx = dIdx;
      
      // Status Detection
      const currentStatusExactIdx = row.findIndex(c => c.includes('current status'));
      if (currentStatusExactIdx !== -1) {
        statusIdx = currentStatusExactIdx;
      } else {
        const sIdx = row.findIndex(c => c === 'status' || c.includes('status')); 
        if (sIdx !== -1) statusIdx = sIdx;
      }
      
      // --- DATE COLUMN LOGIC ---
      // 1. Check Column X (Index 23) first for 'edd'
      const col23 = row[23] || '';
      if (col23.includes('edd')) {
        dateIdx = 23;
      } else {
        // 2. Fuzzy Search
        // Keywords order matters: specific to generic
        const dateKeywords = ['edd at site', 'edd', 'target date', 'deadline', 'date'];
        let matchFound = false;

        for (const keyword of dateKeywords) {
          // Normalize keyword: remove spaces and non-alphanumeric
          const normKeyword = keyword.replace(/[\s\W]+/g, '');
          
          // Find first column that matches this keyword
          const idx = row.findIndex(cell => {
             const normCell = cell.replace(/[\s\W]+/g, '');
             return normCell.includes(normKeyword);
          });

          if (idx !== -1) {
            dateIdx = idx;
            matchFound = true;
            break; // Stop at the highest priority keyword found
          }
        }
        
        // 3. Hard Fallback
        if (!matchFound) {
           dateIdx = 23;
        }
      }
      
      break;
    }
  }

  // 2. Parse Rows
  for (let i = headerRowIndex + 1; i < rawData.length; i++) {
    const row = rawData[i];
    if (!row) continue;

    // Use calculated indices. Handle short rows (csv optimization)
    const description = row[descriptionIdx] ? row[descriptionIdx].trim() : '';
    
    // Status Logic
    let status = 'Pending';
    if (row.length > statusIdx && row[statusIdx]) {
      status = row[statusIdx].trim();
    }
    
    // Date Logic
    // Ensure we don't access out of bounds if the row is shorter than 23 cols
    const dateStr = (row.length > dateIdx && row[dateIdx]) ? row[dateIdx].trim() : '';

    if (description) {
      tasks.push({
        id: `task-${i}`,
        description,
        department: assignDepartment(description),
        status: status || 'Pending',
        date: dateStr,
        isOverdue: checkOverdue(status, dateStr)
      });
    }
  }

  // 3. Data Aggregation
  const statsMap = new Map<string, DepartmentStats>();

  // Initialize from KEYWORDS
  Object.keys(KEYWORDS).forEach(dept => {
    statsMap.set(dept, {
      departmentName: dept,
      totalTasks: 0,
      completedTasks: 0,
      percentage: 0,
      overdueTasks: 0
    });
  });
  statsMap.set('General', { departmentName: 'General', totalTasks: 0, completedTasks: 0, percentage: 0, overdueTasks: 0 });

  tasks.forEach(task => {
    // If department mapping failed to find a key in map (shouldn't happen due to logic), fallback to General
    const deptKey = statsMap.has(task.department) ? task.department : 'General';
    const stats = statsMap.get(deptKey)!;
    
    stats.totalTasks += 1;
    
    const s = task.status.toLowerCase().trim();
    const isDone = s === 'done' || s === 'completed' || s === 'complete' || s === 'finished' || s === 'yes';
    
    if (isDone) {
      stats.completedTasks += 1;
    }
    
    if (task.isOverdue) {
      stats.overdueTasks += 1;
    }
  });

  // Calculate Percentages
  let totalAll = 0;
  let completedAll = 0;

  statsMap.forEach(stats => {
    if (stats.totalTasks > 0) {
      stats.percentage = stats.completedTasks / stats.totalTasks;
    }
    totalAll += stats.totalTasks;
    completedAll += stats.completedTasks;
  });

  const departmentStats = Array.from(statsMap.values()).filter(s => s.totalTasks > 0);
  const overallProgress = totalAll > 0 ? (completedAll / totalAll) : 0;

  return {
    tasks,
    departmentStats,
    overallProgress
  };
};