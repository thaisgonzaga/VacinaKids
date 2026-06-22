import { VaccinationStatus } from '../../models';
import { addMonths, diffInDays } from './date.utils';

/**
 * Regra ÚNICA de status de uma dose (PLANO §2 / ADR-005). Função **pura**,
 * com `today` injetável para testes determinísticos. NENHUM componente ou
 * service recalcula status — todos chamam esta função.
 *
 * Regra (com janela de tolerância):
 *  - `hasRecord` → Aplicada.
 *  - senão `due = addMonths(nascimento, ageMonths)`, `diff = diffInDays(today, due)`:
 *    - `diff > 30`  → Atrasada  (mais de 30 dias após o previsto)
 *    - `diff > -60` → Pendente  (de 60 dias antes até 30 dias após)
 *    - senão        → Futura
 *
 * @param dataNascimento ISO `yyyy-mm-dd`.
 * @param ageMonths idade prevista da dose em meses.
 * @param hasRecord se há registro de aplicação.
 * @param today data de referência (default: agora).
 */
export function computeStatus(
  dataNascimento: string,
  ageMonths: number,
  hasRecord: boolean,
  today: Date = new Date(),
): VaccinationStatus {
  if (hasRecord) {
    return VaccinationStatus.Aplicada;
  }
  const due = addMonths(dataNascimento, ageMonths);
  const diff = diffInDays(today, due);
  if (diff > 30) {
    return VaccinationStatus.Atrasada;
  }
  if (diff > -60) {
    return VaccinationStatus.Pendente;
  }
  return VaccinationStatus.Futura;
}
