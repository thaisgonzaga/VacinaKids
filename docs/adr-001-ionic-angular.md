# ADR-001 — Ionic + Angular como base

## Status
Aceito.

## Contexto
O desafio exige Ionic Framework com Angular. Precisamos de UI responsiva (mobile, tablet, desktop) e de uma base que favoreça código organizado e testável em prazo curto.

## Decisão
Usar Ionic + Angular + TypeScript. Componentes Ionic para UI; Angular DI para separar services; TypeScript para os modelos de domínio.

## Consequências
- (+) Responsividade quase de graça com componentes Ionic.
- (+) DI facilita testar a lógica isolada da UI.
- (+) Tipagem forte sustenta POO (enums, classes).
- (−) Curva inicial de configuração do ambiente Ionic.
