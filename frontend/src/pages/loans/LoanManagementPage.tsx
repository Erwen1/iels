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
  Chip,
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
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
  const { user } = useAuth();
  const isAdminOrTeacher = user?.role === 'ADMIN' || user?.role === 'ENSEIGNANT';

  const { data: loanRequests, isLoading } = useQuery({
    queryKey: ['loanRequests'],
    queryFn: () => isAdminOrTeacher 
      ? loanService.getAllLoanRequests()
      : loanService.getUserLoanHistory(),
  });

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
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
}; 