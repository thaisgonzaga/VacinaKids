# ADR-005 — Modelagem do status: função pura com janela de tolerância

## Status
Aceito. Substitui o [ADR-003](adr-003-modelagem-status.md).

## Contexto
O ADR-003 concentrava a regra num método de instância `VaccineDose.computeStatus(...)` (model como classe POO) e usava limites rígidos: qualquer data prevista vencida virava **Atrasada** já no dia seguinte, e o "mesmo dia" virava Pendente. Na consolidação do plano: (a) os models passaram a ser **DTOs puros** (interfaces), com a lógica fora deles, para casar com a tipagem estrita do Firestore (`noPropertyAccessFromIndexSignature`) e facilitar mock; (b) marcar "Atrasada" logo no vencimento alarma sem necessidade — as doses do PNI têm janela de aplicação, não data exata.

## Decisão
- A regra vive em **uma função pura** `computeStatus(dataNascimento, ageMonths, hasRecord, today = new Date())` em `core/utils/status.ts` — `today` injetável para testes determinísticos. **Nenhum** componente/service recalcula status.
- Regra **com tolerância**:
  - `hasRecord` → **Aplicada**.
  - `due = addMonths(dataNascimento, ageMonths)`; `diff = diffInDays(today, due)`.
  - `diff > 30` → **Atrasada** (mais de 30 dias após a data prevista).
  - `diff > -60` → **Pendente** (de 60 dias antes até 30 dias após — janela de aplicação).
  - senão → **Futura**.
- `status-visual.ts` mapeia status → cor da paleta + ícone, mantendo apresentação separada da regra.

## Consequências
- (+) Regra única, pura e diretamente testável (alvo dos testes unitários — cobrir bordas 30/-60).
- (+) DTOs sem comportamento facilitam tipagem do Firestore e mocks.
- (+) Tolerância evita alarmar no vencimento exato e antecipa doses próximas como Pendentes.
- (−) Bordas de tolerância (30/-60) exigem testes específicos e cuidado com timezone nas datas (parsing único UTC/meia-noite).
