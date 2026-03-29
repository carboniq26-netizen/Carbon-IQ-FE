import { Flame, Zap, Globe, TrendingDown, Leaf } from 'lucide-react';
import { Scope } from '@/types/types';

interface SummaryCardsProps {
    total: number;
    scope1Total: number;
    scope2Total: number;
    scope3Total: number;
    biogenicsTotal: number;
    loading: boolean;
}

const scopeCards = [
    {
        scope: Scope.SCOPE_1,
        label: 'Scope 1',
        subtitle: 'Direct Emissions',
        icon: Flame,
        color: 'text-danger',
        bgColor: 'bg-danger/10',
    },
    {
        scope: Scope.SCOPE_2,
        label: 'Scope 2',
        subtitle: 'Energy Indirect',
        icon: Zap,
        color: 'text-warning',
        bgColor: 'bg-warning/10',
    },
    {
        scope: Scope.SCOPE_3,
        label: 'Scope 3',
        subtitle: 'Other Indirect',
        icon: Globe,
        color: 'text-info',
        bgColor: 'bg-info/10',
    },
];

export function SummaryCards({ total, scope1Total, scope2Total, scope3Total, biogenicsTotal, loading }: SummaryCardsProps) {
    const getScopeTotal = (scope: Scope) => {
        if (scope === Scope.SCOPE_1) return scope1Total;
        if (scope === Scope.SCOPE_2) return scope2Total;
        if (scope === Scope.SCOPE_3) return scope3Total;
        return biogenicsTotal;
    };

    const biogenicsCard = {
        scope: Scope.BIOGENICS,
        label: 'Biogenics',
        subtitle: 'Biological Sources',
        icon: Leaf,
        color: 'text-green-600',
        bgColor: 'bg-green-100',
    };

    const renderCard = (scope: Scope, label: string, subtitle: string, Icon: React.ElementType, color: string, bgColor: string) => {
        const scopeTotal = getScopeTotal(scope);
        const percentage = total > 0 && scope !== Scope.BIOGENICS ? ((scopeTotal / total) * 100).toFixed(1) : '0';

        return (
            <div key={scope} className="rounded-xl border border-border bg-card p-5 shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                    <div className={`flex items-center justify-center w-9 h-9 rounded-lg ${bgColor}`}>
                        <Icon className={`w-5 h-5 ${color}`} />
                    </div>
                    <div>
                        <p className="text-xs font-medium text-text-muted uppercase tracking-wide">{label}</p>
                        <p className="text-[10px] text-text-muted">{subtitle}</p>
                    </div>
                </div>
                {loading ? (
                    <div className="h-8 w-24 rounded bg-bg-section animate-pulse" />
                ) : (
                    <div className="flex items-end gap-2">
                        <p className="text-2xl font-bold text-text-main">{scopeTotal.toFixed(1)}</p>
                        <span className="text-xs font-medium text-text-muted mb-1">
                            {scope === Scope.BIOGENICS ? 'kg CO₂' : `kg CO₂e · ${percentage}%`}
                        </span>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="flex flex-col gap-5">
            {/* Top Row: Total and Biogenics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Total Card */}
                <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary-soft">
                            <TrendingDown className="w-5 h-5 text-primary" />
                        </div>
                        <p className="text-xs font-medium text-text-muted uppercase tracking-wide">Total Emissions</p>
                    </div>
                    {loading ? (
                        <div className="h-8 w-24 rounded bg-bg-section animate-pulse" />
                    ) : (
                        <p className="text-2xl font-bold text-text-main">
                            {total.toFixed(1)} <span className="text-sm font-normal text-text-muted">kg CO₂e</span>
                        </p>
                    )}
                </div>

                {/* Biogenics Card */}
                {renderCard(biogenicsCard.scope, biogenicsCard.label, biogenicsCard.subtitle, biogenicsCard.icon, biogenicsCard.color, biogenicsCard.bgColor)}
            </div>

            {/* Bottom Row: Scopes 1, 2, 3 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {scopeCards.map(({ scope, label, subtitle, icon, color, bgColor }) =>
                    renderCard(scope, label, subtitle, icon, color, bgColor)
                )}
            </div>
        </div>
    );
}
