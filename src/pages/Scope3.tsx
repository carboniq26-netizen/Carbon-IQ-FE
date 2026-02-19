import { Globe } from 'lucide-react';
import { useEmissionData } from '../hooks/useEmissionData';
import { Scope } from '../types/types';
import { SCOPE_LABELS, SCOPE_DESCRIPTIONS } from '../const/constants';
import EmissionTable from '../components/EmissionTable';

export default function Scope3() {
    const { getScopeData, loading, error } = useEmissionData();
    const records = getScopeData(Scope.SCOPE_3);

    return (
        <div className="space-y-6 p-5">
            <div>
                <div className="flex items-center gap-3">
                    <Globe className="w-7 h-7 text-info" />
                    <h1 className="text-2xl font-bold text-text-main">{SCOPE_LABELS.SCOPE_3}</h1>
                </div>
                <p className="text-text-secondary text-sm leading-relaxed mt-1">
                    {SCOPE_DESCRIPTIONS.SCOPE_3}
                </p>
            </div>

            <EmissionTable records={records} loading={loading} error={error} />
        </div>
    );
}
