import { LoadingButton } from '@mui/lab';
import { Box, Grid, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import { FormProvider, SubmitHandler, useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { object, string } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import FormContainer from '../components/FormContainer';
import FormInput from '../components/FormInput';
import { useForgotPasswordMutation } from '../redux/api/authApi';
import { useEffect } from 'react';
import { toast } from 'react-toastify';

const LinkItem = styled(Link)`
  text-decoration: none;
  color: #3683dc;
  &:hover {
    text-decoration: underline;
    color: #5ea1b6;
  }
`;

interface IForgotPassword {
  email: string;
}

const forgotPasswordSchema = object({
  email: string().nonempty('Email is required').email('Email is invalid'),
});

const ForgotPasswordPage = () => {
  const [forgotPassword, { isLoading, isError, error, data, isSuccess }] =
    useForgotPasswordMutation();
  const methods = useForm<IForgotPassword>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmitHandler: SubmitHandler<IForgotPassword> = (values) => {
    forgotPassword(values);
  };

  useEffect(() => {
    if (isSuccess) {
      toast.success(data?.message, {
        position: 'top-right',
      });
    }

    if (isError) {
      if ((error as any).data.error) {
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
        Forgot Password?
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
            Enter your email address and we’ll send you a link to reset your
            password.
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
                type='email'
                label='Email'
                name='email'
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
                Retrieve Password
              </LoadingButton>
            </Box>
          </FormProvider>
        </Grid>
        <Typography sx={{ width: '100%', textAlign: 'center', mt: '3rem' }}>
          <LinkItem to='/login'>Go Back</LinkItem>
        </Typography>
      </Grid>
    </FormContainer>
  );
};

export default ForgotPasswordPage;
