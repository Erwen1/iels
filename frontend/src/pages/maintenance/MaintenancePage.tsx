import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { MaintenanceList } from '../../components/maintenance/MaintenanceList';
import { MaintenanceForm } from '../../components/forms/MaintenanceForm';
import type { Equipment, MaintenanceRecord } from '../../types/equipment';
import { useQuery } from '@tanstack/react-query';
import { equipmentService } from '../../services/equipment';

interface MaintenanceDialogProps {
  open: boolean;
  onClose: () => void;
  equipment: Equipment;
  maintenanceRecord?: MaintenanceRecord;
}

function MaintenanceDialog({
  open,
  onClose,
  equipment,
  maintenanceRecord,
}: MaintenanceDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {maintenanceRecord ? 'Modifier' : 'Ajouter'} une maintenance
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{ position: 'absolute', right: 8, top: 8 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <MaintenanceForm
          equipment={equipment}
          maintenanceRecord={maintenanceRecord}
          onSuccess={onClose}
        />
      </DialogContent>
    </Dialog>
  );
}

export function MaintenancePage() {
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(
    null
  );
  const [selectedRecord, setSelectedRecord] = useState<MaintenanceRecord | null>(
    null
  );

  const { data: equipmentList = [] } = useQuery({
    queryKey: ['equipment'],
    queryFn: () => equipmentService.getAllEquipment(),
  });

  const handleAddMaintenance = (equipment: Equipment) => {
    setSelectedEquipment(equipment);
    setSelectedRecord(null);
  };

  const handleEditMaintenance = (record: MaintenanceRecord) => {
    const equipmentItem = equipmentList.find((e: Equipment) => e.id === record.equipment_id);
    if (equipmentItem) {
      setSelectedEquipment(equipmentItem);
      setSelectedRecord(record);
    }
  };

  const handleCloseDialog = () => {
    setSelectedEquipment(null);
    setSelectedRecord(null);
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Gestion de la maintenance
        </Typography>

        <MaintenanceList onEdit={handleEditMaintenance} />

        {selectedEquipment && (
          <MaintenanceDialog
            open={true}
            onClose={handleCloseDialog}
            equipment={selectedEquipment}
            maintenanceRecord={selectedRecord || undefined}
          />
        )}
      </Box>
    </Container>
  );
} 