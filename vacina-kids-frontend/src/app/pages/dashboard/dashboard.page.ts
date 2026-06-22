import { Component, computed, inject, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { IonContent, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { warningOutline } from 'ionicons/icons';
import { of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

import { ActiveChildService } from '../../core/services/active-child.service';
import { ScheduleService } from '../../core/services/schedule.service';
import { VaccinationService } from '../../core/services/vaccination.service';
import { DoseRegistrationService } from '../../shared/services/dose-registration.service';
import { Coverage, VaccinationStatus, VaccineDose } from '../../models';
import { CoverageRingComponent } from '../../shared/components/coverage-ring/coverage-ring.component';
import { DoseItemComponent } from '../../shared/components/dose-item/dose-item.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { IndicatorCardComponent } from '../../shared/components/indicator-card/indicator-card.component';
import { VaccineDetailDrawerComponent } from '../../shared/components/vaccine-detail-drawer/vaccine-detail-drawer.component';

/** Visão consolidada da criança ativa. */
interface DashboardVM {
  coverage: Coverage;
  atrasadas: VaccineDose[];
  proximas: VaccineDose[];
}

/**
 * Dashboard (T4.15): banner de atrasadas (condicional, identificável em ≤2
 * toques), `coverage-ring`, 4 `indicator-card` e próximas vacinas. Reage à
 * criança ativa e ao Firestore. Status sempre via `ScheduleService`.
 */
@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
  imports: [
    IonContent,
    IonIcon,
    CoverageRingComponent,
    IndicatorCardComponent,
    DoseItemComponent,
    EmptyStateComponent,
    VaccineDetailDrawerComponent,
  ],
})
export class DashboardPage {
  private readonly activeChild = inject(ActiveChildService);
  private readonly vaccination = inject(VaccinationService);
  private readonly schedule = inject(ScheduleService);
  private readonly registration = inject(DoseRegistrationService);
  private readonly router = inject(Router);

  /** Exposto ao template para os rótulos dos indicadores. */
  readonly Status = VaccinationStatus;

  readonly doseSel = signal<VaccineDose | null>(null);

  readonly vm = toSignal(
    toObservable(this.activeChild.active).pipe(
      switchMap((child) => {
        if (!child) {
          return of<DashboardVM | null>(null);
        }
        return this.vaccination.registrosDaCrianca(child.id).pipe(
          map((records): DashboardVM => {
            const doses = this.schedule.dosesDaCrianca(child, records);
            return {
              coverage: this.schedule.coverage(doses),
              atrasadas: doses.filter((d) => d.status === VaccinationStatus.Atrasada),
              proximas: this.schedule.proximasVacinas(doses, 4),
            };
          }),
        );
      }),
    ),
    { initialValue: null },
  );

  readonly temCrianca = computed(() => !!this.activeChild.active());

  constructor() {
    addIcons({ 'warning-outline': warningOutline });
  }

  irParaCriancas(): void {
    void this.router.navigateByUrl('/app/children');
  }

  irParaJornada(): void {
    void this.router.navigateByUrl('/app/journey');
  }

  /** Total de doses do calendário (todas as faixas) para a legenda. */
  total(c: Coverage): number {
    return c.aplicadas + c.pendentes + c.atrasadas + c.futuras;
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
