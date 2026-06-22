import { Component, computed, input, output } from '@angular/core';
import { IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { createOutline, trashOutline } from 'ionicons/icons';

import { ageLabel, formatarDataBR, iniciais } from '../../../core/utils/date.utils';
import { Child } from '../../../models';

/**
 * Cartão de criança (PLANO §6: `child-card(child, coveragePercent; select/edit/remove)`).
 * Avatar, nome, nascimento/idade e progresso vacinal (barra na cor do avatar).
 * Botão "Selecionar" + ações editar/excluir. Apresentação pura (design §crianças).
 */
@Component({
  selector: 'app-child-card',
  templateUrl: './child-card.component.html',
  styleUrls: ['./child-card.component.scss'],
  imports: [IonIcon],
})
export class ChildCardComponent {
  readonly child = input.required<Child>();
  readonly coveragePercent = input(0);
  readonly active = input(false);

  // `selectChild`/`edit`/`remove`: `select` colidiria com o evento DOM nativo
  // (ESLint no-output-native), como `childChange` no child-switcher.
  readonly selectChild = output<Child>();
  readonly edit = output<Child>();
  readonly remove = output<Child>();

  readonly iniciais = computed(() => iniciais(this.child().nome));
  readonly idade = computed(() => ageLabel(this.child().dataNascimento));
  readonly nascimento = computed(() => formatarDataBR(this.child().dataNascimento));
  readonly cor = computed(() => `var(--vk-avatar-${this.child().corAvatar})`);
  readonly progresso = computed(() => Math.max(0, Math.min(100, this.coveragePercent())));

  constructor() {
    addIcons({ 'create-outline': createOutline, 'trash-outline': trashOutline });
  }
}
