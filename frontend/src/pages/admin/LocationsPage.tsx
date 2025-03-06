import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  IconButton,
  Snackbar,
  Alert,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Warning as WarningIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { supabase } from '../../lib/supabase';
import type { Location } from '../../types/equipment';

// Options pour les bâtiments et étages
const BUILDINGS = ['Bâtiment A', 'Bâtiment B', 'Bâtiment C', 'Bâtiment D', 'Bâtiment E'];
const FLOORS = ['1er étage', '2ème étage', '3ème étage'];

export function InventoryManagementPage() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<Partial<Location> | null>(null);
  const [locationsTableExists, setLocationsTableExists] = useState<boolean>(true);
  const [building, setBuilding] = useState<string>('');
  const [floor, setFloor] = useState<string>('');
  const [room, setRoom] = useState<string>('');
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'warning' | 'info';
  }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const fetchLocations = async () => {
    try {
      // D'abord, vérifier si la table existe
      const exists = await checkTableExists();
      setLocationsTableExists(exists);
      
      if (!exists) {
        showSnackbar(
          'La table des localisations n\'existe pas encore. Veuillez exécuter le script SQL fourni.',
          'warning'
        );
        setLocations([]);
        return;
      }
      
      // Si la table existe, charger les données
      const { data, error } = await supabase
        .from('stock_locations')
        .select('*')
        .order('building', { ascending: true });

      if (error) {
        console.error('Erreur lors de la récupération des localisations:', error);
        showSnackbar('Erreur lors de la récupération des localisations', 'error');
        return;
      }

      setLocations(data || []);
    } catch (error) {
      console.error('Erreur lors de la récupération des localisations:', error);
      showSnackbar('Erreur lors de la récupération des localisations', 'error');
    }
  };

  const checkTableExists = async (): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .from('stock_locations')
        .select('*')
        .limit(1);
      
      // Si pas d'erreur, la table existe
      if (!error) {
        return true;
      }
      
      // Vérifier si l'erreur est "relation doesn't exist"
      if (error.code === '42P01') {
        console.log('La table stock_locations n\'existe pas encore');
        return false;
      }
      
      // Autre type d'erreur, on considère que la table n'existe pas par précaution
      console.error('Erreur lors de la vérification de l\'existence de la table:', error);
      return false;
    } catch (err) {
      console.error('Erreur dans checkTableExists:', err);
      return false;
    }
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  const handleOpenDialog = (location?: Location) => {
    if (!locationsTableExists) {
      showSnackbar(
        'Impossible d\'ajouter des emplacements car la table n\'existe pas encore.',
        'warning'
      );
      return;
    }
    
    if (location) {
      setCurrentLocation(location);
      
      // Décomposer l'emplacement en composants
      const parts = location.display_name?.split(' - ') || [];
      setBuilding(parts[0] || '');
      setFloor(parts[1] || '');
      setRoom(parts[2] || '');
    } else {
      setCurrentLocation({ id: '', building: '', floor: '', room: '', display_name: '' });
      setBuilding('');
      setFloor('');
      setRoom('');
    }
    
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setCurrentLocation(null);
    setBuilding('');
    setFloor('');
    setRoom('');
  };

  const handleOpenDeleteDialog = (location: Location) => {
    if (!locationsTableExists) {
      showSnackbar(
        'Impossible de supprimer des emplacements car la table n\'existe pas encore.',
        'warning'
      );
      return;
    }
    
    setCurrentLocation(location);
    setIsDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setIsDeleteDialogOpen(false);
    setCurrentLocation(null);
  };

  const showSnackbar = (message: string, severity: 'success' | 'error' | 'warning' | 'info') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleSaveLocation = async () => {
    if (!locationsTableExists) {
      showSnackbar(
        'Impossible d\'enregistrer car la table n\'existe pas encore.',
        'warning'
      );
      return;
    }
    
    if (!building) {
      showSnackbar('Veuillez sélectionner un bâtiment', 'error');
      return;
    }

    // Construire le nom d'affichage
    const parts = [];
    if (building) parts.push(building);
    if (floor) parts.push(floor);
    if (room) parts.push(room);
    
    const displayName = parts.join(' - ');
    
    try {
      let result;
      
      if (currentLocation?.id) {
        // Update existing location
        result = await supabase
          .from('stock_locations')
          .update({
            building: building,
            floor: floor,
            room: room,
            display_name: displayName
          })
          .eq('id', currentLocation.id);
      } else {
        // Create new location
        result = await supabase
          .from('stock_locations')
          .insert([{
            building: building,
            floor: floor,
            room: room,
            display_name: displayName
          }]);
      }

      if (result.error) {
        throw result.error;
      }

      handleCloseDialog();
      await fetchLocations();
      showSnackbar(
        currentLocation?.id ? 'Emplacement mis à jour avec succès' : 'Emplacement ajouté avec succès',
        'success'
      );
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement de l\'emplacement:', error);
      showSnackbar('Erreur lors de l\'enregistrement de l\'emplacement', 'error');
    }
  };

  const handleDeleteLocation = async () => {
    if (!locationsTableExists) {
      showSnackbar(
        'Impossible de supprimer car la table n\'existe pas encore.',
        'warning'
      );
      return;
    }
    
    if (!currentLocation || !currentLocation.id) return;

    try {
      const { error } = await supabase
        .from('stock_locations')
        .delete()
        .eq('id', currentLocation.id);

      if (error) {
        throw error;
      }

      handleCloseDeleteDialog();
      await fetchLocations();
      showSnackbar('Emplacement supprimé avec succès', 'success');
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'emplacement:', error);
      showSnackbar('Erreur lors de la suppression de l\'emplacement', 'error');
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Gestion des emplacements de stock
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
            disabled={!locationsTableExists}
          >
            Ajouter un emplacement
          </Button>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchLocations}
          >
            Actualiser
          </Button>
        </Box>
      </Box>

      {!locationsTableExists && (
        <Alert 
          severity="warning" 
          icon={<WarningIcon />}
          sx={{ mb: 3 }}
        >
          <Typography variant="subtitle1" fontWeight="bold">
            La table des emplacements n'existe pas encore dans la base de données
          </Typography>
          <Typography variant="body2" paragraph>
            Pour créer cette table, veuillez exécuter le script SQL suivant dans votre interface Supabase:
          </Typography>
          <Box 
            component="pre" 
            sx={{ 
              p: 2, 
              backgroundColor: 'rgba(0,0,0,0.05)', 
              borderRadius: 1,
              maxHeight: '200px',
              overflow: 'auto',
              fontSize: '0.8rem',
              mb: 2
            }}
          >
            {`-- Create stock_locations table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.stock_locations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    building VARCHAR(100) NOT NULL,
    floor VARCHAR(100),
    room VARCHAR(100),
    display_name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create an index for faster lookups
CREATE INDEX IF NOT EXISTS idx_stock_locations_building ON public.stock_locations(building);

-- Add a few sample locations
INSERT INTO public.stock_locations (building, floor, room, display_name)
VALUES 
  ('Bâtiment A', '1er étage', 'Salle 101', 'Bâtiment A - 1er étage - Salle 101'),
  ('Bâtiment B', '2ème étage', 'Laboratoire 1', 'Bâtiment B - 2ème étage - Laboratoire 1');
`}
          </Box>
          <Typography variant="body2">
            Une fois le script exécuté, actualisez cette page pour commencer à utiliser la fonctionnalité de gestion des emplacements.
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
            <Button 
              variant="contained" 
              color="primary" 
              onClick={fetchLocations}
              startIcon={<RefreshIcon />}
            >
              Vérifier si la table existe
            </Button>
          </Box>
        </Alert>
      )}

      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <TableContainer sx={{ maxHeight: 640 }}>
          <Table stickyHeader aria-label="sticky table">
            <TableHead>
              <TableRow>
                <TableCell><Typography variant="subtitle1" fontWeight="bold">Bâtiment</Typography></TableCell>
                <TableCell><Typography variant="subtitle1" fontWeight="bold">Étage</Typography></TableCell>
                <TableCell><Typography variant="subtitle1" fontWeight="bold">Salle</Typography></TableCell>
                <TableCell><Typography variant="subtitle1" fontWeight="bold">Emplacement complet</Typography></TableCell>
                <TableCell><Typography variant="subtitle1" fontWeight="bold">Actions</Typography></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {locationsTableExists && locations.length > 0 ? (
                locations.map((location) => (
                  <TableRow key={location.id} hover>
                    <TableCell>{location.building}</TableCell>
                    <TableCell>{location.floor || '-'}</TableCell>
                    <TableCell>{location.room || '-'}</TableCell>
                    <TableCell>{location.display_name}</TableCell>
                    <TableCell>
                      <IconButton
                        color="primary"
                        onClick={() => handleOpenDialog(location)}
                        size="small"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        color="error"
                        onClick={() => handleOpenDeleteDialog(location)}
                        size="small"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    {locationsTableExists 
                      ? 'Aucun emplacement trouvé'
                      : 'La table des emplacements n\'existe pas encore'}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {currentLocation?.id ? 'Modifier l\'emplacement' : 'Ajouter un emplacement'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <FormControl fullWidth required>
                <InputLabel id="building-label">Bâtiment</InputLabel>
                <Select
                  labelId="building-label"
                  value={building}
                  label="Bâtiment *"
                  onChange={(e) => setBuilding(e.target.value)}
                >
                  {BUILDINGS.map((b) => (
                    <MenuItem key={b} value={b}>{b}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel id="floor-label">Étage</InputLabel>
                <Select
                  labelId="floor-label"
                  value={floor}
                  label="Étage"
                  onChange={(e) => setFloor(e.target.value)}
                >
                  <MenuItem value="">
                    <em>Non spécifié</em>
                  </MenuItem>
                  {FLOORS.map((f) => (
                    <MenuItem key={f} value={f}>{f}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Salle"
                value={room}
                onChange={(e) => setRoom(e.target.value)}
                placeholder="Ex: Salle 101, Laboratoire 1, etc."
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Annuler</Button>
          <Button onClick={handleSaveLocation} variant="contained">
            Enregistrer
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={isDeleteDialogOpen}
        onClose={handleCloseDeleteDialog}
      >
        <DialogTitle>Confirmer la suppression</DialogTitle>
        <DialogContent>
          <Typography>
            Êtes-vous sûr de vouloir supprimer l'emplacement "{currentLocation?.display_name}" ?
          </Typography>
          <Typography color="error" sx={{ mt: 2 }}>
            Cette action est irréversible.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Annuler</Button>
          <Button onClick={handleDeleteLocation} color="error" variant="contained">
            Supprimer
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
} 