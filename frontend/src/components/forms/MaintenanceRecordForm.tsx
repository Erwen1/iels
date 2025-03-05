import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import {
  Box,
  Button,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { equipmentService } from '../../services/equipment';
import type { MaintenanceRecord } from '../../types/equipment';

interface MaintenanceRecordFormProps {
  equipmentId: string;
  open: boolean;
  onClose: () => void;
}

type MaintenanceRecordFormData = Omit<MaintenanceRecord, 'id' | 'created_at' | 'updated_at' | 'equipment_id'>;

const MAINTENANCE_TYPES = ['PREVENTIVE', 'CORRECTIVE', 'INSPECTION'] as const;

export const MaintenanceRecordForm = ({ equipmentId, open, onClose }: MaintenanceRecordFormProps) => {
  const [error, setError] = useState<string>('');
  const queryClient = useQueryClient();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<MaintenanceRecordFormData>();

  const mutation = useMutation({
    mutationFn: (data: MaintenanceRecordFormData) => {
      return equipmentService.addMaintenanceRecord({
        ...data,
        equipment_id: equipmentId,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipment', equipmentId] });
      reset();
      onClose();
    },
    onError: (err: any) => {
      setError(err.message || 'An error occurred while saving the maintenance record');
    },
  });

  const onSubmit = async (data: MaintenanceRecordFormData) => {
    try {
      await mutation.mutateAsync(data);
    } catch (err) {
      // Error is handled by the mutation
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Add Maintenance Record</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ mt: 2 }}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <Controller
                  name="maintenance_type"
                  control={control}
                  rules={{ required: 'Maintenance type is required' }}
                  render={({ field }) => (
                    <>
                      <InputLabel>Maintenance Type</InputLabel>
                      <Select
                        {...field}
                        label="Maintenance Type"
                        error={!!errors.maintenance_type}
                      >
                        {MAINTENANCE_TYPES.map((type) => (
                          <MenuItem key={type} value={type}>
                            {type}
                          </MenuItem>
                        ))}
                      </Select>
                    </>
                  )}
                />
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <Controller
                  name="maintenance_date"
                  control={control}
                  rules={{ required: 'Maintenance date is required' }}
                  render={({ field }) => (
                    <DatePicker
                      {...field}
                      label="Maintenance Date"
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          error: !!errors.maintenance_date,
                          helperText: errors.maintenance_date?.message?.toString(),
                        },
                      }}
                    />
                  )}
                />
              </LocalizationProvider>
            </Grid>

            <Grid item xs={12}>
              <Controller
                name="description"
                control={control}
                rules={{ required: 'Description is required' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Description"
                    multiline
                    rows={4}
                    fullWidth
                    error={!!errors.description}
                    helperText={errors.description?.message?.toString()}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Controller
                name="cost"
                control={control}
                rules={{
                  required: 'Cost is required',
                  min: { value: 0, message: 'Cost must be positive' },
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Cost"
                    type="number"
                    fullWidth
                    error={!!errors.cost}
                    helperText={errors.cost?.message?.toString()}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Controller
                name="performed_by"
                control={control}
                rules={{ required: 'Technician name is required' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Performed By"
                    fullWidth
                    error={!!errors.performed_by}
                    helperText={errors.performed_by?.message?.toString()}
                  />
                )}
              />
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={handleSubmit(onSubmit)}
          variant="contained"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Saving...' : 'Save Record'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}; 