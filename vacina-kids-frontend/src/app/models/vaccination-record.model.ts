/**
 * Registro de que uma dose do catálogo foi aplicada numa criança.
 * Persistido na coleção `vaccinationRecords`, isolado por `uid` + `childId`.
 */
export interface VaccinationRecord {
  id: string;
  uid: string;
  childId: string;
  /** referência a `VaccineCatalogItem.id`. */
  catalogId: string;
  /** data da aplicação em ISO `yyyy-mm-dd`. */
  dataAplicacao: string;
  /** criação em ISO 8601. */
  criadoEm: string;
}
