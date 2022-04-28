import { Box, CircularProgress } from '@mui/material';

const FullScreenProgress = () => {
  return (
    <Box
      position='absolute'
      height='100vh'
      width='100%'
      display='flex'
      alignItems='center'
      justifyContent='center'
    >
      <CircularProgress />
    </Box>
  );
};

export default FullScreenProgress;
