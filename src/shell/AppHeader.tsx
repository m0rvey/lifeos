import { useState, useEffect, useRef, type ComponentType } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, Share2, Wallet, Bike, BrainCircuit, BarChart3, Settings, Menu } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useData } from '../context/DataContext';
import type { ModuleKey } from '../types';
import { isDecaying } from '../cognitive/social';
import '../styles/header-dropdown.css';

interface AppHeaderProps {
  onOpenSettings: () => void;
}

interface ModuleTab {
  key: ModuleKey;
  label: string;
  icon: ComponentType<{ size?: number }>;
  route: string;
}

const TABS: ModuleTab[] = [
  { key: 'hub', label: 'Хаб', icon: Home, route: '/hub' },
  { key: 'social', label: 'Социальный круг', icon: Share2, route: '/social' },
  { key: 'finance', label: 'Капитал', icon: Wallet, route: '/finance' },
  { key: 'cycling', label: 'Велоспорт', icon: Bike, route: '/cycling' },
  { key: 'reflect', label: 'Рефлексия', icon: BrainCircuit, route: '/reflect' },
  { key: 'analytics', label: 'Аналитика', icon: BarChart3, route: '/analytics' },
];

export default function AppHeader({ onOpenSettings }: AppHeaderProps) {
  const navigate = useNavigate();
  const { activeModule, isSidebarOpen, setSidebarOpen } = useApp();
  const { data } = useData();

  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showProfileDropdown) return;
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowProfileDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [showProfileDropdown]);

  const handleTabClick = (route: string) => {
    navigate(route);
  };

  const overdueContactsCount = data.people.filter(isDecaying).length;
  const showSidebarToggle = activeModule !== 'hub' && activeModule !== 'analytics' && activeModule !== 'settings';

  return (
    <header className="app-header">
      {showSidebarToggle && (
        <button
          className="mobile-menu-btn"
          onClick={() => setSidebarOpen(!isSidebarOpen)}
          aria-label={isSidebarOpen ? 'Закрыть меню' : 'Открыть меню'}
          title={isSidebarOpen ? 'Закрыть меню' : 'Открыть меню'}
        >
          <Menu size={20} />
        </button>
      )}

      {/* Platform Logo */}
      <div className="app-logo" onClick={() => navigate('/hub')} style={{ cursor: 'pointer' }}>
        <div className="app-logo-mark">
          LO
          <span className="app-logo-pulse" />
        </div>
        <span>LifeOS</span>
      </div>
      <div className="app-logo-sep" />

      {/* Main module tabs */}
      <nav className="app-module-tabs" role="tablist">
        {TABS.map((tab, idx) => {
          const isActive = activeModule === tab.key;
          const Icon = tab.icon;
          
          let badgeCount = 0;
          if (tab.key === 'social') badgeCount = overdueContactsCount;

          return (
            <button
              key={tab.key}
              className={`app-module-tab ${isActive ? 'active' : ''}`}
              onClick={() => handleTabClick(tab.route)}
              role="tab"
              aria-selected={isActive}
              title={`Раздел ${tab.label} (Alt + ${idx + 1})`}
            >
              <Icon size={14} />
              <span>{tab.label}</span>
              {badgeCount > 0 && (
                <span className="tab-badge" style={{
                  marginLeft: '6px',
                  background: tab.key === 'social' ? 'var(--error)' : 'var(--accent)',
                  color: 'white',
                  fontSize: '10px',
                  fontWeight: 'bold',
                  padding: '2px 6px',
                  borderRadius: '10px',
                  lineHeight: 1
                }}>
                  {badgeCount > 99 ? '99+' : badgeCount}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Right Actions */}
      <div className="app-header-actions" style={{ position: 'relative' }}>
        <button
          className="icon-btn"
          onClick={onOpenSettings}
          title="Настройки платформы (Ctrl + S для быстрого бэкапа)"
          aria-label="Настройки платформы"
        >
          <Settings size={16} />
        </button>
        <button
          className="header-avatar"
          onClick={() => setShowProfileDropdown(!showProfileDropdown)}
          title="Личный кабинет"
          aria-label="Личный кабинет"
        >
          MV
        </button>

        {showProfileDropdown && (
          <div className="profile-dropdown" ref={dropdownRef}>
            <div className="profile-dropdown-header">
              <div className="profile-dropdown-avatar">LO</div>
              <div className="profile-dropdown-info">
                <div className="profile-dropdown-name">LifeOS</div>
                <div className="profile-dropdown-email">open-source</div>
              </div>
            </div>
            <div className="profile-dropdown-divider" />
            <div className="profile-dropdown-stats">
              <div className="profile-dropdown-stat-row">
                <span>Ментальная усталость:</span>
                <strong style={{ color: data.fatigue > 75 ? 'var(--error)' : data.fatigue > 45 ? 'var(--warning)' : 'var(--success)' }}>
                  {Math.round(data.fatigue)}%
                </strong>
              </div>
              <div className="profile-dropdown-stat-row">
                <span>Активные задачи:</span>
                <strong>{data.tasks.filter(t => !t.isCompleted).length}</strong>
              </div>
              <div className="profile-dropdown-stat-row">
                <span>Всего контактов в круге:</span>
                <strong>{data.people.length}</strong>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
