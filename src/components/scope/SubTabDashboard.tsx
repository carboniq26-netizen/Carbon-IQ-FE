import { useState, useMemo } from 'react';
import { useSheetData, getMonthLabel, getMonthNumber } from '@/hooks/useSheetData';
import { type SubTabConfig } from '@/types/types';
import { MultiSelect } from '@/components/ui/multi-select';
import { type MultiSelectOption } from '@/components/ui/multi-select';
import { SubTabSummaryCards } from './SubTabSummaryCards';
import { EmissionBarChart } from '@/components/charts/EmissionBarChart';
import { EmissionDonutChart } from '@/components/charts/EmissionDonutChart';
import { Calendar, CalendarDays } from 'lucide-react';

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
    const {
        loading,
        availableYears,
        getAvailableMonths,
        getFilteredRows,
        getFilteredTotals,
    } = useSheetData(tab.sheetName, tab.columns);

    const [selectedYears, setSelectedYears] = useState<string[]>([]);
    const [selectedMonths, setSelectedMonths] = useState<string[]>([]);
    const [chartGroupBy, setChartGroupBy] = useState<ChartGroupBy>('year');

    const years = selectedYears.length > 0 ? selectedYears : undefined;
    const months = selectedMonths.length > 0 ? selectedMonths : undefined;

    const filteredRows = getFilteredRows(years, months);
    const filteredTotals = getFilteredTotals(years, months);

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

    const emissionKey =
        tab.columns.find((c) => c.key.includes('Calculated Emissions (kg CO2e)'))?.key ?? '';

    const chartGrouped = useMemo(() => {
        if (!emissionKey) return [];

        const map = new Map<string, number>();

        if (chartGroupBy === 'year') {
            // Group by Reporting Year
            filteredRows.forEach((r) => {
                const year = r['Reporting Year']?.trim() || 'Unknown';
                const val = parseFloat(r[emissionKey] ?? '0');
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
                const val = parseFloat(r[emissionKey] ?? '0');
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
    }, [filteredRows, emissionKey, chartGroupBy]);

    const totalEmission = filteredTotals[emissionKey] ?? 0;

    /* ── Filter label ──────────────────────────────── */
    const filterLabel = useMemo(() => {
        const parts: string[] = [];
        if (selectedYears.length > 0) parts.push(selectedYears.join(', '));
        if (selectedMonths.length > 0) parts.push(selectedMonths.map(getMonthLabel).join(', '));
        return parts.length > 0 ? parts.join(' · ') : 'All Time';
    }, [selectedYears, selectedMonths]);

    return (
        <div className="space-y-6">
            {/* Header & Filters */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <div className="flex items-center gap-3">
                        <tab.icon className={`w-6 h-6 ${tab.color}`} />
                        <h2 className="text-xl font-bold text-text-main">{tab.label}</h2>
                    </div>
                    <p className="text-text-secondary text-sm leading-relaxed mt-1">
                        {tab.label} emissions — {filterLabel}
                    </p>
                </div>

                <div className="flex cursor-pointer gap-2">
                    <MultiSelect
                        options={yearOptions}
                        selected={selectedYears}
                        onChange={handleYearChange}
                        placeholder="All Years"
                        className="cursor-pointer"
                    />
                    <MultiSelect
                        options={monthOptions}
                        selected={selectedMonths}
                        onChange={setSelectedMonths}
                        placeholder="All Months"
                        disabled={selectedYears.length === 0}
                    />
                </div>
            </div>

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
                    {/* Year / Month toggle */}
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
    );
}
