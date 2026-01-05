
import { StoreData, Product, Catalogue, ArchiveData, KioskRegistry, Manual, AdminUser, Brand } from "../types";
import { supabase, getEnv, initSupabase } from "./kioskService";

const STORAGE_KEY_DATA = 'kiosk_pro_store_data';

// (DEFAULT_ADMIN and MOCK_BRANDS removed for brevity, keep existing ones)

export const generateStoreData = async (): Promise<StoreData> => {
  if (!supabase) initSupabase();
  if (supabase) {
      try {
          const [configResponse, fleetResponse] = await Promise.all([
              supabase.from('store_config').select('data').eq('id', 1).single(),
              supabase.from('kiosks').select('*')
          ]);
          if (configResponse.data) {
              let processedData = configResponse.data.data || {};
              // Ensure fleet is merged from kiosks table
              if (fleetResponse.data) {
                  processedData.fleet = fleetResponse.data.map((k: any) => ({
                      id: k.id, name: k.name, deviceType: k.device_type, status: k.status, last_seen: k.last_seen, wifiStrength: k.wifi_strength, ipAddress: k.ip_address, version: k.version, locationDescription: k.location_description, assignedZone: k.assigned_zone, restartRequested: k.restart_requested
                  }));
              }
              localStorage.setItem(STORAGE_KEY_DATA, JSON.stringify(processedData));
              return processedData;
          }
      } catch (e) { console.warn("Cloud fetch unavailable.", e); }
  }
  const stored = localStorage.getItem(STORAGE_KEY_DATA);
  return stored ? JSON.parse(stored) : ({} as StoreData); 
};

export const saveStoreData = async (data: StoreData): Promise<void> => {
    try {
        localStorage.setItem(STORAGE_KEY_DATA, JSON.stringify(data));
    } catch (e) { console.warn("Local storage full."); }

    if (!supabase) initSupabase();
    if (supabase) {
        const { fleet, ...dataToSave } = data;
        // Explicit match on id 1 to ensure standard upsert behavior across all drivers
        const { error } = await supabase
            .from('store_config')
            .upsert(
                { id: 1, data: dataToSave, updated_at: new Date().toISOString() }, 
                { onConflict: 'id', ignoreDuplicates: false }
            );
            
        if (error) {
            console.error("SUPABASE SAVE ERROR:", error.message, error.details);
            // Re-throw or handle UI notification if App.tsx supports it
        } else {
            console.log("Cloud sync successful at " + new Date().toLocaleTimeString());
        }
    }
};

export const resetStoreData = async (): Promise<StoreData> => {
    const fresh = {} as StoreData; // Replace with your actual DEFAULT_DATA
    await saveStoreData(fresh);
    return fresh;
};
