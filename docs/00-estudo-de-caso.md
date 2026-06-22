# Estudo de Caso — Acompanhamento da Vacinação Infantil

> Pesquisa de embasamento conduzida antes de qualquer decisão de produto.
> Objetivo: entender o problema real para que a solução seja relevante, e não apenas "bonita".

## 1. Por que esse problema importa (o contexto brasileiro)

O Brasil já foi referência mundial em imunização, mas vive uma **crise prolongada de cobertura vacinal infantil** desde 2015. Os números são contundentes:

- O **Anuário VacinaBR 2025** (Instituto Questão de Ciência + SBIm + UNICEF) mostra queda contínua e generalizada das coberturas a partir de 2015, intensificada após 2020. **Nenhuma das vacinas infantis do calendário nacional atingiu a meta do PNI em todos os estados em 2023.**
- Dados de 2024 (UNICEF/OMS) recolocaram o Brasil na lista dos países com mais crianças não vacinadas: **17ª posição, com 229 mil crianças sem vacina.**
- A meta de cobertura segura é de **95%**, e o país não a alcança de forma consistente.
- O **abandono entre doses** é um problema crônico: vacinas multidose (como a tríplice viral) têm alta evasão entre a 1ª e a 2ª dose — em alguns estados acima de **50%**.
- Doenças controladas voltam a circular: as Américas acumularam **mais de 7 mil casos de sarampo em 2025**, um aumento de 29× em relação ao ano anterior.

### Causas apontadas pela literatura
1. **Hesitação vacinal** — atraso ou recusa mesmo com a vacina disponível. Apontada como o principal obstáculo para retomar os 95%.
2. **Desinformação / fake news** e movimentos antivacina (agravados na pandemia).
3. **Esquecimento e perda de acompanhamento** — esquemas complexos, muitas doses, intervalos variáveis. É exatamente aqui que uma ferramenta digital ajuda.
4. Fragilidade da **carteira física**: papel que se perde, molha, desbota, fica numa gaveta. Não avisa, não calcula atraso, não centraliza vários filhos.

> **Conclusão para o produto:** dos quatro fatores, software não resolve hesitação ideológica nem desinformação sozinho, mas ataca diretamente **esquecimento, perda de acompanhamento e fragilidade do papel**. É aí que mora o valor real do MVP.

## 2. O calendário oficial (PNI 2026) — base de dados do app

Fonte: Ministério da Saúde — Calendário Nacional de Vacinação 2026, Criança (0 a 9 anos, 11 meses e 29 dias).

| Idade prevista | Vacina | Dose | Doenças evitadas |
|---|---|---|---|
| Ao nascer | Hepatite B | 1 dose | Hepatite B e D |
| Ao nascer | BCG | 1 dose | Formas graves de tuberculose; efeito contra hanseníase |
| 2 meses | Penta (DTP+Hib+HB) | 1ª dose | Difteria, tétano, coqueluche, Hib, hepatite B |
| 2 meses | VIP (pólio inativada) | 1ª dose | Poliomielite |
| 2 meses | Pneumocócica 10-valente | 1ª dose | Doenças pneumocócicas invasivas |
| 2 meses | Rotavírus humano | 1ª dose | Gastrenterite viral |
| 3 meses | Meningocócica C | 1ª dose | Doenças meningocócicas tipo C |
| 4 meses | Penta | 2ª dose | (idem 2 meses) |
| 4 meses | VIP | 2ª dose | Poliomielite |
| 4 meses | Pneumocócica 10 | 2ª dose | Doenças pneumocócicas |
| 4 meses | Rotavírus | 2ª dose | Gastrenterite viral |
| 5 meses | Meningocócica C | 2ª dose | Meningococo C |
| 6 meses | Penta | 3ª dose | (idem) |
| 6 meses | VIP | 3ª dose | Poliomielite |
| 6 meses | Influenza | 1ª dose (anual) | Gripe |
| 6 meses | Covid-19 | 1ª dose | Formas graves de Covid-19 |
| 9 meses | Febre amarela | 1 dose | Febre amarela |
| 12 meses | Pneumocócica 10 | Reforço | Doenças pneumocócicas |
| 12 meses | Meningocócica ACWY | 1 dose | Meningococo A, C, W, Y |
| 12 meses | Tríplice viral (SCR) | 1ª dose | Sarampo, caxumba, rubéola |
| 15 meses | DTP | 1º reforço | Difteria, tétano, coqueluche |
| 15 meses | VIP | Reforço | Poliomielite |
| 15 meses | Tríplice viral (SCR) | 2ª dose | Sarampo, caxumba, rubéola |
| 15 meses | Varicela | 1ª dose | Catapora |
| 15 meses | Hepatite A | 1 dose | Hepatite A |
| 4 anos | DTP | 2º reforço | Difteria, tétano, coqueluche |
| 4 anos | Febre amarela | Reforço | Febre amarela |
| 4 anos | Varicela | 2ª dose | Catapora |
| 9–14 anos | HPV4 | 1 dose | HPV (vários cânceres) |

> Esta tabela vira o **catálogo estático** do app (`data/pni-2026.catalog.ts`). Para o MVP foco em 0–4 anos, onde está a maior densidade de doses e o maior risco de atraso/abandono.

## 3. Personas

- **Marina, 29, mãe de primeira viagem.** Bebê de 5 meses. Ansiosa para não errar. Quer saber "o que é a próxima e quando". → precisa de **clareza do próximo passo** e **explicação simples de cada vacina**.
- **Carlos, 38, pai de 3 filhos** (6 meses, 4 anos, 8 anos). Vive confundindo quem tomou o quê. → precisa de **separação clara por criança** e **visão de pendências**.
- **Joana, agente comunitária de saúde** (uso secundário/futuro). Acompanha famílias do bairro. → reforça o valor de **status visual rápido**.

## 4. Jobs To Be Done (o que o usuário realmente quer)

1. "Quando é a próxima vacina do meu filho?" → próximo passo visível.
2. "Ele está atrasado em alguma?" → indicador de pendência inequívoco.
3. "Pra que serve essa vacina?" → informação confiável e simples.
4. "Tenho 3 filhos, não quero misturar." → contexto por criança.
5. "Tem alguma campanha rolando?" → bloco de campanhas.

## 5. Mapeamento problema → cenários do desafio → feature

| Dor real (pesquisa) | Cenário do desafio | Feature no app |
|---|---|---|
| Esquemas complexos, esquecimento | Cenário 1 (feito vs. a fazer) | Linha do tempo do calendário com status |
| Abandono entre doses, atraso | Cenário 2 (pendência vencida) | Status **Atrasada** + indicador visual de alerta |
| Baixa adesão a campanhas | Cenário 3 (campanha ativa) | Card de campanhas ativas |
| Famílias com vários filhos | Cenário 4 (multi-filhos) | Seletor de criança + dados isolados por perfil |
| Carteira de papel frágil | (transversal) | Dados digitais persistidos no Firestore, isolados por usuário (uid) |

## 6. Fontes consultadas

- Ministério da Saúde — Calendário Nacional de Vacinação 2026 (Criança). gov.br/saude
- UNICEF Brasil — Anuário VacinaBR 2025.
- SBIm — análise do Anuário VacinaBR.
- Jornal da USP — "Cobertura vacinal infantil: onde estamos e para onde vamos" (2025).
- Fiocruz — Repórter SUS sobre cobertura vacinal (2025).
- Conselho Federal de Medicina — meta de 95% e hesitação vacinal.
- Cad. Saúde Pública — Hesitação vacinal infantil e COVID-19 no Brasil (2024).
- Sociedade Brasileira de Pediatria — Calendário de Vacinação 2025-2026.

> **Disclaimer de produto:** o app é uma ferramenta de **acompanhamento e organização**, não substitui orientação médica nem a fonte oficial. Esse aviso deve aparecer no app.
