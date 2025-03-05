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
            <TableCell>Actions</TableCell>
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
              <TableCell>
                <Stack direction="row" spacing={1}>
                  {request.status === 'EN_ATTENTE' && (
                    <>
                      <Tooltip title="Approuver">
                        <IconButton
                          size="small"
                          color="success"
                          onClick={() =>
                            handleStatusUpdate(request.id, 'APPROUVE')
                          }
                        >
                          <CheckIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Refuser">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleStatusUpdate(request.id, 'REFUSE')}
                        >
                          <CloseIcon />
                        </IconButton>
                      </Tooltip>
                    </>
                  )}
                  {request.status === 'APPROUVE' && (
                    <Tooltip title="Marquer comme emprunté">
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() =>
                          handleStatusUpdate(request.id, 'EMPRUNTE')
                        }
                      >
                        Emprunté
                      </Button>
                    </Tooltip>
                  )}
                  {request.status === 'EMPRUNTE' && (
                    <Tooltip title="Marquer comme retourné">
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => handleStatusUpdate(request.id, 'RETOURNE')}
                      >
                        <UndoIcon />
                      </IconButton>
                    </Tooltip>
                  )}
                </Stack>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
} 