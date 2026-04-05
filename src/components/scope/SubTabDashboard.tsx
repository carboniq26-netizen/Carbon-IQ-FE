import { useState, useMemo, useEffect } from 'react';
import { useSheetData, getMonthLabel, getMonthNumber } from '@/hooks/useSheetData';
import { type SubTabConfig } from '@/types/types';
import { MultiSelect } from '@/components/ui/multi-select';
import { type MultiSelectOption } from '@/components/ui/multi-select';
import { SubTabSummaryCards } from './SubTabSummaryCards';
import { EvElectricityCard } from './EvElectricityCard';
import { EmissionBarChart } from '@/components/charts/EmissionBarChart';
import { EmissionDonutChart } from '@/components/charts/EmissionDonutChart';
import { Calendar, CalendarDays, Info } from 'lucide-react';
import { toast } from 'sonner';

interface SubTabDashboardProps {
    tab: SubTabConfig;
}

/* ── Distinct colour palette for chart segments ───────── */
const CHART_COLORS = [
    '#EF4444', '#F59E0B', '#3B82F6', '#10B981', '#8B5CF6',
    '#EC4899', '#06B6D4', '#F97316', '#6366F1', '#14B8A6',
];

type ChartGroupBy = 'year' | 'month';

export function SubTabDashboard({ tab }: SubTabDashboardProps) {

    /* ── Does this tab have a Month column? ──────── */
    const hasMonthColumn = tab.columns.some((c) => c.key === 'Month');

    /* ── Empty-columns guard: show placeholder ────── */
    if (tab.columns.length === 0) {
        const Icon = tab.icon;
        return (
            <div className="space-y-6">
                <div className="flex items-center gap-3">
                    <Icon className={`w-6 h-6 ${tab.color}`} />
                    <h2 className="text-xl font-bold text-text-main">{tab.label}</h2>
                </div>
                <div className="flex flex-col items-center justify-center py-20 rounded-xl border-2 border-dashed border-border bg-bg-section/50">
                    <Icon className="w-12 h-12 text-text-muted mb-4" />
                    <h3 className="text-lg font-semibold text-text-main mb-1">Coming Soon</h3>
                    <p className="text-sm text-text-muted text-center max-w-md">
                        {tab.label} data will be displayed here once the data sheet is configured.
                    </p>
                </div>
            </div>
        );
    }

    const {
        loading,
        availableYears,
        getAvailableValues,
        getFilteredRowsByRange,
        getFilteredTotalsByRange,
    } = useSheetData(tab.sheetName, tab.columns, tab.computeFields, tab.sheetId);

    /* ── Range filter state ───────────────────────── */
    const [fromYear, setFromYear] = useState('');
    const [toYear, setToYear] = useState('');
    const [fromMonth, setFromMonth] = useState('');
    const [toMonth, setToMonth] = useState('');
    const [chartGroupBy, setChartGroupBy] = useState<ChartGroupBy>('year');


    /* ── Extra filters state (keyed by column key) ── */
    const extraFilterKeys = tab.filterColumns ?? [];
    const [extraFilters, setExtraFilters] = useState<Record<string, string[]>>({});

    const updateExtraFilter = (key: string, values: string[]) => {
        setExtraFilters((prev) => ({ ...prev, [key]: values }));
    };

    // Reset when tab changes
    useEffect(() => {
        setFromYear('');
        setToYear('');
        setFromMonth('');
        setToMonth('');
        setExtraFilters({});
        if (!hasMonthColumn) {
            setChartGroupBy('year');
        }
    }, [tab.key, hasMonthColumn]);

    /* ── Filter Handlers ── */
    const handleFromYearChange = (v: string) => {
        if (v && toYear && v > toYear) {
            toast.warning('Invalid Range', {
                description: '"From" year cannot be after "To" year.'
            });
            return;
        }
        setFromYear(v);
    };

    const handleToYearChange = (v: string) => {
        if (v && fromYear && v < fromYear) {
            toast.warning('Invalid Range', {
                description: '"To" year cannot be before "From" year.'
            });
            return;
        }
        setToYear(v);
    };

    const handleFromMonthChange = (v: string) => {
        setFromMonth(v);
    };

    const handleToMonthChange = (v: string) => {
        setToMonth(v);
    };

    const activeExtra = extraFilterKeys.length > 0 ? extraFilters : undefined;

    /* ── Only apply range filter if it's COMPLETE ────────── */
    const isRangeReady = useMemo(() => {
        if (hasMonthColumn) {
            return !!(fromYear && fromMonth && toYear && toMonth);
        }
        return !!(fromYear && toYear);
    }, [hasMonthColumn, fromYear, fromMonth, toYear, toMonth]);

    const filteredRows = getFilteredRowsByRange(
        isRangeReady ? fromYear : undefined,
        isRangeReady ? toYear : undefined,
        isRangeReady ? fromMonth : undefined,
        isRangeReady ? toMonth : undefined,
        activeExtra
    );
    
    const filteredTotals = getFilteredTotalsByRange(
        isRangeReady ? fromYear : undefined,
        isRangeReady ? toYear : undefined,
        isRangeReady ? fromMonth : undefined,
        isRangeReady ? toMonth : undefined,
        activeExtra
    );

    /* ── Final totals (handle columns that ignore certain filters) ── */
    const finalTotals = useMemo(() => {
        const baseTotals = { ...filteredTotals };
        
        let electricityOffset = 0;
        let dedupSolar = 0;
        let dedupWind = 0;
        
        if (tab.key === 'electricity') {
            const timeframeRows = getFilteredRowsByRange(
               isRangeReady ? fromYear : undefined,
               isRangeReady ? toYear : undefined,
               isRangeReady ? fromMonth : undefined,
               isRangeReady ? toMonth : undefined,
               undefined // raw unfiltered by extra columns
            );
            
            const seen = new Set<string>();
            timeframeRows.forEach((r: Record<string, string>) => {
               const yr = (r['Reporting Year'] || '').trim();
               const mo = (r['Month'] || '').trim();
               if (!yr) return;
               const key = `${yr}-${mo}`;
               if (!seen.has(key)) {
                   seen.add(key);
                   const rowSolar = parseFloat(r['Solar Generation (kWh)'] || '0');
                   const rowWind = parseFloat(r['Wind Generation (kWh)'] || '0');
                   const solar = isNaN(rowSolar) ? 0 : rowSolar;
                   const wind = isNaN(rowWind) ? 0 : rowWind;
                   
                   dedupSolar += solar;
                   dedupWind += wind;
                   
                   const efStr = Object.keys(r).find((k: string) => k.toLowerCase().includes('factor') && k.toLowerCase().includes('kg'));
                   const ef = parseFloat(r[efStr || ''] || '0');
                   electricityOffset += (solar + wind) * (isNaN(ef) ? 0 : ef);
               }
            });
            
            baseTotals['Solar Generation (kWh)'] = dedupSolar;
            baseTotals['Wind Generation (kWh)'] = dedupWind;
            baseTotals['Renewable Energy Produced (kWh)'] = dedupSolar + dedupWind;
            
            if (!activeExtra?.['Building'] || activeExtra['Building'].length === 0) {
                 baseTotals['Final Emissions (kg CO2e)'] -= electricityOffset;
                 baseTotals['Final Emissions (tCO2e)'] -= (electricityOffset / 1000);
                 baseTotals['Gross Emissions (kg CO2e)'] -= electricityOffset;
            }
        }
        
        // Check if any visible card columns need to ignore specific filters
        tab.columns.forEach(col => {
            if (col.showInCard && col.ignoreFilters && col.ignoreFilters.length > 0) {
                const cleanExtra = { ...activeExtra };
                let modified = false;
                col.ignoreFilters.forEach(fKey => {
                    if (cleanExtra[fKey]) {
                        delete cleanExtra[fKey];
                        modified = true;
                    }
                });

                if (modified) {
                    const specialTotals = getFilteredTotalsByRange(
                        isRangeReady ? fromYear : undefined,
                        isRangeReady ? toYear : undefined,
                        isRangeReady ? fromMonth : undefined,
                        isRangeReady ? toMonth : undefined,
                        Object.keys(cleanExtra).length > 0 ? cleanExtra : undefined
                    );
                    baseTotals[col.key] = specialTotals[col.key] || 0;
                }
            }
            if (col.clampMinZero && baseTotals[col.key] < 0) {
                baseTotals[col.key] = 0;
            }
        });
        
        return baseTotals;
    }, [tab.columns, filteredTotals, activeExtra, getFilteredTotalsByRange, isRangeReady, fromYear, toYear, fromMonth, toMonth]);

    /* ── Month options for range selects ────────── */
    const monthOptions = useMemo(() => {
        return [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ].map(m => ({ value: m, label: m }));
    }, []);

    /* ── Chart data — group by Year or Month ──────── */

    const primaryChartKey =
        tab.chartTargetKey ?? tab.columns.find((c) => c.key.includes('Emissions (kg CO2e)'))?.key ?? '';
    const primaryChartCol = tab.columns.find((c) => c.key === primaryChartKey);

    const chartGrouped = useMemo(() => {
        if (!primaryChartKey) return [];

        const map = new Map<string, number>();
        const offsetMap = new Map<string, number>();
        const seen = new Set<string>();

        if (chartGroupBy === 'year') {
            filteredRows.forEach((r) => {
                const year = r['Reporting Year']?.trim();
                const month = r['Month']?.trim();
                if (!year) return;
                const val = parseFloat(r[primaryChartKey] ?? '0');
                map.set(year, (map.get(year) ?? 0) + (isNaN(val) ? 0 : val));

                if (tab.key === 'electricity' && (!activeExtra?.['Building'] || activeExtra['Building'].length === 0)) {
                    const dKey = `${year}-${month}`;
                    if (!seen.has(dKey)) {
                        seen.add(dKey);
                        const rowSolar = parseFloat(r['Solar Generation (kWh)'] || '0');
                        const rowWind = parseFloat(r['Wind Generation (kWh)'] || '0');
                        const efStr = Object.keys(r).find(k => k.toLowerCase().includes('factor') && k.toLowerCase().includes('kg'));
                        const ef = parseFloat(r[efStr || ''] || '0');
                        const offset = ((isNaN(rowSolar) ? 0 : rowSolar) + (isNaN(rowWind) ? 0 : rowWind)) * (isNaN(ef) ? 0 : ef);
                        offsetMap.set(year, (offsetMap.get(year) ?? 0) + offset);
                    }
                }
            });
            const sorted = Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]));
            return sorted.map(([name, value], i) => {
                let finalVal = value;
                if (offsetMap.has(name)) finalVal -= offsetMap.get(name)!;
                return {
                    name,
                    value: primaryChartCol?.clampMinZero ? Math.max(0, finalVal) : finalVal,
                    fill: CHART_COLORS[i % CHART_COLORS.length],
                    color: CHART_COLORS[i % CHART_COLORS.length],
                };
            });
        } else {
            filteredRows.forEach((r) => {
                const month = r['Month']?.trim();
                const year = r['Reporting Year']?.trim();
                if (!month) return;
                const val = parseFloat(r[primaryChartKey] ?? '0');
                map.set(month, (map.get(month) ?? 0) + (isNaN(val) ? 0 : val));

                if (tab.key === 'electricity' && (!activeExtra?.['Building'] || activeExtra['Building'].length === 0)) {
                    const dKey = `${year}-${month}`;
                    if (!seen.has(dKey)) {
                        seen.add(dKey);
                        const rowSolar = parseFloat(r['Solar Generation (kWh)'] || '0');
                        const rowWind = parseFloat(r['Wind Generation (kWh)'] || '0');
                        const efStr = Object.keys(r).find(k => k.toLowerCase().includes('factor') && k.toLowerCase().includes('kg'));
                        const ef = parseFloat(r[efStr || ''] || '0');
                        const offset = ((isNaN(rowSolar) ? 0 : rowSolar) + (isNaN(rowWind) ? 0 : rowWind)) * (isNaN(ef) ? 0 : ef);
                        offsetMap.set(month, (offsetMap.get(month) ?? 0) + offset);
                    }
                }
            });
            const sorted = Array.from(map.entries()).sort((a, b) => {
                const na = getMonthNumber(a[0]);
                const nb = getMonthNumber(b[0]);
                return na.localeCompare(nb);
            });
            return sorted.map(([name, value], i) => {
                let finalVal = value;
                // find un-localized month name for offsetMap match
                const rawMonthMatch = Array.from(offsetMap.keys()).find(k => getMonthLabel(k) === getMonthLabel(name));
                if (rawMonthMatch) finalVal -= offsetMap.get(rawMonthMatch)!;
                return {
                    name: getMonthLabel(name),
                    value: primaryChartCol?.clampMinZero ? Math.max(0, finalVal) : finalVal,
                    fill: CHART_COLORS[i % CHART_COLORS.length],
                    color: CHART_COLORS[i % CHART_COLORS.length],
                };
            });
        }
    }, [filteredRows, primaryChartKey, primaryChartCol, chartGroupBy, tab.key, activeExtra]);

    let totalEmission = filteredTotals[primaryChartKey] ?? 0;
    if (primaryChartCol?.clampMinZero && totalEmission < 0) {
        totalEmission = 0;
    }

    /* ── Filter label ──────────────────────────────── */
    const filterLabel = useMemo(() => {
        const parts: string[] = [];
        if (isRangeReady) {
            if (hasMonthColumn) {
                const startStr = fromYear && fromMonth ? `${getMonthLabel(fromMonth)} ${fromYear}` : '…';
                const endStr = toYear && toMonth ? `${getMonthLabel(toMonth)} ${toYear}` : '…';
                parts.push(`${startStr} – ${endStr}`);
            } else if (fromYear || toYear) {
                parts.push(`${fromYear || '…'} – ${toYear || '…'}`);
            }
        }

        extraFilterKeys.forEach((key) => {
            const vals = extraFilters[key];
            if (vals && vals.length > 0) parts.push(vals.join(', '));
        });
        return parts.length > 0 ? parts.join(' · ') : 'All Time';
    }, [isRangeReady, fromYear, toYear, fromMonth, toMonth, extraFilters, extraFilterKeys, hasMonthColumn]);


    /* ── Helper: get short label for a filter column ── */
    const getFilterLabel = (colKey: string) => {
        const col = tab.columns.find((c) => c.key === colKey);
        if (!col) return 'All';
        const label = col.label;
        if (label.toLowerCase().endsWith('category')) {
            return `All ${label.slice(0, -1)}ies`;
        }
        return `All ${label}s`;
    };

    return (
        <div className="space-y-6">
            {/* Header & Filters */}
            <div className="flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                    <div className="flex flex-col gap-1 w-full">
                        <div className="flex items-center gap-2">
                            <tab.icon className={`w-6 h-6 ${tab.color}`} />
                            <h2 className="text-xl font-bold text-text-main">{tab.label}</h2>
                        </div>
                        <p className="text-text-secondary text-sm leading-relaxed mb-1">
                            {tab.label} emissions — {filterLabel}
                        </p>
                        
                        {tab.description && (
                            <div className="flex items-start gap-2 py-2.5 px-4 bg-bg-section/50 rounded-lg border border-border/50 w-full">
                                <Info className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                                <p className="text-xs text-text-muted leading-relaxed italic">
                                    {tab.description}
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Range filters row */}
                <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
                    {/* From Group */}
                    <div className="flex items-center gap-2 relative z-30">
                        <span className="text-xs font-semibold text-text-muted whitespace-nowrap uppercase tracking-wider">From</span>
                        <MultiSelect
                            options={availableYears.map(y => ({ value: y, label: y }))}
                            selected={fromYear ? [fromYear] : []}
                            onChange={(vals) => handleFromYearChange(vals[vals.length - 1] || '')}
                            placeholder="Year"
                            className="min-w-[120px]"
                        />
                        {hasMonthColumn && (
                            <MultiSelect
                                options={monthOptions}
                                selected={fromMonth ? [fromMonth] : []}
                                onChange={(vals) => handleFromMonthChange(vals[vals.length - 1] || '')}
                                placeholder="Month"
                                className="min-w-[130px]"
                            />
                        )}
                    </div>

                    <span className="text-text-muted font-light hidden sm:inline">|</span>

                    {/* To Group */}
                    <div className="flex items-center gap-2 relative z-20">
                        <span className="text-xs font-semibold text-text-muted whitespace-nowrap uppercase tracking-wider">To</span>
                        <MultiSelect
                            options={availableYears.map(y => ({ value: y, label: y }))}
                            selected={toYear ? [toYear] : []}
                            onChange={(vals) => handleToYearChange(vals[vals.length - 1] || '')}
                            placeholder="Year"
                            className="min-w-[120px]"
                        />
                        {hasMonthColumn && (
                            <MultiSelect
                                options={monthOptions}
                                selected={toMonth ? [toMonth] : []}
                                onChange={(vals) => handleToMonthChange(vals[vals.length - 1] || '')}
                                placeholder="Month"
                                className="min-w-[130px]"
                            />
                        )}
                    </div>

                    {/* Extra category filter dropdowns */}
                    {extraFilterKeys.map((colKey) => {
                        const options: MultiSelectOption[] = getAvailableValues(colKey).map((v) => ({
                            value: v,
                            label: v,
                        }));
                        return (
                            <MultiSelect
                                key={colKey}
                                options={options}
                                selected={extraFilters[colKey] ?? []}
                                onChange={(vals) => updateExtraFilter(colKey, vals)}
                                placeholder={getFilterLabel(colKey)}
                            />
                        );
                    })}

                    {/* Clear button — appears when any filter is active */}
                    {(fromYear || toYear || fromMonth || toMonth || Object.values(extraFilters).some((v) => v.length > 0)) && (
                        <button
                            onClick={() => {
                                setFromYear('');
                                setToYear('');
                                setFromMonth('');
                                setToMonth('');
                                setExtraFilters({});
                            }}
                            className="text-xs text-text-muted hover:text-danger transition-colors cursor-pointer underline underline-offset-2"
                        >
                            Clear filters
                        </button>
                    )}
                </div>
            </div>

            {/* View Mode Content */}
            <div className="space-y-6">
                {/* Summary Cards */}
                <SubTabSummaryCards
                    columns={tab.columns}
                    totals={finalTotals}
                    loading={loading}
                    accentColor={tab.color}
                    accentBg={tab.bgColor}
                >
                    {tab.key === 'electricity' && (
                        <EvElectricityCard
                            fromYear={fromYear}
                            toYear={toYear}
                            fromMonth={fromMonth}
                            toMonth={toMonth}
                            isRangeReady={isRangeReady}
                            accentColor={tab.color}
                            accentBg={tab.bgColor}
                        />
                    )}
                </SubTabSummaryCards>

                {/* Charts */}
                {chartGrouped.length > 0 && (
                    <div className="space-y-3">
                        {/* Year / Month toggle (only when Month column exists) */}
                        {hasMonthColumn && (
                            <div className="flex items-center gap-1 bg-bg-section rounded-lg p-1 w-fit">
                                <button
                                    onClick={() => setChartGroupBy('year')}
                                    className={`
                                        flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium
                                        transition-all duration-200 cursor-pointer
                                        ${chartGroupBy === 'year'
                                            ? 'bg-card text-primary shadow-sm'
                                            : 'text-text-muted hover:text-text-main'
                                        }
                                    `}
                                >
                                    <Calendar className="w-3.5 h-3.5" />
                                    By Year
                                </button>
                                <button
                                    onClick={() => setChartGroupBy('month')}
                                    className={`
                                        flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium
                                        transition-all duration-200 cursor-pointer
                                        ${chartGroupBy === 'month'
                                            ? 'bg-card text-primary shadow-sm'
                                            : 'text-text-muted hover:text-text-main'
                                        }
                                    `}
                                >
                                    <CalendarDays className="w-3.5 h-3.5" />
                                    By Month
                                </button>
                            </div>
                        )}

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                            <EmissionBarChart
                                data={chartGrouped}
                                loading={loading}
                                isEmpty={totalEmission === 0}
                            />
                            <EmissionDonutChart
                                data={chartGrouped}
                                total={totalEmission}
                                loading={loading}
                                isEmpty={totalEmission === 0}
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}


