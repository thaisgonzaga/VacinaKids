import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { IonIcon, ModalController } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { personOutline } from 'ionicons/icons';

import { AuthService } from '../../../core/services/auth.service';
import { UiFeedbackService } from '../../../core/services/ui-feedback.service';
import { mensagemAuthErro } from '../../../core/utils/auth-error';

/**
 * Modal de edição de conta (PLANO §6: `edit-account`). Atualiza nome e e-mail
 * via `AuthService.atualizarConta` (a troca de e-mail dispara verificação).
 * Fiel ao protótipo (`VacinaKids.dc.html`): card branco com header (avatar de
 * ícone + subtítulo), inputs nativos e dois botões. Aberto via `ModalController`
 * (`vk-modal-account`); fecha com role `done` no sucesso.
 */
@Component({
  selector: 'app-edit-account',
  templateUrl: './edit-account.component.html',
  styleUrls: ['./edit-account.component.scss'],
  imports: [ReactiveFormsModule, IonIcon],
})
export class EditAccountComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly ui = inject(UiFeedbackService);
  private readonly modalCtrl = inject(ModalController);

  readonly loading = signal(false);

  readonly form = this.fb.nonNullable.group({
    nome: [this.auth.perfil().nome, [Validators.required, Validators.minLength(2)]],
    email: [this.auth.perfil().email, [Validators.required, Validators.email]],
  });

  constructor() {
    addIcons({ 'person-outline': personOutline });
  }

  invalido(campo: 'nome' | 'email'): boolean {
    const c = this.form.controls[campo];
    return c.invalid && (c.touched || c.dirty);
  }

  fechar(): void {
    void this.modalCtrl.dismiss(null, 'cancel');
  }

  async salvar(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading.set(true);
    const { nome, email } = this.form.getRawValue();
    try {
      const trocouEmail = email !== this.auth.perfil().email;
      await this.auth.atualizarConta(nome, email);
      await this.ui.sucesso(
        trocouEmail
          ? 'Dados salvos. Confirme o novo e-mail pelo link enviado.'
          : 'Dados atualizados.',
      );
      void this.modalCtrl.dismiss(null, 'done');
    } catch (e) {
      await this.ui.erro(mensagemAuthErro(e));
    } finally {
      this.loading.set(false);
    }
  }
}
