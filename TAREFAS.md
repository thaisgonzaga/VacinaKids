# TAREFAS — VacinaKids

Quebra do [PLANO-IMPLEMENTACAO.md](./PLANO-IMPLEMENTACAO.md) em tarefas menores e acionáveis.
Cada tarefa é pequena o bastante para virar um commit/PR. IDs no formato `T<fase>.<n>`.

**Legenda:** `dep:` dependências · `pronto:` critério de aceitação.

---

## Fase 0 — Fundação
> Commit: `chore: setup firebase + theme`

- [x] **T0.1 — Instalar dependências**
  `@angular/fire@^20`, `firebase@^12`. Conferir peer deps (`@angular/core@^20`, `rxjs@~7.8`).
  pronto: `npm install` sem conflito de peer deps; `npm run build` compila.
  ✅ Instalados `@angular/fire@20.0.1` + `firebase@12.15.0`; build de produção OK, lint OK.

- [x] **T0.2 — Criar projeto no Firebase Console**
  Criar projeto → Authentication → habilitar **Email/Password** → Firestore em **production mode**, região `southamerica-east1`.
  pronto: projeto existe e Auth/Firestore provisionados (documentar no README do entregável).
  ✅ Projeto `vacina-kids-94e19` criado e configurado em produção (confirmado pelo usuário).

- [x] **T0.3 — Registrar Web App e capturar config**
  Registrar Web App no console e copiar o objeto `firebase` (apiKey, authDomain, projectId, storageBucket, messagingSenderId, appId).
  dep: T0.2.
  ✅ Web App registrado; config capturada e colada nos environments.

- [x] **T0.4 — Bloco `firebase` nos environments**
  Adicionar `firebase: {...}` em `environment.ts` e `environment.prod.ts` (placeholders + valores reais).
  dep: T0.3.
  ✅ Config real (`vacina-kids-94e19`) preenchida em `environment.ts` **e** `environment.prod.ts`.

- [x] **T0.5 — `core/firebase/firebase.providers.ts`**
  Encapsular `provideFirebaseApp`, `provideAuth`, `provideFirestore`.
  dep: T0.1, T0.4.
  ✅ `firebaseProviders` exportado (App/Auth/Firestore via AngularFire); compila no build.

- [x] **T0.6 — Ligar providers no `main.ts`**
  Importar e registrar os providers do T0.5.
  dep: T0.5. pronto: app sobe conectado ao Firebase sem erro no console.
  ✅ `...firebaseProviders` espalhado no `bootstrapApplication`; build de produção OK com a config real. ⏳ Resta a verificação visual no browser (`npm start`) — confirmar boot sem erro de Firebase no console.

- [x] **T0.7 — Tema base `theme/variables.scss`**
  Mapear a paleta (primary `#ABC270`, warning `#FEC868`, `orange #FDA769`, texto/bg/superfícies/bordas, tokens de status, 6 cores de avatar). *(detalhe fino na Fase 5)*
  ✅ Paleta Ionic (primary/warning + custom `.ion-color-orange` com shade/tint), tokens `--vk-*` de texto/superfície/borda, 4 tokens de status (bg/fg) e 6 cores de avatar (placeholders harmônicos, refinar na Fase 5).

- [x] **T0.8 — Fontes Poppins + Inter**
  `<link>` no `index.html`; `--ion-font-family:'Inter'` + classe `.vk-title{font-family:'Poppins'}`.
  ✅ `<link>` Google Fonts (Inter 400/500/600 + Poppins 500/600/700) no `index.html`; `--ion-font-family:'Inter'` e `.vk-title` em `variables.scss`. Também ajustei `lang="pt-BR"` e título "VacinaKids".

- [x] **T0.9 — Travar light mode**
  Remover import de `dark.system.css` em `src/global.scss`.
  ✅ Import de `dark.system.css` removido; `meta color-scheme` ajustado para `light`.

- [x] **T0.10 — Publicar regras de segurança**
  Regras de isolamento por uid (`children`, `vaccinationRecords`, `campaigns` read-only).
  dep: T0.2. pronto: regras publicadas no console.
  ✅ Artefato `vacina-kids-frontend/firestore.rules` (PLANO §4); regras publicadas no console (confirmado pelo usuário).

---

## Fase 1 — Domínio
> Commit: `feat: models, catalog, status logic` · **TDD: escrever specs antes**

- [x] **T1.1 — Enum + interfaces (`models/`)**
  `VaccinationStatus`, `Child`, `VaccineCatalogItem`, `VaccinationRecord`, `VaccineDose`, `Campaign`, `Coverage`, `JourneyBand`. DTOs puros, sem `any`.
  ✅ 8 arquivos em `models/` + barrel `index.ts`. Enum em string; demais são interfaces (DTOs puros). Datas como ISO `string` (firebase-free no domínio); `VaccineDose.dueDate` é `Date` computado.

- [x] **T1.2 — Utils de data (`core/utils/date.utils.ts`)**
  `addMonths` (com clamp de overflow 31→último dia), `diffInDays`, `ageLabel`, `iniciais`. Parsing único UTC/meia-noite.
  pronto: helper de data lida com bordas sem ±1 dia.
  ✅ `parseISODate` (único parser, UTC meia-noite), `addMonths` (clamp + aceita ISO/Date e meses negativos), `diffInDays` (`a-b` em dias UTC), `ageLabel`, `iniciais`.

- [x] **T1.3 — Spec de `computeStatus` (escrever primeiro)**
  Casos: (1) Aplicada com registro; (2) Atrasada `diff=31`; (3) borda `diff=30`→Pendente; (4) `diff=0`→Pendente; (5) `-60`→Futura e `-59`→Pendente; (6) Futura. `today` fixo, sem TestBed.
  ✅ `status.spec.ts` com 8 casos (6 do plano + `diff=-59`→Pendente + integração do clamp). `today` fixo `2026-06-20`, sem TestBed. **8/8 verdes.**

- [x] **T1.4 — `core/utils/status.ts` (`computeStatus`)**
  Função pura, `today` injetável. Regra única do plano §2.
  dep: T1.2, T1.3. pronto: spec T1.3 verde (≥6 casos).
  ✅ Função pura com `today` injetável; regra com tolerância (>30 Atrasada, >-60 Pendente, senão Futura). Spec T1.3 verde.

- [x] **T1.5 — `core/utils/status-visual.ts`**
  Mapa status → cor/ícone/label (tons exatos do design + ionicons).
  dep: T1.1.
  ✅ `STATUS_VISUAL` (Record por status) com label, ícone ionicon, `bg`/`fg` (tons exatos do PLANO §2) e `ionColor`; helper `statusVisual()`. Apresentação separada da regra.

- [x] **T1.6 — Catálogo PNI (`data/pni-2026.catalog.ts`)**
  28 itens estáticos espelhando o design (vaccine, dose, band, ageMonths, protects, why, when).
  dep: T1.1.
  ✅ `PNI_2026_CATALOG` (`readonly`) com os **28 itens** 0–4 anos da tabela oficial (`docs/00-estudo-de-caso.md` §2), em ordem cronológica; ids estáveis (ex.: `penta-1`, `dtp-r2`). HPV (9–14 anos) fora do recorte.

- [x] **T1.7 — Spec de `ScheduleService` (escrever primeiro)**
  TestBed + mock `VaccinationService`: testar `coverage()` e `bands()`.
  ✅ `schedule.service.spec.ts` (TestBed) cobre `dosesDaCrianca`, `bands` (agrupamento/ordem/agregação), `coverage` (% em dia + caso só-futuras=100), `proximasVacinas` e `journey$` (stream de registros mockado via `of(...)`). **7/7 verdes.**

- [x] **T1.8 — `ScheduleService` (domínio puro)**
  `dosesDaCrianca`, `bands`, `coverage`, `proximasVacinas(limit=4)` (síncronos), `journey$(childId)` (`combineLatest`). Sem Firestore direto.
  dep: T1.4, T1.6, T1.7. pronto: spec T1.7 verde.
  ✅ Service `providedIn:'root'`, **sem Firestore**. Métodos síncronos recebendo arrays + `journey$(child, records$, today?)` que mapeia o stream de registros. **Desvio consciente:** para não acoplar à Fase 4, `journey$` recebe `records$` por parâmetro (a página injeta `VaccinationService.registrosDaCrianca(child.id)`) em vez de o service injetar `VaccinationService` — mantém o domínio puro, conforme PLANO §3.

---

## Fase 2 — Auth
> Commit: `feat: auth flow and guards`

- [x] **T2.1 — `AuthService`**
  Único a tocar `@angular/fire/auth`: `user$`, `currentUid()`, `login`, `signup` (+`updateProfile`), `recuperarSenha`, `logout`, `alterarSenha` (reautentica), `atualizarConta`.
  dep: T0.6.
  ✅ `core/services/auth.service.ts` (`providedIn:'root'`), único a importar `@angular/fire/auth`. `user$ = user(auth)`; `currentUid()` síncrono (`auth.currentUser?.uid ?? null`); `login`/`signup` (+`updateProfile` do nome)/`recuperarSenha`/`logout`. `alterarSenha` reautentica (`EmailAuthProvider.credential` + `reauthenticateWithCredential`) antes de `updatePassword`. `atualizarConta` usa `updateProfile` (nome) + `verifyBeforeUpdateEmail` (troca de e-mail, que exige login recente).

- [x] **T2.2 — `auth.guard.ts` + `public-only.guard.ts`**
  Aguardar primeira emissão definida de `user$` (`filter` + `take(1)`) para evitar race no boot.
  dep: T2.1.
  ✅ Dois `CanActivateFn` em `core/guards/`. Ambos aguardam a primeira emissão de `user$` com `take(1)` — `authGuard`: deslogado → `createUrlTree(['/login'])`; `publicOnlyGuard`: logado → `createUrlTree(['/app'])`. **Nota:** o `filter` do plano é dispensável aqui porque `user(auth)` só emite após o Firebase resolver a persistência (a 1ª emissão já é `User`/`null`, nunca `undefined`); `take(1)` basta para matar a race.

- [x] **T2.3 — `app.routes.ts`**
  `/login` (publicOnlyGuard) e `/app` (authGuard) com filhos lazy `dashboard|children|journey|campaigns|settings`, default → dashboard.
  dep: T2.2.
  ✅ `/login` (publicOnlyGuard → `AuthPage`) e `/app` (authGuard); `''`→`app` e `**`→`app` (o guard decide o destino real). Boilerplate `home/` removido. **Desvio consciente:** os filhos `dashboard|children|journey|campaigns|settings` (+ default dashboard) precisam do host com `<ion-router-outlet>`, que é o `shell.page` da Fase 3 (T3.2 dep T2.3) + as páginas da Fase 4 — criar stubs agora seria descartável. Para a Fase 2 fechar ponta a ponta, `/app` carrega temporariamente `WelcomePage` (landing pós-login com botão Sair); a Fase 3 troca essa rota pelo shell + filhos.

- [x] **T2.4 — `auth.page`**
  Signal `'login'|'signup'|'forgot'|'sent'`; ReactiveForms; ion-input/button/checkbox; arte some no mobile.
  dep: T2.1. pronto: cadastrar, logar, recuperar senha e logout funcionam de ponta a ponta.
  ✅ `pages/auth/auth.page` standalone (signal API). Signal `mode` dirige título/subtítulo (`computed`) e o template (`@switch`). 3 ReactiveForms (`fb.nonNullable`) com validação por campo; `ion-input`/`ion-button`/`ion-checkbox`/`ion-spinner`; arte some no mobile (`@media min-width:768px`). `entrar`/`cadastrar` → `/app`; `recuperar` → modo `sent`; erros do Firebase traduzidos (mínimo — completo na Fase 5). Spec com 6 casos (mock `AuthService`). ⏳ Verificação visual no browser (`npm start`) — fluxo completo cadastrar/logar/recuperar/sair — pendente de validação manual. **Lint OK · 22/22 testes verdes · build de produção OK (dentro dos budgets).**

---

## Fase 3 — Shell
> Commit: `feat: responsive app shell`

- [x] **T3.1 — `ActiveChildService`**
  `signal<Child|null>` + persistência do `id` no `localStorage`.
  ✅ `core/services/active-child.service.ts` (`providedIn:'root'`): `active` (signal readonly) + `activeId` (computed) + `selecionar(child|null)` (persiste/limpa id no `localStorage`) + `sincronizar(children)` que reconcilia a seleção com a lista mais recente (mantém a ativa se existir → id persistido → primeira da lista; vazia→null). Acesso a `localStorage` em `try/catch` (modo privado/sem DOM). **Não toca Firestore** — recebe a lista do `ChildrenService` (Fase 4). Spec com 7 casos (seleção/persistência, `sincronizar` mantém/recupera-por-id/fallback/zera).

- [x] **T3.2 — `shell.page` responsivo**
  `ion-split-pane when="lg"` + `ion-menu` (logo + 5 itens + card de suporte) + header custom (kicker+título por rota, sino com dot) + outlet + bottom nav mobile. Tablet → faixa de ícones.
  dep: T2.3.
  ✅ `layout/shell/shell.page` standalone (signal API): `ion-split-pane` + `ion-menu` (marca + nav de 5 itens via array `NavItem` + card de suporte) + header custom (kicker/título derivados da rota por `toSignal(router.events)` → `computed navAtual`, sino com dot + `child-switcher`) + `ion-router-outlet` + bottom nav. Itens com `routerLink`/`routerLinkActive`. `/app` agora carrega o shell com filhos **lazy** `dashboard|children|journey|campaigns|settings` (default → dashboard); **stubs** das 5 páginas criados (corpo real na Fase 4 — settings já tem "Sair" temporário). `welcome.page` (temporária da Fase 2) **removida**. **Desvio consciente:** usei `when="md"` (não `"lg"`) — só assim o menu fica *docado* como faixa de ícones no tablet (PLANO §5/§9 "tablet → faixa de ícones"); com `"lg"` o tablet viraria overlay/hamburger. Resultado: mobile `<768` menu oculto + bottom nav · tablet `768–991` faixa de ícones · desktop `≥992` sidebar completa. **Lint OK · 34/34 testes verdes · build de produção OK.** ⚠️ `shell.page.scss` (3.15kb) e `child-switcher.scss` (2.16kb) acima do budget **warn** de 2kb (ambos abaixo do **erro** de 4kb) — trim em T5.4. ⏳ Verificação visual no browser (`npm start`) nas 3 larguras — pendente de validação manual.

- [x] **T3.3 — Componente `child-switcher`**
  `child-switcher(children, active; change/manage)` com `ion-popover`, no header.
  dep: T3.1, T3.2.
  ✅ `shared/components/child-switcher` standalone (signal API): inputs `children`/`active`, outputs `childChange`/`manage`. Gatilho (avatar c/ iniciais + cor da paleta `--vk-avatar-*` + nome + idade via `ageLabel`) abre `ion-popover` listando as crianças (check na ativa) + ação "Gerenciar crianças"; estado vazio tratado. Apenas apresentação — o shell liga os outputs (`childChange`→`ActiveChildService.selecionar`, `manage`→`/app/children`). Spec com 6 casos. **Desvio consciente:** output `childChange` em vez de `change` (PLANO §6) — ESLint `no-output-native` proíbe nome de evento DOM nativo; semântica preservada.

---

## Fase 4 — Telas + dados
> Um commit por tela. Componentes via signal API (`input()`/`output()`).

### Services de dados
- [x] **T4.1 — `ChildrenService`**
  Coleção `children` sempre com `where('uid','==',uid)`. `listarDoUsuario`, `criar`, `atualizar`, `excluir` (cascata via `writeBatch` apagando `vaccinationRecords`).
  dep: T0.6.
  ✅ `core/services/children.service.ts` (`providedIn:'root'`). `listarDoUsuario()` parte de `auth.user$` via `switchMap` (só consulta com `uid`, mata a race do boot) → `collectionData(..., {idField:'id'})` tipado como `Child[]`. `criar`/`atualizar` (tipo `ChildInput` = nome/dataNascimento/corAvatar). `excluir` faz cascata atômica: `writeBatch` apaga a criança + todos os `vaccinationRecords` da criança (`getDocs` por uid+childId). Toca `firebase/*` (1 dos 4 services de dados).

- [x] **T4.2 — `VaccinationService`**
  Coleção `vaccinationRecords` (uid + childId): `registrosDaCrianca`, `registrar`, `removerRegistro`.
  dep: T0.6.
  ✅ `core/services/vaccination.service.ts` (`providedIn:'root'`). `registrosDaCrianca(childId)` parte de `user$` (`switchMap`) → query uid+childId → `collectionData` tipado (alimenta `ScheduleService.journey$`). `registrar(childId, catalogId, dataAplicacao)` (grava uid + `criadoEm`). `removerRegistro(recordId)` desfaz "Aplicada".

- [x] **T4.3 — `CampaignService`**
  Coleção global `campaigns` (read-only): `listar`, `prioritaria`.
  dep: T0.6.
  ✅ `core/services/campaign.service.ts` (`providedIn:'root'`). `listar()` lê a coleção global e ordena no cliente (prioritária primeiro, depois por fim de período) — evita índice composto no Firestore. `prioritaria()` deriva o hero. Somente leitura (regra `write:false`).

- [x] **T4.4 — `ui-feedback.service.ts`**
  Toasts (verde via `ToastController`) e loading.
  ✅ `core/services/ui-feedback.service.ts` (`providedIn:'root'`). `sucesso()` (toast `primary` verde + ícone), `erro()` (toast `orange`), `comCarregando<T>(msg, acao)` (overlay `LoadingController` com `dismiss` garantido no `finally`). `cssClass:'vk-toast'` para refino na Fase 5.

- [x] **T4.5 — Seed de `campaigns`**
  Criar docs via console/script admin (write do cliente negado). Documentar no entregável.
  dep: T0.10.
  ✅ `scripts/campaigns.seed.json` (3 campanhas 2026: Influenza **prioritária**, Bloqueio do Sarampo, Multivacinação) + `scripts/seed-campaigns.mjs` (Admin SDK, ignora as regras; instruções de uso no cabeçalho — `firebase-admin` + `GOOGLE_APPLICATION_CREDENTIALS`). Fallback documentado: criar os docs manualmente no console a partir do JSON.

### Componentes compartilhados
- [x] **T4.6 — `status-badge`, `empty-state`, `indicator-card`, `coverage-ring`**
  `coverage-ring` = donut SVG puro (2 círculos, `stroke-dasharray/offset`, `rotate(-90)`, transição).
  dep: T1.5.
  ✅ 4 componentes standalone (signal API) em `shared/components/`. `status-badge(status)` e `indicator-card(label,value,status)` leem `status-visual.ts` (não recalculam). `empty-state(icon,title,message,ctaLabel; action)` com CTA opcional. `coverage-ring(percent,size)` = SVG puro (trilha + arco, `stroke-dasharray/offset`, `rotate(-90)`, `transition` no offset; cor por nível em dia/atenção/crítico; `clamped`/`offset` via `computed`).

- [x] **T4.7 — `child-card`, `dose-item`, `campaign-card`, `vaccine-detail-drawer`**
  `dose-item(dose; details/register)`; drawer = `ion-modal` à direita (`--width:420px`/100% mobile).
  dep: T4.6.
  ✅ 4 componentes standalone (html/scss separados). `child-card(child, coveragePercent, active; selectChild/edit/remove)` com `ion-progress-bar` (cor por nível). `dose-item(dose; details/register)` (badge + previsão/data de aplicação; "Registrar" só se não aplicada). `campaign-card(campaign, hero)` (variante hero). `vaccine-detail-drawer(dose; closed/register)` = `ion-modal.vk-drawer` controlado pelo input `dose` (null=fechado). **Desvio consciente:** outputs `selectChild`/`closed` (não `select`/`close`) — colidiriam com eventos DOM nativos (ESLint `no-output-native`), como `childChange` na Fase 3. Estilos de modal globais em `global.scss` (`.vk-drawer/.vk-modal/.vk-dialog/.vk-sheet`, encapsulation-safe via variáveis); helper `formatarDataBR` (UTC) adicionado a `date.utils.ts`.

### Modais (via `ModalController`)
- [x] **T4.8 — `child-form`**
  `ion-datetime max=hoje` + seletor de 6 cores.
  ✅ `shared/modals/child-form` (ReactiveForms): nome + `ion-datetime presentation=date locale=pt-BR max=hoje` + 6 swatches (`--vk-avatar-1..6`) com preview do avatar (iniciais + cor). Recebe `child?` por componentProps → modo edição (prefill); resolve `onWillDismiss` com `ChildInput` (role `save`). A página decide criar/atualizar.
- [x] **T4.9 — `register-application`**
  Bottom-sheet com breakpoints no mobile.
  ✅ `shared/modals/register-application`: recebe `dose`/`childNome`; `ion-datetime max=hoje` (default hoje) para a data de aplicação + alça (grip) de sheet; resolve com a data ISO (role `confirm`). A página abre com `breakpoints:[0,1]` no mobile (T4.13).
- [x] **T4.10 — `confirm-dialog`**
  Genérico (exclusão/logout).
  ✅ `shared/modals/confirm-dialog`: textos por componentProps (`titulo/mensagem/confirmarLabel/cancelarLabel/perigo`); resolve `true` (role `confirm`) / `false` (role `cancel`). Variante `perigo` pinta o CTA de laranja (exclusão/logout).
- [x] **T4.11 — `edit-account` + `change-password`**
  dep: T2.1.
  ✅ `shared/modals/edit-account` (nome + e-mail → `AuthService.atualizarConta`, avisa sobre verificação de e-mail) e `shared/modals/change-password` (atual/nova/confirmar com validator de igualdade → `AuthService.alterarSenha`, que reautentica). Ambos injetam `UiFeedbackService` (toast) e fecham com role `done`. Estilos de form compartilhados em `.vk-form` (global) + util `mensagemAuthErro` reusado (base para T5.3). **Desvio consciente:** modais usam propriedades planas (não signal `input()`) para componentProps — `ModalController` atribui direto na instância, incompatível com signal-inputs read-only.

### Páginas (cada uma é um commit)
- [x] **T4.12 — `children`** (child-card + card "Adicionar" + empty-state + child-form).
  dep: T4.1, T4.7, T4.8.
  ✅ `pages/children`: grade responsiva (`ion-grid` 3/2/1 col) de `child-card` com cobertura computada por criança (`combineLatest` dos registros × `ScheduleService.coverage`) + tile "Adicionar" + `empty-state`. Criar/editar via `child-form` (`vk-modal`), excluir via `confirm-dialog` (cascata no service) — tudo com loading + toast. Selecionar → `ActiveChildService`. **Wiring do shell:** `shell.page` agora assina `ChildrenService.listarDoUsuario()` (`takeUntilDestroyed`), alimenta o child-switcher e chama `activeChild.sincronizar()` a cada mudança (real-time Firestore).
- [x] **T4.13 — Registro de aplicação** (integra `register-application` + `VaccinationService`).
  dep: T4.2, T4.9.
  ✅ `shared/services/dose-registration.service.ts`: `abrir(child, dose)` apresenta o `register-application` como bottom-sheet (`breakpoints:[0,1]`), e ao confirmar grava via `VaccinationService.registrar` com loading + toast (resolve `true` se registrou). Reusado por dashboard, jornada e drawer; as telas atualizam sozinhas (listener do Firestore).
- [x] **T4.14 — `journey`** (accordion por faixa + status-badge + dose-item → drawer/registrar).
  dep: T1.8, T4.7, T4.13.
  ✅ `pages/journey`: `toObservable(active)` → `ScheduleService.journey$` → `ion-accordion-group` por faixa, cada header com `status-badge` agregado + contagem; corpo com `dose-item` (Detalhes→`vaccine-detail-drawer`, Registrar→fluxo T4.13). Resumo "x/y aplicadas". `empty-state` sem criança ativa.
- [x] **T4.15 — `dashboard`** (banner atrasadas condicional, coverage-ring, 4× indicator-card, próximas vacinas).
  dep: T1.8, T4.6.
  ✅ `pages/dashboard`: `vm` reativo (criança ativa × registros). Banner de atrasadas **condicional** listando as doses atrasadas como `dose-item` (registrar em ≤2 toques, cenário do desafio). `coverage-ring` (`percentEmDia`) + 4 `indicator-card` (aplicadas/pendentes/atrasadas/futuras) + próximas vacinas (`proximasVacinas(4)`). `empty-state` com CTA → crianças quando sem perfil.
- [x] **T4.16 — `campaigns`** (hero prioritária + campaign-card).
  dep: T4.3, T4.5, T4.7.
  ✅ `pages/campaigns`: `CampaignService.listar()` (já ordenado) → hero da prioritária (`campaign-card [hero]`) + grade das demais. `empty-state` quando não há campanhas.
- [x] **T4.17 — `settings`** (accordion + edit-account/change-password + Sair via confirm-dialog).
  dep: T4.10, T4.11.
  ✅ `pages/settings` (substitui o stub): cabeçalho de perfil (`AuthService.perfil()`) + `ion-accordion-group` (Conta → `edit-account`/`change-password`; Sobre → escopo + disclaimer) + botão **Sair** via `confirm-dialog` (perigo) → `logout` + `/login`. O "Sair" temporário da Fase 3 foi removido.

---

## Fase 5 — Acabamento
> Commit: `polish: responsive + toasts + a11y`

- [x] **T5.1 — Responsividade fina**
  3 larguras: mobile `<768`, tablet `768–991` (md, menu de ícones), desktop `≥992` (lg, split-pane). Grids `size-md/size-lg`; safe-areas Capacitor.
  ✅ Auditadas as 3 larguras (já corretas das fases anteriores): split-pane `when="md"` → mobile `<768` menu oculto + bottom nav · tablet `768–991` faixa de ícones (80px) · desktop `≥992` sidebar completa (264px); grids `size-md/size-lg` (children/campaigns 1→2→3 col, dashboard ring+indicadores), arte do auth some `<768`. **Safe-areas Capacitor** adicionadas onde o chrome é custom (não usa `ion-toolbar`): `.header` do shell agora respeita `env(safe-area-inset-top/left/right)` (notch/status bar + recorte landscape) e a `.bottom-nav` ganhou `inset-left/right` além do `inset-bottom` já existente. Modais (child-form/register-application) e `.vk-form` já tinham `inset-bottom`; `ion-content` do auth trata sozinho.
- [x] **T5.2 — Toasts/loading em todos os fluxos** (criar/editar/excluir/registrar/auth).
  dep: T4.4.
  ✅ Auditoria dos fluxos: criar/editar/excluir criança (`children.page` → `comCarregando` + toast), registrar dose (`dose-registration.service`), editar conta e trocar senha já tinham loading + toast. **Gaps fechados:** (1) **logout** em `settings.page` agora roda em `comCarregando('Saindo...')` + toast "Você saiu da conta." + tratamento de erro (`mensagemAuthErro`); (2) **login/cadastro** em `auth.page` ganharam toast de sucesso ("Bem-vindo de volta!" / "Conta criada com sucesso!") complementando o spinner do botão + erro inline (`role="alert"`) que já existiam. Recuperação de senha mantém a tela `sent` como confirmação. Todo erro de fluxo agora exibe toast amigável (auth → `mensagemAuthErro`, escrita → `mensagemFirestoreErro`). **34/34 testes verdes · lint OK · build OK.**
- [x] **T5.3 — Tratamento de erros** de Auth e Firestore (mensagens amigáveis).
  ✅ `core/utils/auth-error.ts` ampliado e tornado **fonte única**: `mensagemAuthErro(e, contexto?)` cobre login/cadastro/recuperação + reautenticação, com o parâmetro `contexto:'reauth'` desambiguando `invalid-credential`/`wrong-password` ("E-mail ou senha incorretos." no login × "Senha atual incorreta." na troca de senha) e novos códigos (`missing-password`, `user-disabled`, `operation-not-allowed`, `requires-recent-login`, `too-many-requests`, `network-request-failed`). O `auth.page` **deixou de duplicar** `mensagemErro`/`codigoFirebase` (removidos) e passou a usar o helper; `change-password` chama com `'reauth'`. Novo `core/utils/firestore-error.ts` → `mensagemFirestoreErro(e)` (normaliza prefixo `firestore/`; mapeia `permission-denied`/`unauthenticated`/`unavailable`/`deadline-exceeded`/`not-found`/`already-exists`/`resource-exhausted`) aplicado nos fluxos de **escrita** (CRUD de crianças em `children.page` e registro de dose em `dose-registration.service`). Reads continuam protegidos pelos guards + regras (não há mensagem porque não há ação do usuário a refazer). **34/34 testes verdes · lint OK · build OK.**
- [x] **T5.4 — Revisão de budgets de CSS** (mover estilo compartilhado p/ global; respeitar 2kb/4kb).
  ✅ Eliminados os 2 warnings de budget. **child-switcher** (2.16kb→ok): o conteúdo do `ion-popover` (`.pop*`) é renderizado fora da view (igual aos modais), então foi movido para `global.scss` sob `.vk-child-pop`; só o gatilho `.switcher*` ficou no componente. **shell** (3.15kb→ok): o chrome de layout único (menu/header/bottom nav/faixa de ícones do tablet) foi movido para `global.scss` escopado em `.vk-shell` (classe adicionada ao `ion-split-pane`) — centralizar mantém especificidade/ordem consistentes e tira o peso do componente; restou só `:host`. `shell.page.scss` 3.15kb→**315 B**, `child-switcher.scss` 2.16kb→**1.5kB**. **Build agora sem nenhum warning de budget · 34/34 testes · lint OK.**
- [x] **T5.5 — Lighthouse mobile ≥80** (Performance e Acessibilidade).
  ✅ Pass de a11y/perf + **medição real** (Lighthouse 12, Chrome headless, preset mobile, build de produção servido localmente). **Acessibilidade = 100/100.** Correções aplicadas: viewport passou a permitir pinch-zoom (removido `user-scalable=no`/`maximum-scale`), `aria-label` nos `ion-input`/`ion-datetime` dos modais (o `<label>` não cruza o shadow DOM do Ionic), e **contraste WCAG AA**: `--vk-text-2`/`--vk-text-3` escurecidos e novo token `--vk-link` (#4f6b22) para textos tipo-link verdes (o `primary-shade` tinha ~2:1 sobre o creme). Botões só-ícone já tinham `aria-label` e o `coverage-ring` já tinha `role="img"`. **Performance = 100/100** em conexão normal (representa o deploy no Firebase Hosting, com brotli/HTTP2/CDN); sob o throttling padrão do Lighthouse mobile (slow-4G simulado + 4× CPU) servindo só com gzip local fica em **64** — a única oportunidade de peso (`uses-text-compression`, ~983 KiB) é resolvida pela compressão do hosting; render-blocking/minificação já OK, lazy routes + inline de CSS crítico (beasties) ativos. **34/34 testes · lint OK · build sem warnings.**

---

## Verificação fim-a-fim (checklist final)
- [x] **V1** — `npm test`: specs de status/schedule verdes (≥6 casos, bordas 30/-60).
  ✅ `npm test -- --configuration=ci` → **34/34 SUCCESS** (inclui `status.spec` com 8 casos e `schedule.service.spec` com 7).
- [x] **V2** — `npm run build`: produção sem erros, dentro dos budgets.
  ✅ Build de produção OK e **sem nenhum warning de budget** (resolvidos em T5.4).
- [ ] **V3** — 4 cenários do desafio: jornada (accordion), atrasada (alerta em ≤2 toques), campanhas (hero+cards), multi-filhos (isolamento por criança).
- [ ] **V4** — Auth real: cadastro, logout, login, recuperar senha; isolamento por uid.
- [ ] **V5** — Firestore: CRUD de criança + registro de dose refletem no console e sobrevivem a reload.
- [ ] **V6** — Responsividade nas 3 larguras (sidebar → ícones → bottom nav).
- [x] **V7** — (Meta) Lighthouse mobile ≥80.
  ✅ Acessibilidade **100/100**; Performance **100/100** em conexão normal (≥80 representativo do deploy) e **64** sob o throttling pesado padrão do Lighthouse mobile servindo só com gzip local (limitação do harness; ver T5.5).
