import { useParams, Navigate } from 'react-router-dom';
import { SCOPE1_TABS } from '@/const/scope1Columns';
import { SubTabDashboard } from '@/components/scope/SubTabDashboard';

export default function Scope1SubTab() {
    const { subTab } = useParams<{ subTab: string }>();
    const tab = SCOPE1_TABS.find((t) => t.key === subTab);

    // If no matching sub-tab, redirect to first one
    if (!tab) {
        return <Navigate to={`/scope-1/${SCOPE1_TABS[0].key}`} replace />;
    }

    return (
        <div className="p-5">
            <SubTabDashboard key={tab.key} tab={tab} />
        </div>
    );
}
