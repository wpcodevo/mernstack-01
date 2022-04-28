import {
  Box,
  Button,
  Divider,
  Drawer,
  Grid,
  IconButton,
  Typography,
} from '@mui/material';
import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from '@mui/icons-material';
import { styled, useTheme } from '@mui/material/styles';
import {
  clearCart,
  getTotals,
  toggleCartDrawer,
} from '../../redux/features/cartSlice';
import { useAppDispatch, useAppSelector } from '../../redux/store';
import CartDrawerItem from './CartDrawerItem';

const drawerWidth = 350;

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
  justifyContent: 'flex-start',
}));

const CartDrawer = () => {
  const dispatch = useAppDispatch();
  const cart = useAppSelector((state) => state.cart);
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();

  const closeDrawer = () => {
    dispatch(toggleCartDrawer());
  };

  const clearCartItems = () => {
    dispatch(clearCart());
  };

  useEffect(() => {
    dispatch(getTotals());
  }, [cart, dispatch]);

  return (
    <Drawer
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
        },
      }}
      variant='persistent'
      anchor='right'
      open={cart.showCartDrawer}
    >
      <DrawerHeader>
        <IconButton onClick={closeDrawer}>
          {theme.direction === 'rtl' ? <ChevronLeft /> : <ChevronRight />}
        </IconButton>
      </DrawerHeader>
      <Divider />
      {cart.cartItems.length > 0 ? (
        <>
          <Grid container rowSpacing={2} sx={{ p: '1rem' }}>
            {cart.cartItems.map((cartItem) => (
              <CartDrawerItem key={cartItem._id} cartItem={cartItem} />
            ))}
          </Grid>

          <Box sx={{ mt: '2rem', px: '1rem' }}>
            <Button
              sx={{ py: '0.8rem', mb: '1rem' }}
              onClick={() => {
                navigate('/cart', { state: location });
                closeDrawer();
              }}
              fullWidth
              variant='contained'
              type='button'
            >
              GO TO CART
            </Button>
            <Button
              onClick={clearCartItems}
              sx={{ py: '0.8rem' }}
              fullWidth
              variant='contained'
              type='button'
            >
              CLEAR CART
            </Button>
          </Box>
        </>
      ) : (
        <Box sx={{ textAlign: 'center', mt: '50%' }}>
          <Typography variant='h6'>Cart is Empty</Typography>
        </Box>
      )}
    </Drawer>
  );
};

export default CartDrawer;
