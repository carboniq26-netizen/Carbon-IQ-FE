import {
    Fuel,
    FlameKindling,
    Bus,
    Wind,
} from 'lucide-react';
import { type ColumnDef, type SubTabConfig, type ComputeField } from '../types/types';

/* ─────────────────────────────────────────────────────────
   Column definitions — derived from the actual Google Sheets
   ───────────────────────────────────────────────────────── */

const DG_SET_COLUMNS: ColumnDef[] = [
    { key: 'Reporting Year', label: 'Year', type: 'text' },
    { key: 'Month', label: 'Month', type: 'text' },
    { key: 'DG Set ID', label: 'DG Set ID', type: 'text' },
    { key: 'Fuel Consumption (Litres)', label: 'Diesel Consumed', type: 'numeric', showInCard: true, unit: 'Litres' },
    { key: 'Emission Factor (kg CO2e/Litre)', label: 'Emission Factor', type: 'numeric', unit: 'kg CO₂e/L' },
    { key: 'Calculated Emissions (kg CO2e)', label: 'Emissions (Kg CO₂e)', type: 'numeric', showInCard: true, unit: 'kg CO₂e' },
    { key: 'Calculated Emissions (tCO2e)', label: 'Emissions (t CO₂e)', type: 'numeric', showInCard: true, unit: 'tCO₂e' },
];

/* ── Computed fields for DG Set (client-side formula) ──── */
const DG_SET_COMPUTE_FIELDS: ComputeField[] = [
    {
        targetKey: 'Calculated Emissions (kg CO2e)',
        formula: (row) => {
            const fuel = parseFloat(row['Fuel Consumption (Litres)'] ?? '0');
            const ef = parseFloat(row['Emission Factor (kg CO2e/Litre)'] ?? '0');
            return isNaN(fuel) || isNaN(ef) ? 0 : fuel * ef;
        },
    },
    {
        targetKey: 'Calculated Emissions (tCO2e)',
        formula: (row) => {
            const fuel = parseFloat(row['Fuel Consumption (Litres)'] ?? '0');
            const ef = parseFloat(row['Emission Factor (kg CO2e/Litre)'] ?? '0');
            const kgEmission = isNaN(fuel) || isNaN(ef) ? 0 : fuel * ef;
            return kgEmission / 1000;
        },
    },
];

const LPG_COLUMNS: ColumnDef[] = [
    { key: 'Reporting Year', label: 'Year', type: 'text' },
    { key: 'Month', label: 'Month', type: 'text' },
    { key: 'Location (Kitchen/Lab/Boiler)', label: 'Location', type: 'text' },
    { key: 'Cylinder Size (kg)', label: 'Cylinder Size', type: 'numeric', unit: 'kg' },
    { key: 'Number of Cylinders Used', label: 'Cylinders Used', type: 'numeric' },
    { key: 'Total LPG Consumed (kg)', label: 'LPG Consumed', type: 'numeric', showInCard: true, unit: 'kg' },
    { key: 'Emission Factor (kg CO2e/kg LPG)', label: 'Emission Factor', type: 'numeric', unit: 'kg CO₂e/kg' },
    { key: 'Calculated Emissions (kg CO2e)', label: 'Emissions (Kg CO₂e)', type: 'numeric', showInCard: true, unit: 'kg CO₂e' },
    { key: 'Calculated Emissions (tCO2e)', label: 'Emissions (t CO₂e)', type: 'numeric', showInCard: true, unit: 'tCO₂e' },
];

/* ── Computed fields for LPG (client-side formula) ──────── */
const LPG_COMPUTE_FIELDS: ComputeField[] = [
    {
        // Total LPG (kg) = No. of Cylinders × Cylinder Size
        targetKey: 'Total LPG Consumed (kg)',
        formula: (row) => {
            const cylinders = parseFloat(row['Number of Cylinders Used'] ?? '0');
            const size = parseFloat(row['Cylinder Size (kg)'] ?? '0');
            return isNaN(cylinders) || isNaN(size) ? 0 : cylinders * size;
        },
    },
    {
        // Emissions (kg CO₂e) = LPG (kg) × EF
        targetKey: 'Calculated Emissions (kg CO2e)',
        formula: (row) => {
            const cylinders = parseFloat(row['Number of Cylinders Used'] ?? '0');
            const size = parseFloat(row['Cylinder Size (kg)'] ?? '0');
            const lpg = isNaN(cylinders) || isNaN(size) ? 0 : cylinders * size;
            const ef = parseFloat(row['Emission Factor (kg CO2e/kg LPG)'] ?? '0');
            return isNaN(ef) ? 0 : lpg * ef;
        },
    },
    {
        // Emissions (tCO₂e) = kg / 1000
        targetKey: 'Calculated Emissions (tCO2e)',
        formula: (row) => {
            const cylinders = parseFloat(row['Number of Cylinders Used'] ?? '0');
            const size = parseFloat(row['Cylinder Size (kg)'] ?? '0');
            const lpg = isNaN(cylinders) || isNaN(size) ? 0 : cylinders * size;
            const ef = parseFloat(row['Emission Factor (kg CO2e/kg LPG)'] ?? '0');
            const kgEmission = isNaN(ef) ? 0 : lpg * ef;
            return kgEmission / 1000;
        },
    },
];

const VEHICLE_COLUMNS: ColumnDef[] = [
    { key: 'Reporting Year', label: 'Year', type: 'text' },
    { key: 'Month', label: 'Month', type: 'text' },
    { key: 'Vehicle ID', label: 'Vehicle ID', type: 'text' },
    { key: 'Vehicle Type (Bus/Car/Van/Bike)', label: 'Vehicle Type', type: 'text' },
    { key: 'Fuel Type (Diesel/Petrol/CNG)', label: 'Fuel Type', type: 'text' },
    { key: 'Fuel Consumed (Litres or kg)', label: 'Fuel Consumed', type: 'numeric', showInCard: true, unit: 'L/kg' },
    { key: 'Emission Factor (kg CO2e per Litre or kg)', label: 'Emission Factor', type: 'numeric', unit: 'kg CO₂e/L' },
    { key: 'Calculated Emissions (kg CO2e)', label: 'Emissions (Kg CO₂e)', type: 'numeric', showInCard: true, unit: 'kg CO₂e' },
    { key: 'Calculated Emissions (tCO2e)', label: 'Emissions (t CO₂e)', type: 'numeric', showInCard: true, unit: 'tCO₂e' },
];

/* ── Computed fields for Campus Owned Vehicles (same as DG Set) ── */
const VEHICLE_COMPUTE_FIELDS: ComputeField[] = [
    {
        targetKey: 'Calculated Emissions (kg CO2e)',
        formula: (row) => {
            const fuel = parseFloat(row['Fuel Consumed (Litres or kg)'] ?? '0');
            const ef = parseFloat(row['Emission Factor (kg CO2e per Litre or kg)'] ?? '0');
            return isNaN(fuel) || isNaN(ef) ? 0 : fuel * ef;
        },
    },
    {
        targetKey: 'Calculated Emissions (tCO2e)',
        formula: (row) => {
            const fuel = parseFloat(row['Fuel Consumed (Litres or kg)'] ?? '0');
            const ef = parseFloat(row['Emission Factor (kg CO2e per Litre or kg)'] ?? '0');
            const kgEmission = isNaN(fuel) || isNaN(ef) ? 0 : fuel * ef;
            return kgEmission / 1000;
        },
    },
];

const FUGITIVE_COLUMNS: ColumnDef[] = [
    { key: 'Reporting Year', label: 'Year', type: 'text' },
    { key: 'Equipment ID', label: 'Equipment ID', type: 'text' },
    { key: 'Category', label: 'Category', type: 'text' },
    { key: 'Equipment Type (AC/Chiller/Refrigerator)', label: 'Equipment Type', type: 'text' },
    { key: 'Refrigerant Type (R22/R134a/R410A/etc.)', label: 'Refrigerant Type', type: 'text' },
    { key: 'Refrigerant Refilled During Year (kg)', label: 'Refilled', type: 'numeric', showInCard: true, unit: 'kg' },
    { key: 'GWP of Refrigerant', label: 'GWP', type: 'numeric' },
    { key: 'Calculated Emissions (kg CO2e)', label: 'Emissions (Kg CO₂e)', type: 'numeric', showInCard: true, unit: 'kg CO₂e' },
    { key: 'Calculated Emissions (tCO2e)', label: 'Emissions (t CO₂e)', type: 'numeric', showInCard: true, unit: 'tCO₂e' },
];

/* ── Computed fields for Fugitive Emissions ─────────────── */
/* Amount refilled = Amount leaked
   Emissions (kg CO₂e) = Refrigerant Refilled (kg) × GWP
   Emissions (tCO₂e)  = kg / 1000
   Each row is per-refrigerant, so different refrigerants
   within a category are calculated separately and summed
   automatically by the totals. */
const FUGITIVE_COMPUTE_FIELDS: ComputeField[] = [
    {
        targetKey: 'Calculated Emissions (kg CO2e)',
        formula: (row) => {
            const refilled = parseFloat(row['Refrigerant Refilled During Year (kg)'] ?? '0');
            const gwp = parseFloat(row['GWP of Refrigerant'] ?? '0');
            return isNaN(refilled) || isNaN(gwp) ? 0 : refilled * gwp;
        },
    },
    {
        targetKey: 'Calculated Emissions (tCO2e)',
        formula: (row) => {
            const refilled = parseFloat(row['Refrigerant Refilled During Year (kg)'] ?? '0');
            const gwp = parseFloat(row['GWP of Refrigerant'] ?? '0');
            const kgEmission = isNaN(refilled) || isNaN(gwp) ? 0 : refilled * gwp;
            return kgEmission / 1000;
        },
    },
];

/* ─────────────────────────────────────────────────────────
   Sub-tab configurations for Scope 1
   ───────────────────────────────────────────────────────── */

export const SCOPE1_TABS: SubTabConfig[] = [
    {
        key: 'dg-data',
        label: 'DG Set',
        sheetName: 'Scope1_DG_Set_Data',
        rawDataTableOverride: {
            sheetId: '1O4SWPoYaZcY2v0TGW2C98q0X5NB0FjG65fTExvqyvpI',
            sheetName: 'Scope 1_DG Data Set'
        },
        icon: Fuel,
        color: 'text-orange-600',
        bgColor: 'bg-orange-100',
        columns: DG_SET_COLUMNS,
        computeFields: DG_SET_COMPUTE_FIELDS,
    },
    {
        key: 'lpg-consumption',
        label: 'LPG Consumption',
        sheetName: 'Scope1_LPG_Consumption',
        icon: FlameKindling,
        color: 'text-red-600',
        bgColor: 'bg-red-100',
        columns: LPG_COLUMNS,
        computeFields: LPG_COMPUTE_FIELDS,
        filterColumns: ['Location (Kitchen/Lab/Boiler)'],
    },
    {
        key: 'campus-vehicles',
        label: 'Campus Owned Vehicles',
        sheetName: 'Scope1_Campus_Owned_Vehicles',
        icon: Bus,
        color: 'text-blue-600',
        bgColor: 'bg-blue-100',
        columns: VEHICLE_COLUMNS,
        computeFields: VEHICLE_COMPUTE_FIELDS,
        filterColumns: ['Vehicle Type (Bus/Car/Van/Bike)'],
    },
    {
        key: 'fugitive-emissions',
        label: 'Fugitive Emissions',
        sheetName: 'Scope1_Fugitive_Emissions',
        icon: Wind,
        color: 'text-teal-600',
        bgColor: 'bg-teal-100',
        columns: FUGITIVE_COLUMNS,
        computeFields: FUGITIVE_COMPUTE_FIELDS,
        filterColumns: ['Equipment Type (AC/Chiller/Refrigerator)'],
    },
];
