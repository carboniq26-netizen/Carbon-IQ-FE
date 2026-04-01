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

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {cardColumns.map((col) => {
                const rawVal = totals[col.key];
                const val = typeof rawVal === 'number' && !isNaN(rawVal) ? rawVal : 0;

                return (
                    <div key={col.key} className="rounded-xl border border-border bg-card px-5 py-4 shadow-sm flex flex-col justify-between min-h-[100px]">
                        <div className="flex items-center gap-2.5 mb-2">
                            <div className={`flex items-center justify-center w-8 h-8 rounded-lg shrink-0 ${accentBg || 'bg-bg-section'}`}>
                                <TrendingDown className={`w-4 h-4 ${accentColor || 'text-primary'}`} />
                            </div>
                            <p className="text-sm font-semibold text-text-muted tracking-wide line-clamp-2">
                                {col.label}
                            </p>
                        </div>
                        {loading ? (
                            <div className="h-7 w-24 rounded bg-bg-section animate-pulse" />
                        ) : (
                            <p className="text-xl font-bold text-text-main leading-tight truncate">
                                {val.toLocaleString(undefined, { maximumFractionDigits: 2 })}{' '}
                                <span className="text-xs font-normal text-text-muted">
                                    {col.unit ?? ''}
                                </span>
                            </p>
                        )}
                    </div>
                );
            })}
        </div>
    );
}

