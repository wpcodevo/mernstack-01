import { useCookies } from 'react-cookie';
import { IUser } from '../api/types';
import { authApi } from '../api/authApi';

interface IUserProps {
  loading: boolean;
  user: IUser | undefined | null;
}

export const useAuth = (): IUserProps => {
  const [cookies] = useCookies(['logged_in']);

  const { isLoading, data: user } = authApi.endpoints.getUserInfo.useQuery(
    null,
    {
      skip: !cookies.logged_in,
    }
  );

  return {
    user,
    loading: isLoading,
  };
};
