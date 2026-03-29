export const GOOGLE_SHEET_ID = '1q0uo0aXUKtGS-Xk31YAMNV-Scld3hANw4reod7U-nMA';

export const GOOGLE_SHEET_CSV_URL = `https://docs.google.com/spreadsheets/d/${GOOGLE_SHEET_ID}/gviz/tq?tqx=out:csv`;

/** Build a CSV export URL for a specific sheet by name */
export function getSheetCsvUrl(sheetName: string, sheetId?: string): string {
    const id = sheetId ?? GOOGLE_SHEET_ID;
    return `https://docs.google.com/spreadsheets/d/${id}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(sheetName)}`;
}

export const SCOPE_LABELS: Record<string, string> = {
    SCOPE_1: 'Scope 1 — Direct Emissions',
    SCOPE_2: 'Scope 2 — Energy Indirect',
    SCOPE_3: 'Scope 3 — Other Indirect',
};

export const SCOPE_DESCRIPTIONS: Record<string, string> = {
    SCOPE_1: 'Emissions from owned or controlled sources (e.g., company vehicles, generators).',
    SCOPE_2: 'Emissions from purchased electricity, steam, heating & cooling.',
    SCOPE_3: 'All other indirect emissions in the value chain (e.g., travel, transport, waste).',
};
