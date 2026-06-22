import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  IonContent,
  IonIcon,
  ModalController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { addOutline } from 'ionicons/icons';
import { combineLatest, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

import { ActiveChildService } from '../../core/services/active-child.service';
import { ChildInput, ChildrenService } from '../../core/services/children.service';
import { ScheduleService } from '../../core/services/schedule.service';
import { UiFeedbackService } from '../../core/services/ui-feedback.service';
import { VaccinationService } from '../../core/services/vaccination.service';
import { mensagemFirestoreErro } from '../../core/utils/firestore-error';
import { Child } from '../../models';
import { ChildCardComponent } from '../../shared/components/child-card/child-card.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { ChildFormComponent } from '../../shared/modals/child-form/child-form.component';
import { ConfirmDialogComponent } from '../../shared/modals/confirm-dialog/confirm-dialog.component';

/** Cartão de criança com sua cobertura (% em dia). */
interface ChildCardVM {
  child: Child;
  percent: number;
}

/**
 * Página de crianças (T4.12): grade de `child-card` com cobertura + tile
 * "Adicionar" + `empty-state`. Cria/edita via `child-form` e exclui via
 * `confirm-dialog` (cascata no service). A lista e a cobertura reagem em tempo
 * real ao Firestore.
 */
@Component({
  selector: 'app-children',
  templateUrl: './children.page.html',
  styleUrls: ['./children.page.scss'],
  imports: [IonContent, IonIcon, ChildCardComponent, EmptyStateComponent],
})
export class ChildrenPage {
  private readonly childrenService = inject(ChildrenService);
  private readonly vaccination = inject(VaccinationService);
  private readonly schedule = inject(ScheduleService);
  private readonly modalCtrl = inject(ModalController);
  private readonly ui = inject(UiFeedbackService);
  readonly activeChild = inject(ActiveChildService);

  /** Crianças do usuário, cada uma com sua cobertura computada. */
  readonly cards = toSignal(
    this.childrenService.listarDoUsuario().pipe(
      switchMap((children) =>
        children.length
          ? combineLatest(
              children.map((child) =>
                this.vaccination.registrosDaCrianca(child.id).pipe(
                  map(
                    (records): ChildCardVM => ({
                      child,
                      percent: this.schedule.coverage(
                        this.schedule.dosesDaCrianca(child, records),
                      ).percentEmDia,
                    }),
                  ),
                ),
              ),
            )
          : of<ChildCardVM[]>([]),
      ),
    ),
    { initialValue: [] as ChildCardVM[] },
  );

  readonly vazio = computed(() => this.cards().length === 0);

  constructor() {
    addIcons({ 'add-outline': addOutline });
  }

  selecionar(child: Child): void {
    this.activeChild.selecionar(child);
  }

  async adicionar(): Promise<void> {
    const dados = await this.abrirForm();
    if (!dados) {
      return;
    }
    await this.persistir(
      () => this.childrenService.criar(dados),
      `${dados.nome} adicionada.`,
    );
  }

  async editar(child: Child): Promise<void> {
    const dados = await this.abrirForm(child);
    if (!dados) {
      return;
    }
    await this.persistir(
      () => this.childrenService.atualizar(child.id, dados),
      'Dados atualizados.',
    );
  }

  async excluir(child: Child): Promise<void> {
    const modal = await this.modalCtrl.create({
      component: ConfirmDialogComponent,
      cssClass: 'vk-confirm',
      componentProps: {
        titulo: 'Excluir perfil',
        mensagem: 'Tem certeza que deseja excluir ',
        destaque: child.nome,
        sufixo: '? Esta ação não pode ser desfeita.',
        confirmarLabel: 'Excluir',
        variante: 'excluir',
      },
    });
    await modal.present();
    const { data } = await modal.onWillDismiss<boolean>();
    if (data === true) {
      await this.persistir(
        () => this.childrenService.excluir(child.id),
        `${child.nome} removida.`,
      );
    }
  }

  private async abrirForm(child?: Child): Promise<ChildInput | null> {
    const modal = await this.modalCtrl.create({
      component: ChildFormComponent,
      cssClass: 'vk-modal-child',
      componentProps: child ? { child } : undefined,
    });
    await modal.present();
    const { data, role } = await modal.onWillDismiss<ChildInput>();
    return role === 'save' && data ? data : null;
  }

  private async persistir(acao: () => Promise<unknown>, sucesso: string): Promise<void> {
    try {
      await this.ui.comCarregando('Salvando...', acao);
      await this.ui.sucesso(sucesso);
    } catch (e) {
      await this.ui.erro(mensagemFirestoreErro(e));
    }
  }
}
