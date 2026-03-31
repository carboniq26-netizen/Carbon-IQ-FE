import { useState, useEffect, useCallback, useMemo } from 'react';
import Papa from 'papaparse';
import { getSheetCsvUrl } from '../const/constants';
import { type ColumnDef, type SheetRow, type ComputeField } from '../types/types';

/* ── Month helpers ──────────────────────────────────────── */

const MONTH_NAMES = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
];

const MONTH_MAP: Record<string, string> = {};
MONTH_NAMES.forEach((name, i) => {
    const num = String(i + 1).padStart(2, '0');
    MONTH_MAP[name.toLowerCase()] = num;
    MONTH_MAP[name.slice(0, 3).toLowerCase()] = num;
    MONTH_MAP[num] = num;
    MONTH_MAP[String(i + 1)] = num;
});

export function getMonthNumber(raw: string): string {
    return MONTH_MAP[raw.trim().toLowerCase()] ?? '';
}

export function getMonthLabel(numOrName: string): string {
    const idx = parseInt(numOrName, 10);
    if (!isNaN(idx) && idx >= 1 && idx <= 12) return MONTH_NAMES[idx - 1];
    // If it's already a text month, capitalise it
    const lower = numOrName.trim().toLowerCase();
    const found = MONTH_NAMES.find((m) => m.toLowerCase() === lower || m.slice(0, 3).toLowerCase() === lower);
    return found ?? numOrName;
}

/* ── Hook return type ───────────────────────────────────── */

export interface UseSheetDataReturn {
    rows: SheetRow[];
    loading: boolean;
    error: string | null;
    refetch: () => void;
    /** Sum of each numeric column across all (filtered) rows */
    numericTotals: Record<string, number>;
    /** Available reporting years in the data */
    availableYears: string[];
    /** Available months (optionally filtered by selected years) */
    getAvailableMonths: (years?: string[]) => string[];
    /** Get distinct values for any column key (for extra filter dropdowns) */
    getAvailableValues: (columnKey: string) => string[];
    /** Rows filtered by year / month / extra column filters */
    getFilteredRows: (years?: string[], months?: string[], extraFilters?: Record<string, string[]>) => SheetRow[];
    /** Numeric totals for filtered rows */
    getFilteredTotals: (years?: string[], months?: string[], extraFilters?: Record<string, string[]>) => Record<string, number>;
}

/* ── Main hook ──────────────────────────────────────────── */

export function useSheetData(sheetName: string, columns: ColumnDef[], computeFields?: ComputeField[], sheetId?: string): UseSheetDataReturn {
    const [rows, setRows] = useState<SheetRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Identify the year and month column keys from the column defs
    const yearKey = useMemo(() => columns.find((c) => c.key === 'Reporting Year')?.key ?? '', [columns]);
    const monthKey = useMemo(() => columns.find((c) => c.key === 'Month')?.key ?? '', [columns]);

    const numericKeys = useMemo(() => columns.filter((c) => c.type === 'numeric').map((c) => c.key), [columns]);

    const fetchData = useCallback(() => {
        setLoading(true);
        setError(null);

        const url = getSheetCsvUrl(sheetName, sheetId);
        Papa.parse<Record<string, string>>(url, {
            download: true,
            header: true,
            transformHeader: (h) => h.trim(),
            skipEmptyLines: true,
            complete: (results) => {
                try {
                    // Filter out empty rows (all values empty)
                    const cleaned = results.data.filter((row) =>
                        Object.values(row).some((v) => v && v.trim() !== ''),
                    );

                    // Apply computed fields (client-side formulas)
                    if (computeFields && computeFields.length > 0) {
                        cleaned.forEach((row) => {
                            computeFields.forEach((cf) => {
                                row[cf.targetKey] = String(cf.formula(row));
                            });
                        });
                    }

                    setRows(cleaned);
                } catch (err) {
                    setError('Failed to parse sheet data.');
                    console.error(err);
                } finally {
                    setLoading(false);
                }
            },
            error: (err: Error) => {
                setError(`Failed to fetch data: ${err.message}`);
                setLoading(false);
            },
        });
    }, [sheetName, sheetId, computeFields]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    /* ── Derived helpers ─────────────────────────────── */

    const computeTotals = useCallback(
        (source: SheetRow[]): Record<string, number> => {
            const totals: Record<string, number> = {};
            numericKeys.forEach((key) => {
                totals[key] = source.reduce((sum, row) => {
                    const raw = row[key] ?? '';
                    const cleaned = raw.replace(/,/g, '');
                    const val = parseFloat(cleaned);
                    return sum + (isNaN(val) ? 0 : val);
                }, 0);
            });
            return totals;
        },
        [numericKeys],
    );

    const numericTotals = useMemo(() => computeTotals(rows), [computeTotals, rows]);

    const availableYears = useMemo(() => {
        if (!yearKey) return [];
        const set = new Set<string>();
        rows.forEach((r) => {
            const y = r[yearKey]?.trim();
            if (y) set.add(y);
        });
        return Array.from(set).sort();
    }, [rows, yearKey]);

    const getAvailableMonths = useCallback(
        (years?: string[]): string[] => {
            if (!monthKey) return [];
            const set = new Set<string>();
            rows.forEach((r) => {
                if (years && years.length > 0 && yearKey) {
                    const y = r[yearKey]?.trim();
                    if (!years.includes(y)) return;
                }
                const m = r[monthKey]?.trim();
                if (m) set.add(m);
            });
            return Array.from(set).sort((a, b) => {
                const na = getMonthNumber(a);
                const nb = getMonthNumber(b);
                return na.localeCompare(nb);
            });
        },
        [rows, yearKey, monthKey],
    );

    const getAvailableValues = useCallback(
        (columnKey: string): string[] => {
            const set = new Set<string>();
            rows.forEach((r) => {
                const v = r[columnKey]?.trim();
                if (v) set.add(v);
            });
            return Array.from(set).sort();
        },
        [rows],
    );

    const getFilteredRows = useCallback(
        (years?: string[], months?: string[], extraFilters?: Record<string, string[]>): SheetRow[] => {
            const hasYears = years && years.length > 0;
            const hasMonths = months && months.length > 0;
            const hasExtra = extraFilters && Object.values(extraFilters).some((v) => v.length > 0);
            if (!hasYears && !hasMonths && !hasExtra) return rows;

            return rows.filter((r) => {
                if (hasYears && yearKey) {
                    const y = r[yearKey]?.trim();
                    if (!years.includes(y)) return false;
                }
                if (hasMonths && monthKey) {
                    const m = r[monthKey]?.trim();
                    if (!months.includes(m)) return false;
                }
                if (hasExtra && extraFilters) {
                    for (const [key, vals] of Object.entries(extraFilters)) {
                        if (vals.length > 0) {
                            const v = r[key]?.trim();
                            if (!vals.includes(v)) return false;
                        }
                    }
                }
                return true;
            });
        },
        [rows, yearKey, monthKey],
    );

    const getFilteredTotals = useCallback(
        (years?: string[], months?: string[], extraFilters?: Record<string, string[]>): Record<string, number> =>
            computeTotals(getFilteredRows(years, months, extraFilters)),
        [computeTotals, getFilteredRows],
    );

    return {
        rows,
        loading,
        error,
        refetch: fetchData,
        numericTotals,
        availableYears,
        getAvailableMonths,
        getAvailableValues,
        getFilteredRows,
        getFilteredTotals,
    };
}
