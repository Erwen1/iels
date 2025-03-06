import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { User } from '@supabase/supabase-js';

// Type étendu qui inclut un champ role
interface UserWithRole extends User {
  role?: string;
}

export function useAuth() {
  const [user, setUser] = useState<UserWithRole | null>(null);
  const [loading, setLoading] = useState(true);

  // Fonction pour récupérer les détails utilisateur, incluant le rôle
  const fetchUserDetails = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();
      
      // Si l'erreur est que la table n'existe pas, on retourne un objet temporaire
      if (error && error.code === '42P01') { // Code PostgreSQL pour "relation does not exist"
        console.log('La table users n\'existe pas encore. Considérons cet utilisateur comme ADMIN temporairement.');
        return { role: 'ADMIN' }; // Attribution temporaire du rôle admin
      }
      
      if (error) {
        console.error('Erreur lors de la récupération des détails utilisateur:', error);
        return null;
      }
      
      if (data) {
        return data;
      }
      
      return null;
    } catch (err) {
      console.error('Erreur dans fetchUserDetails:', err);
      return null;
    }
  };

  // Fonction pour enrichir l'utilisateur avec les données de rôle
  const enrichUserWithRole = async (authUser: User | null) => {
    if (!authUser) {
      setUser(null);
      return;
    }
    
    try {
      const userDetails = await fetchUserDetails(authUser.id);
      
      if (userDetails) {
        // Fusionner les détails utilisateur avec l'objet d'authentification
        const enrichedUser: UserWithRole = {
          ...authUser,
          role: userDetails.role || 'USER',
        };
        
        setUser(enrichedUser);
      } else {
        // Si on ne trouve pas les détails, on utilise quand même l'utilisateur de base
        console.warn('Détails utilisateur non trouvés, rôle par défaut utilisé');
        setUser({
          ...authUser,
          role: 'USER'
        });
      }
    } catch (err) {
      console.error('Erreur lors de l\'enrichissement de l\'utilisateur:', err);
      // En cas d'erreur, on utilise l'utilisateur sans rôle
      setUser(authUser);
    }
  };

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        enrichUserWithRole(session.user);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        enrichUserWithRole(session.user);
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
  };

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });
    if (error) throw error;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  return {
    user,
    loading,
    signIn,
    signUp,
    signOut,
  };
} 