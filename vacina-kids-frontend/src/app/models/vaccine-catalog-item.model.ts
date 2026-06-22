/**
 * Item do catálogo estático do PNI 2026 (`data/pni-2026.catalog.ts`).
 * Não é persistido: vive no app e é cruzado com os registros da criança.
 */
export interface VaccineCatalogItem {
  /** id estável usado como `catalogId` nos registros. */
  id: string;
  /** nome da vacina (ex.: "Penta (DTP+Hib+HB)"). */
  vaccine: string;
  /** rótulo da dose (ex.: "1ª dose", "Reforço"). */
  dose: string;
  /** faixa/marco etário usado para agrupar a jornada (ex.: "2 meses"). */
  band: string;
  /** idade prevista em meses (0 = ao nascer; 48 = 4 anos). Chave de ordenação. */
  ageMonths: number;
  /** doenças evitadas. */
  protects: string;
  /** explicação simples do porquê da vacina. */
  why: string;
  /** rótulo da idade prevista (ex.: "Ao nascer", "4 anos"). */
  when: string;
}
