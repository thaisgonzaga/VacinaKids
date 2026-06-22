import { Injectable, inject } from '@angular/core';
import {
  CollectionReference,
  Firestore,
  collection,
  collectionData,
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { Campaign } from '../../models';

/**
 * Leitura da coleção global `campaigns` (PLANO §3/§4). Somente leitura no
 * cliente — o seed é feito via console/admin (T4.5). Ordena prioritárias
 * primeiro e, em seguida, pelo fim do período (encerra antes → topo) no
 * cliente, evitando exigir índice composto no Firestore.
 */
@Injectable({ providedIn: 'root' })
export class CampaignService {
  private readonly firestore = inject(Firestore);

  private get col(): CollectionReference {
    return collection(this.firestore, 'campaigns');
  }

  /** Todas as campanhas, prioritária(s) primeiro, depois por fim de período. */
  listar(): Observable<Campaign[]> {
    return (collectionData(this.col, { idField: 'id' }) as Observable<Campaign[]>).pipe(
      map((campanhas) => [...campanhas].sort(this.ordenar)),
    );
  }

  /** A campanha em destaque (hero), ou `null` se não houver nenhuma marcada. */
  prioritaria(): Observable<Campaign | null> {
    return this.listar().pipe(map((cs) => cs.find((c) => c.prioritaria) ?? null));
  }

  private ordenar(a: Campaign, b: Campaign): number {
    if (a.prioritaria !== b.prioritaria) {
      return a.prioritaria ? -1 : 1;
    }
    return a.periodoFim.localeCompare(b.periodoFim);
  }
}
