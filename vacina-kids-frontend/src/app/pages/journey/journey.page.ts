import { Component, computed, inject, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import {
  IonAccordion,
  IonAccordionGroup,
  IonContent,
  IonItem,
} from '@ionic/angular/standalone';
import { of } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import { ActiveChildService } from '../../core/services/active-child.service';
import { ScheduleService } from '../../core/services/schedule.service';
import { VaccinationService } from '../../core/services/vaccination.service';
import { DoseRegistrationService } from '../../shared/services/dose-registration.service';
import { statusVisual } from '../../core/utils/status-visual';
import { JourneyBand, VaccinationStatus, VaccineDose } from '../../models';
import { DoseItemComponent } from '../../shared/components/dose-item/dose-item.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';
import { VaccineDetailDrawerComponent } from '../../shared/components/vaccine-detail-drawer/vaccine-detail-drawer.component';

/**
 * Jornada vacinal (T4.14): accordion por faixa etária da criança ativa, cada
 * faixa com seu `status-badge` agregado e os `dose-item`. "Detalhes" abre o
 * drawer; "Registrar" abre o fluxo de aplicação. Reage ao Firestore em tempo real.
 */
@Component({
  selector: 'app-journey',
  templateUrl: './journey.page.html',
  styleUrls: ['./journey.page.scss'],
  imports: [
    IonContent,
    IonAccordionGroup,
    IonAccordion,
    IonItem,
    StatusBadgeComponent,
    DoseItemComponent,
    EmptyStateComponent,
    VaccineDetailDrawerComponent,
  ],
})
export class JourneyPage {
  readonly activeChild = inject(ActiveChildService);
  private readonly vaccination = inject(VaccinationService);
  private readonly schedule = inject(ScheduleService);
  private readonly registration = inject(DoseRegistrationService);

  /** Dose aberta no drawer (null = fechado). */
  readonly doseSel = signal<VaccineDose | null>(null);

  readonly bands = toSignal(
    toObservable(this.activeChild.active).pipe(
      switchMap((child) =>
        child
          ? this.schedule.journey$(child, this.vaccination.registrosDaCrianca(child.id))
          : of<JourneyBand[]>([]),
      ),
    ),
    { initialValue: [] as JourneyBand[] },
  );

  readonly temCrianca = computed(() => !!this.activeChild.active());

  readonly resumo = computed(() => {
    const bands = this.bands();
    const aplicadas = bands.reduce((acc, b) => acc + b.aplicadas, 0);
    const total = bands.reduce((acc, b) => acc + b.total, 0);
    return { aplicadas, total };
  });

  /** Cor do indicador (dot) da faixa, a partir do status agregado. */
  corFaixa(status: VaccinationStatus): string {
    return statusVisual(status).fg;
  }

  abrirDetalhe(dose: VaccineDose): void {
    this.doseSel.set(dose);
  }

  async registrar(dose: VaccineDose): Promise<void> {
    const child = this.activeChild.active();
    if (!child) {
      return;
    }
    const ok = await this.registration.abrir(child, dose);
    if (ok) {
      this.doseSel.set(null);
    }
  }
}
