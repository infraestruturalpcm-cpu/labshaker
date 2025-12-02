import { Shaker, Reservation, ReservationStatus } from '../types';

const SHAKERS_KEY = 'labshaker_shakers';
const RESERVATIONS_KEY = 'labshaker_reservations';

// Initial Seed Data
const INITIAL_SHAKERS: Shaker[] = [
  { id: '1', name: 'Shaker Principal 01', brand: 'New Brunswick', model: 'Innova 44', capacity_flasks: 20, active: true, notes: 'Uso geral' },
  { id: '2', name: 'Shaker Incubadora 02', brand: 'Thermo', model: 'MaxQ 6000', capacity_flasks: 12, active: true, notes: 'Preferência para fungos' },
  { id: '3', name: 'Shaker Bancada 03', brand: 'Tecnal', model: 'TE-420', capacity_flasks: 8, active: true, notes: 'Manutenção agendada para Dezembro' },
  { id: '4', name: 'Shaker Antigo 04', brand: 'Tecnal', model: 'TE-420', capacity_flasks: 8, active: false, notes: 'Em manutenção' },
];

export const getShakers = (): Shaker[] => {
  const stored = localStorage.getItem(SHAKERS_KEY);
  if (!stored) {
    localStorage.setItem(SHAKERS_KEY, JSON.stringify(INITIAL_SHAKERS));
    return INITIAL_SHAKERS;
  }
  return JSON.parse(stored);
};

export const saveShaker = (shaker: Shaker): void => {
  const shakers = getShakers();
  const index = shakers.findIndex((s) => s.id === shaker.id);
  if (index >= 0) {
    shakers[index] = shaker;
  } else {
    shakers.push(shaker);
  }
  localStorage.setItem(SHAKERS_KEY, JSON.stringify(shakers));
};

export const deleteShaker = (id: string): boolean => {
  const reservations = getReservations();
  const hasActiveReservations = reservations.some(
    (r) => r.shaker_id === id && r.status === ReservationStatus.SCHEDULED
  );

  if (hasActiveReservations) {
    return false;
  }

  const shakers = getShakers().filter((s) => s.id !== id);
  localStorage.setItem(SHAKERS_KEY, JSON.stringify(shakers));
  return true;
};

export const getReservations = (): Reservation[] => {
  const stored = localStorage.getItem(RESERVATIONS_KEY);
  return stored ? JSON.parse(stored) : [];
};

export const saveReservation = (reservation: Reservation): void => {
  const reservations = getReservations();
  const index = reservations.findIndex((r) => r.id === reservation.id);
  if (index >= 0) {
    reservations[index] = reservation;
  } else {
    reservations.push(reservation);
  }
  localStorage.setItem(RESERVATIONS_KEY, JSON.stringify(reservations));
};

export const cancelReservation = (id: string): void => {
  const reservations = getReservations();
  const index = reservations.findIndex((r) => r.id === id);
  if (index >= 0) {
    reservations[index].status = ReservationStatus.CANCELLED;
    reservations[index].cancelled_at = new Date().toISOString();
    localStorage.setItem(RESERVATIONS_KEY, JSON.stringify(reservations));
  }
}

export const checkAvailability = (
  shakerId: string,
  startDate: string,
  endDate: string,
  quantity: number, // Quantity is still passed but logic is now exclusive per shaker
  excludeReservationId?: string
): { available: boolean; message?: string } => {
  const shakers = getShakers();
  const targetShaker = shakers.find((s) => s.id === shakerId);

  if (!targetShaker) {
    return { available: false, message: 'Shaker não encontrado.' };
  }

  // Check if shaker is active
  if (!targetShaker.active) {
    return { available: false, message: 'Shaker indisponível para uso (equipamento em manutenção ou fora de operação).' };
  }
  
  // NOTE: Logic Changed. 
  // We no longer sum flasks. We check for ANY overlap.
  // A shaker is exclusive for one reservation ID per period.

  const reservations = getReservations().filter(
    (r) =>
      r.shaker_id === shakerId &&
      r.status === ReservationStatus.SCHEDULED &&
      r.id !== excludeReservationId
  );

  const newStart = new Date(startDate);
  const newEnd = new Date(endDate);

  // Check for overlap
  // Overlap formula: (StartA <= EndB) and (EndA >= StartB)
  const conflictingReservation = reservations.find((r) => {
    const existingStart = new Date(r.start_date);
    const existingEnd = new Date(r.end_date);

    return (newStart <= existingEnd) && (newEnd >= existingStart);
  });

  if (conflictingReservation) {
    return {
      available: false,
      message: `Conflito de agendamento: já existe uma reserva para este shaker no período selecionado (${conflictingReservation.start_date} a ${conflictingReservation.end_date}).`,
    };
  }

  // Optional: Keep capacity check just to ensure user doesn't request more than physical limit,
  // even though they have exclusive access.
  if (quantity > targetShaker.capacity_flasks) {
    return { available: false, message: `A quantidade solicitada excede a capacidade física total do shaker (${targetShaker.capacity_flasks}).` };
  }

  return { available: true };
};