import {
  Container,
  Grid,
  Box,
  Typography,
  Stack,
  Link as MuiLink,
} from '@mui/material';
import LoadingButton from '@mui/lab/LoadingButton';
import { FC, useEffect } from 'react';
import { useForm, SubmitHandler, FormProvider } from 'react-hook-form';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { object, string } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRegisterUserMutation } from '../redux/api/authApi';
import FormInput from '../components/FormInput';
import { toast } from 'react-toastify';
import { ReactComponent as GoogleLogo } from '../assets/google.svg';
import { ReactComponent as GitHubLogo } from '../assets/github.svg';
import styled from '@emotion/styled';
import { getGitHubUrl } from '../utils/getGithubUrl';
import { getGoogleUrl } from '../utils/getGoogleUrl';
import FormHeader from '../components/FormHeader';

const LinkItem = styled(Link)`
  text-decoration: none;
  color: #3683dc;
  &:hover {
    text-decoration: underline;
    color: #5ea1b6;
  }
`;

interface ISignUp {
  name: string;
  email: string;
  password: string;
  passwordConfirm: string;
}

const registerSchema = object({
  name: string().nonempty('Name is required').max(70),
  email: string().nonempty('Email is required').email('Email is invalid'),
  password: string()
    .nonempty('Password is required')
    .min(8, 'Password must be more than 8 characters')
    .max(32, 'Password must be less than 32 characters'),
  passwordConfirm: string().nonempty('Please confirm your password'),
}).refine((data) => data.password === data.passwordConfirm, {
  path: ['passwordConfirm'],
  message: 'Passwords do not match',
});

const defaultValues: ISignUp = {
  name: '',
  email: '',
  password: '',
  passwordConfirm: '',
};

const SignUpPage: FC = () => {
  const [registerUser, { isLoading, isSuccess, isError, data, error }] =
    useRegisterUserMutation();

  const navigate = useNavigate();
  const location = useLocation();

  let from = ((location.state as any)?.from?.pathname as string) || '/profile';

  const methods = useForm<ISignUp>({
    resolver: zodResolver(registerSchema),
    defaultValues,
  });

  const onSubmitHandler: SubmitHandler<ISignUp> = (values: ISignUp) => {
    registerUser(values);
  };

  useEffect(() => {
    if (isSuccess) {
      navigate('/verifyEmail');
      toast.success(data?.message, {
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
      methods.reset(defaultValues);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [methods.formState.isSubmitSuccessful]);

  return (
    <Container
      maxWidth={false}
      sx={{ height: '100vh', backgroundColor: { xs: '#fff', md: '#f4f4f4' } }}
    >
      <FormHeader />
      <Grid
        container
        justifyContent='center'
        alignItems='center'
        sx={{ width: '100%' }}
      >
        <Grid
          item
          sx={{ maxWidth: '70rem', width: '100%', backgroundColor: '#fff' }}
        >
          <Grid
            container
            sx={{
              boxShadow: { sm: '0 0 5px #ddd' },
              py: '6rem',
              px: '1rem',
            }}
          >
            <FormProvider {...methods}>
              <Typography
                variant='h4'
                component='h1'
                sx={{
                  textAlign: 'center',
                  width: '100%',
                  mb: '1.5rem',
                  pb: { sm: '3rem' },
                }}
              >
                Welcome To Loop True!
              </Typography>
              <Grid
                item
                container
                justifyContent='space-between'
                rowSpacing={5}
                sx={{
                  maxWidth: { sm: '45rem' },
                  marginInline: 'auto',
                }}
              >
                <Grid
                  item
                  xs={12}
                  sm={6}
                  sx={{ borderRight: { sm: '1px solid #ddd' } }}
                >
                  <Box
                    display='flex'
                    flexDirection='column'
                    component='form'
                    noValidate
                    autoComplete='off'
                    sx={{ paddingRight: { sm: '3rem' } }}
                    onSubmit={methods.handleSubmit(onSubmitHandler)}
                  >
                    <Typography
                      variant='h6'
                      component='h1'
                      sx={{ textAlign: 'center', mb: '1.5rem' }}
                    >
                      Create new your account
                    </Typography>

                    <FormInput
                      label='Name'
                      type='text'
                      name='name'
                      focused
                      required
                    />
                    <FormInput
                      label='Enter your email'
                      type='email'
                      name='email'
                      focused
                      required
                    />
                    <FormInput
                      type='password'
                      label='Password'
                      name='password'
                      required
                      focused
                    />
                    <FormInput
                      type='password'
                      label='Confirm Password'
                      name='passwordConfirm'
                      required
                      focused
                    />

                    <LoadingButton
                      loading={isLoading}
                      type='submit'
                      variant='contained'
                      sx={{
                        py: '1rem',
                        mt: 2,
                        width: '7rem',
                        marginInline: 'auto',
                      }}
                    >
                      Sign Up
                    </LoadingButton>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} sx={{}}>
                  <Typography
                    variant='h6'
                    component='p'
                    sx={{
                      paddingLeft: { sm: '3rem' },
                      mb: '1.5rem',
                      textAlign: 'center',
                    }}
                  >
                    Sign up using another provider:
                  </Typography>
                  <Box
                    display='flex'
                    flexDirection='column'
                    sx={{ paddingLeft: { sm: '3rem' }, rowGap: '1rem' }}
                  >
                    <MuiLink
                      href={getGoogleUrl(from)}
                      sx={{
                        backgroundColor: '#f5f6f7',
                        borderRadius: 1,
                        py: '0.6rem',
                        columnGap: '1rem',
                        textDecoration: 'none',
                        cursor: 'pointer',
                        color: '#393e45',
                        fontWeight: 500,
                        '&:hover': {
                          backgroundColor: '#fff',
                          boxShadow: '0 1px 13px 0 rgb(0 0 0 / 15%)',
                        },
                      }}
                      display='flex'
                      justifyContent='center'
                      alignItems='center'
                    >
                      <GoogleLogo style={{ height: '2rem' }} />
                      Google
                    </MuiLink>
                    <MuiLink
                      href={getGitHubUrl(from)}
                      sx={{
                        backgroundColor: '#f5f6f7',
                        borderRadius: 1,
                        py: '0.6rem',
                        columnGap: '1rem',
                        textDecoration: 'none',
                        color: '#393e45',
                        fontWeight: 500,
                        cursor: 'pointer',
                        '&:hover': {
                          backgroundColor: '#fff',
                          boxShadow: '0 1px 13px 0 rgb(0 0 0 / 15%)',
                        },
                      }}
                      display='flex'
                      justifyContent='center'
                      alignItems='center'
                    >
                      <GitHubLogo style={{ height: '2rem' }} />
                      GitHub
                    </MuiLink>
                  </Box>
                </Grid>
              </Grid>
              <Grid container justifyContent='center'>
                <Stack sx={{ mt: '3rem', textAlign: 'center' }}>
                  <Typography sx={{ fontSize: '0.9rem', mb: '1rem' }}>
                    Already have an account?{' '}
                    <LinkItem to='/login'>Login</LinkItem>
                  </Typography>
                </Stack>
              </Grid>
            </FormProvider>
          </Grid>
        </Grid>
      </Grid>
    </Container>
  );
};

export default SignUpPage;
