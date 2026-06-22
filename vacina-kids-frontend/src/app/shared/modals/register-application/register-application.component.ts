import { Component, computed, inject, signal } from '@angular/core';
import { ModalController } from '@ionic/angular/standalone';

import { formatarDataBR } from '../../../core/utils/date.utils';
import { VaccineDose } from '../../../models';

/**
 * Modal de registro de aplicação (PLANO §6: `register-application`). Diálogo
 * centralizado (design): resumo da dose (vacina/dose/data prevista) + campo de
 * data nativo (`<input type="date">`, default hoje, `max=hoje`). Resolve
 * `onWillDismiss` com a data ISO `yyyy-mm-dd` (role `confirm`).
 *
 * Recebe `dose` por `componentProps`.
 */
@Component({
  selector: 'app-register-application',
  templateUrl: './register-application.component.html',
  styleUrls: ['./register-application.component.scss'],
  imports: [],
})
export class RegisterApplicationComponent {
  private readonly modalCtrl = inject(ModalController);

  /** Dose a registrar (via componentProps). */
  dose!: VaccineDose;

  readonly hoje = new Date().toISOString().slice(0, 10);
  readonly data = signal(this.hoje);

  readonly previsao = computed(() => formatarDataBR(this.dose.dueDate));

  onData(value: string): void {
    this.data.set(value || this.hoje);
  }

  fechar(): void {
    void this.modalCtrl.dismiss(null, 'cancel');
  }

  confirmar(): void {
    void this.modalCtrl.dismiss(this.data(), 'confirm');
  }
}
