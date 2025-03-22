import { supabase } from '../lib/supabase';
import type { Building, Floor, Room, StorageUnit, Shelf, Box, Equipment, Document } from '../types/storage';

export const storageService = {
  // Buildings
  async getBuildings(): Promise<Building[]> {
    try {
      // Get all buildings
      const { data: buildings, error: buildingsError } = await supabase
        .from('buildings')
        .select('*')
        .order('name');
      
      if (buildingsError) throw buildingsError;
      if (!buildings || buildings.length === 0) return [];
      
      // Get all floors
      const { data: floors, error: floorsError } = await supabase
        .from('floors')
        .select('*')
        .order('level');
      
      if (floorsError) throw floorsError;
      
      // Get all rooms
      const { data: rooms, error: roomsError } = await supabase
        .from('rooms')
        .select('*')
        .order('name');
      
      if (roomsError) throw roomsError;
      
      // Get all storage units
      const { data: storageUnits, error: storageUnitsError } = await supabase
        .from('storage_units')
        .select('*')
        .order('name');
      
      if (storageUnitsError) throw storageUnitsError;
      
      // Get all shelves
      const { data: shelves, error: shelvesError } = await supabase
        .from('shelves')
        .select('*')
        .order('level');
      
      if (shelvesError) throw shelvesError;
      
      // Get all boxes
      const { data: boxes, error: boxesError } = await supabase
        .from('boxes')
        .select('*')
        .order('name');
      
      if (boxesError) throw boxesError;
      
      // Manually build the nested structure
      const buildingsWithRelations = buildings.map(building => {
        const buildingFloors = floors?.filter(floor => floor.building_id === building.id) || [];
        
        const floorsWithRooms = buildingFloors.map(floor => {
          const floorRooms = rooms?.filter(room => room.floor_id === floor.id) || [];
          
          const roomsWithUnits = floorRooms.map(room => {
            const roomUnits = storageUnits?.filter(unit => unit.room_id === room.id) || [];
            
            const unitsWithShelves = roomUnits.map(unit => {
              const unitShelves = shelves?.filter(shelf => shelf.storage_unit_id === unit.id) || [];
              
              const shelvesWithBoxes = unitShelves.map(shelf => {
                const shelfBoxes = boxes?.filter(box => box.shelf_id === shelf.id) || [];
                
                return {
                  ...shelf,
                  boxes: shelfBoxes
                };
              });
              
              return {
                ...unit,
                shelves: shelvesWithBoxes
              };
            });
            
            return {
              ...room,
              storage_units: unitsWithShelves
            };
          });
          
          return {
            ...floor,
            rooms: roomsWithUnits
          };
        });
        
        return {
          ...building,
          floors: floorsWithRooms
        };
      });
      
      return buildingsWithRelations;
    } catch (error) {
      console.error('Error fetching buildings:', error);
      return [];
    }
  },

  async createBuilding(name: string): Promise<Building> {
    const { data, error } = await supabase
      .from('buildings')
      .insert([{ name }])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Floors
  async createFloor(buildingId: string, level: number): Promise<Floor> {
    const { data, error } = await supabase
      .from('floors')
      .insert([{ building_id: buildingId, level }])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Rooms
  async createRoom(floorId: string, name: string): Promise<Room> {
    const { data, error } = await supabase
      .from('rooms')
      .insert([{ floor_id: floorId, name }])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Storage Units
  async createStorageUnit(roomId: string, name: string): Promise<StorageUnit> {
    const { data, error } = await supabase
      .from('storage_units')
      .insert([{ room_id: roomId, name }])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Shelves
  async createShelf(storageUnitId: string, level: number): Promise<Shelf> {
    const { data, error } = await supabase
      .from('shelves')
      .insert([{ storage_unit_id: storageUnitId, level }])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Boxes
  async createBox(shelfId: string, name: string, barcode: string): Promise<Box> {
    const { data, error } = await supabase
      .from('boxes')
      .insert([{ 
        shelf_id: shelfId, 
        name, 
        barcode,
        status: 'available'
      }])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async getBoxByBarcode(barcode: string): Promise<Box | null> {
    const { data, error } = await supabase
      .from('boxes')
      .select(`
        *,
        shelf:shelves(
          *,
          storage_unit:storage_units(
            *,
            room:rooms(
              *,
              floor:floors(
                *,
                building:buildings(*)
              )
            )
          )
        ),
        equipment:equipment_boxes(
          equipment:equipment(*)
        ),
        documents:box_documents(*)
      `)
      .eq('barcode', barcode)
      .single();
    
    if (error) throw error;
    return data;
  },

  // Equipment
  async addEquipmentToBox(boxId: string, equipmentId: string): Promise<void> {
    const { error } = await supabase
      .from('equipment_boxes')
      .insert([{ box_id: boxId, equipment_id: equipmentId }]);
    
    if (error) throw error;
  },

  async removeEquipmentFromBox(boxId: string, equipmentId: string): Promise<void> {
    const { error } = await supabase
      .from('equipment_boxes')
      .delete()
      .match({ box_id: boxId, equipment_id: equipmentId });
    
    if (error) throw error;
  },

  // Documents
  async addDocumentToBox(boxId: string, document: { name: string; type: string; url: string }): Promise<void> {
    const { error } = await supabase
      .from('box_documents')
      .insert([{ box_id: boxId, ...document }]);
    
    if (error) throw error;
  },

  async removeDocumentFromBox(boxId: string, documentId: string): Promise<void> {
    const { error } = await supabase
      .from('box_documents')
      .delete()
      .match({ box_id: boxId, id: documentId });
    
    if (error) throw error;
  },

  // Equipment in Box methods
  async getEquipmentByBoxId(boxId: string): Promise<Equipment[]> {
    const { data, error } = await supabase
      .from('equipment')
      .select('*')
      .eq('box_id', boxId);
    
    if (error) throw error;
    return data || [];
  },

  async getAvailableEquipment(): Promise<Equipment[]> {
    const { data, error } = await supabase
      .from('equipment')
      .select('*')
      .is('box_id', null);
    
    if (error) throw error;
    return data || [];
  },

  async assignEquipmentToBox(equipmentId: string, boxId: string): Promise<void> {
    const { error } = await supabase
      .from('equipment')
      .update({ box_id: boxId })
      .eq('id', equipmentId);
    
    if (error) throw error;
  },

  // Use the existing removeEquipmentFromBox method instead of adding a duplicate
  // This method uses the equipment_boxes junction table rather than the direct box_id field
}; 