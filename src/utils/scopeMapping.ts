import { Scope } from '../types/types';

const SOURCE_TO_SCOPE: Record<string, Scope> = {
    Diesel: Scope.SCOPE_1,
    Petrol: Scope.SCOPE_1,
    Electricity: Scope.SCOPE_2,
    Travel: Scope.SCOPE_3,
    Transport: Scope.SCOPE_3,
    Waste: Scope.SCOPE_3,
};

export function getScope(sourceType: string): Scope {
    return SOURCE_TO_SCOPE[sourceType] ?? Scope.SCOPE_3;
}
