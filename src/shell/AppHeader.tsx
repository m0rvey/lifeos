import { useState, useEffect, useRef, useMemo, type ComponentType } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Home,
  Share2,
  Wallet,
  Bike,
  BrainCircuit,
  BarChart3,
  Settings,
  Menu,
  Search,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useData } from '../context/DataContext';
import { useI18n } from '../i18n';
import type { ModuleKey } from '../types';
import { isDecaying } from '../cognitive/social';

interface AppHeaderProps {
  onOpenSettings: () => void;
  onOpenSearch?: () => void;
}

const TABS: {
  key: ModuleKey;
  i18nKey: string;
  icon: ComponentType<{ size?: number }>;
  route: string;
}[] = [
  { key: 'hub', i18nKey: 'nav.hub', icon: Home, route: '/hub' },
  { key: 'social', i18nKey: 'nav.social', icon: Share2, route: '/social' },
  { key: 'finance', i18nKey: 'nav.finance', icon: Wallet, route: '/finance' },
  { key: 'cycling', i18nKey: 'nav.cycling', icon: Bike, route: '/cycling' },
  { key: 'reflect', i18nKey: 'nav.reflect', icon: BrainCircuit, route: '/reflect' },
  { key: 'analytics', i18nKey: 'nav.analytics', icon: BarChart3, route: '/analytics' },
];

export default function AppHeader({ onOpenSettings, onOpenSearch }: AppHeaderProps) {
  const navigate = useNavigate();
  const { activeModule, userName, isSidebarOpen, setSidebarOpen } = useApp();
  const { data } = useData();
  const { t } = useI18n();

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

  const overdueContactsCount = useMemo(() => data.people.filter(isDecaying).length, [data.people]);
  const showSidebarToggle =
    activeModule !== 'hub' && activeModule !== 'analytics' && activeModule !== 'settings';

  return (
    <header className="app-header">
      {showSidebarToggle && (
        <button
          className="mobile-menu-btn"
          onClick={() => setSidebarOpen(!isSidebarOpen)}
          aria-label={isSidebarOpen ? t('header.menu_close') : t('header.menu_open')}
          title={isSidebarOpen ? t('header.menu_close') : t('header.menu_open')}
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
          const label = t(tab.i18nKey);

          let badgeCount = 0;
          if (tab.key === 'social') badgeCount = overdueContactsCount;

          return (
            <button
              key={tab.key}
              className={`app-module-tab ${isActive ? 'active' : ''}`}
              onClick={() => handleTabClick(tab.route)}
              role="tab"
              aria-selected={isActive}
              title={`${t('nav.settings')} ${label} (Alt + ${idx + 1})`}
            >
              <Icon size={14} />
              <span>{label}</span>
              {badgeCount > 0 && (
                <span
                  className="tab-badge"
                  style={{
                    marginLeft: '6px',
                    background: tab.key === 'social' ? 'var(--error)' : 'var(--accent)',
                    color: 'white',
                    fontSize: '10px',
                    fontWeight: 'bold',
                    padding: '2px 6px',
                    borderRadius: '10px',
                    lineHeight: 1,
                  }}
                >
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
          onClick={onOpenSearch}
          title="Search (Cmd+K)"
          aria-label="Search"
        >
          <Search size={16} />
        </button>
        <button
          className="icon-btn"
          onClick={onOpenSettings}
          title={t('header.settings_tooltip')}
          aria-label={t('header.settings_tooltip')}
        >
          <Settings size={16} />
        </button>
        <button
          className="header-avatar"
          onClick={() => setShowProfileDropdown(!showProfileDropdown)}
          title={t('header.profile')}
          aria-label={t('header.profile')}
        >
          {userName.slice(0, 2).toUpperCase()}
        </button>

        {showProfileDropdown && (
          <div className="profile-dropdown" ref={dropdownRef}>
            <div className="profile-dropdown-header">
              <div className="profile-dropdown-avatar">{userName.slice(0, 2).toUpperCase()}</div>
              <div className="profile-dropdown-info">
                <div className="profile-dropdown-name">{userName}</div>
                <div className="profile-dropdown-email">{t('header.profile_name')}</div>
              </div>
            </div>
            <div className="profile-dropdown-divider" />
            <div className="profile-dropdown-stats">
              <div className="profile-dropdown-stat-row">
                <span>{t('header.mental_fatigue')}</span>
                <strong
                  style={{
                    color:
                      data.fatigue > 75
                        ? 'var(--error)'
                        : data.fatigue > 45
                          ? 'var(--warning)'
                          : 'var(--success)',
                  }}
                >
                  {Math.round(data.fatigue)}%
                </strong>
              </div>
              <div className="profile-dropdown-stat-row">
                <span>{t('header.active_tasks')}</span>
                <strong>{data.tasks.filter((t) => !t.isCompleted).length}</strong>
              </div>
              <div className="profile-dropdown-stat-row">
                <span>{t('header.total_contacts')}</span>
                <strong>{data.people.length}</strong>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
