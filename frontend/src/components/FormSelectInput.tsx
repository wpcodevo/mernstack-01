import {
  FormControl,
  FormHelperText,
  Select,
  FormControlProps,
  MenuItem,
} from '@mui/material';
import React, { FC } from 'react';
import { Controller, useFormContext } from 'react-hook-form';

type IFormSelectInputProps = {
  name: string;
  label: string;
  itemWidth: number;
  children: React.ReactNode;
} & FormControlProps;

const FormSelectInput: FC<IFormSelectInputProps> = ({
  name,
  label,
  itemWidth,
  children,
  ...formControlProps
}) => {
  const {
    control,
    formState: { errors },
  } = useFormContext();
  return (
    <Controller
      name={name}
      defaultValue=''
      control={control}
      render={({ field }) => (
        <FormControl {...formControlProps}>
          <Select
            {...field}
            value={field.value ?? ''}
            labelId={`${label}-select-label`}
            displayEmpty
            autoWidth
            MenuProps={{
              PaperProps: {
                style: {
                  outline: 'none',
                  width: itemWidth,
                },
              },
            }}
          >
            <MenuItem disabled value=''>
              <em>{label}</em>
            </MenuItem>
            {children}
          </Select>
          <FormHelperText error={!!errors[name]}>
            {errors[name] ? errors[name].message : ''}
          </FormHelperText>
        </FormControl>
      )}
    />
  );
};

export default FormSelectInput;
