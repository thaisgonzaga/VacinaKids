import { Component, computed, inject, signal } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { IonContent, IonSpinner } from '@ionic/angular/standalone';

import { AuthService } from '../../core/services/auth.service';
import { UiFeedbackService } from '../../core/services/ui-feedback.service';
import { mensagemAuthErro } from '../../core/utils/auth-error';

/** Telas do fluxo de auth, controladas por um único signal de modo. */
type AuthMode = 'login' | 'signup' | 'forgot' | 'sent';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.page.html',
  styleUrls: ['./auth.page.scss'],
  imports: [ReactiveFormsModule, IonContent, IonSpinner],
})
export class AuthPage {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly ui = inject(UiFeedbackService);

  readonly mode = signal<AuthMode>('login');
  readonly loading = signal(false);
  readonly erro = signal<string | null>(null);

  /** Aviso legal exibido no rodapé do painel de arte (texto do design). */
  readonly disclaimer =
    'Este sistema é uma ferramenta de organização e acompanhamento vacinal. ' +
    'Não substitui orientação médica, a caderneta oficial de vacinação ou ' +
    'informações disponibilizadas pelo Ministério da Saúde.';

  readonly loginForm = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    senha: ['', [Validators.required, Validators.minLength(6)]],
    lembrar: [true],
  });

  readonly signupForm = this.fb.nonNullable.group({
    nome: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    senha: ['', [Validators.required, Validators.minLength(6)]],
    aceito: [true, [Validators.requiredTrue]],
  });

  readonly forgotForm = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
  });

  readonly titulo = computed(() => {
    switch (this.mode()) {
      case 'signup':
        return 'Criar conta';
      case 'forgot':
        return 'Recuperar senha';
      default:
        return 'Bem-vindo de volta';
    }
  });

  readonly subtitulo = computed(() => {
    switch (this.mode()) {
      case 'signup':
        return 'Leva menos de um minuto para começar.';
      case 'forgot':
        return 'Informe o e-mail da conta e enviaremos um link para criar uma nova senha.';
      default:
        return 'Entre para ver o calendário da sua família.';
    }
  });

  trocarModo(modo: AuthMode): void {
    this.erro.set(null);
    this.mode.set(modo);
  }

  /** `true` quando o campo deve exibir erro (inválido e já tocado/alterado). */
  invalido(form: FormGroup, campo: string): boolean {
    const control = form.get(campo);
    return !!control && control.invalid && (control.touched || control.dirty);
  }

  async entrar(): Promise<void> {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }
    await this.executar(async () => {
      const { email, senha } = this.loginForm.getRawValue();
      await this.auth.login(email, senha);
      await this.router.navigateByUrl('/app');
      await this.ui.sucesso('Bem-vindo de volta!');
    });
  }

  async cadastrar(): Promise<void> {
    if (this.signupForm.invalid) {
      this.signupForm.markAllAsTouched();
      return;
    }
    await this.executar(async () => {
      const { nome, email, senha } = this.signupForm.getRawValue();
      await this.auth.signup(nome, email, senha);
      await this.router.navigateByUrl('/app');
      await this.ui.sucesso('Conta criada com sucesso!');
    });
  }

  async recuperar(): Promise<void> {
    if (this.forgotForm.invalid) {
      this.forgotForm.markAllAsTouched();
      return;
    }
    await this.executar(async () => {
      await this.auth.recuperarSenha(this.forgotForm.getRawValue().email);
      this.mode.set('sent');
    });
  }

  /** Envelopa uma ação assíncrona com loading + tradução de erro. */
  private async executar(acao: () => Promise<void>): Promise<void> {
    this.erro.set(null);
    this.loading.set(true);
    try {
      await acao();
    } catch (e) {
      this.erro.set(mensagemAuthErro(e));
    } finally {
      this.loading.set(false);
    }
  }
}
