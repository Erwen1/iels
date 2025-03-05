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

interface ActionDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (comment: string) => void;
  title: string;
  action: string;
}

const ActionDialog: React.FC<ActionDialogProps> = ({
  open,
  onClose,
  onConfirm,
  title,
  action,
}) => {
  const [comment, setComment] = useState('');

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label="Commentaire"
          fullWidth
          multiline
          rows={4}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Annuler</Button>
        <Button onClick={() => onConfirm(comment)} color="primary">
          {action}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export const LoanManagementPage = () => {
  const queryClient = useQueryClient();
  const [selectedLoan, setSelectedLoan] = useState<{
    loan: LoanRequest | null;
    action: 'approve' | 'reject' | null;
  }>({ loan: null, action: null });

  const { data: loanRequests, isLoading } = useQuery({
    queryKey: ['loanRequests'],
    queryFn: () => loanService.getAllLoanRequests(),
  });

  const updateLoanStatusMutation = useMutation({
    mutationFn: ({
      loanId,
      status,
      comment,
    }: {
      loanId: string;
      status: LoanStatus;
      comment: string;
    }) => loanService.updateLoanStatus(loanId, status, comment),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loanRequests'] });
      handleCloseDialog();
    },
  });

  const handleAction = (loan: LoanRequest, action: 'approve' | 'reject') => {
    setSelectedLoan({ loan, action });
  };

  const handleCloseDialog = () => {
    setSelectedLoan({ loan: null, action: null });
  };

  const handleConfirmAction = (comment: string) => {
    if (!selectedLoan.loan || !selectedLoan.action) return;

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
        Gestion des emprunts
      </Typography>

      <Paper sx={{ mt: 3 }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID Matériel</TableCell>
                <TableCell>Projet</TableCell>
                <TableCell>Référent</TableCell>
                <TableCell>Date d'emprunt</TableCell>
                <TableCell>Retour prévu</TableCell>
                <TableCell>Statut</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loanRequests?.map((loan) => (
                <TableRow key={loan.id}>
                  <TableCell>{loan.equipment_id}</TableCell>
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
                      label={loan.status}
                      color={getStatusColor(loan.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {loan.status === 'EN_ATTENTE' && (
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                          size="small"
                          variant="contained"
                          color="primary"
                          onClick={() => handleAction(loan, 'approve')}
                        >
                          Approuver
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          color="error"
                          onClick={() => handleAction(loan, 'reject')}
                        >
                          Refuser
                        </Button>
                      </Box>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <ActionDialog
        open={!!selectedLoan.action}
        onClose={handleCloseDialog}
        onConfirm={handleConfirmAction}
        title={
          selectedLoan.action === 'approve'
            ? 'Approuver la demande'
            : 'Refuser la demande'
        }
        action={selectedLoan.action === 'approve' ? 'Approuver' : 'Refuser'}
      />
    </Box>
  );
}; 