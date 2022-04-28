import {
  Button,
  IconButton,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  tableCellClasses,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import Loader from '../components/Loader';
import Message from '../components/Message';
import CloseIcon from '@mui/icons-material/Close';
import { useGetMyOrdersQuery } from '../redux/api/orders/orderApi';
import { styled } from '@mui/material/styles';
import { useEffect } from 'react';
import { toast } from 'react-toastify';
import { format, parseISO } from 'date-fns';
import addDecimal from '../Helpers/addDecimal';

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

const OrderDetailsPage = () => {
  const { isLoading, data: orders, error, isError } = useGetMyOrdersQuery();
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

  if (isLoading) {
    return <Loader color='primary' size='1rem' sx={{ py: 2 }} />;
  }

  return (
    <Stack>
      {orders?.length === 0 ? (
        <Message type='info' sx={{ width: '80%' }} title='Info'>
          Your order list is empty{' - '}
          <Link style={{ color: 'inherit' }} to='/'>
            <strong>Go to Products Page</strong>
          </Link>
        </Message>
      ) : (
        <TableContainer component={Paper}>
          <Table aria-label='orders table'>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>DATE</TableCell>
                <TableCell>TOTAL</TableCell>
                <TableCell>PAID</TableCell>
                <TableCell>DELIVERED</TableCell>
                <TableCell></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {orders?.map((order) => (
                <StyledTableRow key={order._id}>
                  <StyledTableCell component='th' scope='row'>
                    {order?._id.substring(0, 5)}...
                  </StyledTableCell>
                  <StyledTableCell align='right'>
                    {format(parseISO(order?.createdAt), 'PPP')}
                  </StyledTableCell>
                  <StyledTableCell align='right'>
                    ${addDecimal(order?.totalAmount!)}
                  </StyledTableCell>
                  <StyledTableCell align='right'>
                    {order?.isPaid ? (
                      format(parseISO(order?.paidAt), 'PPP')
                    ) : (
                      <IconButton sx={{ color: '#f70001' }}>
                        <CloseIcon />
                      </IconButton>
                    )}
                  </StyledTableCell>
                  <StyledTableCell align='right'>
                    {order?.isDelivered ? (
                      format(parseISO(order?.deliveredAt), 'PPP')
                    ) : (
                      <IconButton sx={{ color: '#f70001' }}>
                        <CloseIcon />
                      </IconButton>
                    )}
                  </StyledTableCell>
                  <StyledTableCell sx={{ textAlign: 'center' }}>
                    <Button
                      variant='outlined'
                      onClick={() => navigate(`/orders/${order?._id}`)}
                    >
                      Details
                    </Button>
                  </StyledTableCell>
                </StyledTableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Stack>
  );
};

export default OrderDetailsPage;
