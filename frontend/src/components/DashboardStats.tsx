import React from 'react';
import { Box, Card, CardContent, Grid, Typography, useTheme } from '@mui/material';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartData
} from 'chart.js';
import { equipmentService } from '../services/equipment';
import { loanService } from '../services/loan';
import { useQuery } from '@tanstack/react-query';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface DashboardStatsProps {
  timeRange: '7d' | '30d' | '90d';
}

const DashboardStats: React.FC<DashboardStatsProps> = ({ timeRange }) => {
  const theme = useTheme();

  const { data: equipmentStats } = useQuery({
    queryKey: ['equipmentStats', timeRange],
    queryFn: () => equipmentService.getEquipmentStats(
      timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90
    )
  });

  const { data: loanStats } = useQuery({
    queryKey: ['loanStats', timeRange],
    queryFn: () => loanService.getLoanStats(timeRange)
  });

  // Prepare utilization trend data for chart
  const utilizationChartData: ChartData<'line'> = {
    labels: equipmentStats?.utilizationTrend.map(item => 
      new Date(item.date).toLocaleDateString('fr-FR')
    ) || [],
    datasets: [
      {
        label: 'Taux d\'utilisation (%)',
        data: equipmentStats?.utilizationTrend.map(item => item.utilization) || [],
        borderColor: theme.palette.primary.main,
        backgroundColor: theme.palette.primary.light,
        tension: 0.4
      }
    ]
  };

  // Prepare loan status trend data for chart
  const loanTrendChartData: ChartData<'line'> = {
    labels: loanStats?.statusTrend.map(item => 
      new Date(item.date).toLocaleDateString('fr-FR')
    ) || [],
    datasets: [
      {
        label: 'Emprunts actifs',
        data: loanStats?.statusTrend.map(item => item.active) || [],
        borderColor: theme.palette.success.main,
        backgroundColor: theme.palette.success.light,
        tension: 0.4
      },
      {
        label: 'En attente',
        data: loanStats?.statusTrend.map(item => item.pending) || [],
        borderColor: theme.palette.warning.main,
        backgroundColor: theme.palette.warning.light,
        tension: 0.4
      },
      {
        label: 'En retard',
        data: loanStats?.statusTrend.map(item => item.overdue) || [],
        borderColor: theme.palette.error.main,
        backgroundColor: theme.palette.error.light,
        tension: 0.4
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const
      }
    },
    scales: {
      y: {
        beginAtZero: true
      }
    }
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Grid container spacing={3}>
        {/* Equipment Statistics */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Statistiques des équipements
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Total des équipements
                  </Typography>
                  <Typography variant="h4">
                    {equipmentStats?.totalCount || 0}
                  </Typography>
                  <Typography variant="body2" color={equipmentStats?.trend && equipmentStats.trend > 0 ? 'success.main' : 'error.main'}>
                    {equipmentStats?.trend ? `${equipmentStats.trend.toFixed(1)}%` : '0%'}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                    Taux d'utilisation
                  </Typography>
                  <Box sx={{ height: 200 }}>
                    <Line data={utilizationChartData} options={chartOptions} />
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Loan Statistics */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Statistiques des emprunts
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={4}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Emprunts actifs
                  </Typography>
                  <Typography variant="h4">
                    {loanStats?.active || 0}
                  </Typography>
                  <Typography variant="body2" color={loanStats?.trends.active && loanStats.trends.active > 0 ? 'success.main' : 'error.main'}>
                    {loanStats?.trends.active ? `${loanStats.trends.active.toFixed(1)}%` : '0%'}
                  </Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="subtitle2" color="textSecondary">
                    En attente
                  </Typography>
                  <Typography variant="h4">
                    {loanStats?.pending || 0}
                  </Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="subtitle2" color="textSecondary">
                    En retard
                  </Typography>
                  <Typography variant="h4">
                    {loanStats?.overdue || 0}
                  </Typography>
                  <Typography variant="body2" color={loanStats?.trends.overdue && loanStats.trends.overdue > 0 ? 'error.main' : 'success.main'}>
                    {loanStats?.trends.overdue ? `${loanStats.trends.overdue.toFixed(1)}%` : '0%'}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                    Tendance des emprunts
                  </Typography>
                  <Box sx={{ height: 200 }}>
                    <Line data={loanTrendChartData} options={chartOptions} />
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Most Used Equipment */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Équipements les plus empruntés
              </Typography>
              <Grid container spacing={2}>
                {equipmentStats?.mostUsed.map((item, index) => (
                  <Grid item xs={12} key={index}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body1">
                        {item.name}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {item.loans} emprunts
                      </Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Loan Duration Statistics */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Durée des emprunts
              </Typography>
              <Grid container spacing={2}>
                {loanStats?.durationStats.map((item, index) => (
                  <Grid item xs={12} key={index}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body1">
                        {item.range}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {item.count} emprunts
                      </Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardStats; 