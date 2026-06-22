/**
 * Helpers de data do domínio. Regra de ouro (PLANO §"Riscos"):
 * TODA data nasce/normaliza em **UTC meia-noite**, por um único parser, para
 * evitar ±1 dia nas bordas de tolerância (30/-60) quando o `ion-datetime`
 * devolve ISO com offset.
 */

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/**
 * Converte um ISO (`yyyy-mm-dd` ou com hora/offset) numa `Date` em UTC
 * meia-noite, usando apenas a parte de calendário (`yyyy-mm-dd`). Assim a
 * mesma data civil sempre vira o mesmo instante, independente do fuso.
 */
export function parseISODate(value: string): Date {
  const datePart = value.slice(0, 10);
  const [year, month, day] = datePart.split('-').map((n) => Number(n));
  return new Date(Date.UTC(year, month - 1, day));
}

/**
 * Soma `months` meses a uma data (ISO string ou `Date`), retornando `Date` em
 * UTC meia-noite. Faz **clamp de overflow**: 31/01 + 1 mês → 28/02 (ou 29),
 * nunca "transborda" para o mês seguinte. Aceita `months` negativo.
 */
export function addMonths(value: string | Date, months: number): Date {
  const base = value instanceof Date ? value : parseISODate(value);
  const year = base.getUTCFullYear();
  const monthIndex = base.getUTCMonth() + months;
  const targetYear = year + Math.floor(monthIndex / 12);
  const targetMonth = ((monthIndex % 12) + 12) % 12;
  // dia 0 do mês seguinte = último dia do mês alvo.
  const lastDay = new Date(Date.UTC(targetYear, targetMonth + 1, 0)).getUTCDate();
  const day = Math.min(base.getUTCDate(), lastDay);
  return new Date(Date.UTC(targetYear, targetMonth, day));
}

/**
 * Diferença `a - b` em dias inteiros, comparando apenas a parte de calendário
 * (UTC). Positivo se `a` é depois de `b`. Usado por `computeStatus`:
 * `diffInDays(today, due)`.
 */
export function diffInDays(a: Date, b: Date): number {
  const utcA = Date.UTC(a.getUTCFullYear(), a.getUTCMonth(), a.getUTCDate());
  const utcB = Date.UTC(b.getUTCFullYear(), b.getUTCMonth(), b.getUTCDate());
  return Math.round((utcA - utcB) / MS_PER_DAY);
}

/**
 * Rótulo de idade legível a partir da data de nascimento.
 * Ex.: "recém-nascido", "3 meses", "1 ano", "1 ano e 2 meses".
 */
export function ageLabel(dataNascimento: string, today: Date = new Date()): string {
  const birth = parseISODate(dataNascimento);
  let months =
    (today.getUTCFullYear() - birth.getUTCFullYear()) * 12 +
    (today.getUTCMonth() - birth.getUTCMonth());
  if (today.getUTCDate() < birth.getUTCDate()) {
    months -= 1;
  }
  if (months <= 0) {
    return 'recém-nascido';
  }
  if (months < 12) {
    return `${months} ${months === 1 ? 'mês' : 'meses'}`;
  }
  const years = Math.floor(months / 12);
  const restMonths = months % 12;
  const yearsLabel = `${years} ${years === 1 ? 'ano' : 'anos'}`;
  if (restMonths === 0) {
    return yearsLabel;
  }
  return `${yearsLabel} e ${restMonths} ${restMonths === 1 ? 'mês' : 'meses'}`;
}

/**
 * Formata uma data (ISO `yyyy-mm-dd`/com hora, ou `Date`) como `dd/mm/aaaa`,
 * lendo sempre as partes em **UTC** (consistente com o parsing do domínio,
 * sem ±1 dia por fuso).
 */
export function formatarDataBR(value: string | Date): string {
  const d = value instanceof Date ? value : parseISODate(value);
  const dia = String(d.getUTCDate()).padStart(2, '0');
  const mes = String(d.getUTCMonth() + 1).padStart(2, '0');
  return `${dia}/${mes}/${d.getUTCFullYear()}`;
}

/**
 * Iniciais para o avatar (no máximo 2 letras, maiúsculas).
 * "Ana Beatriz Souza" → "AS"; "Lucas" → "L".
 */
export function iniciais(nome: string): string {
  const parts = nome.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    return '';
  }
  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase();
  }
  const first = parts[0].charAt(0);
  const last = parts[parts.length - 1].charAt(0);
  return (first + last).toUpperCase();
}
