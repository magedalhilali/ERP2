import { Theme } from '../types';

export const THEMES: Theme[] = [
  {
    id: 'classic',
    name: 'Classic',
    ranges: [
      { min: 0, max: 0.30, color: '#F44336', label: 'Critical' },
      { min: 0.30, max: 0.40, color: '#FF9800', label: 'Low' },
      { min: 0.40, max: 0.60, color: '#FFC107', label: 'Midway' },
      { min: 0.60, max: 0.80, color: '#8BC34A', label: 'Good' },
      { min: 0.80, max: 1.0, color: '#4CAF50', label: 'Complete' },
    ]
  },
  {
    id: 'vibrant',
    name: 'Vibrant',
    ranges: [
      { min: 0, max: 0.20, color: '#FF7F50', label: 'The Spark' },
      { min: 0.20, max: 0.40, color: '#FFB347', label: 'Momentum' },
      { min: 0.40, max: 0.60, color: '#FFD700', label: 'Halfway' },
      { min: 0.60, max: 0.80, color: '#9ACD32', label: 'Nearing' },
      { min: 0.80, max: 1.0, color: '#32CD32', label: 'Success' },
    ]
  },
  {
    id: 'ocean',
    name: 'Ocean',
    ranges: [
      { min: 0, max: 0.20, color: '#6A5ACD', label: 'Initiation' },
      { min: 0.20, max: 0.40, color: '#4169E1', label: 'Loading' },
      { min: 0.40, max: 0.60, color: '#00BFFF', label: 'Cruising' },
      { min: 0.60, max: 0.80, color: '#00CED1', label: 'Refining' },
      { min: 0.80, max: 1.0, color: '#20B2AA', label: 'Complete' },
    ]
  },
  {
    id: 'forest',
    name: 'Forest',
    ranges: [
      { min: 0, max: 0.20, color: '#A3E4D7', label: 'Seed' },
      { min: 0.20, max: 0.40, color: '#76D7C4', label: 'Sprout' },
      { min: 0.40, max: 0.60, color: '#48C9B0', label: 'Growth' },
      { min: 0.60, max: 0.80, color: '#1ABC9C', label: 'Bloom' },
      { min: 0.80, max: 1.0, color: '#117864', label: 'Harvest' },
    ]
  }
];

export const getThemeColor = (value: number, theme: Theme): string => {
  // Clamp value between 0 and 1
  const v = Math.max(0, Math.min(1, value));
  
  // Find range. We use > min and <= max, except for 0 which is included in first range
  const match = theme.ranges.find(r => {
    if (r.min === 0) return v >= r.min && v <= r.max;
    return v > r.min && v <= r.max;
  });

  return match ? match.color : theme.ranges[0].color;
};

export const getThemeLabel = (value: number, theme: Theme): string => {
  const v = Math.max(0, Math.min(1, value));
  const match = theme.ranges.find(r => {
    if (r.min === 0) return v >= r.min && v <= r.max;
    return v > r.min && v <= r.max;
  });
  return match ? match.label : '';
};