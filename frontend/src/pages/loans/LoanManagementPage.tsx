import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { useState } from 'react';
import type { LoanRequest, LoanStatus } from '../../types/equipment';
import { loanService } from '../../services/loan';
import { useAuth } from '../../hooks/useAuth';

const getStatusColor = (status: LoanStatus) => {
  const colors: Record<LoanStatus, 'success' | 'error' | 'warning' | 'info' | 'default'> = {
    EN_ATTENTE: 'warning',
    APPROUVE: 'info',
    EMPRUNTE: 'success',
    RETOURNE: 'default',
    REFUSE: 'error',
  };
  return colors[status];
};

const getStatusLabel = (status: LoanStatus): string => {
  const labels: Record<LoanStatus, string> = {
    EN_ATTENTE: 'En attente',
    APPROUVE: 'Approuvé',
    EMPRUNTE: 'Emprunté',
    RETOURNE: 'Retourné',
    REFUSE: 'Refusé',
  };
  return labels[status];
};

export const LoanManagementPage = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const isAdminOrTeacher = user?.role === 'ADMIN' || user?.role === 'ENSEIGNANT';
  
  const [selectedLoan, setSelectedLoan] = useState<{
    loan: LoanRequest | null;
    action: 'approve' | 'reject' | null;
  }>({ loan: null, action: null });

  const { data: loanRequests, isLoading } = useQuery({
    queryKey: ['loanRequests'],
    queryFn: () => isAdminOrTeacher 
      ? loanService.getAllLoanRequests()
      : loanService.getUserLoanHistory(),
  });

  // Mutations et handlers uniquement pour admin/enseignant
  const updateLoanStatusMutation = useMutation({
    mutationFn: ({
      loanId,
      status,
      comment,
    }: {
      loanId: string;
      status: LoanStatus;
      comment: string;
    }) => {
      if (!isAdminOrTeacher) {
        throw new Error("Opération non autorisée");
      }
      return loanService.updateLoanStatus(loanId, status, comment);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loanRequests'] });
      handleCloseDialog();
    },
  });

  const handleAction = (loan: LoanRequest, action: 'approve' | 'reject') => {
    if (!isAdminOrTeacher) return;
    setSelectedLoan({ loan, action });
  };

  const handleCloseDialog = () => {
    if (!isAdminOrTeacher) return;
    setSelectedLoan({ loan: null, action: null });
  };

  const handleConfirmAction = (comment: string) => {
    if (!isAdminOrTeacher || !selectedLoan.loan || !selectedLoan.action) return;

    const status: LoanStatus =
      selectedLoan.action === 'approve' ? 'APPROUVE' : 'REFUSE';

    updateLoanStatusMutation.mutate({
      loanId: selectedLoan.loan.id,
      status,
      comment,
    });
  };

  if (isLoading) {
    return <Typography>Chargement...</Typography>;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        {isAdminOrTeacher ? 'Gestion des emprunts' : 'Mes emprunts'}
      </Typography>

      <Paper sx={{ mt: 3 }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Matériel</TableCell>
                <TableCell>Description du projet</TableCell>
                <TableCell>Référent</TableCell>
                <TableCell>Date d'emprunt</TableCell>
                <TableCell>Date de retour</TableCell>
                <TableCell>Statut</TableCell>
                {isAdminOrTeacher && <TableCell>Actions</TableCell>}
              </TableRow>
            </TableHead>
            <TableBody>
              {loanRequests?.map((loan) => (
                <TableRow key={loan.id}>
                  <TableCell>{loan.equipment?.name || loan.equipment_id}</TableCell>
                  <TableCell>{loan.project_description}</TableCell>
                  <TableCell>{loan.loan_manager_email}</TableCell>
                  <TableCell>
                    {format(new Date(loan.borrowing_date), 'dd/MM/yyyy')}
                  </TableCell>
                  <TableCell>
                    {format(new Date(loan.expected_return_date), 'dd/MM/yyyy')}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={getStatusLabel(loan.status)}
                      color={getStatusColor(loan.status)}
                      size="small"
                    />
                  </TableCell>
                  {isAdminOrTeacher && loan.status === 'EN_ATTENTE' && (
                    <TableCell>
                      <Button
                        variant="contained"
                        color="success"
                        size="small"
                        onClick={() => handleAction(loan, 'approve')}
                        sx={{ mr: 1 }}
                      >
                        Accepter
                      </Button>
                      <Button
                        variant="contained"
                        color="error"
                        size="small"
                        onClick={() => handleAction(loan, 'reject')}
                      >
                        Refuser
                      </Button>
                    </TableCell>
                  )}
                  {isAdminOrTeacher && loan.status !== 'EN_ATTENTE' && (
                    <TableCell>-</TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {isAdminOrTeacher && (
        <Dialog open={!!selectedLoan.loan} onClose={handleCloseDialog}>
          <DialogTitle>
            {selectedLoan.action === 'approve'
              ? 'Accepter la demande'
              : 'Refuser la demande'}
          </DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Commentaire"
              fullWidth
              multiline
              rows={4}
              variant="outlined"
              onChange={(e) => handleConfirmAction(e.target.value)}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Annuler</Button>
            <Button
              onClick={() => handleConfirmAction('')}
              color={selectedLoan.action === 'approve' ? 'success' : 'error'}
              variant="contained"
            >
              {selectedLoan.action === 'approve' ? 'Accepter' : 'Refuser'}
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Box>
  );
}; 