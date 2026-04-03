import { Wind } from 'lucide-react';
import { type ColumnDef, type SubTabConfig, type ComputeField } from '../types/types';

const WIND_POWER_COLUMNS: ColumnDef[] = [
    { key: 'Reporting Year', label: 'Year', type: 'text' },
    { key: 'Month', label: 'Month', type: 'text' },
    { key: 'Building', label: 'Building', type: 'text' },
    { key: 'Wind Energy Generation (KWh)', label: 'Wind Generated', type: 'numeric', showInCard: true, unit: 'kWh' },
    { key: 'Emission Factor (KgCO2e/KWh)', label: 'Emission Factor', type: 'numeric', unit: 'kg CO₂e/kWh' },
    { key: 'Emissions Reduced (kg CO2e)', label: 'Emissions Reduced', type: 'numeric', showInCard: true, unit: 'kg CO₂e' },
];

const getValueByPartialKey = (row: Record<string, string>, search: string): string => {
    const key = Object.keys(row).find(k => k.toLowerCase().includes(search.toLowerCase()));
    return key ? (row[key] ?? '0') : '0';
};

const WIND_COMPUTE_FIELDS: ComputeField[] = [
    {
        targetKey: 'Wind Energy Generation (KWh)',
        formula: (row: Record<string, string>) => {
            const building = (row['Building'] || '').trim();
            // Only count generation for the designated campus-wide reporting row (Block A)
            // Use normalization for dash/spaces to be robust
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
        targetKey: 'Emissions Reduced (kg CO2e)',
        formula: (row: Record<string, string>) => {
            // Note: In useSheetData, compute fields are processed in order.
            // This will use the 'filtered' wind value computed above.
            const wind = parseFloat(row['Wind Energy Generation (KWh)'] ?? '0');
            const efRaw = getValueByPartialKey(row, 'Emission Factor');
            const ef = parseFloat(efRaw.replace(/,/g, ''));
            return (isNaN(wind) ? 0 : wind) * (isNaN(ef) ? 0 : ef);
        }
    }
];

export const WIND_POWER_TAB: SubTabConfig = {
    key: 'wind-power',
    label: 'Wind Power Generated',
    sheetName: 'Scope2_Purchased_Electricity', // Same sheet as Scope 2 / Solar
    icon: Wind,
    color: 'text-cyan-500',
    bgColor: 'bg-cyan-100',
    chartTargetKey: 'Wind Energy Generation (KWh)', // Target Wind kWh for the charts
    columns: WIND_POWER_COLUMNS,
    computeFields: WIND_COMPUTE_FIELDS,
    filterColumns: [],
};
