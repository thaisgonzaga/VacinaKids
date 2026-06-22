import { VaccinationStatus } from './vaccination-status.enum';
import { VaccineDose } from './vaccine-dose.model';

/**
 * Faixa etária da jornada vacinal (uma seção do accordion).
 * Computada pelo `ScheduleService` agrupando as doses por `catalog.band`.
 */
export interface JourneyBand {
  band: string;
  /** idade da faixa em meses — chave de ordenação. */
  ageMonths: number;
  doses: VaccineDose[];
  aplicadas: number;
  total: number;
  /** status que representa a faixa no header (Atrasada > Pendente > Aplicada > Futura). */
  statusAgregado: VaccinationStatus;
}
