import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import {
  Box,
  TextField,
  MenuItem,
  Button,
  Grid,
  Typography,
  Paper,
  Alert,
  FormControl,
  InputLabel,
  Select,
  FormHelperText,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { equipmentService } from '../../services/equipment';
import type { Equipment, EquipmentStatus } from '../../types/equipment';
import { useNavigate } from 'react-router-dom';

type EquipmentFormData = Omit<Equipment, 'id' | 'created_at' | 'updated_at'>;

interface EquipmentFormProps {
  equipmentId?: string;
}

const STATUS_OPTIONS: EquipmentStatus[] = ['DISPONIBLE', 'EMPRUNTE', 'MAINTENANCE', 'HORS_SERVICE'];

export const EquipmentForm = ({ equipmentId }: EquipmentFormProps) => {
  const [error, setError] = useState<string>('');
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<EquipmentFormData>({
    defaultValues: {
      status: 'DISPONIBLE',
      quantity: 1,
    }
  });

  // Fetch equipment data if editing
  const { data: equipment } = useQuery({
    queryKey: ['equipment', equipmentId],
    queryFn: () => equipmentService.getEquipmentById(equipmentId!),
    enabled: !!equipmentId,
    onSuccess: (data) => {
      if (data) {
        reset(data);
      }
    },
  });

  // Create or update mutation
  const mutation = useMutation({
    mutationFn: (data: EquipmentFormData) => {
      if (equipmentId) {
        return equipmentService.updateEquipment(equipmentId, data);
      }
      return equipmentService.createEquipment(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipment'] });
      navigate('/equipment');
    },
    onError: (err: any) => {
      setError(err.message || 'Une erreur est survenue lors de l\'enregistrement');
    },
  });

  const onSubmit = async (data: EquipmentFormData) => {
    try {
      await mutation.mutateAsync(data);
    } catch (err) {
      // Error is handled by the mutation
    }
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        {equipmentId ? 'Modifier le Matériel' : 'Ajouter un Matériel'}
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box component="form" onSubmit={handleSubmit(onSubmit)}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <Controller
              name="reference"
              control={control}
              rules={{ required: 'La référence est requise' }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Référence"
                  fullWidth
                  error={!!errors.reference}
                  helperText={errors.reference?.message?.toString()}
                />
              )}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <Controller
              name="name"
              control={control}
              rules={{ required: 'Le nom est requis' }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Matériel"
                  fullWidth
                  error={!!errors.name}
                  helperText={errors.name?.message?.toString()}
                />
              )}
            />
          </Grid>

          <Grid item xs={12}>
            <Controller
              name="description"
              control={control}
              rules={{ required: 'La description est requise' }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Description/utilisation"
                  multiline
                  rows={3}
                  fullWidth
                  error={!!errors.description}
                  helperText={errors.description?.message?.toString()}
                />
              )}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <Controller
              name="department"
              control={control}
              rules={{ required: 'Le département est requis' }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Département hébergeur"
                  fullWidth
                  error={!!errors.department}
                  helperText={errors.department?.message?.toString()}
                />
              )}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <Controller
              name="quantity"
              control={control}
              rules={{ 
                required: 'La quantité est requise',
                min: { value: 1, message: 'La quantité doit être positive' }
              }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Quantité"
                  type="number"
                  fullWidth
                  error={!!errors.quantity}
                  helperText={errors.quantity?.message?.toString()}
                />
              )}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <Controller
              name="equipment_manager_email"
              control={control}
              rules={{ 
                required: 'L\'email du référent est requis',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Adresse email invalide'
                }
              }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Email du référent"
                  fullWidth
                  error={!!errors.equipment_manager_email}
                  helperText={errors.equipment_manager_email?.message?.toString()}
                />
              )}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl fullWidth error={!!errors.status}>
              <Controller
                name="status"
                control={control}
                rules={{ required: 'Le statut est requis' }}
                defaultValue="DISPONIBLE"
                render={({ field }) => (
                  <>
                    <InputLabel id="status-label">Disponibilité</InputLabel>
                    <Select
                      {...field}
                      labelId="status-label"
                      label="Disponibilité"
                    >
                      {STATUS_OPTIONS.map((status) => (
                        <MenuItem key={status} value={status}>
                          {status === 'DISPONIBLE' ? 'Disponible' :
                           status === 'EMPRUNTE' ? 'Emprunté' :
                           status === 'MAINTENANCE' ? 'En maintenance' :
                           'Hors service'}
                        </MenuItem>
                      ))}
                    </Select>
                    {errors.status && (
                      <FormHelperText>{errors.status.message}</FormHelperText>
                    )}
                  </>
                )}
              />
            </FormControl>
          </Grid>
        </Grid>

        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
          <Button onClick={() => navigate('/equipment')}>
            Annuler
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Enregistrement...' : equipmentId ? 'Modifier' : 'Ajouter'}
          </Button>
        </Box>
      </Box>
    </Paper>
  );
}; 