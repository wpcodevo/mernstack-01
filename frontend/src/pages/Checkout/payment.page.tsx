import {
  Box,
  Button,
  FormControl,
  FormControlLabel,
  FormHelperText,
  FormLabel,
  Radio,
  RadioGroup,
  Typography,
} from '@mui/material';
import { FC, useEffect } from 'react';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { object, string } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAppDispatch, useAppSelector } from '../../redux/store';
import { addPaymentMethod } from '../../redux/features/cartSlice';
import { useNavigate } from 'react-router-dom';

interface IPaymentPageProps {
  setActiveStep: (activeStep: number) => void;
}

export interface IPaymentMethod {
  paymentMethod: string;
}

const paymentSchema = object({
  paymentMethod: string().nonempty('Payment Method is required'),
});

const PaymentPage: FC<IPaymentPageProps> = ({ setActiveStep }) => {
  const dispatch = useAppDispatch();
  const cart = useAppSelector((state) => state.cart);
  const navigate = useNavigate();
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<IPaymentMethod>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      paymentMethod: 'PayPal',
    },
  });

  useEffect(() => {
    if (cart.cartItems.length === 0) {
      navigate('/');
    }
  }, [cart.cartItems, navigate]);

  const onSubmitHandler: SubmitHandler<IPaymentMethod> = async (data) => {
    await dispatch(addPaymentMethod(data));
    setActiveStep(2);
  };
  return (
    <Box display='flex' justifyContent='center' sx={{ mt: '4rem' }}>
      <Box
        component='form'
        noValidate
        maxWidth='40rem'
        onSubmit={handleSubmit(onSubmitHandler)}
      >
        <Typography variant='h4' component='h1' sx={{ mb: '2rem' }}>
          Payment
        </Typography>

        <FormControl component='fieldset' error={!!errors.paymentMethod}>
          <FormLabel component='legend'>Choose Payment Method</FormLabel>
          <Controller
            name='paymentMethod'
            control={control}
            render={({ field }) => (
              <>
                <RadioGroup {...field}>
                  <FormControlLabel
                    value='PayPal'
                    control={<Radio />}
                    label='PayPal or Credit Card'
                  />
                  <FormControlLabel
                    value='Stripe'
                    control={<Radio />}
                    label='Strip'
                  />
                </RadioGroup>
                <FormHelperText>
                  {errors.paymentMethod ? errors.paymentMethod.message : ''}
                </FormHelperText>
              </>
            )}
          />
        </FormControl>
        <Box display='flex' justifyContent='center' sx={{ mt: '2rem' }}>
          <Button
            variant='outlined'
            onClick={() => setActiveStep(0)}
            type='button'
            sx={{ width: '40%', mr: '1rem' }}
          >
            Prev
          </Button>
          <Button variant='contained' type='submit' sx={{ width: '60%' }}>
            Next
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default PaymentPage;
