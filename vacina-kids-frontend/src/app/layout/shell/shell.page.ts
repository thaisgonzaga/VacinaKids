import { Component, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import {
  NavigationEnd,
  Router,
  RouterLink,
  RouterLinkActive,
} from '@angular/router';
import {
  IonContent,
  IonMenu,
  IonRouterOutlet,
  IonSplitPane,
} from '@ionic/angular/standalone';
import { filter, map } from 'rxjs';

import { ActiveChildService } from '../../core/services/active-child.service';
import { ChildrenService } from '../../core/services/children.service';
import { Child } from '../../models';
import { ChildSwitcherComponent } from '../../shared/components/child-switcher/child-switcher.component';

/**
 * Item de navegação: rota, rótulos (sidebar full + bottom nav curto), `iconPath`
 * SVG (traço, igual ao design) e textos do header.
 */
interface NavItem {
  readonly path: string;
  /** Rótulo completo da sidebar (desktop). */
  readonly label: string;
  /** Rótulo curto da navegação inferior (mobile). */
  readonly short: string;
  /** `d` do path do ícone SVG (viewBox 0 0 24 24, traço). */
  readonly iconPath: string;
  readonly kicker: string;
  readonly titulo: string;
  /** Quando true, o kicker é um cumprimento (caixa normal) em vez de eyebrow maiúsculo. */
  readonly greeting?: boolean;
}

/**
 * Shell responsivo único (PLANO §5): `ion-split-pane when="md"` + `ion-menu`
 * (marca + 5 itens) + header custom (kicker/título por rota,
 * `child-switcher`) + `ion-router-outlet` + bottom nav no mobile.
 * Tablet (md) → menu vira faixa de ícones (CSS); mobile → menu oculto + bottom nav.
 */
@Component({
  selector: 'app-shell',
  templateUrl: './shell.page.html',
  styleUrls: ['./shell.page.scss'],
  imports: [
    RouterLink,
    RouterLinkActive,
    IonSplitPane,
    IonMenu,
    IonContent,
    IonRouterOutlet,
    ChildSwitcherComponent,
  ],
})
export class ShellPage {
  private readonly router = inject(Router);
  private readonly childrenService = inject(ChildrenService);
  readonly activeChild = inject(ActiveChildService);

  // Rótulos e `iconPath` espelham o design autoritativo (VacinaKids.dc.html →
  // `navDef`): sidebar usa o rótulo completo, a bottom nav o curto, e os ícones
  // são os SVGs de traço do protótipo (não ionicons).
  readonly nav: readonly NavItem[] = [
    { path: 'dashboard', label: 'Dashboard', short: 'Início', iconPath: 'M3 11.5L12 4l9 7.5M5 10v10h14V10', kicker: 'Olá, acompanhe o calendário', titulo: 'Dashboard', greeting: true },
    { path: 'children', label: 'Crianças', short: 'Crianças', iconPath: 'M16 13.5a3.5 3.5 0 10-8 0M12 9.5a2.8 2.8 0 100-5.6 2.8 2.8 0 000 5.6M4 20c.6-3 4-4.5 8-4.5s7.4 1.5 8 4.5', kicker: 'Perfis', titulo: 'Minhas crianças' },
    { path: 'journey', label: 'Jornada Vacinal', short: 'Jornada', iconPath: 'M9 6h11M9 12h11M9 18h11M4.5 6h.01M4.5 12h.01M4.5 18h.01', kicker: 'Calendário', titulo: 'Jornada vacinal' },
    { path: 'campaigns', label: 'Campanhas', short: 'Campanhas', iconPath: 'M3 11v2a1 1 0 001 1h2l5 4V6L6 10H4a1 1 0 00-1 1zM15 8.5a4 4 0 010 7M18.5 5.5a8 8 0 010 13', kicker: 'Saúde pública', titulo: 'Campanhas' },
    { path: 'settings', label: 'Configurações', short: 'Ajustes', iconPath: 'M4 7h9M17 7h3M4 17h3M11 17h9M14.5 4.5v5M7.5 12.5v5', kicker: 'Conta e preferências', titulo: 'Configurações' },
  ];

  /**
   * Lista de crianças do usuário (stream do `ChildrenService`). Alimenta o
   * `child-switcher` e reconcilia a criança ativa a cada mudança — atualizações
   * de CRUD chegam em tempo real via Firestore (T4.12).
   */
  readonly children = signal<readonly Child[]>([]);

  private readonly url = toSignal(
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      map((e) => e.urlAfterRedirects),
    ),
    { initialValue: this.router.url },
  );

  /** Item de navegação ativo (deriva kicker/título do header). */
  readonly navAtual = computed(() => {
    const url = this.url();
    return this.nav.find((n) => url.includes(`/app/${n.path}`)) ?? this.nav[0];
  });

  constructor() {
    this.childrenService
      .listarDoUsuario()
      .pipe(takeUntilDestroyed())
      .subscribe((lista) => {
        this.children.set(lista);
        this.activeChild.sincronizar(lista);
      });
  }

  trocarCrianca(child: Child): void {
    this.activeChild.selecionar(child);
  }

  gerenciarCriancas(): void {
    void this.router.navigateByUrl('/app/children');
  }
}
