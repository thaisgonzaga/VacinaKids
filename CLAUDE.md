# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## O que é

VacinaKids digitaliza o acompanhamento da vacinação infantil (0–4 anos, Calendário Nacional do PNI 2026): para cada criança, calcula o status de cada dose (Aplicada / Pendente / Atrasada / Futura) a partir da data de nascimento e exibe dashboard de cobertura, jornada vacinal e campanhas.

## Estado atual e fonte da verdade

O produto está **implementado** em `vacina-kids-frontend/`: todas as fases (0–5) do PLANO/TAREFAS estão concluídas — models, catálogo PNI (28 itens), utils de domínio, services, Firebase via AngularFire conectado ao projeto real `vacina-kids-94e19`, guards + rotas, shell responsivo, as 6 páginas, 9 componentes, 5 modais, tema (light) e `firestore.rules`, com specs (34 testes verdes). Pendências: a verificação manual fim-a-fim (`TAREFAS.md` V3–V6) e o deploy no Firebase Hosting (ainda sem `firebase.json`/`.firebaserc` no repo).

A especificação **autoritativa e atual** é, nesta ordem:
1. `PLANO-IMPLEMENTACAO.md` — arquitetura, regras, decisões e ordem de fases.
2. `TAREFAS.md` — quebra em tarefas acionáveis (`T<fase>.<n>`) com dependências e critérios de aceitação.

✅ **`docs/` foi alinhado ao plano.** ADR-002 e ADR-003 foram **substituídos** por ADR-004 (Firestore + Auth desde o início, isolamento por `uid`), ADR-005 (status como função pura com janela de tolerância) e ADR-006 (AngularFire em vez do SDK modular); os ADRs antigos permanecem marcados como "Substituído" apenas como registro histórico. `architecture.md`, `requisitos.md`, `README.md` e os docs de processo já refletem: Firestore + Firebase Auth reais desde o início, models como DTOs puros (helpers em utils), regra de status **com tolerância**, isolamento por `uid`. Em qualquer conflito remanescente, **PLANO/TAREFAS continuam sendo a fonte da verdade**.

## Comandos

Todos rodam dentro de `vacina-kids-frontend/` (a raiz não é repo git; o `.git` está no subprojeto).

```bash
npm start                          # ng serve — dev server (http://localhost:8100 via ionic serve)
npm run build                      # ng build (configuração production é o default)
npm test                           # ng test — Karma/Jasmine em modo watch
npm test -- --configuration=ci     # rodada única, sem watch (use para CI/verificação)
npm run lint                       # ESLint (@angular-eslint), cobre .ts e .html
```

Rodar um único teste: marque `fdescribe`/`fit` no `.spec.ts`, ou filtre por arquivo com `npm test -- --include='**/status.spec.ts'`.

## Stack e restrições do compilador

Angular 20.3 **standalone** (sem NgModules) · Ionic 8 · Capacitor 8 · RxJS 7.8 · TypeScript 5.9. Em uso: `@angular/fire@20.0.1` + `firebase@12.15.0` (AngularFire, não SDK puro).

- **`tsconfig` é strict** + `strictTemplates`, `strictInjectionParameters`, `noPropertyAccessFromIndexSignature`, `noImplicitReturns`. Tipar Firestore com **interfaces concretas, sem `any`** (o acesso por index signature é bloqueado).
- **zone.js está ATIVO** (`src/polyfills.ts`) — manter; não migrar para zoneless nesta fase.
- Usar a **signal API** do Angular 20 (`input()` / `output()`, signals) nos componentes novos.
- **Light mode apenas:** o import de `dark.system.css` já foi removido de `src/global.scss` (fidelidade visual) — manter assim, não reintroduzir.
- **Budget de CSS por componente:** 2kb (warn) / 4kb (erro). Estilo compartilhado vai para `global.scss`/`theme`, não para o componente.
- Build sai em `www/` (consumido pelo Capacitor).

## Arquitetura-alvo (sob `src/app`)

Camadas com separação estrita — lógica de negócio fora da UI, páginas só orquestram:

```
core/services/    AuthService, ChildrenService, VaccinationService, CampaignService,
                  ScheduleService, ActiveChildService, ui-feedback.service
core/utils/       status.ts (computeStatus), status-visual.ts, date.utils.ts,
                  auth-error.ts, firestore-error.ts
core/firebase/    firebase.providers.ts (provideFirebaseApp/Auth/Firestore p/ main.ts)
core/guards/      auth.guard, public-only.guard
models/           enums + interfaces (DTOs puros)
data/             pni-2026.catalog.ts (28 itens estáticos do PNI, no app)
shared/components/ e shared/modals/ (reuso entre páginas)
shared/services/  dose-registration.service (orquestra register-application + VaccinationService)
layout/shell/     shell.page (split-pane + menu + header + bottom nav)
pages/            auth, dashboard, children, journey, campaigns, settings (lazy loadComponent)
```

### Invariantes que dirigem o código

- **Regra de status em UM lugar:** `core/utils/status.ts` → `computeStatus(dataNascimento, ageMonths, hasRecord, today = new Date())`, função **pura** com `today` injetável para testes. Nenhum componente/service recalcula status — todos chamam essa função. A regra é **com tolerância** (PLANO §2): `hasRecord`→Aplicada; senão `due = addMonths(nasc, ageMonths)`, `diff = diffInDays(today, due)`; `diff>30`→Atrasada, `diff>-60`→Pendente, senão Futura. `status-visual.ts` mapeia status→cor/ícone (apresentação separada da regra).
- **Só 4 services de dados tocam `firebase/*`** (Auth, Children, Vaccination, Campaign). `ScheduleService` é **domínio puro** (cruza catálogo estático × registros, sem Firestore). Páginas consomem observables/signals tipados → fáceis de mockar nos specs.
- **Isolamento por `uid`:** `children` e `vaccinationRecords` sempre com `where('uid','==',uid)`; `campaigns` é coleção global read-only. Excluir criança apaga seus registros em **cascata via `writeBatch`**. Regras de segurança do Firestore espelham isso.
- **Datas:** persistir nascimento como `yyyy-mm-dd`; um único helper de parsing (UTC/meia-noite) em `date.utils.ts`. `ion-datetime` retorna ISO com offset — misturar parsing causa ±1 dia nas bordas 30/-60. `addMonths` faz clamp de overflow (31/01 → último dia do mês destino).
- **Guards no boot:** aguardar a primeira emissão de `AuthService.user$` com `take(1)` e só disparar queries Firestore com `uid` presente (`switchMap` a partir de `user$`) — evita race. (O `filter` cogitado no plano é dispensável: `user(auth)` só emite `User`/`null` após o Firebase resolver a persistência, nunca `undefined`.)

## Paleta (obrigatória, light mode)

`primary #ABC270` (Aplicada/em dia) · `warning #FEC868` (Pendente) · `orange #FDA769` (Atrasada/campanhas) · texto `#473C33` · bg `#ECE7DC`. Tons exatos por status estão no PLANO §2/§7. Fontes: Poppins (títulos, `.vk-title`) + Inter (corpo, `--ion-font-family`) via `<link>` no `index.html`.

## Testes

Mínimo previsto: `status.spec.ts` (função pura, sem TestBed, `today` fixo — cobrir bordas `diff=30`→Pendente, `diff=31`→Atrasada, `-60`→Futura, `-59`→Pendente) e `schedule.service.spec.ts` (TestBed + mock `VaccinationService` para `coverage()`/`bands()`). TDD: nas fases de domínio, escrever os specs antes da implementação.

## Convenções ESLint

Sufixo de classe `Page` ou `Component`; seletor de componente `element` prefixo `app` kebab-case; seletor de diretiva `attribute` prefixo `app` camelCase.
