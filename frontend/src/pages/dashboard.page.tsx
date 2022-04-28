import { useEffect } from 'react';
import { toast } from 'react-toastify';
import { Link, useNavigate } from 'react-router-dom';
import FullScreenProgress from '../components/FullScreenProgress';
import { useLogoutUserMutation } from '../redux/api/authApi';
import { useAppDispatch } from '../redux/store';
import { logout } from '../redux/features/authSlice';
import { batch } from 'react-redux';

const DashboardPage = () => {
  const [logoutUser, { isLoading, isSuccess, isError }] =
    useLogoutUserMutation();

  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const onLogoutHandler = () => {
    logoutUser();
  };

  useEffect(() => {
    if (isSuccess) {
      batch(() => {
        dispatch(logout());
      });
      navigate('/');
      toast.success('You successfully logged out', {
        position: 'top-right',
      });
    }

    if (isError) {
      navigate('/');
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading]);

  if (isLoading) {
    return <FullScreenProgress />;
  }

  return (
    <main
      style={{
        margin: 'auto 0',
        display: 'flex',
        justifyContent: 'center',
      }}
    >
      <div style={{ display: 'flex', gap: 10 }}>
        <div
          onClick={onLogoutHandler}
          style={{ textDecoration: 'underline', cursor: 'pointer' }}
        >
          Logout
        </div>
        <Link to='/admin'>Admin</Link>
        <Link to='/'>Home</Link>
      </div>
    </main>
  );
};

export default DashboardPage;
