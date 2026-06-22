import { VaccinationRecord } from './vaccination-record.model';
import { VaccinationStatus } from './vaccination-status.enum';
import { VaccineCatalogItem } from './vaccine-catalog-item.model';

/**
 * View-model **computado** (não persistido): cruza um item do catálogo com
 * o eventual registro da criança e o status calculado. Produzido pelo
 * `ScheduleService`; consumido pela UI (jornada, dashboard, drawer).
 */
export interface VaccineDose {
  catalog: VaccineCatalogItem;
  status: VaccinationStatus;
  /** presente apenas quando a dose foi aplicada. */
  record?: VaccinationRecord;
  /** data prevista = addMonths(dataNascimento, catalog.ageMonths). */
  dueDate: Date;
}
