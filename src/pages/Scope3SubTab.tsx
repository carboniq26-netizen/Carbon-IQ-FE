import { useParams, Navigate } from 'react-router-dom';
import { SCOPE3_TABS } from '@/const/scope3Columns';
import { SubTabDashboard } from '@/components/scope/SubTabDashboard';

export default function Scope3SubTab() {
    const { subTab } = useParams<{ subTab: string }>();
    const tab = SCOPE3_TABS.find((t) => t.key === subTab);

    // If no matching sub-tab, redirect to first one
    if (!tab) {
        return <Navigate to={`/scope-3/${SCOPE3_TABS[0].key}`} replace />;
    }

    return (
        <div className="p-5">
            <SubTabDashboard key={tab.key} tab={tab} />
        </div>
    );
}
