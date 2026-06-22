import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map, take } from 'rxjs/operators';

import { AuthService } from '../services/auth.service';

/**
 * Protege as rotas privadas. Aguarda a PRIMEIRA emissão de `user$` — o estado
 * de auth já resolvido pelo Firebase — com `take(1)`, evitando a race do boot
 * em que `auth.currentUser` ainda é `null` antes da persistência ser restaurada.
 * Deslogado → redireciona para `/login`.
 */
export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  return auth.user$.pipe(
    take(1),
    map((u) => (u ? true : router.createUrlTree(['/login']))),
  );
};
