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
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Typography,
  Divider,
  Card,
  CardContent,
  CardActions,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Search as SearchIcon,
  ShoppingCart as RequestIcon,
  FilterList as FilterIcon,
  Clear as ClearIcon,
} from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { equipmentService } from '../../services/equipment';
import type { Equipment, EquipmentCategory, Location } from '../../types/equipment';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { useAuth } from '../../hooks/useAuth';

type EquipmentWithRelations = Equipment & {
  category: EquipmentCategory;
  location: Location | string;
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
  const { user } = useAuth();
  const isAdminOrTeacher = user?.role === 'ADMIN' || user?.role === 'ENSEIGNANT';
  
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    status: '',
    department: '',
    building: '',
    available: false,
  });

  const { data: equipment = [], isLoading } = useQuery({
    queryKey: ['equipment'],
    queryFn: equipmentService.getAllEquipment,
  });

  // Extract unique departments and buildings for filter dropdowns
  const uniqueDepartments = [...new Set(equipment.map((item: Equipment) => item.department))].filter(Boolean).sort();
  const uniqueBuildings = [...new Set(equipment
    .filter((item: Equipment) => item.location)
    .map((item: Equipment) => typeof item.location === 'string' 
      ? item.location.split(' - ')[0] 
      : (item as any).location?.building))].filter(Boolean).sort();

  const handleFilterChange = (field: string, value: string) => {
    setFilters({
      ...filters,
      [field]: value,
    });
    setPage(0); // Reset to first page when filter changes
  };

  const resetFilters = () => {
    setFilters({
      status: '',
      department: '',
      building: '',
      available: false,
    });
    setSearchTerm('');
  };

  const filteredEquipment = equipment.filter((item: Equipment) => {
    // Text search filter
    const matchesSearch = searchTerm === '' || 
      (item.name && item.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.reference && item.reference.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.department && item.department.toLowerCase().includes(searchTerm.toLowerCase()));
    
    // Status filter
    const matchesStatus = filters.status === '' || item.status === filters.status;
    
    // Department filter
    const matchesDepartment = filters.department === '' || item.department === filters.department;
    
    // Building filter
    const matchesBuilding = filters.building === '' || 
      (typeof item.location === 'string' && item.location.startsWith(filters.building)) ||
      ((item as any).location?.building === filters.building);
    
    // Available filter (raccourci pour voir uniquement les équipements disponibles)
    const matchesAvailable = !filters.available || item.status === 'DISPONIBLE';
    
    return matchesSearch && matchesStatus && matchesDepartment && matchesBuilding && matchesAvailable;
  }) as EquipmentWithRelations[];

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
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
            variant={showFilters ? "contained" : "outlined"}
            startIcon={<FilterIcon />}
            onClick={() => setShowFilters(!showFilters)}
          >
            Filtres
          </Button>
          <Button
            variant={filters.available ? "contained" : "outlined"}
            color={filters.available ? "success" : "primary"}
            onClick={() => {
              setFilters(prev => ({
                ...prev,
                available: !prev.available,
                status: prev.available ? prev.status : ''
              }));
            }}
            sx={{ minWidth: 160 }}
          >
            {filters.available ? "✓ Disponibles" : "Voir disponibles"}
          </Button>
          {(searchTerm || filters.status || filters.department || filters.building || filters.available) && (
            <Button 
              variant="text"
              startIcon={<ClearIcon />}
              onClick={resetFilters}
            >
              Réinitialiser
            </Button>
          )}
        </Box>
        {isAdminOrTeacher && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/equipment/new')}
          >
            Ajouter un matériel
          </Button>
        )}
      </Box>

      {showFilters && (
        <Card variant="outlined" sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Filtres avancés
              </Typography>
              {!isAdminOrTeacher && (
                <Chip 
                  color="primary" 
                  size="small" 
                  label="Tous les statuts visibles" 
                />
              )}
            </Box>
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth size="small">
                  <InputLabel id="status-filter-label">Statut</InputLabel>
                  <Select
                    labelId="status-filter-label"
                    value={filters.status}
                    label="Statut"
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                  >
                    <MenuItem value="">Tous</MenuItem>
                    <MenuItem value="DISPONIBLE">Disponible</MenuItem>
                    <MenuItem value="EMPRUNTE">Emprunté</MenuItem>
                    <MenuItem value="MAINTENANCE">En maintenance</MenuItem>
                    <MenuItem value="HORS_SERVICE">Hors service</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth size="small">
                  <InputLabel id="department-filter-label">Département</InputLabel>
                  <Select
                    labelId="department-filter-label"
                    value={filters.department}
                    label="Département"
                    onChange={(e) => handleFilterChange('department', e.target.value)}
                  >
                    <MenuItem value="">Tous</MenuItem>
                    {uniqueDepartments.map((dept) => (
                      <MenuItem key={dept} value={dept}>{dept}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth size="small">
                  <InputLabel id="building-filter-label">Bâtiment</InputLabel>
                  <Select
                    labelId="building-filter-label"
                    value={filters.building}
                    label="Bâtiment"
                    onChange={(e) => handleFilterChange('building', e.target.value)}
                  >
                    <MenuItem value="">Tous</MenuItem>
                    {uniqueBuildings.map((building) => (
                      <MenuItem key={building} value={building}>{building}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Compteur de résultats */}
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          {filteredEquipment.length > 0 
            ? `${filteredEquipment.length} équipement${filteredEquipment.length > 1 ? 's' : ''} trouvé${filteredEquipment.length > 1 ? 's' : ''}`
            : 'Aucun équipement ne correspond aux critères de recherche'
          }
        </Typography>
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
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredEquipment
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((item: EquipmentWithRelations) => (
                <TableRow key={item.id}>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>{item.description}</TableCell>
                  <TableCell>{item.department}</TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell>
                    {typeof item.location === 'string' 
                      ? item.location.startsWith('Bâtiment ')
                        ? item.location.split(' - ').reduce((acc, part) => {
                            if (part.startsWith('Bâtiment ')) {
                              return acc + part.replace('Bâtiment ', '');
                            } else if (part.match(/\d+$/)) {
                              return acc + (part.match(/\d+$/)?.[0] || '');
                            }
                            return acc;
                          }, '')
                        : item.location
                      : item.location
                        ? `${(item.location as Location).building.replace('Bâtiment ', '')}${(item.location as Location).room?.match(/\d+$/)?.[0] || ''}`
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
                  <TableCell>
                    {isAdminOrTeacher ? (
                      <>
                        <IconButton
                          onClick={() => navigate(`/equipment/${item.id}`)}
                          size="small"
                          sx={{ mr: 1 }}
                          title="Modifier"
                        >
                          <EditIcon />
                        </IconButton>
                        {item.status === 'DISPONIBLE' && (
                          <Tooltip title="Demander cet équipement">
                            <IconButton
                              onClick={() => navigate(`/loans/new?equipmentId=${item.id}`)}
                              size="small"
                              color="primary"
                            >
                              <RequestIcon />
                            </IconButton>
                          </Tooltip>
                        )}
                      </>
                    ) : (
                      // Les étudiants ne peuvent emprunter que les équipements disponibles
                      item.status === 'DISPONIBLE' && (
                        <Button
                          variant="contained"
                          size="small"
                          onClick={() => navigate(`/loans/new?equipmentId=${item.id}`)}
                          startIcon={<RequestIcon />}
                        >
                          Emprunter
                        </Button>
                      )
                    )}
                  </TableCell>
                </TableRow>
              ))}

              {/* Si aucun résultat n'est trouvé, afficher un message */}
              {filteredEquipment.length === 0 && (
                <TableRow>
                  <TableCell colSpan={14} align="center" sx={{ py: 3 }}>
                    <Typography variant="body1">
                      Aucun équipement ne correspond aux critères de recherche.
                    </Typography>
                    <Button 
                      variant="text" 
                      startIcon={<ClearIcon />} 
                      onClick={resetFilters}
                      sx={{ mt: 1 }}
                    >
                      Réinitialiser les filtres
                    </Button>
                  </TableCell>
                </TableRow>
              )}
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
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} sur ${count}`}
        />
      </TableContainer>
    </Box>
  );
}; 