import { Navigate, Route, Routes } from 'react-router-dom';
import AppShell from './components/AppShell';
import EventModalHost from './components/EventModalHost';
import RequireAuth from './components/RequireAuth';
import AuthPage from './pages/AuthPage';
import CreateEventPage from './pages/CreateEventPage';
import DashboardPage from './pages/DashboardPage';
import MembersPage from './pages/MembersPage';
import ProfilePage from './pages/ProfilePage';
import SchedulePage from './pages/SchedulePage';
import StatsPage from './pages/StatsPage';

export default function App() {
  return (
    <Routes>
      <Route path="/auth" element={<AuthPage />} />
      <Route
        path="/*"
        element={
          <RequireAuth>
            <AppShell>
              <Routes>
                <Route path="/" element={<DashboardPage />} />
                <Route path="/schedule" element={<SchedulePage />} />
                <Route path="/create" element={<CreateEventPage />} />
                <Route path="/members" element={<MembersPage />} />
                <Route path="/stats" element={<StatsPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
              <EventModalHost />
            </AppShell>
          </RequireAuth>
        }
      />
    </Routes>
  );
}
