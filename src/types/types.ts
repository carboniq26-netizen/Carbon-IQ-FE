export enum Scope {
    SCOPE_1 = 'SCOPE_1',
    SCOPE_2 = 'SCOPE_2',
    SCOPE_3 = 'SCOPE_3',
}

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
