import { Box, TextareaAutosize, Typography } from '@mui/material';
import {
  Controller,
  FormProvider,
  SubmitHandler,
  useForm,
} from 'react-hook-form';
import { object, string, z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import FileUpload from '../FileUpload/FileUpload';
import FormInput from '../FormInput';
import { LoadingButton } from '@mui/lab';
import { useCreateCategoryMutation } from '../../redux/api/category/categoryApi';
import { FC, useEffect } from 'react';
import Loader from '../Loader';
import { pickBy } from 'lodash';
import { toast } from 'react-toastify';

interface ICreateCategory {
  name: string;
  description?: string;
  photo?: File;
}

interface ICreateCategoryProp {
  setOpenCategory: (openCategory: boolean) => void;
}

const createCategorySchema = object({
  name: string().nonempty('Category name is required'),
  description: string().max(50).optional(),
  image: z.instanceof(File),
});

const CreateCategory: FC<ICreateCategoryProp> = ({ setOpenCategory }) => {
  const [createCategory, { isLoading, isError, error, isSuccess }] =
    useCreateCategoryMutation();

  const defaultValues: ICreateCategory = {
    name: '',
    description: '',
  };

  const methods = useForm<ICreateCategory>({
    resolver: zodResolver(createCategorySchema),
    defaultValues,
  });

  useEffect(() => {
    if (isSuccess) {
      toast.success('Category created successfully');
      setOpenCategory(false);
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
    if (methods.formState.isSubmitting) {
      methods.reset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [methods.formState.isSubmitting]);

  const onSubmitHandler: SubmitHandler<ICreateCategory> = (values) => {
    const formData = new FormData();
    const filteredFormData = pickBy(
      values,
      (value) => value !== '' && value !== undefined
    );
    const { image, ...otherFormData } = filteredFormData;
    if (image) {
      formData.append('image', image);
    }
    formData.append('data', JSON.stringify(otherFormData));
    createCategory(formData);
  };

  return (
    <Box>
      <Box display='flex' justifyContent='space-between' sx={{ mb: 3 }}>
        <Typography variant='h5' component='h1'>
          Create Category
        </Typography>
        {isLoading && <Loader size='1.5rem' color='primary' />}
      </Box>
      <FormProvider {...methods}>
        <Box
          component='form'
          noValidate
          autoComplete='off'
          onSubmit={methods.handleSubmit(onSubmitHandler)}
        >
          <FormInput
            name='name'
            label='Category Name'
            fullWidth
            type='text'
            focused
          />
          <Controller
            name='description'
            control={methods.control}
            defaultValue=''
            render={({ field }) => (
              <TextareaAutosize
                {...field}
                placeholder='Category Details'
                minRows={8}
                style={{
                  width: '100%',
                  border: '1px solid #c8d0d4',
                  fontFamily: 'Roboto, sans-serif',
                  marginBottom: '1rem',
                  outline: 'none',
                  fontSize: '1rem',
                  padding: '1rem',
                }}
              />
            )}
          />
          <FileUpload limit={1} name='image' multiple={false} />
          <LoadingButton
            variant='contained'
            fullWidth
            sx={{ py: '0.8rem', mt: 4 }}
            type='submit'
            loading={isLoading}
          >
            Create Category
          </LoadingButton>
        </Box>
      </FormProvider>
    </Box>
  );
};

export default CreateCategory;
