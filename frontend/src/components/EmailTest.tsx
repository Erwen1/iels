import React, { useState } from 'react';
import { Button, TextField, Alert, Paper, Typography, Box } from '@mui/material';
import { testEmailService } from '../services/emailService';

export const EmailTest: React.FC = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<{ success?: boolean; message?: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleTestEmail = async () => {
    if (!email) {
      setStatus({ success: false, message: 'Veuillez saisir une adresse email' });
      return;
    }

    setLoading(true);
    try {
      const result = await testEmailService(email);
      setStatus({
        success: result.success,
        message: result.success ? 'Email de test envoyé avec succès!' : result.error
      });
    } catch (error) {
      setStatus({
        success: false,
        message: error instanceof Error ? error.message : 'Une erreur inconnue est survenue'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper sx={{ p: 3, maxWidth: 600, mx: 'auto' }}>
      <Typography variant="h6" gutterBottom>
        Test des Notifications Email via Resend
      </Typography>
      
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Envoyez un email de test pour vérifier la configuration de Resend.com et la réception des notifications.
      </Typography>

      <Box sx={{ mb: 2 }}>
        <TextField
          fullWidth
          label="Adresse email de test"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          margin="normal"
          type="email"
          placeholder="exemple@email.com"
        />
      </Box>

      <Button
        fullWidth
        variant="contained"
        onClick={handleTestEmail}
        disabled={loading}
      >
        {loading ? 'Envoi en cours...' : 'Envoyer un email de test'}
      </Button>

      {status && (
        <Alert 
          severity={status.success ? 'success' : 'error'} 
          sx={{ mt: 2 }}
        >
          {status.message}
        </Alert>
      )}
    </Paper>
  );
}; 