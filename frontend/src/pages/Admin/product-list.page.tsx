import {
  Box,
  Button,
  Container,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  tableCellClasses,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useEffect, useState } from 'react';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { useNavigate } from 'react-router-dom';
import Loader from '../../components/Loader';
import { toast } from 'react-toastify';
import AddIcon from '@mui/icons-material/Add';
import {
  useDeleteProductMutation,
  useGetProductsQuery,
} from '../../redux/api/products/productsApi';
import Rating from '../../components/Rating';
import CategoryModal from '../../components/Modals/category.modal';
import CreateCategory from '../../components/Admin/create-category.component';

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: theme.palette.common.black,
    color: theme.palette.common.white,
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(odd)': {
    backgroundColor: theme.palette.action.hover,
  },
  // hide last border
  '&:last-child td, &:last-child th': {
    border: 0,
  },
}));

const ProductListPage = () => {
  const [openCategory, setOpenCategory] = useState(false);
  const { isLoading, isError, error, data: products } = useGetProductsQuery();

  const navigate = useNavigate();
  const [
    deleteProduct,
    {
      isLoading: isDeleteLoading,
      isSuccess: isDeleteProductSuccess,
      isError: isDeleteProductError,
      error: productDeleteError,
    },
  ] = useDeleteProductMutation();

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading]);

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

    if (isDeleteProductSuccess) {
      toast.success(`Product deleted`);
    }

    if (isDeleteProductError) {
      if (Array.isArray((productDeleteError as any).data.error)) {
        (productDeleteError as any).data.error.forEach((el: any) =>
          toast.error(el.message, {
            position: 'top-right',
          })
        );
      } else {
        toast.error((productDeleteError as any).data.message, {
          position: 'top-right',
        });
      }
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDeleteLoading, isLoading]);

  const onDeleteHandler = (id: string) => {
    if (window.confirm('Are you sure')) {
      deleteProduct(id);
    }
  };

  return (
    <Container>
      <Box display='flex' justifyContent='space-between' sx={{ mb: 5 }}>
        <Typography variant='h4' component='h1'>
          Products
        </Typography>
        <div style={{ display: 'flex' }}>
          {(isDeleteLoading || isLoading) && (
            <Loader color='primary' size='1.5rem' sx={{ mr: 6 }} />
          )}
          <div>
            <Button
              variant='contained'
              sx={{
                backgroundColor: '#222',
                color: 'white',
                py: '0.8rem',
                mr: 2,
              }}
              onClick={() => setOpenCategory(true)}
            >
              <AddIcon /> Create Category
            </Button>
            <Button
              variant='contained'
              sx={{ backgroundColor: '#222', color: 'white', py: '0.8rem' }}
              onClick={() => navigate('/admin/products/create')}
            >
              <AddIcon /> Create Product
            </Button>
          </div>
        </div>
      </Box>
      <TableContainer component={Paper}>
        <Table aria-label='orders table'>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>NAME</TableCell>
              <TableCell>PRICE</TableCell>
              <TableCell>COUNT IN STOCK</TableCell>
              <TableCell>CATEGORY</TableCell>
              <TableCell>RATING</TableCell>
              <TableCell></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {products?.map((product) => (
              <StyledTableRow key={product._id}>
                <StyledTableCell component='th' scope='row'>
                  {product._id}
                </StyledTableCell>
                <StyledTableCell>{product.name}</StyledTableCell>
                <StyledTableCell>
                  <strong>${product.price}</strong>
                </StyledTableCell>
                <StyledTableCell align='center'>
                  {product.countInStock !== 0 ? (
                    product.countInStock
                  ) : (
                    <IconButton sx={{ color: '#f70001' }}>
                      <CloseIcon />
                    </IconButton>
                  )}
                </StyledTableCell>
                <StyledTableCell>{product.category?.name}</StyledTableCell>
                <StyledTableCell>
                  <Rating value={product.avgRating} />
                </StyledTableCell>
                <StyledTableCell>
                  <Box display='flex' alignItems='center'>
                    <Box
                      display='flex'
                      alignItems='center'
                      justifyContent='center'
                      sx={{
                        width: '2rem',
                        height: '2rem',
                        backgroundColor: 'white',
                        mr: 1,
                        boxShadow: '0 5px 10px rgba(0,0,0,.2)',
                        borderRadius: '3px',
                      }}
                      onClick={() =>
                        navigate(`/admin/products/${product._id}/edit`)
                      }
                    >
                      <IconButton size='small'>
                        <EditIcon fontSize='inherit' />
                      </IconButton>
                    </Box>
                    <Box
                      display='flex'
                      alignItems='center'
                      justifyContent='center'
                      sx={{
                        backgroundColor: '#f7005f',
                        width: '2rem',
                        height: '2rem',
                        boxShadow: '0 5px 10px rgba(0,0,0,.2)',
                        borderRadius: '3px',
                      }}
                      onClick={() => onDeleteHandler(product._id)}
                    >
                      <IconButton size='small' sx={{ color: 'white' }}>
                        <DeleteIcon fontSize='inherit' />
                      </IconButton>
                    </Box>
                  </Box>
                </StyledTableCell>
              </StyledTableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Modals */}
      <CategoryModal
        openCategory={openCategory}
        setOpenCategory={setOpenCategory}
      >
        <CreateCategory setOpenCategory={setOpenCategory} />
      </CategoryModal>
    </Container>
  );
};

export default ProductListPage;
