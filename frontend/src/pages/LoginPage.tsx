import { LoginForm } from '../components/forms/LoginForm';
import { Container, Paper } from '@mui/material';

export const LoginPage = () => {
  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Paper elevation={3}>
        <LoginForm />
      </Paper>
    </Container>
  );
}; 