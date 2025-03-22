import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
} from '@mui/material';
import { storageService } from '../../services/storage';
import { useQuery } from '@tanstack/react-query';

type StorageType = 'building' | 'floor' | 'room' | 'unit' | 'shelf' | 'box';
type NameRequiredType = 'building' | 'room' | 'unit' | 'box';
type LevelRequiredType = 'floor' | 'shelf';

interface StorageFormProps {
  open: boolean;
  onClose: () => void;
  type: StorageType;
  parentId?: string;
  onSuccess: () => void;
}

export const StorageForm: React.FC<StorageFormProps> = ({
  open,
  onClose,
  type,
  parentId,
  onSuccess,
}) => {
  const [name, setName] = useState('');
  const [level, setLevel] = useState('');
  const [barcode, setBarcode] = useState('');
  const [selectedBuilding, setSelectedBuilding] = useState<string>('');
  const [selectedFloor, setSelectedFloor] = useState<string>('');
  const [selectedRoom, setSelectedRoom] = useState<string>('');
  const [selectedUnit, setSelectedUnit] = useState<string>('');
  const [selectedShelf, setSelectedShelf] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset form fields when dialog is opened
  useEffect(() => {
    if (open) {
      setName('');
      setLevel('');
      setBarcode('');
      setSelectedBuilding('');
      setSelectedFloor('');
      setSelectedRoom('');
      setSelectedUnit('');
      setSelectedShelf('');
      setError(null);
      
      // If parentId is provided and not creating a building
      if (parentId && type !== 'building') {
        if (type === 'box') {
          setSelectedShelf(parentId);
        } else if (type === 'shelf') {
          setSelectedUnit(parentId);
        } else if (type === 'unit') {
          setSelectedRoom(parentId);
        } else if (type === 'room') {
          setSelectedFloor(parentId);
        } else if (type === 'floor') {
          setSelectedBuilding(parentId);
        }
      }
    }
  }, [open, parentId, type]);

  // Fetch buildings
  const { data: buildings = [], isLoading: isLoadingBuildings } = useQuery({
    queryKey: ['buildings'],
    queryFn: storageService.getBuildings,
    enabled: open && (type === 'box' || type === 'floor'),
  });

  // Filtered data for cascading dropdowns
  const floors = selectedBuilding ? 
    buildings.find(b => b.id === selectedBuilding)?.floors || [] : [];
  
  const rooms = selectedFloor ? 
    floors.find(f => f.id === selectedFloor)?.rooms || [] : [];
  
  const units = selectedRoom ? 
    rooms.find(r => r.id === selectedRoom)?.storage_units || [] : [];
  
  const shelves = selectedUnit ? 
    units.find(u => u.id === selectedUnit)?.shelves || [] : [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      switch (type) {
        case 'building':
          if (!name.trim()) {
            throw new Error('Le nom du bâtiment est requis');
          }
          await storageService.createBuilding(name.trim());
          break;
        case 'floor':
          if (!selectedBuilding && !parentId) {
            throw new Error('Sélectionnez un bâtiment');
          }
          if (!level.trim()) {
            throw new Error('Le niveau est requis');
          }
          await storageService.createFloor(selectedBuilding || parentId || '', parseInt(level.trim()));
          break;
        case 'room':
          if (!selectedFloor && !parentId) {
            throw new Error('Sélectionnez un étage');
          }
          if (!name.trim()) {
            throw new Error('Le nom de la salle est requis');
          }
          await storageService.createRoom(selectedFloor || parentId || '', name.trim());
          break;
        case 'unit':
          if (!selectedRoom && !parentId) {
            throw new Error('Sélectionnez une salle');
          }
          if (!name.trim()) {
            throw new Error('Le nom de l\'unité est requis');
          }
          await storageService.createStorageUnit(selectedRoom || parentId || '', name.trim());
          break;
        case 'shelf':
          if (!selectedUnit && !parentId) {
            throw new Error('Sélectionnez une unité de stockage');
          }
          if (!level.trim()) {
            throw new Error('Le niveau est requis');
          }
          await storageService.createShelf(selectedUnit || parentId || '', parseInt(level.trim()));
          break;
        case 'box':
          if (!selectedShelf && !parentId) {
            throw new Error('Sélectionnez une étagère');
          }
          if (!name.trim()) {
            throw new Error('Le nom de la boîte est requis');
          }
          if (!barcode.trim()) {
            throw new Error('Le code-barres est requis');
          }
          await storageService.createBox(selectedShelf || parentId || '', name.trim(), barcode.trim());
          break;
      }

      onSuccess();
      onClose();
    } catch (err) {
      console.error('Error creating storage item:', err);
      setError(err instanceof Error ? err.message : 'Une erreur est survenue lors de la création');
    } finally {
      setLoading(false);
    }
  };

  const getTitle = () => {
    switch (type) {
      case 'building': return 'Ajouter un bâtiment';
      case 'floor': return 'Ajouter un étage';
      case 'room': return 'Ajouter une salle';
      case 'unit': return 'Ajouter une unité de stockage';
      case 'shelf': return 'Ajouter une étagère';
      case 'box': return 'Ajouter un boîtier';
      default: return 'Ajouter un élément';
    }
  };

  const requiresName = (type: StorageType): type is NameRequiredType => {
    return type === 'building' || type === 'room' || type === 'unit' || type === 'box';
  };

  const requiresLevel = (type: StorageType): type is LevelRequiredType => {
    return type === 'floor' || type === 'shelf';
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{getTitle()}</DialogTitle>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            {type === 'box' && (
              <>
                <Typography variant="subtitle1" gutterBottom>
                  Emplacement du boîtier
                </Typography>
                
                {/* Building Selection */}
                <FormControl fullWidth>
                  <InputLabel>Bâtiment</InputLabel>
                  <Select
                    value={selectedBuilding}
                    onChange={(e) => {
                      setSelectedBuilding(e.target.value);
                      setSelectedFloor('');
                      setSelectedRoom('');
                      setSelectedUnit('');
                      setSelectedShelf('');
                    }}
                    label="Bâtiment"
                  >
                    {isLoadingBuildings ? (
                      <MenuItem disabled>
                        <CircularProgress size={20} />
                      </MenuItem>
                    ) : (
                      buildings.map((building) => (
                        <MenuItem key={building.id} value={building.id}>
                          {building.name}
                        </MenuItem>
                      ))
                    )}
                  </Select>
                </FormControl>
                
                {/* Floor Selection */}
                <FormControl fullWidth disabled={!selectedBuilding}>
                  <InputLabel>Étage</InputLabel>
                  <Select
                    value={selectedFloor}
                    onChange={(e) => {
                      setSelectedFloor(e.target.value);
                      setSelectedRoom('');
                      setSelectedUnit('');
                      setSelectedShelf('');
                    }}
                    label="Étage"
                  >
                    {floors.map((floor) => (
                      <MenuItem key={floor.id} value={floor.id}>
                        {floor.level !== null ? `Étage ${floor.level}` : 'Niveau non spécifié'}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                
                {/* Room Selection */}
                <FormControl fullWidth disabled={!selectedFloor}>
                  <InputLabel>Salle</InputLabel>
                  <Select
                    value={selectedRoom}
                    onChange={(e) => {
                      setSelectedRoom(e.target.value);
                      setSelectedUnit('');
                      setSelectedShelf('');
                    }}
                    label="Salle"
                  >
                    {rooms.map((room) => (
                      <MenuItem key={room.id} value={room.id}>
                        {room.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                
                {/* Unit Selection */}
                <FormControl fullWidth disabled={!selectedRoom}>
                  <InputLabel>Unité de stockage</InputLabel>
                  <Select
                    value={selectedUnit}
                    onChange={(e) => {
                      setSelectedUnit(e.target.value);
                      setSelectedShelf('');
                    }}
                    label="Unité de stockage"
                  >
                    {units.map((unit) => (
                      <MenuItem key={unit.id} value={unit.id}>
                        {unit.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                
                {/* Shelf Selection */}
                <FormControl fullWidth disabled={!selectedUnit}>
                  <InputLabel>Étagère</InputLabel>
                  <Select
                    value={selectedShelf}
                    onChange={(e) => setSelectedShelf(e.target.value)}
                    label="Étagère"
                  >
                    {shelves.map((shelf) => (
                      <MenuItem key={shelf.id} value={shelf.id}>
                        {shelf.level !== null ? `Niveau ${shelf.level}` : 'Étagère non numérotée'}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </>
            )}
            
            {type === 'floor' && !parentId && (
              <FormControl fullWidth>
                <InputLabel>Bâtiment</InputLabel>
                <Select
                  value={selectedBuilding}
                  onChange={(e) => setSelectedBuilding(e.target.value)}
                  label="Bâtiment"
                >
                  {buildings.map((building) => (
                    <MenuItem key={building.id} value={building.id}>
                      {building.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}

            {requiresName(type) && (
              <TextField
                label={type === 'box' ? "Nom du boîtier" : type === 'building' ? "Nom du bâtiment" : type === 'room' ? "Nom de la salle" : "Nom de l'unité"}
                value={name}
                onChange={(e) => setName(e.target.value)}
                fullWidth
                required
              />
            )}

            {requiresLevel(type) && (
              <TextField
                label={type === 'floor' ? "Niveau de l'étage" : "Niveau de l'étagère"}
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                type="number"
                fullWidth
                required
              />
            )}

            {type === 'box' && (
              <TextField
                label="Code-barres"
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
                fullWidth
                required
              />
            )}

            {error && (
              <Typography color="error" variant="body2">
                {error}
              </Typography>
            )}
          </Box>
        </form>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Annuler</Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          disabled={loading}
        >
          {loading ? 'Création...' : 'Créer'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}; 