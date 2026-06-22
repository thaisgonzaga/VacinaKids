import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { PNI_2026_CATALOG } from '../../data/pni-2026.catalog';
import {
  Child,
  Coverage,
  JourneyBand,
  VaccinationRecord,
  VaccinationStatus,
  VaccineDose,
} from '../../models';
import { addMonths } from '../utils/date.utils';
import { computeStatus } from '../utils/status';

/** Prioridade de agregação de uma faixa: o status "mais urgente" vence. */
const AGGREGATE_PRIORITY: readonly VaccinationStatus[] = [
  VaccinationStatus.Atrasada,
  VaccinationStatus.Pendente,
  VaccinationStatus.Futura,
];

/**
 * Núcleo de domínio: cruza o catálogo estático do PNI com os registros da
 * criança e produz as views (jornada, cobertura, próximas). **Sem Firestore
 * direto** — os métodos síncronos recebem arrays (testáveis), e `journey$`
 * apenas mapeia um stream de registros já fornecido pela camada de dados
 * (`VaccinationService.registrosDaCrianca`), mantendo este service puro.
 */
@Injectable({ providedIn: 'root' })
export class ScheduleService {
  /**
   * Para cada item do catálogo, computa status e data prevista cruzando com o
   * eventual registro da criança. Resultado em ordem cronológica do catálogo.
   */
  dosesDaCrianca(
    child: Child,
    records: VaccinationRecord[],
    today: Date = new Date(),
  ): VaccineDose[] {
    return PNI_2026_CATALOG.map((catalog) => {
      const record = records.find(
        (r) => r.childId === child.id && r.catalogId === catalog.id,
      );
      const status = computeStatus(
        child.dataNascimento,
        catalog.ageMonths,
        !!record,
        today,
      );
      const dose: VaccineDose = {
        catalog,
        status,
        dueDate: addMonths(child.dataNascimento, catalog.ageMonths),
      };
      if (record) {
        dose.record = record;
      }
      return dose;
    });
  }

  /** Agrupa as doses por faixa etária, ordenadas por `ageMonths`. */
  bands(doses: VaccineDose[]): JourneyBand[] {
    const byBand = new Map<string, VaccineDose[]>();
    for (const dose of doses) {
      const list = byBand.get(dose.catalog.band);
      if (list) {
        list.push(dose);
      } else {
        byBand.set(dose.catalog.band, [dose]);
      }
    }

    const bands: JourneyBand[] = [];
    for (const [band, bandDoses] of byBand) {
      const aplicadas = bandDoses.filter(
        (d) => d.status === VaccinationStatus.Aplicada,
      ).length;
      bands.push({
        band,
        ageMonths: bandDoses[0].catalog.ageMonths,
        doses: bandDoses,
        aplicadas,
        total: bandDoses.length,
        statusAgregado: this.aggregateStatus(bandDoses),
      });
    }

    return bands.sort((a, b) => a.ageMonths - b.ageMonths);
  }

  /**
   * Resumo de cobertura. `percentEmDia` considera apenas as doses já devidas
   * (aplicadas + pendentes + atrasadas); só futuras → 100% (em dia).
   */
  coverage(doses: VaccineDose[]): Coverage {
    const aplicadas = this.count(doses, VaccinationStatus.Aplicada);
    const pendentes = this.count(doses, VaccinationStatus.Pendente);
    const atrasadas = this.count(doses, VaccinationStatus.Atrasada);
    const futuras = this.count(doses, VaccinationStatus.Futura);
    const devidas = aplicadas + pendentes + atrasadas;
    const percentEmDia = devidas === 0 ? 100 : Math.round((aplicadas / devidas) * 100);
    return {
      aplicadas,
      pendentes,
      atrasadas,
      futuras,
      total: doses.length,
      percentEmDia,
    };
  }

  /**
   * Próximas doses a aplicar — toda dose ainda **não aplicada**
   * (Atrasada/Pendente/Futura), ordenada pela data prevista. As atrasadas
   * aparecem aqui junto das demais (design §dashboard › próximas vacinas);
   * o banner do dashboard apenas reforça a contagem.
   */
  proximasVacinas(doses: VaccineDose[], limit = 4): VaccineDose[] {
    return doses
      .filter((d) => d.status !== VaccinationStatus.Aplicada)
      .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime())
      .slice(0, limit);
  }

  /**
   * Jornada reativa: mapeia o stream de registros da criança para as faixas.
   * A camada de dados injeta `records$` (ex.: `vaccinationService
   * .registrosDaCrianca(child.id)`), preservando este service livre de Firestore.
   */
  journey$(
    child: Child,
    records$: Observable<VaccinationRecord[]>,
    today: Date = new Date(),
  ): Observable<JourneyBand[]> {
    return records$.pipe(
      map((records) => this.bands(this.dosesDaCrianca(child, records, today))),
    );
  }

  private count(doses: VaccineDose[], status: VaccinationStatus): number {
    return doses.filter((d) => d.status === status).length;
  }

  private aggregateStatus(doses: VaccineDose[]): VaccinationStatus {
    if (doses.every((d) => d.status === VaccinationStatus.Aplicada)) {
      return VaccinationStatus.Aplicada;
    }
    for (const status of AGGREGATE_PRIORITY) {
      if (doses.some((d) => d.status === status)) {
        return status;
      }
    }
    return VaccinationStatus.Aplicada;
  }
}
