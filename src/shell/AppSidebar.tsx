import { useState, type ComponentType } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useData } from '../context/DataContext';
import {
  Share2, Wallet, Calendar,
  BarChart2, List, MapPin, Wrench, LayoutDashboard,
  PenLine, Brain, Flame, BookOpen, Dumbbell,
  PanelLeftClose, PanelLeftOpen, Keyboard
} from 'lucide-react';
import ShortcutsHelp from '../ui/ShortcutsHelp';

interface SidebarItem {
  route: string;
  label: string;
  icon: ComponentType<{ size?: number }>;
  countFn?: (data: ReturnType<typeof useData>['data']) => number;
}

const SIDEBAR_CONFIG: Record<string, { title: string; items: SidebarItem[] }> = {
  social: {
    title: 'Связи',
    items: [
      { route: '/social', label: 'Социальный граф', icon: Share2, countFn: d => d.people.length },
    ]
  },
  finance: {
    title: 'Капитал',
    items: [
      { route: '/finance', label: 'Транзакции', icon: Wallet, countFn: d => d.transactions.length },
      { route: '/finance/reminders', label: 'Напоминания', icon: Calendar, countFn: d => d.reminders.filter(r => !r.isPaid).length },
    ]
  },
  cycling: {
    title: 'Велоспорт',
    items: [
      { route: '/cycling', label: 'Аналитика', icon: BarChart2 },
      { route: '/cycling/rides', label: 'Лог поездок', icon: List, countFn: d => d.rides.length },
      { route: '/cycling/routes', label: 'Планировщик трасс', icon: MapPin, countFn: d => d.routes.length },
      { route: '/cycling/maintenance', label: 'Обслуживание', icon: Wrench, countFn: d => d.maintenance.filter(m => !m.isDone).length },
    ]
  },
  reflect: {
    title: 'Рефлексия',
    items: [
      { route: '/reflect', label: 'Обзор', icon: LayoutDashboard },
      { route: '/reflect/journal', label: 'Дневник настроения', icon: PenLine, countFn: d => d.journal.length },
      { route: '/reflect/knowledge', label: 'База знаний', icon: Brain, countFn: d => d.knowledge.length },
      { route: '/reflect/schedule', label: 'Gap-Планировщик', icon: Calendar, countFn: d => d.schedule.length },
      { route: '/reflect/habits', label: 'Трекер привычек', icon: Flame, countFn: d => d.habits.length },
      { route: '/reflect/thoughts', label: 'Музей мыслей', icon: BookOpen, countFn: d => d.thoughts.length },
      { route: '/reflect/workouts', label: 'Спортивный лог', icon: Dumbbell, countFn: d => d.workouts.length },
    ]
  }
};

export default function AppSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { activeModule, isSidebarOpen, setSidebarOpen } = useApp();
  const { data } = useData();
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
      <aside className={`app-sidebar ${isSidebarOpen ? 'open' : ''} ${isCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-toggle-wrapper">
          <button
            className="sidebar-toggle-btn"
            onClick={() => setSidebarOpen(!isSidebarOpen)}
            title={isCollapsed ? 'Развернуть панель' : 'Свернуть панель'}
          >
            {isCollapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
          </button>
        </div>

        <div className="sidebar-section">
          {!isCollapsed && (
            <div className="sidebar-group-label">
              <span className="group-dot" />
              {moduleConfig.title}
            </div>
          )}

          <nav>
            {moduleConfig.items.map(item => {
              const count = item.countFn?.(data) ?? null;
              const isExact = item.route === '/reflect' || item.route === '/cycling' || item.route === '/finance';
              const isActive = isExact
                ? location.pathname === item.route
                : location.pathname.startsWith(item.route);

              const Icon = item.icon;

              return (
                <button
                  key={item.route}
                  className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
                  onClick={() => handleNav(item.route)}
                  title={item.label}
                >
                  <Icon size={15} />
                  {!isCollapsed && (
                    <span>{item.label}</span>
                  )}
                  {!isCollapsed && count !== null && count > 0 && (
                    <span className="sidebar-nav-count">
                      {count > 99 ? '99+' : count}
                    </span>
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
            title="Горячие клавиши"
          >
            <Keyboard size={15} />
            {!isCollapsed && <span>Горячие клавиши</span>}
          </button>
        </div>
      </aside>

      {showShortcuts && <ShortcutsHelp isOpen={showShortcuts} onClose={() => setShowShortcuts(false)} />}
    </>
  );
}
