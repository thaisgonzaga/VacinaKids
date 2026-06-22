import { Injectable, inject } from '@angular/core';
import {
  Auth,
  EmailAuthProvider,
  User,
  UserCredential,
  createUserWithEmailAndPassword,
  reauthenticateWithCredential,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  updatePassword,
  updateProfile,
  user,
  verifyBeforeUpdateEmail,
} from '@angular/fire/auth';
import { Observable } from 'rxjs';

/**
 * Único service que toca `@angular/fire/auth` (PLANO §3). Expõe o estado de
 * autenticação reativo (`user$`, consumido pelos guards) e as operações de
 * conta. Mensagens de erro amigáveis ficam na camada de UI (Fase 5).
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly auth = inject(Auth);

  /** Estado de auth resolvido pelo Firebase (`null` = deslogado). */
  readonly user$: Observable<User | null> = user(this.auth);

  /** uid síncrono do usuário logado (ou `null`) — usado pelos services de dados. */
  currentUid(): string | null {
    return this.auth.currentUser?.uid ?? null;
  }

  /** Perfil síncrono (nome/e-mail) para prefill de formulários de conta. */
  perfil(): { nome: string; email: string } {
    const u = this.auth.currentUser;
    return { nome: u?.displayName ?? '', email: u?.email ?? '' };
  }

  login(email: string, senha: string): Promise<UserCredential> {
    return signInWithEmailAndPassword(this.auth, email, senha);
  }

  /** Cria a conta e grava o nome no perfil (`displayName`). */
  async signup(nome: string, email: string, senha: string): Promise<void> {
    const cred = await createUserWithEmailAndPassword(this.auth, email, senha);
    await updateProfile(cred.user, { displayName: nome });
  }

  recuperarSenha(email: string): Promise<void> {
    return sendPasswordResetEmail(this.auth, email);
  }

  logout(): Promise<void> {
    return signOut(this.auth);
  }

  /** Troca a senha reautenticando antes (exigência do Firebase). */
  async alterarSenha(senhaAtual: string, novaSenha: string): Promise<void> {
    const u = this.exigirUsuario();
    if (!u.email) {
      throw new Error('Conta sem e-mail para reautenticação.');
    }
    const cred = EmailAuthProvider.credential(u.email, senhaAtual);
    await reauthenticateWithCredential(u, cred);
    await updatePassword(u, novaSenha);
  }

  /**
   * Atualiza o perfil: nome (`displayName`) e, se um novo e-mail for informado,
   * dispara a verificação antes de efetivar a troca (o Firebase exige login
   * recente — a UI deve reautenticar/relogar quando necessário).
   */
  async atualizarConta(nome: string, email?: string): Promise<void> {
    const u = this.exigirUsuario();
    if (nome && nome !== u.displayName) {
      await updateProfile(u, { displayName: nome });
    }
    if (email && email !== u.email) {
      await verifyBeforeUpdateEmail(u, email);
    }
  }

  private exigirUsuario(): User {
    const u = this.auth.currentUser;
    if (!u) {
      throw new Error('Nenhum usuário autenticado.');
    }
    return u;
  }
}
