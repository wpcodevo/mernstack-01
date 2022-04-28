import { FC } from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { useCookies } from 'react-cookie';
import { useAuth } from '../redux/hooks/useAuth';
import FullScreenProgress from './FullScreenProgress';

interface IRequireUserProps {
  allowedRoles: string[];
}

const RequireUser: FC<IRequireUserProps> = ({ allowedRoles }) => {
  const [cookies] = useCookies(['logged_in']);
  const location = useLocation();

  const { user, loading } = useAuth();

  if (loading) {
    return <FullScreenProgress />;
  }

  return cookies.logged_in &&
    user &&
    allowedRoles.includes(user?.role as string) ? (
    <Outlet />
  ) : cookies.logged_in && user ? (
    <Navigate to='/unauthorize' state={{ from: location }} replace />
  ) : (
    <Navigate to='/login' state={{ from: location }} replace />
  );
};

export default RequireUser;
