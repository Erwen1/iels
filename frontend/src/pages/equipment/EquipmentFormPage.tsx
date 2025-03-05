import { useParams } from 'react-router-dom';
import { Box, Typography } from '@mui/material';
import { EquipmentForm } from '../../components/forms/EquipmentForm';

export const EquipmentFormPage = () => {
  const { id } = useParams();

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        {id ? 'Edit Equipment' : 'Add New Equipment'}
      </Typography>
      <EquipmentForm equipmentId={id} />
    </Box>
  );
} 