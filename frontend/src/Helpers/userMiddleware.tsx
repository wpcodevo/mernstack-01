import React, { FC } from 'react';
import { useCookies } from 'react-cookie';
import FullScreenProgress from '../components/FullScreenProgress';
import { authApi } from '../redux/api/authApi';

interface IUserMiddleware {
  children: React.ReactElement;
}

const UserMiddleware: FC<IUserMiddleware> = ({ children }) => {
  const [cookies] = useCookies(['logged_in']);

  authApi.endpoints.getUserInfo.useQuery(null, {
    skip: !cookies.logged_in,
  });

  const user = authApi.endpoints.getUserInfo.useQueryState(null);

  if (!user && cookies.logged_in) {
    return <FullScreenProgress />;
  }

  return children;
};

export default UserMiddleware;
