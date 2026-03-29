import { Trash2, Droplets, CarFront } from 'lucide-react';
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
    { key: 'Waste Quantity in tonnes', label: 'Waste Quantity', type: 'numeric', showInCard: true, unit: 'tonnes' },
    { key: 'Emission Factor (kg CO₂e/kg waste)', label: 'Emission Factor', type: 'numeric', unit: 'kg CO₂e/kg' },
    { key: 'Calculated Emissions (kg CO2e)', label: 'Emissions (Kg CO₂e)', type: 'numeric', showInCard: true, unit: 'kg CO₂e' },
    { key: 'Calculated Emissions (tCO2e)', label: 'Emissions (t CO₂e)', type: 'numeric', showInCard: true, unit: 'tCO₂e' },
];

/* ── Computed fields for Garden Waste ───────────────────── */
/* Waste Quantity is in tonnes, EF is per kg,
   so convert: tonnes × 1000 = kg, then kg × EF = kg CO₂e */
const GARDEN_WASTE_COMPUTE_FIELDS: ComputeField[] = [
    {
        targetKey: 'Calculated Emissions (kg CO2e)',
        formula: (row) => {
            const wasteTonnes = parseFloat(row['Waste Quantity in tonnes'] ?? '0');
            const ef = parseFloat(row['Emission Factor (kg CO₂e/kg waste)'] ?? '0');
            const wasteKg = isNaN(wasteTonnes) ? 0 : wasteTonnes * 1000;
            return isNaN(ef) ? 0 : wasteKg * ef;
        },
    },
    {
        targetKey: 'Calculated Emissions (tCO2e)',
        formula: (row) => {
            const wasteTonnes = parseFloat(row['Waste Quantity in tonnes'] ?? '0');
            const ef = parseFloat(row['Emission Factor (kg CO₂e/kg waste)'] ?? '0');
            const wasteKg = isNaN(wasteTonnes) ? 0 : wasteTonnes * 1000;
            const kgEmission = isNaN(ef) ? 0 : wasteKg * ef;
            return kgEmission / 1000;
        },
    },
];

/* ─────────────────────────────────────────────────────────
   Column definitions — Scope 3: STP (Sewage Treatment Plant)
   IPCC 2006 Vol. 5, Ch. 6: Wastewater Treatment
   Formula:
     Total Emissions (kg CO₂e/year) = (Q × EF_anaerobic) + (Q × EF_aerobic)
     For monthly: Q_monthly = Q / 12
     Gross Emissions (kg CO₂e) = (Q / 12) × (EF_aerobic + EF_anaerobic)
     Gross Emissions (kg CO₂e) = (Q / 12) × EF
     Gross Emissions (tCO₂e)  = kg / 1000
   EF column from sheet contains IPCC 2006 reference values.
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

/* ── Computed fields for STP ────────────────────────────── */
/* Q = Wastewater Treated (m³) — annual volume
   Monthly Emissions = (Q / 12) × EF */
const STP_COMPUTE_FIELDS: ComputeField[] = [
    {
        targetKey: 'Gross Emissions (kg CO2e)',
        formula: (row) => {
            const q = parseFloat(row['Wastewater Treated (m3)'] ?? '0');
            const ef = parseFloat(row['EF in kg CO₂e/m³'] ?? '0');
            const qMonthly = isNaN(q) ? 0 : q / 12;
            return isNaN(ef) ? 0 : qMonthly * ef;
        },
    },
    {
        targetKey: 'Gross Emissions (tCO2e)',
        formula: (row) => {
            const q = parseFloat(row['Wastewater Treated (m3)'] ?? '0');
            const ef = parseFloat(row['EF in kg CO₂e/m³'] ?? '0');
            const qMonthly = isNaN(q) ? 0 : q / 12;
            const kgEmission = isNaN(ef) ? 0 : qMonthly * ef;
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
    { key: 'Total Working Days per Month', label: 'Working Days', type: 'numeric' },
    { key: 'Distance', label: 'Distance', type: 'numeric', unit: 'km' },
    { key: 'Transport Mode (Bus/Car/Bike/Train/Walk)', label: 'Transport Mode', type: 'text' },
    { key: 'Fuel Source', label: 'Fuel Source', type: 'text' },
    { key: 'Number of Commuters', label: 'No. of Commuters', type: 'numeric' },
    { key: 'Emission Factor (kg CO2e per km per passenger)', label: 'Emission Factor', type: 'numeric', unit: 'kg CO₂e/km' },
    { key: 'Total Distance (km)', label: 'Total Distance', type: 'numeric', showInCard: true, unit: 'km' },
    { key: 'Calculated Emissions (kg CO2e)', label: 'Emissions (Kg CO₂e)', type: 'numeric', showInCard: true, unit: 'kg CO₂e' },
    { key: 'Calculated Emissions (tCO2e)', label: 'Emissions (t CO₂e)', type: 'numeric', showInCard: true, unit: 'tCO₂e' },
];

/* ── Computed fields for Commuting ──────────────────────── */
const COMMUTING_COMPUTE_FIELDS: ComputeField[] = [
    {
        // Total Distance = No. of Commuters × Distance × Working Days
        targetKey: 'Total Distance (km)',
        formula: (row) => {
            const commuters = parseFloat(row['Number of Commuters'] ?? '0');
            const distance = parseFloat(row['Distance'] ?? '0');
            const days = parseFloat(row['Total Working Days per Month'] ?? '0');
            return (isNaN(commuters) ? 0 : commuters)
                 * (isNaN(distance) ? 0 : distance)
                 * (isNaN(days) ? 0 : days);
        },
    },
    {
        // Emissions (kg CO₂e) = Total Distance × EF
        targetKey: 'Calculated Emissions (kg CO2e)',
        formula: (row) => {
            const commuters = parseFloat(row['Number of Commuters'] ?? '0');
            const distance = parseFloat(row['Distance'] ?? '0');
            const days = parseFloat(row['Total Working Days per Month'] ?? '0');
            const totalDist = (isNaN(commuters) ? 0 : commuters)
                            * (isNaN(distance) ? 0 : distance)
                            * (isNaN(days) ? 0 : days);
            const ef = parseFloat(row['Emission Factor (kg CO2e per km per passenger)'] ?? '0');
            return isNaN(ef) ? 0 : totalDist * ef;
        },
    },
    {
        targetKey: 'Calculated Emissions (tCO2e)',
        formula: (row) => {
            const commuters = parseFloat(row['Number of Commuters'] ?? '0');
            const distance = parseFloat(row['Distance'] ?? '0');
            const days = parseFloat(row['Total Working Days per Month'] ?? '0');
            const totalDist = (isNaN(commuters) ? 0 : commuters)
                            * (isNaN(distance) ? 0 : distance)
                            * (isNaN(days) ? 0 : days);
            const ef = parseFloat(row['Emission Factor (kg CO2e per km per passenger)'] ?? '0');
            const kgEmission = isNaN(ef) ? 0 : totalDist * ef;
            return kgEmission / 1000;
        },
    },
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
        filterColumns: ['Waste Source Location'],
    },
    {
        key: 'stp',
        label: 'STP',
        sheetName: 'Scope 3_STP',
        icon: Droplets,
        color: 'text-cyan-600',
        bgColor: 'bg-cyan-100',
        columns: STP_COLUMNS,
        computeFields: STP_COMPUTE_FIELDS,
        filterColumns: ['Treatment Type'],
    },
    {
        key: 'commuting',
        label: 'Commuting',
        sheetName: 'Scope 3_Commuting',
        icon: CarFront,
        color: 'text-violet-600',
        bgColor: 'bg-violet-100',
        columns: COMMUTING_COLUMNS,
        computeFields: COMMUTING_COMPUTE_FIELDS,
        filterColumns: ['Commuter Category (Student/Teaching Staff/Non-Teaching Staff)'],
    },
];

