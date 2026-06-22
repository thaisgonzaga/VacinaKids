import { Component, computed, input } from '@angular/core';
import { IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  calendarOutline,
  checkmark,
  timeOutline,
  warningOutline,
} from 'ionicons/icons';

import { VaccinationStatus } from '../../../models';
import { statusVisual } from '../../../core/utils/status-visual';

/**
 * Cartão de indicador do dashboard (PLANO §6: `indicator-card(label,value,status)`).
 * Um número grande + rótulo, tingido pelo `status` via `status-visual.ts`.
 */
@Component({
  selector: 'app-indicator-card',
  template: `
    <div class="ind">
      <span class="ind__icon" [style.background]="v().bg" [style.color]="v().fg">
        <ion-icon [name]="v().icon" aria-hidden="true"></ion-icon>
      </span>
      <span class="ind__value" [style.color]="v().fg">{{ value() }}</span>
      <span class="ind__label">{{ label() }}</span>
    </div>
  `,
  styles: `
    .ind {
      display: flex;
      flex-direction: column;
      gap: 4px;
      padding: 16px;
      border-radius: 16px;
      background: #fff;
      border: 1px solid var(--vk-border);
      box-shadow: var(--vk-shadow-card);
      height: 100%;
    }
    .ind__icon {
      display: grid;
      place-items: center;
      width: 38px;
      height: 38px;
      border-radius: 11px;
      font-size: 20px;
      margin-bottom: 6px;
    }
    .ind__value {
      font-size: 1.7rem;
      font-weight: 700;
      line-height: 1.1;
      font-family: 'Poppins', sans-serif;
    }
    .ind__label {
      font-size: 0.82rem;
      color: var(--vk-text-2);
    }
  `,
  imports: [IonIcon],
})
export class IndicatorCardComponent {
  readonly label = input.required<string>();
  readonly value = input.required<number | string>();
  readonly status = input.required<VaccinationStatus>();

  readonly v = computed(() => statusVisual(this.status()));

  constructor() {
    addIcons({
      checkmark,
      'time-outline': timeOutline,
      'warning-outline': warningOutline,
      'calendar-outline': calendarOutline,
    });
  }
}
