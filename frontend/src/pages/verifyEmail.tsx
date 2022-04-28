import { LoadingButton } from '@mui/lab';
import { Box, Grid, Typography } from '@mui/material';
import { FormProvider, SubmitHandler, useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { object, string } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import FormContainer from '../components/FormContainer';
import FormInput from '../components/FormInput';
import { useVerifyEmailMutation } from '../redux/api/authApi';
import { useEffect } from 'react';
import { toast } from 'react-toastify';

interface IVerifyEmail {
  verificationCode?: string;
}

const verifyTokenSchema = object({
  verificationCode: string().nonempty('Verification code is required'),
});

const VerifyEmailPage = () => {
  const [verifyEmail, { isSuccess, isError, isLoading, data, error }] =
    useVerifyEmailMutation();
  const { verificationCode } = useParams<{ verificationCode: string }>();
  const navigate = useNavigate();

  const defaultValues: IVerifyEmail = {
    verificationCode,
  };

  const methods = useForm<IVerifyEmail>({
    resolver: zodResolver(verifyTokenSchema),
    defaultValues,
  });

  const onSubmitHandler: SubmitHandler<IVerifyEmail> = (values) => {
    verifyEmail({ verificationCode: values.verificationCode! });
  };

  useEffect(() => {
    if (isSuccess) {
      toast.success(data?.message, {
        position: 'top-right',
      });
      navigate('/login');
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
        Verify Email Address
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
            Enter verification code below to confirm your email address
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
                type='text'
                label='verificationCode'
                name='verificationCode'
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
                Verify Email
              </LoadingButton>
            </Box>
          </FormProvider>
        </Grid>
      </Grid>
    </FormContainer>
  );
};

export default VerifyEmailPage;
