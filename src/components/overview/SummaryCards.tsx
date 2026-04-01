import { Flame, Zap, Globe, Leaf, Sun, Wind, FlameKindling } from 'lucide-react';

interface SummaryCardsProps {

    scope1Total: number;
    scope2Total: number;
    scope3Total: number;
    biogenicsTotal: number;
    solarGenerated: number;
    windGenerated: number;
    biogasProduced: number;
    biogasNetImpact: number;
    loading: boolean;
}

// No longer used: scopeCards configuration moved to inline renderCard calls


export function SummaryCards({
    scope1Total,
    scope2Total,
    scope3Total,
    biogenicsTotal,
    solarGenerated,
    windGenerated,
    biogasProduced,
    biogasNetImpact,
    loading
}: SummaryCardsProps) {
    const renderCard = (label: string, subtitle: string, value: number, unit: string, Icon: React.ElementType, color: string, bgColor: string) => {
        return (
            <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                    <div className={`flex items-center justify-center w-9 h-9 rounded-lg ${bgColor}`}>
                        <Icon className={`w-5 h-5 ${color}`} />
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-text-muted tracking-wide">{label}</p>
                        <p className="text-[10px] text-text-muted">{subtitle}</p>
                    </div>
                </div>
                {loading ? (
                    <div className="h-8 w-24 rounded bg-bg-section animate-pulse" />
                ) : (
                    <div className="flex items-end gap-2">
                        <p className="text-2xl font-bold text-text-main">{value.toLocaleString(undefined, { maximumFractionDigits: 1 })}</p>
                        <span className="text-xs font-medium text-text-muted mb-1">
                            {unit}
                        </span>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="space-y-5">
            {/* Row 1: Scopes 1, 2, 3 and Biogenics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                {renderCard('Scope 1', 'Direct Emissions', scope1Total, 'kg CO₂e', Flame, 'text-danger', 'bg-danger/10')}
                {renderCard('Scope 2', 'Energy Indirect', scope2Total, 'kg CO₂e', Zap, 'text-warning', 'bg-warning/10')}
                {renderCard('Scope 3', 'Other Indirect', scope3Total, 'kg CO₂e', Globe, 'text-info', 'bg-info/10')}
                {renderCard('Biogenics', 'Biological Sources', biogenicsTotal, 'kg CO₂', Leaf, 'text-green-600', 'bg-green-100')}
            </div>

            {/* Row 2: Solar, Wind, Biogas Produced, Net Climate Impact */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                {renderCard('Solar Generated', 'Renewable Energy', solarGenerated, 'kWh', Sun, 'text-orange-500', 'bg-orange-100')}
                {renderCard('Wind Generated', 'Renewable Energy', windGenerated, 'kWh', Wind, 'text-cyan-500', 'bg-cyan-100')}
                {renderCard('Biogas Produced', 'CH₄ (Methane) Produced', biogasProduced, 'kg', FlameKindling, 'text-orange-600', 'bg-orange-100')}
                {renderCard('Net Climate Impact', 'Scope 3 Biogas', biogasNetImpact, 'kg CO₂e', Globe, 'text-indigo-600', 'bg-indigo-100')}
            </div>
        </div>
    );
}
