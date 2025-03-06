import React, { useState } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  Grid,
  TextField,
  Button,
  Divider,
  List,
  ListItem,
  ListItemText,
  Chip,
  Avatar,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  FormHelperText,
  SelectChangeEvent,
  Tooltip,
} from '@mui/material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userService } from '../../services/user';
import type { UserProfile, UserActivity, Role } from '../../services/user';
import { UserRole } from '../../services/auth';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import InfoIcon from '@mui/icons-material/Info';

export function ProfilePage() {
  const queryClient = useQueryClient();
  const { data: user, isLoading: isLoadingUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: userService.getCurrentUser,
  });

  const { data: activities, isLoading: isLoadingActivities } = useQuery({
    queryKey: ['userActivities', user?.id],
    queryFn: () => userService.getUserActivities(user!.id),
    enabled: !!user?.id,
  });

  const { data: roles } = useQuery({
    queryKey: ['roles'],
    queryFn: userService.getRoles,
  });

  const updateProfileMutation = useMutation({
    mutationFn: (profile: Partial<UserProfile>) =>
      userService.updateProfile(user!.id, profile),
    onSuccess: () => {
      queryClient.invalidateQueries(['currentUser']);
    },
  });

  const updatePasswordMutation = useMutation({
    mutationFn: (credentials: { currentPassword: string; newPassword: string }) =>
      userService.updatePassword(user!.id, credentials),
    onSuccess: () => {
      queryClient.invalidateQueries(['currentUser']);
    },
  });

  const updateProfilePictureMutation = useMutation({
    mutationFn: (file: File) =>
      userService.updateProfilePicture(user!.id, file),
    onSuccess: () => {
      queryClient.invalidateQueries(['currentUser']);
    },
  });

  const updateRoleMutation = useMutation({
    mutationFn: (roleId: string) => userService.updateUserRole(user!.id, roleId),
    onSuccess: () => {
      queryClient.invalidateQueries(['currentUser']);
    },
  });

  const [selectedRole, setSelectedRole] = useState<string>('');

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const profile = {
      full_name: formData.get('full_name') as string,
      phone: formData.get('phone') as string,
      office_location: formData.get('office_location') as string,
    };
    updateProfileMutation.mutate(profile);
  };

  const handleRoleChange = (event: SelectChangeEvent) => {
    setSelectedRole(event.target.value);
  };

  const handleUpdateRole = () => {
    if (selectedRole) {
      updateRoleMutation.mutate(selectedRole);
    }
  };

  const isAdmin = user?.profile?.role?.name === UserRole.ADMIN;
  const isTeacher = user?.profile?.role?.name === UserRole.ENSEIGNANT;
  const canEditEquipment = isAdmin || isTeacher;

  const getRoleColor = (roleName: string | undefined) => {
    if (!roleName) return 'default';
    switch (roleName) {
      case UserRole.ADMIN:
        return 'error';
      case UserRole.ENSEIGNANT:
        return 'warning';
      case UserRole.ETUDIANT:
        return 'primary';
      default:
        return 'default';
    }
  };

  if (isLoadingUser) {
    return <Typography>Chargement...</Typography>;
  }

  if (!user) {
    return <Typography>Utilisateur non trouvé</Typography>;
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Profil utilisateur
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Informations personnelles
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Box
                  sx={{
                    width: 100,
                    height: 100,
                    borderRadius: '50%',
                    overflow: 'hidden',
                    mr: 2,
                    position: 'relative',
                  }}
                >
                  <Avatar
                    src={user.profile?.avatar_url || undefined}
                    alt={user.profile?.full_name || user.email}
                    sx={{ width: '100%', height: '100%' }}
                  >
                    {user.profile?.full_name?.[0] || user.email?.[0]}
                  </Avatar>
                  <input
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    id="avatar-upload"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        updateProfilePictureMutation.mutate(file);
                      }
                    }}
                  />
                  <Box
                    sx={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      bgcolor: 'rgba(0, 0, 0, 0.5)',
                      color: 'white',
                      textAlign: 'center',
                      py: 0.5,
                      cursor: 'pointer',
                    }}
                    component="label"
                    htmlFor="avatar-upload"
                  >
                    Modifier
                  </Box>
                </Box>
                <Box>
                  <Typography variant="subtitle1">
                    {user.profile?.full_name || 'Nom non défini'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {user.email}
                  </Typography>
                </Box>
              </Box>
              <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      name="full_name"
                      label="Nom complet"
                      defaultValue={user.profile?.full_name || ''}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      disabled
                      label="Email"
                      value={user.email}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      name="phone"
                      label="Téléphone"
                      defaultValue={user.profile?.phone || ''}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      name="office_location"
                      label="Bureau"
                      defaultValue={user.profile?.office_location || ''}
                    />
                  </Grid>
                </Grid>
                <Box sx={{ mt: 3 }}>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={updateProfileMutation.isLoading}
                  >
                    {updateProfileMutation.isLoading
                      ? 'Enregistrement...'
                      : 'Enregistrer les modifications'}
                  </Button>
                </Box>
              </Box>
            </Paper>

            <Paper sx={{ p: 3, mt: 3 }}>
              <Typography variant="h6" gutterBottom>
                Département et rôle
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Département
                  </Typography>
                  <Typography>
                    {user.profile?.department?.name || 'Non assigné'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Rôle
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Chip 
                      label={user.profile?.role?.name || UserRole.ETUDIANT} 
                      color={getRoleColor(user.profile?.role?.name)}
                      size="small" 
                    />
                    <Tooltip title={
                      user.profile?.role?.name === UserRole.ADMIN 
                        ? "Accès complet à toutes les fonctionnalités, y compris la gestion des utilisateurs" 
                        : user.profile?.role?.name === UserRole.ENSEIGNANT 
                          ? "Gestion des équipements et des demandes d'emprunt" 
                          : "Consultation et demandes d'emprunt uniquement"
                    }>
                      <InfoIcon fontSize="small" color="action" />
                    </Tooltip>
                  </Box>
                </Grid>
                
                {isAdmin && (
                  <Grid item xs={12} sx={{ mt: 2 }}>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Modifier le rôle (Admin uniquement)
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                      <FormControl size="small" sx={{ minWidth: 200 }}>
                        <InputLabel id="role-select-label">Nouveau rôle</InputLabel>
                        <Select
                          labelId="role-select-label"
                          id="role-select"
                          value={selectedRole}
                          label="Nouveau rôle"
                          onChange={handleRoleChange}
                        >
                          {roles?.map((role: Role) => (
                            <MenuItem key={role.id} value={role.id}>
                              <Chip 
                                label={role.name} 
                                color={getRoleColor(role.name)}
                                size="small" 
                                sx={{ mr: 1 }}
                              />
                              {role.name}
                            </MenuItem>
                          ))}
                        </Select>
                        <FormHelperText>Sélectionnez un nouveau rôle pour l'utilisateur</FormHelperText>
                      </FormControl>
                      <Button 
                        variant="contained" 
                        size="small"
                        onClick={handleUpdateRole}
                        disabled={!selectedRole || updateRoleMutation.isLoading}
                      >
                        {updateRoleMutation.isLoading ? 'Mise à jour...' : 'Mettre à jour'}
                      </Button>
                    </Box>
                  </Grid>
                )}
                
                {user.profile?.role?.permissions && (
                  <Grid item xs={12}>
                    <Typography
                      variant="subtitle2"
                      color="text.secondary"
                      sx={{ mb: 1, mt: 2 }}
                    >
                      Permissions
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      {user.profile.role.permissions.map((permission: string) => (
                        <Chip
                          key={permission}
                          label={permission}
                          size="small"
                          color="secondary"
                          variant="outlined"
                        />
                      ))}
                    </Box>
                  </Grid>
                )}
              </Grid>
            </Paper>

            <Paper sx={{ p: 3, mt: 3 }}>
              <Typography variant="h6" gutterBottom>
                Changer le mot de passe
              </Typography>
              <Box component="form" onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const currentPassword = formData.get('currentPassword') as string;
                const newPassword = formData.get('newPassword') as string;
                const confirmPassword = formData.get('confirmPassword') as string;

                if (newPassword !== confirmPassword) {
                  // Handle password mismatch
                  return;
                }

                // Call password change mutation
                updatePasswordMutation.mutate({ currentPassword, newPassword });
              }} sx={{ mt: 2 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      name="currentPassword"
                      label="Mot de passe actuel"
                      type="password"
                      required
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      name="newPassword"
                      label="Nouveau mot de passe"
                      type="password"
                      required
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      name="confirmPassword"
                      label="Confirmer le nouveau mot de passe"
                      type="password"
                      required
                    />
                  </Grid>
                </Grid>
                <Box sx={{ mt: 3 }}>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={updatePasswordMutation.isLoading}
                  >
                    {updatePasswordMutation.isLoading
                      ? 'Modification en cours...'
                      : 'Changer le mot de passe'}
                  </Button>
                </Box>
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Activités récentes
              </Typography>
              <Divider sx={{ mb: 2 }} />
              {isLoadingActivities ? (
                <Typography>Chargement des activités...</Typography>
              ) : (
                <List>
                  {activities?.map((activity: UserActivity) => (
                    <ListItem key={activity.id} divider>
                      <ListItemText
                        primary={activity.description}
                        secondary={format(
                          new Date(activity.created_at),
                          'dd/MM/yyyy HH:mm',
                          { locale: fr }
                        )}
                      />
                    </ListItem>
                  ))}
                </List>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
} 