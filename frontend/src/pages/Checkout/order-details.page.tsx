import { Link, useParams } from 'react-router-dom';
import {
  useGetOrderQuery,
  useUpdateOrderToDeliveredMutation,
  useUpdateOrderToPaidMutation,
} from '../../redux/api/orders/orderApi';
import FullScreenProgress from '../../components/FullScreenProgress';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { Box, Container, Grid, Stack, Typography } from '@mui/material';
import MuiLink from '@mui/material/Link';
import Message from '../../components/Message';
import addDecimal from '../../Helpers/addDecimal';
import Loader from '../../components/Loader';
import { IOrderPaidRequest } from '../../redux/api/orders/types';
import { PayPalButton } from 'react-paypal-button-v2';
import { useAppSelector } from '../../redux/store';
import { LoadingButton } from '@mui/lab';
import { format, parseISO } from 'date-fns';

const OrderDetailsPage = () => {
  const [sdkReady, setSdkReady] = useState(false);
  const user = useAppSelector((state) => state.authUser.user);
  const { orderId } = useParams();

  const {
    isLoading,
    isError,
    error,
    data: order,
  } = useGetOrderQuery(orderId!, {
    skip: !orderId,
  });

  const [
    updateOrderToPaid,
    { isLoading: isLoadingPay, isSuccess: isSuccessPay, isError: isErrorPay },
  ] = useUpdateOrderToPaidMutation();

  const [
    updateOrderToDelivered,
    {
      isLoading: isDeliveredLoading,
      isError: isDeliveredError,
      error: deliveredError,
      isSuccess: isDeliveredSuccess,
    },
  ] = useUpdateOrderToDeliveredMutation();

  useEffect(() => {
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

    if (isSuccessPay) {
      toast.success('Order paid successfully');
    }

    if (isDeliveredSuccess) {
      toast.success('Order marked as delivered');
    }

    if (isErrorPay) {
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

    if (isDeliveredError) {
      if (Array.isArray((deliveredError as any).data.error)) {
        (deliveredError as any).data.error.forEach((el: any) =>
          toast.error(el.message, {
            position: 'top-right',
          })
        );
      } else {
        toast.error((deliveredError as any).data.message, {
          position: 'top-right',
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, isDeliveredLoading, isLoadingPay]);

  const onApprovalHandler = (paymentResult: IOrderPaidRequest) => {
    updateOrderToPaid({ orderId: orderId!, paymentResult });
  };

  const onDeliveredHandler = (id: string) => {
    updateOrderToDelivered(id);
  };

  if (isLoading) {
    return <FullScreenProgress />;
  }

  return (
    <Container sx={{ mt: '3rem' }}>
      <Typography variant='h4' component='h1'>
        Order: {order?._id}
      </Typography>
      <Grid container spacing={2} sx={{ mt: '1rem' }}>
        <Grid item xs={12} md={8}>
          <Stack spacing={2} sx={{ mb: 4 }}>
            <Typography variant='h5' component='h2'>
              SHIPPING ADDRESS
            </Typography>
            <Typography>
              <strong>Name:</strong> {order?.user.name}
            </Typography>
            <Typography>
              <strong>Email:</strong>{' '}
              <MuiLink href={`mailto:${order?.user.email}`}>
                {order?.user.email}
              </MuiLink>
            </Typography>
            <Typography>
              {order?.shippingAddress.address},{' '}
              {order?.shippingAddress.address2}, {order?.shippingAddress.city},{' '}
              {order?.shippingAddress.state}, {order?.shippingAddress.zipCode},{' '}
              {order?.shippingAddress.country}
            </Typography>
            {order?.isDelivered ? (
              <Message type='success' sx={{ width: '80%' }} title='Success'>
                Delivered At - {format(parseISO(order?.deliveredAt), 'PPP')}
              </Message>
            ) : (
              <Message type='error' sx={{ width: '80%' }} title='Info'>
                Order Not Delivered
              </Message>
            )}
          </Stack>
          <Stack spacing={2} sx={{ mb: 4 }}>
            <Typography variant='h5' component='h2'>
              PAYMENT METHOD
            </Typography>
            <Typography>Method: {order?.paymentMethod} </Typography>
            {order?.isPaid ? (
              <Message type='success' sx={{ width: '80%' }} title='Success'>
                Paid At - {format(parseISO(order?.paidAt), 'PPP')}
              </Message>
            ) : (
              <Message type='error' sx={{ width: '80%' }} title='Info'>
                Not Paid
              </Message>
            )}
          </Stack>
          <Stack spacing={2} sx={{ mb: 4 }}>
            <Typography variant='h5' component='h2'>
              ORDER ITEMS
            </Typography>
            <Grid container spacing={2}>
              {order?.orderItems.length === 0 ? (
                <Message type='info' sx={{ width: '80%' }} title='Info'>
                  Your order is empty{' '}
                  <Link style={{ color: 'inherit' }} to='/'>
                    <strong>Go to Products Page</strong>
                  </Link>
                </Message>
              ) : (
                order?.orderItems.map((orderItem) => (
                  <Grid
                    key={orderItem._id}
                    container
                    item
                    alignItems='center'
                    maxWidth='35rem'
                    className='order-cartItem-bb'
                  >
                    <Grid item xs={3}>
                      <img
                        style={{
                          height: '4rem',
                          width: '4rem',
                          objectFit: 'contain',
                        }}
                        src={orderItem.imageCover}
                        alt={orderItem.name}
                      />
                    </Grid>
                    <Grid item xs={5}>
                      {orderItem.name}
                    </Grid>
                    <Grid item xs={4}>
                      {orderItem.quantity} x ${orderItem.price} ={' '}
                      <strong>
                        ${addDecimal(orderItem.quantity! * orderItem.price)}{' '}
                      </strong>
                    </Grid>
                  </Grid>
                ))
              )}
            </Grid>
          </Stack>
        </Grid>
        <Grid item xs={12} md={4}>
          <Box sx={{ border: '1px solid #ebe9e9', p: 1 }}>
            <Box
              display='flex'
              className='orderSummary-bb'
              sx={{ alignItems: 'center', height: 70 }}
            >
              <Typography variant='h4' component='h3'>
                ORDER SUMMARY
              </Typography>
            </Box>

            <Box
              display='grid'
              alignItems='center'
              className='orderSummary-bb'
              sx={{
                alignItems: 'center',
                height: 40,
                gridTemplateColumns: '2fr 1fr',
              }}
            >
              <Typography>Items:</Typography>

              <Typography>${addDecimal(order?.itemsTotalPrice!)}</Typography>
            </Box>
            <Box
              display='grid'
              alignItems='center'
              className='orderSummary-bb'
              sx={{
                alignItems: 'center',
                height: 40,
                gridTemplateColumns: '2fr 1fr',
              }}
            >
              <Typography>Shipping</Typography>
              <Typography>${addDecimal(order?.shippingPrice!)}</Typography>
            </Box>
            <Box
              display='grid'
              alignItems='center'
              className='orderSummary-bb'
              sx={{
                alignItems: 'center',
                height: 40,
                gridTemplateColumns: '2fr 1fr',
              }}
            >
              <Typography>Tax:</Typography>
              <Typography>${addDecimal(order?.taxPrice!)}</Typography>
            </Box>
            <Box
              display='grid'
              alignItems='center'
              className='orderSummary-bb'
              sx={{
                alignItems: 'center',
                height: 40,
                gridTemplateColumns: '2fr 1fr',
              }}
            >
              <Typography>Total:</Typography>
              <Typography>${addDecimal(order?.totalAmount!)}</Typography>
            </Box>
            {/* Button */}
            {!order?.isPaid && (
              <Box alignItems='center'>
                {isLoadingPay && (
                  <Loader size='1rem' color='inherit' sx={{ py: 2 }} />
                )}
                {!sdkReady && (
                  <Loader size='1rem' color='inherit' sx={{ py: 2 }} />
                )}

                <PayPalButton
                  amount={order?.totalAmount}
                  onSuccess={onApprovalHandler}
                  onButtonReady={() => setSdkReady(true)}
                  options={{
                    clientId: process.env.REACT_APP_PAYPAL_CLIENT_ID,
                  }}
                />
              </Box>
            )}
            {user?.role === 'admin' && order?.isPaid && !order?.isDelivered && (
              <LoadingButton
                variant='contained'
                fullWidth
                sx={{ py: '0.8rem', backgroundColor: '#222' }}
                onClick={() => onDeliveredHandler(order._id)}
                loading={isDeliveredLoading}
              >
                Mark As Delivered
              </LoadingButton>
            )}
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
};

export default OrderDetailsPage;
