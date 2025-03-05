import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { TextField, Button, Box, Grid } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import type { LoanRequest } from '../../types/equipment';

interface LoanRequestFormProps {
  initialData?: LoanRequest;
  onSubmit?: (data: LoanRequest) => void;
}

export function LoanRequestForm({ initialData, onSubmit }: LoanRequestFormProps) {
  const { control, handleSubmit, formState: { errors } } = useForm<LoanRequest>({
    defaultValues: initialData,
  });

  const handleFormSubmit = (data: LoanRequest) => {
    if (onSubmit) {
      onSubmit(data);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit(handleFormSubmit)} sx={{ mt: 1 }}>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Controller
            name="project_description"
            control={control}
            rules={{ required: 'La description du projet est requise' }}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label="Description du projet"
                multiline
                rows={4}
                error={!!errors.project_description}
                helperText={errors.project_description?.message}
              />
            )}
          />
        </Grid>
        <Grid item xs={12}>
          <Controller
            name="loan_manager_email"
            control={control}
            rules={{
              required: 'L\'email du responsable est requis',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'Adresse email invalide',
              },
            }}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label="Email du responsable"
                error={!!errors.loan_manager_email}
                helperText={errors.loan_manager_email?.message}
              />
            )}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <Controller
            name="borrowing_date"
            control={control}
            rules={{ required: 'La date d\'emprunt est requise' }}
            render={({ field }) => (
              <DatePicker
                {...field}
                label="Date d'emprunt"
                slotProps={{
                  textField: {
                    fullWidth: true,
                    error: !!errors.borrowing_date,
                    helperText: errors.borrowing_date?.message,
                  },
                }}
              />
            )}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <Controller
            name="expected_return_date"
            control={control}
            rules={{ required: 'La date de retour prévue est requise' }}
            render={({ field }) => (
              <DatePicker
                {...field}
                label="Date de retour prévue"
                slotProps={{
                  textField: {
                    fullWidth: true,
                    error: !!errors.expected_return_date,
                    helperText: errors.expected_return_date?.message,
                  },
                }}
              />
            )}
          />
        </Grid>
        {!initialData && (
          <Grid item xs={12}>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
            >
              Soumettre la demande
            </Button>
          </Grid>
        )}
      </Grid>
    </Box>
  );
}