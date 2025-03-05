import { supabase } from '../lib/supabase';
import type { MaintenanceRecord, MaintenanceType } from '../types/equipment';

export const maintenanceService = {
  async createMaintenanceRecord(
    data: Omit<MaintenanceRecord, 'id' | 'created_at' | 'updated_at'>
  ): Promise<MaintenanceRecord> {
    try {
      const { data: record, error } = await supabase
        .from('maintenance_records')
        .insert([data])
        .select()
        .single();

      if (error) {
        console.error('Error creating maintenance record:', error);
        throw new Error('Erreur lors de la création de l\'enregistrement de maintenance');
      }

      return record;
    } catch (err) {
      console.error('Error in createMaintenanceRecord:', err);
      throw new Error('Impossible de créer l\'enregistrement de maintenance');
    }
  },

  async getMaintenanceRecordsByEquipment(equipmentId: string): Promise<MaintenanceRecord[]> {
    try {
      const { data: records, error } = await supabase
        .from('maintenance_records')
        .select('*')
        .eq('equipment_id', equipmentId)
        .order('maintenance_date', { ascending: false });

      if (error) {
        console.error('Error fetching maintenance records:', error);
        throw new Error('Erreur lors de la récupération des enregistrements de maintenance');
      }

      return records;
    } catch (err) {
      console.error('Error in getMaintenanceRecordsByEquipment:', err);
      return [];
    }
  },

  async getAllMaintenanceRecords(): Promise<MaintenanceRecord[]> {
    try {
      const { data: records, error } = await supabase
        .from('maintenance_records')
        .select(`
          *,
          equipment:equipment_id (name)
        `)
        .order('maintenance_date', { ascending: false });

      if (error) {
        console.error('Error fetching all maintenance records:', error);
        throw new Error('Erreur lors de la récupération des enregistrements de maintenance');
      }

      return records;
    } catch (err) {
      console.error('Error in getAllMaintenanceRecords:', err);
      return [];
    }
  },

  async updateMaintenanceRecord(
    id: string,
    data: Partial<Omit<MaintenanceRecord, 'id' | 'created_at' | 'updated_at'>>
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('maintenance_records')
        .update(data)
        .eq('id', id);

      if (error) {
        console.error('Error updating maintenance record:', error);
        throw new Error('Erreur lors de la mise à jour de l\'enregistrement de maintenance');
      }
    } catch (err) {
      console.error('Error in updateMaintenanceRecord:', err);
      throw new Error('Impossible de mettre à jour l\'enregistrement de maintenance');
    }
  },

  async deleteMaintenanceRecord(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('maintenance_records')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting maintenance record:', error);
        throw new Error('Erreur lors de la suppression de l\'enregistrement de maintenance');
      }
    } catch (err) {
      console.error('Error in deleteMaintenanceRecord:', err);
      throw new Error('Impossible de supprimer l\'enregistrement de maintenance');
    }
  },

  async getMaintenanceStats(): Promise<{
    totalRecords: number;
    preventiveCount: number;
    correctiveCount: number;
    inspectionCount: number;
    upcomingMaintenance: MaintenanceRecord[];
  }> {
    try {
      const { data: records, error } = await supabase
        .from('maintenance_records')
        .select('*')
        .order('maintenance_date', { ascending: false });

      if (error) {
        console.error('Error fetching maintenance stats:', error);
        throw new Error('Erreur lors de la récupération des statistiques de maintenance');
      }

      const now = new Date();
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(now.getDate() + 30);

      return {
        totalRecords: records.length,
        preventiveCount: records.filter(r => r.maintenance_type === 'PREVENTIF').length,
        correctiveCount: records.filter(r => r.maintenance_type === 'CORRECTIF').length,
        inspectionCount: records.filter(r => r.maintenance_type === 'INSPECTION').length,
        upcomingMaintenance: records.filter(
          r => r.next_maintenance_date && new Date(r.next_maintenance_date) <= thirtyDaysFromNow
        ),
      };
    } catch (err) {
      console.error('Error in getMaintenanceStats:', err);
      return {
        totalRecords: 0,
        preventiveCount: 0,
        correctiveCount: 0,
        inspectionCount: 0,
        upcomingMaintenance: [],
      };
    }
  },
}; 