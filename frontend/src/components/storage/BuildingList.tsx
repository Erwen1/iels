import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  IconButton,
  Collapse,
  CircularProgress,
  Chip,
} from '@mui/material';
import {
  Add as AddIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Inventory as InventoryIcon,
} from '@mui/icons-material';
import type { Building, Floor, Room, StorageUnit, Shelf, Box as StorageBox } from '../../types/storage';

interface BuildingListProps {
  buildings: Building[];
  isLoading: boolean;
  onAddClick: (type: 'building' | 'floor' | 'room' | 'unit' | 'shelf' | 'box', parentId?: string) => void;
  onBreadcrumbClick: (index: number) => void;
}

export const BuildingList: React.FC<BuildingListProps> = ({
  buildings,
  isLoading,
  onAddClick,
  onBreadcrumbClick,
}) => {
  const [expandedBuildings, setExpandedBuildings] = React.useState<Record<string, boolean>>({});
  const [expandedFloors, setExpandedFloors] = React.useState<Record<string, boolean>>({});
  const [expandedRooms, setExpandedRooms] = React.useState<Record<string, boolean>>({});
  const [expandedUnits, setExpandedUnits] = React.useState<Record<string, boolean>>({});
  const [expandedShelves, setExpandedShelves] = React.useState<Record<string, boolean>>({});

  const toggleBuilding = (buildingId: string) => {
    setExpandedBuildings(prev => ({
      ...prev,
      [buildingId]: !prev[buildingId],
    }));
  };

  const toggleFloor = (floorId: string) => {
    setExpandedFloors(prev => ({
      ...prev,
      [floorId]: !prev[floorId],
    }));
  };

  const toggleRoom = (roomId: string) => {
    setExpandedRooms(prev => ({
      ...prev,
      [roomId]: !prev[roomId],
    }));
  };

  const toggleUnit = (unitId: string) => {
    setExpandedUnits(prev => ({
      ...prev,
      [unitId]: !prev[unitId],
    }));
  };

  const toggleShelf = (shelfId: string) => {
    setExpandedShelves(prev => ({
      ...prev,
      [shelfId]: !prev[shelfId],
    }));
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (buildings.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', p: 3 }}>
        <Typography variant="body1" color="text.secondary">
          Aucun bâtiment trouvé. Cliquez sur "Ajouter" pour créer un nouveau bâtiment.
        </Typography>
      </Box>
    );
  }

  return (
    <Grid container spacing={2}>
      {buildings.map((building) => (
        <Grid item xs={12} key={building.id}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <IconButton onClick={() => toggleBuilding(building.id)}>
                    {expandedBuildings[building.id] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                  </IconButton>
                  <Typography variant="h6" component="div">
                    {building.name}
                  </Typography>
                </Box>
                <Button
                  startIcon={<AddIcon />}
                  onClick={() => onAddClick('floor', building.id)}
                >
                  Ajouter un étage
                </Button>
              </Box>

              <Collapse in={expandedBuildings[building.id]}>
                <Box sx={{ ml: 4, mt: 2 }}>
                  {building.floors?.map((floor) => (
                    <Card key={floor.id} sx={{ mb: 2 }}>
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <IconButton onClick={() => toggleFloor(floor.id)}>
                              {expandedFloors[floor.id] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                            </IconButton>
                            <Typography variant="subtitle1">
                              Étage {floor.level}
                            </Typography>
                          </Box>
                          <Button
                            startIcon={<AddIcon />}
                            onClick={() => onAddClick('room', floor.id)}
                          >
                            Ajouter une salle
                          </Button>
                        </Box>

                        <Collapse in={expandedFloors[floor.id]}>
                          <Box sx={{ ml: 4, mt: 2 }}>
                            {floor.rooms?.map((room) => (
                              <Card key={room.id} sx={{ mb: 2 }}>
                                <CardContent>
                                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                      <IconButton onClick={() => toggleRoom(room.id)}>
                                        {expandedRooms[room.id] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                                      </IconButton>
                                      <Typography variant="body1">
                                        {room.name}
                                      </Typography>
                                    </Box>
                                    <Button
                                      startIcon={<AddIcon />}
                                      onClick={() => onAddClick('unit', room.id)}
                                    >
                                      Ajouter une unité
                                    </Button>
                                  </Box>
                                  
                                  <Collapse in={expandedRooms[room.id]}>
                                    <Box sx={{ ml: 4, mt: 2 }}>
                                      {room.storage_units?.map((unit) => (
                                        <Card key={unit.id} sx={{ mb: 2 }}>
                                          <CardContent>
                                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <IconButton onClick={() => toggleUnit(unit.id)}>
                                                  {expandedUnits[unit.id] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                                                </IconButton>
                                                <Typography variant="body1">
                                                  {unit.name}
                                                </Typography>
                                              </Box>
                                              <Button
                                                startIcon={<AddIcon />}
                                                onClick={() => onAddClick('shelf', unit.id)}
                                                size="small"
                                              >
                                                Ajouter une étagère
                                              </Button>
                                            </Box>
                                            
                                            <Collapse in={expandedUnits[unit.id]}>
                                              <Box sx={{ ml: 4, mt: 2 }}>
                                                {unit.shelves?.map((shelf) => (
                                                  <Card key={shelf.id} sx={{ mb: 2 }}>
                                                    <CardContent>
                                                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                          <IconButton onClick={() => toggleShelf(shelf.id)}>
                                                            {expandedShelves[shelf.id] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                                                          </IconButton>
                                                          <Typography variant="body2">
                                                            Étagère {shelf.level}
                                                          </Typography>
                                                          {shelf.boxes && shelf.boxes.length > 0 && (
                                                            <Chip 
                                                              label={`${shelf.boxes.length} boîtes`} 
                                                              size="small" 
                                                              color="primary"
                                                            />
                                                          )}
                                                        </Box>
                                                        <Button
                                                          startIcon={<AddIcon />}
                                                          onClick={() => onAddClick('box', shelf.id)}
                                                          size="small"
                                                        >
                                                          Ajouter un boîtier
                                                        </Button>
                                                      </Box>
                                                      
                                                      <Collapse in={expandedShelves[shelf.id]}>
                                                        <Box sx={{ ml: 4, mt: 2 }}>
                                                          {shelf.boxes && shelf.boxes.length > 0 ? (
                                                            shelf.boxes.map((box) => (
                                                              <Card key={box.id} sx={{ mb: 1, bgcolor: 'background.default' }}>
                                                                <CardContent sx={{ py: 1, '&:last-child': { pb: 1 } }}>
                                                                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                                      <InventoryIcon fontSize="small" color="action" />
                                                                      <Typography variant="body2">
                                                                        {box.name} ({box.barcode})
                                                                      </Typography>
                                                                    </Box>
                                                                  </Box>
                                                                </CardContent>
                                                              </Card>
                                                            ))
                                                          ) : (
                                                            <Typography variant="body2" color="text.secondary" sx={{ py: 1 }}>
                                                              Aucun boîtier sur cette étagère
                                                            </Typography>
                                                          )}
                                                        </Box>
                                                      </Collapse>
                                                    </CardContent>
                                                  </Card>
                                                ))}
                                              </Box>
                                            </Collapse>
                                          </CardContent>
                                        </Card>
                                      ))}
                                    </Box>
                                  </Collapse>
                                </CardContent>
                              </Card>
                            ))}
                          </Box>
                        </Collapse>
                      </CardContent>
                    </Card>
                  ))}
                </Box>
              </Collapse>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}; 