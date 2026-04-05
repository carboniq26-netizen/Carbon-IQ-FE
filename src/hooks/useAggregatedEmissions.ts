import { useState, useEffect, useCallback, useMemo } from 'react';
import Papa from 'papaparse';
import { getSheetCsvUrl } from '../const/constants';
import { Scope } from '../types/types';
import { SCOPE1_TABS } from '../const/scope1Columns';
import { SCOPE2_TABS } from '../const/scope2Columns';
import { SOLAR_POWER_TAB } from '../const/solarPowerColumns';
import { WIND_POWER_TAB } from '../const/windPowerColumns';
import { SCOPE3_TABS } from '../const/scope3Columns';
import { BIOGENICS_TAB } from '../const/biogenicsColumns';
import { SLUDGE_ENERGY_TAB } from '../const/sludgeColumns';

export interface AggregatedRecord {
    year: string;
    month: string;
    scope: Scope;
    tabKey: string;
    values: Record<string, number>;
}

export interface UseAggregatedEmissionsReturn {
    records: AggregatedRecord[];
    loading: boolean;
    error: string | null;
    availableYears: string[];
    getAvailableMonths: (years?: string[]) => string[];
    getFilteredTotal: (years?: string[], months?: string[]) => number;
    getFilteredScopeTotal: (scope: Scope, years?: string[], months?: string[]) => number;
    getFilteredMetricTotal: (tabKey: string, columnKey: string, years?: string[], months?: string[]) => number;
}

const ALL_CONFIGS = [
    ...SCOPE1_TABS.map(tab => ({ tab, scope: Scope.SCOPE_1 })),
    ...SCOPE2_TABS.map(tab => ({ tab, scope: Scope.SCOPE_2 })),
    { tab: SOLAR_POWER_TAB, scope: Scope.SCOPE_2 },
    { tab: WIND_POWER_TAB, scope: Scope.SCOPE_2 },
    ...SCOPE3_TABS.map(tab => ({ tab, scope: Scope.SCOPE_3 })),
    { tab: BIOGENICS_TAB, scope: Scope.BIOGENICS },
    { tab: SLUDGE_ENERGY_TAB, scope: Scope.SCOPE_1 }
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
                            
                            const seenElectricity = new Set<string>();
                            
                            cleaned.forEach(row => {

                                const year = yearKey ? (row[yearKey]?.trim() || '') : '';
                                const month = monthKey ? (row[monthKey]?.trim() || '') : '';
                                
                                if (year) {
                                    const values: Record<string, number> = {};
                                    tab.columns.forEach(col => {
                                        if (col.type === 'numeric') {
                                            const valStr = row[col.key] ?? '0';
                                            const val = parseFloat(valStr.replace(/,/g, ''));
                                            values[col.key] = isNaN(val) ? 0 : val;
                                        }
                                    });

                                    // EV vehicles from campus-vehicles should count as Scope 2
                                    let recordScope = scope;
                                    if (tab.key === 'campus-vehicles') {
                                        const fuelTypeKey = Object.keys(row).find(k => k.toLowerCase().includes('fuel type'));
                                        const fuelType = fuelTypeKey ? (row[fuelTypeKey] || '').trim().toLowerCase() : '';
                                        if (fuelType === 'ev' || fuelType === 'electric') {
                                            recordScope = Scope.SCOPE_2;
                                        }
                                    }

                                    allRecords.push({
                                        year,
                                        month,
                                        scope: recordScope,
                                        tabKey: tab.key,
                                        values
                                    });
                                    
                                    if (tab.key === 'electricity') {
                                        const dKey = `${year}-${month}`;
                                        if (!seenElectricity.has(dKey)) {
                                            seenElectricity.add(dKey);
                                            
                                            const sKey = Object.keys(row).find(k => k.toLowerCase().includes('solar'));
                                            const wKey = Object.keys(row).find(k => k.toLowerCase().includes('wind'));
                                            const efKey = Object.keys(row).find(k => k.toLowerCase().includes('factor') && k.toLowerCase().includes('kg'));
                                            
                                            const sVal = (sKey && row[sKey]) ? String(row[sKey]).replace(/,/g, '').trim() : '0';
                                            const wVal = (wKey && row[wKey]) ? String(row[wKey]).replace(/,/g, '').trim() : '0';
                                            const efVal = (efKey && row[efKey]) ? String(row[efKey]).replace(/,/g, '').trim() : '0';
                                            
                                            const solar = parseFloat(sVal) || 0;
                                            const wind = parseFloat(wVal) || 0;
                                            const ef = parseFloat(efVal) || 0;
                                            
                                            const offset = (solar + wind) * ef;
                                            console.error(`[PHANTOM_TRACE] ${year}-${month} | sKey: ${sKey}, solar: ${solar} | wKey: ${wKey}, wind: ${wind} | efKey: ${efKey}, ef: ${ef} | offset: ${offset}`);
                                            
                                            if (offset > 0) {
                                                 allRecords.push({
                                                     year,
                                                     month,
                                                     scope: Scope.SCOPE_2,
                                                     tabKey: tab.key,
                                                     values: {
                                                         'Final Emissions (kg CO2e)': -offset,
                                                         'Final Emissions (tCO2e)': -(offset / 1000)
                                                     }
                                                 });
                                            }
                                        }
                                    }
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
        return getFilteredRecords(years, months).reduce((acc, r) => {
            // Find the emissions key for this record's tab
            const tabConfig = ALL_CONFIGS.find(c => c.tab.key === r.tabKey)?.tab;
            let emissionKey: string | undefined;

            if (r.tabKey === 'solar-power' || r.tabKey === 'wind-power') {
                return acc; // Do not add solar/wind directly, they are offsets.
            }

            if (r.tabKey === 'embodied-emissions') {
                emissionKey = 'Annualised Emissions (kg CO2e)';
            } else {
                emissionKey = tabConfig?.columns.find(
                    (c) => c.type === 'numeric' && 
                           (c.key.toLowerCase().includes('kg co2') || c.key.toLowerCase().includes('kg co₂')) && 
                           c.key.toLowerCase().includes('emission') && 
                           !c.key.toLowerCase().includes('factor')
                )?.key;
            }

            return acc + (emissionKey ? (r.values[emissionKey] ?? 0) : 0);
        }, 0);
    }, [getFilteredRecords]);

    const getFilteredScopeTotal = useCallback((scope: Scope, years?: string[], months?: string[]) => {
        return getFilteredRecords(years, months)
               .filter(r => r.scope === scope)
               .reduce((acc, r) => {
                    const tabConfig = ALL_CONFIGS.find(c => c.tab.key === r.tabKey)?.tab;
                    let emissionKey: string | undefined;

                    if (r.tabKey === 'solar-power' || r.tabKey === 'wind-power') {
                        return acc; // Do not add solar/wind directly to Scope 2 totals
                    }

                    if (r.tabKey === 'embodied-emissions') {
                        emissionKey = 'Annualised Emissions (kg CO2e)';
                    } else {
                        emissionKey = tabConfig?.columns.find(
                            (c) => c.type === 'numeric' && 
                                   (c.key.toLowerCase().includes('kg co2') || c.key.toLowerCase().includes('kg co₂')) && 
                                   c.key.toLowerCase().includes('emission') && 
                                   !c.key.toLowerCase().includes('factor')
                        )?.key;
                    }
                    return acc + (emissionKey ? (r.values[emissionKey] ?? 0) : 0);
               }, 0);
    }, [getFilteredRecords]);

    const getFilteredMetricTotal = useCallback((tabKey: string, columnKey: string, years?: string[], months?: string[]) => {
        return getFilteredRecords(years, months)
               .filter(r => r.tabKey === tabKey)
               .reduce((acc, r) => acc + (r.values[columnKey] ?? 0), 0);
    }, [getFilteredRecords]);

    return {
        records, loading, error, availableYears, getAvailableMonths, getFilteredTotal, getFilteredScopeTotal, getFilteredMetricTotal
    };
}
