import { Component, computed, input, output } from '@angular/core';
import { IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { calendarOutline, checkmark, timeOutline, warningOutline } from 'ionicons/icons';

import { formatarDataBR } from '../../../core/utils/date.utils';
import { statusVisual } from '../../../core/utils/status-visual';
import { VaccinationStatus, VaccineDose } from '../../../models';
import { StatusBadgeComponent } from '../status-badge/status-badge.component';

/**
 * Linha de uma dose na jornada/dashboard (PLANO §6: `dose-item(dose; details/register)`).
 * Mostra vacina, dose, previsão e status; oferece "Detalhes" (abre o drawer) e
 * "Registrar" (quando ainda não aplicada). Apresentação pura.
 *
 * `variant` alterna entre a apresentação da **jornada** (default: dois botões,
 * dose+previsão na 2ª linha) e a do **dashboard** ("vacina · dose" na 1ª linha,
 * faixa+previsão na 2ª, item em cartão com borda e só o botão Registrar) — fiel
 * ao design `VacinaKids.dc.html`.
 */
@Component({
  selector: 'app-dose-item',
  templateUrl: './dose-item.component.html',
  styleUrls: ['./dose-item.component.scss'],
  imports: [IonIcon, StatusBadgeComponent],
})
export class DoseItemComponent {
  readonly dose = input.required<VaccineDose>();
  readonly variant = input<'journey' | 'dashboard'>('journey');

  readonly details = output<VaccineDose>();
  readonly register = output<VaccineDose>();

  readonly v = computed(() => statusVisual(this.dose().status));
  readonly aplicada = computed(() => this.dose().status === VaccinationStatus.Aplicada);

  readonly previsao = computed(() => formatarDataBR(this.dose().dueDate));
  readonly aplicacao = computed(() => {
    const r = this.dose().record;
    return r ? formatarDataBR(r.dataAplicacao) : null;
  });

  constructor() {
    addIcons({
      checkmark,
      'time-outline': timeOutline,
      'warning-outline': warningOutline,
      'calendar-outline': calendarOutline,
    });
  }
}
