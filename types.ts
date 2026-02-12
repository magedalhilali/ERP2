export interface VendorTask {
  id: string;
  description: string;
  department: string; // Derived from keywords
  status: string;
  date?: string;
  isOverdue: boolean;
}

export interface InternalReadinessRow {
  department: string;
  devicesInstalled: number;
  totalDevicesNeeded: number;
  masterDataStatus: 'Completed' | 'Pending' | 'In Progress' | string;
  preTrainingStatus: 'Completed' | 'Pending' | 'Scheduled' | string;
  trainingStatus: 'Completed' | 'Pending' | 'In Progress' | string;
  // New Fields (10% weight combined)
  usernameListStatus?: string;
  permissionStatus?: string;
  workflowStatus?: string;
  approvalMatrixStatus?: string;
}

export interface DepartmentStats {
  departmentName: string;
  totalTasks: number;
  completedTasks: number;
  percentage: number;
  overdueTasks: number;
}

export interface DashboardData {
  tasks: VendorTask[];
  departmentStats: DepartmentStats[];
  overallProgress: number;
}

export interface ReadinessScoreDetails {
  department: string;
  vendorProgress: number;     // Component 1 (from Sheet A)
  vendorTasksCompleted: number; // Raw count
  vendorTasksTotal: number;     // Raw count
  vendorTasks: VendorTask[];  // The list of specific tasks
  deviceRatio: number;        // Component 2
  devicesInstalled: number;   // Raw count for Component 2
  totalDevicesNeeded: number; // Raw count for Component 2
  masterDataScore: number;    // Component 3
  preTrainingScore: number;   // Component 4
  trainingScore: number;      // Component 5
  userReadinessScore: number; // Component 6 (New 10% weight)
  totalScore: number;         // Weighted Average
  nextMilestoneDate?: string | null; // Earliest pending task date
  estCompletionDate?: string | null; // Latest task date
}

export interface ThemeRange {
  min: number;
  max: number;
  color: string;
  label: string;
}

export interface Theme {
  id: string;
  name: string;
  ranges: ThemeRange[];
}

export interface BackgroundTheme {
  id: string;
  name: string;
  className: string;
  isDark: boolean;
}

export type LayoutMode = 'grid' | 'list';
