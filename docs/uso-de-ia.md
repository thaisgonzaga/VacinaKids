# Uso consciente de IA

Transparência sobre onde a IA ajudou e onde o julgamento foi meu.

## Onde usei IA
- Levantar o Calendário Nacional de Vacinação 2026 e reunir fontes (UNICEF, Fiocruz, SBIm, Ministério da Saúde).
- Esboçar a arquitetura em camadas e o template de README/ADRs.
- Gerar boilerplate de componentes Ionic e os esqueletos dos casos de teste.
- Revisar nomenclatura, acessibilidade e consistência das cores.
- Realizar o Design

## O que revisei / reescrevi manualmente
- **Modelagem de status** (`computeStatus`): revisei a regra para adotar uma **janela de tolerância** em vez de limites rígidos — não marcar "Atrasada" no vencimento exato (só após 30 dias) e já tratar doses próximas como "Pendente" (a partir de 60 dias antes), porque as doses do PNI têm janela de aplicação. Também movi a regra para uma **função pura** (`core/utils/status.ts`), fora dos models.
- **Persistência e autenticação**: decidi usar Firestore + Firebase Auth reais desde o início, com dados isolados por `uid` — em vez do seed local inicialmente cogitado.
- **Validação dos dados de saúde**: conferi cada linha do calendário contra a fonte oficial gov.br. Dado de saúde não entra sem checagem.
- **Decisões de escopo e produto**: o que entra no MVP e o que vira roadmap foi decisão minha.

## O que NÃO deleguei
- Verificação factual dos dados de vacinação.
- Decisões de UX dos fluxos principais.

