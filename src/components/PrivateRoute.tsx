import { Navigate } from 'react-router-dom';

interface PrivateRouteProps {
  children: React.ReactNode;
}

export default function PrivateRoute({ children }: PrivateRouteProps) {
  const handle = localStorage.getItem('cfHandle');
  
  if (!handle) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}