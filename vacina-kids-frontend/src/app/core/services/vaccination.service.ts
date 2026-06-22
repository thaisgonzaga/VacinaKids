import { Injectable, inject } from '@angular/core';
import {
  CollectionReference,
  Firestore,
  addDoc,
  collection,
  collectionData,
  deleteDoc,
  doc,
  query,
  where,
} from '@angular/fire/firestore';
import { Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import { VaccinationRecord } from '../../models';
import { AuthService } from './auth.service';

/**
 * CRUD da coleção `vaccinationRecords` (uid + childId) — PLANO §3. Um dos
 * quatro services que tocam `firebase/*`. A leitura parte de `user$`
 * (`switchMap`) para só consultar com `uid` presente. Alimenta o
 * `ScheduleService.journey$`, que cruza estes registros com o catálogo.
 */
@Injectable({ providedIn: 'root' })
export class VaccinationService {
  private readonly firestore = inject(Firestore);
  private readonly auth = inject(AuthService);

  private get col(): CollectionReference {
    return collection(this.firestore, 'vaccinationRecords');
  }

  /** Stream dos registros de uma criança (vazio enquanto deslogado). */
  registrosDaCrianca(childId: string): Observable<VaccinationRecord[]> {
    return this.auth.user$.pipe(
      switchMap((u) => {
        if (!u) {
          return of<VaccinationRecord[]>([]);
        }
        const q = query(
          this.col,
          where('uid', '==', u.uid),
          where('childId', '==', childId),
        );
        return collectionData(q, { idField: 'id' }) as Observable<VaccinationRecord[]>;
      }),
    );
  }

  /** Registra a aplicação de uma dose do catálogo; resolve com o novo id. */
  async registrar(
    childId: string,
    catalogId: string,
    dataAplicacao: string,
  ): Promise<string> {
    const uid = this.exigirUid();
    const ref = await addDoc(this.col, {
      uid,
      childId,
      catalogId,
      dataAplicacao,
      criadoEm: new Date().toISOString(),
    });
    return ref.id;
  }

  /** Remove um registro de aplicação (desfaz "Aplicada"). */
  removerRegistro(recordId: string): Promise<void> {
    return deleteDoc(doc(this.firestore, 'vaccinationRecords', recordId));
  }

  private exigirUid(): string {
    const uid = this.auth.currentUid();
    if (!uid) {
      throw new Error('Nenhum usuário autenticado.');
    }
    return uid;
  }
}
