import {
  Avatar,
  Box,
  Container,
  FormGroup,
  IconButton,
  Skeleton,
  Typography,
} from '@mui/material';
import { useParams } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, FormProvider, SubmitHandler } from 'react-hook-form';
import { boolean, object, string, z } from 'zod';
import {
  useGetUserQuery,
  useUpdateUserMutation,
} from '../../redux/api/userApi';
import { toast } from 'react-toastify';
import { useEffect, useState } from 'react';
import FormInput from '../../components/FormInput';
import FileUpload from '../../components/FileUpload/FileUpload';
import FormSwitchInput from '../../components/FormSwitchInput';
import { pickBy } from 'lodash';
import Loader from '../../components/Loader';
import { useAppSelector } from '../../redux/store';
import { IUser } from '../../redux/api/types';
import { LoadingButton } from '@mui/lab';

interface IUserEdit {
  name?: string;
  email?: string;
  active?: boolean;
  role?: string;
  photo?: File;
  password?: string;
  passwordConfirm?: string;
  verified?: boolean;
}

const userEditSchema = object({
  name: string().max(100),
  email: string().email('Email is invalid').max(100),
  role: string(),
  photo: z.instanceof(File),
  password: string().max(32),
  passwordConfirm: string().max(32),
  verified: boolean(),
  active: boolean(),
})
  .partial()
  .refine((data) => data.password === data.passwordConfirm, {
    path: ['passwordConfirm'],
    message: 'Passwords do not match',
  });

const UserEditPage = () => {
  const [imageLoading, setImageLoading] = useState(true);
  const { userId } = useParams();

  const fetchResult = useGetUserQuery(userId!, {
    skip: !userId,
  });

  const user = useAppSelector((state) => state.authUser.updatedUserInfo);

  const [updateUser, { isLoading, isError, error, isSuccess }] =
    useUpdateUserMutation();

  const defaultValues: IUserEdit = {
    name: '',
    email: '',
    password: '',
    passwordConfirm: '',
    role: '',
    active: false,
    verified: false,
  };

  const methods = useForm<IUserEdit>({
    resolver: zodResolver(userEditSchema),
    defaultValues,
  });

  useEffect(() => {
    if (isSuccess) {
      toast.success('User info updated');
    }
    if (fetchResult.isError) {
      if (Array.isArray((fetchResult.error as any).data.error)) {
        (fetchResult.error as any).data.error.forEach((el: any) =>
          toast.error(el.message, {
            position: 'top-right',
          })
        );
      } else {
        toast.error((fetchResult.error as any).data.message, {
          position: 'top-right',
        });
      }
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
  }, [fetchResult.isLoading, isLoading]);

  useEffect(() => {
    if (user) {
      methods.reset({
        name: user?.name,
        email: user?.email,
        role: user?.role,
        active: user?.active,
        verified: user?.verified,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const onImageLoaded = () => {
    setImageLoading(false);
  };

  const onSubmitHandler: SubmitHandler<IUserEdit> = (values) => {
    const filteredValues: Partial<IUser> = pickBy(
      values,
      (value) => value !== '' && value !== undefined
    );

    const { photo, ...otherData } = filteredValues;

    const formData = new FormData();
    if (filteredValues['photo']) {
      formData.append('photo', filteredValues['photo']);
    }

    formData.append('data', JSON.stringify(otherData));

    updateUser({ id: userId!, userData: formData });
  };

  return (
    <Container maxWidth='md'>
      <Box
        display='flex'
        flexDirection='row'
        alignItems='center'
        justifyContent='space-between'
        sx={{ mb: 5 }}
      >
        <Typography variant='h4' component='h1'>
          User Edit
        </Typography>
        {(fetchResult.isLoading || isLoading) && (
          <Loader size='1.5rem' sx={{ mr: 3 }} color='primary' />
        )}
      </Box>
      <FormProvider {...methods}>
        <Box
          component='form'
          onSubmit={methods.handleSubmit(onSubmitHandler)}
          noValidate
          autoComplete='off'
        >
          <Box display='flex' columnGap={2}>
            <FormInput name='name' type='text' label='Name' fullWidth />
            <FormInput
              name='email'
              type='email'
              label='Email Address'
              fullWidth
            />
          </Box>
          <Box display='flex' columnGap={2}>
            <FormInput
              name='password'
              type='password'
              label='Password'
              fullWidth
            />
            <FormInput
              name='passwordConfirm'
              type='password'
              label='Confirm Password'
              fullWidth
            />
          </Box>
          <Box
            display='grid'
            alignItems='center'
            sx={{ gridTemplateColumns: '1fr 1.5fr' }}
          >
            <Box>
              <Typography variant='h5' gutterBottom>
                Edit Photo
              </Typography>
              <IconButton>
                <Avatar
                  imgProps={{
                    onLoad: onImageLoaded,
                  }}
                  alt={user?.name}
                  src={
                    user && user.photo.includes('default')
                      ? `/api/static/users/${user?.photo}`
                      : user?.photo
                  }
                  sx={{ width: '12rem', height: '12rem' }}
                  style={{ display: imageLoading ? 'none' : 'block' }}
                />
                <Skeleton
                  variant='circular'
                  animation='wave'
                  height='12rem'
                  width='12rem'
                  style={{ display: imageLoading ? 'block' : 'none' }}
                />
              </IconButton>
            </Box>
            <Box>
              <FileUpload limit={1} multiple={false} name='photo' />
            </Box>
          </Box>
          <Box
            display='grid'
            alignItems='center'
            sx={{ gridTemplateColumns: '1fr 1.5fr', mt: 5 }}
            gap={2}
          >
            <FormGroup sx={{ flexDirection: 'row' }}>
              <FormSwitchInput
                name='active'
                label='Active'
                color='primary'
                labelPlacement='start'
              />
              <FormSwitchInput
                name='verified'
                label='Verified'
                color='secondary'
                labelPlacement='start'
              />
            </FormGroup>
            <LoadingButton
              type='submit'
              variant='contained'
              sx={{ py: '0.8rem' }}
              loading={isLoading}
            >
              Update User
            </LoadingButton>
          </Box>
        </Box>
      </FormProvider>
    </Container>
  );
};

export default UserEditPage;
