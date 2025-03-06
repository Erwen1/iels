import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { TextField, Button, Box, Grid, Typography, FormControlLabel, Checkbox, FormHelperText, Paper } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import type { LoanRequest } from '../../types/equipment';
import { format, addDays } from 'date-fns';

interface LoanRequestFormProps {
  initialData?: LoanRequest;
  equipmentId?: string;
  onSubmit?: (data: any) => void;
}

export function LoanRequestForm({ initialData, equipmentId, onSubmit }: LoanRequestFormProps) {
  const today = new Date();
  const nextWeek = addDays(today, 7);
  
  const { control, handleSubmit, formState: { errors } } = useForm<any>({
    defaultValues: initialData || {
      project_description: '',
      loan_manager_email: '',
      borrowing_date: today,
      expected_return_date: nextWeek,
      equipment_id: equipmentId,
      terms_accepted: false
    },
  });

  const handleFormSubmit = (data: any) => {
    if (onSubmit) {
      const formData = {
        ...data,
        equipment_id: equipmentId
      };
      onSubmit(formData);
    }
  };

  // Helper function to convert error messages to strings
  const getErrorMessage = (error: any): string => {
    if (!error) return '';
    if (typeof error === 'string') return error;
    if (error.message) return error.message;
    return 'Erreur de validation';
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
                helperText={getErrorMessage(errors.project_description?.message)}
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
                helperText={getErrorMessage(errors.loan_manager_email?.message)}
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
                label="Date d'emprunt"
                value={field.value}
                onChange={field.onChange}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    error: !!errors.borrowing_date,
                    helperText: getErrorMessage(errors.borrowing_date?.message),
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
                label="Date de retour prévue"
                value={field.value}
                onChange={field.onChange}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    error: !!errors.expected_return_date,
                    helperText: getErrorMessage(errors.expected_return_date?.message),
                  },
                }}
              />
            )}
          />
        </Grid>
        
        {/* Politique d'emprunt */}
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom>
            Conditions d'emprunt
          </Typography>
          <Paper 
            variant="outlined" 
            sx={{ 
              p: 2, 
              mb: 2, 
              maxHeight: '200px', 
              overflow: 'auto',
              backgroundColor: 'rgba(0, 0, 0, 0.02)'
            }}
          >
            <Typography variant="body2" paragraph>
              Avant de confirmer votre demande d'emprunt, vous devez <strong>lire et accepter</strong> la politique suivante:
            </Typography>
            <ul>
              <li>
                <Typography variant="body2">
                  Le matériel emprunté <strong>doit être retourné dans la période de prêt spécifiée</strong>.
                </Typography>
              </li>
              <li>
                <Typography variant="body2">
                  Si le matériel est <strong>perdu ou endommagé</strong>, l'emprunteur pourrait être responsable des coûts de remplacement ou de réparation.
                </Typography>
              </li>
              <li>
                <Typography variant="body2">
                  Le matériel doit <strong>être utilisé uniquement à des fins éducatives</strong> dans le cadre des activités universitaires.
                </Typography>
              </li>
              <li>
                <Typography variant="body2">
                  Le non-retour du matériel à temps peut entraîner une <strong>suspension temporaire des privilèges d'emprunt</strong>.
                </Typography>
              </li>
              <li>
                <Typography variant="body2">
                  En confirmant la demande, l'utilisateur <strong>accepte de se conformer à ces conditions</strong>.
                </Typography>
              </li>
            </ul>
          </Paper>
          
          <Controller
            name="terms_accepted"
            control={control}
            rules={{ 
              required: 'Vous devez accepter les conditions d\'emprunt',
              validate: value => value === true || 'Vous devez accepter les conditions d\'emprunt'
            }}
            render={({ field }) => (
              <>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={field.value}
                      onChange={field.onChange}
                      color="primary"
                    />
                  }
                  label="J'ai lu et j'accepte les conditions d'emprunt"
                />
                {errors.terms_accepted && (
                  <FormHelperText error>
                    {getErrorMessage(errors.terms_accepted?.message)}
                  </FormHelperText>
                )}
              </>
            )}
          />
        </Grid>
        
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
      </Grid>
    </Box>
  );
}