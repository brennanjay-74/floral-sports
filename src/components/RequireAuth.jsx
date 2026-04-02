import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function RequireAuth({ children }) {
  const { user, loading, bootError } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="screen-center">Loading Floral Sports…</div>;
  }

  if (bootError && !user) {
    return (
      <div className="screen-center narrow">
        <h1>Setup needed</h1>
        <p>{bootError}</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace state={{ from: location }} />;
  }

  return children;
}
