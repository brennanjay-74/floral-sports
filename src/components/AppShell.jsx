import LoadingScreen from './LoadingScreen';
import { useAuth } from '../contexts/AuthContext';
import { useInstallPrompt } from '../hooks/useInstallPrompt';
import { useEvents } from '../hooks/useEvents';
import { EventDataProvider } from '../contexts/EventDataContext';
import { NavLink, useLocation } from 'react-router-dom';

const navItems = [
  { to: '/', label: 'Home', icon: '🏠' },
  { to: '/schedule', label: 'Schedule', icon: '📅' },
  { to: '/create', label: 'Create', icon: '➕' },
  { to: '/members', label: 'Members', icon: '👥' },
  { to: '/stats', label: 'Stats', icon: '📊' },
  { to: '/profile', label: 'Profile', icon: '🙂' },
];

export default function AppShell({ children }) {
  const { loading: authLoading, profile, signOut } = useAuth();
  const { canInstall, promptInstall } = useInstallPrompt();
  const eventData = useEvents();
  const location = useLocation();

  // ✅ Correct loading logic
  if (authLoading || eventData.loading) {
    return <LoadingScreen />;
  }

  return (
    <EventDataProvider value={eventData}>
      <div className="app-shell">
        <header className="topbar">
          {/* ✅ FS BRANDING */}
          <div className="app-brand">
            <div className="fs-logo app-brand-logo" aria-hidden="true">
              <span className="fs-logo-f">F</span>
              <span className="fs-logo-s">S</span>
            </div>

            <div className="app-brand-text">
              <span className="app-brand-kicker">Floral Gang</span>
              <strong>Floral Sports</strong>
            </div>
          </div>

          <div className="topbar-actions">
            {canInstall && (
              <button className="ghost-button" onClick={promptInstall}>
                Install App
              </button>
            )}

            <button className="ghost-button" onClick={signOut}>
              Sign Out
            </button>

            <div className="avatar-chip">
              <span className="avatar-emoji">
                {profile?.avatar_icon || '🌼'}
              </span>
              <span>{profile?.nickname || 'Player'}</span>
            </div>
          </div>
        </header>

        <main className="page-wrap">{children}</main>

        <nav className="bottom-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `nav-item ${isActive ? 'active' : ''}`
              }
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Error Toast */}
        {location.pathname === '/' && eventData.error && (
          <div className="toast-error">{eventData.error}</div>
        )}
      </div>
    </EventDataProvider>
  );
}