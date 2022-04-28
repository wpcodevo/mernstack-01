import {
  Box,
  Button,
  Card,
  Container,
  Divider,
  FormControl,
  Grid,
  List,
  ListItem,
  MenuItem,
  Select,
  Skeleton,
  Typography,
} from '@mui/material';
import { useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import FullScreenProgress from '../components/FullScreenProgress';
import Rating from '../components/Rating';
import addDecimal from '../Helpers/addDecimal';
import { productsApi } from '../redux/api/products/productsApi';
import { useAppSelector } from '../redux/store';

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

const ProductDetailsPage = () => {
  const [imageLoading, setImageLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const { productId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const cart = useAppSelector((state) => state.cart);
  const { isLoading, data: product } =
    productsApi.endpoints.getProduct.useQuery(productId!, {
      skip: !productId,
    });

  const imageLoaded = () => {
    setImageLoading(false);
  };

  const productInCart = cart.cartItems.find((item) => item._id === productId);

  if (isLoading || !product) {
    return <FullScreenProgress />;
  }

  return (
    <Container maxWidth='lg' sx={{ mt: '2rem' }}>
      <Box sx={{ mb: '2rem' }}>
        <Link to='/'>Go Back</Link>
      </Box>
      <Grid container spacing={3}>
        <Grid
          item
          xs={12}
          md={5}
          sx={{
            height: '35rem',
            textAlign: 'center',
            border: '1px solid #C4C4C4',
          }}
        >
          <img
            src={product.imageCover}
            style={{
              objectFit: 'contain',
              height: '100%',
              width: '100%',
              display: imageLoading ? 'none' : 'block',
            }}
            alt={product.name}
            onLoad={imageLoaded}
          />
          <Skeleton
            variant='rectangular'
            animation='wave'
            style={{ display: imageLoading ? 'block' : 'none', height: '100%' }}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <div style={{ backgroundColor: '#fff' }}>
            <List>
              <ListItem>
                <Typography variant='h4' component='h2'>
                  {product?.name}
                </Typography>
              </ListItem>
              <Divider variant='middle' />
              <ListItem>
                <Rating
                  value={product.avgRating!}
                  text={`${product.numRating} reviews`}
                />
              </ListItem>
              <Divider variant='middle' />
              <ListItem>
                <Typography>Price: $ {addDecimal(product.price)}</Typography>
              </ListItem>
              <Divider variant='middle' />
              <ListItem>
                <Typography variant='body1'>
                  Description: {product.description}
                </Typography>
              </ListItem>
            </List>
          </div>
        </Grid>
        <Grid item md={3}>
          <Card elevation={0} sx={{ border: '1px solid #f1f1f1' }}>
            <List>
              <ListItem>
                <Grid container item>
                  <Grid item xs={6}>
                    <Typography>Price: </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography>
                      <strong>$ {addDecimal(product.price)}</strong>
                    </Typography>
                  </Grid>
                </Grid>
              </ListItem>
              <Divider variant='middle' />
              <ListItem>
                <Grid container item>
                  <Grid item xs={6}>
                    <Typography>Status: </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography>
                      {product.countInStock > 0
                        ? `In Stock (${product.countInStock})`
                        : 'Out Of Stock'}
                    </Typography>
                  </Grid>
                </Grid>
              </ListItem>
              <Divider variant='middle' />
              {product.countInStock > 0 &&
                (productInCart?.quantity! >= product.countInStock || true) && (
                  <ListItem>
                    <Grid container item>
                      <Grid item xs={6}>
                        <Typography>Qty: </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <FormControl sx={{ minWidth: 100 }}>
                          <Select
                            value={qty}
                            onChange={(e) => setQty(e.target.value as number)}
                            displayEmpty
                            autoWidth
                            defaultValue={0}
                            MenuProps={MenuProps}
                          >
                            {Array.from(
                              new Array(product.countInStock).keys()
                            ).map((x) => (
                              <MenuItem key={x + 1} value={x + 1}>
                                {x + 1}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>
                    </Grid>
                  </ListItem>
                )}
              <ListItem>
                <Button
                  variant='contained'
                  onClick={() =>
                    navigate(`/cart/${product._id}?qty=${qty}`, {
                      state: location,
                    })
                  }
                  fullWidth
                  type='button'
                  sx={{ py: '.8rem' }}
                  disabled={product.countInStock === 0}
                >
                  {product.countInStock === 0 ? 'OUT OF STOCK' : 'ADD TO CART'}
                </Button>
              </ListItem>
            </List>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default ProductDetailsPage;
