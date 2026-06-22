import { Component, inject, signal } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { IonIcon, ModalController } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { lockClosedOutline } from 'ionicons/icons';

import { AuthService } from '../../../core/services/auth.service';
import { UiFeedbackService } from '../../../core/services/ui-feedback.service';
import { mensagemAuthErro } from '../../../core/utils/auth-error';

/**
 * Modal de troca de senha (PLANO §6: `change-password`). Reautentica via
 * `AuthService.alterarSenha` (senha atual + nova). Fiel ao protótipo
 * (`VacinaKids.dc.html`): card branco com header (avatar de ícone + subtítulo),
 * inputs nativos e dois botões. Aberto via `ModalController`
 * (`vk-modal-account`); fecha com role `done` no sucesso.
 */
@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.scss'],
  imports: [ReactiveFormsModule, IonIcon],
})
export class ChangePasswordComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly ui = inject(UiFeedbackService);
  private readonly modalCtrl = inject(ModalController);

  readonly loading = signal(false);

  readonly form = this.fb.nonNullable.group(
    {
      senhaAtual: ['', [Validators.required]],
      novaSenha: ['', [Validators.required, Validators.minLength(6)]],
      confirmar: ['', [Validators.required]],
    },
    { validators: [this.senhasIguais] },
  );

  constructor() {
    addIcons({ 'lock-closed-outline': lockClosedOutline });
  }

  invalido(campo: 'senhaAtual' | 'novaSenha'): boolean {
    const c = this.form.controls[campo];
    return c.invalid && (c.touched || c.dirty);
  }

  get divergem(): boolean {
    return (
      this.form.hasError('divergem') &&
      (this.form.controls.confirmar.touched || this.form.controls.confirmar.dirty)
    );
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
    const { senhaAtual, novaSenha } = this.form.getRawValue();
    try {
      await this.auth.alterarSenha(senhaAtual, novaSenha);
      await this.ui.sucesso('Senha alterada com sucesso.');
      void this.modalCtrl.dismiss(null, 'done');
    } catch (e) {
      await this.ui.erro(mensagemAuthErro(e, 'reauth'));
    } finally {
      this.loading.set(false);
    }
  }

  private senhasIguais(group: AbstractControl): ValidationErrors | null {
    const nova = group.get('novaSenha')?.value;
    const conf = group.get('confirmar')?.value;
    return nova && conf && nova !== conf ? { divergem: true } : null;
  }
}
