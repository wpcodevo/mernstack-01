import {
  FormControl,
  Grid,
  IconButton,
  MenuItem,
  Select,
  SelectChangeEvent,
  Skeleton,
  Typography,
} from '@mui/material';
import { FC, useState } from 'react';
import { Link } from 'react-router-dom';
import DeleteIcon from '@mui/icons-material/Delete';
import { IProduct } from '../../redux/api/products/types';
import {
  addItemQtyToCart,
  clearItemFromCart,
} from '../../redux/features/cartSlice';
import { useAppDispatch } from '../../redux/store';
import addDecimal from '../../Helpers/addDecimal';

interface ICartItem {
  cartItem: IProduct;
}

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 100,
    },
  },
};

const CartItem: FC<ICartItem> = ({ cartItem }) => {
  const dispatch = useAppDispatch();
  const [imageLoading, setImageLoading] = useState(true);

  const imageLoaded = () => {
    setImageLoading(false);
  };

  const onChangeAddItem = (e: SelectChangeEvent<number>) =>
    dispatch(
      addItemQtyToCart({
        product: cartItem,
        qty: Number(e.target.value),
      })
    );

  const removeItemFromCart = (cartItem: IProduct) => {
    dispatch(clearItemFromCart(cartItem));
  };

  return (
    <Grid container item columnSpacing={2} alignItems='center'>
      <Grid item md={2} sx={{ textAlign: 'center' }}>
        <Link to={`/products/${cartItem._id}`}>
          <img
            src={cartItem.imageCover}
            style={{
              objectFit: 'contain',
              height: '5.5rem',
              width: '5.5rem',
              display: imageLoading ? 'none' : 'block',
            }}
            alt={cartItem.name}
            onLoad={imageLoaded}
          />
        </Link>
        <Skeleton
          variant='rectangular'
          animation='wave'
          style={{
            display: imageLoading ? 'block' : 'none',
            height: '5.5rem',
            width: '5.5rem',
          }}
        />
      </Grid>
      <Grid item md={4}>
        <Link
          to={`/products/${cartItem._id}`}
          style={{ textDecoration: 'none', color: 'inherit' }}
        >
          <Typography variant='h6' component='h3' gutterBottom>
            {cartItem.name.length > 25
              ? cartItem.name.substring(0, 30) + '...'
              : cartItem.name}
          </Typography>
        </Link>
        <Typography variant='body2'>
          {cartItem.description.length > 55
            ? cartItem.description.substring(0, 55) + '...'
            : cartItem.description}
        </Typography>
      </Grid>
      <Grid item container md={3} alignItems='center'>
        <Grid item xs={3}>
          <Typography>Qty: </Typography>
        </Grid>
        <Grid item xs={9}>
          <FormControl sx={{ minWidth: 100 }}>
            <Select
              value={cartItem.quantity}
              onChange={onChangeAddItem}
              displayEmpty
              autoWidth
              defaultValue={0}
              MenuProps={MenuProps}
            >
              {Array.from(new Array(cartItem.countInStock).keys()).map((x) => (
                <MenuItem key={x + 1} value={x + 1}>
                  {x + 1}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      </Grid>
      <Grid item md={2}>
        <Typography variant='h6'>${addDecimal(cartItem.price)}</Typography>
      </Grid>
      <Grid item md={1}>
        <IconButton
          onClick={() => removeItemFromCart(cartItem)}
          sx={{ color: '#f70001', mr: 1 }}
        >
          <DeleteIcon />
        </IconButton>
      </Grid>
    </Grid>
  );
};

export default CartItem;
