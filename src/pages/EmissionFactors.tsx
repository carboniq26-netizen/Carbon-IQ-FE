import { BookOpen, Flame, Zap, Globe, Leaf } from 'lucide-react';

const FUGITIVE_DATA = [
    { name: 'R-22', gwp: 1810 },
    { name: 'R-32', gwp: 675 },
    { name: 'R-134a', gwp: 1430 },
    { name: 'R-404A', gwp: 3922 },
    { name: 'R-407C', gwp: 1774 },
    { name: 'R-410A', gwp: 2088 },
    { name: 'R-507A', gwp: 3985 },
    { name: 'R-508B', gwp: 13396 },
    { name: 'HFC-227ea', gwp: 3220 },
    { name: 'FK-5-1-12 (Novec 1230)', gwp: 1 },
];

const VEHICLE_DATA = [
    { year: '2020', petrol: 2.31, diesel: 2.68, ev: 0.82 },
    { year: '2021', petrol: 2.31, diesel: 2.68, ev: 0.79 },
    { year: '2022', petrol: 2.31, diesel: 2.68, ev: 0.76 },
    { year: '2023', petrol: 2.31, diesel: 2.68, ev: 0.73 },
    { year: '2024', petrol: 2.31, diesel: 2.68, ev: 0.71 },
    { year: '2025 (est)', petrol: 2.31, diesel: 2.68, ev: 0.70 },
];

const ELECTRICITY_DATA = [
    { year: '2024', ef: 0.727 },
    { year: '2025', ef: 0.710 },
];

const GARDEN_WASTE_DATA = [
    { method: 'Composting', ef: 0.02 },
    { method: 'Landfill', ef: 0.6 },
    { method: 'Open burning', ef: 1.5 },
    { method: 'Mulching', ef: 0.002 },
];

const FOOD_WASTE_DICTS = [
    { key: 'Volatile solids fraction of food waste', val: '0.85 (0.80–0.90)', unit: 'tonne VS / tonne waste' },
    { key: 'Maximum methane generation potential', val: '0.6', unit: 'm³ CH₄ / kg VS' },
    { key: 'Methane correction factor (controlled)', val: '1', unit: 'dimensionless' },
    { key: 'Methane capture efficiency of digester', val: '0.8 – 0.95 (commonly 0.9)', unit: 'fraction' },
    { key: 'Density of methane at standard temp/pressure', val: '0.67', unit: 'kg CH₄ / m³ CH₄' },
    { key: 'Global warming potential of methane', val: '28', unit: 'kg CO₂e / kg CH₄' },
];

function SectionCard({ title, icon: Icon, colorClass, children }: { title: string, icon: React.ElementType, colorClass: string, children: React.ReactNode }) {
    return (
        <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
            <div className={`flex items-center gap-3 px-5 py-4 border-b border-border bg-bg-section/30`}>
                <Icon className={`w-5 h-5 ${colorClass}`} />
                <h2 className="text-lg font-semibold text-text-main">{title}</h2>
            </div>
            <div className="p-5">
                {children}
            </div>
        </div>
    );
}

export default function EmissionFactors() {
    return (
        <div className="space-y-6 p-5 pb-12">
            <div>
                <div className="flex items-center gap-3">
                    <BookOpen className="w-7 h-7 text-indigo-600" />
                    <h1 className="text-2xl font-bold text-text-main">Emission Factors Reference</h1>
                </div>
                <p className="text-text-secondary text-sm leading-relaxed mt-1">
                    Static reference data, methodologies, and standard conversion factors derived from the official template documentation.
                </p>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

                {/* ─ SCOPE 1 ─ */}
                <div className="space-y-6">
                    <SectionCard title="Scope 1: Direct Emissions" icon={Flame} colorClass="text-danger">
                        
                        <div className="mb-6">
                            <h3 className="text-sm font-semibold text-text-main mb-2">Fugitive Emissions (Refrigerants)</h3>
                            <div className="overflow-x-auto rounded-lg border border-border">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-bg-section text-text-muted uppercase text-xs">
                                        <tr><th className="px-4 py-2">Refrigerant</th><th className="px-4 py-2">GWP (100-year)</th></tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                        {FUGITIVE_DATA.map(d => (
                                            <tr key={d.name} className="hover:bg-bg-section/50">
                                                <td className="px-4 py-2 font-medium text-text-main">{d.name}</td>
                                                <td className="px-4 py-2 text-text-secondary">{d.gwp}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="mb-6">
                            <h3 className="text-sm font-semibold text-text-main mb-2">Campus Owned Vehicles (Mobile Combustion)</h3>
                            <div className="overflow-x-auto rounded-lg border border-border">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-bg-section text-text-muted uppercase text-xs">
                                        <tr>
                                            <th className="px-4 py-2">Year</th>
                                            <th className="px-4 py-2">Petrol (kg CO₂/L)</th>
                                            <th className="px-4 py-2">Diesel (kg CO₂/L)</th>
                                            <th className="px-4 py-2">EV (kg CO₂/kWh)</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                        {VEHICLE_DATA.map(d => (
                                            <tr key={d.year} className="hover:bg-bg-section/50">
                                                <td className="px-4 py-2 font-medium text-text-main">{d.year}</td>
                                                <td className="px-4 py-2 text-text-secondary">{d.petrol}</td>
                                                <td className="px-4 py-2 text-text-secondary">{d.diesel}</td>
                                                <td className="px-4 py-2 text-text-secondary font-medium text-blue-600">{d.ev}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div>
                                <h3 className="text-sm font-semibold text-text-main">DG Set (Stationary Combustion)</h3>
                                <p className="text-sm text-text-secondary bg-bg-section p-3 rounded-lg mt-1 border border-border">
                                    Diesel = <strong>2.68</strong> kg CO₂/L
                                </p>
                            </div>
                            <div>
                                <h3 className="text-sm font-semibold text-text-main">LPG Consumption</h3>
                                <p className="text-sm text-text-secondary bg-bg-section p-3 rounded-lg mt-1 border border-border">
                                    Diesel = <strong>2.68</strong> kg CO₂e/kg (Note: Value matched from doc)
                                </p>
                            </div>
                        </div>
                    </SectionCard>

                    <SectionCard title="Biogenics" icon={Leaf} colorClass="text-green-600">
                        <p className="text-sm text-text-secondary bg-bg-section p-4 rounded-xl border border-border">
                            Calculated at: <strong>1 Kg CO₂ / per person / per day</strong>
                        </p>
                    </SectionCard>
                </div>

                {/* ─ SCOPE 2 & 3 ─ */}
                <div className="space-y-6">
                    <SectionCard title="Scope 2: Energy Indirect" icon={Zap} colorClass="text-warning">
                        <h3 className="text-sm font-semibold text-text-main mb-2">Electricity Purchased</h3>
                        <div className="overflow-x-auto rounded-lg border border-border">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-bg-section text-text-muted uppercase text-xs">
                                    <tr><th className="px-4 py-2">Year</th><th className="px-4 py-2">Grid Emission Factor (tCO₂/MWh)</th></tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {ELECTRICITY_DATA.map(d => (
                                        <tr key={d.year} className="hover:bg-bg-section/50">
                                            <td className="px-4 py-2 font-medium text-text-main">{d.year}</td>
                                            <td className="px-4 py-2 text-text-secondary">{d.ef}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </SectionCard>

                    <SectionCard title="Scope 3: Other Indirect" icon={Globe} colorClass="text-info">
                        <div className="mb-6">
                            <h3 className="text-sm font-semibold text-text-main mb-2">Garden Waste (CO₂ Equivalent)</h3>
                            <div className="overflow-x-auto rounded-lg border border-border">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-bg-section text-text-muted uppercase text-xs">
                                        <tr><th className="px-4 py-2">Disposal Method</th><th className="px-4 py-2">Factor (kg CO₂e/kg)</th></tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                        {GARDEN_WASTE_DATA.map(d => (
                                            <tr key={d.method} className="hover:bg-bg-section/50">
                                                <td className="px-4 py-2 font-medium text-text-main">{d.method}</td>
                                                <td className="px-4 py-2 text-text-secondary">{d.ef}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="mb-6">
                            <h3 className="text-sm font-semibold text-text-main mb-2">Food Waste Biogas</h3>
                            <div className="overflow-x-auto rounded-lg border border-border">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-bg-section text-text-muted uppercase text-xs">
                                        <tr><th className="px-4 py-2">Parameter</th><th className="px-4 py-2">Value</th><th className="px-4 py-2">Unit</th></tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                        {FOOD_WASTE_DICTS.map(d => (
                                            <tr key={d.key} className="hover:bg-bg-section/50">
                                                <td className="px-4 py-2 font-medium text-text-main">{d.key}</td>
                                                <td className="px-4 py-2 text-text-secondary font-medium">{d.val}</td>
                                                <td className="px-4 py-2 text-text-muted">{d.unit}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div>
                                <h3 className="text-sm font-semibold text-text-main">Sewage Treatment Plant (STP)</h3>
                                <div className="text-sm text-text-secondary bg-bg-section p-3 rounded-lg mt-1 border border-border flex flex-col gap-1">
                                    <span>EF Aerobic = <strong>0.25</strong> kg CO₂e/m³</span>
                                    <span>EF Anaerobic = <strong>2.0</strong> kg CO₂e/m³</span>
                                </div>
                            </div>
                            <div>
                                <h3 className="text-sm font-semibold text-text-main">Embodied Emission</h3>
                                <p className="text-sm text-text-secondary bg-bg-section p-3 rounded-lg mt-1 border border-border">
                                    Area based embodied carbon method: <strong>0.2</strong> Kg CO₂/m²/year
                                </p>
                            </div>
                        </div>
                    </SectionCard>

                </div>
            </div>
        </div>
    );
}
