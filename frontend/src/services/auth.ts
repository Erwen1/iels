import { supabase } from './supabase';
import type { LoginCredentials, RegisterCredentials, AuthError } from '../types/auth';

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
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          department,
        },
      },
    });

    if (error) {
      throw { message: error.message } as AuthError;
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