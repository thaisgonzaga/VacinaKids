import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import {
  IonAccordion,
  IonAccordionGroup,
  IonContent,
  IonIcon,
  IonItem,
  ModalController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  chevronForward,
  informationCircleOutline,
  keyOutline,
  personOutline,
} from 'ionicons/icons';

import { AuthService } from '../../core/services/auth.service';
import { UiFeedbackService } from '../../core/services/ui-feedback.service';
import { mensagemAuthErro } from '../../core/utils/auth-error';
import { iniciais } from '../../core/utils/date.utils';
import { ChangePasswordComponent } from '../../shared/modals/change-password/change-password.component';
import { ConfirmDialogComponent } from '../../shared/modals/confirm-dialog/confirm-dialog.component';
import { EditAccountComponent } from '../../shared/modals/edit-account/edit-account.component';

/**
 * Configurações (T4.17): accordion com a seção Conta (edit-account /
 * change-password) e Sobre, mais Sair via `confirm-dialog`. Mostra o perfil
 * atual no topo.
 */
@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
  imports: [IonContent, IonAccordionGroup, IonAccordion, IonItem, IonIcon],
})
export class SettingsPage {
  private readonly auth = inject(AuthService);
  private readonly modalCtrl = inject(ModalController);
  private readonly router = inject(Router);
  private readonly ui = inject(UiFeedbackService);

  readonly perfil = this.auth.perfil();
  readonly iniciais = iniciais(this.perfil.nome || this.perfil.email || '?');

  constructor() {
    addIcons({
      'person-outline': personOutline,
      'key-outline': keyOutline,
      'chevron-forward': chevronForward,
      'information-circle-outline': informationCircleOutline,
    });
  }

  async editarConta(): Promise<void> {
    const modal = await this.modalCtrl.create({
      component: EditAccountComponent,
      cssClass: 'vk-modal-account',
    });
    await modal.present();
  }

  async trocarSenha(): Promise<void> {
    const modal = await this.modalCtrl.create({
      component: ChangePasswordComponent,
      cssClass: 'vk-modal-account',
    });
    await modal.present();
  }

  async sair(): Promise<void> {
    const modal = await this.modalCtrl.create({
      component: ConfirmDialogComponent,
      cssClass: 'vk-confirm',
      componentProps: {
        titulo: 'Sair da conta',
        mensagem:
          'Deseja realmente sair? Você precisará entrar novamente para acompanhar o calendário.',
        confirmarLabel: 'Sair',
        variante: 'sair',
      },
    });
    await modal.present();
    const { data } = await modal.onWillDismiss<boolean>();
    if (data === true) {
      try {
        await this.ui.comCarregando('Saindo...', () => this.auth.logout());
        await this.router.navigateByUrl('/login');
        await this.ui.sucesso('Você saiu da conta.');
      } catch (e) {
        await this.ui.erro(mensagemAuthErro(e));
      }
    }
  }
}
