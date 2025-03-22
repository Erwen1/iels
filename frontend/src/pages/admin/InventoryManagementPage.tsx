import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Button,
  Grid,
  Paper,
  IconButton,
  Breadcrumbs,
  Link,
  Tabs,
  Tab,
} from '@mui/material';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';
import AddIcon from '@mui/icons-material/Add';
import { QRCodeScanner } from '../../components/storage/QRCodeScanner';
import { StorageForm } from '../../components/storage/StorageForm';
import { storageService } from '../../services/storage';
import type { Building, Floor, Room, StorageUnit, Box as StorageBox } from '../../types/storage';

export const InventoryManagementPage: React.FC = () => {
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<{
    building?: Building;
    floor?: Floor;
    room?: Room;
    unit?: StorageUnit;
  }>({});
  const [scannerOpen, setScannerOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBuildings();
  }, []);

  const loadBuildings = async () => {
    try {
      const data = await storageService.getBuildings();
      setBuildings(data);
    } catch (error) {
      console.error('Error loading buildings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleScan = async (result: string) => {
    try {
      const box = await storageService.getBoxByBarcode(result);
      if (box) {
        // Navigate to box details
        console.log('Box found:', box);
      }
    } catch (error) {
      console.error('Error scanning box:', error);
    }
  };

  const getFormType = () => {
    if (!selectedLocation.building) return 'building';
    if (!selectedLocation.floor) return 'floor';
    if (!selectedLocation.room) return 'room';
    if (!selectedLocation.unit) return 'unit';
    return 'shelf';
  };

  const getParentId = () => {
    if (!selectedLocation.building) return undefined;
    if (!selectedLocation.floor) return selectedLocation.building.id;
    if (!selectedLocation.room) return selectedLocation.floor.id;
    if (!selectedLocation.unit) return selectedLocation.room.id;
    return selectedLocation.unit.id;
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
          <div>
            <Typography variant="h4" gutterBottom>
              Gestion des emplacements de stock
            </Typography>
            <Breadcrumbs aria-label="breadcrumb">
              {selectedLocation.building && (
                <Link 
                  component="button"
                  onClick={() => setSelectedLocation({})}
                >
                  {selectedLocation.building.name}
                </Link>
              )}
              {selectedLocation.floor && (
                <Link
                  component="button"
                  onClick={() => setSelectedLocation({ building: selectedLocation.building })}
                >
                  Étage {selectedLocation.floor.level}
                </Link>
              )}
              {selectedLocation.room && (
                <Link
                  component="button"
                  onClick={() => 
                    setSelectedLocation({ 
                      building: selectedLocation.building,
                      floor: selectedLocation.floor 
                    })
                  }
                >
                  {selectedLocation.room.name}
                </Link>
              )}
            </Breadcrumbs>
          </div>
          <Box>
            <Button
              startIcon={<QrCodeScannerIcon />}
              onClick={() => setScannerOpen(true)}
              sx={{ mr: 2 }}
            >
              Scanner
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setFormOpen(true)}
            >
              Ajouter
            </Button>
          </Box>
        </Box>

        {/* Content */}
        <Grid container spacing={3}>
          {buildings.map((building) => (
            <Grid item xs={12} key={building.id}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  {building.name}
                </Typography>
                {/* Render floors, rooms, etc. */}
              </Paper>
            </Grid>
          ))}
        </Grid>

        {/* QR Code Scanner */}
        <QRCodeScanner
          open={scannerOpen}
          onClose={() => setScannerOpen(false)}
          onScan={handleScan}
        />

        {/* Add Form */}
        <StorageForm
          open={formOpen}
          onClose={() => setFormOpen(false)}
          type={getFormType()}
          parentId={getParentId()}
          onSuccess={() => {
            loadBuildings();
            setFormOpen(false);
          }}
        />
      </Box>
    </Container>
  );
}; 