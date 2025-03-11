import { useState, useEffect } from 'react';
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
  Divider,
} from '@mui/material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { equipmentService } from '../../services/equipment';
import { locationService } from '../../services/location';
import type { Equipment, EquipmentStatus } from '../../types/equipment';
import { useNavigate } from 'react-router-dom';

type EquipmentFormData = Omit<Equipment, 'id' | 'created_at' | 'updated_at'> & {
  location?: string;
};

interface EquipmentFormProps {
  equipmentId?: string;
}

const STATUS_OPTIONS: EquipmentStatus[] = ['DISPONIBLE', 'EMPRUNTE', 'MAINTENANCE', 'HORS_SERVICE'];
const BUILDINGS = ['Bâtiment A', 'Bâtiment B', 'Bâtiment C', 'Bâtiment D', 'Bâtiment E'];
const FLOORS = ['1er étage', '2ème étage', '3ème étage'];

export const EquipmentForm = ({ equipmentId }: EquipmentFormProps) => {
  const [error, setError] = useState<string>('');
  const [building, setBuilding] = useState<string>('');
  const [floor, setFloor] = useState<string>('');
  const [room, setRoom] = useState<string>('');
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<EquipmentFormData>({
    defaultValues: {
      status: 'DISPONIBLE',
      quantity: 1,
      location: '',
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

  // Gérer les changements de localisation
  const handleLocationChange = () => {
    const parts = [];
    if (building) parts.push(building);
    if (floor) parts.push(floor);
    if (room) parts.push(room);
    
    const locationString = parts.length > 0 ? parts.join(' - ') : '';
    setValue('location', locationString);
  };

  useEffect(() => {
    const timer = setTimeout(() => handleLocationChange(), 0);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (equipment?.location) {
      const parts = equipment.location.split(' - ');
      if (parts.length >= 1) setBuilding(parts[0]);
      if (parts.length >= 2) setFloor(parts[1]);
      if (parts.length >= 3) setRoom(parts[2]);
    }
  }, [equipment]);

  useEffect(() => {
    if (building || floor || room) {
      handleLocationChange();
    }
  }, [building, floor, room]);

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
      if (building || floor || room) {
        handleLocationChange();
      }
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
          {/* Informations de base */}
          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom>
              Informations de base
            </Typography>
          </Grid>

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

          {/* Localisation */}
          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle1" gutterBottom>
              Localisation
            </Typography>
          </Grid>

          <Grid item xs={12} sm={4}>
            <FormControl fullWidth>
              <InputLabel>Bâtiment</InputLabel>
              <Select
                value={building}
                label="Bâtiment"
                onChange={(e) => {
                  setBuilding(e.target.value);
                  setTimeout(() => handleLocationChange(), 0);
                }}
              >
                {BUILDINGS.map((b) => (
                  <MenuItem key={b} value={b}>{b}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={4}>
            <FormControl fullWidth>
              <InputLabel>Étage</InputLabel>
              <Select
                value={floor}
                label="Étage"
                onChange={(e) => {
                  setFloor(e.target.value);
                  setTimeout(() => handleLocationChange(), 0);
                }}
              >
                {FLOORS.map((f) => (
                  <MenuItem key={f} value={f}>{f}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="Salle"
              value={room}
              onChange={(e) => {
                setRoom(e.target.value);
                setTimeout(() => handleLocationChange(), 0);
              }}
              placeholder="Ex: Salle 101"
            />
          </Grid>

          {/* Gestion et Contact */}
          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle1" gutterBottom>
              Gestion et Contact
            </Typography>
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
                  label="Référent matériel (mail)"
                  fullWidth
                  error={!!errors.equipment_manager_email}
                  helperText={errors.equipment_manager_email?.message?.toString()}
                />
              )}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl fullWidth error={!!errors.status}>
              <InputLabel>Disponibilité</InputLabel>
              <Controller
                name="status"
                control={control}
                rules={{ required: 'Le statut est requis' }}
                render={({ field }) => (
                  <Select {...field} label="Disponibilité">
                    {STATUS_OPTIONS.map((status) => (
                      <MenuItem key={status} value={status}>
                        {status === 'DISPONIBLE' ? 'Disponible' :
                         status === 'EMPRUNTE' ? 'Emprunté' :
                         status === 'MAINTENANCE' ? 'En maintenance' :
                         'Hors service'}
                      </MenuItem>
                    ))}
                  </Select>
                )}
              />
              {errors.status && (
                <FormHelperText>{errors.status.message}</FormHelperText>
              )}
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
            {equipmentId ? 'Mettre à jour' : 'Ajouter'}
          </Button>
        </Box>
      </Box>
    </Paper>
  );
}; 