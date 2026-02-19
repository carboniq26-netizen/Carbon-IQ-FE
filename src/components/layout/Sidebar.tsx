import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import carbonIQLogo from '../../assets/carbon-iq-logo.png';
import {
    LayoutDashboard,
    Flame,
    Zap,
    Globe,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react';

const navItems = [
    { to: '/', label: 'Overview', icon: LayoutDashboard },
    { to: '/scope-1', label: 'Scope 1', icon: Flame },
    { to: '/scope-2', label: 'Scope 2', icon: Zap },
    { to: '/scope-3', label: 'Scope 3', icon: Globe },
];

export default function Sidebar() {
    const [collapsed, setCollapsed] = useState(false);

    return (
        <aside
            className={`
        relative flex flex-col h-screen
        bg-card border-r border-border shadow-sm
        transition-all duration-300 ease-in-out
        ${collapsed ? 'w-[72px]' : 'w-[260px]'}
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
                        <p className="text-[10px] font-medium text-text-muted uppercase tracking-widest">
                            PSG's Pride
                        </p>
                    </div>
                )}
            </div>

            {/* Navigation */}
            <nav className="flex-1 flex flex-col gap-1 px-3 py-4 overflow-y-auto">
                {navItems.map(({ to, label, icon: Icon }) => (
                    <NavLink
                        key={to}
                        to={to}
                        end={to === '/'}
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
                            <span className="text-sm font-medium truncate">{label}</span>
                        )}
                    </NavLink>
                ))}
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
