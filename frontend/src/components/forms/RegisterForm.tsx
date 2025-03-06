import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Box, TextField, Button, Typography, Alert, Chip, Tooltip } from '@mui/material';
import type { RegisterCredentials } from '../../types/auth';
import { authService, UserRole } from '../../services/auth';
import { useAuthStore } from '../../store/authStore';
import { useNavigate } from 'react-router-dom';
import InfoIcon from '@mui/icons-material/Info';

export const RegisterForm = () => {
  const [error, setError] = useState<string>('');
  const navigate = useNavigate();
  const setUser = useAuthStore((state) => state.setUser);
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterCredentials>();

  const onSubmit = async (data: RegisterCredentials) => {
    try {
      setError('');
      const { user } = await authService.register(data);
      setUser(user);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'An error occurred during registration');
    }
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit(onSubmit)}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        maxWidth: 400,
        mx: 'auto',
        p: 3,
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <Typography variant="h5" component="h1">
          Inscription
        </Typography>
        <Chip 
          label="Rôle : Étudiant" 
          color="primary" 
          size="small" 
          icon={<InfoIcon fontSize="small" />}
        />
      </Box>
      
      <Box sx={{ mb: 2, bgcolor: '#f5f5f5', p: 2, borderRadius: 1 }}>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Informations sur les rôles :
        </Typography>
        <Box component="ul" sx={{ m: 0, pl: 2 }}>
          <Typography component="li" variant="body2" color="text.secondary">
            <strong>Étudiant</strong> : Accès aux emprunts et consultations
          </Typography>
          <Typography component="li" variant="body2" color="text.secondary">
            <strong>Enseignant</strong> : Gestion des équipements et emprunts
          </Typography>
          <Typography component="li" variant="body2" color="text.secondary">
            <strong>Admin</strong> : Accès complet incluant la gestion des utilisateurs
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Par défaut, les nouveaux comptes sont créés avec le rôle "Étudiant".
          Un administrateur pourra modifier votre rôle ultérieurement si nécessaire.
        </Typography>
      </Box>

      {error && <Alert severity="error">{error}</Alert>}

      <TextField
        label="Nom complet"
        {...register('fullName', {
          required: 'Le nom complet est requis',
          minLength: {
            value: 2,
            message: 'Le nom doit comporter au moins 2 caractères',
          },
        })}
        error={!!errors.fullName}
        helperText={errors.fullName?.message}
      />

      <TextField
        label="Email"
        type="email"
        {...register('email', {
          required: 'L\'email est requis',
          pattern: {
            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
            message: 'Adresse email invalide',
          },
        })}
        error={!!errors.email}
        helperText={errors.email?.message}
      />

      <TextField
        label="Département"
        {...register('department')}
        error={!!errors.department}
        helperText={errors.department?.message}
      />

      <TextField
        label="Mot de passe"
        type="password"
        {...register('password', {
          required: 'Le mot de passe est requis',
          minLength: {
            value: 6,
            message: 'Le mot de passe doit comporter au moins 6 caractères',
          },
        })}
        error={!!errors.password}
        helperText={errors.password?.message}
      />

      <Button
        type="submit"
        variant="contained"
        disabled={isSubmitting}
        sx={{ mt: 2 }}
      >
        {isSubmitting ? 'Inscription en cours...' : 'S\'inscrire'}
      </Button>

      <Button
        variant="text"
        onClick={() => navigate('/login')}
      >
        Déjà inscrit ? Se connecter
      </Button>
    </Box>
  );
}; 