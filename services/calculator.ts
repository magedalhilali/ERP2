import { InternalReadinessRow, ReadinessScoreDetails, DashboardData, VendorTask } from '../types';

// Helper to format date
const formatDate = (date: Date): string => {
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
};

// Helper to check if a status string counts as "Done"
const isCompleted = (status?: string) => {
  if (!status) return 0;
  const s = status.toLowerCase().trim();
  
  // Explicitly handle "Not Yet Received" to ensure it returns 0
  if (s === 'not yet received') return 0;

  return (
    s === 'completed' || 
    s === 'complete' || 
    s === 'done' || 
    s === 'yes' || 
    s === 'received' || 
    s === 'finished'
  ) ? 1 : 0;
};

/**
 * LOGIC UPDATE:
 * 1. 5 Existing Components share 90% weight (18% each).
 * 2. 4 New Components (User/Admin) share 10% weight combined.
 */
export const calculateDepartmentReadiness = (
  row: InternalReadinessRow, 
  vendorStats: { progress: number, completed: number, total: number },
  vendorTasks: VendorTask[]
): ReadinessScoreDetails => {
  
  // Component 1: Device Ratio
  let deviceRatio = 1;
  if (row.totalDevicesNeeded > 0) {
    deviceRatio = Math.min(row.devicesInstalled / row.totalDevicesNeeded, 1);
  }

  // Component 2: Master Data
  const masterDataScore = isCompleted(row.masterDataStatus);

  // Component 3: ERP Vendor Progress
  const vendorScore = vendorStats.progress;

  // Component 4: Pre-Training
  const preTrainingScore = isCompleted(row.preTrainingStatus);

  // Component 5: Training
  const trainingScore = isCompleted(row.trainingStatus);

  // Component 6: User & Admin Readiness (New 10% Block)
  // Average of 4 sub-components
  const usernameScore = isCompleted(row.usernameListStatus);
  const permissionScore = isCompleted(row.permissionStatus);
  const workflowScore = isCompleted(row.workflowStatus);
  const matrixScore = isCompleted(row.approvalMatrixStatus);
  
  const userReadinessScore = (usernameScore + permissionScore + workflowScore + matrixScore) / 4;

  // --- Final Weighted Formula ---
  // Old 5 components = 90% (0.18 each)
  // New component = 10% (0.10)
  const coreAverage = (deviceRatio + masterDataScore + vendorScore + preTrainingScore + trainingScore) / 5;
  const totalScore = (coreAverage * 0.90) + (userReadinessScore * 0.10);

  // --- Date Logic ---
  let nextMilestone: string | null = null;
  let estCompletion: string | null = null;

  if (vendorTasks && vendorTasks.length > 0) {
     const validDates = vendorTasks
        .filter(t => t.date)
        .map(t => ({ 
           status: t.status.toLowerCase().trim(), 
           dateObj: new Date(t.date!),
        }))
        .filter(item => !isNaN(item.dateObj.getTime()));

     if (validDates.length > 0) {
        // Est Completion: Latest date overall (regardless of status)
        const sortedByDateDesc = [...validDates].sort((a, b) => b.dateObj.getTime() - a.dateObj.getTime());
        if (sortedByDateDesc.length > 0) {
           estCompletion = formatDate(sortedByDateDesc[0].dateObj);
        }

        // Next Milestone: Earliest date for PENDING tasks
        // Filter out completed tasks
        const pending = validDates.filter(t => !['done', 'completed', 'complete', 'yes', 'finished', 'received'].includes(t.status));
        const sortedPendingAsc = pending.sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime());
        
        if (sortedPendingAsc.length > 0) {
           nextMilestone = formatDate(sortedPendingAsc[0].dateObj);
        } else if (vendorStats.completed === vendorStats.total && vendorStats.total > 0) {
           nextMilestone = "All Complete";
        }
     }
  }

  return {
    department: row.department,
    vendorProgress: vendorScore,
    vendorTasksCompleted: vendorStats.completed,
    vendorTasksTotal: vendorStats.total,
    vendorTasks: vendorTasks,
    deviceRatio,
    devicesInstalled: row.devicesInstalled,
    totalDevicesNeeded: row.totalDevicesNeeded,
    masterDataScore,
    preTrainingScore,
    trainingScore,
    userReadinessScore,
    totalScore,
    nextMilestoneDate: nextMilestone,
    estCompletionDate: estCompletion
  };
};

export const processAllData = (vendorData: DashboardData, rows: InternalReadinessRow[]): ReadinessScoreDetails[] => {
  // 1. Group tasks by department for easy access
  const tasksByDept = new Map<string, VendorTask[]>();
  vendorData.tasks.forEach(task => {
    // Normalize key to match stats map keys
    const d = task.department;
    if (!tasksByDept.has(d)) tasksByDept.set(d, []);
    tasksByDept.get(d)!.push(task);
  });

  // 2. Prepare Stats Map with Tasks included
  const vendorStatsMap = new Map<string, { progress: number, completed: number, total: number, tasks: VendorTask[] }>();
  
  vendorData.departmentStats.forEach(stat => {
    vendorStatsMap.set(stat.departmentName, { 
      progress: stat.percentage,
      completed: stat.completedTasks,
      total: stat.totalTasks,
      tasks: tasksByDept.get(stat.departmentName) || []
    });
  });
  
  return rows.map(row => {
    const rowDeptLower = row.department.toLowerCase().trim();
    
    // Default stats if no match found
    let vendorStats = { progress: 0, completed: 0, total: 0 };
    let matchedTasks: VendorTask[] = [];

    // 1. Direct Match
    if (vendorStatsMap.has(row.department)) {
      const match = vendorStatsMap.get(row.department)!;
      vendorStats = match;
      matchedTasks = match.tasks;
    } 
    // 2. Fuzzy / Keyword Match
    // Iterate through our generated stats to find the best match for the Sheet B department
    else {
      for (const [key, val] of vendorStatsMap.entries()) {
        const keyLower = key.toLowerCase();
        
        // Check if Sheet B dept name is contained in the Stats name (e.g. "Finance" in "Finance & Admin")
        // Or vice versa
        if (keyLower.includes(rowDeptLower) || rowDeptLower.includes(keyLower)) {
          vendorStats = val;
          matchedTasks = val.tasks;
          break;
        }
        
        // Special mapping for common abbreviations
        if (rowDeptLower === 'hr' && keyLower.includes('hr')) {
          vendorStats = val;
          matchedTasks = val.tasks;
          break;
        }
      }
    }

    // Specific Override: Estimation is typically manual/separate
    if (row.department === 'Estimation') {
      vendorStats = { progress: 1.0, completed: 0, total: 0 };
      matchedTasks = [];
    }
    
    return calculateDepartmentReadiness(row, vendorStats, matchedTasks);
  }).sort((a, b) => b.totalScore - a.totalScore);
};