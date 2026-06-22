import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map, take } from 'rxjs/operators';

import { AuthService } from '../services/auth.service';

/**
 * Inverso do `authGuard`: barra rotas públicas (ex.: `/login`) para quem já
 * está logado. Mesma espera da primeira emissão de `user$` (`take(1)`) para
 * evitar a race do boot. Logado → redireciona para `/app`.
 */
export const publicOnlyGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  return auth.user$.pipe(
    take(1),
    map((u) => (u ? router.createUrlTree(['/app']) : true)),
  );
};
