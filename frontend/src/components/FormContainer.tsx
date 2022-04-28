import { Container, Grid } from '@mui/material';

import React, { FC } from 'react';

interface IFormContainerProps {
  children: React.ReactNode;
}

const FormContainer: FC<IFormContainerProps> = ({ children }) => {
  return (
    <Container
      maxWidth={false}
      sx={{ height: '100vh', backgroundColor: { xs: '#fff', md: '#f4f4f4' } }}
    >
      <Grid
        container
        justifyContent='center'
        alignItems='center'
        sx={{ width: '100%', height: '100%' }}
      >
        <Grid
          item
          sx={{ maxWidth: '70rem', width: '100%', backgroundColor: '#fff' }}
        >
          <Grid
            container
            sx={{
              boxShadow: { sm: '0 0 5px #ddd' },
              py: '6rem',
              px: '1rem',
            }}
          >
            {children}
          </Grid>
        </Grid>
      </Grid>
    </Container>
  );
};

export default FormContainer;
