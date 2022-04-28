import { LoadingButton } from '@mui/lab';
import { Box, Grid, Typography } from '@mui/material';
import { FormProvider, SubmitHandler, useForm } from 'react-hook-form';
import { object, string } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import FormContainer from '../components/FormContainer';
import FormInput from '../components/FormInput';
import { useNavigate, useParams } from 'react-router-dom';
import { useResetPasswordMutation } from '../redux/api/authApi';
import { useEffect } from 'react';
import { toast } from 'react-toastify';

interface IResetPassword {
  password: string;
  passwordConfirm: string;
}

const resetPasswordSchema = object({
  password: string()
    .nonempty('Password is required')
    .min(8, 'Password must be more than 8 characters'),
  passwordConfirm: string().nonempty('Please confirm your password'),
}).refine((data) => data.password === data.passwordConfirm, {
  message: 'Passwords do not match',
  path: ['passwordConfirm'],
});

const ResetPasswordPage = () => {
  const [resetPassword, { isLoading, error, isError, isSuccess }] =
    useResetPasswordMutation();
  const { resetToken } = useParams<{ resetToken: string }>();

  const navigate = useNavigate();

  const methods = useForm<IResetPassword>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmitHandler: SubmitHandler<IResetPassword> = (values) => {
    resetPassword({ ...values, resetToken: resetToken! });
  };

  useEffect(() => {
    if (isSuccess) {
      navigate('/login');
      toast.success('Password updated successfully, login', {
        position: 'top-right',
      });
    }

    if (isError) {
      if (Array.isArray((error as any).data.error)) {
        (error as any).data.error.forEach((el: any) =>
          toast.error(el.message, {
            position: 'top-right',
          })
        );
      } else {
        toast.error((error as any).data.message, {
          position: 'top-right',
        });
      }
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading]);

  useEffect(() => {
    if (methods.formState.isSubmitSuccessful) {
      methods.reset();
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [methods.formState.isSubmitSuccessful]);

  return (
    <FormContainer>
      <Typography
        variant='h4'
        component='h1'
        sx={{
          textAlign: 'center',
          width: '100%',
          pb: { sm: '1rem' },
        }}
      >
        Reset Password
      </Typography>
      <Grid
        container
        sx={{
          maxWidth: { sm: '35rem' },
          marginInline: 'auto',
        }}
      >
        <Grid item sx={{ width: '100%' }}>
          <Typography
            sx={{
              fontSize: 15,
              width: '100%',
              textAlign: 'center',
              mb: '1rem',
            }}
          >
            Please enter a new password
          </Typography>
          <FormProvider {...methods}>
            <Box
              display='flex'
              flexDirection='column'
              component='form'
              noValidate
              onSubmit={methods.handleSubmit(onSubmitHandler)}
            >
              <FormInput
                type='password'
                label='Password'
                name='password'
                fullWidth
                focused
              />
              <FormInput
                type='password'
                label='Confirm New Password'
                name='passwordConfirm'
                fullWidth
                focused
              />
              <LoadingButton
                loading={isLoading}
                type='submit'
                variant='contained'
                sx={{
                  py: '1rem',
                  mt: '1rem',
                  marginInline: 'auto',
                }}
              >
                Reset Password
              </LoadingButton>
            </Box>
          </FormProvider>
        </Grid>
      </Grid>
    </FormContainer>
  );
};

export default ResetPasswordPage;
