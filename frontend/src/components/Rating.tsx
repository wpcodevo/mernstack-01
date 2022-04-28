import { Star, StarHalf, StarOutline } from '@mui/icons-material';
import { Box, Typography } from '@mui/material';
import { FC } from 'react';
import styled from '@emotion/styled';

const StyledSpan = styled.span`
  display: flex;
  justify-content: center;
  align-items: center;
  color: ${({ color }) => color};
`;

interface IRating {
  value: number;
  text?: string;
  color?: string;
  size?: string;
}

const Rating: FC<IRating> = ({
  value,
  text,
  color = '#ffc600',
  size = '1.4rem',
}) => {
  return (
    <Box display='flex' alignItems='center'>
      <StyledSpan color={color}>
        {value >= 1 ? (
          <Star sx={{ fontSize: size }} />
        ) : value >= 0.5 ? (
          <StarHalf sx={{ fontSize: size }} />
        ) : (
          <StarOutline sx={{ fontSize: size }} />
        )}
      </StyledSpan>
      <StyledSpan color={color}>
        {value >= 2 ? (
          <Star sx={{ fontSize: size }} />
        ) : value >= 1.5 ? (
          <StarHalf sx={{ fontSize: size }} />
        ) : (
          <StarOutline sx={{ fontSize: size }} />
        )}
      </StyledSpan>
      <StyledSpan color={color}>
        {value >= 3 ? (
          <Star sx={{ fontSize: size }} />
        ) : value >= 2.5 ? (
          <StarHalf sx={{ fontSize: size }} />
        ) : (
          <StarOutline sx={{ fontSize: size }} />
        )}
      </StyledSpan>
      <StyledSpan color={color}>
        {value >= 4 ? (
          <Star sx={{ fontSize: size }} />
        ) : value >= 3.5 ? (
          <StarHalf sx={{ fontSize: size }} />
        ) : (
          <StarOutline sx={{ fontSize: size }} />
        )}
      </StyledSpan>
      <StyledSpan color={color}>
        {value >= 5 ? (
          <Star sx={{ fontSize: size }} />
        ) : value >= 4.5 ? (
          <StarHalf sx={{ fontSize: size }} />
        ) : (
          <StarOutline sx={{ fontSize: size }} />
        )}
      </StyledSpan>

      {text && (
        <Typography variant='body1' sx={{ marginLeft: 1 }}>
          {text}
        </Typography>
      )}
    </Box>
  );
};

export default Rating;
