import React, { useState } from 'react';
import {
  Box,
  Container,
  Grid,
  Typography,
  Paper,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  CircularProgress,
  TextField,
  InputAdornment,
  Tabs,
  Tab,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Refresh as RefreshIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Info as InfoIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { equipmentService } from '../../services/equipment';
import { loanService } from '../../services/loan';
import { userService } from '../../services/user';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../../contexts/AuthContext';
import { Equipment, EquipmentStatus } from '../../types/equipment';

// Types pour les statistiques du département
interface DepartmentStats {
  departmentId: string;
  departmentName: string;
  totalCount: number;
  availableCount: number;
  borrowedCount: number;
  maintenanceCount: number;
  availablePercentage: number;
  overdueCount: number;
}

// Type pour les prêts du département
interface DepartmentLoan {
  id: string;
  equipment: {
    id: string;
    name: string;
    reference: string;
  };
  student_name?: string;
  loan_manager_email: string;
  borrowing_date: string;
  expected_return_date: string;
  actual_return_date?: string;
  status: string;
}

// Composant pour afficher les statistiques du département
const DepartmentStats = ({ departmentId }: { departmentId: string }) => {
  const { data: stats, isLoading } = useQuery<DepartmentStats>({
    queryKey: ['departmentStats', departmentId],
    queryFn: () => equipmentService.getDepartmentEquipmentStats(departmentId),
  });

  if (isLoading) return <CircularProgress size={20} />;

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={4}>
        <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 140 }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Total des équipements
          </Typography>
          <Typography variant="h3" component="div" sx={{ flexGrow: 1 }}>
            {stats?.totalCount || 0}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Département {stats?.departmentName || ''}
          </Typography>
        </Paper>
      </Grid>
      <Grid item xs={12} md={4}>
        <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 140 }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Équipements disponibles
          </Typography>
          <Typography variant="h3" component="div" sx={{ flexGrow: 1, color: 'success.main' }}>
            {stats?.availableCount || 0}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {stats?.availablePercentage || 0}% du total
          </Typography>
        </Paper>
      </Grid>
      <Grid item xs={12} md={4}>
        <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 140 }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Emprunts en cours
          </Typography>
          <Typography variant="h3" component="div" sx={{ flexGrow: 1, color: 'warning.main' }}>
            {stats?.borrowedCount || 0}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {stats?.overdueCount || 0} emprunts en retard
          </Typography>
        </Paper>
      </Grid>
    </Grid>
  );
};

// Composant pour afficher les équipements du département
const DepartmentEquipment = ({ departmentId }: { departmentId: string }) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  const { data: equipment, isLoading } = useQuery<Equipment[]>({
    queryKey: ['departmentEquipment', departmentId],
    queryFn: () => equipmentService.getEquipmentByDepartment(departmentId),
  });

  const filteredEquipment = equipment?.filter(
    (item: Equipment) => 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.status && item.status.toLowerCase().includes(searchTerm.toLowerCase()))
  ) || [];

  // Fonction pour déterminer la couleur du statut
  const getStatusColor = (status: EquipmentStatus) => {
    switch (status) {
      case 'DISPONIBLE':
        return 'success';
      case 'EMPRUNTE':
        return 'warning';
      case 'MAINTENANCE':
        return 'error';
      case 'HORS_SERVICE':
        return 'default';
      default:
        return 'default';
    }
  };

  return (
    <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, alignItems: 'center' }}>
        <Typography variant="h6" component="h2">
          Équipements du département
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <TextField
            placeholder="Rechercher..."
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
            sx={{ width: 200 }}
          />
          <Button
            variant="contained"
            size="small"
            startIcon={<RefreshIcon />}
            onClick={() => {}}
          >
            Actualiser
          </Button>
        </Box>
      </Box>

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Référence</TableCell>
                  <TableCell>Nom</TableCell>
                  <TableCell>Statut</TableCell>
                  <TableCell>Localisation</TableCell>
                  <TableCell>Dernière mise à jour</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredEquipment.map((item: Equipment) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.reference}</TableCell>
                    <TableCell>{item.name}</TableCell>
                    <TableCell>
                      <Chip
                        label={item.status}
                        size="small"
                        color={getStatusColor(item.status)}
                      />
                    </TableCell>
                    <TableCell>{item.location || 'Non spécifié'}</TableCell>
                    <TableCell>
                      {item.updated_at
                        ? format(new Date(item.updated_at), 'dd MMM yyyy', { locale: fr })
                        : 'N/A'}
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Tooltip title="Voir les détails">
                          <IconButton
                            size="small"
                            onClick={() => navigate(`/equipment/${item.id}`)}
                          >
                            <InfoIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {filteredEquipment.length === 0 && (
            <Box sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Aucun équipement trouvé.
              </Typography>
            </Box>
          )}
        </>
      )}
    </Paper>
  );
};

// Composant pour afficher les emprunts des étudiants
const StudentLoans = () => {
  const [tabValue, setTabValue] = useState(0);
  const { user } = useAuthContext();
  // Note: user.profile est typé correctement dans useAuthContext
  const departmentId = user?.profile?.department_id || '';

  const { data: loans, isLoading } = useQuery<DepartmentLoan[]>({
    queryKey: ['studentLoans', departmentId, tabValue],
    queryFn: () => loanService.getDepartmentLoans(departmentId, 
      tabValue === 0 ? 'active' : tabValue === 1 ? 'pending' : 'overdue'),
  });

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
      <Typography variant="h6" component="h2" gutterBottom>
        Emprunts des étudiants
      </Typography>
      
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="loan tabs">
          <Tab label="En cours" />
          <Tab label="En attente" />
          <Tab label="En retard" />
        </Tabs>
      </Box>

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Étudiant</TableCell>
                  <TableCell>Matériel</TableCell>
                  <TableCell>Date d'emprunt</TableCell>
                  <TableCell>Date de retour prévue</TableCell>
                  <TableCell>Statut</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loans?.map((loan: DepartmentLoan) => (
                  <TableRow key={loan.id}>
                    <TableCell>{loan.student_name || loan.loan_manager_email}</TableCell>
                    <TableCell>{loan.equipment?.name || 'Équipement inconnu'}</TableCell>
                    <TableCell>
                      {loan.borrowing_date
                        ? format(new Date(loan.borrowing_date), 'dd MMM yyyy', { locale: fr })
                        : 'N/A'}
                    </TableCell>
                    <TableCell>
                      {loan.expected_return_date
                        ? format(new Date(loan.expected_return_date), 'dd MMM yyyy', { locale: fr })
                        : 'N/A'}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={loan.status}
                        size="small"
                        color={
                          loan.status === 'APPROUVE'
                            ? 'success'
                            : loan.status === 'EN_ATTENTE'
                            ? 'warning'
                            : loan.status === 'EMPRUNTE'
                            ? 'primary'
                            : loan.status === 'RETOURNE'
                            ? 'default'
                            : 'error'
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Tooltip title="Voir les détails">
                          <IconButton size="small" onClick={() => {}}>
                            <InfoIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        {loan.status === 'EN_ATTENTE' && (
                          <Tooltip title="Approuver">
                            <IconButton
                              size="small"
                              color="success"
                              onClick={() => {}}
                            >
                              <CheckCircleIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {(!loans || loans.length === 0) && (
            <Box sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                {tabValue === 0
                  ? "Aucun emprunt en cours."
                  : tabValue === 1
                  ? "Aucune demande en attente."
                  : "Aucun emprunt en retard."}
              </Typography>
            </Box>
          )}
        </>
      )}
    </Paper>
  );
};

// Composant principal du tableau de bord enseignant
export const TeacherDashboardPage: React.FC = () => {
  const { user } = useAuthContext();
  const departmentId = user?.profile?.department_id || '';
  const departmentName = user?.profile?.department?.name || 'votre département';

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Tableau de bord enseignant
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Bienvenue dans l'espace de gestion de {departmentName}. Suivez l'état des équipements et les emprunts de vos étudiants.
        </Typography>

        <Box sx={{ mb: 4 }}>
          <DepartmentStats departmentId={departmentId} />
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12}>
            <DepartmentEquipment departmentId={departmentId} />
          </Grid>
          <Grid item xs={12}>
            <StudentLoans />
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
}; 