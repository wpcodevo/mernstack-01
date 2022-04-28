import {
  AppBar,
  Box,
  Container,
  IconButton,
  Toolbar,
  Typography,
  Menu,
  MenuItem,
  Tooltip,
  Avatar,
  Badge,
  Skeleton,
  Button,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined';
import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useCookies } from 'react-cookie';
import { useAppDispatch, useAppSelector } from '../redux/store';
import { logout } from '../redux/features/authSlice';
import { useLogoutUserMutation } from '../redux/api/authApi';
import { toggleCartDrawer } from '../redux/features/cartSlice';
import CartDrawer from './Cart/CartDrawer';

interface IPages {
  title: string;
  url: string;
}

const pages: IPages[] = [
  {
    title: 'Home',
    url: '/',
  },
  // {
  //   title: 'Products',
  //   url: '/products',
  // },
  // {
  //   title: 'Categories',
  //   url: '/categories',
  // },
];

const adminPages: IPages[] = [
  {
    title: 'Users',
    url: '/admin/users',
  },
  {
    title: 'Products',
    url: '/admin/products',
  },
  {
    title: 'Orders',
    url: '/admin/orders',
  },
];

const Header = () => {
  const [cookies] = useCookies(['logged_in']);
  const { authUser, cart } = useAppSelector((state) => state);
  const { user } = authUser;

  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [logoutUser, { isLoading, isSuccess, isError }] =
    useLogoutUserMutation();

  const [anchorElNav, setAnchorElNav] = useState<null | HTMLElement>(null);
  const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null);
  const [anchorElAdmin, setAnchorElAdmin] = useState<null | HTMLElement>(null);
  const [imageLoading, setImageLoading] = useState(true);

  const handleOpenNavMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElNav(event.currentTarget);
  };

  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleOpenAdminMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElAdmin(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };
  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };
  const handleCloseAdminMenu = () => {
    setAnchorElAdmin(null);
  };

  const onLogoutHandler = () => {
    logoutUser();
  };

  const openCartDrawer = () => {
    dispatch(toggleCartDrawer());
  };

  const imageLoaded = () => {
    setImageLoading(false);
  };

  useEffect(() => {
    if (isSuccess) {
      dispatch(logout());
      navigate('/login');
      toast.success('You successfully logged out', {
        position: 'top-right',
      });
    }

    if (isError) {
      navigate('/login');
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading]);

  return (
    <AppBar position='static' sx={{ mb: 3 }}>
      <Container maxWidth='lg'>
        <Toolbar disableGutters>
          <Typography
            variant='h6'
            noWrap
            component='div'
            sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}
          >
            <Link to='/' style={{ color: 'white', textDecoration: 'none' }}>
              LOGO
            </Link>
          </Typography>
          <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
            <IconButton
              size='large'
              aria-label='account of current user'
              aria-controls={Boolean(anchorElNav) ? 'mobile-menu' : undefined}
              aria-expanded={Boolean(anchorElNav) ? 'true' : undefined}
              aria-haspopup='true'
              color='inherit'
              onClick={handleOpenNavMenu}
            >
              <MenuIcon />
            </IconButton>
            <Menu
              id='mobile-menu'
              anchorEl={anchorElNav}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'left',
              }}
              open={Boolean(anchorElNav)}
              onClose={handleCloseNavMenu}
            >
              {pages.map((page, i) => (
                <MenuItem key={i} onClick={() => navigate(page.url)}>
                  {page.title}
                </MenuItem>
              ))}
            </Menu>
          </Box>
          <Typography sx={{ flexGrow: 1, display: { sx: 'flex', md: 'none' } }}>
            CODEVO
          </Typography>
          <Box sx={{ flexGrow: 0, display: { xs: 'none', md: 'flex' } }}>
            {pages.map((page, i) => (
              <Link
                style={{
                  color: 'white',
                  textDecoration: 'none',
                  marginRight: '1rem',
                }}
                to={page.url}
                key={i}
              >
                {page.title}
              </Link>
            ))}
          </Box>
          <Box>
            <IconButton
              size='large'
              aria-label='show cart number'
              color='inherit'
            >
              <Badge badgeContent={cart.numOfItemsInCart} color='info' showZero>
                <ShoppingBagOutlinedIcon onClick={openCartDrawer} />
              </Badge>
            </IconButton>
          </Box>
          <Box sx={{ flexGrow: 0 }}>
            <Tooltip title='Open Settings'>
              <IconButton
                onClick={handleOpenUserMenu}
                aria-controls={
                  Boolean(anchorElUser) ? 'profile-menu' : undefined
                }
                aria-haspopup='true'
                aria-expanded={Boolean(anchorElUser) ? 'true' : undefined}
                sx={{ p: 0, ml: 2 }}
              >
                <Avatar
                  imgProps={{
                    onLoad: imageLoaded,
                  }}
                  alt={user?.name}
                  src={
                    user && !user?.photo?.includes('default')
                      ? user?.photo
                      : `/api/static/users/default.png`
                  }
                  style={{ display: imageLoading ? 'none' : 'block' }}
                />
                <Skeleton
                  width='40px'
                  height='40px'
                  variant='circular'
                  animation='wave'
                  style={{ display: imageLoading ? 'block' : 'none' }}
                />
              </IconButton>
            </Tooltip>
            <Menu
              sx={{ mt: '45px' }}
              id='profile-menu'
              anchorEl={anchorElUser}
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={!!anchorElUser}
              onClose={handleCloseUserMenu}
              onClick={handleCloseUserMenu}
            >
              {!cookies.logged_in && (
                <div>
                  <MenuItem
                    onClick={() => {
                      handleCloseUserMenu();
                      navigate('/login');
                    }}
                  >
                    Login
                  </MenuItem>
                  <MenuItem
                    onClick={() => {
                      handleCloseUserMenu();
                      navigate('/register');
                    }}
                  >
                    SignUp
                  </MenuItem>
                </div>
              )}

              {cookies.logged_in && (
                <div>
                  <MenuItem
                    onClick={() => {
                      handleCloseUserMenu();
                      navigate('/profile');
                    }}
                  >
                    Profile
                  </MenuItem>
                </div>
              )}
              {cookies.logged_in && (
                <MenuItem onClick={onLogoutHandler}>
                  <Typography>Logout</Typography>
                </MenuItem>
              )}
            </Menu>
          </Box>
          {cookies.logged_in && user?.role === 'admin' && (
            <Box sx={{ ml: 2, display: { xs: 'none', md: 'block' } }}>
              <Button
                onClick={handleOpenAdminMenu}
                aria-controls={
                  Boolean(anchorElAdmin) ? 'admin-menu' : undefined
                }
                aria-haspopup='true'
                aria-expanded={Boolean(anchorElAdmin) ? 'true' : undefined}
              >
                <Typography
                  sx={{ color: 'white', textTransform: 'capitalize' }}
                >
                  Admin
                </Typography>
              </Button>
              <Menu
                sx={{ mt: '45px' }}
                id='admin-menu'
                anchorEl={anchorElAdmin}
                anchorOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                open={Boolean(anchorElAdmin)}
                onClose={handleCloseAdminMenu}
                onClick={handleCloseAdminMenu}
              >
                {adminPages.map((el, i) => (
                  <MenuItem
                    key={i}
                    onClick={() => {
                      handleCloseAdminMenu();
                      navigate(el.url);
                    }}
                  >
                    {el.title}
                  </MenuItem>
                ))}
              </Menu>
            </Box>
          )}
        </Toolbar>
      </Container>
      <CartDrawer />
    </AppBar>
  );
};

export default Header;
