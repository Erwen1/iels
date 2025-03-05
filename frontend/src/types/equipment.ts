export type EquipmentStatus = 'DISPONIBLE' | 'EMPRUNTE' | 'MAINTENANCE' | 'HORS_SERVICE';

export interface Equipment {
  id: string;
  reference: string;
  name: string;
  description: string;
  department: string;
  quantity: number;
  location_id: string;
  equipment_manager_email: string;
  status: EquipmentStatus;
  loan_requests?: LoanRequest[];
  maintenance_records?: MaintenanceRecord[];
  created_at: string;
  updated_at: string;
}

export interface EquipmentCategory {
  id: string;
  name: string;
  description: string | null;
  parent_category_id: string | null;
}

export interface Location {
  id: string;
  building: string;
  room: string;
  created_at: string;
  updated_at: string;
}

export type LoanStatus = 'EN_ATTENTE' | 'APPROUVE' | 'EMPRUNTE' | 'RETOURNE' | 'REFUSE';

export interface LoanStatusHistory {
  id: string;
  loan_request_id: string;
  previous_status: LoanStatus | null;
  new_status: LoanStatus;
  comment: string | null;
  changed_by: string;
  created_at: string;
}

export interface LoanRequest {
  id: string;
  equipment_id: string;
  equipment?: Equipment;
  project_description: string;
  loan_manager_email: string;
  borrowing_date: string;
  expected_return_date: string;
  actual_return_date?: string;
  status: LoanStatus;
  admin_comment?: string;
  status_history?: LoanStatusHistory[];
  created_at: string;
  updated_at: string;
}

export interface MaintenanceRecord {
  id: string;
  equipment_id: string;
  maintenance_type: MaintenanceType;
  maintenance_date: string;
  description: string;
  performed_by: string;
  next_maintenance_date?: string;
  created_at: string;
  updated_at: string;
}

export type MaintenanceType = 'PREVENTIF' | 'CORRECTIF' | 'INSPECTION'; 