import { Zap } from 'lucide-react';
import { type ColumnDef, type SubTabConfig, type ComputeField } from '../types/types';

/* ─────────────────────────────────────────────────────────
   Column definitions — Scope 2: Purchased Electricity
   Formula: Emissions = Electricity Consumed (kWh) × Grid EF
   Net Electricity = Purchased − Solar Generated
   ───────────────────────────────────────────────────────── */

const ELECTRICITY_COLUMNS: ColumnDef[] = [
    { key: 'Reporting Year', label: 'Year', type: 'text' },
    { key: 'Month', label: 'Month', type: 'text' },
    { key: 'Building', label: 'Building', type: 'text' },
    { key: 'Departments/Areas', label: 'Departments/Areas', type: 'text' },
    { key: 'Electricity Consumed in KWh', label: 'Consumed', type: 'numeric', showInCard: true, unit: 'kWh' },
    { key: 'Emission Factor (KgCO2e/KWh)', label: 'Emission Factor', type: 'numeric', unit: 'kg CO₂e/kWh' },
    { key: 'Solar Generation (kWh)', label: 'Solar Generated', type: 'numeric', unit: 'kWh' },
    { key: 'Wind Generation (kWh)', label: 'Wind Generated', type: 'numeric', unit: 'kWh' },
    { key: 'Renewable Energy Produced (kWh)', label: 'Renewable Energy Produced', type: 'numeric', showInCard: true, unit: 'kWh', ignoreFilters: ['Building'] },
    { key: 'Final Emissions (kg CO2e)', label: 'Final Emissions', type: 'numeric', showInCard: true, unit: 'kg CO₂e' },
    { key: 'Final Emissions (tCO2e)', label: 'Final Emissions (t)', type: 'numeric', showInCard: true, unit: 'tCO₂e' },
    { key: 'Gross Emissions (kg CO2e)', label: 'Annualised Emissions', type: 'numeric', unit: 'kg CO₂e' },
];

const getValueByPartialKey = (row: Record<string, string>, search: string): string => {
    const key = Object.keys(row).find(k => k.toLowerCase().includes(search.toLowerCase()));
    return key ? (row[key] ?? '0') : '0';
};

const ELECTRICITY_COMPUTE_FIELDS: ComputeField[] = [
    {
        targetKey: 'Solar Generation (kWh)',
        formula: (row: Record<string, string>) => {
            const building = (row['Building'] || '').trim();
            const normalizedBuilding = building.replace(/\s/g, '').replace(/[–—-]/g, '-');
            const target = 'Block A – Basic Sciences Block'.replace(/\s/g, '').replace(/[–—-]/g, '-');
            if (normalizedBuilding === target) {
                const solarRaw = getValueByPartialKey(row, 'Solar');
                const val = parseFloat(solarRaw.replace(/,/g, ''));
                return isNaN(val) ? 0 : val;
            }
            return 0;
        }
    },
    {
        targetKey: 'Wind Generation (kWh)',
        formula: (row: Record<string, string>) => {
            const building = (row['Building'] || '').trim();
            const normalizedBuilding = building.replace(/\s/g, '').replace(/[–—-]/g, '-');
            const target = 'Block A – Basic Sciences Block'.replace(/\s/g, '').replace(/[–—-]/g, '-');
            if (normalizedBuilding === target) {
                const windRaw = getValueByPartialKey(row, 'Wind');
                const val = parseFloat(windRaw.replace(/,/g, ''));
                return isNaN(val) ? 0 : val;
            }
            return 0;
        }
    },
    {
        targetKey: 'Renewable Energy Produced (kWh)',
        formula: (row: Record<string, string>) => {
            // Uses the filtered values computed above
            const solar = parseFloat(row['Solar Generation (kWh)'] || '0');
            const wind = parseFloat(row['Wind Generation (kWh)'] || '0');
            return (isNaN(solar) ? 0 : solar) + (isNaN(wind) ? 0 : wind);
        }
    },
    {
        targetKey: 'Net Grid Electricity (kWh)',
        formula: (row: Record<string, string>) => {
            const consumedRaw = getValueByPartialKey(row, 'Electricity Consumed');
            const consumed = parseFloat(consumedRaw.replace(/,/g, ''));
            const solar = parseFloat(row['Solar Generation (kWh)'] || '0');
            const wind = parseFloat(row['Wind Generation (kWh)'] || '0');
            return Math.max(0, (isNaN(consumed) ? 0 : consumed) - ((isNaN(solar) ? 0 : solar) + (isNaN(wind) ? 0 : wind)));
        }
    },
    {
        targetKey: 'Gross Emissions (kg CO2e)',
        formula: (row: Record<string, string>) => {
            const consumedRaw = getValueByPartialKey(row, 'Electricity Consumed');
            const consumed = parseFloat(consumedRaw.replace(/,/g, ''));
            const ef = parseFloat(row['Emission Factor (KgCO2e/KWh)']?.replace(/,/g, '') ?? '0');
            return (isNaN(consumed) ? 0 : consumed) * (isNaN(ef) ? 0 : ef);
        }
    },
    {
        targetKey: 'Final Emissions (kg CO2e)',
        formula: (row: Record<string, string>) => {
            const net = parseFloat(row['Net Grid Electricity (kWh)'] || '0');
            const ef = parseFloat(row['Emission Factor (KgCO2e/KWh)']?.replace(/,/g, '') ?? '0');
            return net * (isNaN(ef) ? 0 : ef);
        }
    },
    {
        targetKey: 'Final Emissions (tCO2e)',
        formula: (row: Record<string, string>) => {
            const kgEmission = parseFloat(row['Final Emissions (kg CO2e)'] || '0');
            return kgEmission / 1000;
        }
    }
];

export const SCOPE2_TABS: SubTabConfig[] = [
    {
        key: 'electricity',
        label: 'Electricity',
        sheetName: 'Scope2_Purchased_Electricity',
        icon: Zap,
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-100',
        columns: ELECTRICITY_COLUMNS,
        computeFields: ELECTRICITY_COMPUTE_FIELDS,
        filterColumns: ['Building'],
    }
];
