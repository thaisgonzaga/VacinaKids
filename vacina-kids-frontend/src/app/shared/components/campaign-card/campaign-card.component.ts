import { Component, computed, input } from '@angular/core';
import { IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  calendarOutline,
  documentsOutline,
  megaphoneOutline,
  peopleOutline,
  shieldCheckmarkOutline,
  thermometerOutline,
  warningOutline,
} from 'ionicons/icons';

import { formatarDataBR } from '../../../core/utils/date.utils';
import { Campaign } from '../../../models';

/**
 * Cartão de campanha (PLANO §6: `campaign-card(campaign)`). Variante `hero`
 * destaca a campanha prioritária. Apresentação pura.
 */
@Component({
  selector: 'app-campaign-card',
  templateUrl: './campaign-card.component.html',
  styleUrls: ['./campaign-card.component.scss'],
  imports: [IonIcon],
})
export class CampaignCardComponent {
  readonly campaign = input.required<Campaign>();
  readonly hero = input(false);

  readonly periodo = computed(() => {
    const c = this.campaign();
    return `${formatarDataBR(c.periodoInicio)} a ${formatarDataBR(c.periodoFim)}`;
  });

  constructor() {
    addIcons({
      'megaphone-outline': megaphoneOutline,
      'thermometer-outline': thermometerOutline,
      'shield-checkmark-outline': shieldCheckmarkOutline,
      'documents-outline': documentsOutline,
      'people-outline': peopleOutline,
      'calendar-outline': calendarOutline,
      'warning-outline': warningOutline,
    });
  }
}
