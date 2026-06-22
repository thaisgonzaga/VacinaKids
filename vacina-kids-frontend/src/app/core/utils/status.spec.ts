import { computeStatus } from './status';
import { VaccinationStatus } from '../../models';

/**
 * Spec da regra ÚNICA de status (PLANO §2 / ADR-005), escrita antes da
 * implementação (TDD). `today` é fixo e injetado para determinismo.
 *
 * Truque dos casos: com `ageMonths = 0`, `due = addMonths(nascimento, 0) =
 * nascimento`, então `diff = diffInDays(today, nascimento)`. Assim, deslocando
 * a data de nascimento em relação a `today`, miramos `diff` exato nas bordas.
 */
describe('computeStatus', () => {
  // 2026-06-20 em UTC meia-noite — base de todos os cálculos.
  const today = new Date(Date.UTC(2026, 5, 20));

  it('1) com registro → Aplicada (mesmo com a data prevista no passado)', () => {
    expect(computeStatus('2020-01-01', 0, true, today)).toBe(VaccinationStatus.Aplicada);
  });

  it('2) diff=31 (31 dias após o previsto), sem registro → Atrasada', () => {
    // nascimento = today - 31 dias
    expect(computeStatus('2026-05-20', 0, false, today)).toBe(VaccinationStatus.Atrasada);
  });

  it('3) borda diff=30 (exatamente 30 dias após) → Pendente', () => {
    // nascimento = today - 30 dias
    expect(computeStatus('2026-05-21', 0, false, today)).toBe(VaccinationStatus.Pendente);
  });

  it('4) diff=0 (vencendo hoje) → Pendente', () => {
    expect(computeStatus('2026-06-20', 0, false, today)).toBe(VaccinationStatus.Pendente);
  });

  it('5a) borda diff=-60 (60 dias antes do previsto) → Futura', () => {
    // nascimento = today + 60 dias
    expect(computeStatus('2026-08-19', 0, false, today)).toBe(VaccinationStatus.Futura);
  });

  it('5b) borda diff=-59 (59 dias antes do previsto) → Pendente', () => {
    // nascimento = today + 59 dias
    expect(computeStatus('2026-08-18', 0, false, today)).toBe(VaccinationStatus.Pendente);
  });

  it('6) muito antes do previsto → Futura', () => {
    // nascido hoje, dose de 12 meses → vence em ~1 ano
    expect(computeStatus('2026-06-20', 12, false, today)).toBe(VaccinationStatus.Futura);
  });

  it('integra addMonths com clamp (31/01 + 1 mês → 28/02) sem quebrar a regra', () => {
    // due = 2026-02-28; muito antes de 2026-06-20 → Atrasada
    expect(computeStatus('2026-01-31', 1, false, today)).toBe(VaccinationStatus.Atrasada);
  });
});
