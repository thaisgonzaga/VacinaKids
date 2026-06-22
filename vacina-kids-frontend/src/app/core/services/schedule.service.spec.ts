import { TestBed } from '@angular/core/testing';
import { firstValueFrom, of } from 'rxjs';

import { ScheduleService } from './schedule.service';
import { PNI_2026_CATALOG } from '../../data/pni-2026.catalog';
import {
  Child,
  VaccinationRecord,
  VaccinationStatus,
  VaccineCatalogItem,
  VaccineDose,
} from '../../models';

/** `today` fixo para determinismo. */
const TODAY = new Date(Date.UTC(2026, 5, 20)); // 2026-06-20

function makeChild(over: Partial<Child> = {}): Child {
  return {
    id: 'c1',
    uid: 'u1',
    nome: 'Bebê Teste',
    dataNascimento: '2025-01-01',
    corAvatar: 'green',
    criadoEm: '2025-01-01T00:00:00.000Z',
    ...over,
  };
}

function makeRecord(catalogId: string, over: Partial<VaccinationRecord> = {}): VaccinationRecord {
  return {
    id: `r-${catalogId}`,
    uid: 'u1',
    childId: 'c1',
    catalogId,
    dataAplicacao: '2025-03-01',
    criadoEm: '2025-03-01T00:00:00.000Z',
    ...over,
  };
}

/** Constrói uma `VaccineDose` mínima para isolar `bands`/`coverage`. */
function makeDose(
  band: string,
  ageMonths: number,
  status: VaccinationStatus,
  dueDate: Date,
): VaccineDose {
  const catalog: VaccineCatalogItem = {
    id: `${band}-${status}-${ageMonths}`,
    vaccine: 'V',
    dose: 'd',
    band,
    ageMonths,
    when: band,
    protects: '',
    why: '',
  };
  return { catalog, status, dueDate };
}

describe('ScheduleService', () => {
  let service: ScheduleService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ScheduleService);
  });

  describe('dosesDaCrianca', () => {
    it('gera uma dose por item do catálogo, com status calculado e record acoplado', () => {
      const child = makeChild();
      const records = [makeRecord('penta-1')];

      const doses = service.dosesDaCrianca(child, records, TODAY);

      expect(doses.length).toBe(PNI_2026_CATALOG.length); // 28

      const penta1 = doses.find((d) => d.catalog.id === 'penta-1');
      expect(penta1?.status).toBe(VaccinationStatus.Aplicada);
      expect(penta1?.record).toBeDefined();

      // sem registro, no passado distante → Atrasada
      const hepb = doses.find((d) => d.catalog.id === 'hepb-0');
      expect(hepb?.status).toBe(VaccinationStatus.Atrasada);
      expect(hepb?.record).toBeUndefined();

      // dose de 4 anos para um bebê → Futura
      const dtpR2 = doses.find((d) => d.catalog.id === 'dtp-r2');
      expect(dtpR2?.status).toBe(VaccinationStatus.Futura);
    });
  });

  describe('bands', () => {
    it('agrupa por faixa, ordena por ageMonths e agrega status/contagens', () => {
      const doses: VaccineDose[] = [
        // fora de ordem de propósito
        makeDose('2 meses', 2, VaccinationStatus.Aplicada, new Date(Date.UTC(2025, 2, 1))),
        makeDose('2 meses', 2, VaccinationStatus.Pendente, new Date(Date.UTC(2025, 2, 1))),
        makeDose('Ao nascer', 0, VaccinationStatus.Atrasada, new Date(Date.UTC(2025, 0, 1))),
        makeDose('Ao nascer', 0, VaccinationStatus.Aplicada, new Date(Date.UTC(2025, 0, 1))),
        makeDose('6 meses', 6, VaccinationStatus.Futura, new Date(Date.UTC(2025, 6, 1))),
        makeDose('6 meses', 6, VaccinationStatus.Futura, new Date(Date.UTC(2025, 6, 1))),
      ];

      const bands = service.bands(doses);

      expect(bands.map((b) => b.band)).toEqual(['Ao nascer', '2 meses', '6 meses']);

      const nascer = bands[0];
      expect(nascer.total).toBe(2);
      expect(nascer.aplicadas).toBe(1);
      expect(nascer.statusAgregado).toBe(VaccinationStatus.Atrasada); // Atrasada domina

      const doisMeses = bands[1];
      expect(doisMeses.statusAgregado).toBe(VaccinationStatus.Pendente); // Pendente domina (sem Atrasada)

      const seisMeses = bands[2];
      expect(seisMeses.statusAgregado).toBe(VaccinationStatus.Futura);
    });

    it('faixa toda aplicada agrega como Aplicada', () => {
      const doses: VaccineDose[] = [
        makeDose('4 meses', 4, VaccinationStatus.Aplicada, new Date(Date.UTC(2025, 4, 1))),
        makeDose('4 meses', 4, VaccinationStatus.Aplicada, new Date(Date.UTC(2025, 4, 1))),
      ];
      expect(service.bands(doses)[0].statusAgregado).toBe(VaccinationStatus.Aplicada);
    });
  });

  describe('coverage', () => {
    it('conta por status e calcula % em dia sobre as doses já devidas', () => {
      const d = (s: VaccinationStatus) => makeDose('x', 1, s, TODAY);
      const doses: VaccineDose[] = [
        d(VaccinationStatus.Aplicada),
        d(VaccinationStatus.Aplicada),
        d(VaccinationStatus.Pendente),
        d(VaccinationStatus.Atrasada),
        d(VaccinationStatus.Futura),
        d(VaccinationStatus.Futura),
      ];

      const cov = service.coverage(doses);

      expect(cov.total).toBe(6);
      expect(cov.aplicadas).toBe(2);
      expect(cov.pendentes).toBe(1);
      expect(cov.atrasadas).toBe(1);
      expect(cov.futuras).toBe(2);
      // devidas = 2+1+1 = 4 → 2/4 = 50%
      expect(cov.percentEmDia).toBe(50);
    });

    it('quando nada é devido ainda (só futuras) → 100% em dia', () => {
      const doses: VaccineDose[] = [
        makeDose('x', 1, VaccinationStatus.Futura, TODAY),
        makeDose('x', 1, VaccinationStatus.Futura, TODAY),
      ];
      expect(service.coverage(doses).percentEmDia).toBe(100);
    });
  });

  describe('proximasVacinas', () => {
    it('retorna doses não aplicadas (Atrasada/Pendente/Futura), ordenadas por data, respeitando o limite', () => {
      const doses: VaccineDose[] = [
        makeDose('x', 0, VaccinationStatus.Aplicada, new Date(Date.UTC(2025, 0, 1))),
        makeDose('x', 0, VaccinationStatus.Atrasada, new Date(Date.UTC(2025, 1, 1))),
        makeDose('x', 0, VaccinationStatus.Futura, new Date(Date.UTC(2026, 8, 1))),
        makeDose('x', 0, VaccinationStatus.Pendente, new Date(Date.UTC(2026, 6, 1))),
        makeDose('x', 0, VaccinationStatus.Futura, new Date(Date.UTC(2026, 7, 1))),
      ];

      const proximas = service.proximasVacinas(doses, 2);

      expect(proximas.length).toBe(2);
      // exclui apenas as já aplicadas; as atrasadas entram aqui também
      expect(proximas.every((d) => d.status !== VaccinationStatus.Aplicada)).toBeTrue();
      // ordem por dueDate ascendente: 2025-02 (Atrasada) antes de 2026-07 (Pendente)
      expect(proximas[0].status).toBe(VaccinationStatus.Atrasada);
      expect(proximas[0].dueDate.getTime()).toBeLessThan(proximas[1].dueDate.getTime());
    });
  });

  describe('journey$', () => {
    it('reage ao stream de registros e devolve as faixas', async () => {
      const child = makeChild();
      const records$ = of<VaccinationRecord[]>([makeRecord('hepb-0')]);

      const bands = await firstValueFrom(service.journey$(child, records$, TODAY));

      expect(bands.length).toBeGreaterThan(0);
      const nascer = bands.find((b) => b.band === 'Ao nascer');
      // hepb-0 aplicada; bcg-0 sem registro (Atrasada) → faixa agrega Atrasada
      expect(nascer?.aplicadas).toBe(1);
      expect(nascer?.statusAgregado).toBe(VaccinationStatus.Atrasada);
    });
  });
});
