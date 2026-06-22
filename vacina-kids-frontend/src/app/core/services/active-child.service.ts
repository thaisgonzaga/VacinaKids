import { Injectable, computed, signal } from '@angular/core';

import { Child } from '../../models';

/**
 * Mantém a criança atualmente selecionada no app (estado de UI, não persistido
 * no Firestore). PLANO §3: `signal<Child|null>` + persistência do `id` no
 * `localStorage` para sobreviver a reload.
 *
 * Não toca Firestore: recebe a lista de crianças (vinda do `ChildrenService`,
 * Fase 4) e reconcilia a seleção via {@link sincronizar}.
 */
@Injectable({ providedIn: 'root' })
export class ActiveChildService {
  private static readonly STORAGE_KEY = 'vk.activeChildId';

  private readonly _active = signal<Child | null>(null);

  /** Criança selecionada (somente leitura). */
  readonly active = this._active.asReadonly();

  /** id da criança ativa, ou `null` — conveniência para queries por criança. */
  readonly activeId = computed(() => this._active()?.id ?? null);

  /** Define a criança ativa e persiste (ou limpa) o id no `localStorage`. */
  selecionar(child: Child | null): void {
    this._active.set(child);
    if (child) {
      this.persistirId(child.id);
    } else {
      this.limparPersistencia();
    }
  }

  /**
   * Reconcilia a seleção com a lista mais recente do usuário (chamar sempre que
   * a lista mudar): mantém a ativa se ainda existir; senão tenta o id
   * persistido; senão cai na primeira da lista. Lista vazia → `null`.
   */
  sincronizar(children: readonly Child[]): void {
    if (children.length === 0) {
      this.selecionar(null);
      return;
    }
    const alvoId = this._active()?.id ?? this.idPersistido();
    const escolhida = children.find((c) => c.id === alvoId) ?? children[0];
    this.selecionar(escolhida);
  }

  private idPersistido(): string | null {
    try {
      return localStorage.getItem(ActiveChildService.STORAGE_KEY);
    } catch {
      // localStorage indisponível (modo privado / ambiente sem DOM).
      return null;
    }
  }

  private persistirId(id: string): void {
    try {
      localStorage.setItem(ActiveChildService.STORAGE_KEY, id);
    } catch {
      /* ignora: persistência é best-effort. */
    }
  }

  private limparPersistencia(): void {
    try {
      localStorage.removeItem(ActiveChildService.STORAGE_KEY);
    } catch {
      /* ignora. */
    }
  }
}
