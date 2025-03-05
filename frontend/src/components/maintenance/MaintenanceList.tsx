import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
  Chip,
  Stack,
  Typography,
} from '@mui/material';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { maintenanceService } from '../../services/maintenance';
import type { MaintenanceRecord, MaintenanceType } from '../../types/equipment';

interface MaintenanceListProps {
  equipmentId?: string;
  onEdit?: (record: MaintenanceRecord) => void;
}

const getMaintenanceTypeLabel = (type: MaintenanceType): string => {
  switch (type) {
    case 'PREVENTIF':
      return 'Préventif';
    case 'CORRECTIF':
      return 'Correctif';
    case 'INSPECTION':
      return 'Inspection';
    default:
      return type;
  }
};

const getMaintenanceTypeColor = (
  type: MaintenanceType
): 'default' | 'primary' | 'success' | 'warning' => {
  switch (type) {
    case 'PREVENTIF':
      return 'primary';
    case 'CORRECTIF':
      return 'warning';
    case 'INSPECTION':
      return 'success';
    default:
      return 'default';
  }
};

export function MaintenanceList({ equipmentId, onEdit }: MaintenanceListProps) {
  const queryClient = useQueryClient();

  const { data: maintenanceRecords = [], isLoading } = useQuery({
    queryKey: ['maintenanceRecords', equipmentId],
    queryFn: () =>
      equipmentId
        ? maintenanceService.getMaintenanceRecordsByEquipment(equipmentId)
        : maintenanceService.getAllMaintenanceRecords(),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => maintenanceService.deleteMaintenanceRecord(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['maintenanceRecords']);
      if (equipmentId) {
        queryClient.invalidateQueries(['equipment', equipmentId]);
      }
    },
  });

  const handleDelete = (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet enregistrement ?')) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading) {
    return <Typography>Chargement des enregistrements...</Typography>;
  }

  if (maintenanceRecords.length === 0) {
    return <Typography>Aucun enregistrement de maintenance trouvé.</Typography>;
  }

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Type</TableCell>
            <TableCell>Date</TableCell>
            <TableCell>Description</TableCell>
            <TableCell>Effectué par</TableCell>
            <TableCell>Prochaine maintenance</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {maintenanceRecords.map((record) => (
            <TableRow key={record.id}>
              <TableCell>
                <Chip
                  label={getMaintenanceTypeLabel(record.maintenance_type)}
                  color={getMaintenanceTypeColor(record.maintenance_type)}
                  size="small"
                />
              </TableCell>
              <TableCell>
                {format(new Date(record.maintenance_date), 'dd/MM/yyyy', {
                  locale: fr,
                })}
              </TableCell>
              <TableCell>{record.description}</TableCell>
              <TableCell>{record.performed_by}</TableCell>
              <TableCell>
                {record.next_maintenance_date
                  ? format(new Date(record.next_maintenance_date), 'dd/MM/yyyy', {
                      locale: fr,
                    })
                  : '-'}
              </TableCell>
              <TableCell>
                <Stack direction="row" spacing={1}>
                  {onEdit && (
                    <Tooltip title="Modifier">
                      <IconButton
                        size="small"
                        onClick={() => onEdit(record)}
                        color="primary"
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                  )}
                  <Tooltip title="Supprimer">
                    <IconButton
                      size="small"
                      onClick={() => handleDelete(record.id)}
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </Stack>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
} 