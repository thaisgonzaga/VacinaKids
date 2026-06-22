import { VaccinationStatus } from '../../models';

/** Apresentação de um status: rótulo, ícone e tons exatos do design. */
export interface StatusVisual {
  /** rótulo exibível. */
  label: string;
  /** nome do ionicon. */
  icon: string;
  /** cor de fundo do badge/pill. */
  bg: string;
  /** cor do texto/ícone. */
  fg: string;
  /** cor Ionic associada (para `color="..."` em componentes ion). */
  ionColor: string;
}

/**
 * Mapa status → apresentação (PLANO §2). Mantém a **apresentação separada da
 * regra**: `computeStatus` decide o status; aqui só pintamos. Tons exatos do
 * design.
 */
export const STATUS_VISUAL: Record<VaccinationStatus, StatusVisual> = {
  [VaccinationStatus.Aplicada]: {
    label: 'Aplicada',
    icon: 'checkmark',
    bg: '#E9F0D6',
    fg: '#5E7A2E',
    ionColor: 'primary',
  },
  [VaccinationStatus.Pendente]: {
    label: 'Pendente',
    icon: 'time-outline',
    bg: '#FFF1D2',
    fg: '#B07D1F',
    ionColor: 'warning',
  },
  [VaccinationStatus.Atrasada]: {
    label: 'Atrasada',
    icon: 'warning-outline',
    bg: '#FFE2CF',
    fg: '#C2622F',
    ionColor: 'orange',
  },
  [VaccinationStatus.Futura]: {
    label: 'Futura',
    icon: 'calendar-outline',
    bg: '#EDF2E2',
    fg: '#7E9A4E',
    ionColor: 'medium',
  },
};

/** Acesso direto à apresentação de um status. */
export function statusVisual(status: VaccinationStatus): StatusVisual {
  return STATUS_VISUAL[status];
}
