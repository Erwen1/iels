import React, { useState } from 'react';
import {
  Box,
  Container,
  Grid,
  Typography,
  Button,
  Menu,
  MenuItem,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  FilterList as FilterListIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';
import DashboardStats from '../components/DashboardStats';

export const DashboardPage: React.FC = () => {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleTimeRangeClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleTimeRangeClose = (range?: '7d' | '30d' | '90d') => {
    if (range) {
      setTimeRange(range);
    }
    setAnchorEl(null);
  };

  const handleExportData = () => {
    // Implement export functionality
    console.log('Export data');
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', my: 4 }}>
        <Typography variant="h4" component="h1">
          Tableau de bord
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<FilterListIcon />}
            onClick={handleTimeRangeClick}
          >
            {timeRange === '7d'
              ? '7 derniers jours'
              : timeRange === '30d'
              ? '30 derniers jours'
              : '90 derniers jours'}
          </Button>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={() => handleTimeRangeClose()}
          >
            <MenuItem onClick={() => handleTimeRangeClose('7d')}>7 derniers jours</MenuItem>
            <MenuItem onClick={() => handleTimeRangeClose('30d')}>30 derniers jours</MenuItem>
            <MenuItem onClick={() => handleTimeRangeClose('90d')}>90 derniers jours</MenuItem>
          </Menu>
          <Tooltip title="Exporter les données">
            <IconButton onClick={handleExportData}>
              <DownloadIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
      <DashboardStats timeRange={timeRange} />
    </Container>
  );
}; 