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
import { useEffect } from 'react';
import CloseIcon from '@mui/icons-material/Close';
import { useNavigate } from 'react-router-dom';
import Loader from '../../components/Loader';
import { toast } from 'react-toastify';
import { useGetAllOrdersQuery } from '../../redux/api/orders/orderApi';
import { format, parseISO } from 'date-fns';

const StyledButton = styled(Button)`
  padding: 0.8rem;
  background-color: white;
  color: #222;

  &:hover {
    background-color: #222;
    color: white;
  }
`;

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

const OrderListPage = () => {
  const { isLoading, isError, error, data: orders } = useGetAllOrdersQuery();

  const navigate = useNavigate();

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

  return (
    <Container>
      <Box display='flex' justifyContent='space-between' sx={{ mb: 5 }}>
        <Typography variant='h4' component='h1'>
          Orders
        </Typography>
        {isLoading && <Loader color='primary' size='1.5rem' sx={{ mr: 6 }} />}
      </Box>
      <TableContainer component={Paper}>
        <Table aria-label='orders table'>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>USER</TableCell>
              <TableCell>TOTAL QUANTITY</TableCell>
              <TableCell>PAYMENT METHOD</TableCell>
              <TableCell>TOTAL AMOUNT</TableCell>
              <TableCell>PAID</TableCell>
              <TableCell>DELIVERED</TableCell>
              <TableCell></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {orders?.map((order) => (
              <StyledTableRow key={order._id}>
                <StyledTableCell component='th' scope='row'>
                  {order._id}
                </StyledTableCell>
                <StyledTableCell>{order.user.name}</StyledTableCell>
                <StyledTableCell align='center'>
                  <strong>{order.totalQuantity}</strong>
                </StyledTableCell>
                <StyledTableCell align='center'>
                  <strong>{order.paymentMethod}</strong>
                </StyledTableCell>
                <StyledTableCell align='center'>
                  <strong>${order.totalAmount}</strong>
                </StyledTableCell>
                <StyledTableCell align='center'>
                  {order.isPaid ? (
                    format(parseISO(order.paidAt), 'PPP')
                  ) : (
                    <IconButton sx={{ color: '#f70001' }}>
                      <CloseIcon />
                    </IconButton>
                  )}
                </StyledTableCell>

                <StyledTableCell align='center'>
                  {order.isDelivered ? (
                    format(parseISO(order.deliveredAt), 'PPP')
                  ) : (
                    <IconButton sx={{ color: '#f70001' }}>
                      <CloseIcon />
                    </IconButton>
                  )}
                </StyledTableCell>
                <StyledTableCell>
                  <StyledButton
                    onClick={() => navigate(`/orders/${order._id}`)}
                    variant='contained'
                  >
                    Details
                  </StyledButton>
                </StyledTableCell>
              </StyledTableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
};

export default OrderListPage;
