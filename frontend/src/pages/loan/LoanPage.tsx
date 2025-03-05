import React from 'react';
import { Container, Typography, Box } from '@mui/material';
import { LoanRequestList } from '../../components/loan/LoanRequestList';

export function LoanPage() {
  return (
    <Container maxWidth="xl">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Gestion des emprunts
        </Typography>
        <LoanRequestList />
      </Box>
    </Container>
  );
} 