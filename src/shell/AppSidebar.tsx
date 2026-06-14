import { useState, type ComponentType } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useData } from '../context/DataContext';
import { useI18n } from '../i18n';
import {
  Share2,
  Wallet,
  Calendar,
  BarChart2,
  List,
  MapPin,
  Wrench,
  LayoutDashboard,
  PenLine,
  Brain,
  Flame,
  BookOpen,
  Dumbbell,
  PanelLeftClose,
  PanelLeftOpen,
  Keyboard,
} from 'lucide-react';
import ShortcutsHelp from '../ui/ShortcutsHelp';

interface SidebarItem {
  route: string;
  i18nKey: string;
  icon: ComponentType<{ size?: number }>;
  countFn?: (data: ReturnType<typeof useData>['data']) => number;
}

const SIDEBAR_CONFIG: Record<string, { titleKey: string; items: SidebarItem[] }> = {
  social: {
    titleKey: 'sidebar.sidebar_group.social',
    items: [
      {
        route: '/social',
        i18nKey: 'sidebar.social_graph',
        icon: Share2,
        countFn: (d) => d.people.length,
      },
    ],
  },
  finance: {
    titleKey: 'sidebar.sidebar_group.finance',
    items: [
      {
        route: '/finance',
        i18nKey: 'sidebar.transactions',
        icon: Wallet,
        countFn: (d) => d.transactions.length,
      },
      {
        route: '/finance/reminders',
        i18nKey: 'sidebar.reminders',
        icon: Calendar,
        countFn: (d) => d.reminders.filter((r) => !r.isPaid).length,
      },
    ],
  },
  cycling: {
    titleKey: 'sidebar.sidebar_group.cycling',
    items: [
      { route: '/cycling', i18nKey: 'sidebar.analytics', icon: BarChart2 },
      {
        route: '/cycling/rides',
        i18nKey: 'sidebar.rides',
        icon: List,
        countFn: (d) => d.rides.length,
      },
      {
        route: '/cycling/routes',
        i18nKey: 'sidebar.routes',
        icon: MapPin,
        countFn: (d) => d.routes.length,
      },
      {
        route: '/cycling/maintenance',
        i18nKey: 'sidebar.maintenance',
        icon: Wrench,
        countFn: (d) => d.maintenance.filter((m) => !m.isDone).length,
      },
    ],
  },
  reflect: {
    titleKey: 'sidebar.sidebar_group.reflect',
    items: [
      { route: '/reflect', i18nKey: 'sidebar.overview', icon: LayoutDashboard },
      {
        route: '/reflect/journal',
        i18nKey: 'sidebar.journal',
        icon: PenLine,
        countFn: (d) => d.journal.length,
      },
      {
        route: '/reflect/knowledge',
        i18nKey: 'sidebar.knowledge',
        icon: Brain,
        countFn: (d) => d.knowledge.length,
      },
      {
        route: '/reflect/schedule',
        i18nKey: 'sidebar.schedule',
        icon: Calendar,
        countFn: (d) => d.schedule.length,
      },
      {
        route: '/reflect/habits',
        i18nKey: 'sidebar.habits',
        icon: Flame,
        countFn: (d) => d.habits.length,
      },
      {
        route: '/reflect/thoughts',
        i18nKey: 'sidebar.thoughts',
        icon: BookOpen,
        countFn: (d) => d.thoughts.length,
      },
      {
        route: '/reflect/workouts',
        i18nKey: 'sidebar.workouts',
        icon: Dumbbell,
        countFn: (d) => d.workouts.length,
      },
    ],
  },
};

export default function AppSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { activeModule, isSidebarOpen, setSidebarOpen } = useApp();
  const { data } = useData();
  const { t } = useI18n();
  const [showShortcuts, setShowShortcuts] = useState(false);
  const isCollapsed = !isSidebarOpen;

  if (activeModule === 'hub' || activeModule === 'analytics' || activeModule === 'settings') {
    return null;
  }

  const moduleConfig = SIDEBAR_CONFIG[activeModule];
  if (!moduleConfig) return null;

  const handleNav = (route: string) => {
    navigate(route);
  };

  return (
    <>
      <aside
        className={`app-sidebar ${isSidebarOpen ? 'open' : ''} ${isCollapsed ? 'collapsed' : ''}`}
      >
        <div className="sidebar-toggle-wrapper">
          <button
            className="sidebar-toggle-btn"
            onClick={() => setSidebarOpen(!isSidebarOpen)}
            title={isCollapsed ? t('sidebar.expand') : t('sidebar.collapse')}
          >
            {isCollapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
          </button>
        </div>

        <div className="sidebar-section">
          {!isCollapsed && (
            <div className="sidebar-group-label">
              <span className="group-dot" />
              {t(moduleConfig.titleKey)}
            </div>
          )}

          <nav>
            {moduleConfig.items.map((item) => {
              const count = item.countFn?.(data) ?? null;
              const isExact =
                item.route === '/reflect' || item.route === '/cycling' || item.route === '/finance';
              const isActive = isExact
                ? location.pathname === item.route
                : location.pathname.startsWith(item.route);

              const Icon = item.icon;

              return (
                <button
                  key={item.route}
                  className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
                  onClick={() => handleNav(item.route)}
                  title={t(item.i18nKey)}
                >
                  <Icon size={15} />
                  {!isCollapsed && <span>{t(item.i18nKey)}</span>}
                  {!isCollapsed && count !== null && count > 0 && (
                    <span className="sidebar-nav-count">{count > 99 ? '99+' : count}</span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="sidebar-footer">
          <button
            className="sidebar-nav-item"
            onClick={() => setShowShortcuts(true)}
            title={t('sidebar.shortcuts')}
          >
            <Keyboard size={15} />
            {!isCollapsed && <span>{t('sidebar.shortcuts')}</span>}
          </button>
        </div>
      </aside>

      {showShortcuts && (
        <ShortcutsHelp isOpen={showShortcuts} onClose={() => setShowShortcuts(false)} />
      )}
    </>
  );
}
