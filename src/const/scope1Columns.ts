import {
    Fuel,
    FlameKindling,
    Bus,
    Wind,
    Droplets,
    Flame,
} from 'lucide-react';
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
   Column definitions — derived from the actual Google Sheets
   ───────────────────────────────────────────────────────── */

const DG_SET_COLUMNS: ColumnDef[] = [
    { key: 'Reporting Year', label: 'Year', type: 'text' },
    { key: 'Month', label: 'Month', type: 'text' },
    { key: 'DG Set ID', label: 'DG Set ID', type: 'text' },
    { key: 'Type of DG', label: 'Type of DG', type: 'text' },
    { key: 'Fuel Consumption (Litres)', label: 'Diesel Consumed', type: 'numeric', showInCard: true, unit: 'Litres' },
    { key: 'Emission Factor (kg CO2e/Litre)', label: 'Emission Factor', type: 'numeric', unit: 'kg CO₂e/L' },
    { key: 'Calculated Emissions (kg CO2e)', label: 'Emissions (Kg CO₂e)', type: 'numeric', showInCard: true, unit: 'kg CO₂e' },
    { key: 'Calculated Emissions (tCO2e)', label: 'Emissions (t CO₂e)', type: 'numeric', showInCard: true, unit: 'tCO₂e' },
];

/* ── Computed fields for DG Set (client-side formula) ──── */
const DG_SET_COMPUTE_FIELDS: ComputeField[] = [
    {
        targetKey: 'Calculated Emissions (kg CO2e)',
        formula: (row) => {
            const fuel = parseFloat(row['Fuel Consumption (Litres)'] ?? '0');
            const ef = parseFloat(row['Emission Factor (kg CO2e/Litre)'] ?? '0');
            return isNaN(fuel) || isNaN(ef) ? 0 : fuel * ef;
        },
    },
    {
        targetKey: 'Calculated Emissions (tCO2e)',
        formula: (row) => {
            const fuel = parseFloat(row['Fuel Consumption (Litres)'] ?? '0');
            const ef = parseFloat(row['Emission Factor (kg CO2e/Litre)'] ?? '0');
            const kgEmission = isNaN(fuel) || isNaN(ef) ? 0 : fuel * ef;
            return kgEmission / 1000;
        },
    },
];

const LPG_COLUMNS: ColumnDef[] = [
    { key: 'Reporting Year', label: 'Year', type: 'text' },
    { key: 'Month', label: 'Month', type: 'text' },
    { key: 'Location (Kitchen/Lab/Boiler)', label: 'Location', type: 'text' },
    { key: 'Cylinder Size (kg)', label: 'Cylinder Size', type: 'numeric', unit: 'kg' },
    { key: 'Number of Cylinders Used', label: 'Cylinders Used', type: 'numeric' },
    { key: 'Total LPG Consumed (kg)', label: 'LPG Consumed', type: 'numeric', showInCard: true, unit: 'kg' },
    { key: 'Emission Factor (kg CO2e/kg LPG)', label: 'Emission Factor', type: 'numeric', unit: 'kg CO₂e/kg' },
    { key: 'Calculated Emissions (kg CO2e)', label: 'Emissions (Kg CO₂e)', type: 'numeric', showInCard: true, unit: 'kg CO₂e' },
    { key: 'Calculated Emissions (tCO2e)', label: 'Emissions (t CO₂e)', type: 'numeric', showInCard: true, unit: 'tCO₂e' },
];

/* ── Computed fields for LPG (client-side formula) ──────── */
const LPG_COMPUTE_FIELDS: ComputeField[] = [
    {
        // Total LPG (kg) = No. of Cylinders × Cylinder Size
        targetKey: 'Total LPG Consumed (kg)',
        formula: (row) => {
            const cylinders = parseFloat(row['Number of Cylinders Used'] ?? '0');
            const size = parseFloat(row['Cylinder Size (kg)'] ?? '0');
            return isNaN(cylinders) || isNaN(size) ? 0 : cylinders * size;
        },
    },
    {
        // Emissions (kg CO₂e) = LPG (kg) × EF
        targetKey: 'Calculated Emissions (kg CO2e)',
        formula: (row) => {
            const cylinders = parseFloat(row['Number of Cylinders Used'] ?? '0');
            const size = parseFloat(row['Cylinder Size (kg)'] ?? '0');
            const lpg = isNaN(cylinders) || isNaN(size) ? 0 : cylinders * size;
            const ef = parseFloat(row['Emission Factor (kg CO2e/kg LPG)'] ?? '0');
            return isNaN(ef) ? 0 : lpg * ef;
        },
    },
    {
        // Emissions (tCO₂e) = kg / 1000
        targetKey: 'Calculated Emissions (tCO2e)',
        formula: (row) => {
            const cylinders = parseFloat(row['Number of Cylinders Used'] ?? '0');
            const size = parseFloat(row['Cylinder Size (kg)'] ?? '0');
            const lpg = isNaN(cylinders) || isNaN(size) ? 0 : cylinders * size;
            const ef = parseFloat(row['Emission Factor (kg CO2e/kg LPG)'] ?? '0');
            const kgEmission = isNaN(ef) ? 0 : lpg * ef;
            return kgEmission / 1000;
        },
    },
];

const VEHICLE_COLUMNS: ColumnDef[] = [
    { key: 'Reporting Year', label: 'Year', type: 'text' },
    { key: 'Month', label: 'Month', type: 'text' },
    { key: 'Vehicle ID', label: 'Vehicle ID', type: 'text' },
    { key: 'Vehicle Type (Bus/Car/Van/Bike)', label: 'Vehicle Type', type: 'text' },
    { key: 'Fuel Type (Diesel/Petrol/CNG)', label: 'Fuel Type', type: 'text' },
    { key: 'Fuel Consumed (Litres or kg)', label: 'Fuel Consumed', type: 'numeric', showInCard: true, unit: 'L/kg' },
    { key: 'Emission Factor (kg CO2e per Litre or kg)', label: 'Emission Factor', type: 'numeric', unit: 'kg CO₂e/L' },
    { key: 'Calculated Emissions (kg CO2e)', label: 'Emissions (Kg CO₂e)', type: 'numeric', showInCard: true, unit: 'kg CO₂e' },
    { key: 'Calculated Emissions (tCO2e)', label: 'Emissions (t CO₂e)', type: 'numeric', showInCard: true, unit: 'tCO₂e' },
];

/* ── Computed fields for Campus Owned Vehicles (same as DG Set) ── */
const VEHICLE_COMPUTE_FIELDS: ComputeField[] = [
    {
        targetKey: 'Calculated Emissions (kg CO2e)',
        formula: (row) => {
            const fuel = parseFloat(row['Fuel Consumed (Litres or kg)'] ?? '0');
            const ef = parseFloat(row['Emission Factor (kg CO2e per Litre or kg)'] ?? '0');
            return isNaN(fuel) || isNaN(ef) ? 0 : fuel * ef;
        },
    },
    {
        targetKey: 'Calculated Emissions (tCO2e)',
        formula: (row) => {
            const fuel = parseFloat(row['Fuel Consumed (Litres or kg)'] ?? '0');
            const ef = parseFloat(row['Emission Factor (kg CO2e per Litre or kg)'] ?? '0');
            const kgEmission = isNaN(fuel) || isNaN(ef) ? 0 : fuel * ef;
            return kgEmission / 1000;
        },
    },
];

const FUGITIVE_COLUMNS: ColumnDef[] = [
    { key: 'Reporting Year', label: 'Year', type: 'text' },
    { key: 'Equipment ID', label: 'Equipment ID', type: 'text' },
    { key: 'Category', label: 'Category', type: 'text' },
    { key: 'Equipment Type (AC/Chiller/Refrigerator)', label: 'Equipment Type', type: 'text' },
    { key: 'Refrigerant Type (R22/R134a/R410A/etc.)', label: 'Refrigerant Type', type: 'text' },
    { key: 'Refrigerant Refilled During Year (kg)', label: 'Refilled', type: 'numeric', showInCard: true, unit: 'kg' },
    { key: 'GWP of Refrigerant', label: 'GWP', type: 'numeric' },
    { key: 'Calculated Emissions (kg CO2e)', label: 'Emissions (Kg CO₂e)', type: 'numeric', showInCard: true, unit: 'kg CO₂e' },
    { key: 'Calculated Emissions (tCO2e)', label: 'Emissions (t CO₂e)', type: 'numeric', showInCard: true, unit: 'tCO₂e' },
];

/* ── Computed fields for Fugitive Emissions ─────────────── */
const FUGITIVE_COMPUTE_FIELDS: ComputeField[] = [
    {
        targetKey: 'Calculated Emissions (kg CO2e)',
        formula: (row) => {
            const refilledStr = row['Refrigerant Refilled During Year (kg)'] ?? '0';
            const gwpStr = row['GWP of Refrigerant'] ?? '0';
            
            const refilledArr = refilledStr.split(',').map(s => parseFloat(s.trim()));
            const gwpArr = gwpStr.split(',').map(s => parseFloat(s.trim()));
            
            let total = 0;
            const len = Math.max(refilledArr.length, gwpArr.length);
            for (let i = 0; i < len; i++) {
                const r = refilledArr[i] || 0;
                const g = gwpArr[i] || 0;
                if (!isNaN(r) && !isNaN(g)) {
                    total += r * g;
                }
            }
            return total;
        },
    },
    {
        targetKey: 'Calculated Emissions (tCO2e)',
        formula: (row) => {
            const refilledStr = row['Refrigerant Refilled During Year (kg)'] ?? '0';
            const gwpStr = row['GWP of Refrigerant'] ?? '0';
            
            const refilledArr = refilledStr.split(',').map(s => parseFloat(s.trim()));
            const gwpArr = gwpStr.split(',').map(s => parseFloat(s.trim()));
            
            let total = 0;
            const len = Math.max(refilledArr.length, gwpArr.length);
            for (let i = 0; i < len; i++) {
                const r = refilledArr[i] || 0;
                const g = gwpArr[i] || 0;
                if (!isNaN(r) && !isNaN(g)) {
                    total += r * g;
                }
            }
            return total / 1000;
        },
    },
];

/* ─────────────────────────────────────────────────────────
   Column definitions — Biogas (Migrated from Scope 3)
   ───────────────────────────────────────────────────────── */
const BIOGAS_COLUMNS: ColumnDef[] = [
    { key: 'Reporting Year', label: 'Year', type: 'text' },
    { key: 'Month', label: 'Month', type: 'text' },
    { key: 'Biogas Plant ID', label: 'Biogas Plant ID', type: 'text' },
    { key: 'Food Waste Processed in Kg', label: 'Food Waste Processed (Source Kg)', type: 'numeric', unit: 'kg' },
    { key: 'Food Waste Processed (kg)', label: 'Food Waste Processed', type: 'numeric', showInCard: true, unit: 'kg' },
    { key: 'CH4 Produced (kg)', label: 'Biogas (Methane) Produced', type: 'numeric', showInCard: true, unit: 'kg' },
    { key: 'CH4 Utilized (kg)', label: 'Biogas Utilized for Cooking', type: 'numeric', showInCard: true, unit: 'kg' },
    { key: 'Energy from Biogas (MJ)', label: 'Energy from Biogas', type: 'numeric', showInCard: true, unit: 'MJ' },
    { key: 'LPG Replaced (kg)', label: 'LPG Equivalent Replaced', type: 'numeric', showInCard: true, unit: 'kg' },
    { key: 'Avoided CO2 (kg CO2e)', label: 'Avoided Emissions (LPG Replacement)', type: 'numeric', showInCard: true, unit: 'kg CO₂e' },
    { key: 'CH4 Emissions (kg CO2e)', label: 'Methane Leakage/CH4 Emissions', type: 'numeric', showInCard: true, unit: 'kg CO₂e' },
    { key: 'Net Emissions (kg CO2e)', label: 'Net Emissions', type: 'numeric', showInCard: true, unit: 'kg CO₂e' },
    { key: 'Net Emissions (tCO2e)', label: 'Net Emissions', type: 'numeric', showInCard: false, unit: 'tCO₂e' },
];

const BIOGAS_COMPUTE_FIELDS: ComputeField[] = [
    {
        targetKey: 'Food Waste Processed (kg)',
        formula: (row) => {
             return parseSafeFloat(getValueByPartialKey(row, 'Food Waste Processed'));
        }
    },
    {
        targetKey: 'CH4 Produced (kg)',
        formula: (row) => {
             const sourceKg = parseSafeFloat(getValueByPartialKey(row, 'Food Waste Processed'));
             const W = sourceKg / 1000;
             return W * 0.85 * 0.6 * 0.5 * 1.33;
        }
    },
    {
        targetKey: 'CH4 Utilized (kg)',
        formula: (row) => {
             const sourceKg = parseSafeFloat(getValueByPartialKey(row, 'Food Waste Processed'));
             const W = sourceKg / 1000;
             const ch4Produced = W * 0.85 * 0.6 * 0.5 * 1.33;
             return ch4Produced * 0.8;
        }
    },
    {
        targetKey: 'Energy from Biogas (MJ)',
        formula: (row) => {
             const sourceKg = parseSafeFloat(getValueByPartialKey(row, 'Food Waste Processed'));
             const W = sourceKg / 1000;
             const ch4Produced = W * 0.85 * 0.6 * 0.5 * 1.33;
             const ch4Utilized = ch4Produced * 0.8;
             return ch4Utilized * 50;
        }
    },
    {
        targetKey: 'LPG Replaced (kg)',
        formula: (row) => {
             const sourceKg = parseSafeFloat(getValueByPartialKey(row, 'Food Waste Processed'));
             const W = sourceKg / 1000;
             const ch4Produced = W * 0.85 * 0.6 * 0.5 * 1.33;
             const ch4Utilized = ch4Produced * 0.8;
             const energyFromBiogas = ch4Utilized * 50;
             return energyFromBiogas / 46;
        }
    },
    {
        targetKey: 'Avoided CO2 (kg CO2e)',
        formula: (row) => {
             const sourceKg = parseSafeFloat(getValueByPartialKey(row, 'Food Waste Processed'));
             const W = sourceKg / 1000;
             const ch4Produced = W * 0.85 * 0.6 * 0.5 * 1.33;
             const ch4Utilized = ch4Produced * 0.8;
             const energyFromBiogas = ch4Utilized * 50;
             const lpgReplaced = energyFromBiogas / 46;
             return lpgReplaced * 2.98;
        }
    },
    {
        targetKey: 'CH4 Emissions (kg CO2e)',
        formula: (row) => {
             const sourceKg = parseSafeFloat(getValueByPartialKey(row, 'Food Waste Processed'));
             const W = sourceKg / 1000;
             return W * 0.85 * 0.6 * 0.2 * 0.5 * 1.33 * 28;
        }
    },
    {
        targetKey: 'Net Emissions (kg CO2e)',
        formula: (row) => {
             const sourceKg = parseSafeFloat(getValueByPartialKey(row, 'Food Waste Processed'));
             const W = sourceKg / 1000;
             const ch4Produced = W * 0.85 * 0.6 * 0.5 * 1.33;
             const ch4Utilized = ch4Produced * 0.8;
             const energyFromBiogas = ch4Utilized * 50;
             const lpgReplaced = energyFromBiogas / 46;
             const avoidedCO2 = lpgReplaced * 2.98;
             const ch4Emissions = W * 0.85 * 0.6 * 0.2 * 0.5 * 1.33 * 28;
             return ch4Emissions - avoidedCO2;
        }
    },
    {
        targetKey: 'Net Emissions (tCO2e)',
        formula: (row) => {
             const sourceKg = parseSafeFloat(getValueByPartialKey(row, 'Food Waste Processed'));
             const W = sourceKg / 1000;
             const ch4Produced = W * 0.85 * 0.6 * 0.5 * 1.33;
             const ch4Utilized = ch4Produced * 0.8;
             const energyFromBiogas = ch4Utilized * 50;
             const lpgReplaced = energyFromBiogas / 46;
             const avoidedCO2 = lpgReplaced * 2.98;
             const ch4Emissions = W * 0.85 * 0.6 * 0.2 * 0.5 * 1.33 * 28;
             return (ch4Emissions - avoidedCO2) / 1000;
        }
    }
];

/* ─────────────────────────────────────────────────────────
   Column definitions — STP (Migrated from Scope 3)
   ───────────────────────────────────────────────────────── */
const STP_COLUMNS: ColumnDef[] = [
    { key: 'Reporting Year', label: 'Year', type: 'text' },
    { key: 'Month', label: 'Month', type: 'text' },
    { key: 'STP Plant ID', label: 'STP Plant ID', type: 'text' },
    { key: 'Location', label: 'Location', type: 'text' },
    { key: 'Treatment Type', label: 'Treatment Type', type: 'text' },
    { key: 'Wastewater Treated (m3)', label: 'Wastewater Treated', type: 'numeric', showInCard: true, unit: 'm³' },
    { key: 'EF in kg CO₂e/m³', label: 'Emission Factor', type: 'numeric', unit: 'kg CO₂e/m³' },
    { key: 'Gross Emissions (kg CO2e)', label: 'Gross Emissions (Kg CO₂e)', type: 'numeric', showInCard: true, unit: 'kg CO₂e' },
    { key: 'Gross Emissions (tCO2e)', label: 'Gross Emissions (t CO₂e)', type: 'numeric', showInCard: true, unit: 'tCO₂e' },
];

const STP_COMPUTE_FIELDS: ComputeField[] = [
    {
        targetKey: 'Gross Emissions (kg CO2e)',
        formula: (row) => {
            const q = parseSafeFloat(getValueByPartialKey(row, 'Wastewater Treated'));
            const ef = parseSafeFloat(getValueByPartialKey(row, 'EF in kg'));
            return q * ef;
        },
    },
    {
        targetKey: 'Gross Emissions (tCO2e)',
        formula: (row) => {
            const q = parseSafeFloat(getValueByPartialKey(row, 'Wastewater Treated'));
            const ef = parseSafeFloat(getValueByPartialKey(row, 'EF in kg'));
            return (q * ef) / 1000;
        },
    },
];

/* ─────────────────────────────────────────────────────────
   Sub-tab configurations for Scope 1
   ───────────────────────────────────────────────────────── */

export const SCOPE1_TABS: SubTabConfig[] = [
    {
        key: 'dg-data',
        label: 'DG Set',
        sheetName: 'Scope1_DG_Set_Data',
        icon: Fuel,
        color: 'text-orange-600',
        bgColor: 'bg-orange-100',
        columns: DG_SET_COLUMNS,
        computeFields: DG_SET_COMPUTE_FIELDS,
        filterColumns: ['Type of DG'],
    },
    {
        key: 'lpg-consumption',
        label: 'LPG Consumption',
        sheetName: 'Scope1_LPG_Consumption',
        icon: FlameKindling,
        color: 'text-red-600',
        bgColor: 'bg-red-100',
        columns: LPG_COLUMNS,
        computeFields: LPG_COMPUTE_FIELDS,
        filterColumns: ['Location (Kitchen/Lab/Boiler)'],
    },
    {
        key: 'campus-vehicles',
        label: 'Campus Owned Vehicles',
        sheetName: 'Scope1_Campus_Owned_Vehicles',
        icon: Bus,
        color: 'text-blue-600',
        bgColor: 'bg-blue-100',
        columns: VEHICLE_COLUMNS,
        computeFields: VEHICLE_COMPUTE_FIELDS,
        filterColumns: [
            'Vehicle Type (Bus/Car/Van/Bike)',
            'Fuel Type (Diesel/Petrol/CNG)',
        ],
    },
    {
        key: 'fugitive-emissions',
        label: 'Fugitive Emissions',
        sheetName: 'Scope1_Fugitive_Emissions',
        icon: Wind,
        color: 'text-teal-600',
        bgColor: 'bg-teal-100',
        columns: FUGITIVE_COLUMNS,
        computeFields: FUGITIVE_COMPUTE_FIELDS,
        filterColumns: ['Equipment Type (AC/Chiller/Refrigerator)'],
    },
    {
        key: 'biogas',
        label: 'Biogas',
        sheetName: 'Scope 3_Biogas',
        icon: Flame,
        color: 'text-orange-500',
        bgColor: 'bg-orange-100',
        columns: BIOGAS_COLUMNS,
        computeFields: BIOGAS_COMPUTE_FIELDS,
        filterColumns: ['Biogas Plant ID'],
    },
    {
        key: 'stp',
        label: 'Sewage Treatment Plant (STP)',
        sheetName: 'Scope 3_STP',
        icon: Droplets,
        color: 'text-cyan-600',
        bgColor: 'bg-cyan-100',
        columns: STP_COLUMNS,
        computeFields: STP_COMPUTE_FIELDS,
        filterColumns: ['Treatment Type'],
        description: 'Note: While the STP utilizes purchased electricity (accounted under Scope 2) for various processes such as the running of pumps,aerators etc., emissions from biological treatment processes (CH₄ and N₂O) are classified as Scope 1, as they occur directly within the operational boundary.',
    },
];
