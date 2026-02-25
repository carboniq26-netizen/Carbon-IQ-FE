import { Zap, Sun } from 'lucide-react';
import { type ColumnDef, type SubTabConfig } from '../types/types';

/* ─────────────────────────────────────────────────────────
   Column definitions — Scope 2: Purchased Electricity
   Formula: Emissions = Electricity Consumed (kWh) × Grid EF
   Net Electricity = Purchased − Solar Generated
   ───────────────────────────────────────────────────────── */

const ELECTRICITY_COLUMNS: ColumnDef[] = [
    { key: 'Reporting Year', label: 'Year', type: 'text' },
    { key: 'Month', label: 'Month', type: 'text' },
    { key: 'Meter ID', label: 'Meter ID', type: 'text' },
    { key: 'Building/Location', label: 'Location', type: 'text' },
    { key: 'Electricity Provider', label: 'Provider', type: 'text' },
    { key: 'Tariff Category (HT/LT)', label: 'Tariff', type: 'text' },
    { key: 'Electricity Consumed (kWh)', label: 'Electricity Consumed', type: 'numeric', showInCard: true, unit: 'kWh' },
    { key: 'On-site Solar Generation (kWh) (Optional)', label: 'Solar Generation', type: 'numeric', showInCard: true, unit: 'kWh' },
    { key: 'Net Grid Electricity (kWh)', label: 'Net Grid Electricity', type: 'numeric', showInCard: true, unit: 'kWh' },
    { key: 'Grid Emission Factor (kg CO2e/kWh)', label: 'Grid Emission Factor', type: 'numeric', showInCard: true, unit: 'kg CO₂e/kWh' },
    { key: 'Calculated Emissions (kg CO2e)', label: 'Emissions (kg)', type: 'numeric', showInCard: true, unit: 'kg CO₂e' },
    { key: 'Calculated Emissions (tCO2e)', label: 'Emissions (t)', type: 'numeric', showInCard: true, unit: 'tCO₂e' },
    { key: 'Scope 2 Method (Location-Based/Market-Based)', label: 'Scope 2 Method', type: 'text' },
    { key: 'Data Source (Electricity Bill/Meter Reading)', label: 'Data Source', type: 'text' },
    { key: 'Remarks', label: 'Remarks', type: 'text' },
];

/* ─────────────────────────────────────────────────────────
   Column definitions — Scope 2: Solar Power Generated
   (Placeholder — columns will be updated when sheet is ready)
   ───────────────────────────────────────────────────────── */

const SOLAR_POWER_COLUMNS: ColumnDef[] = [];

/* ─────────────────────────────────────────────────────────
   Sub-tab configurations for Scope 2
   ───────────────────────────────────────────────────────── */

export const SCOPE2_TABS: SubTabConfig[] = [
    {
        key: 'electricity',
        label: 'Electricity',
        sheetName: 'Scope2_Purchased_Electricity',
        icon: Zap,
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-100',
        columns: ELECTRICITY_COLUMNS,
    },
    {
        key: 'solar-power',
        label: 'Solar Power Generated',
        sheetName: 'Scope2_Solar_Power_Generated',
        icon: Sun,
        color: 'text-orange-500',
        bgColor: 'bg-orange-100',
        columns: SOLAR_POWER_COLUMNS,
    },
];
