import { InternalReadinessRow, DashboardData } from '../types';
import { parseVendorSheet } from './dataUtils';

const SHEET_ID_A = '1NJAWsl2n0i-rbZR0vpSUiFdOEYOV-JAQZyMy3MsjVKA';
const SHEET_ID_B = '1NH51GccyM4TVY2c0ZIw0uWg2n_8wdwmTExnbuXVWMI8';

// Helper to remove surrounding quotes and whitespace
const cleanCell = (val: string | undefined): string => {
  if (!val) return '';
  return val.replace(/^"|"$/g, '').trim();
};

// Robust CSV Parser (Manual)
const parseCSVManual = (text: string): string[][] => {
  const result: string[][] = [];
  const lines = text.split(/\r?\n/);
  
  for (const line of lines) {
    if (!line.trim()) continue;
    
    const row: string[] = [];
    let current = '';
    let inQuote = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        if (inQuote && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuote = !inQuote;
        }
      } else if (char === ',' && !inQuote) {
        row.push(current); 
        current = '';
      } else {
        current += char;
      }
    }
    row.push(current);
    result.push(row);
  }
  return result;
};

const fetchCSV = async (sheetId: string) => {
  const t = new Date().getTime();
  const targetUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&t=${t}`;
  const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(targetUrl)}`;
  
  const response = await fetch(proxyUrl);
  if (!response.ok) {
    throw new Error(`Failed to fetch CSV: ${response.status} ${response.statusText}`);
  }
  return await response.text();
};

export const fetchRealData = async (): Promise<{ vendorData: DashboardData, rows: InternalReadinessRow[] }> => {
  try {
    const [csvA, csvB] = await Promise.all([
      fetchCSV(SHEET_ID_A),
      fetchCSV(SHEET_ID_B)
    ]);

    // --- PROCESS SHEET A (Vendor Tasks) ---
    const vendorData = parseVendorSheet(csvA);

    // --- PROCESS SHEET B (Internal Readiness) with Dynamic Headers ---
    const dataB = parseCSVManual(csvB);
    const rows: InternalReadinessRow[] = [];
    
    // We expect at least a header row and one data row
    if (dataB.length > 1) {
       // 1. Detect Column Indices based on Header Names
       const headers = dataB[0].map(h => h.toLowerCase().trim());
       
       const findCol = (searchTerms: string[]) => 
         headers.findIndex(h => searchTerms.some(term => h.includes(term)));

       const deptIdx = findCol(['department']);
       
       const installIdx = findCol(['device install', 'devices installed', 'installed']);
       const totalIdx = findCol(['total devices', 'total needed', 'device total']); 
       
       const masterIdx = findCol(['master data']);
       const preTrainIdx = findCol(['pre-training', 'pre training']);
       
       // Ensure we don't match 'pre-training' when looking for 'training' or 'staff training'
       const staffTrainIdx = headers.findIndex((h, i) => 
         i !== preTrainIdx && (h.includes('staff') || h.includes('training'))
       );

       const userIdx = findCol(['username', 'user list']);
       const permIdx = findCol(['permission']);
       const workflowIdx = findCol(['workflow']);
       const apprIdx = findCol(['approval']);

       // 2. Parse Data Rows
       const dataRows = dataB.slice(1);
       
       dataRows.forEach(row => {
          // Validate Department
          const dept = deptIdx !== -1 ? cleanCell(row[deptIdx]) : '';
          if (!dept) return;

          // Helper to safely get cell value
          const getVal = (idx: number) => (idx !== -1 && row[idx]) ? cleanCell(row[idx]) : 'Pending';

          // Device Calculation Logic
          let installed = 0;
          let total = 0;
          const installVal = installIdx !== -1 ? cleanCell(row[installIdx]) : '0';

          // Handle "5/10" format or simple "5"
          if (installVal.includes('/')) {
             const parts = installVal.split('/');
             installed = parseInt(parts[0]) || 0;
             total = parseInt(parts[1]) || 0;
          } else {
             installed = parseInt(installVal) || 0;
             // If there is a dedicated Total column, use it
             if (totalIdx !== -1) {
                total = parseInt(cleanCell(row[totalIdx])) || 0;
             } else {
                // If no total column, assume 100% completion if installed > 0, else 0
                total = installed > 0 ? installed : 0;
             }
          }

          rows.push({
            department: dept,
            devicesInstalled: installed,
            totalDevicesNeeded: total,
            masterDataStatus: getVal(masterIdx),
            preTrainingStatus: getVal(preTrainIdx),
            trainingStatus: getVal(staffTrainIdx),
            usernameListStatus: getVal(userIdx),
            permissionStatus: getVal(permIdx),
            workflowStatus: getVal(workflowIdx),
            approvalMatrixStatus: getVal(apprIdx)
          });
       });
    }

    return { vendorData, rows };

  } catch (error) {
    console.error("Failed to fetch real data:", error);
    throw error;
  }
};