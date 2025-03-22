import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Stack,
  TextField,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  Tabs,
  Tab,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import HistoryIcon from '@mui/icons-material/History';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { loanService } from '../../services/loan';
import type { LoanRequest, LoanStatus } from '../../types/equipment';
import { LoanStatusHistory } from '../../components/loan/LoanStatusHistory';
import { useAuth } from '../../hooks/useAuth';

// Interface pour le panneau d'onglets
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`loan-tabpanel-${index}`}
      aria-labelledby={`loan-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ pt: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `loan-tab-${index}`,
    'aria-controls': `loan-tabpanel-${index}`,
  };
}

interface AdminCommentDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (comment: string) => void;
  title: string;
}

function AdminCommentDialog({
  open,
  onClose,
  onSubmit,
  title,
}: AdminCommentDialogProps) {
  const [comment, setComment] = useState('');

  const handleSubmit = () => {
    onSubmit(comment);
    setComment('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label="Commentaire administrateur"
          fullWidth
          multiline
          rows={4}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Annuler</Button>
        <Button onClick={handleSubmit} variant="contained" color="primary">
          Valider
        </Button>
      </DialogActions>
    </Dialog>
  );
}

const statusColors: Record<LoanStatus, 'default' | 'warning' | 'success' | 'error' | 'primary'> = {
  'EN_ATTENTE': 'warning',
  'APPROUVE': 'primary',
  'EMPRUNTE': 'success',
  'RETOURNE': 'default',
  'REFUSE': 'error',
};

const statusLabels: Record<LoanStatus, string> = {
  'EN_ATTENTE': 'En attente',
  'APPROUVE': 'Approuvé',
  'EMPRUNTE': 'Emprunté',
  'RETOURNE': 'Retourné',
  'REFUSE': 'Refusé',
};

const statusOptions: { value: LoanStatus; label: string }[] = [
  { value: 'EN_ATTENTE', label: 'En attente' },
  { value: 'APPROUVE', label: 'Approuvé' },
  { value: 'EMPRUNTE', label: 'Emprunté' },
  { value: 'RETOURNE', label: 'Retourné' },
  { value: 'REFUSE', label: 'Refusé' },
];

export function AdminLoanPage() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';
  const isTeacher = user?.role === 'ENSEIGNANT';
  const userEmail = user?.email || '';

  // État pour les onglets
  const [currentTab, setCurrentTab] = useState(0);

  const [selectedStatus, setSelectedStatus] = useState<LoanStatus | 'ALL'>('ALL');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState<LoanRequest | null>(null);
  const [newStatus, setNewStatus] = useState<LoanStatus | ''>('');
  const [comment, setComment] = useState('');

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  // Requête pour tous les emprunts (admin & enseignants)
  const { 
    data: allLoans = [], 
    isLoading: isLoadingAllLoans, 
    error: allLoansError 
  } = useQuery({
    queryKey: ['loans', 'admin', 'all'],
    queryFn: () => loanService.getAllLoanRequests(),
    enabled: isAdmin || isTeacher,
  });

  // Requête pour les emprunts personnels (emprunts que l'utilisateur a demandés)
  const { 
    data: myLoans = [], 
    isLoading: isLoadingMyLoans, 
    error: myLoansError 
  } = useQuery({
    queryKey: ['loans', 'my'],
    queryFn: () => loanService.getUserLoanHistory(),
  });

  // Requête pour les emprunts dont l'utilisateur est référent
  const { 
    data: managedLoans = [], 
    isLoading: isLoadingManagedLoans, 
    error: managedLoansError 
  } = useQuery({
    queryKey: ['loans', 'managed'],
    queryFn: () => loanService.getAllLoanRequests()
      .then(loans => loans.filter(loan => loan.loan_manager_email === userEmail)),
    enabled: isAdmin || isTeacher,
  });

  const updateStatusMutation = useMutation({
    mutationFn: (params: { id: string; status: LoanStatus; comment: string }) =>
      loanService.updateLoanStatus(params.id, params.status, params.comment),
    onSuccess: () => {
      queryClient.invalidateQueries(['loans']);
      handleCloseDialog();
    },
  });

  const handleOpenDialog = (loan: LoanRequest) => {
    // Admin peut tout gérer, enseignant seulement ses emprunts
    if (isAdmin || (isTeacher && loan.loan_manager_email === userEmail)) {
      setSelectedLoan(loan);
      setNewStatus(loan.status);
      setComment('');
    }
  };

  const handleCloseDialog = () => {
    setSelectedLoan(null);
    setNewStatus('');
    setComment('');
  };

  const handleUpdateStatus = () => {
    if (selectedLoan && newStatus) {
      if (isAdmin || (isTeacher && selectedLoan.loan_manager_email === userEmail)) {
        updateStatusMutation.mutate({
          id: selectedLoan.id,
          status: newStatus,
          comment,
        });
      }
    }
  };

  const canSeeActionsForLoan = (loan: LoanRequest) => {
    if (isAdmin) return true;
    if (isTeacher && loan.loan_manager_email === userEmail) return true;
    return false;
  };

  // Fonction pour filtrer les emprunts selon les critères de filtrage
  const applyFilters = (loans: LoanRequest[]) => {
    return loans.filter((loan) => {
      const matchesStatus =
        selectedStatus === 'ALL' || loan.status === selectedStatus;
      const matchesDate =
        (!startDate ||
          new Date(loan.borrowing_date) >= startDate) &&
        (!endDate || new Date(loan.borrowing_date) <= endDate);
      const matchesSearch =
        searchTerm === '' ||
        loan.equipment?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        loan.project_description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        loan.loan_manager_email.toLowerCase().includes(searchTerm.toLowerCase());

      return matchesStatus && matchesDate && matchesSearch;
    });
  };

  // Sélection des données à afficher selon l'onglet actif
  const getActiveLoans = () => {
    switch (currentTab) {
      case 0:
        return myLoans; // Mes emprunts
      case 1:
        return isAdmin || isTeacher ? managedLoans : []; // Emprunts à gérer
      case 2:
        return isAdmin || isTeacher ? applyFilters(allLoans) : []; // Tous les emprunts (admin & enseignants)
      default:
        return [];
    }
  };

  const isLoading = 
    (currentTab === 0 && isLoadingMyLoans) || 
    (currentTab === 1 && isLoadingManagedLoans) || 
    (currentTab === 2 && isLoadingAllLoans);
  
  const error = 
    (currentTab === 0 && myLoansError) || 
    (currentTab === 1 && managedLoansError) || 
    (currentTab === 2 && allLoansError);

  const getStatusLabel = (status: string): string => {
    // S'assurer que le statut est valide, sinon retourner le statut tel quel
    return (statusLabels as Record<string, string>)[status] || status;
  };

  const getStatusColor = (status: string): 'default' | 'warning' | 'success' | 'error' | 'primary' => {
    // S'assurer que le statut est valide, sinon retourner 'default'
    return (statusColors as Record<string, 'default' | 'warning' | 'success' | 'error' | 'primary'>)[status] || 'default';
  };

  if (isLoading) {
    return <Typography>Chargement...</Typography>;
  }

  if (error) {
    return <Typography color="error">Une erreur est survenue lors du chargement des demandes de prêt.</Typography>;
  }

  const activeLoans = getActiveLoans();
  const filteredActiveLoans = currentTab === 2 ? applyFilters(activeLoans) : activeLoans;
  
  // Définir si le tableau courant doit avoir une colonne Actions
  const showActionsColumn = 
    (currentTab === 1 && (isAdmin || isTeacher)) || // Onglet "Emprunts à gérer" pour admin/enseignant
    (currentTab === 2 && isAdmin); // Onglet "Tous les emprunts" pour admin

  return (
    <Container maxWidth="xl">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Gestion des emprunts
        </Typography>

        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={currentTab} 
            onChange={handleTabChange} 
            aria-label="onglets de gestion des emprunts"
          >
            <Tab label="Mes emprunts" {...a11yProps(0)} />
            {(isAdmin || isTeacher) && (
              <Tab label="Emprunts à gérer" {...a11yProps(1)} />
            )}
            {(isAdmin || isTeacher) && (
              <Tab label="Tous les emprunts" {...a11yProps(2)} />
            )}
          </Tabs>
        </Box>

        {/* Onglet Mes emprunts - visible pour tous */}
        <TabPanel value={currentTab} index={0}>
          {myLoans.length === 0 ? (
            <Typography>Vous n'avez pas encore d'emprunts.</Typography>
          ) : (
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
                    <TableCell>Commentaire admin</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {myLoans.map((loan) => (
                    <TableRow key={loan.id}>
                      <TableCell>{loan.equipment?.name || loan.equipment_id}</TableCell>
                      <TableCell>{loan.project_description}</TableCell>
                      <TableCell>{loan.loan_manager_email}</TableCell>
                      <TableCell>
                        {format(new Date(loan.borrowing_date), 'dd/MM/yyyy', {
                          locale: fr,
                        })}
                      </TableCell>
                      <TableCell>
                        {format(new Date(loan.expected_return_date), 'dd/MM/yyyy', {
                          locale: fr,
                        })}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={getStatusLabel(loan.status)}
                          color={getStatusColor(loan.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{loan.admin_comment || '-'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </TabPanel>

        {/* Onglet Emprunts à gérer - visible pour enseignants et admin */}
        {(isAdmin || isTeacher) && (
          <TabPanel value={currentTab} index={1}>
            {managedLoans.length === 0 ? (
              <Typography>Vous n'avez pas d'emprunts à gérer.</Typography>
            ) : (
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Matériel</TableCell>
                      <TableCell>Description du projet</TableCell>
                      <TableCell>Emprunteur</TableCell>
                      <TableCell>Date d'emprunt</TableCell>
                      <TableCell>Date de retour</TableCell>
                      <TableCell>Statut</TableCell>
                      <TableCell>Commentaire admin</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {managedLoans.map((loan) => (
                      <TableRow key={loan.id}>
                        <TableCell>{loan.equipment?.name || loan.equipment_id}</TableCell>
                        <TableCell>{loan.project_description}</TableCell>
                        <TableCell>{loan.student_email || "N/A"}</TableCell>
                        <TableCell>
                          {format(new Date(loan.borrowing_date), 'dd/MM/yyyy', {
                            locale: fr,
                          })}
                        </TableCell>
                        <TableCell>
                          {format(new Date(loan.expected_return_date), 'dd/MM/yyyy', {
                            locale: fr,
                          })}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={getStatusLabel(loan.status)}
                            color={getStatusColor(loan.status)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{loan.admin_comment || '-'}</TableCell>
                        <TableCell>
                          {canSeeActionsForLoan(loan) && (
                            <Stack direction="row" spacing={1}>
                              {loan.status === 'EN_ATTENTE' && (
                                <IconButton
                                  size="small"
                                  color="success"
                                  onClick={() => handleOpenDialog(loan)}
                                  title="Mettre à jour le statut"
                                >
                                  <HistoryIcon />
                                </IconButton>
                              )}
                              {loan.status === 'APPROUVE' && (
                                <IconButton
                                  size="small"
                                  color="primary"
                                  onClick={() => handleOpenDialog(loan)}
                                  title="Mettre à jour le statut"
                                >
                                  <HistoryIcon />
                                </IconButton>
                              )}
                              {loan.status === 'EMPRUNTE' && (
                                <IconButton
                                  size="small"
                                  color="primary"
                                  onClick={() => handleOpenDialog(loan)}
                                  title="Mettre à jour le statut"
                                >
                                  <HistoryIcon />
                                </IconButton>
                              )}
                            </Stack>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </TabPanel>
        )}

        {/* Onglet Tous les emprunts - visible pour admin et enseignants */}
        {(isAdmin || isTeacher) && (
          <TabPanel value={currentTab} index={2}>
            <Paper sx={{ p: 2, mb: 2 }}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    select
                    fullWidth
                    label="Statut"
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value as LoanStatus | 'ALL')}
                  >
                    <MenuItem value="ALL">Tous les statuts</MenuItem>
                    {Object.entries(statusLabels).map(([value, label]) => (
                      <MenuItem key={value} value={value}>
                        {label}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <DatePicker
                    label="Date début"
                    value={startDate}
                    onChange={setStartDate}
                    slotProps={{ textField: { fullWidth: true } }}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <DatePicker
                    label="Date fin"
                    value={endDate}
                    onChange={setEndDate}
                    slotProps={{ textField: { fullWidth: true } }}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    fullWidth
                    label="Rechercher"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Matériel, description, email..."
                  />
                </Grid>
              </Grid>
            </Paper>

            {filteredActiveLoans.length === 0 ? (
              <Typography>Aucun emprunt ne correspond à vos critères de recherche.</Typography>
            ) : (
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Matériel</TableCell>
                      <TableCell>Description du projet</TableCell>
                      <TableCell>Référent</TableCell>
                      <TableCell>Emprunteur</TableCell>
                      <TableCell>Date d'emprunt</TableCell>
                      <TableCell>Date de retour</TableCell>
                      <TableCell>Statut</TableCell>
                      <TableCell>Commentaire admin</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredActiveLoans.map((loan) => (
                      <TableRow key={loan.id}>
                        <TableCell>{loan.equipment?.name || loan.equipment_id}</TableCell>
                        <TableCell>{loan.project_description}</TableCell>
                        <TableCell>{loan.loan_manager_email}</TableCell>
                        <TableCell>{loan.student_email || "N/A"}</TableCell>
                        <TableCell>
                          {format(new Date(loan.borrowing_date), 'dd/MM/yyyy', {
                            locale: fr,
                          })}
                        </TableCell>
                        <TableCell>
                          {format(new Date(loan.expected_return_date), 'dd/MM/yyyy', {
                            locale: fr,
                          })}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={getStatusLabel(loan.status)}
                            color={getStatusColor(loan.status)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{loan.admin_comment || '-'}</TableCell>
                        <TableCell>
                          {canSeeActionsForLoan(loan) && (
                            <Stack direction="row" spacing={1}>
                              {loan.status === 'EN_ATTENTE' && (
                                <IconButton
                                  size="small"
                                  color="success"
                                  onClick={() => handleOpenDialog(loan)}
                                  title="Mettre à jour le statut"
                                >
                                  <HistoryIcon />
                                </IconButton>
                              )}
                              {loan.status === 'APPROUVE' && (
                                <IconButton
                                  size="small"
                                  color="primary"
                                  onClick={() => handleOpenDialog(loan)}
                                  title="Mettre à jour le statut"
                                >
                                  <HistoryIcon />
                                </IconButton>
                              )}
                              {loan.status === 'EMPRUNTE' && (
                                <IconButton
                                  size="small"
                                  color="primary"
                                  onClick={() => handleOpenDialog(loan)}
                                  title="Mettre à jour le statut"
                                >
                                  <HistoryIcon />
                                </IconButton>
                              )}
                            </Stack>
                          )}
                          {!canSeeActionsForLoan(loan) && (
                            <Typography variant="body2" color="text.secondary">-</Typography>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </TabPanel>
        )}

        <Dialog open={!!selectedLoan} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
          <DialogTitle>Mettre à jour le statut</DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 2 }}>
              <TextField
                select
                fullWidth
                label="Nouveau statut"
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value as LoanStatus)}
                sx={{ mb: 2 }}
              >
                {statusOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                fullWidth
                label="Commentaire"
                multiline
                rows={4}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Annuler</Button>
            <Button
              onClick={handleUpdateStatus}
              variant="contained"
              disabled={!newStatus || updateStatusMutation.isLoading}
            >
              {updateStatusMutation.isLoading ? 'Mise à jour...' : 'Mettre à jour'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
} 