import { SLUDGE_ENERGY_TAB } from '@/const/sludgeColumns';
import { SubTabDashboard } from '@/components/scope/SubTabDashboard';

export default function SludgeEnergy() {
    return (
        <div className="p-5">
            <SubTabDashboard tab={SLUDGE_ENERGY_TAB} />
        </div>
    );
}
