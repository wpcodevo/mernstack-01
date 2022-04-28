import { Button, Grid } from '@mui/material';
import { FC } from 'react';

interface ICheckoutStepsProps {
  activeStep: number;
}

const CheckoutSteps: FC<ICheckoutStepsProps> = ({ activeStep }) => {
  return (
    <Grid container justifyContent='center'>
      <Grid item container maxWidth='40rem'>
        <Grid item xs={6} md={3} sx={{ textAlign: 'center' }}>
          <Button>Sign In</Button>
        </Grid>
        <Grid item xs={6} md={3} sx={{ textAlign: 'center' }}>
          {activeStep >= 0 ? (
            <Button>Shipping</Button>
          ) : (
            <Button disabled>Shipping</Button>
          )}
        </Grid>
        <Grid item xs={6} md={3} sx={{ textAlign: 'center' }}>
          {activeStep >= 1 ? (
            <Button>Payment</Button>
          ) : (
            <Button disabled>Payment</Button>
          )}
        </Grid>
        <Grid item xs={6} md={3} sx={{ textAlign: 'center' }}>
          {activeStep >= 2 ? (
            <Button>Order Summary</Button>
          ) : (
            <Button disabled>Order Summary</Button>
          )}
        </Grid>
      </Grid>
    </Grid>
  );
};

export default CheckoutSteps;
