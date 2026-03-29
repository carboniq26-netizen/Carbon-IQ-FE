import { type ColumnDef, type SheetRow } from '@/types/types';

interface DynamicTableProps {
    columns: ColumnDef[];
    rows: SheetRow[];
    loading: boolean;
    error: string | null;
}

export function DynamicTable({ columns, rows, loading, error }: DynamicTableProps) {
    const visibleCols = columns.filter((c) => c.showInTable !== false);

    if (loading) {
        return (
            <div className="rounded-xl border border-border bg-card p-12 flex items-center justify-center shadow-sm">
                <div className="flex items-center gap-3 text-text-muted">
                    <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    <span className="text-sm">Loading data…</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="rounded-xl border border-danger/30 bg-danger/5 p-6 shadow-sm">
                <p className="text-danger text-sm font-medium">{error}</p>
            </div>
        );
    }

    if (rows.length === 0) {
        return (
            <div className="rounded-xl border border-border bg-card p-12 flex items-center justify-center shadow-sm">
                <p className="text-text-muted text-sm">No records found.</p>
            </div>
        );
    }

    return (
        <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="bg-bg-section border-b border-border">
                            {visibleCols.map((col) => (
                                <th
                                    key={col.key}
                                    className={`px-4 py-3 font-semibold text-text-secondary whitespace-nowrap ${col.type === 'numeric' ? 'text-right' : 'text-left'
                                        }`}
                                >
                                    {col.label}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((row, i) => (
                            <tr
                                key={i}
                                className="border-b border-border last:border-b-0 hover:bg-bg-section/50 transition-colors"
                            >
                                {visibleCols.map((col) => {
                                    const raw = row[col.key] ?? '';
                                    const isNum = col.type === 'numeric';
                                    return (
                                        <td
                                            key={col.key}
                                            className={`px-4 py-3 whitespace-nowrap ${isNum
                                                    ? 'text-right font-mono text-text-main'
                                                    : 'text-text-secondary'
                                                }`}
                                        >
                                            {raw || '—'}
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                    {/* Footer with totals for numeric columns */}
                    <tfoot>
                        <tr className="bg-bg-section border-t border-border">
                            {visibleCols.map((col, idx) => {
                                if (col.type !== 'numeric') {
                                    // Put "Total" label in the last text column before numerics
                                    const isLastText =
                                        idx ===
                                        visibleCols.reduce(
                                            (last, c, j) => (c.type === 'text' ? j : last),
                                            0,
                                        );
                                    return (
                                        <td
                                            key={col.key}
                                            className={`px-4 py-3 ${isLastText
                                                    ? 'font-semibold text-text-main text-right'
                                                    : ''
                                                }`}
                                        >
                                            {isLastText ? 'Total' : ''}
                                        </td>
                                    );
                                }
                                const total = rows.reduce((sum, r) => {
                                    const raw = r[col.key] ?? '';
                                    if (raw.includes(',')) {
                                        const parts = raw.split(',').map((s) => parseFloat(s.trim()));
                                        const rowSum = parts.reduce((acc, v) => acc + (isNaN(v) ? 0 : v), 0);
                                        return sum + rowSum;
                                    }
                                    const v = parseFloat(raw);
                                    return sum + (isNaN(v) ? 0 : v);
                                }, 0);
                                return (
                                    <td
                                        key={col.key}
                                        className="px-4 py-3 text-right font-mono font-bold text-primary"
                                    >
                                        {total.toFixed(1)}
                                    </td>
                                );
                            })}
                        </tr>
                    </tfoot>
                </table>
            </div>
        </div>
    );
}
