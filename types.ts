export enum MicroorganismType {
  BACTERIA = 'Bactérias',
  FUNGI = 'Fungos',
  ACTINOMYCETES = 'Actinomicetos',
  YEAST = 'Leveduras',
  OTHER = 'Outro',
}

export enum FlaskVolume {
  V250 = '250 mL',
  V500 = '500 mL',
  V1000 = '1000 mL',
}

export enum ProjectType {
  EMBRAPII = 'EMBRAPII',
  POS_GRAD = 'Pós-graduação',
  INCT = 'INCT',
  BASIC = 'Basic',
  INTERNAL = 'Projeto interno',
}

export enum ReservationStatus {
  SCHEDULED = 'Agendado',
  COMPLETED = 'Concluído',
  CANCELLED = 'Cancelado',
}

export type UserRole = 'admin' | 'user';

export interface Shaker {
  id: string;
  name: string;
  brand: string;
  model: string;
  capacity_flasks: number;
  active: boolean; // New field for availability control
  notes?: string;
}

export interface Reservation {
  id: string;
  shaker_id: string;
  start_date: string; // ISO Date String YYYY-MM-DD
  end_date: string;   // ISO Date String YYYY-MM-DD
  quantity_flasks: number;
  microorganism_type: MicroorganismType;
  flask_volume: FlaskVolume;
  temperature_c: number;
  rpm: number;
  project: ProjectType;
  user_name: string;
  user_email: string;
  notes?: string;
  status: ReservationStatus;
  cancelled_at?: string; // ISO Date String for audit
}