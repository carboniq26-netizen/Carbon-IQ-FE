import { BatteryCharging } from 'lucide-react';
import { type ColumnDef, type SubTabConfig, type ComputeField } from '../types/types';

/* ── Helpers for robust data extractions ────────────────── */
const getValueByPartialKey = (row: Record<string, string>, search: string): string => {
    // Try exact match first
    if (row[search]) return row[search];
    
    // Try case-insensitive exact match
    const lowerSearch = search.toLowerCase();
    const exactKey = Object.keys(row).find(k => k.toLowerCase() === lowerSearch);
    if (exactKey) return row[exactKey] ?? '0';

    // Try partial match
    const partialKey = Object.keys(row).find(k => k.toLowerCase().includes(lowerSearch));
    return partialKey ? (row[partialKey] ?? '0') : '0';
};

const parseSafeFloat = (val: string): number => {
    if (!val) return 0;
    const cleaned = val.replace(/[^0-9.-]/g, ''); // Remove everything except numbers, dots, and minus
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? 0 : parsed;
};

/* ─────────────────────────────────────────────────────────
   Column definitions — Sludge Energy Generation
   ───────────────────────────────────────────────────────── */
export const SLUDGE_ENERGY_COLUMNS: ColumnDef[] = [
    { key: 'Reporting Year', label: 'Year', type: 'text' },
    { key: 'Month', label: 'Month', type: 'text' },
    { key: 'STP Plant ID', label: 'STP Plant ID', type: 'text' },
    { key: 'Location', label: 'Location', type: 'text' },
    { key: 'Treatment Type', label: 'Treatment Type', type: 'text' },
    { key: 'Sludge Produced per wastewater treatment process (Kg)', label: 'Sludge Produced', type: 'numeric', showInCard: true, unit: 'kg' },
    { key: 'EF of Sludge in KgCO2e/Kg', label: 'EF Sludge', type: 'numeric', unit: 'kg CO₂e/kg' },
    { key: 'Emissions from STP sludge in KgCO2e', label: 'Sludge Emissions', type: 'numeric', showInCard: true, unit: 'kg CO₂e' },
    { key: 'Energy generated using sludge (KWh)', label: 'Energy Generated', type: 'numeric', showInCard: true, unit: 'kWh' },
    { key: 'Avoided Emissions in KgCO2e', label: 'Avoided Emissions', type: 'numeric', showInCard: true, unit: 'kg CO₂e' },
];

export const SLUDGE_ENERGY_COMPUTE_FIELDS: ComputeField[] = [
    {
        targetKey: 'Emissions from STP sludge in KgCO2e',
        formula: (row) => {
            const q = parseSafeFloat(getValueByPartialKey(row, 'Sludge Produced'));
            const ef = parseSafeFloat(getValueByPartialKey(row, 'EF of Sludge'));
            return q * ef;
        },
    },
    {
        targetKey: 'Energy generated using sludge (KWh)',
        formula: (row) => {
            const q = parseSafeFloat(getValueByPartialKey(row, 'Sludge Produced'));
            // Formula: E = Q * 0.35 * 6
            return q * 0.35 * 6;
        },
    },
    {
        targetKey: 'Avoided Emissions in KgCO2e',
        formula: (row) => {
            const q = parseSafeFloat(getValueByPartialKey(row, 'Sludge Produced'));
            const energy = q * 0.35 * 6;
            
            const yearStr = getValueByPartialKey(row, 'Reporting Year');
            // EF logic: 2024: 0.727, 2025: 0.71
            let efElectricity = 0.727; 
            if (yearStr.includes('2025')) {
                efElectricity = 0.71;
            } else if (yearStr.includes('2024')) {
                efElectricity = 0.727;
            }
            
            return energy * efElectricity;
        },
    },
];

export const SLUDGE_ENERGY_TAB: SubTabConfig = {
    key: 'sludge-energy',
    label: 'Sludge Energy',
    sheetName: 'Scope 1_Sludge Energy Generation',
    icon: BatteryCharging,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-100',
    columns: SLUDGE_ENERGY_COLUMNS,
    computeFields: SLUDGE_ENERGY_COMPUTE_FIELDS,
    filterColumns: ['Treatment Type', 'Location'],
    chartTargetKey: 'Emissions from STP sludge in KgCO2e',
};
