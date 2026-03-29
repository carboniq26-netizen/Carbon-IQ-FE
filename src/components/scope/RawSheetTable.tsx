import { useState, useEffect } from 'react';
import Papa from 'papaparse';
import { getSheetCsvUrl } from '@/const/constants';

interface RawSheetTableProps {
    sheetName: string;
    sheetId: string;
}

export function RawSheetTable({ sheetName, sheetId }: RawSheetTableProps) {
    const [rows, setRows] = useState<Record<string, string>[]>([]);
    const [columns, setColumns] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setLoading(true);
        setError(null);
        
        const url = getSheetCsvUrl(sheetName, sheetId);
        Papa.parse<Record<string, string>>(url, {
            download: true,
            header: true,
            skipEmptyLines: true,
            transformHeader: h => h.trim(),
            complete: (results) => {
                const cleaned = results.data.filter((row) =>
                    Object.values(row).some((v) => v && v.trim() !== '')
                );
                setColumns(results.meta.fields || []);
                setRows(cleaned);
                setLoading(false);
            },
            error: (err) => {
                setError(err.message);
                setLoading(false);
            }
        });
    }, [sheetName, sheetId]);

    if (loading) {
        return (
            <div className="rounded-xl border border-border bg-card p-12 flex items-center justify-center shadow-sm">
                <div className="flex items-center gap-3 text-text-muted">
                    <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    <span className="text-sm">Fetching raw dataset...</span>
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

    return (
        <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
            <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
                <table className="w-full text-sm">
                    <thead className="sticky top-0 z-10">
                        <tr className="bg-bg-section border-b border-border shadow-sm">
                            {columns.map(col => (
                                <th key={col} className="px-4 py-3 font-semibold text-text-secondary text-left whitespace-nowrap">
                                    {col}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((row, i) => (
                            <tr key={i} className="border-b border-border hover:bg-bg-section/50 last:border-b-0">
                                {columns.map(col => (
                                    <td key={col} className="px-4 py-3 text-text-secondary whitespace-nowrap">
                                        {row[col] || '—'}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
