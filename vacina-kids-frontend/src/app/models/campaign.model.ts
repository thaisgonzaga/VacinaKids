/**
 * Campanha de vacinação. DTO puro.
 * Persistida na coleção global `campaigns` (somente leitura no cliente;
 * semeada via console/admin).
 */
export interface Campaign {
  id: string;
  titulo: string;
  descricao: string;
  /** público-alvo (ex.: "Crianças de 6 meses a 5 anos"). */
  publico: string;
  /** início do período em ISO `yyyy-mm-dd`. */
  periodoInicio: string;
  /** fim do período em ISO `yyyy-mm-dd`. */
  periodoFim: string;
  /** destaca a campanha como hero. */
  prioritaria: boolean;
  /** nome do ionicon. */
  icone: string;
}
