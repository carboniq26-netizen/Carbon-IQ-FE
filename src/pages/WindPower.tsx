import { SubTabDashboard } from '../components/scope/SubTabDashboard';
import { WIND_POWER_TAB } from '../const/windPowerColumns';

export default function WindPower() {
    return (
        <div className="space-y-6">
            <SubTabDashboard tab={WIND_POWER_TAB} />
        </div>
    );
}
