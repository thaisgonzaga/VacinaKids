import { Injectable, inject } from '@angular/core';
import { LoadingController, ToastController } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { alertCircle, checkmarkCircle } from 'ionicons/icons';

/**
 * Feedback de UI centralizado (PLANO §6): toasts (sucesso verde / erro laranja)
 * e loading bloqueante. Mantém um único lugar para o estilo e a duração dos
 * toasts, reusado por páginas e modais nos fluxos da Fase 4/5.
 */
@Injectable({ providedIn: 'root' })
export class UiFeedbackService {
  private readonly toastCtrl = inject(ToastController);
  private readonly loadingCtrl = inject(LoadingController);

  constructor() {
    // Os ícones dos toasts precisam estar no registro global do ionicons.
    addIcons({ 'checkmark-circle': checkmarkCircle, 'alert-circle': alertCircle });
  }

  /** Toast verde de sucesso. */
  async sucesso(mensagem: string): Promise<void> {
    await this.toast(mensagem, 'primary', 'checkmark-circle', 2200);
  }

  /** Toast laranja de erro. */
  async erro(mensagem: string): Promise<void> {
    await this.toast(mensagem, 'orange', 'alert-circle', 3200);
  }

  /**
   * Executa uma ação assíncrona com um overlay de loading, garantindo o
   * `dismiss` mesmo em caso de erro.
   */
  async comCarregando<T>(mensagem: string, acao: () => Promise<T>): Promise<T> {
    const loading = await this.loadingCtrl.create({
      message: mensagem,
      spinner: 'crescent',
    });
    await loading.present();
    try {
      return await acao();
    } finally {
      await loading.dismiss();
    }
  }

  private async toast(
    message: string,
    color: string,
    icon: string,
    duration: number,
  ): Promise<void> {
    const t = await this.toastCtrl.create({
      message,
      duration,
      color,
      icon,
      position: 'bottom',
      cssClass: 'vk-toast',
    });
    await t.present();
  }
}
