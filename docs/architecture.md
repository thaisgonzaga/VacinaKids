# Arquitetura — VacinaKids

## Princípio
Separação estrita de responsabilidades: lógica de negócio fora da UI e testável. Os models são **DTOs puros** (interfaces + enum); a lógica vive em funções puras (`utils`) e em services injetáveis (Angular DI).

## Camadas
```
┌─────────────────────────────────────────────┐
│  PÁGINAS (Ionic + Angular)                    │
│  dashboard · children · journey ·             │  só orquestram
│  campaigns · settings · auth                  │  (sem regra de negócio)
├─────────────────────────────────────────────┤
│  COMPONENTES REUTILIZÁVEIS                     │
│  status-badge · child-card · dose-item ·      │  input()/output() (signals)
│  campaign-card · coverage-ring                 │
├─────────────────────────────────────────────┤
│  SERVICES (Angular DI)                         │
│  AuthService · ChildrenService ·               │  regra de negócio
│  VaccinationService · CampaignService ·        │  (só os 4 de dados tocam Firebase)
│  ScheduleService · ActiveChildService ·        │  ScheduleService = domínio puro
│  UiFeedbackService · DoseRegistrationService   │  orquestração de UI (shared/)
├─────────────────────────────────────────────┤
│  DOMÍNIO (TypeScript)                          │
│  models/ (DTOs + enum Status) ·               │  computeStatus = função pura
│  data/pni-2026.catalog.ts (catálogo estático) │  (core/utils/status.ts)
├─────────────────────────────────────────────┤
│  PERSISTÊNCIA                                  │
│  Firebase Auth (e-mail/senha) +                │  dados isolados por uid
│  Firestore (children, vaccinationRecords,      │
│  campaigns global read-only)                   │
└─────────────────────────────────────────────┘
                    ↓ deploy
              Firebase Hosting
```

> **Inventário implementado** — Services: os 4 de dados (`AuthService`, `ChildrenService`, `VaccinationService`, `CampaignService`) + `ScheduleService` (domínio puro) + `ActiveChildService` + `UiFeedbackService` (toasts/loading) + `DoseRegistrationService` (em `shared/services/`, orquestra o modal de registro × `VaccinationService`; não toca Firebase direto). Componentes reutilizáveis (9): `status-badge`, `child-card`, `child-switcher`, `dose-item`, `campaign-card`, `coverage-ring`, `indicator-card`, `empty-state`, `vaccine-detail-drawer`. Modais (5): `child-form`, `register-application`, `confirm-dialog`, `edit-account`, `change-password`. O diagrama acima é ilustrativo (lista parcial).

## Fluxo de dados (ex.: abrir a jornada de um filho)
1. `AuthService.user$` emite o usuário logado; o `uid` filtra todas as queries.
2. A criança é selecionada no `child-switcher` (`ActiveChildService` mantém a ativa em signal + `localStorage`).
3. A página `journey` pede a `ScheduleService` as doses da criança ativa.
4. `ScheduleService` cruza o catálogo estático do PNI (`data/pni-2026.catalog.ts`) com os `VaccinationRecord[]` da criança (de `VaccinationService`) e, para cada dose, chama a função pura `computeStatus(dataNascimento, ageMonths, hasRecord, today)`.
5. A página renderiza `dose-item` com `status-badge` colorido por `status-visual.ts` (status → cor da paleta + ícone).

## Modelo de domínio (DTOs + enum)
DTOs puros (interfaces, sem métodos); helpers ficam em `core/utils/date.utils.ts`:
- `enum VaccinationStatus { Aplicada, Pendente, Atrasada, Futura }`
- `Child { id; uid; nome; dataNascimento; corAvatar; criadoEm }` — idade/iniciais via `date.utils.ts`
- `VaccineCatalogItem { id; vaccine; dose; band; ageMonths; protects; why; when }` — 28 itens estáticos do PNI
- `VaccinationRecord { id; uid; childId; catalogId; dataAplicacao; criadoEm }`
- `VaccineDose { catalog; status; record?; dueDate }` — view-model **computado**, não persistido
- `Campaign { id; titulo; descricao; publico; periodoInicio; periodoFim; prioritaria; icone }`
- `computeStatus(...)` (função pura, `core/utils/status.ts`) + `status-visual.ts` (status → cor + ícone Ionicon)

## Mapa de cores (paleta obrigatória → uso)
| Cor | Hex | Uso |
|---|---|---|
| Verde | `#ABC270` | Status **Aplicada** / "em dia" |
| Amarelo | `#FEC868` | Status **Pendente** / próxima dose |
| Laranja | `#FDA769` | Status **Atrasada** / alerta + destaque de campanhas |
| Marrom | `#473C33` | Texto principal, títulos, contraste |

## Isolamento do Firebase (decisão de risco)
Só **4 services de dados** (`AuthService`, `ChildrenService`, `VaccinationService`, `CampaignService`) importam `firebase/*`. Páginas e componentes consomem observables/signals tipados, sem saber a origem do dado. A lógica de domínio — `ScheduleService` e `computeStatus` — é **pura** e testável sem Firebase (mock dos services). Assim a regra de status (joia da coroa) tem cobertura de testes independente da infraestrutura. Ver [ADR-002](adr-002-persistencia-firestore.md) e [ADR-004](adr-004-modelagem-status.md).
