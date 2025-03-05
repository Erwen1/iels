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
} from '@mui/icons-material';

export const SettingsPage = () => {
  const [settings, setSettings] = useState({
    // Notifications
    emailNotifications: true,
    loanReminders: true,
    maintenanceAlerts: true,
    overdueNotifications: true,

    // Email Settings
    reminderFrequency: 'daily',
    emailTemplate: 'default',

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
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom>
          Paramètres
        </Typography>

        <Grid container spacing={3}>
          {/* Notifications */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <NotificationsIcon sx={{ mr: 1 }} />
                  <Typography variant="h6">Notifications</Typography>
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
                  label="Rappels d'emprunts"
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
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.overdueNotifications}
                      onChange={handleChange('overdueNotifications')}
                    />
                  }
                  label="Notifications de retard"
                />
              </CardContent>
            </Card>
          </Grid>

          {/* Email Settings */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <EmailIcon sx={{ mr: 1 }} />
                  <Typography variant="h6">Paramètres Email</Typography>
                </Box>
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Fréquence des rappels</InputLabel>
                  <Select
                    value={settings.reminderFrequency}
                    onChange={handleSelectChange('reminderFrequency')}
                    label="Fréquence des rappels"
                  >
                    <MenuItem value="daily">Quotidien</MenuItem>
                    <MenuItem value="weekly">Hebdomadaire</MenuItem>
                    <MenuItem value="biweekly">Bi-hebdomadaire</MenuItem>
                  </Select>
                </FormControl>
                <FormControl fullWidth>
                  <InputLabel>Template d'email</InputLabel>
                  <Select
                    value={settings.emailTemplate}
                    onChange={handleSelectChange('emailTemplate')}
                    label="Template d'email"
                  >
                    <MenuItem value="default">Par défaut</MenuItem>
                    <MenuItem value="minimal">Minimal</MenuItem>
                    <MenuItem value="detailed">Détaillé</MenuItem>
                  </Select>
                </FormControl>
              </CardContent>
            </Card>
          </Grid>

          {/* System Settings */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <LanguageIcon sx={{ mr: 1 }} />
                  <Typography variant="h6">Paramètres Système</Typography>
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
                <FormControl fullWidth sx={{ mb: 2 }}>
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
                <FormControl fullWidth>
                  <InputLabel>Fuseau horaire</InputLabel>
                  <Select
                    value={settings.timeZone}
                    onChange={handleSelectChange('timeZone')}
                    label="Fuseau horaire"
                  >
                    <MenuItem value="Europe/Paris">Europe/Paris</MenuItem>
                    <MenuItem value="UTC">UTC</MenuItem>
                  </Select>
                </FormControl>
              </CardContent>
            </Card>
          </Grid>

          {/* Loan Settings */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <StorageIcon sx={{ mr: 1 }} />
                  <Typography variant="h6">Paramètres d'Emprunt</Typography>
                </Box>
                <TextField
                  fullWidth
                  type="number"
                  label="Durée maximale d'emprunt (jours)"
                  value={settings.maxLoanDuration}
                  onChange={handleChange('maxLoanDuration')}
                  sx={{ mb: 2 }}
                />
                <TextField
                  fullWidth
                  type="number"
                  label="Durée d'emprunt par défaut (jours)"
                  value={settings.defaultLoanDuration}
                  onChange={handleChange('defaultLoanDuration')}
                  sx={{ mb: 2 }}
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.allowExtensions}
                      onChange={handleChange('allowExtensions')}
                    />
                  }
                  label="Autoriser les extensions"
                />
                {settings.allowExtensions && (
                  <TextField
                    fullWidth
                    type="number"
                    label="Nombre maximum d'extensions"
                    value={settings.maxExtensions}
                    onChange={handleChange('maxExtensions')}
                    sx={{ mt: 2 }}
                  />
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Maintenance Settings */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <SecurityIcon sx={{ mr: 1 }} />
                  <Typography variant="h6">Paramètres de Maintenance</Typography>
                </Box>
                <TextField
                  fullWidth
                  type="number"
                  label="Intervalle de maintenance (jours)"
                  value={settings.maintenanceInterval}
                  onChange={handleChange('maintenanceInterval')}
                  sx={{ mb: 2 }}
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.autoSchedule}
                      onChange={handleChange('autoSchedule')}
                    />
                  }
                  label="Planification automatique"
                />
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSave}
            size="large"
          >
            Enregistrer les modifications
          </Button>
        </Box>
      </Box>
    </Container>
  );
}; 