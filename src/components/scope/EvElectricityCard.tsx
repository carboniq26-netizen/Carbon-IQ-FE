import { useSheetData } from '@/hooks/useSheetData';
import { SCOPE1_TABS } from '@/const/scope1Columns';
import { TrendingDown } from 'lucide-react';

interface EvElectricityCardProps {
    fromYear?: string;
    toYear?: string;
    fromMonth?: string;
    toMonth?: string;
    isRangeReady: boolean;
    accentColor: string;
    accentBg: string;
}

export function EvElectricityCard({ fromYear, toYear, fromMonth, toMonth, isRangeReady, accentColor, accentBg }: EvElectricityCardProps) {
    const tab = SCOPE1_TABS.find(t => t.key === 'campus-vehicles');
    
    // Safety check just in case
    if (!tab) return null;

    const { loading, getFilteredRowsByRange } = useSheetData(tab.sheetName, tab.columns, tab.computeFields, tab.sheetId);

    const filteredRows = getFilteredRowsByRange(
         isRangeReady ? fromYear : undefined,
         isRangeReady ? toYear : undefined,
         isRangeReady ? fromMonth : undefined,
         isRangeReady ? toMonth : undefined
    );

    let sum = 0;
    filteredRows.forEach(row => {
        const fuelTypeKey = Object.keys(row).find(k => k.toLowerCase().includes('fuel type'));
        const fuelType = fuelTypeKey ? (row[fuelTypeKey] || '').trim().toLowerCase() : '';
        if (fuelType === 'ev' || fuelType === 'electric') {
             const valKey = Object.keys(row).find(k => k.toLowerCase().includes('fuel consumed'));
             const valStr = valKey ? row[valKey] : '0';
             const val = parseFloat((valStr || '0').replace(/,/g, ''));
             if (!isNaN(val)) sum += val;
        }
    });

    return (
        <div className="rounded-xl border border-border bg-card px-5 py-4 shadow-sm flex flex-col justify-between min-h-[100px]">
            <div className="flex items-center gap-2.5 mb-2">
                <div className={`flex items-center justify-center w-8 h-8 rounded-lg shrink-0 ${accentBg || 'bg-bg-section'}`}>
                    <TrendingDown className={`w-4 h-4 ${accentColor || 'text-primary'}`} />
                </div>
                <p className="text-sm font-semibold text-text-muted tracking-wide line-clamp-2">
                    EV Electricity Consumed
                </p>
            </div>
            {loading ? (
                <div className="h-7 w-24 rounded bg-bg-section animate-pulse" />
            ) : (
                <p className="text-xl font-bold text-text-main leading-tight truncate">
                    {sum.toLocaleString(undefined, { maximumFractionDigits: 2 })}{' '}
                    <span className="text-xs font-normal text-text-muted">
                        kWh
                    </span>
                </p>
            )}
        </div>
    );
}
