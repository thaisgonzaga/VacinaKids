import { Component, computed, input, output } from '@angular/core';
import {
  IonContent,
  IonIcon,
  IonModal,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  bulbOutline,
  calendarNumberOutline,
  closeOutline,
} from 'ionicons/icons';

import { formatarDataBR } from '../../../core/utils/date.utils';
import { statusVisual } from '../../../core/utils/status-visual';
import { VaccinationStatus, VaccineDose } from '../../../models';

/**
 * Drawer de detalhe da vacina (design §drawer): `ion-modal` à direita
 * (`.vk-drawer` no global.scss). Header colorido pelo status + cards brancos
 * (protege/por que/quando) + CTA de registro. Apresentação pura.
 */
@Component({
  selector: 'app-vaccine-detail-drawer',
  templateUrl: './vaccine-detail-drawer.component.html',
  styleUrls: ['./vaccine-detail-drawer.component.scss'],
  imports: [IonModal, IonContent, IonIcon],
})
export class VaccineDetailDrawerComponent {
  readonly dose = input<VaccineDose | null>(null);

  // `closed`: `close` colidiria com o evento DOM nativo (ESLint no-output-native).
  readonly closed = output<void>();
  readonly register = output<VaccineDose>();

  readonly disclaimer =
    'Conteúdo informativo de apoio — não substitui orientação médica nem a caderneta oficial.';

  readonly vis = computed(() => {
    const d = this.dose();
    return d ? statusVisual(d.status) : null;
  });
  readonly aplicada = computed(() => this.dose()?.status === VaccinationStatus.Aplicada);
  readonly previsao = computed(() => {
    const d = this.dose();
    return d ? formatarDataBR(d.dueDate) : '';
  });
  readonly aplicacao = computed(() => {
    const r = this.dose()?.record;
    return r ? formatarDataBR(r.dataAplicacao) : null;
  });

  constructor() {
    addIcons({
      'close-outline': closeOutline,
      'bulb-outline': bulbOutline,
      'calendar-number-outline': calendarNumberOutline,
    });
  }
}
