import { supabase } from '../lib/supabase';
import type { LoginCredentials, RegisterCredentials, AuthError } from '../types/auth';
import { userService } from './user';

// Définition des rôles du système
export enum UserRole {
  ETUDIANT = 'ETUDIANT',
  ENSEIGNANT = 'ENSEIGNANT',
  ADMIN = 'ADMIN'
}

export const authService = {
  async login({ email, password }: LoginCredentials) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw { message: error.message } as AuthError;
    }

    return data;
  },

  async register({ email, password, fullName, department }: RegisterCredentials) {
    // 1. Inscription avec Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          department,
          role: UserRole.ETUDIANT,
        },
      },
    });

    if (error) {
      throw { message: error.message } as AuthError;
    }

    // 2. Si l'utilisateur est créé, créer son profil et l'ajouter à la table users
    if (data.user) {
      try {
        // Vérifier si le profil existe déjà
        const { data: existingProfile } = await supabase
          .from('user_profiles')
          .select('id')
          .eq('id', data.user.id)
          .single();

        if (!existingProfile) {
          // Récupérer l'ID du rôle ETUDIANT
          const roleId = await getRoleIdByName(UserRole.ETUDIANT);
          
          // Créer le profil utilisateur
          await supabase.from('user_profiles').insert({
            id: data.user.id,
            full_name: fullName,
            role_id: roleId,
          });
          
          // Ajouter l'utilisateur à la table users
          const { error: usersError } = await supabase
            .from('users')
            .insert({
              id: data.user.id,
              email: email,
              full_name: fullName,
              role: UserRole.ETUDIANT,
              department: department || null,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            });
            
          if (usersError) {
            console.error('Erreur lors de l\'ajout de l\'utilisateur à la table users:', usersError);
            
            // Si la table users n'existe pas, essayons de la créer
            if (usersError.code === '42P01') { // relation does not exist
              await createUsersTableIfNotExists();
              
              // Réessayer d'insérer l'utilisateur
              await supabase
                .from('users')
                .insert({
                  id: data.user.id,
                  email: email,
                  full_name: fullName,
                  role: UserRole.ETUDIANT,
                  department: department || null,
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                });
            }
          }
          
          // Enregistrer l'activité de création du compte
          await userService.logActivity({
            user_id: data.user.id,
            activity_type: 'ACCOUNT_CREATED',
            description: 'Compte créé avec succès',
            metadata: { registration_method: 'email' }
          });
        }
      } catch (profileError) {
        console.error('Erreur lors de la création du profil :', profileError);
        // Ne pas bloquer le processus d'inscription si la création du profil échoue
      }
    }

    return data;
  },

  async logout() {
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw { message: error.message } as AuthError;
    }
  },

  async getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  },

  onAuthStateChange(callback: (user: any) => void) {
    return supabase.auth.onAuthStateChange((_, session) => {
      callback(session?.user ?? null);
    });
  },
};

async function getRoleIdByName(roleName: string): Promise<string | null> {
  try {
    const { data } = await supabase
      .from('roles')
      .select('id')
      .eq('name', roleName)
      .single();
    
    return data?.id || null;
  } catch (error) {
    console.error('Erreur lors de la récupération du rôle :', error);
    return null;
  }
}

// Fonction pour créer la table users si elle n'existe pas
async function createUsersTableIfNotExists() {
  try {
    // Tenter d'utiliser une fonction RPC pour créer la table
    const { error } = await supabase.rpc('create_users_table_if_not_exists');
    
    if (error) {
      console.error('Erreur lors de la création de la table users via RPC:', error);
      
      // Si la fonction RPC n'existe pas, nous ne pouvons pas créer la table directement
      // depuis le client, car il n'a pas les permissions nécessaires.
      // On peut seulement vérifier si la table existe
      
      const { error: checkError } = await supabase
        .from('users')
        .select('count(*)', { count: 'exact', head: true })
        .limit(1);
      
      if (checkError) {
        console.error('La table users n\'existe pas et ne peut pas être créée depuis le client:', checkError);
        console.log('Un administrateur doit créer la table users manuellement.');
      }
    }
  } catch (err) {
    console.error('Erreur lors de la vérification/création de la table users:', err);
  }
} 