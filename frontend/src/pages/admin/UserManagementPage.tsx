import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Snackbar,
  Alert,
  TextField,
  IconButton,
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Edit as EditIcon,
  Search as SearchIcon,
  Sync as SyncIcon,
} from '@mui/icons-material';
import { userService, User } from '../../services/user';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { UserRole } from '../../services/auth';

// Définition des rôles avec leurs libellés
const ROLES = [
  { value: UserRole.ETUDIANT, label: 'Étudiant' },
  { value: UserRole.ENSEIGNANT, label: 'Enseignant' },
  { value: UserRole.ADMIN, label: 'Administrateur' },
];

export function UserManagementPage() {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [usersTableExists, setUsersTableExists] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info' | 'warning';
  }>({
    open: false,
    message: '',
    severity: 'info',
  });
  const [isSyncing, setIsSyncing] = useState(false);

  const queryClient = useQueryClient();

  // Vérifier si la table des utilisateurs existe
  useEffect(() => {
    const checkTableExists = async () => {
      const exists = await userService.checkUsersTableExists();
      setUsersTableExists(exists);
    };
    
    checkTableExists();
  }, []);

  // Récupérer la liste des utilisateurs
  const { data: users = [], isLoading, refetch } = useQuery({
    queryKey: ['users'],
    queryFn: userService.getAllUsers,
    enabled: usersTableExists,
  });

  // Mutation pour mettre à jour le rôle d'un utilisateur
  const updateRoleMutation = useMutation({
    mutationFn: (params: { userId: string; role: string }) =>
      userService.updateUserRole(params.userId, params.role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      handleCloseDialog();
      showSnackbar('Rôle utilisateur mis à jour avec succès', 'success');
    },
    onError: (error: any) => {
      showSnackbar(`Erreur: ${error.message || 'Impossible de mettre à jour le rôle'}`, 'error');
    },
  });

  const handleOpenDialog = (user: User) => {
    setSelectedUser(user);
    setSelectedRole(user.role);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedUser(null);
    setSelectedRole('');
  };

  const handleUpdateRole = () => {
    if (!selectedUser || !selectedRole) return;
    
    updateRoleMutation.mutate({
      userId: selectedUser.id,
      role: selectedRole,
    });
  };

  const showSnackbar = (message: string, severity: 'success' | 'error' | 'info' | 'warning') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Filtrer les utilisateurs par la recherche
  const filteredUsers = users.filter(user => 
    (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (user.full_name && user.full_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (user.department && user.department.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (user.role && user.role.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Ajout d'un indicateur du nombre total d'utilisateurs
  const totalUsers = users.length;
  const displayedUsers = filteredUsers.length;

  // Synchroniser les utilisateurs existants
  const handleSyncUsers = async () => {
    setIsSyncing(true);
    try {
      const count = await userService.syncExistingUsers();
      if (count > 0) {
        showSnackbar(`${count} utilisateur(s) synchronisé(s) avec succès`, 'success');
      } else {
        showSnackbar('Tous les utilisateurs sont déjà synchronisés', 'info');
      }
      refetch(); // Rafraîchir la liste
    } catch (error: any) {
      showSnackbar(`Erreur: ${error.message || 'Impossible de synchroniser les utilisateurs'}`, 'error');
    } finally {
      setIsSyncing(false);
    }
  };

  // Affichage de l'état de chargement
  if (isLoading) {
    return (
      <Box sx={{ p: 3, display: 'flex', justifyContent: 'center' }}>
        <Typography>Chargement des utilisateurs...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Gestion des utilisateurs
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField
            placeholder="Rechercher un utilisateur..."
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} />,
            }}
          />
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={() => refetch()}
          >
            Actualiser ({totalUsers} utilisateurs)
          </Button>
          <Button
            variant="contained"
            color="secondary"
            startIcon={<SyncIcon />}
            onClick={handleSyncUsers}
            disabled={isSyncing}
          >
            {isSyncing ? 'Synchronisation...' : 'Synchroniser les utilisateurs'}
          </Button>
        </Box>
      </Box>

      {!usersTableExists ? (
        <Alert severity="warning" sx={{ mb: 3 }}>
          <Typography variant="subtitle1" fontWeight="bold">
            La table des utilisateurs n'existe pas encore
          </Typography>
          <Typography variant="body2">
            Veuillez exécuter le script SQL fourni pour créer la table des utilisateurs.
          </Typography>
        </Alert>
      ) : (
        <Paper sx={{ width: '100%', overflow: 'hidden' }}>
          <TableContainer sx={{ maxHeight: 640 }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>Email</TableCell>
                  <TableCell>Nom complet</TableCell>
                  <TableCell>Département</TableCell>
                  <TableCell>Rôle</TableCell>
                  <TableCell>Date de création</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id} hover>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.full_name || '-'}</TableCell>
                      <TableCell>{user.department || '-'}</TableCell>
                      <TableCell>
                        <Chip
                          label={
                            user.role === UserRole.ADMIN 
                              ? 'Administrateur' 
                              : user.role === UserRole.ENSEIGNANT
                                ? 'Enseignant'
                                : 'Étudiant'
                          }
                          color={
                            user.role === UserRole.ADMIN 
                              ? 'error' 
                              : user.role === UserRole.ENSEIGNANT
                                ? 'warning'
                                : 'primary'
                          }
                          variant="filled"
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {new Date(user.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <IconButton
                          color="primary"
                          onClick={() => handleOpenDialog(user)}
                          size="small"
                        >
                          <EditIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      Aucun utilisateur trouvé
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {/* Dialog pour modifier le rôle */}
      <Dialog open={isDialogOpen} onClose={handleCloseDialog}>
        <DialogTitle>Modifier le rôle utilisateur</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              {selectedUser?.email}
            </Typography>
            <FormControl fullWidth sx={{ mt: 2 }}>
              <InputLabel id="role-select-label">Rôle</InputLabel>
              <Select
                labelId="role-select-label"
                value={selectedRole}
                label="Rôle"
                onChange={(e) => setSelectedRole(e.target.value)}
              >
                {ROLES.map((role) => (
                  <MenuItem key={role.value} value={role.value}>
                    {role.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Annuler</Button>
          <Button
            onClick={handleUpdateRole}
            variant="contained"
            disabled={!selectedRole || selectedRole === selectedUser?.role}
          >
            Enregistrer
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar pour notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
} 