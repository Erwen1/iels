import { useSearchParams, useNavigate } from 'react-router-dom';
import { Box, Typography, Paper, Button, CircularProgress } from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { LoanRequestForm } from '../../components/forms/LoanRequestForm';
import { useQuery } from '@tanstack/react-query';
import { equipmentService } from '../../services/equipment';
import { loanService } from '../../services/loan';
import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';

export const LoanRequestPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const equipmentId = searchParams.get('equipmentId');
  const [submitting, setSubmitting] = useState(false);
  const { user } = useAuth();
  const [initialFormData, setInitialFormData] = useState<any>({
    project_description: '',
    borrowing_date: new Date(),
    expected_return_date: new Date(new Date().setDate(new Date().getDate() + 7)),
    terms_accepted: false
  });

  const { data: equipment, isLoading } = useQuery({
    queryKey: ['equipment', equipmentId],
    queryFn: () => equipmentId ? equipmentService.getEquipmentById(equipmentId) : null,
    enabled: !!equipmentId,
    onSuccess: (data) => {
      console.log("Équipement chargé:", data);
    }
  });

  // Mettre à jour les données du formulaire lorsque l'équipement est chargé
  useEffect(() => {
    if (equipment && user) {
      console.log("Mise à jour des données initiales avec:", {
        equipment_manager_email: equipment.equipment_manager_email,
        user_email: user.email
      });
      
      const updatedData = {
        ...initialFormData,
        loan_manager_email: equipment.equipment_manager_email,
        student_email: user.email || '',
      };
      
      console.log("Nouvelles données initiales:", updatedData);
      setInitialFormData(updatedData);
    }
  }, [equipment, user]);

  const handleSubmit = async (data: any) => {
    try {
      setSubmitting(true);
      console.log("Soumission de la demande avec les données:", {
        ...data,
        equipment_id: equipmentId,
        student_email: user?.email || ''
      });
      
      await loanService.createLoanRequest({
        ...data,
        equipment_id: equipmentId,
        student_email: user?.email || '', // Ajouter l'email de l'étudiant
      });
      alert('Demande d\'emprunt soumise avec succès');
      navigate('/loans');
    } catch (error) {
      console.error('Error submitting loan request:', error);
      alert('Erreur lors de la soumission de la demande');
    } finally {
      setSubmitting(false);
    }
  };

  if (!equipmentId) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error">
          Paramètre equipmentId manquant dans l'URL. Veuillez sélectionner un équipement.
        </Typography>
        <Button 
          variant="contained" 
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/equipment')}
          sx={{ mt: 2 }}
        >
          Retour aux équipements
        </Button>
      </Box>
    );
  }

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Button 
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate(-1)}
        sx={{ mb: 2 }}
      >
        Retour
      </Button>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Demande d'emprunt
        </Typography>
        {equipment && (
          <>
            <Typography variant="h6" color="primary" gutterBottom>
              Équipement: {equipment.name}
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Référent: {equipment.equipment_manager_email}
            </Typography>
          </>
        )}
        <LoanRequestForm 
          equipmentId={equipmentId} 
          onSubmit={handleSubmit}
          initialData={initialFormData}
          disableEmailField={true}
        />
        {submitting && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
            <CircularProgress size={24} />
          </Box>
        )}
      </Paper>
    </Box>
  );
}; 