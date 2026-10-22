# L-3903A1/A2 Concept — U-39

Versão 2.0 | One-page HTML estática + Progressive Web App (PWA) | Prototipagem didática não validada.

## Conteúdo incluído

- Visão geral com valores e diagrama original fornecido pelo usuário.
- Descritivo técnico integral: PT-029A/B, PDX-029A, PDIC-029, PT-028, PIC-028, PDY-029A, ZIC-009, PDY-029B, HS-39014, PDY-029K/N, conversores I/P, realimentações ZI-39968/ZI-39966, supervisão ZDSHL/ZDAHL e banda morta.
- Simulador contínuo animado de pressão do regenerador e separador, vazão relativa dos gases, seleção de maior, MV de dois controladores, comandos individuais e posições reais das slides.
- Variáveis modificáveis: geração de gases, pressão do separador, contrapressão, SP diferencial, SP de pressão, modos AUTO/MAN, MV manual, caminho de distribuição hipotético, HS-39014 (apenas hipótese), offsets ilustrativos, MV do ZIC-009, banda morta, falhas de atuador, lentidão e erro de medição.
- Oito cenários de diagnóstico e opções de aplicação direta no simulador.
- Animação de escoamento, gráficos com históricos e exportação CSV.
- Avaliação CIC de 16 perguntas com alternativas reordenadas, respostas distribuídas pelas letras e justificativas.
- Fundamentação de mecânica dos fluidos, limites, advertências de validação e referências técnicas.

## Instalação em GitHub Pages

1. Crie um repositório (por exemplo `L-3903-Concept`).
2. Envie `index.html`, `style.css`, `app.js`, `sw.js`, `manifest.webmanifest` e a pasta `assets/` para a raiz. Preserve os nomes e caminhos.
3. No GitHub, acesse **Settings > Pages > Build and deployment > Deploy from a branch**, escolha `main` e `/ (root)`.
4. Abra o endereço HTTPS disponibilizado pelo GitHub Pages. No celular, use o botão **Instalar App** quando a instalação estiver disponível. No iPhone/Safari, use **Compartilhar > Adicionar à Tela de Início**.
5. Em caso de atualizações e cache antigo, altere `CACHE_NAME` no `sw.js` e recarregue a página. A versão atual usa estratégia network-first com fallback offline para os recursos locais.

O app não precisa de bibliotecas externas, servidor de back-end ou credenciais. A navegação entre as seções ocorre na mesma página.

## Modelo matemático do laboratório (não validado)

- O balanço dinâmico é `dPreg/dt ≈ 0,00165 × (geração relativa − vazão relativa)`.
- A vazão relativa é `[(posição A1 + posição A2)/2] × sqrt(max(0,04; Preg − Pjus)/1,27)`.
- Cada posição real segue o alvo com dinâmica de primeira ordem, `dA/dt = (alvo − A)/tau`; `tau = 9 s` na condição padrão e `48 s` no modo lento. A falha de travamento congela a posição.
- O PDIC utiliza controle PI incremental ilustrativo de ação direta. O PIC utiliza correção incremental e uma faixa de ativação didática próxima do SP. O PDY-029A escolhe a maior MV.
- A distribuição A1/A2 e o efeito experimental de HS-39014 são hipóteses de treinamento — NÃO reproduzem lógica confirmada.
- A condição original de fotografia tem P(D-3904) = 2,47 e P(D-3902) = 2,20, que matematicamente dão ΔP = 0,27; a tela original exibe 0,25. O simulador calcula o diferencial consistente com seus próprios valores e não reproduz artificialmente essa divergência.
- SPs, bandas de desvio e parâmetros do laboratório não são limites de segurança nem instruções para a operação da planta.

## Documentação de referência

- Manual da Unidade U-39 (trajeto regenerador → L-3903 → câmara de orifícios F-3902 → potes de selagem).
- PE.REF.OPE.CCF.063 — Transferência do Controle de Pressão do Regenerador.
- Captura de tela original de controle L-3903A1/A2, fornecida pelo usuário.

## Evidências a obter antes de considerar validação de engenharia

Diagrama lógico completo de PDY-029B/HS-39014; parâmetros de controle do ZIC-009 e ZIC-029; distribuição dos ramais; parâmetros PI/PID e rastreamento; banda morta real; supressão e temporização de alarmes; curvas reais de vazão das slides; tempos de curso, modos de falha, permissivos e setpoints aprovados; unidades e sincronismo dos transmissores.

**Não utilizar este protótipo para comandar equipamentos, definir limites de operação, testar intertravamentos industriais ou substituir o procedimento controlado da unidade.**

## Refinamentos na V2

- Circuito de gases redesenhado corretamente: D-3904 → L-3903A1/A2 (em paralelo) → F-3902, separado do D-3902 (referência de pressão).
- Diagnóstico de coerência entre PT-028, PT-029B e ΔP físico versus medido, inclusive falha de instrumento.
- Supervisão de desvio sustentado, com temporização hipotética configurável entre 0 e 20 s, separada da banda morta; registro de transições e eventos.
- Cinco missões guiadas com verificação de evidências e progresso contínuo de estabilização.
- Passo de +1 s em modo pausa, comando manual individual a partir de clique/tecla em cada slide do diagrama e cartões responsivos no mobile.
- Tendência de ΔP físico além do ΔP medido e leitura do erro no diagnóstico.
- Continuidade de conteúdo técnico, oito cenários CIC, quiz de dezesseis perguntas e documentação de limites.
