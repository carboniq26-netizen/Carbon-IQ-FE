import { useState, useMemo } from 'react';
import { LayoutDashboard } from 'lucide-react';
import { useAggregatedEmissions, getMonthName } from '../hooks/useAggregatedEmissions';
import { Scope } from '../types/types';
import { MultiSelect } from '@/components/ui/multi-select';
import type { MultiSelectOption } from '@/components/ui/multi-select';
import { SummaryCards } from '@/components/overview/SummaryCards';
import { EmissionBarChart } from '@/components/charts/EmissionBarChart';
import { EmissionDonutChart } from '@/components/charts/EmissionDonutChart';

const SCOPE_COLORS = {
    [Scope.SCOPE_1]: '#EF4444',
    [Scope.SCOPE_2]: '#F59E0B',
    [Scope.SCOPE_3]: '#3B82F6',
    [Scope.BIOGENICS]: '#16A34A',
};

export default function Dashboard() {
    const {
        loading,
        getFilteredScopeTotal,
        getFilteredMetricTotal,
        getFilteredTotal: getFilteredTotalEmission,
        availableYears,
        getAvailableMonths,
    } = useAggregatedEmissions();

    const [selectedYears, setSelectedYears] = useState<string[]>([]);
    const [selectedMonths, setSelectedMonths] = useState<string[]>([]);

    const years = selectedYears.length > 0 ? selectedYears : undefined;
    const months = selectedMonths.length > 0 ? selectedMonths : undefined;

    const yearOptions: MultiSelectOption[] = useMemo(
        () => availableYears.map((y) => ({ value: y, label: y })),
        [availableYears]
    );

    const monthOptions: MultiSelectOption[] = useMemo(
        () => getAvailableMonths(years).map((m) => ({ value: m, label: getMonthName(m) })),
        [getAvailableMonths, years]
    );

    const total = getFilteredTotalEmission(years, months);
    const scope1Total = getFilteredScopeTotal(Scope.SCOPE_1, years, months);
    const scope2Total = getFilteredScopeTotal(Scope.SCOPE_2, years, months);
    const scope3Total = getFilteredScopeTotal(Scope.SCOPE_3, years, months);
    const biogenicsTotal = getFilteredScopeTotal(Scope.BIOGENICS, years, months);

    // New metrics for Row 2
    const solarGenerated = getFilteredMetricTotal('solar-power', 'Solar Generation (kWh)', years, months);
    const windGenerated = getFilteredMetricTotal('wind-power', 'Wind Energy Generation (KWh)', years, months);
    const biogasProduced = getFilteredMetricTotal('biogas', 'CH4 Produced (kg)', years, months);
    const biogasNetImpact = getFilteredMetricTotal('biogas', 'Net Emissions (kg CO2e)', years, months);

    const barData = [
        { name: 'Scope 1', value: scope1Total, fill: SCOPE_COLORS[Scope.SCOPE_1] },
        { name: 'Scope 2', value: scope2Total, fill: SCOPE_COLORS[Scope.SCOPE_2] },
        { name: 'Scope 3', value: scope3Total, fill: SCOPE_COLORS[Scope.SCOPE_3] },
        { name: 'Biogenics', value: biogenicsTotal, fill: SCOPE_COLORS[Scope.BIOGENICS] },
    ];

    const pieData = [
        { name: 'Scope 1', value: scope1Total, color: SCOPE_COLORS[Scope.SCOPE_1] },
        { name: 'Scope 2', value: scope2Total, color: SCOPE_COLORS[Scope.SCOPE_2] },
        { name: 'Scope 3', value: scope3Total, color: SCOPE_COLORS[Scope.SCOPE_3] },
        { name: 'Biogenics', value: biogenicsTotal, color: SCOPE_COLORS[Scope.BIOGENICS] },
    ].filter((d) => d.value > 0);

    const handleYearChange = (values: string[]) => {
        setSelectedYears(values);
        // Reset months that are no longer available for the new year selection
        if (values.length > 0) {
            const validMonths = getAvailableMonths(values);
            setSelectedMonths((prev) => prev.filter((m) => validMonths.includes(m)));
        } else {
            setSelectedMonths([]);
        }
    };

    const filterLabel = useMemo(() => {
        const parts: string[] = [];
        if (selectedYears.length > 0) parts.push(selectedYears.join(', '));
        if (selectedMonths.length > 0) parts.push(selectedMonths.map(getMonthName).join(', '));
        return parts.length > 0 ? parts.join(' · ') : 'All Time';
    }, [selectedYears, selectedMonths]);

    return (
        <div className="space-y-6">
            {/* Header & Filters */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <div className="flex items-center gap-3">
                        <LayoutDashboard className="w-7 h-7 text-primary" />
                        <h1 className="text-2xl font-bold text-text-main">Overview</h1>
                    </div>
                    <p className="text-text-secondary text-sm leading-relaxed mt-1">
                        Carbon emission metrics across all scopes — {filterLabel}
                    </p>
                </div>

                <div className="flex cursor-pointer gap-2">
                    <MultiSelect
                        options={yearOptions}
                        selected={selectedYears}
                        onChange={handleYearChange}
                        placeholder="All Years"
                        className='cursor-pointer'
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
            <SummaryCards
                scope1Total={scope1Total}
                scope2Total={scope2Total}
                scope3Total={scope3Total}
                biogenicsTotal={biogenicsTotal}
                solarGenerated={solarGenerated}
                windGenerated={windGenerated}
                biogasProduced={biogasProduced}
                biogasNetImpact={biogasNetImpact}
                loading={loading}
            />

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <EmissionBarChart data={barData} loading={loading} isEmpty={total === 0} />
                <EmissionDonutChart data={pieData} total={total} loading={loading} isEmpty={total === 0} />
            </div>
        </div>
    );
}
