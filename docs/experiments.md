# Log de experimentos

Registro curto das tentativas que moldaram as decisões. As datas refletem o registro consolidado no commit inicial do repositório (2026-06-20); as decisões foram tomadas durante o planejamento (Fases 1–2 de `01-04-fases.md`).

- **2026-06-20 — Timeline: tabs vs. accordion** — testei abas por faixa etária e accordion único. Accordion venceu: cabe melhor no mobile e dá visão contínua da jornada.
- **2026-06-20 — Firebase: AngularFire vs. SDK modular puro** — comecei avaliando o SDK modular (v9) por bundle menor, mas adotei o **AngularFire** (`@angular/fire`): providers `provideX` alinhados ao bootstrap standalone, DI mockável nos testes e observables RxJS nativos pesaram mais que o bundle. (ver ADR-006)
- **2026-06-20 — Indicador de cobertura: barra vs. anel (ring)** — anel comunica "% em dia" de forma mais imediata no dashboard.
- **2026-06-20 — Regra de status: limites rígidos vs. janela de tolerância** — limites rígidos marcavam "Atrasada" já no dia seguinte ao previsto. Adotei uma **janela de tolerância**: Atrasada só após 30 dias do previsto e Pendente já a partir de 60 dias antes — doses do PNI têm janela de aplicação, não data exata. (ver ADR-005)
