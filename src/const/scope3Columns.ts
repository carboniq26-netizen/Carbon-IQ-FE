import { Trash2, Droplets, CarFront, Building, Flame } from 'lucide-react';
import { type ColumnDef, type SubTabConfig, type ComputeField } from '../types/types';

/* ─────────────────────────────────────────────────────────
   Column definitions — Scope 3: Garden Waste
   Formula: Emissions (kg CO₂e) = Waste Quantity (tonnes) × 1000 × EF (kg CO₂e/kg)
            Emissions (tCO₂e)  = Emissions (kg CO₂e) / 1000
   ───────────────────────────────────────────────────────── */

const GARDEN_WASTE_COLUMNS: ColumnDef[] = [
    { key: 'Reporting Year', label: 'Year', type: 'text' },
    { key: 'Month', label: 'Month', type: 'text' },
    { key: 'Waste Source Location', label: 'Waste Source Location', type: 'text' },
    { key: 'Disposal Method (Composting/Landfill/Mulching/Open Burning)', label: 'Disposal Method', type: 'text' },
    { key: 'Waste Quantity in tonnes', label: 'Waste Quantity (t)', type: 'numeric', unit: 'tonnes' },
    { key: 'Waste Quantity (kg)', label: 'Waste Quantity', type: 'numeric', showInCard: true, unit: 'kg' },
    { key: 'Emission Factor (kg CO₂e/kg waste)', label: 'Emission Factor', type: 'numeric', unit: 'kg CO₂e/kg' },
    { key: 'Calculated Emissions (kg CO2e)', label: 'Emissions (Kg CO₂e)', type: 'numeric', showInCard: true, unit: 'kg CO₂e' },
    { key: 'Calculated Emissions (tCO2e)', label: 'Emissions (t CO₂e)', type: 'numeric', showInCard: true, unit: 'tCO₂e' },
];

/* ── Computed fields for Garden Waste ───────────────────── */
/* Waste Quantity is in tonnes, EF is per kg,
   so convert: tonnes × 1000 = kg, then kg × EF = kg CO₂e */
const GARDEN_WASTE_COMPUTE_FIELDS: ComputeField[] = [
    {
        targetKey: 'Waste Quantity (kg)',
        formula: (row) => {
            const wasteTonnes = parseFloat(row['Waste Quantity in tonnes'] ?? '0');
            return isNaN(wasteTonnes) ? 0 : wasteTonnes * 1000;
        },
    },
    {
        targetKey: 'Calculated Emissions (kg CO2e)',
        formula: (row) => {
            const wasteTonnes = parseFloat(row['Waste Quantity in tonnes'] ?? '0');
            const ef = parseFloat(row['Emission Factor (kg CO₂e/kg waste)'] ?? '0');
            const wasteKg = isNaN(wasteTonnes) ? 0 : wasteTonnes * 1000;
            return isNaN(ef) ? 0 : wasteKg * ef;
        },
    },
    {
        targetKey: 'Calculated Emissions (tCO2e)',
        formula: (row) => {
            const wasteTonnes = parseFloat(row['Waste Quantity in tonnes'] ?? '0');
            const ef = parseFloat(row['Emission Factor (kg CO₂e/kg waste)'] ?? '0');
            const wasteKg = isNaN(wasteTonnes) ? 0 : wasteTonnes * 1000;
            const kgEmission = isNaN(ef) ? 0 : wasteKg * ef;
            return kgEmission / 1000;
        },
    },
];

/* ─────────────────────────────────────────────────────────
   Column definitions — Scope 3: STP (Sewage Treatment Plant)
   IPCC 2006 Vol. 5, Ch. 6: Wastewater Treatment
   Formula:
     Total Emissions (kg CO₂e/year) = (Q × EF_anaerobic) + (Q × EF_aerobic)
     For monthly: Q_monthly = Q / 12
     Gross Emissions (kg CO₂e) = (Q / 12) × (EF_aerobic + EF_anaerobic)
     Gross Emissions (kg CO₂e) = (Q / 12) × EF
     Gross Emissions (tCO₂e)  = kg / 1000
   EF column from sheet contains IPCC 2006 reference values.
   ───────────────────────────────────────────────────────── */

const STP_COLUMNS: ColumnDef[] = [
    { key: 'Reporting Year', label: 'Year', type: 'text' },
    { key: 'Month', label: 'Month', type: 'text' },
    { key: 'STP Plant ID', label: 'STP Plant ID', type: 'text' },
    { key: 'Location', label: 'Location', type: 'text' },
    { key: 'Treatment Type', label: 'Treatment Type', type: 'text' },
    { key: 'Wastewater Treated (m3)', label: 'Wastewater Treated', type: 'numeric', showInCard: true, unit: 'm³' },
    { key: 'EF in kg CO₂e/m³', label: 'Emission Factor', type: 'numeric', unit: 'kg CO₂e/m³' },
    { key: 'Gross Emissions (kg CO2e)', label: 'Gross Emissions (Kg CO₂e)', type: 'numeric', showInCard: true, unit: 'kg CO₂e' },
    { key: 'Gross Emissions (tCO2e)', label: 'Gross Emissions (t CO₂e)', type: 'numeric', showInCard: true, unit: 'tCO₂e' },
];

/* ── Computed fields for STP ────────────────────────────── */
/* Q = Wastewater Treated (m³) — annual volume
   Monthly Emissions = (Q / 12) × EF */
const STP_COMPUTE_FIELDS: ComputeField[] = [
    {
        targetKey: 'Gross Emissions (kg CO2e)',
        formula: (row) => {
            const qStr = row['Wastewater Treated (m3)'] ?? '0';
            const efStr = row['EF in kg CO₂e/m³'] ?? '0';
            const q = parseFloat(qStr.replace(/,/g, ''));
            const ef = parseFloat(efStr.replace(/,/g, ''));
            return isNaN(q) || isNaN(ef) ? 0 : q * ef;
        },
    },
    {
        targetKey: 'Gross Emissions (tCO2e)',
        formula: (row) => {
            const qStr = row['Wastewater Treated (m3)'] ?? '0';
            const efStr = row['EF in kg CO₂e/m³'] ?? '0';
            const q = parseFloat(qStr.replace(/,/g, ''));
            const ef = parseFloat(efStr.replace(/,/g, ''));
            const kgEmission = isNaN(q) || isNaN(ef) ? 0 : q * ef;
            return kgEmission / 1000;
        },
    },
];

/* ─────────────────────────────────────────────────────────
   Column definitions — Scope 3: Commuting
   Formula:
     Total Distance (km) = Number of Commuters × Distance × Working Days
     Emissions (kg CO₂e)  = Total Distance × EF
     Emissions (tCO₂e)    = kg / 1000
   ───────────────────────────────────────────────────────── */

const COMMUTING_COLUMNS: ColumnDef[] = [
    { key: 'Reporting Year', label: 'Year', type: 'text' },
    { key: 'Month', label: 'Month', type: 'text' },
    { key: 'Commuter Category (Student/Teaching Staff/Non-Teaching Staff)', label: 'Commuter Category', type: 'text' },
    { key: 'Total Working Days per Month', label: 'Working Days', type: 'numeric' },
    { key: 'Distance', label: 'Distance', type: 'numeric', unit: 'km' },
    { key: 'Transport Mode (Bus/Car/Bike/Train/Walk)', label: 'Transport Mode', type: 'text' },
    { key: 'Fuel Source', label: 'Fuel Source', type: 'text' },
    { key: 'Number of Commuters', label: 'No. of Commuters', type: 'numeric' },
    { key: 'Emission Factor (kg CO2e per km per passenger)', label: 'Emission Factor', type: 'numeric', unit: 'kg CO₂e/km' },
    { key: 'Total Distance (km)', label: 'Total Distance', type: 'numeric', showInCard: true, unit: 'km' },
    { key: 'Calculated Emissions (kg CO2e)', label: 'Emissions (Kg CO₂e)', type: 'numeric', showInCard: true, unit: 'kg CO₂e' },
    { key: 'Calculated Emissions (tCO2e)', label: 'Emissions (t CO₂e)', type: 'numeric', showInCard: true, unit: 'tCO₂e' },
];

/* ── Computed fields for Commuting ──────────────────────── */
const COMMUTING_COMPUTE_FIELDS: ComputeField[] = [
    {
        // Total Distance = No. of Commuters × Distance × Working Days
        targetKey: 'Total Distance (km)',
        formula: (row) => {
            const commuters = parseFloat(row['Number of Commuters'] ?? '0');
            const distance = parseFloat(row['Distance'] ?? '0');
            const days = parseFloat(row['Total Working Days per Month'] ?? '0');
            return (isNaN(commuters) ? 0 : commuters)
                 * (isNaN(distance) ? 0 : distance)
                 * (isNaN(days) ? 0 : days);
        },
    },
    {
        // Emissions (kg CO₂e) = Total Distance × EF
        targetKey: 'Calculated Emissions (kg CO2e)',
        formula: (row) => {
            const commuters = parseFloat(row['Number of Commuters'] ?? '0');
            const distance = parseFloat(row['Distance'] ?? '0');
            const days = parseFloat(row['Total Working Days per Month'] ?? '0');
            const totalDist = (isNaN(commuters) ? 0 : commuters)
                            * (isNaN(distance) ? 0 : distance)
                            * (isNaN(days) ? 0 : days);
            const ef = parseFloat(row['Emission Factor (kg CO2e per km per passenger)'] ?? '0');
            return isNaN(ef) ? 0 : totalDist * ef;
        },
    },
    {
        targetKey: 'Calculated Emissions (tCO2e)',
        formula: (row) => {
            const commuters = parseFloat(row['Number of Commuters'] ?? '0');
            const distance = parseFloat(row['Distance'] ?? '0');
            const days = parseFloat(row['Total Working Days per Month'] ?? '0');
            const totalDist = (isNaN(commuters) ? 0 : commuters)
                            * (isNaN(distance) ? 0 : distance)
                            * (isNaN(days) ? 0 : days);
            const ef = parseFloat(row['Emission Factor (kg CO2e per km per passenger)'] ?? '0');
            const kgEmission = isNaN(ef) ? 0 : totalDist * ef;
            return kgEmission / 1000;
        },
    },
];

/* ─────────────────────────────────────────────────────────
   Column definitions — Embodied Emissions
   ───────────────────────────────────────────────────────── */

const EMBODIED_EMISSIONS_COLUMNS: ColumnDef[] = [
    { key: 'Reporting Year', label: 'Year', type: 'text' },
    { key: 'Building ID', label: 'Building ID', type: 'text' },
    { key: 'Building Name', label: 'Building Name', type: 'text' },
    { key: 'Year of Construction', label: 'Year Built', type: 'text' },
    { key: 'Built-up Area (m2)', label: 'Built-up Area (m²)', type: 'numeric' },
    { key: 'Area Emission Factor (Kg CO2e/m2/year)', label: 'Emission Factor', type: 'numeric', unit: 'kg CO₂e/m²' },
    { key: 'Assumed Building Lifetime (Years)', label: 'Lifetime (Years)', type: 'numeric', unit: 'Years' },
    { key: 'Annualised Emissions (kg CO2e)', label: 'Annualised Emissions', type: 'numeric', showInCard: true, unit: 'kg CO₂e' },
    { key: 'Annualised Emissions (tCO2e)', label: 'Annualised (tCO₂e)', type: 'numeric', showInCard: true, unit: 'tCO₂e' },
    { key: 'Total Embodied Emissions (kg CO2e)', label: 'Total Embodied', type: 'numeric', showInCard: true, unit: 'kg CO₂e' },
    { key: 'Total Embodied Emissions (tCO2e)', label: 'Total (tCO₂e)', type: 'numeric', showInCard: true, unit: 'tCO₂e' },
];

const EMBODIED_COMPUTE_FIELDS: ComputeField[] = [
    {
        targetKey: 'Total Embodied Emissions (kg CO2e)',
        formula: (row: Record<string, string>) => {
             const area = parseFloat(row['Built-up Area (m2)'] ?? '0');
             const ef = parseFloat(row['Area Emission Factor (Kg CO2e/m2/year)'] ?? '0');
             return (isNaN(area) ? 0 : area) * (isNaN(ef) ? 0 : ef);
        }
    },
    {
        targetKey: 'Total Embodied Emissions (tCO2e)',
        formula: (row: Record<string, string>) => {
             const area = parseFloat(row['Built-up Area (m2)'] ?? '0');
             const ef = parseFloat(row['Area Emission Factor (Kg CO2e/m2/year)'] ?? '0');
             return ((isNaN(area) ? 0 : area) * (isNaN(ef) ? 0 : ef)) / 1000;
        }
    },
    {
        targetKey: 'Annualised Emissions (kg CO2e)',
        formula: (row: Record<string, string>) => {
             const area = parseFloat(row['Built-up Area (m2)'] ?? '0');
             const ef = parseFloat(row['Area Emission Factor (Kg CO2e/m2/year)'] ?? '0');
             const embodiedKg = (isNaN(area) ? 0 : area) * (isNaN(ef) ? 0 : ef);
             
             const lifetime = parseFloat(row['Assumed Building Lifetime (Years)'] ?? '150');
             const validLifetime = isNaN(lifetime) || lifetime <= 0 ? 150 : lifetime;
             
             return embodiedKg / validLifetime;
        }
    },
    {
        targetKey: 'Annualised Emissions (tCO2e)',
        formula: (row: Record<string, string>) => {
             const area = parseFloat(row['Built-up Area (m2)'] ?? '0');
             const ef = parseFloat(row['Area Emission Factor (Kg CO2e/m2/year)'] ?? '0');
             const embodiedKg = (isNaN(area) ? 0 : area) * (isNaN(ef) ? 0 : ef);
             
             const lifetime = parseFloat(row['Assumed Building Lifetime (Years)'] ?? '150');
             const validLifetime = isNaN(lifetime) || lifetime <= 0 ? 150 : lifetime;
             
             return (embodiedKg / validLifetime) / 1000;
        }
    }
];

/* ─────────────────────────────────────────────────────────
   Column definitions — Biogas
   ───────────────────────────────────────────────────────── */

const BIOGAS_COLUMNS: ColumnDef[] = [
    { key: 'Reporting Year', label: 'Year', type: 'text' },
    { key: 'Month', label: 'Month', type: 'text' },
    { key: 'Biogas Plant ID', label: 'Biogas Plant ID', type: 'text' },
    { key: 'Food Waste Processed (Tonnes)', label: 'Food Waste Processed (t)', type: 'numeric', unit: 't' },
    { key: 'Food Waste Processed (kg)', label: 'Food Waste Processed', type: 'numeric', showInCard: true, unit: 'kg' },
    { key: 'CH4 Produced (kg)', label: 'Biogas (Methane) Produced', type: 'numeric', showInCard: true, unit: 'kg' },
    { key: 'CH4 Utilized (kg)', label: 'Biogas Utilized for Cooking', type: 'numeric', showInCard: true, unit: 'kg' },
    { key: 'Energy from Biogas (MJ)', label: 'Energy from Biogas', type: 'numeric', showInCard: true, unit: 'MJ' },
    { key: 'LPG Replaced (kg)', label: 'LPG Equivalent Replaced', type: 'numeric', showInCard: true, unit: 'kg' },
    { key: 'Avoided CO2 (kg CO2e)', label: 'Avoided Emissions (LPG Replacement)', type: 'numeric', showInCard: true, unit: 'kg CO₂e' },
    { key: 'CH4 Emissions (kg CO2e)', label: 'Methane Leakage/CH4 Emissions', type: 'numeric', showInCard: true, unit: 'kg CO₂e' },
    { key: 'Net Emissions (kg CO2e)', label: 'Net Emissions', type: 'numeric', unit: 'kg CO₂e' },
    { key: 'Net Emissions (tCO2e)', label: 'Net Emissions', type: 'numeric', showInCard: true, unit: 'tCO₂e' },
];

/* ── Updated Biogas Formulae (all derived from W only) ─────
   Constants:
     VS = 0.85          Volatile solids
     Bo = 0.6           Methane potential (m³/kg VS)
     F  = 0.5           Methane fraction
     1.33               Conversion factor
     η  = 0.8           Efficiency
     GWP(CH₄) = 28
     CV(CH₄)  = 50 MJ/kg
     CV(LPG)  = 46 MJ/kg
     EF(LPG)  = 2.98 kg CO₂/kg

   Part 1: CH₄ Produced      = W × 0.85 × 0.6 × 0.5 × 1.33
   Part 2: CH₄ Utilized      = CH₄ Produced × 0.8
   Part 3: Energy from Biogas = CH₄ Utilized × 50
   Part 4: LPG Replaced       = Energy from Biogas / 46
   Part 5: Avoided CO₂        = LPG Replaced × 2.98
   Part 6: CH₄ Emissions      = W × 0.85 × 0.6 × 0.2 × 0.5 × 1.33 × 28
   Part 7: Net Emissions       = CH₄ Emissions − Avoided CO₂
   ───────────────────────────────────────────────────────── */

const BIOGAS_COMPUTE_FIELDS: ComputeField[] = [
    {
        targetKey: 'Food Waste Processed (kg)',
        formula: (row) => {
             const wStr = row['Food Waste Processed (Tonnes)'] ?? '0';
             const W = parseFloat(wStr.replace(/,/g, ''));
             return isNaN(W) ? 0 : W * 1000;
        }
    },
    {
        // Part 1: CH₄ Produced = W × VS × Bo × F × 1.33
        targetKey: 'CH4 Produced (kg)',
        formula: (row) => {
             const wStr = row['Food Waste Processed (Tonnes)'] ?? '0';
             const W = parseFloat(wStr.replace(/,/g, ''));
             if (isNaN(W)) return 0;
             return W * 0.85 * 0.6 * 0.5 * 1.33;
        }
    },
    {
        // Part 2: CH₄ Utilized = CH₄ Produced × η(0.8)
        targetKey: 'CH4 Utilized (kg)',
        formula: (row) => {
             const wStr = row['Food Waste Processed (Tonnes)'] ?? '0';
             const W = parseFloat(wStr.replace(/,/g, ''));
             if (isNaN(W)) return 0;
             const ch4Produced = W * 0.85 * 0.6 * 0.5 * 1.33;
             return ch4Produced * 0.8;
        }
    },
    {
        // Part 3: Energy from Biogas = CH₄ Utilized × 50 MJ/kg
        targetKey: 'Energy from Biogas (MJ)',
        formula: (row) => {
             const wStr = row['Food Waste Processed (Tonnes)'] ?? '0';
             const W = parseFloat(wStr.replace(/,/g, ''));
             if (isNaN(W)) return 0;
             const ch4Produced = W * 0.85 * 0.6 * 0.5 * 1.33;
             const ch4Utilized = ch4Produced * 0.8;
             return ch4Utilized * 50;
        }
    },
    {
        // Part 4: LPG Replaced = Energy from Biogas / 46
        targetKey: 'LPG Replaced (kg)',
        formula: (row) => {
             const wStr = row['Food Waste Processed (Tonnes)'] ?? '0';
             const W = parseFloat(wStr.replace(/,/g, ''));
             if (isNaN(W)) return 0;
             const ch4Produced = W * 0.85 * 0.6 * 0.5 * 1.33;
             const ch4Utilized = ch4Produced * 0.8;
             const energyFromBiogas = ch4Utilized * 50;
             return energyFromBiogas / 46;
        }
    },
    {
        // Part 5: Avoided CO₂ = LPG Replaced × 2.98
        targetKey: 'Avoided CO2 (kg CO2e)',
        formula: (row) => {
             const wStr = row['Food Waste Processed (Tonnes)'] ?? '0';
             const W = parseFloat(wStr.replace(/,/g, ''));
             if (isNaN(W)) return 0;
             const ch4Produced = W * 0.85 * 0.6 * 0.5 * 1.33;
             const ch4Utilized = ch4Produced * 0.8;
             const energyFromBiogas = ch4Utilized * 50;
             const lpgReplaced = energyFromBiogas / 46;
             return lpgReplaced * 2.98;
        }
    },
    {
        // Part 6: CH₄ Emissions = W × 0.85 × 0.6 × 0.2 × 0.5 × 1.33 × 28
        targetKey: 'CH4 Emissions (kg CO2e)',
        formula: (row) => {
             const wStr = row['Food Waste Processed (Tonnes)'] ?? '0';
             const W = parseFloat(wStr.replace(/,/g, ''));
             if (isNaN(W)) return 0;
             return W * 0.85 * 0.6 * 0.2 * 0.5 * 1.33 * 28;
        }
    },
    {
        // Part 7: Net Emissions = CH₄ Emissions − Avoided CO₂
        targetKey: 'Net Emissions (kg CO2e)',
        formula: (row) => {
             const wStr = row['Food Waste Processed (Tonnes)'] ?? '0';
             const W = parseFloat(wStr.replace(/,/g, ''));
             if (isNaN(W)) return 0;
             const ch4Produced = W * 0.85 * 0.6 * 0.5 * 1.33;
             const ch4Utilized = ch4Produced * 0.8;
             const energyFromBiogas = ch4Utilized * 50;
             const lpgReplaced = energyFromBiogas / 46;
             const avoidedCO2 = lpgReplaced * 2.98;
             const ch4Emissions = W * 0.85 * 0.6 * 0.2 * 0.5 * 1.33 * 28;
             return ch4Emissions - avoidedCO2;
        }
    },
    {
        targetKey: 'Net Emissions (tCO2e)',
        formula: (row) => {
             const wStr = row['Food Waste Processed (Tonnes)'] ?? '0';
             const W = parseFloat(wStr.replace(/,/g, ''));
             if (isNaN(W)) return 0;
             const ch4Produced = W * 0.85 * 0.6 * 0.5 * 1.33;
             const ch4Utilized = ch4Produced * 0.8;
             const energyFromBiogas = ch4Utilized * 50;
             const lpgReplaced = energyFromBiogas / 46;
             const avoidedCO2 = lpgReplaced * 2.98;
             const ch4Emissions = W * 0.85 * 0.6 * 0.2 * 0.5 * 1.33 * 28;
             return (ch4Emissions - avoidedCO2) / 1000;
        }
    },
];

/* ─────────────────────────────────────────────────────────
   Sub-tab configurations for Scope 3
   ───────────────────────────────────────────────────────── */

export const SCOPE3_TABS: SubTabConfig[] = [
    {
        key: 'garden-waste',
        label: 'Garden Waste',
        sheetName: 'Scope 3_Garden Waste',
        icon: Trash2,
        color: 'text-green-600',
        bgColor: 'bg-green-100',
        columns: GARDEN_WASTE_COLUMNS,
        computeFields: GARDEN_WASTE_COMPUTE_FIELDS,
        filterColumns: ['Waste Source Location', 'Disposal Method (Composting/Landfill/Mulching/Open Burning)'],
    },
    {
        key: 'embodied-emissions',
        label: 'Embodied Emissions',
        sheetName: 'Scope 3_Embodied Emissions',
        icon: Building,
        color: 'text-zinc-600',
        bgColor: 'bg-zinc-100',
        columns: EMBODIED_EMISSIONS_COLUMNS,
        computeFields: EMBODIED_COMPUTE_FIELDS,
        filterColumns: ['Building Name'],
    },
    {
        key: 'biogas',
        label: 'Biogas',
        sheetName: 'Scope 3_Biogas',
        icon: Flame,
        color: 'text-orange-500',
        bgColor: 'bg-orange-100',
        columns: BIOGAS_COLUMNS,
        computeFields: BIOGAS_COMPUTE_FIELDS,
        filterColumns: ['Biogas Plant ID'],
    },
    {
        key: 'stp',
        label: 'Sewage Treatment Plant (STP)',
        sheetName: 'Scope 3_STP',
        icon: Droplets,

        color: 'text-cyan-600',
        bgColor: 'bg-cyan-100',
        columns: STP_COLUMNS,
        computeFields: STP_COMPUTE_FIELDS,
        filterColumns: ['Treatment Type'],
    },
    {
        key: 'commuting',
        label: 'Commuters',
        sheetName: 'Scope 3_Commuting',
        icon: CarFront,
        color: 'text-violet-600',
        bgColor: 'bg-violet-100',
        columns: COMMUTING_COLUMNS,
        computeFields: COMMUTING_COMPUTE_FIELDS,
        filterColumns: [
            'Commuter Category (Student/Teaching Staff/Non-Teaching Staff)',
            'Transport Mode (Bus/Car/Bike/Train/Walk)',
        ],
    },
];

