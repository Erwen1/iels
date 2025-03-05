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

export const userService = {
  async getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: profile } = await supabase
      .from('user_profiles')
      .select(`
        *,
        department:department_id(*),
        role:role_id(*)
      `)
      .eq('id', user.id)
      .single();

    return {
      ...user,
      profile,
    };
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
      .select('role:role_id(id, name, description, permissions)')
      .eq('id', userId)
      .single();

    if (error || !data?.role) return false;
    return (data.role as Role).permissions.includes(permission);
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
}; 