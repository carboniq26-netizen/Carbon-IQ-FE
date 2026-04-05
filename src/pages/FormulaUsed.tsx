import React from 'react';
import { Calculator } from 'lucide-react';

export default function FormulaUsed() {
    // Reusable component for the notes sections
    const Section = ({ title, children }: { title: string, children: React.ReactNode }) => (
        <div className="mb-8">
            <h2 className="text-xl font-bold text-text-main border-b border-border pb-2 mb-4">
                {title}
            </h2>
            <div className="space-y-4">
                {children}
            </div>
        </div>
    );

    // Reusable component for sub-tabs and their formulas
    const FormulaRow = ({ subTab, formulas }: { subTab: string, formulas: string[] }) => (
        <div className="bg-card p-4 rounded-xl shadow-sm border border-border/50 hover:shadow-md transition-shadow">
            <h3 className="font-semibold text-lg text-primary mb-3">
                {subTab}
            </h3>
            <ul className="list-disc list-inside space-y-2 text-text-secondary">
                {formulas.map((f, i) => {
                    const [left, right] = f.split(/=(.+)/);
                    if (!right) return <li key={i} className="pl-2">{f}</li>;
                    return (
                        <li key={i} className="pl-2">
                            <span className="text-text-main font-medium">{left}=</span>
                            <span className="text-text-secondary ml-1">{right}</span>
                        </li>
                    );
                })}
            </ul>
        </div>
    );

    return (
        <div className="p-6 mx-auto pb-24">
            <div className="mb-8">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-primary/10 rounded-xl">
                        <Calculator className="w-7 h-7 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-text-main tracking-tight">Formulae Used</h1>
                        <p className="text-text-muted mt-1">Mathematical derivations and equations used for emission calculations.</p>
                    </div>
                </div>
            </div>

            <div className="bg-bg-main p-6 rounded-2xl border border-border hidden-scrollbar space-y-2">
                <Section title="Scope 1 (Direct Emissions)">
                    <div className="grid gap-4 sm:grid-cols-2">
                        <FormulaRow 
                            subTab="DG Set" 
                            formulas={[
                                "Emissions (KgCO₂e) = Fuel Consumed (L) × EF of Diesel (KgCO₂e/L)"
                            ]} 
                        />
                        <FormulaRow 
                            subTab="LPG" 
                            formulas={[
                                "Emissions (KgCO₂e) = Fuel Consumed (Kg) × EF of LPG (KgCO₂e/Kg)"
                            ]} 
                        />
                        <FormulaRow 
                            subTab="Campus Owned Vehicles" 
                            formulas={[
                                "Emissions (KgCO₂e) = Fuel Consumed (L) × EF of fuel (KgCO₂e/L)"
                            ]} 
                        />
                        <FormulaRow 
                            subTab="Fugitive Emissions" 
                            formulas={[
                                "Emissions (KgCO₂e) = (Fuel refilled (Kg) × GWP of refrigerant) / 1000"
                            ]} 
                        />
                        <FormulaRow 
                            subTab="STP (Sewage Treatment Plant)" 
                            formulas={[
                                "Emissions (KgCO₂e) = Wastewater Treated (m³) × EF (KgCO₂e/m³)"
                            ]} 
                        />
                        <FormulaRow 
                            subTab="Sludge Energy" 
                            formulas={[
                                "Emissions (KgCO₂e) = Sludge Produced (Kg) × EF of sludge (KgCO₂e/Kg)",
                                "Energy Generated (KWh) = Sludge Produced (Kg) × 0.35 × 6",
                                "Avoided Emissions (KgCO₂e) = Energy Generated (KWh) × EF of Electricity (KgCO₂e/KWh)"
                            ]} 
                        />
                    </div>
                    <div className="mt-4">
                        <FormulaRow 
                            subTab="Biogas Energy / Food Waste" 
                            formulas={[
                                "Biogas Produced (Kg) = (Food Waste (Kg) / 1000) × 88",
                                "Energy from Biogas = Biogas (Kg) × 50 MJ",
                                "LPG Equivalent Replaced (Kg) = Energy from Biogas (MJ) / 46 MJ",
                                "Avoided Emissions = LPG Equivalent (Kg) × 2.98 EF × 1000",
                                "Methane Leakage = Biogas Produced (Kg) × 0.1 × 28 (GWP)"
                            ]} 
                        />
                    </div>
                </Section>

                <Section title="Scope 2 (Energy Indirect)">
                    <FormulaRow 
                        subTab="Purchased Electricity" 
                        formulas={[
                            "Net Grid Electricity (KWh) = Electricity Consumed - Renewable Offsets (Solar + Wind)",
                            "Gross Emissions (KgCO₂e) = Net Grid Electricity (KWh) × EF (KgCO₂e/KWh)"
                        ]} 
                    />
                </Section>

                <Section title="Scope 3 (Other Indirect)">
                    <div className="grid gap-4 sm:grid-cols-2">
                        <FormulaRow 
                            subTab="Commuter Emissions" 
                            formulas={[
                                "Emissions (KgCO₂e) = No. of commuters × Distance (up/down) in Km × Working Days × EF (KgCO₂e/Km)"
                            ]} 
                        />
                        <FormulaRow 
                            subTab="Embodied Emissions" 
                            formulas={[
                                "Annualised Emissions (KgCO₂e) = (Material Weight × EF) / Lifespan"
                            ]} 
                        />
                        <FormulaRow 
                            subTab="Garden / General Waste" 
                            formulas={[
                                "Emissions (KgCO₂e) = Waste (Kg) × EF (KgCO₂e/Kg)"
                            ]} 
                        />
                    </div>
                </Section>

                <Section title="Biogenics">
                    <FormulaRow 
                        subTab="Biogenic Calculations" 
                        formulas={[
                            "Biogenic Emissions (KgCO₂e) = Population × Average Days on Campus × EF (1 kg/person/day)"
                        ]} 
                    />
                </Section>
            </div>
        </div>
    );
}
