# Plano de Implementação — VacinaKids (Ionic 8 + Angular 20 + Firebase)

## Contexto

O **VacinaKids** é um app que digitaliza o acompanhamento da vacinação infantil (foco 0–4 anos, Calendário Nacional 2026), calculando automaticamente o status de cada dose (Aplicada / Pendente / Atrasada / Futura), exibindo dashboard de cobertura, jornada vacinal, campanhas e detalhe de cada vacina. Toda a especificação está em `docs/` (requisitos, ADRs, estudo de caso) e o **design visual/funcional completo** está no protótipo Claude Design (`VacinaKids.dc.html` — artefato externo do projeto de design, **não versionado neste repositório**), que contém inclusive a lógica de referência, o catálogo de 28 vacinas do PNI e as regras de status.

Sobre essa base (Angular 20.3 standalone, Ionic 8, Capacitor 8, TypeScript strict, Karma/Jasmine) o produto foi **implementado por completo**: todas as fases 0–5 deste plano estão concluídas (ver `TAREFAS.md`). Este documento permanece como especificação de referência da arquitetura e das decisões — trechos redigidos no futuro do verbo ("a executar", "remover", "criar") devem ser lidos como registro do planejamento original, já realizado.

### Decisões já tomadas pelo usuário
1. **Autenticação:** Firebase Authentication **real** (e-mail/senha) — login, cadastro e recuperação de senha funcionais.
2. **Persistência:** **Firestore** desde o início.
3. **Fidelidade visual:** **componentes Ionic adaptados** (ion-card, ion-accordion, ion-modal, etc.) estilizados com a paleta — não replicar HTML/CSS cru pixel a pixel.
4. **Escopo:** **tudo do design** (todas as telas e modais).
5. **Regra de status:** lógica do design **com tolerância** (ver §2).
6. **Projeto Firebase:** usuário **ainda não tem** — o plano inclui os passos de criação no console; código preparado para receber a config via `environment`.
7. **Modelo de dados:** **por usuário (isolado por uid)** — crianças e registros vinculados ao uid; campanhas globais; catálogo PNI **estático** no app.

### Premissas confirmadas no código real
- **zone.js ATIVO** (`src/polyfills.ts`) — manter (não migrar para zoneless nesta fase).
- `tsconfig` com `strict`, `strictTemplates`, `noPropertyAccessFromIndexSignature` (tipar Firestore com interfaces concretas, sem `any`).
- AngularFire compatível: `@angular/fire@^20` + `firebase@^12` (peer deps batem: `@angular/core@^20`, `rxjs@~7.8`).
- `src/global.scss` importava `dark.system.css` → **removido** (T0.9) para travar light mode (fidelidade).
- `angular.json` já inclui `theme/variables.scss` em `styles`; budget `anyComponentStyle` 2kb warn / 4kb erro (cuidar de componentes muito estilizados).

---

## Arquitetura (estrutura de pastas sob `src/app`)

```
core/
  firebase/firebase.providers.ts      # providers AngularFire p/ main.ts
  guards/auth.guard.ts                # CanActivateFn: exige login
  guards/public-only.guard.ts         # logado → /app/dashboard
  services/auth.service.ts
  services/children.service.ts
  services/vaccination.service.ts
  services/campaign.service.ts
  services/schedule.service.ts        # núcleo: cruza catálogo×registros, sem Firestore direto
  services/active-child.service.ts    # criança selecionada (signal + localStorage)
  services/ui-feedback.service.ts     # toasts/loading
  utils/status.ts                     # computeStatus (função pura, ÚNICA regra de status)
  utils/status-visual.ts              # status → cor/ícone/label
  utils/date.utils.ts                 # addMonths, diffInDays, ageLabel, iniciais
models/                               # enums + interfaces (DTOs puros)
data/pni-2026.catalog.ts             # 28 itens estáticos do PNI 2026
shared/components/                    # status-badge, child-card, child-switcher, dose-item,
                                      # campaign-card, coverage-ring, indicator-card, empty-state,
                                      # vaccine-detail-drawer
shared/modals/                        # child-form, register-application, confirm-dialog,
                                      # edit-account, change-password
shared/services/                      # dose-registration.service (orquestra register-application + VaccinationService)
layout/shell/shell.page.ts           # ion-split-pane + ion-menu + header + outlet + bottom nav
pages/                                # auth, dashboard, children, journey, campaigns, settings
```

Tudo `standalone: true` (sem NgModules); "shared" é só organização. Usar a signal API do Angular 20 (`input()`/`output()`).

---

## 1. Models (POO / TypeScript)

- `VaccinationStatus` (enum): `Aplicada | Pendente | Atrasada | Futura`.
- `Child { id; uid; nome; dataNascimento /* ISO yyyy-mm-dd */; corAvatar; criadoEm }`.
- `VaccineCatalogItem { id; vaccine; dose; band; ageMonths; protects; why; when }` (espelha os 28 itens do design).
- `VaccinationRecord { id; uid; childId; catalogId; dataAplicacao /* ISO */; criadoEm }`.
- `VaccineDose { catalog; status; record?; dueDate }` — view-model **computado**, não persistido.
- `Campaign { id; titulo; descricao; publico; periodoInicio; periodoFim; prioritaria; icone }`.
- `Coverage { aplicadas; pendentes; atrasadas; futuras; total; percentEmDia }` e `JourneyBand { band; ageMonths; doses; aplicadas; total; statusAgregado }`.

`Child` é DTO puro; helpers (iniciais, idadeLabel) ficam em `date.utils.ts`.

## 2. Regra de status (fonte ÚNICA, testável)

`core/utils/status.ts` — função pura, `today` injetável para testes determinísticos:
```
computeStatus(dataNascimento, ageMonths, hasRecord, today = new Date()):
  se hasRecord → Aplicada
  due  = addMonths(dataNascimento, ageMonths)
  diff = diffInDays(today, due)
  diff > 30   → Atrasada
  diff > -60  → Pendente
  senão       → Futura
```
**Nenhum componente/service recalcula status** — todos chamam `computeStatus`. `status-visual.ts` mapeia cada status para os tons exatos do design (aplicada `#E9F0D6`/`#5E7A2E`, pendente `#FFF1D2`/`#B07D1F`, atrasada `#FFE2CF`/`#C2622F`, futura `#EDF2E2`/`#7E9A4E`) + ícone ionicons.

## 3. Services (`@Injectable({ providedIn: 'root' })`)

- **AuthService** — único a tocar `@angular/fire/auth`. `user$ = user(auth)`, `currentUid()`; `login`, `signup` (cria + `updateProfile(displayName)`), `recuperarSenha` (`sendPasswordResetEmail`), `logout`, `alterarSenha` (reautentica antes), `atualizarConta`.
- **ChildrenService** — coleção `children` sempre com `where('uid','==',uid)`. `listarDoUsuario()`, `criar`, `atualizar`, `excluir` (**cascata**: apaga `vaccinationRecords` da criança via `writeBatch`).
- **VaccinationService** — coleção `vaccinationRecords` (uid + childId). `registrosDaCrianca`, `registrar`, `removerRegistro`.
- **CampaignService** — coleção global `campaigns` (somente leitura). `listar`, `prioritaria`.
- **ScheduleService** — **domínio puro, sem Firestore**: importa o catálogo estático (não injeta `VaccinationService`). `dosesDaCrianca`, `bands`, `coverage`, `proximasVacinas(limit=4)` (métodos síncronos recebendo arrays → testáveis) e `journey$(child, records$, today?)`, que mapeia (via `map`) o stream de registros injetado pela página a partir de `VaccinationService.registrosDaCrianca(child.id)` — mantém o domínio livre de Firestore (desvio consciente, TAREFAS T1.8).
- **ActiveChildService** — `signal<Child|null>` + persiste `id` no `localStorage`.

**Isolamento:** só esses 4 services de dados importam `firebase/*`. Páginas consomem observables/signals tipados → fáceis de mockar nos specs.

## 4. Firebase — integração e console

**Usar AngularFire** (não SDK puro): providers `provideX` alinhados ao padrão do projeto, DI mockável nos testes, observables RxJS nativos.

`main.ts` recebe (encapsular em `core/firebase/firebase.providers.ts`):
```ts
provideFirebaseApp(() => initializeApp(environment.firebase)),
provideAuth(() => getAuth()),
provideFirestore(() => getFirestore()),
```
`environment.ts` / `environment.prod.ts` ganham bloco `firebase: { apiKey, authDomain, projectId, storageBucket, messagingSenderId, appId }` (placeholders).

**Passos no console (já executados — projeto `vacina-kids-94e19`):** criar projeto → Authentication → habilitar **Email/Password** → Firestore (production mode, região `southamerica-east1`) → registrar Web App e copiar config para os environments → publicar regras → criar docs de `campaigns` (via console ou o script admin `scripts/seed-campaigns.mjs`, já que write do cliente é negado).

**Regras de segurança (isolamento por uid):**
```
match /children/{id} {
  allow read, delete: if request.auth.uid == resource.data.uid;
  allow create:       if request.auth.uid == request.resource.data.uid;
  allow update:       if request.auth.uid == resource.data.uid
                      && request.auth.uid == request.resource.data.uid;
}
match /vaccinationRecords/{id} { /* mesmas regras por uid */ }
match /campaigns/{id} { allow read: if request.auth != null; allow write: if false; }
```

## 5. Roteamento, guards e shell

`app.routes.ts`: `/login` (público, `publicOnlyGuard`) e `/app` (protegido, `authGuard`) com filhos `dashboard|children|journey|campaigns|settings` (lazy `loadComponent`), default → `dashboard`. Guards usam `AuthService.user$` aguardando a primeira emissão com `take(1)` para evitar race no boot (o `filter` é dispensável: `user(auth)` nunca emite `undefined` — ver TAREFAS T2.2).

**Shell responsivo único:** `ion-split-pane when="lg"` + `ion-menu` (logo + 5 itens + card de suporte). Tablet (`md`) → menu vira faixa de ícones (CSS). Mobile → menu oculto + bottom nav própria. Header custom: kicker+título por rota, sino com dot, `child-switcher`.

## 6. Páginas e componentes (Ionic adaptado)

| Tela | Ionic usado | Componentes |
|---|---|---|
| auth | ion-input, ion-button, ion-checkbox, ReactiveForms | signal `'login'|'signup'|'forgot'|'sent'`; arte some no mobile |
| dashboard | grid, ion-card | banner atrasadas (condicional), `coverage-ring`, 4× `indicator-card`, próximas vacinas (`dose-item`) |
| children | ion-card, ion-progress-bar, ion-grid | `child-card` + card "Adicionar" + `empty-state` |
| journey | ion-accordion-group/ion-accordion | header com resumo + `status-badge`; `dose-item` (Detalhes→drawer, Registrar) |
| campaigns | ion-card | hero prioritária + `campaign-card` |
| settings | ion-accordion-group | modais edit-account/change-password + Sair (`confirm-dialog`) |

**Componentes** (inputs/outputs via signal API): `status-badge(status)`; `child-card(child, coveragePercent; select/edit/remove)`; `child-switcher(children, active; change/manage)` com `ion-popover`; `dose-item(dose; details/register)`; `campaign-card(campaign)`; `coverage-ring(percent, size)`; `indicator-card(label,value,status)`; `empty-state(message,ctaLabel; action)`; `vaccine-detail-drawer(dose; register)`.

**Modais via `ModalController`** (reuso entre páginas): `child-form` (ion-datetime `max=hoje` + seletor de 6 cores), `register-application` (bottom-sheet com breakpoints no mobile), `confirm-dialog` genérico (exclusão/logout), `edit-account`, `change-password`.

**Detalhes visuais:** donut = SVG puro (2 círculos, `stroke-dasharray/offset`, `rotate(-90)`, `transition` na cobertura); drawer = `ion-modal` posicionado à direita via CSS (`--width:420px` desktop / `100%` mobile); toast = `ToastController` verde.

## 7. Tema (`theme/variables.scss`)

Mapear paleta: `--ion-color-primary:#ABC270`, `--ion-color-warning:#FEC868`, cor custom `orange:#FDA769` (atrasada/campanhas), `--ion-text-color:#473C33`, `--ion-background-color:#ECE7DC`, superfície `#FBFAF6`, bordas `#F0EBE1/#EAE3D6/#F4F0E8`, texto 2/3 `#8A8175/#A39C8E`, tokens de status, 6 cores de avatar. Importar **Poppins** (500/600/700) e **Inter** (400/500/600) — preferir `<link>` em `index.html`; `--ion-font-family:'Inter'` + `.vk-title{font-family:'Poppins'}`. Em `global.scss`: **remover import de dark mode**.

## 8. Testes (≥3, foco em status)

`status.spec.ts` (função pura, sem TestBed), `today` fixo: (1) Aplicada com registro; (2) Atrasada `diff=31`; (3) borda `diff=30`→Pendente; (4) `diff=0`→Pendente; (5) bordas `-60`→Futura e `-59`→Pendente; (6) Futura. `schedule.service.spec.ts` (TestBed, mock VaccinationService): `coverage()` e `bands()`. Seguir padrão dos specs existentes.

## 9. Responsividade

Breakpoints: mobile `<768`, tablet `768–991` (`md`), desktop `≥992` (`lg`). `ion-split-pane when="lg"`; tablet = menu de ícones; mobile = bottom nav. `ion-grid` com `size-md/size-lg` (crianças 3/2/1 col; dashboard 4→2×2→coluna). Auth: arte some no mobile. Modais: forms centrais desktop, bottom-sheet mobile; drawer 420px/100%. Respeitar safe-areas Capacitor.

---

## Ordem de implementação (fases / commits semânticos)

- **Fase 0 — Fundação** (`chore: setup firebase + theme`): instalar deps, criar projeto Firebase, `firebase.providers.ts` + `main.ts`, `variables.scss` (paleta/fontes), remover dark mode, publicar regras.
- **Fase 1 — Domínio** (`feat: models, catalog, status logic`): models/enum, `pni-2026.catalog.ts`, utils, **specs de `computeStatus`** (TDD), `ScheduleService` + spec.
- **Fase 2 — Auth** (`feat: auth flow and guards`): `AuthService`, guards, `app.routes.ts`, `auth.page`.
- **Fase 3 — Shell** (`feat: responsive app shell`): `shell.page`, `ActiveChildService`, `child-switcher`.
- **Fase 4 — Telas+dados** (commit por tela): children+child-form+empty-state → register-application → journey+drawer → dashboard → campaigns → settings+modais+logout.
- **Fase 5 — Acabamento** (`polish: responsive + toasts + a11y`): responsividade fina, toasts/loading, erros de auth/Firestore, Lighthouse ≥80.

## Riscos / pontos de atenção

- **Timezone/datas:** persistir nascimento como `yyyy-mm-dd`; um único helper de parsing (UTC/meia-noite consistente) em `addMonths`/`diffInDays` — `ion-datetime` retorna ISO com offset e mistura causa ±1 dia nas bordas 30/-60.
- **addMonths overflow** (31/01→clamp no último dia do mês destino).
- **Race do guard no boot:** aguardar primeira emissão definida de `user$`; disparar queries Firestore só com `uid` presente (`switchMap` a partir de `user$`).
- **Exclusão em cascata** de registros (writeBatch); **tipagem Firestore** com interfaces (por `noPropertyAccessFromIndexSignature`).
- **Seed de campanhas** via console/admin (write do cliente negado) — documentar no entregável.
- Manter **zone.js**; budget de CSS por componente (mover estilo compartilhado p/ global).

---

## Verificação (fim-a-fim)

1. `npm test` (Karma/Jasmine) — todos os specs de status/schedule passando (≥6 casos, bordas 30/-60).
2. `npm run build` (ou `ng build`) — produção sem erros, dentro dos budgets.
3. `ionic serve` / `npm start` e validar manualmente os 4 cenários do desafio:
   - **Jornada** mostra doses aplicadas × pendentes por faixa etária (accordion).
   - **Atrasada** com alerta no dashboard, identificável em ≤2 toques.
   - **Campanhas** ativas listadas (hero + cards).
   - **Multi-filhos**: troca de perfil isola os dados por criança.
4. Auth real: cadastrar usuário, logout, login, recuperar senha (e-mail do Firebase chega); confirmar isolamento por uid (dados de um usuário não aparecem para outro).
5. Firestore: criar/editar/excluir criança e registrar dose refletem no console Firebase e sobrevivem a reload.
6. Responsividade nas 3 larguras (desktop/tablet/mobile) com sidebar→ícones→bottom nav.
7. (Meta) Lighthouse mobile ≥80 em Performance e Acessibilidade.
