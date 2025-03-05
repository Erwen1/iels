import { RegisterForm } from '../components/forms/RegisterForm';
import { Container, Paper } from '@mui/material';

export const RegisterPage = () => {
  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Paper elevation={3}>
        <RegisterForm />
      </Paper>
    </Container>
  );
}; 