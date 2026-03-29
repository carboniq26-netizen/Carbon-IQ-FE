import { useState, useMemo, useEffect } from 'react';
import { useSheetData, getMonthLabel, getMonthNumber } from '@/hooks/useSheetData';
import { type SubTabConfig } from '@/types/types';
import { MultiSelect } from '@/components/ui/multi-select';
import { type MultiSelectOption } from '@/components/ui/multi-select';
import { SubTabSummaryCards } from './SubTabSummaryCards';
import { DynamicTable } from './DynamicTable';
import { RawSheetTable } from './RawSheetTable';
import { EmissionBarChart } from '@/components/charts/EmissionBarChart';
import { EmissionDonutChart } from '@/components/charts/EmissionDonutChart';
import { Calendar, CalendarDays, Database, BarChart3 } from 'lucide-react';

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
        error,
        availableYears,
        getAvailableMonths,
        getAvailableValues,
        getFilteredRows,
        getFilteredTotals,
    } = useSheetData(tab.sheetName, tab.columns, tab.computeFields, tab.sheetId);

    const [viewMode, setViewMode] = useState<'data' | 'visual'>(tab.key === 'dg-data' ? 'data' : 'visual');

    // Reset view mode when tab changes back
    useEffect(() => {
        setViewMode(tab.key === 'dg-data' ? 'data' : 'visual');
    }, [tab.key]);

    const [selectedYears, setSelectedYears] = useState<string[]>([]);
    const [selectedMonths, setSelectedMonths] = useState<string[]>([]);
    const [chartGroupBy, setChartGroupBy] = useState<ChartGroupBy>('year');

    /* ── Extra filters state (keyed by column key) ── */
    const extraFilterKeys = tab.filterColumns ?? [];
    const [extraFilters, setExtraFilters] = useState<Record<string, string[]>>({});

    const updateExtraFilter = (key: string, values: string[]) => {
        setExtraFilters((prev) => ({ ...prev, [key]: values }));
    };

    const years = selectedYears.length > 0 ? selectedYears : undefined;
    const months = selectedMonths.length > 0 ? selectedMonths : undefined;
    const activeExtra = extraFilterKeys.length > 0 ? extraFilters : undefined;

    const filteredRows = getFilteredRows(years, months, activeExtra);
    const filteredTotals = getFilteredTotals(years, months, activeExtra);

    /* ── Dropdown options ──────────────────────────── */
    const yearOptions: MultiSelectOption[] = useMemo(
        () => availableYears.map((y) => ({ value: y, label: y })),
        [availableYears],
    );

    const monthOptions: MultiSelectOption[] = useMemo(
        () =>
            getAvailableMonths(years).map((m) => ({
                value: m,
                label: getMonthLabel(m),
            })),
        [getAvailableMonths, years],
    );

    const handleYearChange = (values: string[]) => {
        setSelectedYears(values);
        if (values.length > 0) {
            const valid = getAvailableMonths(values);
            setSelectedMonths((prev) => prev.filter((m) => valid.includes(m)));
        } else {
            setSelectedMonths([]);
        }
    };

    /* ── Chart data — group by Year or Month ──────── */

    const primaryChartKey =
        tab.chartTargetKey ?? tab.columns.find((c) => c.key.includes('Emissions (kg CO2e)'))?.key ?? '';

    const chartGrouped = useMemo(() => {
        if (!primaryChartKey) return [];

        const map = new Map<string, number>();

        if (chartGroupBy === 'year') {
            // Group by Reporting Year
            filteredRows.forEach((r) => {
                const year = r['Reporting Year']?.trim() || 'Unknown';
                const val = parseFloat(r[primaryChartKey] ?? '0');
                map.set(year, (map.get(year) ?? 0) + (isNaN(val) ? 0 : val));
            });
            // Sort by year
            const sorted = Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]));
            return sorted.map(([name, value], i) => ({
                name,
                value,
                fill: CHART_COLORS[i % CHART_COLORS.length],
                color: CHART_COLORS[i % CHART_COLORS.length],
            }));
        } else {
            // Group by Month
            filteredRows.forEach((r) => {
                const month = r['Month']?.trim() || 'Unknown';
                const val = parseFloat(r[primaryChartKey] ?? '0');
                map.set(month, (map.get(month) ?? 0) + (isNaN(val) ? 0 : val));
            });
            // Sort by month number
            const sorted = Array.from(map.entries()).sort((a, b) => {
                const na = getMonthNumber(a[0]);
                const nb = getMonthNumber(b[0]);
                return na.localeCompare(nb);
            });
            return sorted.map(([name, value], i) => ({
                name: getMonthLabel(name),
                value,
                fill: CHART_COLORS[i % CHART_COLORS.length],
                color: CHART_COLORS[i % CHART_COLORS.length],
            }));
        }
    }, [filteredRows, primaryChartKey, chartGroupBy]);

    const totalEmission = filteredTotals[primaryChartKey] ?? 0;

    /* ── Filter label ──────────────────────────────── */
    const filterLabel = useMemo(() => {
        const parts: string[] = [];
        if (selectedYears.length > 0) parts.push(selectedYears.join(', '));
        if (selectedMonths.length > 0) parts.push(selectedMonths.map(getMonthLabel).join(', '));
        extraFilterKeys.forEach((key) => {
            const vals = extraFilters[key];
            if (vals && vals.length > 0) parts.push(vals.join(', '));
        });
        return parts.length > 0 ? parts.join(' · ') : 'All Time';
    }, [selectedYears, selectedMonths, extraFilters, extraFilterKeys]);

    /* ── Helper: get short label for a filter column ── */
    const getFilterLabel = (colKey: string) => {
        const col = tab.columns.find((c) => c.key === colKey);
        return col ? `All ${col.label}s` : `All`;
    };

    return (
        <div className="space-y-6">
            {/* Header & Filters */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex flex-col gap-1">
                    <div className="flex items-center flex-wrap gap-x-4 gap-y-2">
                        <div className="flex items-center gap-2">
                            <tab.icon className={`w-6 h-6 ${tab.color}`} />
                            <h2 className="text-xl font-bold text-text-main">{tab.label}</h2>
                        </div>
                        
                        {tab.key === 'dg-data' && (
                            <div className="flex items-center bg-bg-section p-1 rounded-lg border border-border">
                                <button
                                    onClick={() => setViewMode('data')}
                                    className={`flex items-center gap-2 px-3 py-1 rounded-md text-sm font-medium cursor-pointer transition-all ${
                                        viewMode === 'data' ? 'bg-card text-primary shadow-sm' : 'text-text-muted hover:text-text-main'
                                    }`}
                                >
                                    <Database className="w-4 h-4" /> Data
                                </button>
                                <button
                                    onClick={() => setViewMode('visual')}
                                    className={`flex items-center gap-2 px-3 py-1 rounded-md text-sm font-medium cursor-pointer transition-all ${
                                        viewMode === 'visual' ? 'bg-card text-primary shadow-sm' : 'text-text-muted hover:text-text-main'
                                    }`}
                                >
                                    <BarChart3 className="w-4 h-4" /> Visual
                                </button>
                            </div>
                        )}
                    </div>
                    <p className="text-text-secondary text-sm leading-relaxed">
                        {tab.label} emissions — {filterLabel}
                    </p>
                </div>

                {viewMode === 'visual' && (
                    <div className="flex items-center gap-2 xl:justify-end shrink-0 max-w-full z-10">
                        <MultiSelect
                            options={yearOptions}
                            selected={selectedYears}
                            onChange={handleYearChange}
                            placeholder="All Years"
                            className="cursor-pointer"
                        />
                        {hasMonthColumn && (
                            <MultiSelect
                                options={monthOptions}
                                selected={selectedMonths}
                                onChange={setSelectedMonths}
                                placeholder="All Months"
                                disabled={selectedYears.length === 0}
                            />
                        )}
                        {/* Extra filter dropdowns */}
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
                    </div>
                )}
            </div>

            {/* View Mode Content */}
            {viewMode === 'data' ? (
                <div className="mt-2">
                    {tab.rawDataTableOverride ? (
                        <RawSheetTable 
                            sheetName={tab.rawDataTableOverride.sheetName} 
                            sheetId={tab.rawDataTableOverride.sheetId} 
                        />
                    ) : (
                        <DynamicTable
                            columns={tab.columns}
                            rows={filteredRows}
                            loading={loading}
                            error={error}
                        />
                    )}
                </div>
            ) : (
                <>
                    {/* Summary Cards */}
                    <SubTabSummaryCards
                        columns={tab.columns}
                        totals={filteredTotals}
                        loading={loading}
                        accentColor={tab.color}
                        accentBg={tab.bgColor}
                    />

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
                </>
            )}
        </div>
    );
}

