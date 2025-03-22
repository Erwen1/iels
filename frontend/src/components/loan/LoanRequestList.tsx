import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Stack,
  Typography,
  Chip,
  IconButton,
  Tooltip,
} from '@mui/material';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import UndoIcon from '@mui/icons-material/Undo';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { loanService } from '../../services/loan';
import type { LoanRequest, LoanStatus } from '../../types/equipment';
import { useAuth } from '../../hooks/useAuth';

interface LoanRequestListProps {
  equipmentId?: string;
}

const getStatusColor = (status: LoanStatus): 'default' | 'primary' | 'success' | 'error' | 'warning' => {
  switch (status) {
    case 'EN_ATTENTE':
      return 'warning';
    case 'APPROUVE':
      return 'primary';
    case 'EMPRUNTE':
      return 'success';
    case 'RETOURNE':
      return 'default';
    case 'REFUSE':
      return 'error';
    default:
      return 'default';
  }
};

const getStatusLabel = (status: LoanStatus): string => {
  switch (status) {
    case 'EN_ATTENTE':
      return 'En attente';
    case 'APPROUVE':
      return 'Approuvé';
    case 'EMPRUNTE':
      return 'Emprunté';
    case 'RETOURNE':
      return 'Retourné';
    case 'REFUSE':
      return 'Refusé';
    default:
      return status;
  }
};

export function LoanRequestList({ equipmentId }: LoanRequestListProps) {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const isAdminOrTeacher = user?.role === 'ADMIN' || user?.role === 'ENSEIGNANT';

  const { data: loanRequests = [], isLoading } = useQuery({
    queryKey: ['loanRequests', equipmentId],
    queryFn: () =>
      equipmentId
        ? loanService.getLoanRequestsByEquipment(equipmentId)
        : loanService.getAllLoanRequests(),
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({
      loanId,
      status,
      comment,
    }: {
      loanId: string;
      status: LoanStatus;
      comment?: string;
    }) => loanService.updateLoanStatus(loanId, status, comment),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loanRequests'] });
      if (equipmentId) {
        queryClient.invalidateQueries({ queryKey: ['equipment', equipmentId] });
      }
    },
  });

  const handleStatusUpdate = (loanId: string, status: LoanStatus) => {
    if (!isAdminOrTeacher) return;
    updateStatusMutation.mutate({ loanId, status });
  };

  if (isLoading) {
    return <Typography>Chargement des demandes...</Typography>;
  }

  if (loanRequests.length === 0) {
    return <Typography>Aucune demande d'emprunt trouvée.</Typography>;
  }

  return (
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
          </TableRow>
        </TableHead>
        <TableBody>
          {loanRequests.map((request) => (
            <TableRow key={request.id}>
              <TableCell>{request.equipment?.name}</TableCell>
              <TableCell>{request.project_description}</TableCell>
              <TableCell>{request.loan_manager_email}</TableCell>
              <TableCell>
                {format(new Date(request.borrowing_date), 'dd/MM/yyyy', {
                  locale: fr,
                })}
              </TableCell>
              <TableCell>
                {format(new Date(request.expected_return_date), 'dd/MM/yyyy', {
                  locale: fr,
                })}
              </TableCell>
              <TableCell>
                <Chip
                  label={getStatusLabel(request.status)}
                  color={getStatusColor(request.status)}
                  size="small"
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
} 