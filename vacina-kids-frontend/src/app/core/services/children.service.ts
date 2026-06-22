import { Injectable, inject } from '@angular/core';
import {
  CollectionReference,
  Firestore,
  addDoc,
  collection,
  collectionData,
  deleteDoc,
  doc,
  getDocs,
  query,
  updateDoc,
  where,
  writeBatch,
} from '@angular/fire/firestore';
import { Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import { Child } from '../../models';
import { AuthService } from './auth.service';

/** Campos editáveis de uma criança (sem id/uid/criadoEm, controlados pelo service). */
export type ChildInput = Pick<Child, 'nome' | 'dataNascimento' | 'corAvatar'>;

/**
 * CRUD da coleção `children`, sempre isolada por `uid` (PLANO §3/§4). Um dos
 * quatro únicos services que tocam `firebase/*`. A leitura parte de
 * `AuthService.user$` (`switchMap`) para só consultar com `uid` presente,
 * evitando a race do boot. A exclusão apaga em **cascata** os
 * `vaccinationRecords` da criança via `writeBatch`.
 */
@Injectable({ providedIn: 'root' })
export class ChildrenService {
  private readonly firestore = inject(Firestore);
  private readonly auth = inject(AuthService);

  private get col(): CollectionReference {
    return collection(this.firestore, 'children');
  }

  /** Stream das crianças do usuário logado (vazio enquanto deslogado). */
  listarDoUsuario(): Observable<Child[]> {
    return this.auth.user$.pipe(
      switchMap((u) => {
        if (!u) {
          return of<Child[]>([]);
        }
        const q = query(this.col, where('uid', '==', u.uid));
        return collectionData(q, { idField: 'id' }) as Observable<Child[]>;
      }),
    );
  }

  /** Cria a criança vinculada ao usuário logado; resolve com o novo id. */
  async criar(dados: ChildInput): Promise<string> {
    const uid = this.exigirUid();
    const ref = await addDoc(this.col, {
      ...dados,
      uid,
      criadoEm: new Date().toISOString(),
    });
    return ref.id;
  }

  /** Atualiza os campos editáveis de uma criança existente. */
  atualizar(id: string, dados: Partial<ChildInput>): Promise<void> {
    return updateDoc(doc(this.firestore, 'children', id), { ...dados });
  }

  /**
   * Exclui a criança e, em cascata, todos os seus registros de vacinação —
   * tudo num único `writeBatch` (atômico). PLANO §3.
   */
  async excluir(id: string): Promise<void> {
    const uid = this.exigirUid();
    const batch = writeBatch(this.firestore);
    batch.delete(doc(this.firestore, 'children', id));

    const registrosQ = query(
      collection(this.firestore, 'vaccinationRecords'),
      where('uid', '==', uid),
      where('childId', '==', id),
    );
    const snap = await getDocs(registrosQ);
    snap.forEach((d) => batch.delete(d.ref));

    await batch.commit();
  }

  private exigirUid(): string {
    const uid = this.auth.currentUid();
    if (!uid) {
      throw new Error('Nenhum usuário autenticado.');
    }
    return uid;
  }
}
