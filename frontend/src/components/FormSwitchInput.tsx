import { FC } from 'react';
import { useFormContext, Controller } from 'react-hook-form';
import { FormControlLabel, Switch } from '@mui/material';

type IFormSwitchInputProps = {
  name: string;
  label: string;
  labelPlacement: 'end' | 'start' | 'top' | 'bottom';
  color:
    | 'primary'
    | 'secondary'
    | 'error'
    | 'info'
    | 'success'
    | 'warning'
    | 'default';
};

const FormSwitchInput: FC<IFormSwitchInputProps> = ({
  name,
  label,
  color,
  labelPlacement,
}) => {
  const { control } = useFormContext();
  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <FormControlLabel
          labelPlacement={labelPlacement}
          control={
            <Switch
              {...field}
              checked={field.value}
              value={field.value || false}
              color={color}
            />
          }
          label={label}
        />
      )}
    />
  );
};

export default FormSwitchInput;
