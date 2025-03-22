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
import { StudentDashboardPage } from './pages/user/StudentDashboardPage';
import { TeacherDashboardPage } from './pages/user/TeacherDashboardPage';
import { LoanPage } from './pages/loan/LoanPage';
import { MaintenancePage } from './pages/maintenance/MaintenancePage';
import { AdminLoanPage } from './pages/admin/AdminLoanPage';
import { ProfilePage } from './pages/profile/ProfilePage';
import { AuthProvider } from './contexts/AuthContext';
import { RouterProvider } from 'react-router-dom';
import { SettingsPage } from './pages/SettingsPage';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { fr } from 'date-fns/locale';
import { UserManagementPage } from './pages/admin/UserManagementPage';
import { InventoryPage } from './pages/inventory';
import { RoleBasedRoute } from './components/auth/RoleBasedRoute';
import { UserRole } from './services/auth';
import TestSupabasePage from './pages/TestSupabasePage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

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
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={fr}>
          <AuthProvider>
            <Router>
              <Routes>
                {/* Public Routes */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/test-supabase" element={<TestSupabasePage />} />
                
                {/* Protected Routes */}
                <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
                  <Route path="/dashboard" element={
                    <RoleBasedRoute 
                      adminComponent={<DashboardPage />}
                      userComponent={<StudentDashboardPage />}
                      teacherComponent={<TeacherDashboardPage />}
                    />
                  } />
                  <Route path="/profile" element={<ProfilePage />} />
                  <Route path="/equipment" element={<EquipmentList />} />
                  <Route path="/equipment/new" element={
                    <RoleBasedRoute 
                      adminComponent={<EquipmentFormPage />}
                      userComponent={<Navigate to="/dashboard" replace />}
                      teacherComponent={<EquipmentFormPage />}
                      requiredRoles={['ADMIN', 'ENSEIGNANT']}
                    />
                  } />
                  <Route path="/equipment/:id" element={<EquipmentDetails />} />
                  <Route path="/equipment/:id/edit" element={
                    <RoleBasedRoute 
                      adminComponent={<EquipmentFormPage />}
                      userComponent={<Navigate to="/dashboard" replace />}
                      teacherComponent={<EquipmentFormPage />}
                      requiredRoles={['ADMIN', 'ENSEIGNANT']}
                    />
                  } />
                  <Route path="/loans/new" element={<LoanRequestPage />} />
                  <Route path="/loans" element={<AdminLoanPage />} />
                  <Route path="/loans/admin" element={<Navigate to="/loans" replace />} />
                  <Route path="/maintenance" element={<MaintenancePage />} />
                  <Route path="/settings" element={<SettingsPage />} />
                  <Route path="/inventory" element={
                    <RoleBasedRoute 
                      adminComponent={<InventoryPage />}
                      userComponent={<Navigate to="/dashboard" replace />}
                      teacherComponent={<InventoryPage />}
                      requiredRoles={[UserRole.ADMIN, UserRole.ENSEIGNANT]}
                    />
                  } />
                  <Route path="/users" element={
                    <RoleBasedRoute 
                      adminComponent={<UserManagementPage />}
                      userComponent={<Navigate to="/dashboard" replace />}
                      requiredRoles={[UserRole.ADMIN]}
                    />
                  } />
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
                </Route>
              </Routes>
            </Router>
          </AuthProvider>
        </LocalizationProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
