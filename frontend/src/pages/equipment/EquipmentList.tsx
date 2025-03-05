import { useState } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Button,
  Chip,
  IconButton,
  TextField,
  InputAdornment,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { equipmentService } from '../../services/equipment';
import type { Equipment, EquipmentCategory, Location } from '../../types/equipment';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';

type EquipmentWithRelations = Equipment & {
  category: EquipmentCategory;
  location: Location;
};

const getStatusColor = (status: Equipment['status']) => {
  const colors: Record<Equipment['status'], 'success' | 'error' | 'warning' | 'default'> = {
    DISPONIBLE: 'success',
    EMPRUNTE: 'warning',
    MAINTENANCE: 'error',
    HORS_SERVICE: 'default',
  };
  return colors[status];
};

export const EquipmentList = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');

  const { data: equipment = [], isLoading } = useQuery({
    queryKey: ['equipment'],
    queryFn: equipmentService.getAllEquipment,
  });

  const filteredEquipment = equipment.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <TextField
          placeholder="Rechercher..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ width: 300 }}
        />
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/equipment/new')}
        >
          Ajouter un matériel
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Matériel</TableCell>
              <TableCell>Description/utilisation</TableCell>
              <TableCell>Département hébergeur</TableCell>
              <TableCell>Quantité</TableCell>
              <TableCell>Localisation</TableCell>
              <TableCell>Référence</TableCell>
              <TableCell>Référent matériel (mail)</TableCell>
              <TableCell>Disponibilité</TableCell>
              <TableCell>Description projet emprunteur</TableCell>
              <TableCell>Référent prêt (mail)</TableCell>
              <TableCell>Date d'emprunt</TableCell>
              <TableCell>Date de retour (envisagée)</TableCell>
              <TableCell>Date retour (effective)</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredEquipment
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((item: EquipmentWithRelations) => {
                const currentLoan = item.loan_requests?.find(loan => loan.status === 'EMPRUNTE');
                
                return (
                  <TableRow key={item.id}>
                    <TableCell>{item.name}</TableCell>
                    <TableCell>{item.description}</TableCell>
                    <TableCell>{item.department}</TableCell>
                    <TableCell>{item.quantity}</TableCell>
                    <TableCell>
                      {item.location
                        ? `${item.location.building} - ${item.location.room}`
                        : 'N/A'}
                    </TableCell>
                    <TableCell>{item.reference}</TableCell>
                    <TableCell>{item.equipment_manager_email}</TableCell>
                    <TableCell>
                      <Chip
                        label={item.status}
                        color={getStatusColor(item.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{currentLoan?.project_description || '-'}</TableCell>
                    <TableCell>{currentLoan?.loan_manager_email || '-'}</TableCell>
                    <TableCell>
                      {currentLoan?.borrowing_date
                        ? format(new Date(currentLoan.borrowing_date), 'dd/MM/yyyy')
                        : '-'}
                    </TableCell>
                    <TableCell>
                      {currentLoan?.expected_return_date
                        ? format(new Date(currentLoan.expected_return_date), 'dd/MM/yyyy')
                        : '-'}
                    </TableCell>
                    <TableCell>
                      {currentLoan?.actual_return_date
                        ? format(new Date(currentLoan.actual_return_date), 'dd/MM/yyyy')
                        : '-'}
                    </TableCell>
                    <TableCell>
                      <IconButton
                        onClick={() => navigate(`/equipment/${item.id}`)}
                        size="small"
                      >
                        <EditIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredEquipment.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Lignes par page"
        />
      </TableContainer>
    </Box>
  );
}; 