/**
 * Resumo de cobertura de uma criança. Computado pelo `ScheduleService`.
 *
 * `percentEmDia` = das doses já devidas (aplicadas + pendentes + atrasadas),
 * quantas estão aplicadas. Doses futuras não entram no denominador; quando
 * nada é devido ainda, vale 100 (criança em dia por definição).
 */
export interface Coverage {
  aplicadas: number;
  pendentes: number;
  atrasadas: number;
  futuras: number;
  total: number;
  percentEmDia: number;
}
