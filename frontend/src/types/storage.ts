export interface Building {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
  floors?: Floor[];
}

export interface Floor {
  id: string;
  building_id: string;
  level: number;
  created_at: string;
  updated_at: string;
  rooms?: Room[];
}

export interface Room {
  id: string;
  floor_id: string;
  name: string;
  created_at: string;
  updated_at: string;
  storage_units?: StorageUnit[];
}

export interface StorageUnit {
  id: string;
  room_id: string;
  name: string;
  created_at: string;
  updated_at: string;
  shelves?: Shelf[];
}

export interface Shelf {
  id: string;
  storage_unit_id: string;
  level: number;
  created_at: string;
  updated_at: string;
  boxes?: Box[];
}

export interface Box {
  id: string;
  shelf_id: string;
  name: string;
  barcode: string;
  status: 'available' | 'in_use' | 'maintenance';
  created_at: string;
  updated_at: string;
  equipment?: Equipment[];
  documents?: Document[];
}

export interface Equipment {
  id: string;
  reference: string;
  name: string;
  description?: string;
  department: string;
  building: string;
  floor: string;
  room: string;
  referent: string[];
  quantity?: number;
  location_id?: string;
  equipment_manager_email?: string;
  location?: string;
  type: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface Document {
  id: string;
  box_id: string;
  name: string;
  type: string;
  url: string;
  created_at: string;
  updated_at: string;
} 