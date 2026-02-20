import { useState, useMemo } from 'react';
import { useSheetData, getMonthLabel } from '@/hooks/useSheetData';
import { type SubTabConfig } from '@/types/types';
import { MultiSelect } from '@/components/ui/multi-select';
import { type MultiSelectOption } from '@/components/ui/multi-select';
import { SubTabSummaryCards } from './SubTabSummaryCards';
import { EmissionBarChart } from '@/components/charts/EmissionBarChart';
import { EmissionDonutChart } from '@/components/charts/EmissionDonutChart';

interface SubTabDashboardProps {
    tab: SubTabConfig;
}

/* ── Distinct colour palette for chart segments ───────── */
const CHART_COLORS = [
    '#EF4444', '#F59E0B', '#3B82F6', '#10B981', '#8B5CF6',
    '#EC4899', '#06B6D4', '#F97316', '#6366F1', '#14B8A6',
];

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

    /* ── Chart data ────────────────────────────────── */

    // Find a good categorical column to group by (first text column that isn't Year/Month)
    const groupCol = useMemo(
        () =>
            tab.columns.find(
                (c) =>
                    c.type === 'text' &&
                    c.key !== 'Reporting Year' &&
                    c.key !== 'Month' &&
                    c.key !== 'Remarks',
            ),
        [tab.columns],
    );

    // Emission column for charts
    const emissionKey =
        tab.columns.find((c) => c.key.includes('Calculated Emissions (kg CO2e)'))?.key ?? '';

    const chartGrouped = useMemo(() => {
        if (!groupCol || !emissionKey) return [];
        const map = new Map<string, number>();
        filteredRows.forEach((r) => {
            const cat = r[groupCol.key]?.trim() || 'Other';
            const val = parseFloat(r[emissionKey] ?? '0');
            map.set(cat, (map.get(cat) ?? 0) + (isNaN(val) ? 0 : val));
        });
        return Array.from(map.entries()).map(([name, value], i) => ({
            name,
            value,
            fill: CHART_COLORS[i % CHART_COLORS.length],
            color: CHART_COLORS[i % CHART_COLORS.length],
        }));
    }, [filteredRows, groupCol, emissionKey]);

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
            )}
        </div>
    );
}
