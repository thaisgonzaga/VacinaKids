# Requisitos do Sistema — VacinaKids

> Especificação de requisitos funcionais e não funcionais do MVP.
> Base: estudo de caso, ADRs e plano de execução (Fases 1–4 de `01-04-fases.md` — conceituais: planejamento/arquitetura/desenvolvimento/documentação; não confundir com as Fases 0–5 de implementação do PLANO/TAREFAS).

---

## Requisitos Funcionais

### RF01 — Gestão de crianças
- **RF01.1** — Cadastrar criança com nome e data de nascimento.
- **RF01.2** — Listar todas as crianças cadastradas.
- **RF01.3** — Selecionar/alternar entre crianças, mantendo dados isolados por perfil (sem misturar históricos).
- **RF01.4** — Editar e remover criança cadastrada (a remoção apaga em cascata os registros de aplicação da criança).

### RF02 — Calendário e linha do tempo vacinal
- **RF02.1** — Gerar automaticamente a agenda de vacinação de cada criança a partir do Calendário Nacional de Vacinação 2026 (PNI), com foco em 0–4 anos.
- **RF02.2** — Exibir a jornada vacinal em linha do tempo (accordion) organizada por faixa etária.
- **RF02.3** — Calcular o status de cada dose com base na data de nascimento, data prevista e data atual.

### RF03 — Cálculo de status da dose (com janela de tolerância)
- **RF03.1** — Classificar dose com registro de aplicação como **Aplicada** (mesmo que a data prevista tenha passado).
- **RF03.2** — Sem registro, com hoje a **60 dias ou mais** antes da data prevista (`diff ≤ -60`) → **Futura**.
- **RF03.3** — Sem registro, com hoje mais de 30 dias **após** a data prevista → **Atrasada**.
- **RF03.4** — Sem registro, dentro da janela de tolerância (de **59 dias antes** até **30 dias após**, inclusive, a data prevista — `-60 < diff ≤ 30`) → **Pendente** (sem alarmar no vencimento exato).

### RF04 — Registro de aplicação
- **RF04.1** — Marcar uma dose como aplicada, informando a data de aplicação.
- **RF04.2** — Refletir imediatamente o novo status após o registro.

### RF05 — Detalhe da vacina
- **RF05.1** — Exibir doenças evitadas, número/ordem da dose, idade prevista e explicação simples de cada vacina.

### RF06 — Campanhas
- **RF06.1** — Listar campanhas ativas (título, descrição, público-alvo e período), destacando a campanha prioritária.

### RF07 — Dashboard de situação vacinal
- **RF07.1** — Exibir, por criança, o percentual de doses em dia (anel/ring de cobertura) e o número de pendências.
- **RF07.2** — Comunicar status por indicadores visuais (cor + ícone).
- **RF07.3** — Destacar pendências atrasadas, identificáveis em ≤ 2 toques a partir do dashboard.

### RF08 — Persistência
- **RF08.1** — Persistir crianças, registros e campanhas no **Cloud Firestore**, com dados isolados por usuário (`uid`); campanhas em coleção global somente leitura.
- **RF08.2** — Encapsular o acesso aos dados nos services (`ChildrenService`, `VaccinationService`, `CampaignService`), de modo que páginas e componentes não conheçam a fonte do dado.

### RF09 — Aviso de uso
- **RF09.1** — Exibir disclaimer de que o app é uma ferramenta de organização e acompanhamento, e não substitui orientação médica nem as fontes oficiais do Ministério da Saúde.

### RF10 — Autenticação e conta
- **RF10.1** — Cadastro e login reais por e-mail/senha (Firebase Authentication).
- **RF10.2** — Recuperação de senha por e-mail.
- **RF10.3** — Logout, alteração de senha (com reautenticação) e atualização dos dados da conta.
- **RF10.4** — Isolamento por `uid`: os dados de um usuário nunca aparecem para outro (reforçado por regras de segurança do Firestore).

---

## Requisitos Não Funcionais

### RNF01 — Usabilidade
- Responder "qual a próxima vacina e quando?" em menos de 5 segundos de navegação.
- Comunicação de status por cores quentes + ícones, mais rápida que texto.

### RNF02 — Compatibilidade / Responsividade
- Layout responsivo verificado em mobile, tablet e desktop (3 larguras).

### RNF03 — Desempenho
- Lighthouse mobile ≥ 80 em Performance.

### RNF04 — Acessibilidade
- Lighthouse mobile ≥ 80 em Acessibilidade.

### RNF05 — Identidade visual
- 100% das telas usando exclusivamente a paleta oficial:

| Cor | Hex | Uso |
|---|---|---|
| Verde | `#ABC270` | Status **Aplicada** / "em dia" |
| Amarelo | `#FEC868` | Status **Pendente** / próxima dose |
| Laranja | `#FDA769` | Status **Atrasada** / alerta + campanhas |
| Marrom | `#473C33` | Texto principal, títulos, contraste |

### RNF06 — Manutenibilidade / Arquitetura
- Separação estrita de responsabilidades: páginas orquestram, componentes burros (`input()`/`output()` via signals), services com a regra de negócio, models como **DTOs/interfaces** (lógica em funções puras e services, fora dos models).
- Lógica de status centralizada e única na função pura `computeStatus` (`core/utils/status.ts`), sem duplicação na UI.
- Acesso ao Firebase isolado em 4 services de dados; o domínio (`ScheduleService`, `computeStatus`) não depende do Firebase.
- Ao menos 1 componente reutilizável usado em pelo menos 2 telas.

### RNF07 — Testabilidade / Confiabilidade
- Lógica de status isolada em função pura testável, com ≥ 3 testes unitários passando (Karma/Jasmine), cobrindo as bordas da tolerância (30/-60).

### RNF08 — Integridade dos dados de saúde
- Dados do calendário validados contra a fonte oficial gov.br antes de entrarem no sistema.

### RNF09 — Segurança / Deploy
- Build de produção sem erros e deploy público acessível via HTTPS (Firebase Hosting).
- Regras de segurança do Firestore garantindo isolamento por `uid`.

### RNF10 — Versionamento
- Histórico de commits semânticos (Conventional Commits).

---

## Rastreabilidade (requisito → origem)

| Requisito | Origem |
|---|---|
| RF01–RF02, RF04–RF07 | Escopo do MVP (Fase 1) e mapeamento problema → feature (estudo de caso) |
| RF03 | ADR-005 (modelagem do status com janela de tolerância) |
| RF08 | ADR-004 (persistência Firestore + isolamento por uid) e architecture.md |
| RF09 | Disclaimer de produto (estudo de caso) |
| RF10 | ADR-004 (autenticação e isolamento por uid) e decisões do plano de implementação |
| RNF01, RNF03, RNF04 | Métricas de sucesso (Fase 1) |
| RNF05 | Paleta obrigatória do desafio |
| RNF06 | architecture.md e ADR-001/005 |
| RNF07, RNF10 | Boas práticas (Fase 3) |
| RNF08 | uso-de-ia.md (verificação factual) |
| RNF09 | ADR-004 (regras de segurança) e Fase 4 (deploy) |
