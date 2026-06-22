# ADR-003 — Modelagem do cálculo de status vacinal

## Status
**Substituído pelo [ADR-004](adr-004-modelagem-status.md).** O conteúdo abaixo é mantido como registro histórico da decisão original.

> Reversão: a regra passou a viver numa **função pura** `computeStatus` em `core/utils/status.ts` (não num método de classe) e adotou uma **janela de tolerância** (Atrasada só após 30 dias; Pendente de 60 dias antes até 30 depois), em vez dos limites rígidos descritos abaixo.

## Contexto
O coração do app é dizer, para cada dose, se está Aplicada, Pendente, Atrasada ou Futura. Essa lógica precisa ser correta, única e testável.

## Decisão
Concentrar a regra em `VaccineDose.computeStatus(dataNascimento, hoje, registro)`, retornando o enum `VaccinationStatus`. Regras:
- Existe registro de aplicação → **Aplicada** (mesmo que a data prevista tenha passado).
- Sem registro e data prevista > hoje → **Futura**.
- Sem registro e data prevista < hoje → **Atrasada**.
- Sem registro e data prevista == hoje → **Pendente** (não alarmar).

`StatusVisual` mapeia cada status para cor da paleta e ícone, mantendo apresentação separada da regra.

## Consequências
- (+) Lógica única, sem duplicação na UI.
- (+) Diretamente testável (alvo dos testes unitários).
- (+) Fácil de evoluir (ex.: janela de tolerância) sem tocar nas telas.
