import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Stethoscope, 
  Target, 
  Network, 
  Bot, 
  Download, 
  Settings, 
  ChevronLeft, 
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  FolderGit2
} from 'lucide-react';
import { useRepo } from '../../context/RepoContext';

export const AppSidebar: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { currentRepo } = useRepo();
  const location = useLocation();

  const navItems = [
    { to: '/overview', label: 'Project Overview', icon: LayoutDashboard },
    { to: '/setup', label: 'Setup Doctor', icon: Stethoscope },
    { to: '/issues', label: 'Recommended Issues', icon: Target },
    { to: '/graph', label: 'Codebase Graph', icon: Network },
    { to: '/assistant', label: 'Repository Assistant', icon: Bot },
    { to: '/export', label: 'Export Guide', icon: Download },
    { to: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside
      className={`bg-white dark:bg-neutral-900 border-r border-neutral-200 dark:border-neutral-800 transition-all duration-200 flex flex-col shrink-0 select-none ${
        collapsed ? 'w-16' : 'w-60'
      }`}
    >
      {/* Top Sidebar title / toggle */}
      <div className="h-12 border-b border-neutral-100 dark:border-neutral-800/80 px-3 flex items-center justify-between">
        {!collapsed && (
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-neutral-400">
            <FolderGit2 className="w-3.5 h-3.5" />
            <span>Navigation</span>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={`p-1.5 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 cursor-pointer ${
            collapsed ? 'mx-auto' : ''
          }`}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Nav List */}
      <nav className="flex-1 py-3 px-2 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.to || (item.to === '/overview' && location.pathname === '/');
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={`flex items-center gap-3 px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                isActive
                  ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 shadow-2xs font-semibold'
                  : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-neutral-100'
              } ${collapsed ? 'justify-center px-0' : ''}`}
              title={collapsed ? item.label : undefined}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* Analysis Stages Footer */}
      {!collapsed && currentRepo && (
        <div className="p-3 m-2 bg-neutral-50 dark:bg-neutral-850 rounded-lg border border-neutral-200/80 dark:border-neutral-800 text-xs">
          <div className="flex items-center justify-between text-neutral-700 dark:text-neutral-300 font-semibold mb-1">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Static Analysis</span>
            </span>
            <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400">100%</span>
          </div>
          <p className="text-[11px] text-neutral-500 leading-tight">
            5/5 verification stages completed for commit {currentRepo.commitSha.substring(0, 7)}.
          </p>
        </div>
      )}
    </aside>
  );
};
