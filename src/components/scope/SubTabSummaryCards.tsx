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
        <div className={`grid gap-4`} style={{ gridTemplateColumns: `repeat(${cardColumns.length}, minmax(0, 1fr))` }}>
            {cardColumns.map((col) => {
                const val = totals[col.key] ?? 0;

                return (
                    <div key={col.key} className="rounded-xl border border-border bg-card px-5 py-4 shadow-sm">
                        <div className="flex items-center gap-2.5 mb-2">
                            <div className={`flex items-center justify-center w-8 h-8 rounded-lg ${accentBg}`}>
                                <TrendingDown className={`w-4 h-4 ${accentColor}`} />
                            </div>
                            <p className="text-xs font-semibold text-text-muted uppercase tracking-wide">
                                {col.label}
                            </p>
                        </div>
                        {loading ? (
                            <div className="h-7 w-24 rounded bg-bg-section animate-pulse" />
                        ) : (
                            <p className="text-xl font-bold text-text-main leading-tight">
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

