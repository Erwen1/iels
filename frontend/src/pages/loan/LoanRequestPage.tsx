import React from 'react';
import { useParams } from 'react-router-dom';
import { Box, Typography, Paper, Grid, Divider } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { getLoanRequestById } from '../../services/loan';
import { LoanStatusHistory } from '../../components/loan/LoanStatusHistory';
import { LoanRequestForm } from '../../components/forms/LoanRequestForm';

export function LoanRequestPage() {
  const { id } = useParams<{ id: string }>();
  const { data: loanRequest, isLoading, error } = useQuery({
    queryKey: ['loanRequest', id],
    queryFn: () => getLoanRequestById(id!),
    enabled: !!id,
  });

  if (isLoading) {
    return <Typography>Chargement...</Typography>;
  }

  if (error) {
    return <Typography color="error">Une erreur est survenue lors du chargement de la demande de prêt.</Typography>;
  }

  if (!loanRequest) {
    return <Typography>Demande de prêt non trouvée.</Typography>;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Détails de la demande de prêt
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2, mb: 3 }}>
            <LoanRequestForm initialData={loanRequest} />
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Historique des statuts
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <LoanStatusHistory history={loanRequest.status_history || []} />
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
} 