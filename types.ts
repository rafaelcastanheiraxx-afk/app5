
export enum VitalType {
  GLUCOSE = 'GLUCOSE',
  BLOOD_PRESSURE = 'BLOOD_PRESSURE',
  HEART_RATE = 'HEART_RATE',
  SATURATION = 'SATURATION',
  TEMPERATURE = 'TEMPERATURE'
}

export enum SyncStatus {
  SYNCED = 'SYNCED',
  PENDING = 'PENDING',
  OFFLINE = 'OFFLINE'
}

export interface HealthEntry {
  id: string;
  timestamp: number;
  type: VitalType;
  value: string; // e.g., "120/80" or "95"
  unit: string;
  emoji: string;
  symptoms: string[];
  notes?: string;
  syncStatus: SyncStatus;
}

export interface AppConfig {
  aiEnabled: boolean;
  biblicalMessagesEnabled: boolean;
  language: 'pt-BR' | 'pt-PT' | 'EN' | 'ES';
  offlineMode: boolean;
}
