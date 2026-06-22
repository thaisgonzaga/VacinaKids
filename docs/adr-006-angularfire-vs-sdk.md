# ADR-006 — AngularFire em vez do SDK modular puro

## Status
Aceito.

## Contexto
Havia a opção de usar o SDK modular do Firebase (v9+) diretamente ou a biblioteca oficial AngularFire (`@angular/fire`). Uma anotação inicial em `experiments.md` chegou a favorecer o SDK puro por bundle menor; ao definir a arquitetura de testes e de providers, a decisão foi revista.

## Decisão
Usar **AngularFire** (`@angular/fire@^20` com `firebase@^12`): providers `provideFirebaseApp` / `provideAuth` / `provideFirestore` no `main.ts`, encapsulados em `core/firebase/firebase.providers.ts`.

## Consequências
- (+) Padrão de `provideX` alinhado ao bootstrap standalone do Angular 20.
- (+) Injeção de dependência mockável nos testes.
- (+) Observables RxJS nativos (`user(auth)`, `collectionData`) integram com o restante do app reativo.
- (−) Camada de abstração a mais sobre o SDK; peer deps a alinhar (`@angular/core@^20`, `rxjs@~7.8`).
