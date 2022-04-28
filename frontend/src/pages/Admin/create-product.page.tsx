import {
  Box,
  Container,
  MenuItem,
  Skeleton,
  TextareaAutosize,
  Typography,
} from '@mui/material';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  useForm,
  FormProvider,
  SubmitHandler,
  Controller,
} from 'react-hook-form';
import { array, object, string, TypeOf, z } from 'zod';
import { toast } from 'react-toastify';
import { useEffect, useState } from 'react';
import FormInput from '../../components/FormInput';
import FileUpload from '../../components/FileUpload/FileUpload';
import { pickBy } from 'lodash';
import Loader from '../../components/Loader';
import { LoadingButton } from '@mui/lab';
import { useCreateProductMutation } from '../../redux/api/products/productsApi';
import { useNavigate } from 'react-router-dom';
import { useGetCategoriesQuery } from '../../redux/api/category/categoryApi';
import FormSelectInput from '../../components/FormSelectInput';

const createProductSchema = object({
  name: string().max(100).nonempty('Product name is required'),
  price: string()
    .nonempty('Price is required')
    .regex(/^\d*(\.)?(\d{0,2})?$/)
    .transform(Number),
  description: string(),
  countInStock: string()
    .nonempty('Count In Stock is required')
    .regex(/^\d+$/)
    .transform(Number),
  imageCover: z.instanceof(File),
  images: array(z.instanceof(File)),
  category: string(),
});

type ICreateProduct = TypeOf<typeof createProductSchema>;

const CreateProductPage = () => {
  const [imageLoading, setImageLoading] = useState(true);
  const navigate = useNavigate();

  const methods = useForm<ICreateProduct>({
    resolver: zodResolver(createProductSchema),
  });

  const [createProduct, { isLoading, isSuccess, error, isError }] =
    useCreateProductMutation();

  const {
    isLoading: isCategoriesLoading,
    error: categoriesError,
    isError: isCategoriesError,
    data: categories,
  } = useGetCategoriesQuery();

  useEffect(() => {
    if (isSuccess) {
      navigate('/admin/products');
      toast.success('Product created');
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

    if (isCategoriesError) {
      if (Array.isArray((categoriesError as any).data.error)) {
        (categoriesError as any).data.error.forEach((el: any) =>
          toast.error(el.message, {
            position: 'top-right',
          })
        );
      } else {
        toast.error((categoriesError as any).data.message, {
          position: 'top-right',
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, isCategoriesLoading]);

  useEffect(() => {
    if (methods.formState.isSubmitting) {
      methods.reset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [methods.formState.isSubmitting]);

  const onSubmitHandler: SubmitHandler<ICreateProduct> = (values) => {
    const filteredValues: Partial<ICreateProduct> = pickBy(
      values,
      (value) => value !== '' && value !== undefined
    );

    const { imageCover, images, ...otherData } = filteredValues;

    const formData = new FormData();
    if (imageCover) {
      formData.append('imageCover', filteredValues['imageCover']!);
    }

    if (images) {
      images?.forEach((el) => {
        formData.append('images', el);
      });
    }

    formData.append('data', JSON.stringify(otherData));
    createProduct(formData);
  };

  const onImageLoaded = () => {
    setImageLoading(false);
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
          Create New Product
        </Typography>
        {(isLoading || isCategoriesLoading) && (
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
            <FormInput name='name' type='text' label='Name' fullWidth focused />
            <FormInput
              name='price'
              type='number'
              label='Price'
              fullWidth
              focused
            />
          </Box>
          <Box display='flex' columnGap={2}>
            <FormInput
              name='countInStock'
              type='number'
              label='Count In Stock'
              fullWidth
              focused
            />
            <FormSelectInput
              name='category'
              label='Category'
              itemWidth={400}
              sx={{ width: '100%', outline: 'none' }}
              fullWidth
            >
              {categories?.map((category) => (
                <MenuItem key={category._id} value={category._id}>
                  {category.name}
                </MenuItem>
              ))}
            </FormSelectInput>
          </Box>
          <Controller
            name='description'
            control={methods.control}
            defaultValue=''
            render={({ field }) => (
              <TextareaAutosize
                {...field}
                placeholder='Description'
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
          <Box
            display='grid'
            alignItems='center'
            sx={{ gridTemplateColumns: '1fr 1.5fr', mb: 2 }}
          >
            <Box>
              <Typography variant='h5' gutterBottom>
                Product Image Cover
              </Typography>
              <Box>
                <img
                  src={`/api/static/products/default.png`}
                  alt='create product'
                  onLoad={onImageLoaded}
                  style={{
                    display: imageLoading ? 'none' : 'block',
                    width: '17rem',
                    height: '12rem',
                    objectFit: 'cover',
                  }}
                />

                <Skeleton
                  variant='rectangular'
                  animation='wave'
                  width='17rem'
                  height='12rem'
                  style={{ display: imageLoading ? 'block' : 'none' }}
                />
              </Box>
            </Box>
            <Box>
              <FileUpload limit={1} multiple={false} name='imageCover' />
            </Box>
          </Box>
          <Box sx={{ mb: 2 }}>
            <Typography variant='h5' gutterBottom>
              Product Images
            </Typography>
            <FileUpload limit={3} multiple={true} name='images' />
          </Box>
          <Box display='flex' justifyContent='center'>
            <LoadingButton
              type='submit'
              variant='contained'
              sx={{ py: '0.8rem', mt: 3, width: '50%' }}
              loading={isLoading}
            >
              Create Product
            </LoadingButton>
          </Box>
        </Box>
      </FormProvider>
    </Container>
  );
};

export default CreateProductPage;
