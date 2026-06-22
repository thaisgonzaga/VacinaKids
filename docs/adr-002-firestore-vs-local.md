# ADR-002 — Firestore vs. armazenamento local

## Status
**Substituído pelo [ADR-004](adr-004-persistencia-firestore.md).** O conteúdo abaixo é mantido como registro histórico da decisão original.

> Reversão: o app passou a usar **Firestore + Firebase Auth desde o início**, com dados isolados por `uid` e catálogo PNI estático no app — sem a camada de seed local descrita abaixo.

## Contexto
Firestore é diferencial no desafio, mas depender dele desde o início travaria UI e testes caso a configuração do Firebase atrasasse.

## Decisão
Começar com **seed local em JSON** (`assets/seed/`) para destravar desenvolvimento e testes. Plugar **Firestore** depois, atrás dos services (`ChildrenService`, `VaccinationService`), sem que páginas e componentes saibam a origem do dado.

## Consequências
- (+) App funcional offline mesmo sem Firebase.
- (+) Trocar a fonte de dados não muda a UI (services encapsulam).
- (+) Firestore vira diferencial sem virar risco de prazo.
- (−) Necessário manter contrato consistente entre seed e Firestore.
