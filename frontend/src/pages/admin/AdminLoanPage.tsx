import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Stack,
  TextField,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import HistoryIcon from '@mui/icons-material/History';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { loanService } from '../../services/loan';
import type { LoanRequest, LoanStatus } from '../../types/equipment';
import { LoanStatusHistory } from '../../components/loan/LoanStatusHistory';

interface AdminCommentDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (comment: string) => void;
  title: string;
}

function AdminCommentDialog({
  open,
  onClose,
  onSubmit,
  title,
}: AdminCommentDialogProps) {
  const [comment, setComment] = useState('');

  const handleSubmit = () => {
    onSubmit(comment);
    setComment('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label="Commentaire administrateur"
          fullWidth
          multiline
          rows={4}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Annuler</Button>
        <Button onClick={handleSubmit} variant="contained" color="primary">
          Valider
        </Button>
      </DialogActions>
    </Dialog>
  );
}

const statusColors: Record<LoanStatus, 'default' | 'warning' | 'success' | 'error' | 'primary'> = {
  'EN_ATTENTE': 'warning',
  'APPROUVE': 'primary',
  'EMPRUNTE': 'success',
  'RETOURNE': 'default',
  'REFUSE': 'error',
};

const statusLabels: Record<LoanStatus, string> = {
  'EN_ATTENTE': 'En attente',
  'APPROUVE': 'Approuvé',
  'EMPRUNTE': 'Emprunté',
  'RETOURNE': 'Retourné',
  'REFUSE': 'Refusé',
};

const statusOptions: { value: LoanStatus; label: string }[] = [
  { value: 'EN_ATTENTE', label: 'En attente' },
  { value: 'APPROUVE', label: 'Approuvé' },
  { value: 'EMPRUNTE', label: 'Emprunté' },
  { value: 'RETOURNE', label: 'Retourné' },
  { value: 'REFUSE', label: 'Refusé' },
];

export function AdminLoanPage() {
  const queryClient = useQueryClient();
  const [selectedStatus, setSelectedStatus] = useState<LoanStatus | 'ALL'>('ALL');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState<LoanRequest | null>(null);
  const [newStatus, setNewStatus] = useState<LoanStatus | ''>('');
  const [comment, setComment] = useState('');

  const { data: loans = [], isLoading, error } = useQuery({
    queryKey: ['loans', 'admin'],
    queryFn: () => loanService.getAllLoanRequests(),
  });

  const updateStatusMutation = useMutation({
    mutationFn: (params: { id: string; status: LoanStatus; comment: string }) =>
      loanService.updateLoanStatus(params.id, params.status, params.comment),
    onSuccess: () => {
      queryClient.invalidateQueries(['loans', 'admin']);
      handleCloseDialog();
    },
  });

  const handleOpenDialog = (loan: LoanRequest) => {
    setSelectedLoan(loan);
    setNewStatus(loan.status);
    setComment('');
  };

  const handleCloseDialog = () => {
    setSelectedLoan(null);
    setNewStatus('');
    setComment('');
  };

  const handleUpdateStatus = () => {
    if (selectedLoan && newStatus) {
      updateStatusMutation.mutate({
        id: selectedLoan.id,
        status: newStatus,
        comment,
      });
    }
  };

  const filteredLoans = loans.filter((loan) => {
    const matchesStatus =
      selectedStatus === 'ALL' || loan.status === selectedStatus;
    const matchesDate =
      (!startDate ||
        new Date(loan.borrowing_date) >= startDate) &&
      (!endDate || new Date(loan.borrowing_date) <= endDate);
    const matchesSearch =
      searchTerm === '' ||
      loan.equipment?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      loan.project_description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      loan.loan_manager_email.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesStatus && matchesDate && matchesSearch;
  });

  if (isLoading) {
    return <Typography>Chargement...</Typography>;
  }

  if (error) {
    return <Typography color="error">Une erreur est survenue lors du chargement des demandes de prêt.</Typography>;
  }

  return (
    <Container maxWidth="xl">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Administration des emprunts
        </Typography>

        <Paper sx={{ p: 2, mb: 2 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                select
                fullWidth
                label="Statut"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value as LoanStatus | 'ALL')}
              >
                <MenuItem value="ALL">Tous les statuts</MenuItem>
                {Object.entries(statusLabels).map(([value, label]) => (
                  <MenuItem key={value} value={value}>
                    {label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <DatePicker
                label="Date début"
                value={startDate}
                onChange={setStartDate}
                slotProps={{ textField: { fullWidth: true } }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <DatePicker
                label="Date fin"
                value={endDate}
                onChange={setEndDate}
                slotProps={{ textField: { fullWidth: true } }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="Rechercher"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Matériel, description, email..."
              />
            </Grid>
          </Grid>
        </Paper>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Matériel</TableCell>
                <TableCell>Description du projet</TableCell>
                <TableCell>Référent</TableCell>
                <TableCell>Date d'emprunt</TableCell>
                <TableCell>Date de retour</TableCell>
                <TableCell>Statut</TableCell>
                <TableCell>Commentaire admin</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredLoans.map((loan) => (
                <TableRow key={loan.id}>
                  <TableCell>{loan.equipment?.name}</TableCell>
                  <TableCell>{loan.project_description}</TableCell>
                  <TableCell>{loan.loan_manager_email}</TableCell>
                  <TableCell>
                    {format(new Date(loan.borrowing_date), 'dd/MM/yyyy', {
                      locale: fr,
                    })}
                  </TableCell>
                  <TableCell>
                    {format(new Date(loan.expected_return_date), 'dd/MM/yyyy', {
                      locale: fr,
                    })}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={statusLabels[loan.status]}
                      color={statusColors[loan.status]}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{loan.admin_comment || '-'}</TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1}>
                      {loan.status === 'EN_ATTENTE' && (
                        <>
                          <IconButton
                            size="small"
                            color="success"
                            onClick={() => handleOpenDialog(loan)}
                            title="Mettre à jour le statut"
                          >
                            <HistoryIcon />
                          </IconButton>
                        </>
                      )}
                      {loan.status === 'APPROUVE' && (
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handleOpenDialog(loan)}
                          title="Mettre à jour le statut"
                        >
                          <HistoryIcon />
                        </IconButton>
                      )}
                      {loan.status === 'EMPRUNTE' && (
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handleOpenDialog(loan)}
                          title="Mettre à jour le statut"
                        >
                          <HistoryIcon />
                        </IconButton>
                      )}
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Dialog open={!!selectedLoan} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
          <DialogTitle>Mettre à jour le statut</DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 2 }}>
              <TextField
                select
                fullWidth
                label="Nouveau statut"
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value as LoanStatus)}
                sx={{ mb: 2 }}
              >
                {statusOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                fullWidth
                label="Commentaire"
                multiline
                rows={4}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Annuler</Button>
            <Button
              onClick={handleUpdateStatus}
              variant="contained"
              disabled={!newStatus || updateStatusMutation.isLoading}
            >
              {updateStatusMutation.isLoading ? 'Mise à jour...' : 'Mettre à jour'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
} 