import { InternalReadinessRow, DashboardData } from '../types';
import { parseVendorSheet } from './dataUtils';

const SHEET_ID_A = '1NJAWsl2n0i-rbZR0vpSUiFdOEYOV-JAQZyMy3MsjVKA';
const SHEET_ID_B = '1hfZQRrp9uV1SlNUK54SaxyS3DzVTWMRq7Lfpy1bF6Hg';

// Helper to remove surrounding quotes if present (for manual parsing of Sheet B)
const cleanCell = (val: string | undefined): string => {
  if (!val) return '';
  return val.replace(/^"|"$/g, '').trim();
};

// Robust CSV Parser (Manual) - Kept for Sheet B as it follows a strict template
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
  // Ensure we use the export format as requested
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

    // --- PROCESS SHEET A (Vendor Tasks) using new dataUtils ---
    const vendorData = parseVendorSheet(csvA);

    // --- PROCESS SHEET B (Internal Readiness) ---
    // Keeping manual parser for B as it maps to specific UI columns directly
    const dataB = parseCSVManual(csvB);
    const rows: InternalReadinessRow[] = [];
    const rowsB = dataB.slice(1);

    rowsB.forEach(row => {
      if (row.length >= 7) {
        const dept = cleanCell(row[0]);
        if (dept) {
          rows.push({
            department: dept,
            devicesInstalled: parseInt(cleanCell(row[1])) || 0,
            totalDevicesNeeded: parseInt(cleanCell(row[2])) || 0,
            masterDataStatus: cleanCell(row[3]),
            preTrainingStatus: cleanCell(row[5]),
            trainingStatus: cleanCell(row[6])
          });
        }
      }
    });

    return { vendorData, rows };

  } catch (error) {
    console.error("Failed to fetch real data:", error);
    throw error;
  }
};