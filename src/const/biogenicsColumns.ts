import { Leaf } from 'lucide-react';
import { type ColumnDef, type SubTabConfig, type ComputeField } from '../types/types';

/* ─────────────────────────────────────────────────────────
   Column definitions — Biogenics
   Formula: Biogenic CO2 = Population × Days × EF
            EF = 1 kg CO₂/person/day
   ───────────────────────────────────────────────────────── */

const BIOGENICS_COLUMNS: ColumnDef[] = [
    { key: 'Reporting Year', label: 'Year', type: 'text' },
    { key: 'Month', label: 'Month', type: 'text' },
    { key: 'Category (Students/Teaching Staff/Non-Teaching Staff)', label: 'Category', type: 'text' },
    { key: 'Population', label: 'Population', type: 'numeric' },
    { key: 'Average Days on Campus per Month', label: 'Days on Campus', type: 'numeric' },
    { key: 'Emission Factor (kg CO2 per person per day)', label: 'Emission Factor', type: 'numeric', unit: 'kg CO₂/day' },
    { key: 'Calculated Emissions (kg CO2e)', label: 'Total Biogenic CO2 (kg)', type: 'numeric', showInCard: true, unit: 'kg CO₂' },
    { key: 'Calculated Emissions (tCO2e)', label: 'Total Biogenic CO2 (t)', type: 'numeric', showInCard: true, unit: 'tCO₂' },
];

/* ── Computed fields for Biogenics ──────────────────────── */
const BIOGENICS_COMPUTE_FIELDS: ComputeField[] = [
    {
        // Biogenic CO2 (kg) = Population × Days × EF
        targetKey: 'Calculated Emissions (kg CO2e)',
        formula: (row) => {
            const population = parseFloat(row['Population'] ?? '0');
            const days = parseFloat(row['Average Days on Campus per Month'] ?? '0');
            const ef = parseFloat(row['Emission Factor (kg CO2 per person per day)'] ?? '0');
            
            return (isNaN(population) ? 0 : population)
                 * (isNaN(days) ? 0 : days)
                 * (isNaN(ef) ? 0 : ef);
        },
    },
    {
        // Biogenic CO2 (t) = kg / 1000
        targetKey: 'Calculated Emissions (tCO2e)',
        formula: (row) => {
            const population = parseFloat(row['Population'] ?? '0');
            const days = parseFloat(row['Average Days on Campus per Month'] ?? '0');
            const ef = parseFloat(row['Emission Factor (kg CO2 per person per day)'] ?? '0');
            
            const kgEmission = (isNaN(population) ? 0 : population)
                             * (isNaN(days) ? 0 : days)
                             * (isNaN(ef) ? 0 : ef);
            return kgEmission / 1000;
        },
    },
];

/* ─────────────────────────────────────────────────────────
   Sub-tab configurations for Biogenics
   ───────────────────────────────────────────────────────── */

export const BIOGENICS_TAB: SubTabConfig = {
    key: 'biogenics',
    label: 'Biogenics',
    sheetName: 'Biogenics',
    icon: Leaf,
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    columns: BIOGENICS_COLUMNS,
    computeFields: BIOGENICS_COMPUTE_FIELDS,
    filterColumns: ['Category (Students/Teaching Staff/Non-Teaching Staff)'],
};
