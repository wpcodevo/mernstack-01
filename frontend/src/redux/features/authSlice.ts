import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { IUser } from '../api/types';

interface AuthState {
  user?: IUser | null;
  updatedUserInfo?: IUser | null;
}

const initialState: AuthState = {
  user: null,
  updatedUserInfo: null,
};

export const authSlice = createSlice({
  name: 'authSlice',
  initialState,
  reducers: {
    logout: () => initialState,
    userInfo: (state, action: PayloadAction<AuthState>) => {
      state.user = action.payload.user;
    },
    updatedUser: (state, action: PayloadAction<AuthState>) => {
      state.updatedUserInfo = action.payload.updatedUserInfo;
    },
  },
});

export const { logout, userInfo, updatedUser } = authSlice.actions;
export default authSlice.reducer;
