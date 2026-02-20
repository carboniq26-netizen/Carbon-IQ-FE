import {
    Fuel,
    FlameKindling,
    Bus,
    Wind,
} from 'lucide-react';
import { type ColumnDef, type SubTabConfig } from '../types/types';

/* ─────────────────────────────────────────────────────────
   Column definitions — derived from the actual Google Sheets
   ───────────────────────────────────────────────────────── */

const DG_SET_COLUMNS: ColumnDef[] = [
    { key: 'Reporting Year', label: 'Year', type: 'text' },
    { key: 'Month', label: 'Month', type: 'text' },
    { key: 'DG Set ID', label: 'DG Set ID', type: 'text' },
    { key: 'Location', label: 'Location', type: 'text' },
    { key: 'Capacity (kVA)', label: 'Capacity (kVA)', type: 'numeric', showInCard: true, unit: 'kVA' },
    { key: 'Fuel Type', label: 'Fuel Type', type: 'text' },
    { key: 'Fuel Consumption (Litres)', label: 'Fuel Consumption', type: 'numeric', showInCard: true, unit: 'Litres' },
    { key: 'Operating Hours (Optional)', label: 'Operating Hours', type: 'numeric', showInCard: true, unit: 'hrs' },
    { key: 'Load Factor (%) (Optional)', label: 'Load Factor', type: 'numeric', showInCard: true, unit: '%' },
    { key: 'Specific Fuel Consumption (L/kWh) (Optional)', label: 'Specific Fuel Cons.', type: 'numeric', unit: 'L/kWh' },
    { key: 'Emission Factor (kg CO2e/Litre)', label: 'Emission Factor', type: 'numeric', showInCard: true, unit: 'kg CO₂e/L' },
    { key: 'Calculated Emissions (kg CO2e)', label: 'Emissions (kg)', type: 'numeric', showInCard: true, unit: 'kg CO₂e' },
    { key: 'Calculated Emissions (tCO2e)', label: 'Emissions (t)', type: 'numeric', showInCard: true, unit: 'tCO₂e' },
    { key: 'Data Source (Bill/Logbook/Estimate)', label: 'Data Source', type: 'text' },
    { key: 'Remarks', label: 'Remarks', type: 'text' },
];

const LPG_COLUMNS: ColumnDef[] = [
    { key: 'Reporting Year', label: 'Year', type: 'text' },
    { key: 'Month', label: 'Month', type: 'text' },
    { key: 'Location (Kitchen/Lab/Boiler)', label: 'Location', type: 'text' },
    { key: 'LPG Type (Commercial/Domestic/Bulk)', label: 'LPG Type', type: 'text' },
    { key: 'Cylinder Size (kg)', label: 'Cylinder Size', type: 'numeric', showInCard: true, unit: 'kg' },
    { key: 'Number of Cylinders Used', label: 'Cylinders Used', type: 'numeric', showInCard: true },
    { key: 'Total LPG Consumed (kg)', label: 'Total LPG', type: 'numeric', showInCard: true, unit: 'kg' },
    { key: 'Emission Factor (kg CO2e/kg LPG)', label: 'Emission Factor', type: 'numeric', showInCard: true, unit: 'kg CO₂e/kg' },
    { key: 'Calculated Emissions (kg CO2e)', label: 'Emissions (kg)', type: 'numeric', showInCard: true, unit: 'kg CO₂e' },
    { key: 'Calculated Emissions (tCO2e)', label: 'Emissions (t)', type: 'numeric', showInCard: true, unit: 'tCO₂e' },
    { key: 'Data Source (Invoice/Logbook/Estimate)', label: 'Data Source', type: 'text' },
    { key: 'Remarks', label: 'Remarks', type: 'text' },
];

const VEHICLE_COLUMNS: ColumnDef[] = [
    { key: 'Reporting Year', label: 'Year', type: 'text' },
    { key: 'Month', label: 'Month', type: 'text' },
    { key: 'Vehicle ID', label: 'Vehicle ID', type: 'text' },
    { key: 'Vehicle Type (Bus/Car/Van/Bike)', label: 'Vehicle Type', type: 'text' },
    { key: 'Department', label: 'Department', type: 'text' },
    { key: 'Fuel Type (Diesel/Petrol/CNG)', label: 'Fuel Type', type: 'text' },
    { key: 'Fuel Consumed (Litres or kg)', label: 'Fuel Consumed', type: 'numeric', showInCard: true, unit: 'L/kg' },
    { key: 'Distance Travelled (km) (Optional)', label: 'Distance', type: 'numeric', showInCard: true, unit: 'km' },
    { key: 'Average Mileage (km/L) (Optional)', label: 'Avg Mileage', type: 'numeric', showInCard: true, unit: 'km/L' },
    { key: 'Estimated Fuel from Distance (Litres) (Optional)', label: 'Est. Fuel (Distance)', type: 'numeric', showInCard: true, unit: 'L' },
    { key: 'Emission Factor (kg CO2e per Litre or kg)', label: 'Emission Factor', type: 'numeric', showInCard: true, unit: 'kg CO₂e/L' },
    { key: 'Calculated Emissions (kg CO2e)', label: 'Emissions (kg)', type: 'numeric', showInCard: true, unit: 'kg CO₂e' },
    { key: 'Calculated Emissions (tCO2e)', label: 'Emissions (t)', type: 'numeric', showInCard: true, unit: 'tCO₂e' },
    { key: 'Data Source (Fuel Bill/Logbook/Estimate)', label: 'Data Source', type: 'text' },
    { key: 'Remarks', label: 'Remarks', type: 'text' },
];

const FUGITIVE_COLUMNS: ColumnDef[] = [
    { key: 'Reporting Year', label: 'Year', type: 'text' },
    { key: 'Equipment ID', label: 'Equipment ID', type: 'text' },
    { key: 'Month', label: 'Month', type: 'text' },
    { key: 'Equipment Type (AC/Chiller/Refrigerator)', label: 'Equipment Type', type: 'text' },
    { key: 'Location (Building/Department)', label: 'Location', type: 'text' },
    { key: 'Refrigerant Type (R22/R134a/R410A/etc.)', label: 'Refrigerant Type', type: 'text' },
    { key: 'Total Refrigerant Charge Capacity (kg)', label: 'Charge Capacity', type: 'numeric', showInCard: true, unit: 'kg' },
    { key: 'Refrigerant Refilled During Year (kg)', label: 'Refilled', type: 'numeric', showInCard: true, unit: 'kg' },
    { key: 'Estimated Leakage (kg)', label: 'Leakage', type: 'numeric', showInCard: true, unit: 'kg' },
    { key: 'GWP of Refrigerant', label: 'GWP', type: 'numeric', showInCard: true },
    { key: 'Calculated Emissions (kg CO2e)', label: 'Emissions (kg)', type: 'numeric', showInCard: true, unit: 'kg CO₂e' },
    { key: 'Calculated Emissions (tCO2e)', label: 'Emissions (t)', type: 'numeric', showInCard: true, unit: 'tCO₂e' },
    { key: 'Leakage Estimation Method (Refill-Based/Full Loss/Default %)', label: 'Estimation Method', type: 'text' },
    { key: 'Maintenance Vendor', label: 'Vendor', type: 'text' },
    { key: 'Data Source (Service Record/Invoice/Estimate)', label: 'Data Source', type: 'text' },
    { key: 'Remarks', label: 'Remarks', type: 'text' },
];

/* ─────────────────────────────────────────────────────────
   Sub-tab configurations for Scope 1
   ───────────────────────────────────────────────────────── */

export const SCOPE1_TABS: SubTabConfig[] = [
    {
        key: 'dg-data',
        label: 'DG Data',
        sheetName: 'Scope1_DG_Set_Data',
        icon: Fuel,
        color: 'text-orange-600',
        bgColor: 'bg-orange-100',
        columns: DG_SET_COLUMNS,
    },
    {
        key: 'lpg-consumption',
        label: 'LPG Consumption',
        sheetName: 'Scope1_LPG_Consumption',
        icon: FlameKindling,
        color: 'text-red-600',
        bgColor: 'bg-red-100',
        columns: LPG_COLUMNS,
    },
    {
        key: 'campus-vehicles',
        label: 'Campus Owned Vehicles',
        sheetName: 'Scope1_Campus_Owned_Vehicles',
        icon: Bus,
        color: 'text-blue-600',
        bgColor: 'bg-blue-100',
        columns: VEHICLE_COLUMNS,
    },
    {
        key: 'fugitive-emissions',
        label: 'Fugitive Emissions',
        sheetName: 'Scope1_Fugitive_Emissions',
        icon: Wind,
        color: 'text-teal-600',
        bgColor: 'bg-teal-100',
        columns: FUGITIVE_COLUMNS,
    },
];
