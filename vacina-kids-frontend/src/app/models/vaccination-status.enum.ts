/**
 * Status de uma dose, calculado por `computeStatus` (core/utils/status.ts).
 * Valores em string para legibilidade em logs e persistência eventual.
 */
export enum VaccinationStatus {
  Aplicada = 'Aplicada',
  Pendente = 'Pendente',
  Atrasada = 'Atrasada',
  Futura = 'Futura',
}
