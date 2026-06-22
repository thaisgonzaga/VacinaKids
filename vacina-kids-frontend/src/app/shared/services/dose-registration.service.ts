import { Injectable, inject } from '@angular/core';
import { ModalController } from '@ionic/angular/standalone';

import { VaccinationService } from '../../core/services/vaccination.service';
import { UiFeedbackService } from '../../core/services/ui-feedback.service';
import { mensagemFirestoreErro } from '../../core/utils/firestore-error';
import { Child, VaccineDose } from '../../models';
import { RegisterApplicationComponent } from '../modals/register-application/register-application.component';

/**
 * Fluxo de registro de aplicação (T4.13): abre o `register-application` como
 * diálogo centralizado, e ao confirmar grava via `VaccinationService.registrar`
 * com loading + toast. Reusado por dashboard, jornada e drawer — a
 * jornada/dashboard atualizam sozinhos (listener do Firestore). Resolve `true`
 * se registrou.
 */
@Injectable({ providedIn: 'root' })
export class DoseRegistrationService {
  private readonly modalCtrl = inject(ModalController);
  private readonly vaccination = inject(VaccinationService);
  private readonly ui = inject(UiFeedbackService);

  async abrir(child: Child, dose: VaccineDose): Promise<boolean> {
    const modal = await this.modalCtrl.create({
      component: RegisterApplicationComponent,
      componentProps: { dose },
      cssClass: 'vk-dialog',
    });
    await modal.present();

    const { data, role } = await modal.onWillDismiss<string>();
    if (role !== 'confirm' || !data) {
      return false;
    }

    try {
      await this.ui.comCarregando('Registrando aplicação...', () =>
        this.vaccination.registrar(child.id, dose.catalog.id, data),
      );
      await this.ui.sucesso(`${dose.catalog.vaccine} registrada.`);
      return true;
    } catch (e) {
      await this.ui.erro(mensagemFirestoreErro(e));
      return false;
    }
  }
}
