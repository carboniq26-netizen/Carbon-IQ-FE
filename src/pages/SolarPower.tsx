import { SubTabDashboard } from '../components/scope/SubTabDashboard';
import { SOLAR_POWER_TAB } from '../const/solarPowerColumns';

export default function SolarPower() {
    return (
        <div className="space-y-6">
            <SubTabDashboard tab={SOLAR_POWER_TAB} />
        </div>
    );
}
