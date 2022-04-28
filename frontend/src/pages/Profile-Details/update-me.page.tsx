import {
  Avatar,
  Box,
  Grid,
  IconButton,
  Skeleton,
  Typography,
} from '@mui/material';
import { FormProvider, useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { object, string, z } from 'zod';
import FileUpload from '../../components/FileUpload/FileUpload';
import FormInput from '../../components/FormInput';
import { useAppSelector } from '../../redux/store';
import { useEffect, useState } from 'react';
import { LoadingButton } from '@mui/lab';
import { useUpdateMeMutation } from '../../redux/api/authApi';
import { toast } from 'react-toastify';
import { pickBy } from 'lodash';

interface IUpdateMe {
  name?: string;
  email?: string;
  photo?: File;
}

const updateMeSchema = object({
  name: string().nonempty('Name is required'),
  email: string().nonempty('Email is required').email('Email is invalid'),
  photo: z.instanceof(File),
}).partial();

const UpdateMePage = () => {
  const [imageLoading, setImageLoading] = useState(true);
  const [updateMe, { isLoading, isSuccess, isError, error }] =
    useUpdateMeMutation();
  const user = useAppSelector((state) => state.authUser.user);

  const defaultValues: IUpdateMe = {
    name: '',
    email: '',
  };

  const methods = useForm<IUpdateMe>({
    defaultValues,
    resolver: zodResolver(updateMeSchema),
  });

  const onSubmitHandler: SubmitHandler<IUpdateMe> = (data) => {
    const formData = new FormData();
    const filteredData: Partial<IUpdateMe> = pickBy(
      data,
      (value) => value !== '' && value !== undefined
    );
    const { photo, ...otherFormData } = filteredData;
    if (photo) {
      formData.append('photo', data?.photo!);
    }

    formData.append('data', JSON.stringify(otherFormData));
    if (user) {
      updateMe(formData);
    }
  };

  const onImageLoaded = () => {
    setImageLoading(false);
  };

  useEffect(() => {
    if (user) {
      methods.reset({ name: user.name, email: user.email });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  useEffect(() => {
    if (isSuccess) {
      toast.success('Profile updated', {
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

  return (
    <Box>
      <FormProvider {...methods}>
        <form
          noValidate
          autoComplete='off'
          onSubmit={methods.handleSubmit(onSubmitHandler)}
        >
          <Box display='flex' columnGap={2}>
            <FormInput
              label='Name'
              type='text'
              name='name'
              required
              fullWidth
            />
            <FormInput
              label='Enter your email'
              type='email'
              name='email'
              required
              fullWidth
            />
          </Box>
          <Grid container columnSpacing={2} sx={{ mt: 2 }}>
            <Grid item md={4} sx={{ textAlign: 'center' }}>
              <Typography variant='h5'>Edit Photo</Typography>
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
            </Grid>
            <Grid item md={8}>
              <FileUpload limit={1} multiple={false} name='photo' />
            </Grid>
          </Grid>
          <Box display='flex' justifyContent='center' sx={{ mt: 8 }}>
            <LoadingButton
              loading={isLoading}
              type='submit'
              variant='contained'
              sx={{ width: '50%', py: '0.8rem' }}
            >
              Update Profile
            </LoadingButton>
          </Box>
        </form>
      </FormProvider>
    </Box>
  );
};

export default UpdateMePage;
