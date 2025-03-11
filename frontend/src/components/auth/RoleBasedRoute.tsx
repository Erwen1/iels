import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { UserRole } from '../../services/auth';
import { CircularProgress, Box } from '@mui/material';

interface RoleBasedRouteProps {
  adminComponent: React.ReactNode;
  userComponent: React.ReactNode;
  teacherComponent?: React.ReactNode; // Composant optionnel pour les enseignants
  requiredRoles?: string[]; // Rôles autorisés pour accéder à cette route
  fallbackPath?: string; // Chemin de redirection si l'accès est refusé
}

export const RoleBasedRoute: React.FC<RoleBasedRouteProps> = ({ 
  adminComponent, 
  userComponent,
  teacherComponent,
  requiredRoles = [], 
  fallbackPath = '/dashboard'
}) => {
  const { user, loading } = useAuth();
  
  // Enhanced debugging logs
  console.log('RoleBasedRoute - Debug Info:', {
    user,
    userRole: user?.role,
    requiredRoles,
    isAdmin: user?.role === 'ADMIN',
    hasRequiredRole: user?.role ? requiredRoles.includes(user.role) : false,
    loading
  });
  
  // Show loading state while waiting for user data
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  // Si aucun rôle requis n'est spécifié, on vérifie juste si l'utilisateur est connecté
  if (requiredRoles.length === 0) {
    console.log('No required roles, using default role-based routing');
    if (user?.role === 'ADMIN') {
      console.log('User is ADMIN, showing admin component');
      return <>{adminComponent}</>;
    } else if (user?.role === 'ENSEIGNANT' && teacherComponent) {
      console.log('User is ENSEIGNANT, showing teacher component');
      return <>{teacherComponent}</>;
    } else {
      console.log('User has no special role, showing user component');
      return <>{userComponent}</>;
    }
  }
  
  // Si des rôles spécifiques sont requis, vérifier si l'utilisateur a l'un de ces rôles
  if (user?.role && requiredRoles.includes(user.role)) {
    console.log(`User has required role: ${user.role}`);
    if (user.role === 'ADMIN') {
      console.log('Showing admin component');
      return <>{adminComponent}</>;
    } else if (user.role === 'ENSEIGNANT' && teacherComponent) {
      console.log('Showing teacher component');
      return <>{teacherComponent}</>;
    } else {
      console.log('Showing user component');
      return <>{userComponent}</>;
    }
  }
  
  // Si l'utilisateur n'a pas les droits requis, le rediriger
  console.log('Access denied - Current state:', {
    userRole: user?.role,
    requiredRoles,
    redirectingTo: fallbackPath
  });
  return <Navigate to={fallbackPath} replace />;
}; 