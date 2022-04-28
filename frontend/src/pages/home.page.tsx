import { FC } from 'react';
import { Container, Grid } from '@mui/material';
import { useGetProductsQuery } from '../redux/api/products/productsApi';
import ProductItem from '../components/ProductItem/ProductItem';
import ProductItemSkeleton from '../components/ProductItem/ProductItemSkeleton';

const HomePage: FC = () => {
  const { isLoading, data: products } = useGetProductsQuery();

  return (
    <Container maxWidth='xl' sx={{ my: '2rem' }}>
      <Grid container spacing={4}>
        {isLoading
          ? Array.from(new Array(6).keys()).map((_, i) => (
              <ProductItemSkeleton key={i} />
            ))
          : products?.map((product) => (
              <ProductItem key={product._id} product={product} />
            ))}
      </Grid>
    </Container>
  );
};

export default HomePage;
