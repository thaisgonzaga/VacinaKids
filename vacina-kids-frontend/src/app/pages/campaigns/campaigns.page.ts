import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { IonContent } from '@ionic/angular/standalone';

import { CampaignService } from '../../core/services/campaign.service';
import { Campaign } from '../../models';
import { CampaignCardComponent } from '../../shared/components/campaign-card/campaign-card.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';

/**
 * Campanhas (T4.16): hero da campanha prioritária + grade das demais. Lê a
 * coleção global `campaigns` (read-only) via `CampaignService`, já ordenada
 * (prioritária primeiro).
 */
@Component({
  selector: 'app-campaigns',
  templateUrl: './campaigns.page.html',
  styleUrls: ['./campaigns.page.scss'],
  imports: [IonContent, CampaignCardComponent, EmptyStateComponent],
})
export class CampaignsPage {
  private readonly campaignService = inject(CampaignService);

  readonly campanhas = toSignal(this.campaignService.listar(), {
    initialValue: [] as Campaign[],
  });

  readonly hero = computed(() => this.campanhas().find((c) => c.prioritaria) ?? null);
  readonly demais = computed(() => this.campanhas().filter((c) => c !== this.hero()));
  readonly vazio = computed(() => this.campanhas().length === 0);
}
