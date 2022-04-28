import {
  Button,
  Card,
  Container,
  Divider,
  Grid,
  List,
  ListItem,
  Typography,
} from '@mui/material';
import { useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import CartItem from '../components/Cart/CartItem';
import FullScreenProgress from '../components/FullScreenProgress';
import Message from '../components/Message';
import addDecimal from '../Helpers/addDecimal';
import useQuery from '../Helpers/useQuery';
import { productsApi } from '../redux/api/products/productsApi';
import { addItemQtyToCart } from '../redux/features/cartSlice';
import { useAppDispatch, useAppSelector } from '../redux/store';

const CartPage = () => {
  const { id } = useParams();
  const query = useQuery();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const cart = useAppSelector((state) => state.cart);
  const qty = Number(query.get('qty'));
  const { data: product } = productsApi.endpoints.getProduct.useQuery(id!, {
    skip: !id,
  });

  useEffect(() => {
    if (product) {
      dispatch(addItemQtyToCart({ product, qty }));
    }
  }, [dispatch, product, qty]);

  if (id && !product) {
    return <FullScreenProgress />;
  }

  return (
    <Container maxWidth='lg'>
      <Typography variant='h4' component='h1' sx={{ mb: 3 }}>
        Your Shopping Cart
      </Typography>
      {cart.cartItems.length === 0 ? (
        <Message type='info' title='Info'>
          Your cart is empty{' '}
          <Link style={{ color: 'inherit' }} to='/'>
            <strong>Go to Products Page</strong>
          </Link>
        </Message>
      ) : (
        <Grid container columnSpacing={2}>
          <Grid item container md={9} rowSpacing={2}>
            {cart.cartItems.map((item) => (
              <CartItem key={item._id} cartItem={item} />
            ))}
          </Grid>
          <Grid item md={3}>
            <Card elevation={0} sx={{ border: '1px solid #f1f1f1' }}>
              <List>
                <ListItem>
                  <Typography variant='h6'>
                    SubTotal ({cart.numOfItemsInCart}) Items
                  </Typography>
                </ListItem>
                <Divider variant='middle' />
                <ListItem
                  sx={{ display: 'flex', justifyContent: 'space-between' }}
                >
                  <Typography>Subtotal:</Typography>
                  <Typography sx={{ mr: 1 }}>
                    <strong>$ {addDecimal(cart.totalItemsPrice)}</strong>
                  </Typography>
                </ListItem>
                <Divider variant='middle' />
                <ListItem>
                  <Button
                    variant='contained'
                    fullWidth
                    disabled={cart.cartItems.length === 0}
                    onClick={() => navigate('/checkout')}
                    sx={{ py: '.8rem' }}
                  >
                    GO TO CHECKOUT
                  </Button>
                </ListItem>
              </List>
            </Card>
          </Grid>
        </Grid>
      )}
    </Container>
  );
};

export default CartPage;
