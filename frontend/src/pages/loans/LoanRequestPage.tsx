import { useSearchParams } from 'react-router-dom';
import { Box, Typography } from '@mui/material';
import { LoanRequestForm } from '../../components/forms/LoanRequestForm';

export const LoanRequestPage = () => {
  const [searchParams] = useSearchParams();
  const equipmentId = searchParams.get('equipmentId');

  if (!equipmentId) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error">
          Paramètre equipmentId manquant dans l'URL
        </Typography>
      </Box>
    );
  }

  return <LoanRequestForm equipmentId={equipmentId} />;
}; 