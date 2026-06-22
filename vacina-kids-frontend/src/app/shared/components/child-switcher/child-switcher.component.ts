import { Component, computed, input, output } from '@angular/core';
import { IonIcon, IonPopover } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { addOutline, chevronDownOutline, peopleOutline } from 'ionicons/icons';

import { ageLabel, iniciais } from '../../../core/utils/date.utils';
import { Child } from '../../../models';

/** Mínimo necessário para fechar o popover (testável sem instância real). */
type Dismissible = { dismiss(): unknown };

/**
 * Seletor da criança ativa, exibido no header do shell. Mostra a criança atual
 * (avatar + nome + idade) e abre um `ion-popover` para trocar ou ir gerenciar.
 * PLANO §6: `child-switcher(children, active; change/manage)`.
 *
 * Apenas apresentação: não conhece `ActiveChildService` nem rotas — o shell
 * liga os outputs.
 */
@Component({
  selector: 'app-child-switcher',
  templateUrl: './child-switcher.component.html',
  styleUrls: ['./child-switcher.component.scss'],
  imports: [IonIcon, IonPopover],
})
export class ChildSwitcherComponent {
  readonly children = input<readonly Child[]>([]);
  readonly active = input<Child | null>(null);

  // `childChange` (não `change`) p/ não colidir com o evento DOM nativo (ESLint
  // no-output-native). Semântica do PLANO §6 (`change`) preservada.
  readonly childChange = output<Child>();
  readonly manage = output<void>();

  /** id fixo do gatilho (só há um switcher no header). */
  readonly triggerId = 'vk-child-switcher-trigger';

  readonly rotuloAtivo = computed(() => {
    const a = this.active();
    return a ? `Criança ativa: ${a.nome}` : 'Selecionar criança';
  });

  constructor() {
    addIcons({
      'chevron-down-outline': chevronDownOutline,
      'people-outline': peopleOutline,
      'add-outline': addOutline,
    });
  }

  iniciais(nome: string): string {
    return iniciais(nome);
  }

  idade(child: Child): string {
    return ageLabel(child.dataNascimento);
  }

  /** Cor de avatar a partir da chave 1..6 da paleta. */
  cor(child: Child): string {
    return `var(--vk-avatar-${child.corAvatar})`;
  }

  selecionar(child: Child, pop: Dismissible): void {
    this.childChange.emit(child);
    pop.dismiss();
  }

  gerenciar(pop: Dismissible): void {
    this.manage.emit();
    pop.dismiss();
  }
}
