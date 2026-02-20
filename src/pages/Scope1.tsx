import { useState } from 'react';
import { Flame } from 'lucide-react';
import { SCOPE1_TABS } from '@/const/scope1Columns';
import { SubTabDashboard } from '@/components/scope/SubTabDashboard';

export default function Scope1() {
    const [activeTab, setActiveTab] = useState(SCOPE1_TABS[0].key);
    const activeConfig = SCOPE1_TABS.find((t) => t.key === activeTab)!;

    return (
        <div className="space-y-6 p-5">
            {/* Page title */}
            <div>
                <div className="flex items-center gap-3">
                    <Flame className="w-7 h-7 text-danger" />
                    <h1 className="text-2xl font-bold text-text-main">
                        Scope 1 — Direct Emissions
                    </h1>
                </div>
                <p className="text-text-secondary text-sm leading-relaxed mt-1">
                    Emissions from owned or controlled sources (e.g., generators, vehicles, refrigerants).
                </p>
            </div>

            {/* Sub-tab bar */}
            <div className="border-b border-border">
                <nav className="flex gap-1 -mb-px overflow-x-auto" aria-label="Scope 1 sub-tabs">
                    {SCOPE1_TABS.map((tab) => {
                        const isActive = tab.key === activeTab;
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.key}
                                onClick={() => setActiveTab(tab.key)}
                                className={`
                                    group flex items-center gap-2 px-4 py-2.5
                                    text-sm font-medium whitespace-nowrap
                                    border-b-2 transition-all duration-200 cursor-pointer
                                    ${isActive
                                        ? `border-primary ${tab.color} font-semibold`
                                        : 'border-transparent text-text-muted hover:text-text-main hover:border-border'
                                    }
                                `}
                            >
                                <Icon className={`w-4 h-4 ${isActive ? tab.color : 'text-text-muted group-hover:text-text-secondary'}`} />
                                {tab.label}
                            </button>
                        );
                    })}
                </nav>
            </div>

            {/* Active sub-tab content */}
            <SubTabDashboard key={activeConfig.key} tab={activeConfig} />
        </div>
    );
}
