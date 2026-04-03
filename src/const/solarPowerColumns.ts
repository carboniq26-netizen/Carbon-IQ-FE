import { Sun } from 'lucide-react';
import { type ColumnDef, type SubTabConfig, type ComputeField } from '../types/types';

const SOLAR_POWER_COLUMNS: ColumnDef[] = [
    { key: 'Reporting Year', label: 'Year', type: 'text' },
    { key: 'Month', label: 'Month', type: 'text' },
    { key: 'Building', label: 'Building', type: 'text' },
    { key: 'Solar Generation (kWh)', label: 'Solar Generated', type: 'numeric', showInCard: true, unit: 'kWh' },
    { key: 'Emission Factor (KgCO2e/KWh)', label: 'Emission Factor', type: 'numeric', unit: 'kg CO₂e/kWh' },
    { key: 'Emissions Reduced (kg CO2e)', label: 'Emissions Reduced', type: 'numeric', showInCard: true, unit: 'kg CO₂e' },
];

const SOLAR_COMPUTE_FIELDS: ComputeField[] = [
    {
        targetKey: 'Solar Generation (kWh)',
        formula: (row: Record<string, string>) => {
            const building = (row['Building'] || '').trim();
            // Only count generation for the designated campus-wide reporting row (Block A)
            // Use normalization for dash/spaces to be robust
            const normalizedBuilding = building.replace(/\s/g, '').replace(/[–—-]/g, '-');
            const target = 'Block A – Basic Sciences Block'.replace(/\s/g, '').replace(/[–—-]/g, '-');
            
            if (normalizedBuilding === target) {
                const val = parseFloat(row['Solar Generation (kWh)']?.replace(/,/g, '') || '0');
                return isNaN(val) ? 0 : val;
            }
            return 0;
        }
    },
    {
        targetKey: 'Emissions Reduced (kg CO2e)',
        formula: (row: Record<string, string>) => {
            // Note: In useSheetData, compute fields are processed in order.
            // This will use the 'filtered' solar value computed above.
            const solar = parseFloat(row['Solar Generation (kWh)'] ?? '0');
            const ef = parseFloat(row['Emission Factor (KgCO2e/KWh)'] ?? '0');
            return (isNaN(solar) ? 0 : solar) * (isNaN(ef) ? 0 : ef);
        }
    }
];

export const SOLAR_POWER_TAB: SubTabConfig = {
    key: 'solar-power',
    label: 'Solar Power Generated',
    sheetName: 'Scope2_Purchased_Electricity', // Same sheet as Scope 2!
    icon: Sun,
    color: 'text-orange-500',
    bgColor: 'bg-orange-100',
    chartTargetKey: 'Solar Generation (kWh)', // Target Solar kWh for the charts
    columns: SOLAR_POWER_COLUMNS,
    computeFields: SOLAR_COMPUTE_FIELDS,
    filterColumns: [],
};
