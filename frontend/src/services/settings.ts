import { supabase } from '../lib/supabase';

export interface SystemSettings {
  // Notifications
  emailNotifications: boolean;
  loanReminders: boolean;
  maintenanceAlerts: boolean;
  overdueNotifications: boolean;

  // Email Settings
  reminderFrequency: 'daily' | 'weekly' | 'biweekly';
  emailTemplate: 'default' | 'minimal' | 'detailed';

  // System Settings
  language: 'fr' | 'en';
  dateFormat: 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD';
  timeZone: string;

  // Loan Settings
  maxLoanDuration: number;
  defaultLoanDuration: number;
  allowExtensions: boolean;
  maxExtensions: number;

  // Maintenance Settings
  maintenanceInterval: number;
  autoSchedule: boolean;
}

export const settingsService = {
  async getSettings(): Promise<SystemSettings> {
    const { data: settings, error } = await supabase
      .from('system_settings')
      .select('*')
      .single();

    if (error) {
      console.error('Error fetching settings:', error);
      return this.getDefaultSettings();
    }

    return settings || this.getDefaultSettings();
  },

  async updateSettings(settings: Partial<SystemSettings>): Promise<void> {
    const { error } = await supabase
      .from('system_settings')
      .upsert([
        {
          id: 1, // We use a single row for system settings
          ...settings,
          updated_at: new Date().toISOString(),
        },
      ]);

    if (error) {
      console.error('Error updating settings:', error);
      throw new Error('Failed to update settings');
    }
  },

  getDefaultSettings(): SystemSettings {
    return {
      // Notifications
      emailNotifications: true,
      loanReminders: true,
      maintenanceAlerts: true,
      overdueNotifications: true,

      // Email Settings
      reminderFrequency: 'daily',
      emailTemplate: 'default',

      // System Settings
      language: 'fr',
      dateFormat: 'DD/MM/YYYY',
      timeZone: 'Europe/Paris',

      // Loan Settings
      maxLoanDuration: 30,
      defaultLoanDuration: 7,
      allowExtensions: true,
      maxExtensions: 2,

      // Maintenance Settings
      maintenanceInterval: 90,
      autoSchedule: true,
    };
  },
}; 