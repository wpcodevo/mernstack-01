import { FC } from 'react';
import { useFormContext, Controller } from 'react-hook-form';
import { TextField, TextFieldProps } from '@mui/material';
import { styled } from '@mui/material/styles';

type FormInputProps = {
  name: string;
} & TextFieldProps;

const CssTextField = styled(TextField)({
  '& label.Mui-focused': {
    color: '#5e5b5d',
    fontWeight: 400,
  },
  '& .MuiInputBase-input': {
    borderColor: '#c8d0d4',
  },
  '& .MuiInput-underline:after': {
    border: 'none',
  },
  '& .MuiOutlinedInput-root': {
    '&.Mui-error': {
      '& .MuiOutlinedInput-notchedOutline': {
        borderColor: '#d32f2f',
      },
    },
    '& fieldset': {
      borderColor: '#c8d0d4',
      borderRadius: 0,
    },
    '&:hover fieldset': {
      border: '1px solid #c8d0d4',
    },
    '&.Mui-focused fieldset': {
      border: '1px solid #c8d0d4',
    },
  },
});

const FormInput: FC<FormInputProps> = ({ name, ...otherProps }) => {
  const {
    control,
    formState: { errors },
  } = useFormContext();
  return (
    <Controller
      control={control}
      name={name}
      defaultValue=''
      render={({ field }) => (
        <CssTextField
          {...field}
          {...otherProps}
          variant='outlined'
          sx={{ mb: '1.5rem' }}
          error={!!errors[name]}
          helperText={errors[name] ? errors[name].message : ''}
        />
      )}
    />
  );
};

export default FormInput;
