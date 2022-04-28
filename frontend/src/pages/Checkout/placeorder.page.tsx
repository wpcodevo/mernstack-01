import { Button, Grid, Stack, Typography } from '@mui/material';
import { FC, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Message from '../../components/Message';
import { useCreateOrderMutation } from '../../redux/api/orders/orderApi';
import { clearCart } from '../../redux/features/cartSlice';
import { useAppDispatch, useAppSelector } from '../../redux/store';
import addDecimal from '../../Helpers/addDecimal';
import './placeorder.styles.scss';

interface IPlaceOrderProps {
  setActiveStep: (activeStep: number) => void;
}

const PlaceOrderPage: FC<IPlaceOrderProps> = ({ setActiveStep }) => {
  const cart = useAppSelector((state) => state.cart);
  const [createOrder, { isLoading, data, isError, error, isSuccess }] =
    useCreateOrderMutation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const onSubmitHandler = () => {
    createOrder({
      itemsTotalPrice: cart.totalItemsPrice,
      totalAmount: cart.totalAmount,
      shippingAddress: cart.shippingAddress,
      shippingPrice: cart.shippingPrice,
      taxPrice: cart.taxPrice,
      paymentMethod: cart.paymentMethod.paymentMethod,
      orderItems: cart.cartItems,
      totalQuantity: cart.numOfItemsInCart,
    });
  };

  useEffect(() => {
    if (isSuccess) {
      dispatch(clearCart());
      navigate(`/orders/${data?.data.order._id}`);
      toast.success('Your order has been placed', {
        position: 'bottom-left',
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

  return (
    <Grid container spacing={2} sx={{ mt: '4rem' }}>
      <Grid item xs={12} md={8}>
        <Stack spacing={2} sx={{ mb: 4 }}>
          <Typography variant='h5' component='h2'>
            SHIPPING ADDRESS
          </Typography>
          <Typography>
            {cart.shippingAddress.address}, {cart.shippingAddress.address2},{' '}
            {cart.shippingAddress.city}, {cart.shippingAddress.state},{' '}
            {cart.shippingAddress.zipCode}, {cart.shippingAddress.country}
          </Typography>
        </Stack>
        <Stack spacing={2} sx={{ mb: 4 }}>
          <Typography variant='h5' component='h2'>
            PAYMENT METHOD
          </Typography>
          <Typography>Method: {cart.paymentMethod.paymentMethod} </Typography>
        </Stack>
        <Stack spacing={2} sx={{ mb: 4 }}>
          <Typography variant='h5' component='h2'>
            ORDER ITEMS
          </Typography>
          <Grid container spacing={2}>
            {cart.cartItems.length === 0 ? (
              <Message type='info' sx={{ width: '80%' }} title='Info'>
                Your cart is empty{' '}
                <Link style={{ color: 'inherit' }} to='/'>
                  <strong>Go to Products Page</strong>
                </Link>
              </Message>
            ) : (
              cart.cartItems.map((cartItem) => (
                <Grid
                  key={cartItem._id}
                  container
                  item
                  alignItems='center'
                  maxWidth='40rem'
                  className='order-cartItem-bb'
                >
                  <Grid item xs={3}>
                    <img
                      style={{
                        height: '4rem',
                        width: '4rem',
                        objectFit: 'contain',
                      }}
                      src={cartItem.imageCover}
                      alt={cartItem.name}
                    />
                  </Grid>
                  <Grid item xs={5}>
                    {cartItem.name}
                  </Grid>
                  <Grid item xs={4}>
                    {cartItem.quantity} x ${cartItem.price} ={' '}
                    <strong>
                      ${addDecimal(cartItem.quantity! * cartItem.price)}
                    </strong>
                  </Grid>
                </Grid>
              ))
            )}
          </Grid>
        </Stack>
        <Button
          variant='outlined'
          onClick={() => setActiveStep(1)}
          sx={{ py: '0.4rem' }}
        >
          Prev
        </Button>
      </Grid>
      <Grid
        item
        container
        xs={12}
        md={4}
        spacing={2}
        sx={{ border: '1px solid #ebe9e9', height: '25rem', p: 1 }}
      >
        <Grid item xs={12} className='orderSummary-bb'>
          <Typography variant='h4' component='h3'>
            ORDER SUMMARY
          </Typography>
        </Grid>

        <Grid item container xs={12} className='orderSummary-bb'>
          <Grid item xs={6}>
            <Typography>Items</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography>${addDecimal(cart.totalItemsPrice)}</Typography>
          </Grid>
        </Grid>
        <Grid item container xs={12} className='orderSummary-bb'>
          <Grid item xs={6}>
            <Typography>Shipping</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography>${addDecimal(cart.shippingPrice)}</Typography>
          </Grid>
        </Grid>
        <Grid item container xs={12} className='orderSummary-bb'>
          <Grid item xs={6}>
            <Typography>Tax</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography>${addDecimal(cart.taxPrice)}</Typography>
          </Grid>
        </Grid>
        <Grid item container xs={12} className='orderSummary-bb'>
          <Grid item xs={6}>
            <Typography>Total</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography>${addDecimal(cart.totalAmount)}</Typography>
          </Grid>
        </Grid>
        <Button
          variant='contained'
          fullWidth
          type='button'
          onClick={onSubmitHandler}
        >
          PLACE ORDER
        </Button>
      </Grid>
    </Grid>
  );
};

export default PlaceOrderPage;
