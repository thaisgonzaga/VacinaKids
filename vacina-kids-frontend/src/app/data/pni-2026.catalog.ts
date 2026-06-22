import { VaccineCatalogItem } from '../models';

/**
 * Catálogo estático do **Calendário Nacional de Vacinação 2026 (PNI)** —
 * recorte 0–4 anos (28 itens), onde está a maior densidade de doses e o maior
 * risco de atraso/abandono. Fonte: Ministério da Saúde (gov.br/saude),
 * espelhado em `docs/00-estudo-de-caso.md` §2.
 *
 * É a fonte do domínio: o `ScheduleService` cruza estes itens com os
 * `VaccinationRecord` da criança para gerar a jornada. `ageMonths` é a chave
 * de ordenação (0 = ao nascer; 48 = 4 anos).
 *
 * ⚠️ Ferramenta de organização — não substitui orientação médica nem a fonte
 * oficial do Ministério da Saúde.
 */
export const PNI_2026_CATALOG: readonly VaccineCatalogItem[] = [
  // ── Ao nascer ────────────────────────────────────────────────────────────
  {
    id: 'hepb-0',
    vaccine: 'Hepatite B',
    dose: 'Dose ao nascer',
    band: 'Ao nascer',
    ageMonths: 0,
    when: 'Ao nascer',
    protects: 'Hepatite B e D',
    why: 'Aplicada nas primeiras horas de vida, protege o fígado e corta a transmissão da hepatite B da mãe para o bebê.',
  },
  {
    id: 'bcg-0',
    vaccine: 'BCG',
    dose: 'Dose única',
    band: 'Ao nascer',
    ageMonths: 0,
    when: 'Ao nascer',
    protects: 'Formas graves de tuberculose (e efeito contra hanseníase)',
    why: 'Dose única ao nascer que protege contra as formas graves da tuberculose, como a meningite tuberculosa.',
  },

  // ── 2 meses ──────────────────────────────────────────────────────────────
  {
    id: 'penta-1',
    vaccine: 'Penta (DTP+Hib+HB)',
    dose: '1ª dose',
    band: '2 meses',
    ageMonths: 2,
    when: '2 meses',
    protects: 'Difteria, tétano, coqueluche, Hib e hepatite B',
    why: 'Cinco proteções numa só aplicação; o esquema de 3 doses garante a defesa completa nos primeiros meses.',
  },
  {
    id: 'vip-1',
    vaccine: 'VIP (pólio inativada)',
    dose: '1ª dose',
    band: '2 meses',
    ageMonths: 2,
    when: '2 meses',
    protects: 'Poliomielite (paralisia infantil)',
    why: 'Vacina injetável contra a poliomielite; as doses garantem a imunidade enquanto a doença ainda circula no mundo.',
  },
  {
    id: 'pneumo10-1',
    vaccine: 'Pneumocócica 10-valente',
    dose: '1ª dose',
    band: '2 meses',
    ageMonths: 2,
    when: '2 meses',
    protects: 'Doenças pneumocócicas (pneumonia, meningite, otite)',
    why: 'Defende contra pneumonia, meningite e otite causadas pelo pneumococo, comuns na primeira infância.',
  },
  {
    id: 'rota-1',
    vaccine: 'Rotavírus humano',
    dose: '1ª dose',
    band: '2 meses',
    ageMonths: 2,
    when: '2 meses',
    protects: 'Gastrenterite (diarreia) por rotavírus',
    why: 'Gotinha que previne a diarreia grave por rotavírus, principal causa de desidratação em bebês.',
  },

  // ── 3 meses ──────────────────────────────────────────────────────────────
  {
    id: 'menc-1',
    vaccine: 'Meningocócica C',
    dose: '1ª dose',
    band: '3 meses',
    ageMonths: 3,
    when: '3 meses',
    protects: 'Doença meningocócica do tipo C',
    why: 'Protege contra a meningite e a infecção generalizada causadas pelo meningococo do tipo C.',
  },

  // ── 4 meses ──────────────────────────────────────────────────────────────
  {
    id: 'penta-2',
    vaccine: 'Penta (DTP+Hib+HB)',
    dose: '2ª dose',
    band: '4 meses',
    ageMonths: 4,
    when: '4 meses',
    protects: 'Difteria, tétano, coqueluche, Hib e hepatite B',
    why: 'Segunda das três doses; reforça a defesa contra cinco doenças de uma vez.',
  },
  {
    id: 'vip-2',
    vaccine: 'VIP (pólio inativada)',
    dose: '2ª dose',
    band: '4 meses',
    ageMonths: 4,
    when: '4 meses',
    protects: 'Poliomielite (paralisia infantil)',
    why: 'Continua o esquema contra a poliomielite, mantendo a proteção em alta.',
  },
  {
    id: 'pneumo10-2',
    vaccine: 'Pneumocócica 10-valente',
    dose: '2ª dose',
    band: '4 meses',
    ageMonths: 4,
    when: '4 meses',
    protects: 'Doenças pneumocócicas (pneumonia, meningite, otite)',
    why: 'Segunda dose que consolida a proteção contra as doenças pneumocócicas.',
  },
  {
    id: 'rota-2',
    vaccine: 'Rotavírus humano',
    dose: '2ª dose',
    band: '4 meses',
    ageMonths: 4,
    when: '4 meses',
    protects: 'Gastrenterite (diarreia) por rotavírus',
    why: 'Completa a proteção contra a diarreia grave por rotavírus (a última dose tem idade limite — não atrase).',
  },

  // ── 5 meses ──────────────────────────────────────────────────────────────
  {
    id: 'menc-2',
    vaccine: 'Meningocócica C',
    dose: '2ª dose',
    band: '5 meses',
    ageMonths: 5,
    when: '5 meses',
    protects: 'Doença meningocócica do tipo C',
    why: 'Segunda dose que reforça a defesa contra a meningite do tipo C.',
  },

  // ── 6 meses ──────────────────────────────────────────────────────────────
  {
    id: 'penta-3',
    vaccine: 'Penta (DTP+Hib+HB)',
    dose: '3ª dose',
    band: '6 meses',
    ageMonths: 6,
    when: '6 meses',
    protects: 'Difteria, tétano, coqueluche, Hib e hepatite B',
    why: 'Terceira e última dose do esquema básico contra cinco doenças.',
  },
  {
    id: 'vip-3',
    vaccine: 'VIP (pólio inativada)',
    dose: '3ª dose',
    band: '6 meses',
    ageMonths: 6,
    when: '6 meses',
    protects: 'Poliomielite (paralisia infantil)',
    why: 'Fecha o esquema básico contra a poliomielite; os reforços vêm mais adiante.',
  },
  {
    id: 'influenza-1',
    vaccine: 'Influenza',
    dose: '1ª dose (anual)',
    band: '6 meses',
    ageMonths: 6,
    when: 'A partir de 6 meses',
    protects: 'Gripe (influenza) e suas complicações',
    why: 'Dose anual que reduz o risco de gripe grave; pode ser tomada a partir dos 6 meses, sempre na campanha.',
  },
  {
    id: 'covid-1',
    vaccine: 'Covid-19',
    dose: '1ª dose',
    band: '6 meses',
    ageMonths: 6,
    when: 'A partir de 6 meses',
    protects: 'Formas graves da Covid-19',
    why: 'Reduz o risco das formas graves da Covid-19 a partir dos 6 meses de idade.',
  },

  // ── 9 meses ──────────────────────────────────────────────────────────────
  {
    id: 'fa-1',
    vaccine: 'Febre amarela',
    dose: '1 dose',
    band: '9 meses',
    ageMonths: 9,
    when: '9 meses',
    protects: 'Febre amarela',
    why: 'Protege contra a febre amarela; essencial antes de viagens a áreas de risco.',
  },

  // ── 12 meses ─────────────────────────────────────────────────────────────
  {
    id: 'pneumo10-r',
    vaccine: 'Pneumocócica 10-valente',
    dose: 'Reforço',
    band: '12 meses',
    ageMonths: 12,
    when: '12 meses',
    protects: 'Doenças pneumocócicas (pneumonia, meningite, otite)',
    why: 'Reforço que prolonga a proteção contra as doenças pneumocócicas após o 1º ano.',
  },
  {
    id: 'menacwy-1',
    vaccine: 'Meningocócica ACWY',
    dose: '1 dose',
    band: '12 meses',
    ageMonths: 12,
    when: '12 meses',
    protects: 'Doença meningocócica dos tipos A, C, W e Y',
    why: 'Amplia a proteção contra a meningite para quatro sorogrupos (A, C, W e Y).',
  },
  {
    id: 'scr-1',
    vaccine: 'Tríplice viral (SCR)',
    dose: '1ª dose',
    band: '12 meses',
    ageMonths: 12,
    when: '12 meses',
    protects: 'Sarampo, caxumba e rubéola',
    why: 'Protege contra sarampo, caxumba e rubéola; com o retorno do sarampo, não pular as 2 doses é crucial.',
  },

  // ── 15 meses ─────────────────────────────────────────────────────────────
  {
    id: 'dtp-r1',
    vaccine: 'DTP',
    dose: '1º reforço',
    band: '15 meses',
    ageMonths: 15,
    when: '15 meses',
    protects: 'Difteria, tétano e coqueluche',
    why: 'Primeiro reforço da tríplice bacteriana, mantendo ativa a defesa iniciada com a Penta.',
  },
  {
    id: 'vip-r',
    vaccine: 'VIP (pólio inativada)',
    dose: 'Reforço',
    band: '15 meses',
    ageMonths: 15,
    when: '15 meses',
    protects: 'Poliomielite (paralisia infantil)',
    why: 'Reforço que mantém a proteção contra a poliomielite após o esquema básico.',
  },
  {
    id: 'scr-2',
    vaccine: 'Tríplice viral (SCR)',
    dose: '2ª dose',
    band: '15 meses',
    ageMonths: 15,
    when: '15 meses',
    protects: 'Sarampo, caxumba e rubéola',
    why: 'Segunda dose que completa a proteção contra sarampo, caxumba e rubéola.',
  },
  {
    id: 'varicela-1',
    vaccine: 'Varicela',
    dose: '1ª dose',
    band: '15 meses',
    ageMonths: 15,
    when: '15 meses',
    protects: 'Catapora (varicela)',
    why: 'Previne a catapora e suas complicações; o esquema de 2 doses dá proteção duradoura.',
  },
  {
    id: 'hepa-1',
    vaccine: 'Hepatite A',
    dose: 'Dose única',
    band: '15 meses',
    ageMonths: 15,
    when: '15 meses',
    protects: 'Hepatite A',
    why: 'Protege o fígado contra a hepatite A, transmitida por água e alimentos contaminados.',
  },

  // ── 4 anos ───────────────────────────────────────────────────────────────
  {
    id: 'dtp-r2',
    vaccine: 'DTP',
    dose: '2º reforço',
    band: '4 anos',
    ageMonths: 48,
    when: '4 anos',
    protects: 'Difteria, tétano e coqueluche',
    why: 'Segundo reforço da tríplice bacteriana, garantindo a proteção na idade pré-escolar.',
  },
  {
    id: 'fa-r',
    vaccine: 'Febre amarela',
    dose: 'Reforço',
    band: '4 anos',
    ageMonths: 48,
    when: '4 anos',
    protects: 'Febre amarela',
    why: 'Reforço único que consolida a proteção contra a febre amarela por toda a vida.',
  },
  {
    id: 'varicela-2',
    vaccine: 'Varicela',
    dose: '2ª dose',
    band: '4 anos',
    ageMonths: 48,
    when: '4 anos',
    protects: 'Catapora (varicela)',
    why: 'Segunda dose que completa a proteção duradoura contra a catapora.',
  },
] as const;
