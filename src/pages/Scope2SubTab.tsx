import { useParams, Navigate } from 'react-router-dom';
import { SCOPE2_TABS } from '@/const/scope2Columns';
import { SubTabDashboard } from '@/components/scope/SubTabDashboard';

export default function Scope2SubTab() {
    const { subTab } = useParams<{ subTab: string }>();
    const tab = SCOPE2_TABS.find((t) => t.key === subTab);

    // If no matching sub-tab, redirect to first one
    if (!tab) {
        return <Navigate to={`/scope-2/${SCOPE2_TABS[0].key}`} replace />;
    }

    return (
        <div className="p-5">
            <SubTabDashboard key={tab.key} tab={tab} />
        </div>
    );
}
