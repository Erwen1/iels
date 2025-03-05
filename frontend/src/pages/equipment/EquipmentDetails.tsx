import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import { format } from 'date-fns';
import { equipmentService } from '../../services/equipment';
import type { Equipment, LoanRequest } from '../../types/equipment';
import { MaintenanceRecordForm } from '../../components/forms/MaintenanceRecordForm';

const getStatusColor = (status: Equipment['status']) => {
  const colors: Record<Equipment['status'], 'success' | 'error' | 'warning' | 'default'> = {
    DISPONIBLE: 'success',
    EMPRUNTE: 'warning',
    MAINTENANCE: 'error',
    HORS_SERVICE: 'default',
  };
  return colors[status];
};

export const EquipmentDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [maintenanceFormOpen, setMaintenanceFormOpen] = useState(false);
  const [error, setError] = useState<string>('');

  const { data: equipment, isLoading } = useQuery({
    queryKey: ['equipment', id],
    queryFn: () => equipmentService.getEquipmentById(id!),
    enabled: !!id,
  });

  const deleteMutation = useMutation({
    mutationFn: () => equipmentService.deleteEquipment(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipment'] });
      navigate('/equipment');
    },
    onError: (err: any) => {
      setError(err.message || 'Une erreur est survenue lors de la suppression');
      setDeleteDialogOpen(false);
    },
  });

  if (isLoading) {
    return <Typography>Chargement...</Typography>;
  }

  if (!equipment) {
    return <Typography>Matériel non trouvé</Typography>;
  }

  const handleDelete = () => {
    deleteMutation.mutate();
  };

  return (
    <Box sx={{ p: 3 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
          <Box>
            <Typography variant="h4" gutterBottom>
              {equipment.name}
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Référence: {equipment.reference}
            </Typography>
          </Box>
          <Box>
            <Button
              variant="outlined"
              color="primary"
              onClick={() => navigate(`/equipment/${id}/edit`)}
              sx={{ mr: 1 }}
            >
              Modifier
            </Button>
            <Button
              variant="outlined"
              color="error"
              onClick={() => setDeleteDialogOpen(true)}
            >
              Supprimer
            </Button>
          </Box>
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <List>
              <ListItem>
                <ListItemText
                  primary="Département hébergeur"
                  secondary={equipment.department}
                />
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemText
                  primary="Quantité"
                  secondary={equipment.quantity}
                />
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemText
                  primary="Localisation"
                  secondary={
                    equipment.location
                      ? `${equipment.location.building} - ${equipment.location.room}`
                      : 'N/A'
                  }
                />
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemText
                  primary="Référent matériel"
                  secondary={equipment.equipment_manager_email}
                />
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemText
                  primary="Disponibilité"
                  secondary={
                    <Chip
                      label={equipment.status}
                      color={getStatusColor(equipment.status)}
                      size="small"
                      sx={{ mt: 1 }}
                    />
                  }
                />
              </ListItem>
            </List>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>
              Description/utilisation
            </Typography>
            <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
              <Typography variant="body1" style={{ whiteSpace: 'pre-wrap' }}>
                {equipment.description}
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Paper>

      {/* Loan History Section */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
          <Typography variant="h5">Historique des emprunts</Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate(`/loans/new?equipmentId=${id}`)}
          >
            Nouvel emprunt
          </Button>
        </Box>

        {equipment.loan_requests?.length > 0 ? (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Projet</TableCell>
                  <TableCell>Référent</TableCell>
                  <TableCell>Date d'emprunt</TableCell>
                  <TableCell>Retour prévu</TableCell>
                  <TableCell>Retour effectif</TableCell>
                  <TableCell>Statut</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {equipment.loan_requests.map((loan: LoanRequest) => (
                  <TableRow key={loan.id}>
                    <TableCell>{loan.project_description}</TableCell>
                    <TableCell>{loan.loan_manager_email}</TableCell>
                    <TableCell>{format(new Date(loan.borrowing_date), 'dd/MM/yyyy')}</TableCell>
                    <TableCell>{format(new Date(loan.expected_return_date), 'dd/MM/yyyy')}</TableCell>
                    <TableCell>
                      {loan.actual_return_date
                        ? format(new Date(loan.actual_return_date), 'dd/MM/yyyy')
                        : '-'}
                    </TableCell>
                    <TableCell>{loan.status}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Typography color="text.secondary" align="center">
            Aucun historique d'emprunt
          </Typography>
        )}
      </Paper>

      {/* Maintenance Records Section */}
      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
          <Typography variant="h5">Registre de maintenance</Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() => setMaintenanceFormOpen(true)}
          >
            Nouvelle maintenance
          </Button>
        </Box>

        {equipment.maintenance_records?.length > 0 ? (
          <List>
            {equipment.maintenance_records.map((record) => (
              <React.Fragment key={record.id}>
                <ListItem>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="subtitle1">
                          {record.maintenance_type}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {format(new Date(record.maintenance_date), 'dd/MM/yyyy')}
                        </Typography>
                      </Box>
                    }
                    secondary={
                      <>
                        <Typography variant="body2">{record.description}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          Effectué par: {record.performed_by}
                        </Typography>
                      </>
                    }
                  />
                </ListItem>
                <Divider />
              </React.Fragment>
            ))}
          </List>
        ) : (
          <Typography color="text.secondary" align="center">
            Aucun historique de maintenance
          </Typography>
        )}
      </Paper>

      <MaintenanceRecordForm
        equipmentId={id!}
        open={maintenanceFormOpen}
        onClose={() => setMaintenanceFormOpen(false)}
      />

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Supprimer le matériel</DialogTitle>
        <DialogContent>
          Êtes-vous sûr de vouloir supprimer ce matériel ? Cette action est irréversible.
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Annuler</Button>
          <Button onClick={handleDelete} color="error">
            Supprimer
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}; 