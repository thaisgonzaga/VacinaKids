# Plano de Execução — Fases 1 a 3

Projeto: **VacinaKids** (nome de trabalho — ajuste à vontade)
Stack obrigatória: **Ionic + Angular**. Diferenciais mirados: **Firebase Auth + Firestore + Firebase Hosting + indicadores visuais**.
Prazo: entrega até segunda-feira, 17h.


---

## FASE 1 — Planejamento e definição do problema

### Problem Statement (1 parágrafo)
O Brasil enfrenta desde 2015 uma queda contínua na cobertura vacinal infantil — voltando à lista dos países com mais crianças não vacinadas — e um dos principais fatores evitáveis é a **perda de acompanhamento**: o calendário do PNI tem dezenas de doses com intervalos variáveis nos primeiros anos de vida, registradas numa carteira de papel que se perde, não avisa sobre atrasos e não centraliza informações de famílias com mais de um filho. **VacinaKids** é um aplicativo que digitaliza esse acompanhamento, mostrando para cada criança o que já foi aplicado, o que está pendente ou atrasado, explicando para que serve cada vacina e divulgando campanhas ativas — reduzindo o esquecimento e o abandono entre doses.

### Escopo (MVP)
- **Autenticação real** (e-mail/senha) com dados isolados por usuário (`uid`): cadastro, login, recuperação e troca de senha.
- Cadastro/listagem de **crianças** (nome, data de nascimento) e seletor para alternar entre elas.
- **Calendário/linha do tempo** por criança, derivado do PNI (foco 0–4 anos), com status por dose: **Aplicada / Pendente / Atrasada / Futura**.
- Cálculo automático de status pela data de nascimento + data prevista vs. hoje (com janela de tolerância).
- Marcar uma dose como **aplicada** (com data).
- **Detalhe da vacina**: doenças evitadas, dose, idade prevista, explicação simples.
- **Tela/seção de campanhas** ativas (coleção global no Firestore, semeada via console/admin).
- **Dashboard de situação vacinal** por criança (% em dia, nº de pendências) com indicadores visuais e cores da paleta.
- Responsivo (mobile, tablet, desktop).

### Não-escopo (consciente, por causa do prazo)
- Edição completa do calendário pelo usuário, vacinas de viajante, casos especiais (CRIE).
- Aconselhamento médico — o app **não** diagnostica nem recomenda; só organiza.

### Hipóteses
- H1: Responsáveis sabem a data de nascimento e topam cadastrar manualmente as doses já tomadas.
- H2: Mostrar "o que está atrasado" em destaque é o maior gerador de valor percebido.
- H3: O calendário oficial 2026 cobre a maioria dos casos comuns 0–4 anos (sim, confirmado no estudo).
- H4: Cores quentes + ícones claros comunicam status mais rápido que texto.

---

## FASE 2 — Arquitetura e escolha de tecnologias

### Visão geral (camadas)
```
┌─────────────────────────────────────────────┐
│  UI (Ionic Components + páginas Angular)      │  ← apresentação, responsiva
├─────────────────────────────────────────────┤
│  Componentes reutilizáveis (status-badge,     │
│  child-card, dose-item, campaign-card)        │
├─────────────────────────────────────────────┤
│  Services (Angular DI)                         │
│   • AuthService     • ChildrenService          │  ← regra de negócio
│   • VaccinationService • CampaignService       │  (só estes 4 tocam Firebase)
│   • ScheduleService (domínio puro)             │
├─────────────────────────────────────────────┤
│  Domínio: models (DTOs + enum) +               │  computeStatus = função pura
│   data/pni-2026.catalog.ts (catálogo estático) │
├─────────────────────────────────────────────┤
│  Persistência: Firebase Auth + Firestore       │  dados isolados por uid
│   (children, vaccinationRecords, campaigns)    │
└─────────────────────────────────────────────┘
        Deploy → Firebase Hosting
```

### Separação de responsabilidades
- **Páginas** só orquestram (chamam services, passam dados a componentes). Sem regra de negócio.
- **Componentes** são burros e reutilizáveis (recebem `input()`, emitem `output()` via signals).
- **Services** contêm a lógica (cálculo de status via função pura, filtros, acesso a dados).
- **Models** são **DTOs/interfaces**; a lógica de domínio fica em funções puras (`utils`) e nos services.

### Domínio e orientação a objetos (item avaliado!)
- `VaccinationStatus` como **enum**; demais models como **interfaces** (DTOs puros), sem comportamento — casam com a tipagem estrita do Firestore.
- Regra de status concentrada na **função pura** `computeStatus(dataNascimento, ageMonths, hasRecord, today)` (`core/utils/status.ts`); `StatusVisual` mapeia status → cor da paleta + ícone.
- Helpers de domínio (idade em meses, iniciais, `addMonths`/`diffInDays`) em `core/utils/date.utils.ts`.
- Encapsulamento e injeção de dependência via **services `@Injectable`**: `ScheduleService` compõe o catálogo do PNI + registros e gera a agenda; o acesso ao Firebase fica restrito aos 4 services de dados.

### Justificativa das tecnologias

| Tech | Papel | Por que (justificativa) |
|---|---|---|
| **Ionic Framework** | UI mobile-first | Exigido no desafio; entrega componentes prontos (cards, badges, tabs) e responsividade automática em mobile/tablet/desktop, acelerando entrega no prazo curto. |
| **Angular** | Framework SPA | Exigido; DI nativa favorece separar services e testar a lógica; TypeScript dá tipagem forte que sustenta a modelagem de domínio. |
| **TypeScript** | Linguagem | Tipos = menos bugs e modelos de domínio expressivos (enums, interfaces). |
| **Firebase Authentication** | Login real | Multiusuário com dados isolados por `uid`, sem backend próprio; e-mail/senha cobre o MVP. |
| **Firestore** | Persistência (diferencial) | NoSQL em tempo real, sem backend próprio; modelagem por coleções (`children`, `vaccinationRecords`, `campaigns`) casa com o domínio; tier grátis suficiente. |
| **AngularFire (`@angular/fire`)** | Integração Firebase | Providers `provideX` no bootstrap standalone, DI mockável nos testes e observables RxJS nativos (ver ADR-006). |
| **Firebase Hosting** | Deploy (diferencial) | Publicação simples, HTTPS, integra com Firestore; um comando para subir. |
| **Karma/Jasmine** | Testes | Já vêm no Angular; baixo atrito para os testes unitários da lógica de status. |
| **Git + commits semânticos** | Versionamento | Histórico legível demonstra processo (avaliado). |

> Estratégia de risco: o acesso ao Firebase fica **isolado em 4 services de dados**; o domínio (`ScheduleService`, `computeStatus`) é puro e testável sem Firebase (services mockáveis). Assim a regra de status — a joia da coroa — tem cobertura de testes independente da infraestrutura.

---

## FASE 3 — Desenvolvimento e boas práticas (resumo operacional)

### Testes (poucos, mas certeiros)
Foque na joia da coroa — `computeStatus` / `ScheduleService`:
1. Dose com registro de aplicação → **Aplicada** (mesmo se a data passou).
2. Dose mais de 30 dias após a data prevista, sem registro → **Atrasada**.
3. Borda: exatamente 30 dias após o previsto → **Pendente** (ainda na tolerância).
4. Borda: 60 dias antes → **Futura**; 59 dias antes → **Pendente**.

---
