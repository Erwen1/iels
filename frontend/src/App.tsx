import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from './components/layout/MainLayout';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { theme } from './theme';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { EquipmentList } from './pages/equipment/EquipmentList';
import { EquipmentFormPage } from './pages/equipment/EquipmentFormPage';
import { EquipmentDetails } from './pages/equipment/EquipmentDetails';
import { useEffect } from 'react';
import { authService } from './services/auth';
import { useAuthStore } from './store/authStore';
import { LoanRequestPage } from './pages/loans/LoanRequestPage';
import { LoanManagementPage } from './pages/loans/LoanManagementPage';
import { DashboardPage } from './pages/DashboardPage';
import { LoanPage } from './pages/loan/LoanPage';
import { MaintenancePage } from './pages/maintenance/MaintenancePage';
import { AdminLoanPage } from './pages/admin/AdminLoanPage';
import { ProfilePage } from './pages/profile/ProfilePage';
import { AuthProvider } from './contexts/AuthContext';
import { RouterProvider } from 'react-router-dom';
import { DepartmentPage } from './pages/admin/DepartmentPage';
import { SettingsPage } from './pages/SettingsPage';

// Create a client
const queryClient = new QueryClient();

function App() {
  const { setUser, setLoading } = useAuthStore();

  useEffect(() => {
    // Check for existing session
    authService.getCurrentUser().then((user) => {
      setUser(user);
      setLoading(false);
    });

    // Subscribe to auth changes
    const { data: { subscription } } = authService.onAuthStateChange((user) => {
      setUser(user);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [setUser, setLoading]);

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <Router>
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              
              {/* Protected Routes */}
              <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/equipment" element={<EquipmentList />} />
                <Route path="/equipment/new" element={<EquipmentFormPage />} />
                <Route path="/equipment/:id" element={<EquipmentDetails />} />
                <Route path="/equipment/:id/edit" element={<EquipmentFormPage />} />
                <Route path="/loans/new" element={<LoanRequestPage />} />
                <Route path="/loans" element={<LoanPage />} />
                <Route path="/loans/admin" element={<AdminLoanPage />} />
                <Route path="/maintenance" element={<MaintenancePage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/departments" element={<DepartmentPage />} />
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
              </Route>
            </Routes>
          </Router>
        </ThemeProvider>
      </QueryClientProvider>
    </AuthProvider>
  );
}

export default App;
