import { Box, CircularProgress, BoxProps } from '@mui/material';
import { FC } from 'react';

type ILoaderProps = {
  size: string;
  color:
    | 'inherit'
    | 'primary'
    | 'secondary'
    | 'error'
    | 'info'
    | 'success'
    | 'warning'
    | undefined;
} & BoxProps;

const Loader: FC<ILoaderProps> = ({ size, color, ...otherBoxProps }) => {
  return (
    <Box
      display='flex'
      justifyContent='center'
      alignItems='center'
      {...otherBoxProps}
    >
      <CircularProgress color={color} size={size} />
    </Box>
  );
};

export default Loader;
