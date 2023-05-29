import { Navigate, Outlet } from 'react-router-dom';

// This component is used to protect routes from unauthenticated users
const ProtectedRoute = ({
  isAllowed,
  redirectPath,
  children,
}) => {
  if (!isAllowed) {
    return <Navigate to={redirectPath} replace />;
  }
  return children ? children : <Outlet />;
};

export default ProtectedRoute;