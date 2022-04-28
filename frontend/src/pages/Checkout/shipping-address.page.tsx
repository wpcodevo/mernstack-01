import { Box, Button, Typography } from '@mui/material';
import { FC, useEffect } from 'react';
import { FormProvider, SubmitHandler, useForm } from 'react-hook-form';
import { object, string } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import FormInput from '../../components/FormInput';
import { addShippingAddress } from '../../redux/features/cartSlice';
import { useAppDispatch, useAppSelector } from '../../redux/store';
import { useNavigate } from 'react-router-dom';

interface IShippingAddressPageProps {
  setActiveStep: (activeStep: number) => void;
}

export interface IShippingAddress {
  address: string;
  address2?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

const ShippingAddressSchema = object({
  address: string().nonempty('Address is required').max(100),
  address2: string().max(100).optional(),
  city: string().nonempty('City is required'),
  state: string().nonempty('State is required').length(2),
  zipCode: string().nonempty('Zip code is required').length(5),
  country: string().nonempty('Country is required'),
});

const ShippingAddressPage: FC<IShippingAddressPageProps> = ({
  setActiveStep,
}) => {
  const cart = useAppSelector((state) => state.cart);
  const navigate = useNavigate();
  const defaultValues = cart.shippingAddress;
  const dispatch = useAppDispatch();
  const methods = useForm<IShippingAddress>({
    defaultValues,
    resolver: zodResolver(ShippingAddressSchema),
  });

  const onSubmitHandler: SubmitHandler<IShippingAddress> = async (data) => {
    await dispatch(addShippingAddress(data));
    setActiveStep(1);
  };

  useEffect(() => {
    if (methods.formState.isSubmitSuccessful) {
      methods.reset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [methods.formState.isSubmitSuccessful]);

  useEffect(() => {
    if (cart.cartItems.length === 0) {
      navigate('/');
    }
  }, [cart.cartItems, navigate]);

  return (
    <Box display='flex' justifyContent='center'>
      <FormProvider {...methods}>
        <Box
          component='form'
          noValidate
          onSubmit={methods.handleSubmit(onSubmitHandler)}
          maxWidth='40rem'
        >
          <Typography variant='h4' component='h1' sx={{ mb: '3rem' }}>
            Shipping Address
          </Typography>
          <FormInput
            name='address'
            label='Street address or P.O. Box'
            fullWidth
            focused
          />
          <FormInput
            name='address2'
            label='Apt, suite, unit, building, floor, etc.'
            fullWidth
            focused
          />
          <Box display='flex' columnGap={1}>
            <FormInput name='city' label='City' focused fullWidth />
            <FormInput name='state' label='State' focused fullWidth />
            <FormInput name='zipCode' label='Zip Code' focused fullWidth />
            <FormInput name='country' label='Country' focused fullWidth />
          </Box>
          <Box display='flex' justifyContent='center'>
            <Button
              variant='contained'
              type='submit'
              sx={{ width: { sx: '60%', md: '40%' }, py: '0.8rem' }}
            >
              Next
            </Button>
          </Box>
        </Box>
      </FormProvider>
    </Box>
  );
};

export default ShippingAddressPage;
