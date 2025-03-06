import { supabase } from '../lib/supabase';
import type { Location } from '../types/equipment';

export const locationService = {
  // Get all locations
  async getAllLocations(): Promise<Location[]> {
    try {
      // D'abord, vérifier si la table existe
      const tableExists = await this.checkLocationsTableExists();
      
      if (!tableExists) {
        console.log('getAllLocations: la table n\'existe pas, retour d\'un tableau vide');
        return [];
      }
      
      // Si la table existe, procéder à la récupération des données
      const { data, error } = await supabase
        .from('locations')
        .select('*')
        .order('building', { ascending: true })
        .order('room', { ascending: true });

      if (error) {
        console.error('Erreur lors de la récupération des localisations:', error);
        return [];
      }

      return data as Location[] || [];
    } catch (err) {
      console.error('Erreur dans getAllLocations:', err);
      return [];
    }
  },

  // Get location by ID
  async getLocationById(id: string): Promise<Location> {
    try {
      const { data, error } = await supabase
        .from('locations')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching location by id:', error);
        throw new Error('Erreur lors de la récupération de la localisation');
      }

      return data as Location;
    } catch (err) {
      console.error('Error in getLocationById:', err);
      throw err;
    }
  },

  // Create a new location
  async createLocation(location: Omit<Location, 'id' | 'created_at' | 'updated_at'>): Promise<Location> {
    try {
      const { data, error } = await supabase
        .from('locations')
        .insert([location])
        .select()
        .single();

      if (error) {
        console.error('Error creating location:', error);
        throw new Error('Erreur lors de la création de la localisation');
      }

      return data as Location;
    } catch (err) {
      console.error('Error in createLocation:', err);
      throw err;
    }
  },

  // Update an existing location
  async updateLocation(id: string, location: Partial<Omit<Location, 'id' | 'created_at' | 'updated_at'>>): Promise<Location> {
    try {
      const { data, error } = await supabase
        .from('locations')
        .update(location)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating location:', error);
        throw new Error('Erreur lors de la mise à jour de la localisation');
      }

      return data as Location;
    } catch (err) {
      console.error('Error in updateLocation:', err);
      throw err;
    }
  },

  // Delete a location
  async deleteLocation(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('locations')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting location:', error);
        throw new Error('Erreur lors de la suppression de la localisation');
      }
    } catch (err) {
      console.error('Error in deleteLocation:', err);
      throw err;
    }
  },

  // Check if 'locations' table exists
  async checkLocationsTableExists(): Promise<boolean> {
    try {
      // Tenter de récupérer une ligne, ce qui générera une erreur propre si la table n'existe pas
      const { data, error } = await supabase
        .from('locations')
        .select('*')
        .limit(1);
      
      // Si pas d'erreur, la table existe
      if (!error) {
        return true;
      }
      
      // Vérifier si l'erreur est "relation doesn't exist"
      if (error.code === '42P01') {
        console.log('La table des localisations n\'existe pas encore');
        return false;
      }
      
      // Autre type d'erreur, on considère que la table n'existe pas par précaution
      console.error('Erreur lors de la vérification de l\'existence de la table:', error);
      return false;
    } catch (err) {
      console.error('Erreur dans checkLocationsTableExists:', err);
      return false;
    }
  }
}; 