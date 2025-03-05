import { supabase } from '../lib/supabase';
import type { LoanRequest, LoanStatus, Equipment, LoanStatusHistory } from '../types/equipment';

interface LoanWithEquipment extends Omit<LoanRequest, 'equipment'> {
  equipment: Pick<Equipment, 'name' | 'id'>;
}

interface LoanStats {
  active: number;
  pending: number;
  overdue: number;
  trends: {
    active: number;
    overdue: number;
  };
  statusTrend: Array<{
    date: string;
    active: number;
    pending: number;
    overdue: number;
  }>;
  durationStats: Array<{
    range: string;
    count: number;
  }>;
}

interface DurationStat {
  range: string;
  count: number;
}

export const loanService = {
  async createLoanRequest(data: Omit<LoanRequest, 'id' | 'created_at' | 'updated_at' | 'status' | 'actual_return_date'>): Promise<LoanRequest> {
    try {
      const { data: loanRequest, error } = await supabase
        .from('loan_requests')
        .insert([
          {
            ...data,
            status: 'EN_ATTENTE',
          },
        ])
        .select()
        .single();

      if (error) {
        console.error('Error creating loan request:', error);
        throw new Error('Erreur lors de la création de la demande d\'emprunt');
      }

      // Create initial status history entry
      await this.createStatusHistoryEntry({
        loan_request_id: loanRequest.id,
        previous_status: null,
        new_status: 'EN_ATTENTE',
        comment: 'Création de la demande',
        changed_by: data.loan_manager_email,
      });

      return loanRequest;
    } catch (err) {
      console.error('Error in createLoanRequest:', err);
      throw new Error('Impossible de créer la demande d\'emprunt');
    }
  },

  async getAllLoanRequests(): Promise<LoanRequest[]> {
    try {
      const { data: loanRequests, error } = await supabase
        .from('loan_requests')
        .select(`
          *,
          equipment:equipment_id (
            id,
            name
          ),
          status_history:loan_status_history (*)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching loan requests:', error);
        throw new Error('Erreur lors de la récupération des demandes d\'emprunt');
      }

      return loanRequests;
    } catch (err) {
      console.error('Error in getAllLoanRequests:', err);
      return [];
    }
  },

  async getLoanRequestsByEquipment(equipmentId: string): Promise<LoanRequest[]> {
    try {
      const { data: loanRequests, error } = await supabase
        .from('loan_requests')
        .select(`
          *,
          status_history:loan_status_history(*)
        `)
        .eq('equipment_id', equipmentId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching loan requests by equipment:', error);
        throw new Error('Erreur lors de la récupération des demandes d\'emprunt');
      }

      return loanRequests;
    } catch (err) {
      console.error('Error in getLoanRequestsByEquipment:', err);
      return [];
    }
  },

  async updateLoanStatus(
    loanId: string,
    status: LoanStatus,
    adminComment?: string,
    changedBy: string = 'admin'
  ): Promise<void> {
    try {
      // Get current loan status
      const { data: currentLoan, error: fetchError } = await supabase
        .from('loan_requests')
        .select('status')
        .eq('id', loanId)
        .single();

      if (fetchError) {
        throw new Error('Erreur lors de la récupération du statut actuel');
      }

      const updateData: any = {
        status,
        ...(adminComment && { admin_comment: adminComment }),
        ...(status === 'RETOURNE' ? { actual_return_date: new Date().toISOString() } : {}),
      };

      const { error } = await supabase
        .from('loan_requests')
        .update(updateData)
        .eq('id', loanId);

      if (error) {
        console.error('Error updating loan status:', error);
        throw new Error('Erreur lors de la mise à jour du statut');
      }

      // Create status history entry
      await this.createStatusHistoryEntry({
        loan_request_id: loanId,
        previous_status: currentLoan.status,
        new_status: status,
        comment: adminComment || getStatusChangeComment(currentLoan.status, status),
        changed_by: changedBy,
      });

    } catch (err) {
      console.error('Error in updateLoanStatus:', err);
      throw new Error('Impossible de mettre à jour le statut');
    }
  },

  async createStatusHistoryEntry(data: Omit<LoanStatusHistory, 'id' | 'created_at'>): Promise<void> {
    try {
      const { error } = await supabase
        .from('loan_status_history')
        .insert([data]);

      if (error) {
        console.error('Error creating status history entry:', error);
        throw new Error('Erreur lors de l\'enregistrement de l\'historique');
      }
    } catch (err) {
      console.error('Error in createStatusHistoryEntry:', err);
      // Don't throw here to prevent blocking the main operation
    }
  },

  async getLoanStats(timeRange: '7d' | '30d' | '90d' = '30d'): Promise<LoanStats> {
    try {
      console.log('Fetching loan stats for timeRange:', timeRange);
      const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;

      // Get current counts
      const { data: currentCounts, error: countsError } = await supabase
        .from('loan_requests')
        .select('status')
        .in('status', ['EMPRUNTE', 'EN_ATTENTE', 'EN_RETARD']);

      if (countsError) {
        console.error('Error fetching loan counts:', countsError);
        throw new Error(`Failed to fetch loan counts: ${countsError.message}`);
      }

      const stats = {
        active: currentCounts?.filter(r => r.status === 'EMPRUNTE').length || 0,
        pending: currentCounts?.filter(r => r.status === 'EN_ATTENTE').length || 0,
        overdue: currentCounts?.filter(r => r.status === 'EN_RETARD').length || 0
      };

      console.log('Current loan counts:', stats);

      // Get trends
      const { data: trendData, error: trendError } = await supabase
        .rpc('calculate_loan_trends', { days });

      if (trendError) {
        console.error('Error fetching loan trends:', trendError);
        throw new Error(`Failed to fetch loan trends: ${trendError.message}`);
      }

      const trends = {
        active: trendData?.[0]?.active_trend || 0,
        overdue: trendData?.[0]?.overdue_trend || 0
      };

      console.log('Loan trends:', trends);

      // Get status trend over time
      const { data: statusTrend, error: statusTrendError } = await supabase
        .rpc('get_loan_status_trend', { days });

      if (statusTrendError) {
        console.error('Error fetching status trend:', statusTrendError);
        throw new Error(`Failed to fetch status trend: ${statusTrendError.message}`);
      }

      console.log('Status trend data:', statusTrend);

      // Get duration statistics
      const { data: durationStats, error: durationError } = await supabase
        .rpc('get_loan_duration_stats');

      if (durationError) {
        console.error('Error fetching duration stats:', durationError);
        throw new Error(`Failed to fetch duration stats: ${durationError.message}`);
      }

      console.log('Duration stats:', durationStats);

      const result: LoanStats = {
        ...stats,
        trends,
        statusTrend: statusTrend || [],
        durationStats: durationStats || []
      };

      console.log('Final loan stats:', result);
      return result;
    } catch (error) {
      console.error('Error in getLoanStats:', error);
      throw error;
    }
  },

  async getLoanDurationStats() {
    const { data, error } = await supabase.rpc('get_loan_duration_stats');

    if (error) throw error;
    return data.map(({ range, count }) => ({
      range,
      count,
    }));
  },

  async getLoanRequestById(id: string) {
    try {
      const { data, error } = await supabase
        .from('loan_requests')
        .select(`
          *,
          equipment:equipment_id(*),
          status_history:loan_status_history(*)
        `)
        .eq('id', id)
        .single();

      if (error) {
        throw new Error(`Error fetching loan request: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Error in getLoanRequestById:', error);
      throw error;
    }
  },
};

function getActivityDescription(status: LoanStatus): string {
  switch (status) {
    case 'EN_ATTENTE':
      return 'Nouvelle demande d\'emprunt';
    case 'APPROUVE':
      return 'Demande approuvée';
    case 'EMPRUNTE':
      return 'Matériel emprunté';
    case 'RETOURNE':
      return 'Matériel retourné';
    case 'REFUSE':
      return 'Demande refusée';
    default:
      return 'Mise à jour du statut';
  }
}

function getStatusChangeComment(previousStatus: LoanStatus, newStatus: LoanStatus): string {
  switch (newStatus) {
    case 'APPROUVE':
      return 'Demande approuvée par l\'administrateur';
    case 'REFUSE':
      return 'Demande refusée par l\'administrateur';
    case 'EMPRUNTE':
      return 'Matériel marqué comme emprunté';
    case 'RETOURNE':
      return 'Matériel retourné';
    default:
      return `Statut changé de ${getActivityDescription(previousStatus)} à ${getActivityDescription(newStatus)}`;
  }
} 