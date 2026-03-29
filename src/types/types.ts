import { type LucideIcon } from 'lucide-react';

export const Scope = {
    SCOPE_1: 'SCOPE_1',
    SCOPE_2: 'SCOPE_2',
    SCOPE_3: 'SCOPE_3',
    BIOGENICS: 'BIOGENICS',
} as const;

export type Scope = (typeof Scope)[keyof typeof Scope];

export interface EmissionRecord {
    date: string;
    location: string;
    department: string;
    sourceType: string;
    activityType: string;
    quantity: number;
    unit: string;
    emissionFactor: number;
    emission: number;
    scope: Scope;
}

/* ── Multi-sheet sub-tab types ────────────────────────── */

export interface ColumnDef {
    /** Exact header string in the Google Sheet */
    key: string;
    /** Short display label for cards / table headers */
    label: string;
    /** 'text' or 'numeric' */
    type: 'text' | 'numeric';
    /** Show a summary card for this column */
    showInCard?: boolean;
    /** Show this column in the data table (default true) */
    showInTable?: boolean;
    /** Optional suffix shown on cards, e.g. "kg CO₂e" */
    unit?: string;
}

/** Defines a column whose value is computed client-side from other columns */
export interface ComputeField {
    /** The column key to write the computed value into */
    targetKey: string;
    /** Pure function that receives a row and returns the computed numeric value */
    formula: (row: Record<string, string>) => number;
}

export interface SubTabConfig {
    key: string;
    label: string;
    sheetName: string;
    icon: LucideIcon;
    color: string;
    bgColor: string;
    columns: ColumnDef[];
    /** Optional computed columns derived client-side from raw data */
    computeFields?: ComputeField[];
    /** Optional extra column keys to use as filter dropdowns (beyond Year/Month) */
    filterColumns?: string[];
}

/** A single row from any sheet — values keyed by column header */
export type SheetRow = Record<string, string>;

