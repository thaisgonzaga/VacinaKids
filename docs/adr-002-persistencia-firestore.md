# ADR-004 — Persistência em Firestore desde o início (isolamento por uid)

## Status
Aceito.

## Contexto
Ao consolidar o plano de implementação, decidiu-se ter persistência real e autenticação **desde o início**: o app é multiusuário, com os dados de cada responsável isolados por conta. Um seed local não suportaria isolamento por usuário nem o requisito de autenticação real.

## Decisão
- **Cloud Firestore desde o início**, sem camada de seed local em JSON.
- **Firebase Authentication** (e-mail/senha) real: cadastro, login, recuperação e troca de senha.
- **Isolamento por `uid`**: coleções `children` e `vaccinationRecords` sempre filtradas por `where('uid','==',uid)`; `campaigns` é coleção global somente leitura. As regras de segurança do Firestore reforçam o isolamento.
- **Catálogo do PNI estático no app** (`data/pni-2026.catalog.ts`), não persistido.
- Exclusão de criança apaga seus registros em **cascata** (`writeBatch`).
- O acesso ao Firebase fica encapsulado em 4 services de dados (`AuthService`, `ChildrenService`, `VaccinationService`, `CampaignService`); páginas/componentes não conhecem a origem do dado. A lógica de domínio (`ScheduleService`, `computeStatus`) é pura e testável sem Firebase (mock dos services).

## Consequências
- (+) Multiusuário real com dados isolados por conta desde o MVP.
- (+) Sincronização entre dispositivos e tempo real "de graça".
- (+) Lógica de domínio continua testável sem Firebase (services mockáveis).
- (−) Configuração do Firebase passa a ser pré-requisito para rodar o app (sem fallback offline por seed).
- (−) Campanhas precisam ser semeadas via console/admin (write do cliente é negado).
