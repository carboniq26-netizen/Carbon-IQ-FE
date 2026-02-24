import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import carbonIQLogo from '../../assets/carbon-iq-logo.png';
import {
    LayoutDashboard,
    Flame,
    Zap,
    Globe,
    ChevronLeft,
    ChevronRight,
    ChevronDown,
} from 'lucide-react';
import { SCOPE1_TABS } from '@/const/scope1Columns';
import { SCOPE2_TABS } from '@/const/scope2Columns';

/* ── Nav structure ──────────────────────────────────────── */

interface NavChild {
    to: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
}

interface NavItem {
    to: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    children?: NavChild[];
}

const navItems: NavItem[] = [
    { to: '/', label: 'Overview', icon: LayoutDashboard },
    {
        to: '/scope-1',
        label: 'Scope 1',
        icon: Flame,
        children: SCOPE1_TABS.map((tab) => ({
            to: `/scope-1/${tab.key}`,
            label: tab.label,
            icon: tab.icon,
        })),
    },
    {
        to: '/scope-2',
        label: 'Scope 2',
        icon: Zap,
        children: SCOPE2_TABS.map((tab) => ({
            to: `/scope-2/${tab.key}`,
            label: tab.label,
            icon: tab.icon,
        })),
    },
    { to: '/scope-3', label: 'Scope 3', icon: Globe },
];

export default function Sidebar() {
    const [collapsed, setCollapsed] = useState(false);
    const location = useLocation();

    // Track which parent sections are expanded
    const [expanded, setExpanded] = useState<Record<string, boolean>>(() => {
        return {
            '/scope-1': location.pathname.startsWith('/scope-1'),
            '/scope-2': location.pathname.startsWith('/scope-2'),
        };
    });

    const toggleExpand = (key: string) => {
        setExpanded((prev) => ({ ...prev, [key]: !prev[key] }));
    };

    return (
        <aside
            className={`
                relative flex flex-col h-screen
                bg-card border-r border-border shadow-sm
                transition-all duration-300 ease-in-out
                ${collapsed ? 'w-[72px]' : 'w-[280px]'}
            `}
        >
            {/* Brand */}
            <div className="flex items-center gap-3 px-5 h-16 border-b border-border">
                <div className="flex items-center justify-center ">
                    <img src={carbonIQLogo} alt="Carbon IQ" className="w-14 h-14" />
                </div>
                {!collapsed && (
                    <div className="overflow-hidden whitespace-nowrap">
                        <h1 className="text-lg text-red-900 font-bold tracking-tight ">
                            Carbon IQ
                        </h1>
                        <p className="text-[10px] font-medium text-text-muted">
                            Solution for Expected
                        </p>
                    </div>
                )}
            </div>

            {/* Navigation */}
            <nav className="flex-1 flex flex-col gap-0.5 px-3 py-4 overflow-y-auto">
                {navItems.map((item) => {
                    const hasChildren = item.children && item.children.length > 0;
                    const isExpanded = expanded[item.to] ?? false;
                    const isParentActive = location.pathname.startsWith(item.to) && item.to !== '/';
                    const Icon = item.icon;

                    return (
                        <div key={item.to}>
                            {/* Parent item */}
                            {hasChildren ? (
                                <button
                                    onClick={() => toggleExpand(item.to)}
                                    className={`
                                        group flex items-center gap-3 w-full px-3 py-2.5 rounded-lg
                                        transition-all duration-200 ease-out cursor-pointer
                                        ${isParentActive
                                            ? 'bg-primary-soft text-primary font-semibold'
                                            : 'text-text-secondary hover:text-text-main hover:bg-bg-section'
                                        }
                                        ${collapsed ? 'justify-center' : ''}
                                    `}
                                >
                                    <Icon className="w-[18px] h-[18px] shrink-0 transition-colors duration-200" />
                                    {!collapsed && (
                                        <>
                                            <span className="text-sm font-medium truncate flex-1 text-left">
                                                {item.label}
                                            </span>
                                            <ChevronDown
                                                className={`w-4 h-4 shrink-0 transition-transform duration-200 ${isExpanded ? 'rotate-0' : '-rotate-90'
                                                    }`}
                                            />
                                        </>
                                    )}
                                </button>
                            ) : (
                                <NavLink
                                    to={item.to}
                                    end={item.to === '/'}
                                    className={({ isActive }) =>
                                        `
                                        group flex items-center gap-3 px-3 py-2.5 rounded-lg
                                        transition-all duration-200 ease-out
                                        ${isActive
                                            ? 'bg-primary-soft text-primary font-semibold'
                                            : 'text-text-secondary hover:text-text-main hover:bg-bg-section'
                                        }
                                        ${collapsed ? 'justify-center' : ''}
                                        `
                                    }
                                >
                                    <Icon className="w-[18px] h-[18px] shrink-0 transition-colors duration-200" />
                                    {!collapsed && (
                                        <span className="text-sm font-medium truncate">
                                            {item.label}
                                        </span>
                                    )}
                                </NavLink>
                            )}

                            {/* Children */}
                            {hasChildren && isExpanded && !collapsed && (
                                <div className="ml-4 mt-0.5 pl-3 border-l-2 border-border flex flex-col gap-0.5">
                                    {item.children!.map((child) => {
                                        const ChildIcon = child.icon;
                                        return (
                                            <NavLink
                                                key={child.to}
                                                to={child.to}
                                                className={({ isActive }) =>
                                                    `
                                                    group flex items-center gap-2.5 px-3 py-2 rounded-lg
                                                    transition-all duration-200 ease-out text-[13px]
                                                    ${isActive
                                                        ? 'bg-primary-soft text-primary font-semibold'
                                                        : 'text-text-muted hover:text-text-main hover:bg-bg-section'
                                                    }
                                                    `
                                                }
                                            >
                                                <ChildIcon className="w-4 h-4 shrink-0" />
                                                <span className="font-medium truncate">
                                                    {child.label}
                                                </span>
                                            </NavLink>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    );
                })}
            </nav>

            {/* Collapse Toggle */}
            <div className="px-3 py-3 border-t border-border">
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className={`
                        flex items-center gap-3 w-full px-3 py-2.5 rounded-lg
                        text-text-muted hover:text-text-main hover:bg-bg-section
                        transition-all duration-200 cursor-pointer
                        ${collapsed ? 'justify-center' : ''}
                    `}
                >
                    {collapsed ? (
                        <ChevronRight className="w-[18px] h-[18px] shrink-0" />
                    ) : (
                        <>
                            <ChevronLeft className="w-[18px] h-[18px] shrink-0" />
                            <span className="text-sm font-medium">Collapse</span>
                        </>
                    )}
                </button>
            </div>
        </aside>
    );
}
