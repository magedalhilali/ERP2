import { VendorTask, InternalReadinessRow } from '../types';

// FALLBACK DATA
// If the Google Sheet fetch fails (due to network/CORS), this data will be displayed.
// Updated to match Finance, Procurement, Logistics, Projects, HR

export const MOCK_SHEET_A_TASKS: VendorTask[] = [
  // Finance
  { id: '1', department: 'Finance', description: 'Chart of Accounts', status: 'Done', isOverdue: false },
  { id: '2', department: 'Finance', description: 'Bank Integration', status: 'Done', isOverdue: false },
  { id: '3', department: 'Finance', description: 'Tax Setup', status: 'Done', isOverdue: false },
  { id: '4', department: 'Finance', description: 'Reporting', status: 'Done', isOverdue: false },
  
  // Procurement
  { id: '5', department: 'Procurement', description: 'Vendor Master', status: 'Done', isOverdue: false },
  { id: '6', department: 'Procurement', description: 'PO Workflow', status: 'In Progress', isOverdue: false },
  { id: '7', department: 'Procurement', description: 'Contracts', status: 'Pending', isOverdue: false },
  
  // Logistics
  { id: '8', department: 'Logistics', description: 'Warehouse Setup', status: 'Done', isOverdue: false },
  { id: '9', department: 'Logistics', description: 'Inventory Import', status: 'Done', isOverdue: false },
  { id: '10', department: 'Logistics', description: 'Shipping Rules', status: 'Done', isOverdue: false },
  
  // Projects
  { id: '11', department: 'Projects', description: 'Project Codes', status: 'Done', isOverdue: false },
  { id: '12', department: 'Projects', description: 'Budget Rules', status: 'Pending', isOverdue: false },
  { id: '13', department: 'Projects', description: 'Timesheets', status: 'Pending', isOverdue: false },
  
  // HR
  { id: '14', department: 'HR', description: 'Employee Data', status: 'Done', isOverdue: false },
  { id: '15', department: 'HR', description: 'Payroll Config', status: 'Done', isOverdue: false },
  { id: '16', department: 'HR', description: 'Leave Rules', status: 'Done', isOverdue: false },
  { id: '17', department: 'HR', description: 'Self Service', status: 'In Progress', isOverdue: false },
];

export const MOCK_SHEET_B_ROWS: InternalReadinessRow[] = [
  {
    department: 'Finance',
    devicesInstalled: 15,
    totalDevicesNeeded: 15,
    masterDataStatus: 'Completed',
    preTrainingStatus: 'Completed',
    trainingStatus: 'In Progress'
  },
  {
    department: 'Procurement',
    devicesInstalled: 8,
    totalDevicesNeeded: 10,
    masterDataStatus: 'In Progress',
    preTrainingStatus: 'Completed',
    trainingStatus: 'Pending'
  },
  {
    department: 'Logistics',
    devicesInstalled: 20,
    totalDevicesNeeded: 20,
    masterDataStatus: 'Completed',
    preTrainingStatus: 'Completed',
    trainingStatus: 'Completed'
  },
  {
    department: 'Projects',
    devicesInstalled: 2,
    totalDevicesNeeded: 15,
    masterDataStatus: 'Pending',
    preTrainingStatus: 'Pending',
    trainingStatus: 'Pending'
  },
  {
    department: 'HR',
    devicesInstalled: 12,
    totalDevicesNeeded: 12,
    masterDataStatus: 'Completed',
    preTrainingStatus: 'Completed',
    trainingStatus: 'Completed'
  }
];