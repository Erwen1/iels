import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { UserRole } from '../../services/auth';

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
  const { user } = useAuth();
  
  // Log pour débogage
  console.log('RoleBasedRoute - User:', user);
  console.log('RoleBasedRoute - Required roles:', requiredRoles);
  
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
  console.log(`User does not have required roles, redirecting to ${fallbackPath}`);
  return <Navigate to={fallbackPath} replace />;
}; 