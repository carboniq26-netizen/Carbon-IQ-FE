import { useState, useEffect, useCallback, useMemo } from 'react';
import Papa from 'papaparse';
import { GOOGLE_SHEET_CSV_URL } from '../const/constants';
import type { EmissionRecord } from '../types/types';
import { Scope } from '../types/types';
import { getScope } from '../utils/scopeMapping';

export interface UseEmissionDataReturn {
    data: EmissionRecord[];
    loading: boolean;
    error: string | null;
    getScopeData: (scope: Scope) => EmissionRecord[];
    getScopeTotal: (scope: Scope) => number;
    getTotalEmission: () => number;
    refetch: () => void;
    getFilteredData: (years?: string[], months?: string[]) => EmissionRecord[];
    getFilteredScopeTotal: (scope: Scope, years?: string[], months?: string[]) => number;
    getFilteredTotalEmission: (years?: string[], months?: string[]) => number;
    availableYears: string[];
    getAvailableMonths: (years?: string[]) => string[];
}

function parseDate(dateStr: string): { year: string; month: string } | null {
    if (!dateStr) return null;
    const parts = dateStr.includes('/')
        ? dateStr.split('/')
        : dateStr.includes('-')
            ? dateStr.split('-')
            : [];

    if (parts.length !== 3) return null;

    let year: string;
    let month: string;

    if (dateStr.includes('/')) {
        if (parts[2].length === 4) {
            year = parts[2]; month = parts[1].padStart(2, '0');
        } else if (parts[0].length === 4) {
            year = parts[0]; month = parts[1].padStart(2, '0');
        } else {
            const p0 = parseInt(parts[0], 10);
            year = parts[2].length === 2 ? `20${parts[2]}` : parts[2];
            month = (p0 > 12 ? parts[1] : parts[0]).padStart(2, '0');
        }
    } else {
        if (parts[0].length === 4) {
            year = parts[0]; month = parts[1].padStart(2, '0');
        } else {
            year = parts[2]; month = parts[1].padStart(2, '0');
        }
    }

    return (year && month) ? { year, month } : null;
}

const MONTH_NAMES = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
];

export function getMonthName(monthNum: string): string {
    const idx = parseInt(monthNum, 10) - 1;
    return MONTH_NAMES[idx] ?? monthNum;
}

export function useEmissionData(): UseEmissionDataReturn {
    const [data, setData] = useState<EmissionRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(() => {
        setLoading(true);
        setError(null);

        Papa.parse<Record<string, string>>(GOOGLE_SHEET_CSV_URL, {
            download: true,
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                try {
                    const records: EmissionRecord[] = results.data.map((row) => {
                        const sourceType = row['Source Type'] ?? '';
                        return {
                            date: row['Date'] ?? '',
                            location: row['Location'] ?? '',
                            department: row['Department'] ?? '',
                            sourceType,
                            activityType: row['Activity Type'] ?? '',
                            quantity: parseFloat(row['Quantity'] ?? '0'),
                            unit: row['Unit'] ?? '',
                            emissionFactor: parseFloat(row['Emission Factor'] ?? '0'),
                            emission: parseFloat(row['Emission (kg CO2e)'] ?? '0'),
                            scope: getScope(sourceType),
                        };
                    });
                    setData(records);
                } catch (err) {
                    setError('Failed to parse emission data.');
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
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    const getScopeData = useCallback(
        (scope: Scope) => data.filter((r) => r.scope === scope), [data]
    );

    const getScopeTotal = useCallback(
        (scope: Scope) => data.filter((r) => r.scope === scope).reduce((sum, r) => sum + r.emission, 0), [data]
    );

    const getTotalEmission = useCallback(
        () => data.reduce((sum, r) => sum + r.emission, 0), [data]
    );

    const getFilteredData = useCallback(
        (years?: string[], months?: string[]): EmissionRecord[] => {
            const hasYears = years && years.length > 0;
            const hasMonths = months && months.length > 0;
            if (!hasYears && !hasMonths) return data;
            return data.filter((r) => {
                const parsed = parseDate(r.date);
                if (!parsed) return false;
                if (hasYears && !years.includes(parsed.year)) return false;
                if (hasMonths && !months.includes(parsed.month)) return false;
                return true;
            });
        }, [data]
    );

    const getFilteredScopeTotal = useCallback(
        (scope: Scope, years?: string[], months?: string[]): number =>
            getFilteredData(years, months).filter((r) => r.scope === scope).reduce((sum, r) => sum + r.emission, 0),
        [getFilteredData]
    );

    const getFilteredTotalEmission = useCallback(
        (years?: string[], months?: string[]): number =>
            getFilteredData(years, months).reduce((sum, r) => sum + r.emission, 0),
        [getFilteredData]
    );

    const availableYears = useMemo(() => {
        const set = new Set<string>();
        data.forEach((r) => { const p = parseDate(r.date); if (p) set.add(p.year); });
        return Array.from(set).sort();
    }, [data]);

    const getAvailableMonths = useCallback(
        (years?: string[]): string[] => {
            const set = new Set<string>();
            data.forEach((r) => {
                const p = parseDate(r.date);
                if (!p) return;
                if (years && years.length > 0 && !years.includes(p.year)) return;
                set.add(p.month);
            });
            return Array.from(set).sort();
        }, [data]
    );

    return {
        data, loading, error,
        getScopeData, getScopeTotal, getTotalEmission,
        refetch: fetchData,
        getFilteredData, getFilteredScopeTotal, getFilteredTotalEmission,
        availableYears, getAvailableMonths,
    };
}
