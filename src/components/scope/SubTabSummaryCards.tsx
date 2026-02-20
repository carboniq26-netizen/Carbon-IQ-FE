import { type ColumnDef } from '@/types/types';
import { TrendingDown } from 'lucide-react';

interface SubTabSummaryCardsProps {
    columns: ColumnDef[];
    totals: Record<string, number>;
    loading: boolean;
    accentColor: string;
    accentBg: string;
}

export function SubTabSummaryCards({
    columns,
    totals,
    loading,
    accentColor,
    accentBg,
}: SubTabSummaryCardsProps) {
    const cardColumns = columns.filter((c) => c.showInCard && c.type === 'numeric');

    // Total emission card value — prefer the "Calculated Emissions (kg CO2e)" column
    const emissionCol =
        columns.find((c) => c.key.includes('Calculated Emissions (kg CO2e)')) ??
        cardColumns[0];

    const totalEmission = emissionCol ? totals[emissionCol.key] ?? 0 : 0;

    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {/* Total Emissions card */}
            <div className="rounded-lg border border-border bg-card px-3.5 py-3 shadow-sm">
                <div className="flex items-center gap-2 mb-1.5">
                    <div className={`flex items-center justify-center w-7 h-7 rounded-md ${accentBg}`}>
                        <TrendingDown className={`w-3.5 h-3.5 ${accentColor}`} />
                    </div>
                    <p className="text-[10px] font-semibold text-text-muted uppercase tracking-wide leading-tight">
                        Total Emissions
                    </p>
                </div>
                {loading ? (
                    <div className="h-6 w-20 rounded bg-bg-section animate-pulse" />
                ) : (
                    <p className="text-lg font-bold text-text-main leading-tight">
                        {totalEmission.toFixed(1)}{' '}
                        <span className="text-[11px] font-normal text-text-muted">
                            {emissionCol?.unit ?? 'kg CO₂e'}
                        </span>
                    </p>
                )}
            </div>

            {/* One card per showInCard numeric column */}
            {cardColumns.map((col) => {
                const val = totals[col.key] ?? 0;
                const pct = totalEmission > 0 ? ((val / totalEmission) * 100).toFixed(1) : '0';

                return (
                    <div key={col.key} className="rounded-lg border border-border bg-card px-3.5 py-3 shadow-sm">
                        <div className="flex items-center gap-2 mb-1.5">
                            <div className={`flex items-center justify-center w-7 h-7 rounded-md ${accentBg}`}>
                                <TrendingDown className={`w-3.5 h-3.5 ${accentColor}`} />
                            </div>
                            <p className="text-[10px] font-semibold text-text-muted uppercase tracking-wide leading-tight">
                                {col.label}
                            </p>
                        </div>
                        {loading ? (
                            <div className="h-6 w-20 rounded bg-bg-section animate-pulse" />
                        ) : (
                            <div className="flex items-end gap-1.5">
                                <p className="text-lg font-bold text-text-main leading-tight">{val.toFixed(1)}</p>
                                <span className="text-[10px] font-medium text-text-muted mb-0.5">
                                    {col.unit ?? ''}{col.key.includes('Emissions') ? ` · ${pct}%` : ''}
                                </span>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
