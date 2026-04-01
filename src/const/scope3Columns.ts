import { Trash2, CarFront, Building } from 'lucide-react';
import { type ColumnDef, type SubTabConfig, type ComputeField } from '../types/types';

/* ─────────────────────────────────────────────────────────
   Column definitions — Scope 3: Garden Waste
   Formula: Emissions (kg CO₂e) = Waste Quantity (tonnes) × 1000 × EF (kg CO₂e/kg)
            Emissions (tCO₂e)  = Emissions (kg CO₂e) / 1000
   ───────────────────────────────────────────────────────── */

const GARDEN_WASTE_COLUMNS: ColumnDef[] = [
    { key: 'Reporting Year', label: 'Year', type: 'text' },
    { key: 'Month', label: 'Month', type: 'text' },
    { key: 'Waste Source Location', label: 'Waste Source Location', type: 'text' },
    { key: 'Disposal Method (Composting/Landfill/Mulching/Open Burning)', label: 'Disposal Method', type: 'text' },
    { key: 'Waste Quantity in Kg', label: 'Waste Quantity (Source Kg)', type: 'numeric', unit: 'kg' },
    { key: 'Waste Quantity (kg)', label: 'Waste Quantity', type: 'numeric', showInCard: true, unit: 'kg' },
    { key: 'Emission Factor (kg CO₂e/kg waste)', label: 'Emission Factor', type: 'numeric', unit: 'kg CO₂e/kg' },
    { key: 'Calculated Emissions (kg CO2e)', label: 'Emissions (Kg CO₂e)', type: 'numeric', showInCard: true, unit: 'kg CO₂e' },
    { key: 'Calculated Emissions (tCO2e)', label: 'Emissions (t CO₂e)', type: 'numeric', showInCard: true, unit: 'tCO₂e' },
];

/* ── Computed fields for Garden Waste ───────────────────── */
/* Source is now in Kg. kg × EF = kg CO₂e */
const GARDEN_WASTE_COMPUTE_FIELDS: ComputeField[] = [
    {
        targetKey: 'Waste Quantity (kg)',
        formula: (row) => {
            const wasteKg = parseFloat(row['Waste Quantity in Kg'] ?? '0');
            return isNaN(wasteKg) ? 0 : wasteKg;
        },
    },
    {
        targetKey: 'Calculated Emissions (kg CO2e)',
        formula: (row) => {
            const wasteKg = parseFloat(row['Waste Quantity in Kg'] ?? '0');
            const ef = parseFloat(row['Emission Factor (kg CO₂e/kg waste)'] ?? '0');
            return isNaN(wasteKg) || isNaN(ef) ? 0 : wasteKg * ef;
        },
    },
    {
        targetKey: 'Calculated Emissions (tCO2e)',
        formula: (row) => {
            const wasteKg = parseFloat(row['Waste Quantity in Kg'] ?? '0');
            const ef = parseFloat(row['Emission Factor (kg CO₂e/kg waste)'] ?? '0');
            const kgEmission = isNaN(wasteKg) || isNaN(ef) ? 0 : wasteKg * ef;
            return kgEmission / 1000;
        },
    },
];

/* ─────────────────────────────────────────────────────────
   Column definitions — Scope 3: Commuting
   Formula:
     Total Distance (km) = Number of Commuters × Distance × Working Days
     Emissions (kg CO₂e)  = Total Distance × EF
     Emissions (tCO₂e)    = kg / 1000
   ───────────────────────────────────────────────────────── */

const COMMUTING_COLUMNS: ColumnDef[] = [
    { key: 'Reporting Year', label: 'Year', type: 'text' },
    { key: 'Month', label: 'Month', type: 'text' },
    { key: 'Commuter Category (Student/Teaching Staff/Non-Teaching Staff)', label: 'Commuter Category', type: 'text' },
    { key: 'Transport Mode (Bus/Car/Bike/Train/Walk)', label: 'Transport Mode', type: 'text' },
    { key: 'Total Working Days per Month', label: 'Working Days', type: 'numeric' },
    { key: 'Distance', label: 'Distance', type: 'numeric', unit: 'km' },
    { key: 'Number of Commuters', label: 'No. of Commuters', type: 'numeric' },
    { key: 'Fuel Source', label: 'Fuel Source', type: 'text' },
    { key: 'Emission Factor (kg CO2e per km per passenger)', label: 'Emission Factor', type: 'numeric', unit: 'kg CO₂e/km' },
    { key: 'Total Distance (km)', label: 'Total Distance', type: 'numeric', showInCard: true, unit: 'km' },
    { key: 'Calculated Emissions (kg CO2e)', label: 'Emissions (Kg CO₂e)', type: 'numeric', showInCard: true, unit: 'kg CO₂e' },
    { key: 'Calculated Emissions (tCO2e)', label: 'Emissions (t CO₂e)', type: 'numeric', showInCard: true, unit: 'tCO₂e' },
];

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

/* ── Computed fields for Commuting ──────────────────────── */
const COMMUTING_COMPUTE_FIELDS: ComputeField[] = [
    {
        targetKey: 'Total Distance (km)',
        formula: (row) => {
            const commuters = parseSafeFloat(getValueByPartialKey(row, 'Number of Commuters'));
            const distance = parseSafeFloat(getValueByPartialKey(row, 'Distance'));
            const days = parseSafeFloat(getValueByPartialKey(row, 'Total Working Days per Month'));
            return commuters * distance * days;
        },
    },
    {
        targetKey: 'Calculated Emissions (kg CO2e)',
        formula: (row) => {
            const commuters = parseSafeFloat(getValueByPartialKey(row, 'Number of Commuters'));
            const distance = parseSafeFloat(getValueByPartialKey(row, 'Distance'));
            const days = parseSafeFloat(getValueByPartialKey(row, 'Total Working Days per Month'));
            const ef = parseSafeFloat(getValueByPartialKey(row, 'Emission Factor'));
            return commuters * distance * days * ef;
        },
    },
    {
        targetKey: 'Calculated Emissions (tCO2e)',
        formula: (row) => {
            const commuters = parseSafeFloat(getValueByPartialKey(row, 'Number of Commuters'));
            const distance = parseSafeFloat(getValueByPartialKey(row, 'Distance'));
            const days = parseSafeFloat(getValueByPartialKey(row, 'Total Working Days per Month'));
            const ef = parseSafeFloat(getValueByPartialKey(row, 'Emission Factor'));
            return (commuters * distance * days * ef) / 1000;
        },
    },
];

/* ─────────────────────────────────────────────────────────
   Column definitions — Embodied Emissions
   ───────────────────────────────────────────────────────── */

const EMBODIED_EMISSIONS_COLUMNS: ColumnDef[] = [
    { key: 'Reporting Year', label: 'Year', type: 'text' },
    { key: 'Building ID', label: 'Building ID', type: 'text' },
    { key: 'Building Name', label: 'Building Name', type: 'text' },
    { key: 'Year of Construction', label: 'Year Built', type: 'text' },
    { key: 'Built-up Area (m2)', label: 'Built-up Area (m²)', type: 'numeric' },
    { key: 'Area Emission Factor (Kg CO2e/m2/year)', label: 'Emission Factor', type: 'numeric', unit: 'kg CO₂e/m²' },
    { key: 'Assumed Building Lifetime (Years)', label: 'Lifetime (Years)', type: 'numeric', unit: 'Years' },
    { key: 'Annualised Emissions (kg CO2e)', label: 'Annualised Emissions', type: 'numeric', showInCard: true, unit: 'kg CO₂e' },
    { key: 'Annualised Emissions (tCO2e)', label: 'Annualised (tCO₂e)', type: 'numeric', showInCard: true, unit: 'tCO₂e' },
    { key: 'Total Embodied Emissions (kg CO2e)', label: 'Total Embodied', type: 'numeric', showInCard: true, unit: 'kg CO₂e' },
    { key: 'Total Embodied Emissions (tCO2e)', label: 'Total (tCO₂e)', type: 'numeric', showInCard: true, unit: 'tCO₂e' },
];

const EMBODIED_COMPUTE_FIELDS: ComputeField[] = [
    {
        targetKey: 'Total Embodied Emissions (kg CO2e)',
        formula: (row: Record<string, string>) => {
             const area = parseFloat(row['Built-up Area (m2)'] ?? '0');
             const ef = parseFloat(row['Area Emission Factor (Kg CO2e/m2/year)'] ?? '0');
             return (isNaN(area) ? 0 : area) * (isNaN(ef) ? 0 : ef);
        }
    },
    {
        targetKey: 'Total Embodied Emissions (tCO2e)',
        formula: (row: Record<string, string>) => {
             const area = parseFloat(row['Built-up Area (m2)'] ?? '0');
             const ef = parseFloat(row['Area Emission Factor (Kg CO2e/m2/year)'] ?? '0');
             return ((isNaN(area) ? 0 : area) * (isNaN(ef) ? 0 : ef)) / 1000;
        }
    },
    {
        targetKey: 'Annualised Emissions (kg CO2e)',
        formula: (row: Record<string, string>) => {
             const area = parseFloat(row['Built-up Area (m2)'] ?? '0');
             const ef = parseFloat(row['Area Emission Factor (Kg CO2e/m2/year)'] ?? '0');
             const embodiedKg = (isNaN(area) ? 0 : area) * (isNaN(ef) ? 0 : ef);
             
             const lifetime = parseFloat(row['Assumed Building Lifetime (Years)'] ?? '150');
             const validLifetime = isNaN(lifetime) || lifetime <= 0 ? 150 : lifetime;
             
             return embodiedKg / validLifetime;
        }
    },
    {
        targetKey: 'Annualised Emissions (tCO2e)',
        formula: (row: Record<string, string>) => {
             const area = parseFloat(row['Built-up Area (m2)'] ?? '0');
             const ef = parseFloat(row['Area Emission Factor (Kg CO2e/m2/year)'] ?? '0');
             const embodiedKg = (isNaN(area) ? 0 : area) * (isNaN(ef) ? 0 : ef);
             
             const lifetime = parseFloat(row['Assumed Building Lifetime (Years)'] ?? '150');
             const validLifetime = isNaN(lifetime) || lifetime <= 0 ? 150 : lifetime;
             
             return (embodiedKg / validLifetime) / 1000;
        }
    }
];

/* ─────────────────────────────────────────────────────────
   Sub-tab configurations for Scope 3
   ───────────────────────────────────────────────────────── */

export const SCOPE3_TABS: SubTabConfig[] = [
    {
        key: 'garden-waste',
        label: 'Garden Waste',
        sheetName: 'Scope 3_Garden Waste',
        icon: Trash2,
        color: 'text-green-600',
        bgColor: 'bg-green-100',
        columns: GARDEN_WASTE_COLUMNS,
        computeFields: GARDEN_WASTE_COMPUTE_FIELDS,
        filterColumns: ['Waste Source Location', 'Disposal Method (Composting/Landfill/Mulching/Open Burning)'],
    },
    {
        key: 'embodied-emissions',
        label: 'Embodied Emissions',
        sheetName: 'Scope 3_Embodied Emissions',
        icon: Building,
        color: 'text-zinc-600',
        bgColor: 'bg-zinc-100',
        columns: EMBODIED_EMISSIONS_COLUMNS,
        computeFields: EMBODIED_COMPUTE_FIELDS,
        filterColumns: ['Building Name'],
    },
    {
        key: 'commuting',
        label: 'Commuters',
        sheetName: 'Scope 3_Commuting',
        icon: CarFront,
        color: 'text-violet-600',
        bgColor: 'bg-violet-100',
        columns: COMMUTING_COLUMNS,
        computeFields: COMMUTING_COMPUTE_FIELDS,
        filterColumns: [
            'Commuter Category (Student/Teaching Staff/Non-Teaching Staff)',
            'Transport Mode (Bus/Car/Bike/Train/Walk)',
        ],
    },
];

