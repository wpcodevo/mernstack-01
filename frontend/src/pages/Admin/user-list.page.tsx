import {
  Box,
  Container,
  IconButton,
  Link,
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
import {
  useDeleteUserMutation,
  useGetAllUsersQuery,
} from '../../redux/api/userApi';
import CloseIcon from '@mui/icons-material/Close';
import CheckIcon from '@mui/icons-material/Check';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { useNavigate } from 'react-router-dom';
import Loader from '../../components/Loader';
import { toast } from 'react-toastify';

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

const UserListPage = () => {
  const { isLoading, isError, error, data: users } = useGetAllUsersQuery();

  const navigate = useNavigate();
  const [deleteUser, { isLoading: isDeleteLoading }] = useDeleteUserMutation();

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

  const onDeleteHandler = (id: string) => {
    if (window.confirm('Are you sure')) {
      deleteUser(id);
    }
  };

  return (
    <Container>
      <Box display='flex' justifyContent='space-between' sx={{ mb: 5 }}>
        <Typography variant='h4' component='h1'>
          Users
        </Typography>
        {(isDeleteLoading || isLoading) && (
          <Loader color='primary' size='1.5rem' sx={{ mr: 6 }} />
        )}
      </Box>
      <TableContainer component={Paper}>
        <Table aria-label='orders table'>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>NAME</TableCell>
              <TableCell>EMAIL</TableCell>
              <TableCell>PROVIDER</TableCell>
              <TableCell>ADMIN</TableCell>
              <TableCell></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users?.map((user) => (
              <StyledTableRow key={user._id}>
                <StyledTableCell component='th' scope='row'>
                  {user._id}
                </StyledTableCell>
                <StyledTableCell>{user.name}</StyledTableCell>
                <StyledTableCell>
                  <Link href={`mailto:${user.email}`}>{user.email}</Link>
                </StyledTableCell>
                <StyledTableCell>
                  {user.provider ? user.provider : 'Local'}
                </StyledTableCell>
                <StyledTableCell align='left'>
                  {user.role === 'admin' ? (
                    <IconButton sx={{ color: '#4cff91' }}>
                      <CheckIcon />
                    </IconButton>
                  ) : (
                    <IconButton sx={{ color: '#f70001' }}>
                      <CloseIcon />
                    </IconButton>
                  )}
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
                      onClick={() => navigate(`/admin/users/${user._id}/edit`)}
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
                      onClick={() => onDeleteHandler(user._id)}
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
    </Container>
  );
};

export default UserListPage;
