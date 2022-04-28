import {
  Button,
  Card,
  CardActions,
  CardContent,
  CardMedia,
  Grid,
  Skeleton,
  Typography,
} from '@mui/material';
import { FC, useCallback, useState } from 'react';
import { Link } from 'react-router-dom';
import { usePrefetch } from '../../redux/api/products/productsApi';
import { IProduct } from '../../redux/api/products/types';
import { addToCart } from '../../redux/features/cartSlice';
import { useAppDispatch, useAppSelector } from '../../redux/store';
import Rating from '../Rating';

interface IProductItem {
  product: IProduct;
}

const ProductItem: FC<IProductItem> = ({ product }) => {
  const dispatch = useAppDispatch();
  const cart = useAppSelector((state) => state.cart);
  const prefetchProduct = usePrefetch('getProduct');

  const addItemToCart = useCallback(
    (product: IProduct) => dispatch(addToCart(product)),
    [dispatch]
  );

  const [imageLoading, setImageLoading] = useState(true);

  const imageLoaded = () => setImageLoading(false);
  const existingItem = cart.cartItems.find((item) => item._id === product._id);

  const onPrefetchProduct = () => {
    prefetchProduct(product._id, {
      ifOlderThan: 20,
    });
  };

  return (
    <Grid item xs={12} sm={6} md={4} lg={3}>
      <Card>
        <Link to={`products/${product._id}`}>
          <CardMedia
            component='img'
            height='200px'
            width='200px'
            image={product.imageCover}
            alt={product.name}
            onLoad={imageLoaded}
            sx={{ objectFit: 'contain' }}
            style={{ display: imageLoading ? 'none' : 'block' }}
            onMouseOver={onPrefetchProduct}
          />
        </Link>
        <Skeleton
          height='200px'
          animation='wave'
          variant='rectangular'
          style={{ display: imageLoading ? 'block' : 'none' }}
        />
        <CardContent sx={{ pb: 0 }}>
          <Link
            to={`/products/${product._id}`}
            style={{ textDecoration: 'none', color: 'inherit' }}
          >
            <Typography gutterBottom variant='h6' component='h2'>
              {product.name}
            </Typography>
          </Link>
          <Typography variant='body1' gutterBottom sx={{ height: '3rem' }}>
            {product.description.length > 45
              ? product.description.substring(0, 45) + '...'
              : product.description}
          </Typography>
          <Rating
            value={product.avgRating}
            text={`${product.numRating} reviews`}
          />
        </CardContent>
        <CardActions>
          <Button
            onClick={() => addItemToCart(product)}
            variant='contained'
            sx={{ py: '0.7rem' }}
            disabled={
              existingItem
                ? existingItem.quantity! >= product.countInStock
                : product.countInStock === 0
                ? true
                : false
            }
            fullWidth
          >
            {product.countInStock === 0 ? 'OUT OF STOCK' : 'Add To Cart'}
          </Button>
        </CardActions>
      </Card>
    </Grid>
  );
};

export default ProductItem;
