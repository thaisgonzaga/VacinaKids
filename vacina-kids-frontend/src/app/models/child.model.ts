/**
 * Criança cadastrada por um usuário. DTO puro — sem comportamento.
 * Helpers (iniciais, idade) vivem em `core/utils/date.utils.ts`.
 *
 * Persistido na coleção `children`, isolado por `uid`.
 */
export interface Child {
  /** id do documento no Firestore. */
  id: string;
  /** dono dos dados (Firebase Auth uid). */
  uid: string;
  nome: string;
  /** data de nascimento em ISO `yyyy-mm-dd` (sem hora). */
  dataNascimento: string;
  /** chave da cor de avatar (1 das 6 da paleta). */
  corAvatar: string;
  /** criação em ISO 8601. */
  criadoEm: string;
}
