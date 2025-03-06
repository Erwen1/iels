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
  Autocomplete,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { equipmentService } from '../../services/equipment';
import { locationService } from '../../services/location';
import type { Equipment, EquipmentStatus, Location } from '../../types/equipment';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

type EquipmentFormData = Omit<Equipment, 'id' | 'created_at' | 'updated_at'> & {
  location?: string;
};

interface EquipmentFormProps {
  equipmentId?: string;
}

const STATUS_OPTIONS: EquipmentStatus[] = ['DISPONIBLE', 'EMPRUNTE', 'MAINTENANCE', 'HORS_SERVICE'];

// Options pour les bâtiments et étages
const BUILDINGS = ['Bâtiment A', 'Bâtiment B', 'Bâtiment C', 'Bâtiment D', 'Bâtiment E'];
const FLOORS = ['1er étage', '2ème étage', '3ème étage'];

export const EquipmentForm = ({ equipmentId }: EquipmentFormProps) => {
  const [error, setError] = useState<string>('');
  const [locations, setLocations] = useState<Location[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [locationsTableExists, setLocationsTableExists] = useState<boolean>(true);
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

  // Check if locations table exists
  useEffect(() => {
    const checkTableExists = async () => {
      try {
        // Vérifier si la table existe
        const exists = await locationService.checkLocationsTableExists();
        setLocationsTableExists(exists);
        
        // Ne charger les localisations que si la table existe
        if (exists) {
          const locationsData = await locationService.getAllLocations();
          setLocations(locationsData || []);
          
          // Si on est en édition et que l'équipement a une localisation définie
          if (equipmentId && equipment?.location_id) {
            const matchingLocation = locationsData.find(loc => loc.id === equipment.location_id);
            if (matchingLocation) {
              setSelectedLocation(matchingLocation);
            }
          }
        } else {
          console.log('La table des localisations n\'existe pas - fonctionnalités désactivées');
        }
      } catch (err) {
        console.error('Erreur lors de la vérification de la table des localisations:', err);
        setLocationsTableExists(false);
      }
    };
    
    checkTableExists();
  }, [equipmentId, equipment]);

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

  const [building, setBuilding] = useState<string>('');
  const [floor, setFloor] = useState<string>('');
  const [room, setRoom] = useState<string>('');

  // Gérer les changements de localisation
  const handleLocationChange = () => {
    // Formater la localisation sous forme "Bâtiment X - Étage Y - Salle Z"
    // Même si aucun champ n'est rempli, on s'assure que location a une valeur (chaîne vide)
    
    const parts = [];
    if (building) parts.push(building);
    if (floor) parts.push(floor);
    if (room) parts.push(room);
    
    const locationString = parts.length > 0 ? parts.join(' - ') : '';
    
    // Mettre à jour la valeur dans le formulaire
    setValue('location', locationString);
  };

  // Assurer que location est initialisé correctement au montage du composant
  useEffect(() => {
    // Petite temporisation pour s'assurer que le state est mis à jour
    const timer = setTimeout(() => handleLocationChange(), 0);
    return () => clearTimeout(timer);
  }, []);

  // Effet pour décomposer une localisation existante
  useEffect(() => {
    if (equipment?.location) {
      const parts = equipment.location.split(' - ');
      if (parts.length >= 1) setBuilding(parts[0]);
      if (parts.length >= 2) setFloor(parts[1]);
      if (parts.length >= 3) setRoom(parts[2]);
    }
  }, [equipment]);

  // Effet pour mettre à jour la localisation quand les composants changent
  useEffect(() => {
    if (building || floor || room) {
      handleLocationChange();
    }
  }, [building, floor, room]);

  const onSubmit = async (data: EquipmentFormData) => {
    try {
      // S'assurer que les infos de localisation sont incluses
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
      
      {!locationsTableExists && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          La table des localisations n'existe pas encore dans la base de données. 
          Veuillez exécuter le script SQL fourni pour créer cette table.
          Certaines fonctionnalités seront limitées.
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
          
          {locationsTableExists ? (
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Localisation
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <FormControl fullWidth>
                    <InputLabel id="building-label">Bâtiment</InputLabel>
                    <Select
                      labelId="building-label"
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
                    <InputLabel id="floor-label">Étage</InputLabel>
                    <Select
                      labelId="floor-label"
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
              </Grid>
              <Controller
                name="location"
                control={control}
                render={({ field }) => (
                  <input type="hidden" {...field} />
                )}
              />
            </Grid>
          ) : (
            <Grid item xs={12}>
              <TextField
                label="Localisation"
                disabled
                fullWidth
                helperText="La gestion des localisations n'est pas encore disponible"
              />
            </Grid>
          )}

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
            {equipmentId ? 'Mettre à jour' : 'Ajouter'}
          </Button>
        </Box>
      </Box>
    </Paper>
  );
}; 