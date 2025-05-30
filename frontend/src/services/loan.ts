import { supabase } from '../lib/supabase';
import type { LoanRequest, LoanStatus, Equipment, LoanStatusHistory } from '../types/equipment';
import { equipmentService } from './equipment';
import { emailService } from './email';
import { sendLoanRequestNotification } from './emailService';

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
  async createLoanRequest(data: Omit<LoanRequest, 'id' | 'created_at' | 'updated_at' | 'status' | 'actual_return_date'> & { terms_accepted?: boolean }): Promise<LoanRequest> {
    try {
      const insertData: any = {
        equipment_id: data.equipment_id,
        loan_manager_email: data.loan_manager_email,
        student_email: data.student_email,
        borrowing_date: data.borrowing_date,
        expected_return_date: data.expected_return_date,
        project_description: data.project_description,
        status: 'PENDING'
      };

      const { data: newLoan, error } = await supabase
        .from('loan_requests')
        .insert(insertData)
        .select('*, equipment:equipment_id(*)')
        .single();

      if (error) {
        throw error;
      }

      // Send email notification to the loan manager
      if (newLoan) {
        try {
          await sendLoanRequestNotification(
            newLoan.loan_manager_email,
            {
              equipmentName: newLoan.equipment?.name || 'Unknown Equipment',
              borrowingDate: new Date(newLoan.borrowing_date).toLocaleDateString('fr-FR'),
              returnDate: new Date(newLoan.expected_return_date).toLocaleDateString('fr-FR'),
              projectDescription: newLoan.project_description,
              studentEmail: newLoan.student_email
            }
          );
        } catch (emailError) {
          console.error('Failed to send email notification:', emailError);
          // Don't throw the error here - we still want to return the created loan
        }
      }

      return newLoan;
    } catch (err) {
      console.error('Error in createLoanRequest:', err);
      throw err;
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
          equipment (
            id,
            name,
            reference
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching loan request:', error);
      throw error;
    }
  },

  async getUserLoans() {
    try {
      const { data: currentUser } = await supabase.auth.getUser();
      
      if (!currentUser || !currentUser.user) {
        throw new Error('Utilisateur non authentifié');
      }

      // Utiliser student_email pour la récupération des emprunts de l'étudiant
      const { data: loansData, error } = await supabase
        .from('loan_requests')
        .select(`
          *,
          equipment (
            id,
            name,
            reference,
            description
          )
        `)
        // Utiliser student_email, car la colonne existe maintenant
        .eq('student_email', currentUser.user.email)
        .in('status', ['EN_ATTENTE', 'APPROUVE', 'EMPRUNTE'])
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error with student_email query:', error);
        
        // Fallback à loan_manager_email pour les anciens enregistrements
        const { data: oldLoansData, error: oldError } = await supabase
          .from('loan_requests')
          .select(`
            *,
            equipment (
              id,
              name,
              reference,
              description
            )
          `)
          .eq('loan_manager_email', currentUser.user.email)
          .in('status', ['EN_ATTENTE', 'APPROUVE', 'EMPRUNTE'])
          .order('created_at', { ascending: false });
          
        if (oldError) throw oldError;
        return oldLoansData || [];
      }
      
      return loansData || [];
    } catch (error) {
      console.error('Error fetching user loans:', error);
      return [];
    }
  },

  async getUserLoanHistory() {
    try {
      const { data: currentUser } = await supabase.auth.getUser();
      
      if (!currentUser || !currentUser.user) {
        throw new Error('Utilisateur non authentifié');
      }
      
      console.log('Utilisateur connecté:', currentUser.user.email);

      // Utiliser student_email pour la récupération de l'historique
      const { data, error } = await supabase
        .from('loan_requests')
        .select(`
          *,
          equipment (
            id,
            name,
            reference
          )
        `)
        // Utiliser student_email, car la colonne existe maintenant
        .eq('student_email', currentUser.user.email)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Error with student_email query:', error);
        
        // Fallback à loan_manager_email pour les anciens enregistrements
        const { data: oldData, error: oldError } = await supabase
          .from('loan_requests')
          .select(`
            *,
            equipment (
              id,
              name,
              reference
            )
          `)
          .eq('loan_manager_email', currentUser.user.email)
          .order('created_at', { ascending: false })
          .limit(10);
          
        if (oldError) throw oldError;
        console.log('Données d\'historique récupérées (fallback):', oldData);
        return oldData || [];
      }
      
      console.log('Données d\'historique récupérées:', data);
      return data || [];
    } catch (error) {
      console.error('Error fetching user loan history:', error);
      return [];
    }
  },

  /**
   * Récupère les emprunts des étudiants d'un département spécifique
   * @param departmentId ID du département
   * @param filter Filtre optionnel: 'active', 'pending', 'overdue'
   * @returns Liste des emprunts
   */
  async getDepartmentLoans(departmentId: string, filter: 'active' | 'pending' | 'overdue' = 'active') {
    try {
      // Construire la requête de base
      let query;
      
      if (!departmentId) {
        console.warn('Département ID non fourni pour les emprunts');
        // Si pas de département spécifique, récupérer tous les prêts
        query = supabase
          .from('loan_requests')
          .select(`
            *,
            equipment (*),
            users!loan_requests_loan_manager_email_fkey (
              id,
              full_name,
              email,
              department_id
            )
          `);
          
        // Log pour débogage
        console.log('Fetching all loans (no department filter)');
      } else {
        // Requête pour un département spécifique
        query = supabase
          .from('loan_requests')
          .select(`
            *,
            equipment!loan_requests_equipment_id_fkey (
              id,
              name,
              reference,
              department_id
            ),
            users!loan_requests_loan_manager_email_fkey (
              id,
              full_name,
              email,
              department_id
            )
          `)
          .eq('equipment.department_id', departmentId);
          
        // Log pour débogage
        console.log(`Fetching loans for department ${departmentId}`);
      }

      // Ajouter le filtre approprié
      if (filter === 'active') {
        query = query.in('status', ['APPROUVE', 'EMPRUNTE']);
      } else if (filter === 'pending') {
        query = query.eq('status', 'EN_ATTENTE');
      } else if (filter === 'overdue') {
        // Pour les emprunts en retard, on filtre sur les emprunts actifs
        // dont la date de retour prévue est passée
        const today = new Date().toISOString();
        query = query
          .eq('status', 'EMPRUNTE')
          .lt('expected_return_date', today);
      }

      // Exécuter la requête
      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching department loans:', error);
        throw new Error('Erreur lors de la récupération des emprunts du département');
      }

      // Log pour débogage
      console.log(`Found ${data?.length || 0} loans for filter: ${filter}`);

      // Formater les données pour l'affichage
      return data.map((loan: any) => ({
        ...loan,
        student_name: loan.student_email || loan.users?.full_name || loan.loan_manager_email,
      })) || [];
    } catch (err) {
      console.error('Error in getDepartmentLoans:', err);
      return [];
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