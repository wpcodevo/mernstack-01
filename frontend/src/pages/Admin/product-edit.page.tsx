import {
  Box,
  Container,
  MenuItem,
  Skeleton,
  TextareaAutosize,
  Typography,
} from '@mui/material';
import { useParams } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  useForm,
  FormProvider,
  SubmitHandler,
  Controller,
} from 'react-hook-form';
import { array, object, string, z } from 'zod';

import { toast } from 'react-toastify';
import { useEffect, useState } from 'react';
import FormInput from '../../components/FormInput';
import FileUpload from '../../components/FileUpload/FileUpload';
import { pickBy } from 'lodash';
import Loader from '../../components/Loader';
import { IProduct } from '../../redux/api/products/types';
import { LoadingButton } from '@mui/lab';
import {
  useGetProductQuery,
  useUpdateProductMutation,
} from '../../redux/api/products/productsApi';
import FormSelectInput from '../../components/FormSelectInput';
import { useGetCategoriesQuery } from '../../redux/api/category/categoryApi';

export interface IEditProduct {
  name: string;
  price: number | string;
  description: string;
  countInStock: number | string;
  imageCover?: File;
  images?: FileList;
  category: string;
}

const editProductSchema = object({
  name: string().max(100).nonempty('Product name is required'),
  price: string()
    .nonempty('Prince is required')
    .regex(/^\d+$/)
    .transform(Number),
  description: string(),
  countInStock: string()
    .nonempty('Count In Stock is required')
    .regex(/^\d+$/)
    .transform(Number),
  imageCover: z.instanceof(File).optional(),
  images: array(z.instanceof(File)).optional(),
  category: string(),
});

const ProductEditPage = () => {
  const [imageLoading, setImageLoading] = useState(true);
  const { productId } = useParams();

  const fetchResult = useGetProductQuery(productId!, {
    skip: !productId,
  });

  const product = fetchResult.data;

  const [
    updateProduct,
    { isLoading, isError, error, isSuccess, data: updatedProduct },
  ] = useUpdateProductMutation();

  const {
    isLoading: isCategoriesLoading,
    error: categoriesError,
    isError: isCategoriesError,
    data: categories,
  } = useGetCategoriesQuery();

  const defaultValues: IEditProduct = {
    name: '',
    description: '',
    price: '0',
    countInStock: '0',
    category: '',
  };

  const methods = useForm<IEditProduct>({
    resolver: zodResolver(editProductSchema),
    defaultValues,
  });

  useEffect(() => {
    if (isSuccess) {
      toast.success('Product info updated');
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
  }, [fetchResult.isLoading, isLoading, isCategoriesLoading]);

  useEffect(() => {
    if (product) {
      methods.reset({
        name: product.name,
        description: product.description,
        price: `${product.price}`,
        countInStock: `${product.countInStock}`,
      });
      methods.setValue('category', product.category._id || '');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product]);

  useEffect(() => {
    if (updatedProduct) {
      methods.reset({
        name: updatedProduct.name,
        description: updatedProduct.description,
        price: `${updatedProduct.price}`,
        countInStock: `${updatedProduct.countInStock}`,
      });
      methods.setValue('category', updatedProduct.category._id || '');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [updatedProduct]);

  const onImageLoaded = () => {
    setImageLoading(false);
  };

  const onSubmitHandler: SubmitHandler<IEditProduct> = (values) => {
    const filteredValues: Partial<IProduct> = pickBy(
      values,
      (value) => value !== '' && value !== undefined
    );

    const { imageCover, images, ...otherData } = filteredValues;

    const formData = new FormData();
    if (imageCover) {
      formData.append('imageCover', filteredValues['imageCover']!);
    }

    if (images) {
      [...images]?.forEach((el) => {
        formData.append('images', el);
      });
    }

    formData.append('data', JSON.stringify(otherData));
    updateProduct({ id: product?._id!, formData });
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
          Edit Product
        </Typography>
        {(isLoading || fetchResult.isLoading || isCategoriesLoading) && (
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
                  src={product?.imageCover}
                  alt='update product'
                  onLoad={onImageLoaded}
                  style={{
                    display: imageLoading ? 'none' : 'block',
                    width: '17rem',
                    height: '12rem',
                    objectFit: 'contain',
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
              Update Product
            </LoadingButton>
          </Box>
        </Box>
      </FormProvider>
    </Container>
  );
};

export default ProductEditPage;
