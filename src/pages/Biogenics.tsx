import { BIOGENICS_TAB } from '@/const/biogenicsColumns';
import { SubTabDashboard } from '@/components/scope/SubTabDashboard';

export default function Biogenics() {
    return (
        <div className="p-5">
            <SubTabDashboard tab={BIOGENICS_TAB} />
        </div>
    );
}
