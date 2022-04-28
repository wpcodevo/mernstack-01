import {
  Box,
  Card,
  CardActions,
  CardContent,
  Grid,
  Skeleton,
  Typography,
} from '@mui/material';
import { FC } from 'react';

const ProductItemSkeleton: FC = () => {
  return (
    <Grid item xs={12} sm={6} md={4} lg={3}>
      <Card>
        <Skeleton variant='rectangular' height='200px' animation='wave' />
        <CardContent>
          <Typography gutterBottom>
            <Skeleton animation='wave' />
          </Typography>
          <Typography gutterBottom>
            <Skeleton animation='wave' />
            <Skeleton animation='wave' width='30%' />
          </Typography>
          <Box display='flex' alignItems='center'>
            <Skeleton animation='wave' width='150px' sx={{ mr: '0.5rem' }} />
            <Skeleton animation='wave' width='60px' />
          </Box>
        </CardContent>
        <CardActions>
          <Skeleton
            animation='wave'
            variant='rectangular'
            width='100%'
            height='46px'
          />
        </CardActions>
      </Card>
    </Grid>
  );
};

export default ProductItemSkeleton;
