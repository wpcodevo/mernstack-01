import { AppBar, Container, Toolbar } from '@mui/material';
import { Link } from 'react-router-dom';
import logo from '../assets/default.png';

const FormHeader = () => {
  return (
    <AppBar
      position='static'
      elevation={0}
      sx={{ my: '1rem', backgroundColor: { xs: '#fff', md: '#f4f4f4' } }}
    >
      <Container maxWidth='lg'>
        <Toolbar>
          <Link
            to='/'
            style={{
              display: 'flex',
              alignItems: 'center',
              textDecoration: 'none',
            }}
          >
            <img
              style={{ height: '50px', objectFit: 'contain' }}
              src={logo}
              alt='App logo'
            />
            <span
              style={{
                fontSize: '1.8rem',
                color: '#7eaef4',
                fontWeight: 700,
              }}
            >
              Codevo
            </span>
          </Link>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default FormHeader;
