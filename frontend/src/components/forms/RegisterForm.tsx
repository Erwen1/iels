import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Box, TextField, Button, Typography, Alert } from '@mui/material';
import type { RegisterCredentials } from '../../types/auth';
import { authService } from '../../services/auth';
import { useAuthStore } from '../../store/authStore';
import { useNavigate } from 'react-router-dom';

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
      <Typography variant="h5" component="h1" gutterBottom>
        Register for IELMS
      </Typography>

      {error && <Alert severity="error">{error}</Alert>}

      <TextField
        label="Full Name"
        {...register('fullName', {
          required: 'Full name is required',
          minLength: {
            value: 2,
            message: 'Name must be at least 2 characters',
          },
        })}
        error={!!errors.fullName}
        helperText={errors.fullName?.message}
      />

      <TextField
        label="Email"
        type="email"
        {...register('email', {
          required: 'Email is required',
          pattern: {
            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
            message: 'Invalid email address',
          },
        })}
        error={!!errors.email}
        helperText={errors.email?.message}
      />

      <TextField
        label="Department"
        {...register('department')}
        error={!!errors.department}
        helperText={errors.department?.message}
      />

      <TextField
        label="Password"
        type="password"
        {...register('password', {
          required: 'Password is required',
          minLength: {
            value: 6,
            message: 'Password must be at least 6 characters',
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
        {isSubmitting ? 'Registering...' : 'Register'}
      </Button>

      <Button
        variant="text"
        onClick={() => navigate('/login')}
        sx={{ mt: 1 }}
      >
        Already have an account? Login
      </Button>
    </Box>
  );
}; 