import { supabase } from '../lib/supabase';

export interface UserProfile {
  id: string;
  full_name: string | null;
  department_id: string | null;
  role_id: string | null;
  phone: string | null;
  office_location: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
  department?: Department;
  role?: Role;
}

export interface Department {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface Role {
  id: string;
  name: string;
  description: string | null;
  permissions: string[];
  created_at: string;
  updated_at: string;
}

export interface UserActivity {
  id: string;
  user_id: string;
  activity_type: string;
  description: string;
  metadata: any;
  created_at: string;
}

export interface User {
  id: string;
  email: string;
  full_name?: string;
  role: string;
  department?: string;
  created_at: string;
  updated_at: string;
}

export const userService = {
  async getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    // Récupérer le profil utilisateur
    const { data: profile } = await supabase
      .from('user_profiles')
      .select(`
        *,
        department:department_id(*),
        role:role_id(*)
      `)
      .eq('id', user.id)
      .single();
      
    // Récupérer également les informations de la table users
    const { data: userData } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();
      
    // Fusionner les informations
    const mergedUser = {
      ...user,
      profile,
      // Si userData existe, utiliser son rôle, sinon utiliser celui des métadonnées ou un rôle par défaut
      role: userData?.role || user.user_metadata?.role || 'ETUDIANT'
    };
    
    // Si le profil existe mais que le rôle ne correspond pas à celui de la table users,
    // mettre à jour le rôle dans user_profiles
    if (profile && userData && profile.role?.name !== userData.role) {
      console.log(`Synchronisation du rôle: ${profile.role?.name} -> ${userData.role}`);
      
      // Obtenir l'ID du rôle
      const roleMapping: { [key: string]: string } = {
        'ADMIN': '1',
        'ENSEIGNANT': '2',
        'ETUDIANT': '3'
      };
      
      const roleId = roleMapping[userData.role] || '3';
      
      // Mettre à jour silencieusement le profil
      supabase
        .from('user_profiles')
        .update({ role_id: roleId })
        .eq('id', user.id)
        .then(({ error }) => {
          if (error) {
            console.error('Erreur lors de la synchronisation du rôle dans le profil:', error);
          }
        });
    }

    return mergedUser;
  },

  async updateProfile(userId: string, profile: Partial<UserProfile>) {
    const { data, error } = await supabase
      .from('user_profiles')
      .update(profile)
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getDepartments() {
    const { data, error } = await supabase
      .from('departments')
      .select('*')
      .order('name');

    if (error) throw error;
    return data;
  },

  async createDepartment(department: Pick<Department, 'name' | 'description'>) {
    const { data, error } = await supabase
      .from('departments')
      .insert([department])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateDepartment(id: string, department: Partial<Department>) {
    const { data, error } = await supabase
      .from('departments')
      .update(department)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getRoles() {
    const { data, error } = await supabase
      .from('roles')
      .select('*')
      .order('name');

    if (error) throw error;
    return data;
  },

  async getUserActivities(userId: string, limit = 10) {
    const { data, error } = await supabase
      .from('user_activity_logs')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  },

  async logActivity(activity: Omit<UserActivity, 'id' | 'created_at'>) {
    const { error } = await supabase
      .from('user_activity_logs')
      .insert([activity]);

    if (error) throw error;
  },

  async hasPermission(userId: string, permission: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('user_profiles')
      .select(`
        role_id(*)
      `)
      .eq('id', userId)
      .single();

    if (error || !data?.role_id) return false;
    
    // Corriger l'erreur de typage en vérifiant la forme de la donnée
    const role = data.role_id as unknown as Role;
    return role && Array.isArray(role.permissions) && role.permissions.includes(permission);
  },

  async updatePassword(userId: string, { currentPassword, newPassword }: { currentPassword: string; newPassword: string }) {
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (error) throw error;
  },

  async updateProfilePicture(userId: string, file: File) {
    const fileExt = file.name.split('.').pop();
    const filePath = `${userId}/avatar.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, { upsert: true });

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath);

    const { error: updateError } = await supabase
      .from('user_profiles')
      .update({ avatar_url: publicUrl })
      .eq('id', userId);

    if (updateError) throw updateError;

    return publicUrl;
  },

  getProfilePictureUrl(userId: string) {
    return supabase.storage
      .from('avatars')
      .getPublicUrl(`${userId}/avatar.jpg`).data.publicUrl;
  },

  // Récupérer tous les utilisateurs
  async getAllUsers(): Promise<User[]> {
    try {
      // Essayer d'abord avec la table users directement
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (!usersError && usersData && usersData.length > 0) {
        return usersData.map((user: any) => ({
          id: user.id,
          email: user.email || '',
          full_name: user.full_name || '',
          role: user.role || 'ETUDIANT',
          department: user.department || '',
          created_at: user.created_at,
          updated_at: user.updated_at,
        }));
      }
      
      // Si la table users n'est pas accessible, essayer avec la table user_profiles
      console.log('Tentative avec user_profiles après échec de users:', usersError);
      
      const { data: profiles, error: profilesError } = await supabase
        .from('user_profiles')
        .select(`
          *,
          department:department_id(*),
          role:role_id(*)
        `);
        
      if (!profilesError && profiles && profiles.length > 0) {
        console.log('Récupération depuis user_profiles réussie');
        return profiles.map((profile: any) => {
          return {
            id: profile.id,
            email: '', // Nous n'avons pas cette info sans l'auth
            full_name: profile.full_name || '',
            role: profile.role?.name || 'ETUDIANT',
            department: profile.department?.name || '',
            created_at: profile.created_at,
            updated_at: profile.updated_at,
          };
        });
      }
      
      // En dernier recours, essayer de récupérer les utilisateurs directement de auth.users
      console.log('Tentative de récupération des utilisateurs depuis auth');
      const { data: { users: authUsers }, error: authError } = await supabase.auth.admin.listUsers();
      
      if (!authError && authUsers && authUsers.length > 0) {
        console.log('Récupération depuis auth.users réussie');
        return authUsers.map((user: any) => ({
          id: user.id,
          email: user.email || '',
          full_name: user.user_metadata?.full_name || '',
          role: user.user_metadata?.role || 'ETUDIANT',
          department: user.user_metadata?.department || '',
          created_at: user.created_at,
          updated_at: user.updated_at || user.created_at,
        }));
      }
      
      console.error('Aucune méthode n\'a fonctionné pour récupérer les utilisateurs');
      return [];
    } catch (err) {
      console.error('Erreur dans getAllUsers:', err);
      return [];
    }
  },

  // Récupérer un utilisateur par son ID
  async getUserById(id: string): Promise<User | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Erreur lors de la récupération de l\'utilisateur:', error);
        throw new Error('Erreur lors de la récupération de l\'utilisateur');
      }

      return data as User;
    } catch (err) {
      console.error('Erreur dans getUserById:', err);
      return null;
    }
  },

  // Mettre à jour le rôle d'un utilisateur
  async updateUserRole(userId: string, role: string) {
    try {
      console.log(`Mise à jour du rôle pour l'utilisateur ${userId} vers ${role}`);
      
      // 1. Mettre à jour la table users
      const { error: usersError } = await supabase
        .from('users')
        .update({ role })
        .eq('id', userId);
      
      if (usersError) {
        console.error('Erreur lors de la mise à jour du rôle dans users:', usersError);
        throw new Error(`Erreur lors de la mise à jour du rôle dans users: ${usersError.message}`);
      }
      
      // 2. Obtenir l'ID du rôle depuis la table roles
      let roleId: string | null = null;
      const { data: roleData, error: roleError } = await supabase
        .from('roles')
        .select('id')
        .eq('name', role)
        .single();
      
      if (!roleError && roleData) {
        roleId = roleData.id;
        console.log(`ID du rôle ${role} trouvé: ${roleId}`);
        
        // 3. Mettre à jour le rôle dans user_profiles
        const { error: profileError } = await supabase
          .from('user_profiles')
          .update({ role_id: roleId })
          .eq('id', userId);
        
        if (profileError) {
          console.error('Erreur lors de la mise à jour du profil:', profileError);
          // Continuer même si cette mise à jour échoue
        }
      } else {
        console.error('Rôle non trouvé dans la table roles:', roleError || 'Aucun rôle correspondant');
        // Essayer une approche alternative pour user_profiles
        const roleMapping: { [key: string]: string } = {
          'ADMIN': '1',
          'ENSEIGNANT': '2',
          'ETUDIANT': '3'
        };
        
        const mappedRoleId = roleMapping[role] || '3'; // Par défaut ETUDIANT
        
        const { error: profileError } = await supabase
          .from('user_profiles')
          .update({ role_id: mappedRoleId })
          .eq('id', userId);
        
        if (profileError) {
          console.error('Erreur lors de la mise à jour du profil (approche alternative):', profileError);
        }
      }
      
      // 4. Mettre à jour les métadonnées dans auth.users
      try {
        const { error: authError } = await supabase.auth.admin.updateUserById(
          userId,
          { user_metadata: { role } }
        );
        
        if (authError) {
          console.error('Erreur lors de la mise à jour des métadonnées:', authError);
          // Continuer même si cette mise à jour échoue
        }
      } catch (authUpdateError) {
        console.error('Exception lors de la mise à jour des métadonnées:', authUpdateError);
        // Essayer une approche alternative
        try {
          await supabase.rpc('update_user_metadata', { 
            user_id: userId, 
            metadata: { role } 
          });
        } catch (rpcError) {
          console.error('Échec de la mise à jour des métadonnées via RPC:', rpcError);
        }
      }
      
      // 5. Enregistrer cette activité
      await this.logActivity({
        user_id: userId,
        activity_type: 'ROLE_UPDATE',
        description: `Rôle mis à jour vers ${role}`,
        metadata: { newRole: role }
      }).catch(error => {
        console.error('Erreur lors de l\'enregistrement de l\'activité:', error);
      });
      
      console.log(`Mise à jour du rôle réussie pour l'utilisateur ${userId}`);
      return { success: true };
    } catch (err) {
      console.error('Erreur dans updateUserRole:', err);
      throw err;
    }
  },

  // Créer ou mettre à jour un utilisateur
  async upsertUser(user: Partial<User>): Promise<User | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .upsert(user)
        .select()
        .single();

      if (error) {
        console.error('Erreur lors de l\'enregistrement de l\'utilisateur:', error);
        throw new Error('Erreur lors de l\'enregistrement de l\'utilisateur');
      }

      return data as User;
    } catch (err) {
      console.error('Erreur dans upsertUser:', err);
      throw err;
    }
  },

  // Vérifier si la table des utilisateurs existe
  async checkUsersTableExists(): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('count(*)', { count: 'exact', head: true })
        .limit(1);
      
      if (error && error.code === '42P01') {
        // Table doesn't exist
        return false;
      }
      
      return true;
    } catch (err) {
      console.error('Erreur dans checkUsersTableExists:', err);
      return false;
    }
  },

  // Synchroniser les utilisateurs existants dans auth.users avec la table users
  async syncExistingUsers(): Promise<number> {
    try {
      // Vérifier si la table users existe
      const { count, error: countError } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true });
      
      // Si on ne peut pas accéder à la table, c'est qu'elle n'existe probablement pas
      if (countError && countError.code === '42P01') { // Relation n'existe pas
        console.log('La table users n\'existe pas. Veuillez exécuter le script SQL pour la créer.');
        return 0;
      }
      
      // Récupérer tous les utilisateurs de auth.users
      const { data: { users: authUsers }, error: authError } = await supabase.auth.admin.listUsers();
      
      if (authError || !authUsers) {
        console.error('Erreur lors de la récupération des utilisateurs auth:', authError);
        return 0;
      }
      
      console.log(`${authUsers.length} utilisateurs trouvés dans auth.users`);
      
      // Récupérer les utilisateurs déjà dans la table users
      const { data: existingUsers, error: existingError } = await supabase
        .from('users')
        .select('id');
        
      if (existingError) {
        console.error('Erreur lors de la récupération des utilisateurs existants:', existingError);
        return 0;
      }
      
      // Créer un ensemble d'IDs existants pour une recherche rapide
      const existingIds = new Set((existingUsers || []).map(u => u.id));
      console.log(`${existingIds.size} utilisateurs déjà dans la table users`);
      
      // Filtrer pour obtenir seulement les utilisateurs qui n'existent pas déjà
      const newUsers = authUsers.filter(user => !existingIds.has(user.id));
      
      if (newUsers.length === 0) {
        console.log('Aucun nouvel utilisateur à synchroniser');
        return 0;
      }
      
      console.log(`${newUsers.length} nouveaux utilisateurs à synchroniser`);
      
      // Convertir les utilisateurs auth en format user
      const usersToInsert = newUsers.map(user => ({
        id: user.id,
        email: user.email,
        full_name: user.user_metadata?.full_name || '',
        role: user.user_metadata?.role || 'ETUDIANT',
        department: user.user_metadata?.department || '',
        created_at: user.created_at,
        updated_at: user.updated_at || user.created_at
      }));
      
      // Insérer les utilisateurs par lots pour éviter les erreurs
      let insertedCount = 0;
      const batchSize = 20;
      
      for (let i = 0; i < usersToInsert.length; i += batchSize) {
        const batch = usersToInsert.slice(i, i + batchSize);
        const { error: insertError } = await supabase
          .from('users')
          .insert(batch);
          
        if (insertError) {
          console.error(`Erreur lors de l'insertion du lot ${i / batchSize + 1}:`, insertError);
        } else {
          insertedCount += batch.length;
        }
      }
      
      console.log(`${insertedCount} utilisateurs synchronisés avec succès`);
      return insertedCount;
    } catch (error) {
      console.error('Erreur dans syncExistingUsers:', error);
      return 0;
    }
  }
}; 