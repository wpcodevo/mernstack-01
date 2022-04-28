import { Container } from '@mui/material';
import { useState } from 'react';
import CheckoutSteps from '../../components/Checkout-steps';
import PlaceOrderPage from './placeorder.page';
import PaymentPage from './payment.page';
import ShippingAddressPage from './shipping-address.page';

const CheckoutPage = () => {
  const [activeStep, setActiveStep] = useState(0);
  return (
    <Container>
      <CheckoutSteps activeStep={activeStep} />

      {activeStep === 0 && (
        <ShippingAddressPage setActiveStep={setActiveStep} />
      )}
      {activeStep === 1 && <PaymentPage setActiveStep={setActiveStep} />}
      {activeStep === 2 && <PlaceOrderPage setActiveStep={setActiveStep} />}
    </Container>
  );
};

export default CheckoutPage;
