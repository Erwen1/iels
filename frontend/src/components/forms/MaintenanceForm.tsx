import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import {
  TextField,
  Button,
  Stack,
  Typography,
  Box,
  Alert,
  MenuItem,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { maintenanceService } from '../../services/maintenance';
import type { Equipment, MaintenanceRecord, MaintenanceType } from '../../types/equipment';

interface MaintenanceFormProps {
  equipment: Equipment;
  maintenanceRecord?: MaintenanceRecord;
  onSuccess?: () => void;
}

interface MaintenanceFormData {
  maintenance_type: MaintenanceType;
  maintenance_date: Date;
  description: string;
  performed_by: string;
  next_maintenance_date?: Date | null;
}

const maintenanceTypes: { value: MaintenanceType; label: string }[] = [
  { value: 'PREVENTIF', label: 'Préventif' },
  { value: 'CORRECTIF', label: 'Correctif' },
  { value: 'INSPECTION', label: 'Inspection' },
];

export function MaintenanceForm({
  equipment,
  maintenanceRecord,
  onSuccess,
}: MaintenanceFormProps) {
  const queryClient = useQueryClient();
  const isEditing = !!maintenanceRecord;

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<MaintenanceFormData>({
    defaultValues: {
      maintenance_type: maintenanceRecord?.maintenance_type || 'PREVENTIF',
      maintenance_date: maintenanceRecord?.maintenance_date
        ? new Date(maintenanceRecord.maintenance_date)
        : new Date(),
      description: maintenanceRecord?.description || '',
      performed_by: maintenanceRecord?.performed_by || '',
      next_maintenance_date: maintenanceRecord?.next_maintenance_date
        ? new Date(maintenanceRecord.next_maintenance_date)
        : null,
    },
  });

  const mutation = useMutation({
    mutationFn: (data: MaintenanceFormData) => {
      const maintenanceData = {
        ...data,
        equipment_id: equipment.id,
        maintenance_date: data.maintenance_date.toISOString(),
        next_maintenance_date: data.next_maintenance_date?.toISOString(),
      };

      return isEditing
        ? maintenanceService.updateMaintenanceRecord(maintenanceRecord.id, maintenanceData)
        : maintenanceService.createMaintenanceRecord(maintenanceData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['maintenanceRecords', equipment.id]);
      onSuccess?.();
    },
  });

  const onSubmit = (data: MaintenanceFormData) => {
    mutation.mutate(data);
  };

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
      <Stack spacing={3} sx={{ width: '100%' }}>
        <Typography variant="h6">
          {isEditing ? 'Modifier' : 'Ajouter'} un enregistrement de maintenance
          pour: {equipment.name}
        </Typography>

        <Controller
          name="maintenance_type"
          control={control}
          rules={{ required: 'Le type de maintenance est requis' }}
          render={({ field }) => (
            <TextField
              {...field}
              select
              label="Type de maintenance"
              error={!!errors.maintenance_type}
              helperText={errors.maintenance_type?.message}
            >
              {maintenanceTypes.map((type) => (
                <MenuItem key={type.value} value={type.value}>
                  {type.label}
                </MenuItem>
              ))}
            </TextField>
          )}
        />

        <Controller
          name="maintenance_date"
          control={control}
          rules={{ required: 'La date de maintenance est requise' }}
          render={({ field }) => (
            <DatePicker
              {...field}
              label="Date de maintenance"
              slotProps={{
                textField: {
                  error: !!errors.maintenance_date,
                  helperText: errors.maintenance_date?.message,
                },
              }}
            />
          )}
        />

        <Controller
          name="description"
          control={control}
          rules={{ required: 'La description est requise' }}
          render={({ field }) => (
            <TextField
              {...field}
              label="Description"
              multiline
              rows={4}
              error={!!errors.description}
              helperText={errors.description?.message}
            />
          )}
        />

        <Controller
          name="performed_by"
          control={control}
          rules={{
            required: 'Le nom du technicien est requis',
          }}
          render={({ field }) => (
            <TextField
              {...field}
              label="Effectué par"
              error={!!errors.performed_by}
              helperText={errors.performed_by?.message}
            />
          )}
        />

        <Controller
          name="next_maintenance_date"
          control={control}
          render={({ field }) => (
            <DatePicker
              {...field}
              label="Prochaine maintenance prévue"
              slotProps={{
                textField: {
                  error: !!errors.next_maintenance_date,
                  helperText: errors.next_maintenance_date?.message,
                },
              }}
            />
          )}
        />

        {mutation.error && (
          <Alert severity="error">
            Une erreur est survenue lors de l'enregistrement
          </Alert>
        )}

        <Button
          type="submit"
          variant="contained"
          disabled={mutation.isLoading}
          sx={{ alignSelf: 'flex-start' }}
        >
          {mutation.isLoading
            ? 'Enregistrement...'
            : isEditing
            ? 'Mettre à jour'
            : 'Enregistrer'}
        </Button>
      </Stack>
    </Box>
  );
} 