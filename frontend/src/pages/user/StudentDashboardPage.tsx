import React, { useState } from 'react';
import {
  Box,
  Container,
  Grid,
  Typography,
  Card,
  CardContent,
  Button,
  Chip,
  List,
  ListItem,
  ListItemText,
  Divider,
  Paper,
  CardMedia,
  CardActions,
} from '@mui/material';
import { Assignment, History, Pending } from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { loanService } from '../../services/loan';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export const StudentDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  
  // Récupération des emprunts de l'utilisateur
  const { data: userLoans, isLoading: loansLoading } = useQuery({
    queryKey: ['userLoans'],
    queryFn: loanService.getUserLoans,
  });

  // Récupération de l'historique des emprunts
  const { data: loanHistory, isLoading: historyLoading } = useQuery({
    queryKey: ['loanHistory'],
    queryFn: loanService.getUserLoanHistory,
  });

  const getLoanStatusColor = (status: string) => {
    switch (status) {
      case 'APPROUVE':
        return 'success';
      case 'EN_ATTENTE':
        return 'warning';
      case 'EMPRUNTE':
        return 'primary';
      case 'RETOURNE':
        return 'default';
      case 'REFUSE':
        return 'error';
      default:
        return 'default';
    }
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'PPP', { locale: fr });
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Bienvenue sur votre espace
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Consultez vos emprunts en cours et demandez de nouveaux matériels.
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Actions rapides */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Actions rapides
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                <Button 
                  variant="contained" 
                  onClick={() => navigate('/equipment')}
                  fullWidth
                >
                  Consulter les équipements
                </Button>
                <Button 
                  variant="outlined" 
                  onClick={() => navigate('/loans/new')}
                  fullWidth
                >
                  Demander un emprunt
                </Button>
                <Button 
                  variant="outlined" 
                  onClick={() => navigate('/profile')}
                  fullWidth
                >
                  Modifier mon profil
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Emprunts en cours */}
        <Grid item xs={12} md={8}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Mes emprunts en cours
              </Typography>
              
              {loansLoading ? (
                <Typography>Chargement...</Typography>
              ) : userLoans && userLoans.length > 0 ? (
                <List>
                  {userLoans.map((loan: any) => (
                    <React.Fragment key={loan.id}>
                      <ListItem 
                        secondaryAction={
                          <Chip 
                            label={loan.status} 
                            color={getLoanStatusColor(loan.status)} 
                            size="small" 
                          />
                        }
                      >
                        <ListItemText
                          primary={loan.equipment?.name || 'Équipement'}
                          secondary={
                            <>
                              <Typography component="span" variant="body2">
                                Emprunté le: {formatDate(loan.borrowing_date)}
                              </Typography>
                              <br />
                              <Typography component="span" variant="body2">
                                À retourner le: {formatDate(loan.expected_return_date)}
                              </Typography>
                            </>
                          }
                        />
                      </ListItem>
                      <Divider variant="inset" component="li" />
                    </React.Fragment>
                  ))}
                </List>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 3 }}>
                  <Assignment sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="body1" color="text.secondary" gutterBottom>
                    Vous n'avez aucun emprunt en cours
                  </Typography>
                  <Button 
                    variant="contained" 
                    size="small"
                    onClick={() => navigate('/loans/new')}
                    sx={{ mt: 1 }}
                  >
                    Demander un emprunt
                  </Button>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Dernières activités */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Historique de mes emprunts
            </Typography>
            
            {historyLoading ? (
              <Typography>Chargement...</Typography>
            ) : loanHistory && loanHistory.length > 0 ? (
              <Grid container spacing={2}>
                {loanHistory.slice(0, 3).map((loan: any) => (
                  <Grid item xs={12} sm={4} key={loan.id}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="subtitle1">{loan.equipment?.name || 'Équipement'}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {loan.project_description}
                        </Typography>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                          <Typography variant="caption" color="text.secondary">
                            Emprunté: {formatDate(loan.borrowing_date)}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Retourné: {loan.actual_return_date ? formatDate(loan.actual_return_date) : '-'}
                          </Typography>
                        </Box>
                      </CardContent>
                      <CardActions>
                        <Chip 
                          label={loan.status} 
                          color={getLoanStatusColor(loan.status)} 
                          size="small" 
                        />
                      </CardActions>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 3 }}>
                <History sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                <Typography variant="body1" color="text.secondary">
                  Vous n'avez pas encore d'historique d'emprunts
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}; 