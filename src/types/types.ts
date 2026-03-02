import { type LucideIcon } from 'lucide-react';

export const Scope = {
    SCOPE_1: 'SCOPE_1',
    SCOPE_2: 'SCOPE_2',
    SCOPE_3: 'SCOPE_3',
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

export interface SubTabConfig {
    key: string;
    label: string;
    sheetName: string;
    icon: LucideIcon;
    color: string;
    bgColor: string;
    columns: ColumnDef[];
}

/** A single row from any sheet — values keyed by column header */
export type SheetRow = Record<string, string>;
