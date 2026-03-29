import { useState, useEffect, useCallback, useMemo } from 'react';
import Papa from 'papaparse';
import { getSheetCsvUrl } from '../const/constants';
import { Scope } from '../types/types';
import { SCOPE1_TABS } from '../const/scope1Columns';
import { SCOPE2_TABS } from '../const/scope2Columns';
import { SCOPE3_TABS } from '../const/scope3Columns';
import { BIOGENICS_TAB } from '../const/biogenicsColumns';

export interface AggregatedRecord {
    year: string;
    month: string;
    emissionKg: number;
    scope: Scope;
}

export interface UseAggregatedEmissionsReturn {
    records: AggregatedRecord[];
    loading: boolean;
    error: string | null;
    availableYears: string[];
    getAvailableMonths: (years?: string[]) => string[];
    getFilteredTotal: (years?: string[], months?: string[]) => number;
    getFilteredScopeTotal: (scope: Scope, years?: string[], months?: string[]) => number;
}

const ALL_CONFIGS = [
    ...SCOPE1_TABS.map(tab => ({ tab, scope: Scope.SCOPE_1 })),
    ...SCOPE2_TABS.map(tab => ({ tab, scope: Scope.SCOPE_2 })),
    ...SCOPE3_TABS.map(tab => ({ tab, scope: Scope.SCOPE_3 })),
    { tab: BIOGENICS_TAB, scope: Scope.BIOGENICS }
];

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

export function getMonthName(numOrName: string): string {
    const idx = parseInt(numOrName, 10);
    if (!isNaN(idx) && idx >= 1 && idx <= 12) return MONTH_NAMES[idx - 1];
    const lower = numOrName.trim().toLowerCase();
    const found = MONTH_NAMES.find((m) => m.toLowerCase() === lower || m.slice(0, 3).toLowerCase() === lower);
    return found ?? numOrName;
}

export function useAggregatedEmissions(): UseAggregatedEmissionsReturn {
    const [records, setRecords] = useState<AggregatedRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        
        try {
            const allRecords: AggregatedRecord[] = [];

            const promises = ALL_CONFIGS.map(({ tab, scope }) => {
                return new Promise<void>((resolve) => {
                    const url = getSheetCsvUrl(tab.sheetName, tab.sheetId);
                    Papa.parse<Record<string, string>>(url, {
                        download: true,
                        header: true,
                        transformHeader: (h) => h.trim(),
                        skipEmptyLines: true,
                        complete: (results) => {
                            const cleaned = results.data.filter((row) =>
                                Object.values(row).some((v) => v && v.trim() !== ''),
                            );

                            if (tab.computeFields) {
                                cleaned.forEach((row) => {
                                    tab.computeFields!.forEach((cf) => {
                                        row[cf.targetKey] = String(cf.formula(row));
                                    });
                                });
                            }

                            const yearKey = tab.columns.find((c) => c.key === 'Reporting Year' || c.key.includes('Year'))?.key;
                            const monthKey = tab.columns.find((c) => c.key === 'Month' || c.key.includes('Month'))?.key;
                            
                            // Explicitly search for the final Emissions column (kg CO2e) by ignoring 'Factor' 
                            const emissionKey = tab.columns.find(
                                (c) => c.type === 'numeric' && 
                                       (c.key.includes('kg CO2') || c.key.includes('kg CO₂')) && 
                                       c.key.toLowerCase().includes('emission') && 
                                       !c.key.toLowerCase().includes('factor')
                            )?.key;

                            cleaned.forEach(row => {
                                const year = yearKey ? (row[yearKey]?.trim() || '') : '';
                                const month = monthKey ? (row[monthKey]?.trim() || '') : '';
                                const emissionStr = emissionKey ? row[emissionKey] : '0';
                                const emissionKg = parseFloat(emissionStr ?? '0');
                                
                                if (!isNaN(emissionKg) && emissionKg > 0 && year) {
                                    allRecords.push({
                                        year,
                                        month,
                                        emissionKg,
                                        scope
                                    });
                                }
                            });
                            resolve();
                        },
                        error: () => resolve()
                    });
                });
            });

            await Promise.all(promises);
            setRecords(allRecords);
        } catch (err) {
            setError('Failed to fetch aggregated emissions');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const availableYears = useMemo(() => {
        const set = new Set<string>();
        records.forEach(r => {
            if (r.year) set.add(r.year);
        });
        return Array.from(set).sort();
    }, [records]);

    const getAvailableMonths = useCallback((years?: string[]): string[] => {
        const set = new Set<string>();
        records.forEach(r => {
            if (years && years.length > 0 && !years.includes(r.year)) return;
            if (r.month) set.add(r.month);
        });
        return Array.from(set).sort((a, b) => getMonthNumber(a).localeCompare(getMonthNumber(b)));
    }, [records]);

    const getFilteredRecords = useCallback((years?: string[], months?: string[]) => {
        const hasYears = years && years.length > 0;
        const hasMonths = months && months.length > 0;
        if (!hasYears && !hasMonths) return records;
        
        return records.filter(r => {
            if (hasYears && !years.includes(r.year)) return false;
            if (hasMonths) {
                 const mNum = getMonthNumber(r.month);
                 const valid = months.some(selectedMonth => getMonthNumber(selectedMonth) === mNum);
                 if (!valid) return false;
            }
            return true;
        });
    }, [records]);

    const getFilteredTotal = useCallback((years?: string[], months?: string[]) => {
        return getFilteredRecords(years, months).reduce((acc, r) => acc + r.emissionKg, 0);
    }, [getFilteredRecords]);

    const getFilteredScopeTotal = useCallback((scope: Scope, years?: string[], months?: string[]) => {
        return getFilteredRecords(years, months)
               .filter(r => r.scope === scope)
               .reduce((acc, r) => acc + r.emissionKg, 0);
    }, [getFilteredRecords]);

    return {
        records, loading, error, availableYears, getAvailableMonths, getFilteredTotal, getFilteredScopeTotal
    };
}
