import { Box } from '@mui/material';
import { FormProvider, useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { object, string } from 'zod';
import FormInput from '../../components/FormInput';
import { useAppSelector } from '../../redux/store';
import { useEffect } from 'react';
import { LoadingButton } from '@mui/lab';
import { useUpdatePasswordMutation } from '../../redux/api/authApi';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

interface IUpdatePassword {
  passwordCurrent: string;
  password: string;
  passwordConfirm: string;
}

const updatePasswordSchema = object({
  passwordCurrent: string().nonempty('Current Password is required'),
  password: string().nonempty('Password is required'),
  passwordConfirm: string().nonempty('Please confirm your password'),
}).refine((data) => data.password === data.passwordConfirm, {
  path: ['passwordConfirm'],
  message: 'Passwords do not match',
});

const UpdatePasswordPage = () => {
  const [updatePassword, { isLoading, isError, isSuccess, error }] =
    useUpdatePasswordMutation();
  const user = useAppSelector((state) => state.authUser.user);
  const navigate = useNavigate();

  const methods = useForm<IUpdatePassword>({
    resolver: zodResolver(updatePasswordSchema),
  });

  const onSubmitHandler: SubmitHandler<IUpdatePassword> = (data) => {
    if (user) {
      updatePassword(data);
    }
  };
  useEffect(() => {
    if (isSuccess) {
      navigate('/login');
      toast.success('Password updated, please login again', {
        position: 'top-right',
      });
    }

    if (isError) {
      if (Array.isArray((error as any).data.error)) {
        toast.error((error as any).data.error[0].message, {
          position: 'top-right',
        });
      } else {
        toast.error((error as any).data.message, {
          position: 'top-right',
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading]);

  useEffect(() => {
    if (methods.formState.isSubmitted) {
      methods.reset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [methods.formState.isSubmitted]);

  return (
    <Box>
      <FormProvider {...methods}>
        <form
          noValidate
          autoComplete='off'
          onSubmit={methods.handleSubmit(onSubmitHandler)}
        >
          <FormInput
            label='Current Password'
            type='password'
            name='passwordCurrent'
            required
            fullWidth
            focused
          />
          <FormInput
            label='New Password'
            type='password'
            name='password'
            required
            fullWidth
            focused
          />
          <FormInput
            label='Confirm Password'
            type='password'
            name='passwordConfirm'
            required
            fullWidth
            focused
          />
          <Box display='flex' justifyContent='center' sx={{ mt: 3 }}>
            <LoadingButton
              loading={isLoading}
              type='submit'
              variant='contained'
              sx={{ width: '60%', py: '0.8rem' }}
            >
              Update Profile
            </LoadingButton>
          </Box>
        </form>
      </FormProvider>
    </Box>
  );
};

export default UpdatePasswordPage;
