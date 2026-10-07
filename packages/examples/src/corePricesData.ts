import type { NewsEntry } from '@davinci-ai/react';
import { walkTo } from './data';

/** Fictional sample data for the Core "Global prices" page. Names, codes, prices and headlines are invented. */

export interface PriceTile { id: string; name: string; code: string; asOf: string; unit: string; price: number; change: number; percent: number }
export const tiles: PriceTile[] = [
  { id: 'a', name: 'Harbour Blend Spot', code: 'HBS001', asOf: '05 Oct 2026', unit: '$/BBL', price: 95.14, change: -2.4, percent: -2.46 },
  { id: 'b', name: 'North Sea Light M1', code: 'NSL001', asOf: '05 Oct 2026', unit: '$/BBL', price: 128.36, change: 1.405, percent: 1.11 },
  { id: 'c', name: 'Gulf Sour M1', code: 'GSR001', asOf: '05 Oct 2026', unit: '$/BBL', price: 109.705, change: 0.91, percent: 0.84 },
  { id: 'd', name: 'Prairie Sweet M1', code: 'PRS001', asOf: '05 Oct 2026', unit: '$/BBL', price: 89.43, change: -1.68, percent: -1.84 },
  { id: 'e', name: 'Midland Delivered', code: 'MDL001', asOf: '05 Oct 2026', unit: '$/BBL', price: 124.25, change: 1.56, percent: 1.27 },
];

const wire = 'Fictional Wire';
export const topNews: NewsEntry[][] = [
  [
    { id: 'n1', time: '10/05/2026 14:40', headline: 'Utility chief flags need for greater regional gas storage', source: wire, tags: ['Top News'], summary: 'Sample text only. The executive said storage built up through the season is not enough to cover an extended cold spell.' },
    { id: 'n2', time: '10/05/2026 04:43', headline: 'Eastern refiners sustain ample clean product exports on stable feedstock supply', source: wire, tags: ['Analysis'], unread: true, summary: 'Sample text only. Export volumes held steady against the five-year range.' },
  ],
  [
    { id: 'n3', time: '10/05/2026 11:57', headline: 'Desert producer output back to around 2 mil b/d', source: wire, tags: ['Top News'], summary: 'Sample text only. Output recovered after a temporary outage earlier in the year.' },
    { id: 'n4', time: '10/05/2026 03:16', headline: 'Southern continent forecasts 15% rise in crude imports as exports slow', source: wire, tags: ['Top News'], unread: true, summary: 'Sample text only. Field output declines are cited as the main driver.' },
  ],
  [
    { id: 'n5', time: '10/05/2026 09:09', headline: 'Independent producer sees domestic output at record if prices hold', source: wire, tags: ['Top News'], summary: 'Sample text only. A senior executive spoke at an industry conference.' },
    { id: 'n6', time: '10/02/2026 13:51', headline: 'Group agrees coordinated release of 100 million barrels from stocks', source: wire, tags: ['Top News'], summary: 'Sample text only. Member states committed to the release over a four-month window.' },
  ],
];

export interface KeyAssessment { id: string; description: string; region: string; price: number; symbol: string; change: number; percent: number; unit: string }
export const keyAssessments: KeyAssessment[] = [
  { id: 'k1', description: 'Harbour Blend FOB Terminal A', region: 'Persian Gulf', price: 72.3, symbol: 'HBF001', change: 0.81, percent: 1.13, unit: '$/BBL' },
  { id: 'k2', description: 'North Sea Light Dated', region: 'North Sea', price: 128.36, symbol: 'NSL002', change: 1.405, percent: 1.11, unit: '$/BBL' },
  { id: 'k3', description: 'Gulf Sour CIF Hub B', region: 'US Gulf', price: 109.705, symbol: 'GSR002', change: 0.91, percent: 0.84, unit: '$/BBL' },
  { id: 'k4', description: 'Prairie Sweet Cushing-style', region: 'US Midcontinent', price: 89.43, symbol: 'PRS002', change: -1.68, percent: -1.84, unit: '$/BBL' },
  { id: 'k5', description: 'Basket Composite Daily', region: 'Global', price: 109.38, symbol: 'BKT001', change: 0.56, percent: 0.51, unit: '$/BBL' },
  { id: 'k6', description: 'Coastal Heavy FOB Port C', region: 'Latin America', price: 81.92, symbol: 'CHV001', change: -0.44, percent: -0.53, unit: '$/BBL' },
];

export const chartSeries = walkTo(120, 109.38, 0.032, 77, 0.47);
export const chartLabels = chartSeries.map((_, i) => `Day ${i + 1}`);
export const chartAxis = ['Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'];

export interface Deal { id: string; title: string; date: string }
export const deals: Deal[] = [
  { id: 'd1', title: 'Gulf crude: December paper reported traded at +$0.30/b', date: '10/05/2026 14:42 ET' },
  { id: 'd2', title: 'Gulf crude: Sour 60,000 barrels November reported traded at benchmark +$1.00/b, Hub B, execution 17:17 UTC', date: '10/05/2026 14:42 ET' },
  { id: 'd3', title: 'Midland crude: 150,000 barrels November reported traded at benchmark +$0.40/b, Midland, execution 13:43 UTC', date: '10/05/2026 14:42 ET' },
  { id: 'd4', title: 'Midland crude: 150,000 barrels November reported traded at benchmark +$0.45/b, Midland, execution 16:06 UTC', date: '10/05/2026 14:42 ET' },
  { id: 'd5', title: 'Coastal crude: 90,000 barrels reported traded at benchmark +$0.85/b, Port C, execution 13:53 UTC', date: '10/05/2026 14:42 ET' },
  { id: 'd6', title: 'Midland crude: 60,000 barrels November reported traded at benchmark +$0.45/b, Midland, execution 15:16 UTC', date: '10/05/2026 14:42 ET' },
  { id: 'd7', title: 'Midland crude: 30,000 barrels November reported traded at benchmark +$0.45/b, Midland, execution 15:17 UTC', date: '10/05/2026 14:42 ET' },
  { id: 'd8', title: 'Gulf crude: Sour 30,000 barrels November reported traded at benchmark -$2.00/b, Hub B, execution 15:58 UTC', date: '10/05/2026 14:42 ET' },
  { id: 'd9', title: 'Midland crude: 150,000 barrels November reported traded at benchmark -$0.65/b, Midland, execution 15:59 UTC', date: '10/05/2026 14:42 ET' },
  { id: 'd10', title: 'Gulf crude: Southern Canyon 60,000 barrels reported traded at benchmark -$4.00/b, execution 16:34 UTC', date: '10/05/2026 14:42 ET' },
  { id: 'd11', title: 'Gulf crude: Sour 45,000 barrels December reported traded at benchmark -$1.10/b, Hub B, execution 16:41 UTC', date: '10/05/2026 14:42 ET' },
  { id: 'd12', title: 'Midland crude: 90,000 barrels December reported traded at benchmark +$0.20/b, Midland, execution 16:44 UTC', date: '10/05/2026 14:42 ET' },
  { id: 'd13', title: 'Coastal crude: 120,000 barrels reported traded at benchmark +$0.60/b, Port C, execution 16:49 UTC', date: '10/05/2026 14:42 ET' },
  { id: 'd14', title: 'Gulf crude: January paper reported traded at +$0.15/b', date: '10/05/2026 14:42 ET' },
];

export interface Commentary { id: string; title: string; commodity: string; date: string }
export const commentary: Commentary[] = [
  { id: 'c1', title: 'European Crude Swaps Daily Commentary', commodity: 'Crude Oil, Light Sweet Crude, Sour Crude', date: '10/05/2026 16:16 ET' },
  { id: 'c2', title: 'North Sea Crude Daily Market Analysis', commodity: 'Crude Oil, Freight, Light Sweet Crude', date: '10/05/2026 13:55 ET' },
  { id: 'c3', title: 'Mediterranean Sweet Crude Daily Commentary', commodity: 'Heavy Sour Crude, Light Sweet Crude, Medium Sour Crude', date: '10/05/2026 13:26 ET' },
  { id: 'c4', title: 'West African Crude Daily Commentary', commodity: 'Crude Oil, Freight, Light Sweet Crude', date: '10/05/2026 12:58 ET' },
  { id: 'c5', title: 'Asia Crude Swaps Daily Commentary', commodity: 'Crude Oil, Light Sweet Crude', date: '10/05/2026 09:33 ET' },
];

export interface Report { id: string; title: string; commodity: string; geography: string; date: string }
export const reports: Report[] = [
  { id: 'r1', title: 'Daily Oil Price Report', commodity: 'Refined Products, Crude Oil', geography: 'Global', date: '10/02/2026 19:55 ET' },
  { id: 'r2', title: 'Latin America Wire', commodity: 'Refined Products, Crude Oil', geography: 'AMER', date: '10/02/2026 18:55 ET' },
  { id: 'r3', title: 'Crude Oil Marketwire', commodity: 'Crude Oil', geography: 'Global', date: '10/02/2026 18:44 ET' },
  { id: 'r4', title: 'Daily Oil News', commodity: 'Refined Products, Crude Oil', geography: 'Global', date: '10/02/2026 18:32 ET' },
  { id: 'r5', title: 'North American Crude and Products Scan', commodity: 'Refined Products, Crude Oil', geography: 'AMER, North America', date: '10/02/2026 18:31 ET' },
];

/** Fictional article body used for every story in the example. */
export const articleBody = (headline: string): string[] => [
  `Sample text only. ${headline}, according to people familiar with the matter, in a development that market participants said had been widely expected.`,
  'Analysts noted that the move came as inventories and refinery runs diverged from seasonal norms. Prompt spreads were little changed on the day, while deferred contracts edged higher.',
  'The figures are invented for illustration and do not describe any real company, market or assessment.',
];
