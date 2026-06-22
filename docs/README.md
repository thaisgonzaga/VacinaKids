# VacinaKids — A carteira de vacinação infantil que avisa antes de atrasar

> App em Ionic + Angular para pais e responsáveis acompanharem a jornada de vacinação dos filhos: o que já foi aplicado, o que está pendente ou **atrasado**, e quais campanhas estão ativas.

![paleta](https://img.shields.io/badge/cores-%23ABC270%20%23FEC868%20%23FDA769%20%23473C33-FDA769)
![stack](https://img.shields.io/badge/stack-Ionic%20%2B%20Angular-3880FF)

## O problema
Desde 2015 o Brasil enfrenta queda contínua na cobertura vacinal infantil e voltou à lista dos países com mais crianças não vacinadas (229 mil em 2024, segundo UNICEF/OMS). Um dos fatores mais evitáveis é a **perda de acompanhamento**: o calendário do PNI tem dezenas de doses nos primeiros anos de vida, com intervalos variáveis, registradas numa carteira de papel que se perde, não avisa sobre atrasos e não dá conta de famílias com vários filhos. O abandono entre a 1ª e a 2ª dose passa de 50% em alguns estados. É exatamente essa lacuna de organização que software resolve bem.

## A solução
Um aplicativo que digitaliza o acompanhamento vacinal. Para cada criança cadastrada, o VacinaKids gera a agenda baseada no Calendário Nacional de Vacinação 2026 e calcula automaticamente o status de cada dose (**Aplicada, Pendente, Atrasada, Futura**) a partir da data de nascimento. Mostra um painel da situação vacinal com indicadores visuais, explica para que serve cada vacina e lista campanhas ativas — tudo separado por criança, sem misturar históricos.


## Arquitetura
Camadas: UI (Ionic) → Componentes reutilizáveis → Services (regra de negócio) → Models (DTOs + enum) → Persistência (Firebase Auth + Firestore, isolada por `uid`).
Detalhes e diagrama em [`/docs/architecture.md`](docs/architecture.md).

## Tecnologias e justificativas

| Tech | Papel | Por que escolhi |
|---|---|---|
| Ionic Framework | UI mobile-first responsiva | Exigido; componentes prontos e responsividade em mobile/tablet/desktop, ideal no prazo curto |
| Angular | Framework SPA | Exigido; DI facilita separar e testar services; base sólida para POO |
| TypeScript | Linguagem | Tipagem forte sustenta os modelos de domínio (enums, classes) |
| Firebase Authentication | Login real (e-mail/senha) | Multiusuário com dados isolados por `uid`, sem backend próprio |
| Firestore | Persistência (diferencial) | Tempo real, sem backend próprio; coleções casam com o domínio; isolado por `uid` |
| AngularFire (`@angular/fire`) | Integração Firebase | Providers `provideX` no bootstrap standalone; DI mockável; observables RxJS nativos |
| Firebase Hosting | Deploy (diferencial) | Publicação simples com HTTPS, integra com Firestore |
| Karma + Jasmine | Testes | Nativos do Angular; baixo atrito para testar a lógica de status |

## Como rodar localmente
```bash
# pré-requisitos: Node LTS e npm
npm install -g @ionic/cli
git clone https://github.com/<voce>/vacina-kids.git
cd vacina-kids
npm install
ionic serve          # abre em http://localhost:8100

# build de produção
ionic build --prod

# testes
npm test
```
> O app requer um projeto Firebase. O repositório já traz o bloco `firebase` preenchido para o projeto de demonstração `vacina-kids-94e19` em `src/environments/environment.ts` e `environment.prod.ts` (chaves web do Firebase são públicas por design — a segurança real está nas `firestore.rules`). Para apontar para outro projeto, substitua esse bloco (apiKey, authDomain, projectId, etc.) e habilite Authentication (e-mail/senha) + Firestore. Sem uma configuração válida, login e persistência não funcionam (não há fallback de seed local).


## Decisões técnicas
Registros de decisão (ADRs) em [`/docs/`](docs/):
- ADR-001 — Ionic + Angular como base
- ADR-002 — Persistência em Firestore + Auth desde o início (isolamento por `uid`)
- ADR-003 — Modelagem do cálculo de status vacinal (versão inicial, mantida como histórico)
- ADR-004 — Modelagem do status: função pura com janela de tolerância — substitui ADR-003
Uso consciente de IA documentado em [`/docs/uso-de-ia.md`](docs/uso-de-ia.md).

## Próximos passos / Roadmap
- Vacinas de viajante e casos especiais (CRIE)
- Exportar carteira em PDF
- Idade 5–14 anos completa (HPV, reforços)
- Perfil de acesso administrativo

## Autor
Thaís Rodrigues Gonzaga

---
_Aviso: ferramenta de organização e acompanhamento. Não substitui orientação médica nem as fontes oficiais do Ministério da Saúde._
