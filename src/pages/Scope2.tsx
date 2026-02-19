import { Zap } from 'lucide-react';
import { useEmissionData } from '../hooks/useEmissionData';
import { Scope } from '../types/types';
import { SCOPE_LABELS, SCOPE_DESCRIPTIONS } from '../const/constants';
import EmissionTable from '../components/EmissionTable';

export default function Scope2() {
    const { getScopeData, loading, error } = useEmissionData();
    const records = getScopeData(Scope.SCOPE_2);

    return (
        <div className="space-y-6 p-5">
            <div>
                <div className="flex items-center gap-3">
                    <Zap className="w-7 h-7 text-warning" />
                    <h1 className="text-2xl font-bold text-text-main">{SCOPE_LABELS.SCOPE_2}</h1>
                </div>
                <p className="text-text-secondary text-sm leading-relaxed mt-1">
                    {SCOPE_DESCRIPTIONS.SCOPE_2}
                </p>
            </div>

            <EmissionTable records={records} loading={loading} error={error} />
        </div>
    );
}
