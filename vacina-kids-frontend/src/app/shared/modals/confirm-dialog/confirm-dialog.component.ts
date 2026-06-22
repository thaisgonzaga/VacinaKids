import { Component, inject } from '@angular/core';
import { ModalController } from '@ionic/angular/standalone';

/** Define ícone, cor do ícone e cor do CTA conforme o protótipo. */
export type ConfirmVariante = 'excluir' | 'sair';

/**
 * Diálogo de confirmação genérico (PLANO §6) — exclusão, logout, etc. Aberto via
 * `ModalController` (classe `vk-dialog`); resolve `onWillDismiss` com `true`
 * (role `confirm`) ou `false` (role `cancel`).
 *
 * Layout fiel ao protótipo: ícone à esquerda em quadrado arredondado, título +
 * mensagem alinhados à esquerda e dois botões nativos (Cancelar outline + CTA).
 * A `variante` escolhe o ícone (lixeira/sair), o tom do ícone e a cor do CTA.
 *
 * Recebe os textos por `componentProps` (propriedades planas, não `input()`:
 * `ModalController` atribui direto na instância, o que signal-inputs read-only
 * não permitem). `destaque`/`sufixo` permitem destacar um trecho da mensagem em
 * negrito (ex.: o nome da criança).
 */
@Component({
  selector: 'app-confirm-dialog',
  templateUrl: './confirm-dialog.component.html',
  styleUrls: ['./confirm-dialog.component.scss'],
})
export class ConfirmDialogComponent {
  private readonly modalCtrl = inject(ModalController);

  titulo = 'Confirmar';
  mensagem = '';
  /** Trecho em negrito no meio da mensagem (ex.: nome da criança). */
  destaque = '';
  /** Texto que segue o `destaque`. */
  sufixo = '';
  confirmarLabel = 'Confirmar';
  cancelarLabel = 'Cancelar';
  variante: ConfirmVariante = 'excluir';

  cancelar(): void {
    void this.modalCtrl.dismiss(false, 'cancel');
  }

  confirmar(): void {
    void this.modalCtrl.dismiss(true, 'confirm');
  }
}
