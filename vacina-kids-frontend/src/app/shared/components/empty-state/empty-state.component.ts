import { Component, input, output } from '@angular/core';
import { IonButton, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { addOutline, fileTrayOutline } from 'ionicons/icons';

/**
 * Estado vazio reutilizável (PLANO §6: `empty-state(message, ctaLabel; action)`).
 * Ícone + título + mensagem e um CTA opcional. Apresentação pura.
 */
@Component({
  selector: 'app-empty-state',
  template: `
    <div class="empty">
      <span class="empty__icon"><ion-icon [name]="icon()" aria-hidden="true"></ion-icon></span>
      <p class="empty__title vk-title">{{ title() }}</p>
      <p class="empty__msg">{{ message() }}</p>
      @if (ctaLabel()) {
        <ion-button shape="round" (click)="action.emit()">
          <ion-icon slot="start" name="add-outline"></ion-icon>
          {{ ctaLabel() }}
        </ion-button>
      }
    </div>
  `,
  styles: `
    .empty {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      gap: 8px;
      padding: 40px 20px;
    }
    .empty__icon {
      display: grid;
      place-items: center;
      width: 68px;
      height: 68px;
      border-radius: 20px;
      background: var(--vk-border-3);
      color: var(--vk-text-3);
      font-size: 34px;
      margin-bottom: 4px;
    }
    .empty__title {
      margin: 0;
      font-size: 1.05rem;
      font-weight: 600;
      color: var(--vk-text);
    }
    .empty__msg {
      margin: 0 0 6px;
      max-width: 320px;
      color: var(--vk-text-2);
      font-size: 0.9rem;
      line-height: 1.4;
    }
  `,
  imports: [IonButton, IonIcon],
})
export class EmptyStateComponent {
  readonly icon = input('file-tray-outline');
  readonly title = input('Nada por aqui ainda');
  readonly message = input('');
  readonly ctaLabel = input<string | null>(null);

  readonly action = output<void>();

  constructor() {
    addIcons({ 'file-tray-outline': fileTrayOutline, 'add-outline': addOutline });
  }
}
