import React, { useState } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  Grid,
  Switch,
  FormControlLabel,
  Divider,
  TextField,
  Button,
  Card,
  CardContent,
  Alert,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Language as LanguageIcon,
  Email as EmailIcon,
  Security as SecurityIcon,
  Storage as StorageIcon,
  Save as SaveIcon,
} from '@mui/icons-material';
import { useAuth } from '../hooks/useAuth';
import { EmailTest } from '../components/EmailTest';
import { UserRole } from '../types/user';

export const SettingsPage = () => {
  const { user } = useAuth();

  const [settings, setSettings] = useState({
    // Notifications
    emailNotifications: true,
    loanReminders: true,
    maintenanceAlerts: true,
    overdueNotifications: true,

    // System Settings
    language: 'fr',
    dateFormat: 'DD/MM/YYYY',
    timeZone: 'Europe/Paris',

    // Loan Settings
    maxLoanDuration: 30,
    defaultLoanDuration: 7,
    allowExtensions: true,
    maxExtensions: 2,

    // Maintenance Settings
    maintenanceInterval: 90,
    autoSchedule: true,
  });

  const handleChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setSettings({
      ...settings,
      [field]: event.target.type === 'checkbox' ? event.target.checked : event.target.value,
    });
  };

  const handleSelectChange = (field: string) => (event: any) => {
    setSettings({
      ...settings,
      [field]: event.target.value,
    });
  };

  const handleSave = () => {
    // TODO: Implement settings save functionality
    console.log('Settings saved:', settings);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Paramètres
      </Typography>

      {user?.role === UserRole.ADMIN && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <EmailIcon sx={{ mr: 1 }} />
            <Typography variant="h5">
              Configuration des Notifications Email
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary" paragraph>
            Configurez et testez l'envoi des notifications email via Resend.com. Les notifications incluent les demandes d'emprunt,
            les rappels de retour, et les alertes de maintenance.
          </Typography>
          <Divider sx={{ my: 2 }} />
          <EmailTest />
        </Paper>
      )}

      <Grid container spacing={3}>
        {/* Notification Settings */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <NotificationsIcon sx={{ mr: 1 }} />
              <Typography variant="h6">
                Paramètres de Notification
              </Typography>
            </Box>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.emailNotifications}
                  onChange={handleChange('emailNotifications')}
                />
              }
              label="Notifications par email"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={settings.loanReminders}
                  onChange={handleChange('loanReminders')}
                />
              }
              label="Rappels d'emprunt"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={settings.maintenanceAlerts}
                  onChange={handleChange('maintenanceAlerts')}
                />
              }
              label="Alertes de maintenance"
            />
          </Paper>
        </Grid>

        {/* System Settings */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <LanguageIcon sx={{ mr: 1 }} />
              <Typography variant="h6">
                Paramètres Système
              </Typography>
            </Box>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Langue</InputLabel>
              <Select
                value={settings.language}
                onChange={handleSelectChange('language')}
                label="Langue"
              >
                <MenuItem value="fr">Français</MenuItem>
                <MenuItem value="en">English</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Format de date</InputLabel>
              <Select
                value={settings.dateFormat}
                onChange={handleSelectChange('dateFormat')}
                label="Format de date"
              >
                <MenuItem value="DD/MM/YYYY">DD/MM/YYYY</MenuItem>
                <MenuItem value="MM/DD/YYYY">MM/DD/YYYY</MenuItem>
                <MenuItem value="YYYY-MM-DD">YYYY-MM-DD</MenuItem>
              </Select>
            </FormControl>
          </Paper>
        </Grid>
      </Grid>

      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="contained"
          onClick={handleSave}
          startIcon={<SaveIcon />}
        >
          Enregistrer les modifications
        </Button>
      </Box>
    </Container>
  );
}; 