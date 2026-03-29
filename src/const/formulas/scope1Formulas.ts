/**
 * Scope 1 — Emission Calculation Formulas
 *
 * All formulas are pure functions that take raw numeric inputs
 * and return the calculated result. Units are documented
 * inline so any consumer can stay consistent.
 */

/* ─────────────────────────────────────────────────────────
   DG Set
   Formula: Emissions (kg CO₂e) = Diesel Consumption (Litres) × Emission Factor (kg CO₂e / Litre)
   ───────────────────────────────────────────────────────── */

/**
 * Calculate DG Set emissions in kg CO₂e.
 *
 * @param dieselLitres  - Fuel / diesel consumed in litres
 * @param emissionFactor - Emission factor in kg CO₂e per litre
 * @returns emissions in kg CO₂e
 */
export const calcDGSetEmission = (
    dieselLitres: number,
    emissionFactor: number,
): number => dieselLitres * emissionFactor;

/**
 * Convert kg CO₂e → tonnes CO₂e (tCO₂e).
 */
export const kgToTonnes = (kgCO2e: number): number => kgCO2e / 1000;

/* ─────────────────────────────────────────────────────────
   LPG Consumption
   Formula: Emissions (kg CO₂e) = Total LPG Consumed (kg) × Emission Factor (kg CO₂e / kg LPG)
   ───────────────────────────────────────────────────────── */

/**
 * Calculate LPG emissions in kg CO₂e.
 *
 * @param lpgKg         - Total LPG consumed in kg
 * @param emissionFactor - Emission factor in kg CO₂e per kg LPG
 * @returns emissions in kg CO₂e
 */
export const calcLPGEmission = (
    lpgKg: number,
    emissionFactor: number,
): number => lpgKg * emissionFactor;

/* ─────────────────────────────────────────────────────────
   Campus Owned Vehicles
   Formula: Emissions (kg CO₂e) = Fuel Consumed (Litres or kg) × Emission Factor (kg CO₂e per Litre or kg)
   ───────────────────────────────────────────────────────── */

/**
 * Calculate vehicle emissions in kg CO₂e.
 *
 * @param fuelConsumed   - Fuel consumed in litres or kg
 * @param emissionFactor - Emission factor in kg CO₂e per litre/kg
 * @returns emissions in kg CO₂e
 */
export const calcVehicleEmission = (
    fuelConsumed: number,
    emissionFactor: number,
): number => fuelConsumed * emissionFactor;

/* ─────────────────────────────────────────────────────────
   Fugitive Emissions
   Formula: Emissions (kg CO₂e) = Refrigerant Leakage (kg) × GWP
   ───────────────────────────────────────────────────────── */

/**
 * Calculate fugitive emissions in kg CO₂e.
 *
 * @param leakageKg - Estimated refrigerant leakage in kg
 * @param gwp       - Global Warming Potential of the refrigerant
 * @returns emissions in kg CO₂e
 */
export const calcFugitiveEmission = (
    leakageKg: number,
    gwp: number,
): number => leakageKg * gwp;
