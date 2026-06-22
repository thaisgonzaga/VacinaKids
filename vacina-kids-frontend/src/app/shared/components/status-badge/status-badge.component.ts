import { Component, computed, input } from '@angular/core';

import { VaccinationStatus } from '../../../models';
import { statusVisual } from '../../../core/utils/status-visual';

/**
 * Pílula de status (PLANO §6: `status-badge(status)`). Apresentação pura: lê
 * `status-visual.ts` para rótulo/cores. No design é uma pílula **só-texto**
 * (peso 700) — o ícone fica no quadradinho colorido do `dose-item`, não aqui.
 */
@Component({
  selector: 'app-status-badge',
  template: `
    <span class="badge" [style.background]="v().bg" [style.color]="v().fg">{{ v().label }}</span>
  `,
  styles: `
    .badge {
      display: inline-flex;
      align-items: center;
      padding: 5px 11px;
      border-radius: 999px;
      font-size: 0.72rem;
      font-weight: 700;
      line-height: 1;
      white-space: nowrap;
    }
  `,
})
export class StatusBadgeComponent {
  readonly status = input.required<VaccinationStatus>();

  readonly v = computed(() => statusVisual(this.status()));
}
