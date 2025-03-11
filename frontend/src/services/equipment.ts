import { supabase } from '../lib/supabase';
import type { Equipment, EquipmentStatus } from '../types/equipment';

interface EquipmentStats {
  totalCount: number;
  trend: number;
  mostUsed: Array<{
    name: string;
    loans: number;
  }>;
  utilizationTrend: Array<{
    date: string;
    utilization: number;
  }>;
}

// Type pour les données du formulaire d'équipement
type EquipmentFormData = Omit<Equipment, 'id' | 'created_at' | 'updated_at'> & {
  location?: string;
};

export const equipmentService = {
  // Equipment CRUD operations
  async getAllEquipment() {
    try {
      const { data, error } = await supabase
        .from('equipment')
        .select('*');

      if (error) {
        console.error('Error fetching equipment:', error);
        throw new Error('Erreur lors de la récupération des équipements');
      }

      return data as Equipment[] || [];
    } catch (err) {
      console.error('Error in getAllEquipment:', err);
      return [];
    }
  },

  /**
   * Récupère les équipements en fonction du rôle de l'utilisateur
   * Les administrateurs voient tous les équipements
   * Les utilisateurs standards ne voient que les équipements disponibles
   */
  async getEquipmentByUserRole(isAdmin: boolean = false) {
    try {
      // Pour les administrateurs, renvoyer tous les équipements
      if (isAdmin) {
        return this.getAllEquipment();
      }
      
      // Pour les utilisateurs standards, filtrer par statut DISPONIBLE
      const { data, error } = await supabase
        .from('equipment')
        .select('*')
        .eq('status', 'DISPONIBLE');

      if (error) {
        console.error('Error fetching equipment for user:', error);
        throw new Error('Erreur lors de la récupération des équipements');
      }

      return data as Equipment[] || [];
    } catch (err) {
      console.error('Error in getEquipmentByUserRole:', err);
      return [];
    }
  },

  async getEquipmentById(id: string) {
    try {
      const { data, error } = await supabase
        .from('equipment')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching equipment by id:', error);
        throw new Error('Erreur lors de la récupération de l\'équipement');
      }

      return data as Equipment;
    } catch (err) {
      console.error('Error in getEquipmentById:', err);
      throw new Error('Équipement non trouvé');
    }
  },

  async createEquipment(data: EquipmentFormData): Promise<Equipment> {
    try {
      // Liste des champs connus dans la base de données
      const knownColumns = [
        'reference', 'name', 'description', 'department',
        'quantity', 'location_id', 'equipment_manager_email', 
        'status', 'location'
      ];
      
      // Filtrer les propriétés pour ne garder que celles qui existent dans la base de données
      const filteredData = Object.entries(data).reduce((acc, [key, value]) => {
        if (knownColumns.includes(key)) {
          acc[key] = value;
        }
        return acc;
      }, {} as Record<string, any>);
      
      const { data: equipment, error } = await supabase
        .from('equipment')
        .insert([filteredData])
        .select()
        .single();

      if (error) {
        console.error('Error creating equipment:', error);
        throw new Error('Erreur lors de la création de l\'équipement');
      }

      return equipment as Equipment;
    } catch (err) {
      console.error('Error in createEquipment:', err);
      throw err;
    }
  },

  async updateEquipment(id: string, data: Omit<Equipment, 'id' | 'created_at' | 'updated_at'>) {
    try {
      // Convert Date objects to ISO strings
      const processedData = Object.entries(data).reduce((acc, [key, value]) => {
        if (value instanceof Date) {
          acc[key] = value.toISOString();
        } else {
          acc[key] = value;
        }
        return acc;
      }, {} as Record<string, any>);

      const { data: equipment, error } = await supabase
        .from('equipment')
        .update(processedData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating equipment:', error);
        throw new Error('Erreur lors de la mise à jour de l\'équipement');
      }

      return equipment;
    } catch (err) {
      console.error('Error in updateEquipment:', err);
      throw new Error('Impossible de mettre à jour l\'équipement');
    }
  },

  async deleteEquipment(id: string) {
    try {
      const { error } = await supabase
        .from('equipment')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting equipment:', error);
        throw new Error('Erreur lors de la suppression de l\'équipement');
      }

      return true;
    } catch (err) {
      console.error('Error in deleteEquipment:', err);
      throw new Error('Impossible de supprimer l\'équipement');
    }
  },

  async getEquipmentStats(days: number = 30): Promise<EquipmentStats> {
    try {
      console.log('Fetching equipment stats for', days, 'days');

      // Get total count and trend
      const { data: trendData, error: trendError } = await supabase
        .rpc('calculate_equipment_trend', { days });
      
      if (trendError) {
        console.error('Error fetching equipment trend:', trendError);
        throw new Error(`Failed to fetch equipment trend: ${trendError.message}`);
      }

      // Get total count
      const { count, error: countError } = await supabase
        .from('equipment')
        .select('*', { count: 'exact', head: true });

      if (countError) {
        console.error('Error fetching equipment count:', countError);
        throw new Error(`Failed to fetch equipment count: ${countError.message}`);
      }

      // Get most used equipment
      const { data: mostUsed, error: mostUsedError } = await supabase
        .rpc('get_most_used_equipment', { limit_count: 5 });

      if (mostUsedError) {
        console.error('Error fetching most used equipment:', mostUsedError);
        throw new Error(`Failed to fetch most used equipment: ${mostUsedError.message}`);
      }

      // Get utilization trend
      const { data: utilizationTrend, error: utilizationError } = await supabase
        .rpc('get_equipment_utilization_trend', { days });

      if (utilizationError) {
        console.error('Error fetching utilization trend:', utilizationError);
        throw new Error(`Failed to fetch utilization trend: ${utilizationError.message}`);
      }

      const stats: EquipmentStats = {
        totalCount: count || 0,
        trend: trendData?.[0]?.trend || 0,
        mostUsed: mostUsed || [],
        utilizationTrend: utilizationTrend || []
      };

      console.log('Equipment stats fetched successfully:', stats);
      return stats;
    } catch (error) {
      console.error('Error in getEquipmentStats:', error);
      throw error;
    }
  },

  async getDepartmentStats(): Promise<Array<{ department: string; count: number }>> {
    try {
      console.log('Fetching department stats');
      const { data, error } = await supabase
        .from('equipment')
        .select('department')
        .not('department', 'is', null);

      if (error) {
        console.error('Error fetching department stats:', error);
        throw new Error(`Failed to fetch department stats: ${error.message}`);
      }

      const departmentCounts = data?.reduce((acc: Record<string, number>, item) => {
        const dept = item.department as string;
        acc[dept] = (acc[dept] || 0) + 1;
        return acc;
      }, {});

      const stats = Object.entries(departmentCounts || {}).map(([department, count]) => ({
        department,
        count
      }));

      console.log('Department stats fetched successfully:', stats);
      return stats;
    } catch (error) {
      console.error('Error in getDepartmentStats:', error);
      throw error;
    }
  },

  async getStatusStats(): Promise<Array<{ status: string; count: number }>> {
    try {
      console.log('Fetching status stats');
      const { data, error } = await supabase
        .from('equipment')
        .select('status')
        .not('status', 'is', null);

      if (error) {
        console.error('Error fetching status stats:', error);
        throw new Error(`Failed to fetch status stats: ${error.message}`);
      }

      const statusCounts = data?.reduce((acc: Record<string, number>, item) => {
        const status = item.status as string;
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {});

      const stats = Object.entries(statusCounts || {}).map(([status, count]) => ({
        status,
        count
      }));

      console.log('Status stats fetched successfully:', stats);
      return stats;
    } catch (error) {
      console.error('Error in getStatusStats:', error);
      throw error;
    }
  },

  async getEquipmentByDepartment(departmentId: string): Promise<Equipment[]> {
    try {
      const { data, error } = await supabase
        .from('equipment')
        .select('*')
        .eq('department_id', departmentId);

      if (error) {
        console.error('Error fetching department equipment:', error);
        throw new Error('Erreur lors de la récupération des équipements du département');
      }

      return data as Equipment[] || [];
    } catch (err) {
      console.error('Error in getEquipmentByDepartment:', err);
      return [];
    }
  },

  async getDepartmentEquipmentStats(departmentId: string) {
    try {
      const { data: equipment, error } = await supabase
        .from('equipment')
        .select('*, department:department_id(*)')
        .eq('department_id', departmentId);

      if (error) {
        console.error('Error fetching department equipment stats:', error);
        throw new Error('Erreur lors de la récupération des statistiques du département');
      }

      // Obtenir les informations sur le département
      const departmentName = equipment && equipment.length > 0 && equipment[0].department 
        ? equipment[0].department.name 
        : 'Inconnu';

      // Calculer les statistiques
      const totalCount = equipment.length;
      const availableCount = equipment.filter((item: Equipment) => item.status === 'DISPONIBLE').length;
      const borrowedCount = equipment.filter((item: Equipment) => item.status === 'EMPRUNTE').length;
      const maintenanceCount = equipment.filter((item: Equipment) => item.status === 'MAINTENANCE').length;

      // Calculer le pourcentage d'équipements disponibles
      const availablePercentage = totalCount > 0 ? Math.round((availableCount / totalCount) * 100) : 0;

      // Calculer le nombre d'équipements en retard (à implémenter avec la logique appropriée)
      const overdueCount = 0; // Placeholder

      return {
        departmentId,
        departmentName,
        totalCount,
        availableCount,
        borrowedCount,
        maintenanceCount,
        availablePercentage,
        overdueCount,
      };
    } catch (err) {
      console.error('Error in getDepartmentEquipmentStats:', err);
      return {
        departmentId,
        departmentName: 'Inconnu',
        totalCount: 0,
        availableCount: 0,
        borrowedCount: 0,
        maintenanceCount: 0,
        availablePercentage: 0,
        overdueCount: 0,
      };
    }
  },
}; 