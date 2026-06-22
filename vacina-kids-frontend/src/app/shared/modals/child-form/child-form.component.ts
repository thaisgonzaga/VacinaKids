import { Component, OnInit, computed, inject, signal } from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ModalController } from '@ionic/angular/standalone';

import { iniciais } from '../../../core/utils/date.utils';
import { Child } from '../../../models';
import { ChildInput } from '../../../core/services/children.service';

/**
 * Modal de cadastro/edição de criança (PLANO §6: `child-form`). Fiel ao
 * protótipo (`VacinaKids.dc.html`): card branco com header (avatar + iniciais +
 * subtítulo), `<input type="date">` nativo (`max=hoje`) e seletor de 6 cores.
 * Aberto via `ModalController` (`vk-modal-child`); resolve `onWillDismiss` com
 * `ChildInput` (role `save`).
 *
 * Recebe `child` por `componentProps` (propriedade plana — ver nota no
 * `confirm-dialog`); presente → modo edição.
 */
@Component({
  selector: 'app-child-form',
  templateUrl: './child-form.component.html',
  styleUrls: ['./child-form.component.scss'],
  imports: [ReactiveFormsModule],
})
export class ChildFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly modalCtrl = inject(ModalController);

  /** Criança em edição (via componentProps); ausente = criação. */
  child?: Child;

  /** Limite superior do `<input type="date">` — não nascer no futuro. */
  readonly hoje = new Date().toISOString().slice(0, 10);
  readonly cores = ['1', '2', '3', '4', '5', '6'];

  readonly form = this.fb.nonNullable.group({
    nome: ['', [Validators.required, Validators.minLength(2)]],
    dataNascimento: ['', [Validators.required]],
    corAvatar: ['1', [Validators.required]],
  });

  readonly edicao = signal(false);

  readonly titulo = computed(() => (this.edicao() ? 'Editar criança' : 'Nova criança'));
  readonly subtitulo = computed(() =>
    this.edicao() ? 'Atualize os dados do perfil.' : 'Cadastre um novo perfil para acompanhar.',
  );
  readonly salvarLabel = computed(() => (this.edicao() ? 'Salvar alterações' : 'Cadastrar criança'));

  /** Cor selecionada / iniciais do preview — derivados do form (CD do zone.js). */
  get corAtual(): string {
    return this.form.controls.corAvatar.value;
  }
  get preview(): string {
    return iniciais(this.form.controls.nome.value) || '?';
  }

  ngOnInit(): void {
    if (this.child) {
      this.edicao.set(true);
      this.form.setValue({
        nome: this.child.nome,
        dataNascimento: this.child.dataNascimento,
        corAvatar: this.child.corAvatar,
      });
    }
  }

  selecionarCor(cor: string): void {
    this.form.controls.corAvatar.setValue(cor);
  }

  invalido(campo: 'nome' | 'dataNascimento'): boolean {
    const c = this.form.controls[campo];
    return c.invalid && (c.touched || c.dirty);
  }

  fechar(): void {
    void this.modalCtrl.dismiss(null, 'cancel');
  }

  salvar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const dados: ChildInput = this.form.getRawValue();
    void this.modalCtrl.dismiss(dados, 'save');
  }
}
