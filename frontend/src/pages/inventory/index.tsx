import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Typography,
  Paper,
  Tabs,
  Tab,
  Breadcrumbs,
  Link,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Card,
  CardContent,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  TextField,
  Snackbar,
  Alert,
} from '@mui/material';
import { 
  Add as AddIcon, 
  QrCodeScanner as ScanIcon,
  Inventory as InventoryIcon,
  Settings as SettingsIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { BuildingList } from '../../components/storage/BuildingList';
import { StorageForm } from '../../components/storage/StorageForm';
import { QRCodeScanner } from '../../components/storage/QRCodeScanner';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { storageService } from '../../services/storage';
import type { Building, Box as StorageBox, Equipment } from '../../types/storage';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`storage-tabpanel-${index}`}
      aria-labelledby={`storage-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

// Add this function to render barcode visualization
const BarcodeDisplay = ({ value }: { value: string }) => {
  // Simple representation of a barcode
  return (
    <Box sx={{ 
      mt: 1, 
      display: 'flex', 
      flexDirection: 'column',
      alignItems: 'center',
      width: '100%'
    }}>
      <Box sx={{
        width: '80%',
        height: '60px',
        background: `repeating-linear-gradient(
          to right,
          #000,
          #000 2px,
          #fff 2px,
          #fff 4px
        )`,
        mb: 1,
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: '10%',
          width: '5px',
          height: '100%',
          background: '#fff',
        },
        '&::after': {
          content: '""',
          position: 'absolute',
          top: 0,
          right: '15%',
          width: '5px',
          height: '100%',
          background: '#fff',
        }
      }} />
      <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
        {value}
      </Typography>
    </Box>
  );
};

export const InventoryPage = () => {
  const queryClient = useQueryClient();
  const [tabValue, setTabValue] = useState(0);
  const [formOpen, setFormOpen] = useState(false);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [formType, setFormType] = useState<'building' | 'floor' | 'room' | 'unit' | 'shelf' | 'box'>('building');
  const [parentId, setParentId] = useState<string | undefined>();
  const [breadcrumbs, setBreadcrumbs] = useState<Array<{ label: string; id: string }>>([]);
  const [selectedBox, setSelectedBox] = useState<StorageBox | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [addEquipmentOpen, setAddEquipmentOpen] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState<string>('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');

  const { data: buildings = [], isLoading } = useQuery({
    queryKey: ['buildings'],
    queryFn: storageService.getBuildings,
  });

  const { data: allBoxes = [], isLoading: isLoadingBoxes } = useQuery({
    queryKey: ['boxes'],
    queryFn: async () => {
      const boxes: StorageBox[] = [];
      
      buildings.forEach(building => {
        building.floors?.forEach(floor => {
          floor.rooms?.forEach(room => {
            room.storage_units?.forEach(unit => {
              unit.shelves?.forEach(shelf => {
                if (shelf.boxes && shelf.boxes.length > 0) {
                  boxes.push(...shelf.boxes);
                }
              });
            });
          });
        });
      });
      
      return boxes;
    },
    enabled: !isLoading && buildings.length > 0,
  });

  // Add queries for box equipment
  const { data: boxEquipment = [], isLoading: isLoadingBoxEquipment, refetch: refetchBoxEquipment } = useQuery({
    queryKey: ['box-equipment', selectedBox?.id],
    queryFn: () => storageService.getEquipmentByBoxId(selectedBox?.id || ''),
    enabled: !!selectedBox && detailsOpen,
  });

  // Query for available equipment (not assigned to any box)
  const { data: availableEquipment = [], isLoading: isLoadingAvailableEquipment } = useQuery({
    queryKey: ['available-equipment'],
    queryFn: storageService.getAvailableEquipment,
    enabled: addEquipmentOpen,
  });

  // Mutation for assigning equipment to box
  const assignEquipmentMutation = useMutation({
    mutationFn: ({ equipmentId, boxId }: { equipmentId: string, boxId: string }) => 
      storageService.assignEquipmentToBox(equipmentId, boxId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['box-equipment'] });
      queryClient.invalidateQueries({ queryKey: ['available-equipment'] });
      setSnackbarMessage('Équipement ajouté à la boîte avec succès');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      setAddEquipmentOpen(false);
      setSelectedEquipment('');
      refetchBoxEquipment();
    },
    onError: (error) => {
      setSnackbarMessage(`Erreur: ${error instanceof Error ? error.message : 'Une erreur est survenue'}`);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  });

  // Mutation for removing equipment from box
  const removeEquipmentMutation = useMutation({
    mutationFn: (equipmentId: string) => 
      storageService.removeEquipmentFromBox(selectedBox?.id || '', equipmentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['box-equipment'] });
      queryClient.invalidateQueries({ queryKey: ['available-equipment'] });
      setSnackbarMessage('Équipement retiré de la boîte avec succès');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      refetchBoxEquipment();
    },
    onError: (error) => {
      setSnackbarMessage(`Erreur: ${error instanceof Error ? error.message : 'Une erreur est survenue'}`);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  });

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleAddClick = (type: typeof formType, parentId?: string) => {
    setFormType(type);
    setParentId(parentId);
    setFormOpen(true);
  };

  const handleScan = async (barcode: string) => {
    try {
      const box = await storageService.getBoxByBarcode(barcode);
      if (box) {
        // Navigate to box details or show box info
        console.log('Box found:', box);
      }
    } catch (error) {
      console.error('Error scanning box:', error);
    }
  };

  const handleBreadcrumbClick = (index: number) => {
    setBreadcrumbs(breadcrumbs.slice(0, index + 1));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'success';
      case 'in_use':
        return 'primary';
      case 'maintenance':
        return 'warning';
      default:
        return 'default';
    }
  };

  const translateStatus = (status: string) => {
    switch (status) {
      case 'available':
        return 'Disponible';
      case 'in_use':
        return 'En utilisation';
      case 'maintenance':
        return 'En maintenance';
      default:
        return status;
    }
  };

  // Function to open the box details dialog
  const handleOpenDetails = (box: StorageBox) => {
    setSelectedBox(box);
    setDetailsOpen(true);
  };

  // Function to close the box details dialog
  const handleCloseDetails = () => {
    setDetailsOpen(false);
    setSelectedBox(null);
  };

  // Handler for assigning equipment to box
  const handleAssignEquipment = () => {
    if (selectedBox && selectedEquipment) {
      assignEquipmentMutation.mutate({ 
        equipmentId: selectedEquipment, 
        boxId: selectedBox.id 
      });
    }
  };

  // Handler for removing equipment from box
  const handleRemoveEquipment = (equipmentId: string) => {
    if (selectedBox) {
      removeEquipmentMutation.mutate(equipmentId);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Gestion du stockage
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleAddClick('building')}
          >
            Ajouter
          </Button>
          <Button
            variant="outlined"
            startIcon={<ScanIcon />}
            onClick={() => setScannerOpen(true)}
          >
            Scanner
          </Button>
        </Box>
      </Box>

      <Paper sx={{ mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="Vue hiérarchique" />
          <Tab label="Liste des boîtes" />
        </Tabs>
      </Paper>

      <TabPanel value={tabValue} index={0}>
        <Box sx={{ mb: 3 }}>
          <Breadcrumbs>
            <Link
              component="button"
              variant="body1"
              onClick={() => setBreadcrumbs([])}
            >
              Accueil
            </Link>
            {breadcrumbs.map((crumb, index) => (
              <Link
                key={crumb.id}
                component="button"
                variant="body1"
                onClick={() => handleBreadcrumbClick(index)}
              >
                {crumb.label}
              </Link>
            ))}
          </Breadcrumbs>
        </Box>

        <BuildingList
          buildings={buildings}
          isLoading={isLoading}
          onAddClick={handleAddClick}
          onBreadcrumbClick={handleBreadcrumbClick}
        />
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">Liste des boîtes</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleAddClick('box')}
            size="small"
          >
            Ajouter un boîtier
          </Button>
        </Box>
        
        {isLoadingBoxes ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : allBoxes.length === 0 ? (
          <Typography variant="body1" sx={{ textAlign: 'center', p: 3 }}>
            Aucune boîte trouvée. Ajoutez des boîtes en utilisant le bouton "Ajouter un boîtier".
          </Typography>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Nom</TableCell>
                  <TableCell>Code-barres</TableCell>
                  <TableCell>Emplacement</TableCell>
                  <TableCell>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {allBoxes.map((box) => {
                  // Find shelf and related info for location
                  let location = "-";
                  buildings.forEach(building => {
                    building.floors?.forEach(floor => {
                      floor.rooms?.forEach(room => {
                        room.storage_units?.forEach(unit => {
                          unit.shelves?.forEach(shelf => {
                            if (shelf.id === box.shelf_id) {
                              location = `${building.name}, ${floor.level ? 'Étage ' + floor.level : ''}, ${room.name}`;
                            }
                          });
                        });
                      });
                    });
                  });
                  
                  return (
                    <TableRow key={box.id}>
                      <TableCell>{box.name}</TableCell>
                      <TableCell>{box.barcode}</TableCell>
                      <TableCell>{location}</TableCell>
                      <TableCell>
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => handleOpenDetails(box)}
                        >
                          Détails
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </TabPanel>

      <StorageForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        type={formType}
        parentId={parentId}
        onSuccess={() => {
          setFormOpen(false);
          queryClient.invalidateQueries({ queryKey: ['buildings'] });
        }}
      />

      <QRCodeScanner
        open={scannerOpen}
        onClose={() => setScannerOpen(false)}
        onScan={handleScan}
      />

      {/* Update the Box Details Dialog */}
      <Dialog open={detailsOpen} onClose={handleCloseDetails} maxWidth="md" fullWidth>
        <DialogTitle>
          Détails de la boîte: {selectedBox?.name}
        </DialogTitle>
        <DialogContent dividers>
          {selectedBox && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Informations générales
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    
                    <Grid container spacing={1}>
                      <Grid item xs={4}>
                        <Typography variant="body2" color="text.secondary">ID:</Typography>
                      </Grid>
                      <Grid item xs={8}>
                        <Typography variant="body2">{selectedBox.id}</Typography>
                      </Grid>
                      
                      <Grid item xs={4}>
                        <Typography variant="body2" color="text.secondary">Nom:</Typography>
                      </Grid>
                      <Grid item xs={8}>
                        <Typography variant="body2">{selectedBox.name}</Typography>
                      </Grid>
                      
                      <Grid item xs={4}>
                        <Typography variant="body2" color="text.secondary">Statut:</Typography>
                      </Grid>
                      <Grid item xs={8}>
                        <Chip 
                          label={translateStatus(selectedBox.status)} 
                          color={getStatusColor(selectedBox.status) as "success" | "primary" | "warning" | "default"}
                          size="small"
                        />
                      </Grid>
                      
                      <Grid item xs={4}>
                        <Typography variant="body2" color="text.secondary">Créé le:</Typography>
                      </Grid>
                      <Grid item xs={8}>
                        <Typography variant="body2">
                          {new Date(selectedBox.created_at).toLocaleDateString()}
                        </Typography>
                      </Grid>
                      
                      <Grid item xs={4}>
                        <Typography variant="body2" color="text.secondary">Mis à jour le:</Typography>
                      </Grid>
                      <Grid item xs={8}>
                        <Typography variant="body2">
                          {new Date(selectedBox.updated_at).toLocaleDateString()}
                        </Typography>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>

                <Card variant="outlined" sx={{ mt: 2 }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Emplacement
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    
                    <Typography variant="body2" color="text.secondary">
                      ID Étagère: {selectedBox.shelf_id}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Code-barres
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    
                    <BarcodeDisplay value={selectedBox.barcode} />
                  </CardContent>
                </Card>

                <Card variant="outlined" sx={{ mt: 2 }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Actions
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    
                    <Button 
                      variant="contained" 
                      color="primary" 
                      size="small" 
                      sx={{ mr: 1 }}
                      startIcon={<SettingsIcon />}
                    >
                      Modifier
                    </Button>
                    <Button 
                      variant="outlined" 
                      color="error" 
                      size="small"
                    >
                      Supprimer
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12}>
                <Card variant="outlined">
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="h6">
                        Contenu de la boîte
                      </Typography>
                      <Button 
                        variant="contained" 
                        size="small"
                        startIcon={<AddIcon />}
                        onClick={() => setAddEquipmentOpen(true)}
                      >
                        Ajouter équipement
                      </Button>
                    </Box>
                    <Divider sx={{ mb: 2 }} />
                    
                    {isLoadingBoxEquipment ? (
                      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                        <CircularProgress size={24} />
                      </Box>
                    ) : boxEquipment.length > 0 ? (
                      <List>
                        {boxEquipment.map((item) => (
                          <ListItem 
                            key={item.id} 
                            divider
                            secondaryAction={
                              <IconButton 
                                edge="end" 
                                aria-label="remove" 
                                onClick={() => handleRemoveEquipment(item.id)}
                                color="error"
                                size="small"
                              >
                                <DeleteIcon />
                              </IconButton>
                            }
                          >
                            <ListItemIcon>
                              <InventoryIcon />
                            </ListItemIcon>
                            <ListItemText
                              primary={item.name}
                              secondary={
                                <React.Fragment>
                                  <Typography component="span" variant="body2" color="text.primary">
                                    {item.type}
                                  </Typography>
                                  {" — "}
                                  {item.description || "Pas de description"}
                                </React.Fragment>
                              }
                            />
                            <Chip 
                              label={item.status} 
                              size="small" 
                              color={item.status === 'available' ? 'success' : 'primary'}
                              sx={{ mr: 2 }}
                            />
                          </ListItem>
                        ))}
                      </List>
                    ) : (
                      <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                        Cette boîte est vide. Cliquez sur "Ajouter équipement" pour ajouter du matériel.
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDetails}>Fermer</Button>
        </DialogActions>
      </Dialog>

      {/* Add Equipment Dialog */}
      <Dialog open={addEquipmentOpen} onClose={() => setAddEquipmentOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Ajouter de l'équipement à la boîte
        </DialogTitle>
        <DialogContent dividers>
          {isLoadingAvailableEquipment ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress size={24} />
            </Box>
          ) : availableEquipment.length === 0 ? (
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
              Aucun équipement disponible. Tous les équipements sont déjà assignés à des boîtes.
            </Typography>
          ) : (
            <FormControl fullWidth sx={{ mt: 2 }}>
              <InputLabel id="equipment-select-label">Équipement</InputLabel>
              <Select
                labelId="equipment-select-label"
                id="equipment-select"
                value={selectedEquipment}
                onChange={(e) => setSelectedEquipment(e.target.value)}
                label="Équipement"
              >
                {availableEquipment.map((equipment) => (
                  <MenuItem key={equipment.id} value={equipment.id}>
                    {equipment.name} ({equipment.type})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddEquipmentOpen(false)}>Annuler</Button>
          <Button 
            variant="contained" 
            onClick={handleAssignEquipment}
            disabled={!selectedEquipment || assignEquipmentMutation.isLoading}
          >
            {assignEquipmentMutation.isLoading ? 'En cours...' : 'Ajouter'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
      >
        <Alert 
          onClose={() => setSnackbarOpen(false)} 
          severity={snackbarSeverity}
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}; 