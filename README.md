# L-3903A1/A2 Concept — V2.8: correção do espaço vazio no desktop

**Origem da correção:** na V2.7, `.sim-main` e `.sim-controls` eram duas colunas independentes. A coluna esquerda terminava na tendência, mas o faceplate e os controles da direita continuavam por uma altura muito maior, produzindo uma área vazia grande.

**Correção aplicada na V2.8 (somente largura de tela >= 1024 px):**

- O simulador usa uma grade principal de 12 colunas, com animação e indicadores da HS/PDY/ZIC alinhados na primeira faixa.
- As três tendências passam para uma faixa de largura total, lado a lado, sem longos gráficos empilhados em meia coluna.
- Distúrbios, setpoints e falhas são colocados em três painéis na mesma faixa.
- O painel de roteamento HS-39014/ZIC-009 ocupa largura total, dividido internamente em contexto operacional e faceplate didático.
- Todos os controles e IDs originais foram preservados; o motor da simulação e os valores de ganhos/atuação da V2.7 não foram alterados.
- Visualização mobile/tablet estreito, swipe horizontal do SVG e faceplate mobile permanecem com a disposição anterior.
- O cache da PWA foi atualizado para `l3903-concept-v2-8-desktop-grid-20261106`.

## Publicação

Enviar todo o conteúdo extraído deste ZIP para a raiz do repositório. Ao usar apenas atualizações incrementais, substituir `index.html`, `style.css` e `sw.js`; `app.js`, manifesto e assets continuam iguais à V2.7.

---

# L-3903A1/A2 Concept — V2.6 · Faceplate ZIC-009

A V2.6 acrescenta ao faceplate didático do ZIC-009 dois modos de atuação sem alterar a compensação suave da V2.5 nem o controle do diferencial PDIC-029 / PIC-028.

## Modos

- **AUTO · SP:** operador digita SP do ZIC; PV = MV selecionada por PDY-029A. A saída ZIC para a slide auxiliar somente é corrigida quando o desvio absoluto atinge 3 pontos percentuais (saída com histerese didática de 0,4 p.p.). Quando retorna à banda, a última MV é retida.
- **AUTO · MV DIRETA (comando do operador):** operador digita saída MV, sem utilização da banda morta nem da comparação PV × SP para determinar a MV. A MV percorre uma rampa suave de 0,07 ponto percentual por segundo simulado, como hipótese didática. No sentido estrito de instrumentação, este **não é controle automático por realimentação do ZIC**; é comando direto de saída, com compensação indireta do PDIC pela outra slide.

Em ambos os casos, a HS-39014 mantém a seleção de A1 ou A2 para receber o PDY-029A. A slide restante recebe o sinal de comando do ZIC. A troca de modo parte da MV atual para evitar saltos no modelo.

O conjunto de modos é exercício de treinamento, e a existência real do comando por MV em modo AUTO no SDCD precisa ser validada na configuração funcional.

## Para publicar

Envie **todos** os arquivos deste pacote mantendo a estrutura `assets/` na raiz do repositório GitHub Pages. A chave de cache do Service Worker foi alterada para a V2.6.

# L-3903A1/A2 Concept — U-39

Versão 2.5 | One-page HTML estática + Progressive Web App (PWA) | Prototipagem didática não validada.

## Conteúdo incluído

- Visão geral com valores e diagrama original fornecido pelo usuário.
- Descritivo técnico integral: PT-029A/B, PDX-029A, PDIC-029, PT-028, PIC-028, PDY-029A, ZIC-009, PDY-029B, HS-39014, PDY-029K/N, conversores I/P, realimentações ZI-39968/ZI-39966, supervisão ZDSHL/ZDAHL e banda morta.
- Simulador contínuo animado de pressão do regenerador e separador, vazão relativa dos gases, seleção de maior, MV de dois controladores, comandos individuais e posições reais das slides.
- Variáveis modificáveis: geração de gases, pressão do separador, contrapressão, SP diferencial, SP de pressão, modos AUTO/MAN, MV manual, caminho de distribuição hipotético, HS-39014 (seleção real A1/A2 do destino PDIC), controle independente da slide não selecionada (hipóteses ZIC/posição retida/manual), MV do ZIC-009, banda morta, falhas de atuador, lentidão e erro de medição.
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
- Cada posição real segue o alvo com dinâmica de primeira ordem, `dA/dt = (alvo − A)/tau`; `tau = 24 s` na condição padrão e `65 s` no modo lento (além de limite de deslocamento didático de 0,11 p.p./s padrão e 0,035 p.p./s lento). A falha de travamento congela a posição.
- O PDIC utiliza controle PI incremental ilustrativo de ação direta. O PIC utiliza correção incremental e uma faixa de ativação didática próxima do SP. O PDY-029A escolhe a maior MV.
- A HS-39014 seleciona qual slide recebe o caminho PDIC-029/PDY-029A, conforme esclarecimento operacional do usuário. O comportamento da slide não selecionada permanece hipotético: ZIC-009, posição retida ou referência MAN.
- A condição original de fotografia tem P(D-3904) = 2,47 e P(D-3902) = 2,20, que matematicamente dão ΔP = 0,27; a tela original exibe 0,25. O simulador calcula o diferencial consistente com seus próprios valores e não reproduz artificialmente essa divergência.
- SPs, bandas de desvio e parâmetros do laboratório não são limites de segurança nem instruções para a operação da planta.

## Documentação de referência

- Manual da Unidade U-39 (trajeto regenerador → L-3903 → câmara de orifícios F-3902 → potes de selagem).
- PE.REF.OPE.CCF.063 — Transferência do Controle de Pressão do Regenerador.
- Captura de tela original de controle L-3903A1/A2, fornecida pelo usuário.

## Evidências a obter antes de considerar validação de engenharia

Detalhes completos do PDY-029B e da transferência pela HS-39014; parâmetros da saída MV do ZIC-009 e ZIC-029; distribuição dos ramais; parâmetros PI/PID e rastreamento; supressão e temporização de alarmes; curvas reais de vazão das slides; tempos de curso, modos de falha, permissivos e setpoints aprovados; unidades e sincronismo dos transmissores.

**Não utilizar este protótipo para comandar equipamentos, definir limites de operação, testar intertravamentos industriais ou substituir o procedimento controlado da unidade.**

## Refinamentos na V2

- Circuito de gases redesenhado corretamente: D-3904 → L-3903A1/A2 (em paralelo) → F-3902, separado do D-3902 (referência de pressão).
- Diagnóstico de coerência entre PT-028, PT-029B e ΔP físico versus medido, inclusive falha de instrumento.
- Supervisão de desvio sustentado, com temporização hipotética configurável entre 0 e 20 s, separada da banda morta; registro de transições e eventos.
- Cinco missões guiadas com verificação de evidências e progresso contínuo de estabilização.
- Passo de +1 s em modo pausa, comando manual individual a partir de clique/tecla em cada slide do diagrama e cartões responsivos no mobile.
- Tendência de ΔP físico além do ΔP medido e leitura do erro no diagnóstico.
- Continuidade de conteúdo técnico, oito cenários CIC, quiz de dezesseis perguntas e documentação de limites.

## Refinamento V2.2 — 05/11/2026
No mobile, a animação passou a ser explorável horizontalmente, com gesto de arrastar, setas e opção Ver inteiro. Eliminado `overflow:hidden` e deslocamento artificial de -45px. A versão desktop não foi alterada. Alterados `index.html`, `style.css`, `app.js` e a chave de cache em `sw.js` para atualização das PWAs instaladas.

## V2.2 — Correção do funcionamento da HS-39014
- HS em A1: apenas A1 recebe o caminho PDIC/PIC via PDY-029A; A2 segue uma referência independente do laboratório.
- HS em A2: apenas A2 recebe o caminho PDIC/PIC via PDY-029A; A1 segue uma referência independente do laboratório.
- Alternativas independentes da slide não selecionada (ZIC-009, reter posição, manual) são **hipóteses didáticas** não validadas.
- Retirados offsets inventados que antes eram trocados entre slides.
- Indicadores de fonte de sinal por slide, eventos de comutação e CSV contendo HS e fonte ativa.
- V2.1 com correção da navegação mobile foi preservada como versão-base.

## V2.3 — HS-39014 + ZIC-009 com dead band de 3 pontos percentuais

Informação operacional adicional: a HS-39014 direciona o sinal PDIC-029/PDY-029A para A1 ou A2; a slide NÃO selecionada fica sob ZIC-009. O ZIC monitora o módulo da diferença entre sua PV e SP. A outra válvula somente recebe NOVO comando do ZIC quando esse desvio atinge **3 pontos percentuais**.

Modelo da simulação:
- `abs(PV_ZIC - SP_ZIC) < 3`: não emite novo comando; preserva a última referência da slide não selecionada.
- `abs(PV_ZIC - SP_ZIC) >= 3`: a MV do ZIC-009 é encaminhada somente à slide não selecionada.
- Ao voltar para dentro da faixa, é retida a última referência enviada. Esta política de retenção é hipótese didática, não configuração confirmada.
- Histórico V2.3: nesta versão antiga havia uma hipótese de PV por posição e opção manual. **Essas hipóteses foram removidas na V2.4**, após confirmação da PV proveniente do PDY-029A.
- Os testes −2,9, −3,0 e +3,0 p.p. verificam a fronteira de atuação. A banda não é do atuador nem de todos os controladores.
- Eventos e exportação CSV registram o comportamento do ZIC-009.
- Mantidas as falhas, o override do PIC, o controle manual individual e a rolagem horizontal da animação em mobile.

## V2.4 — Correção da origem PV do ZIC-009 (informação do operador)

- O operador abre o **faceplate do ZIC-009** e digita o SP percentual (ex.: 48%). O simulador reproduz esse campo, com entrada numérica e botão Aplicar SP.
- A **PV do ZIC-009 é a MV percentual que sai do PDY-029A**, ou seja, `PV_ZIC = max(MV_PDIC-029, MV_PIC-028)`. Não é a posição ZI medida na slide selecionada pela HS.
- A **HS-39014** permanece responsável por selecionar A1 ou A2 para receber o comando vindo da seleção PDY-029A. A slide não selecionada permanece sob o ZIC-009.
- A banda morta de **3 p.p.** monitora `|PV_ZIC-SP_ZIC|`. Dentro da faixa, não se emite nova correção à slide auxiliar. Ao atingir 3 p.p., o ZIC libera correção.
- Os antigos modos de fonte de PV hipotéticos (posição da slide e PV manual inventada) foram **removidos**. Os testes de fronteira ajustam diretamente o PDIC e o PIC em MAN didático para alterar a saída real do PDY-029A.
- O simulador agora ilustra a MV do ZIC corrigindo a slide auxiliar fora da banda, com ação proporcional didática; **ganho, sentido exato, retenção e dinâmica reais não foram fornecidos e precisam de validação**.
- O modelo diferencia SP do ZIC, PV do PDY e MV de saída: **a abertura da slide auxiliar não precisa coincidir numericamente com o SP** sem conhecer a estratégia do controlador (na captura SP=48%, MV=50%).
- Mantidas a navegação horizontal no celular, avaliação CIC, missões, tendências e PWA offline.


## V2.5 — Análise de compensação e estabilidade

- **Hipótese causal documentada:** com HS selecionando A1, elevar o SP do ZIC acima da PV proveniente do PDY-029A, após ultrapassar a banda de 3 p.p., pode levar à redução da MV da slide auxiliar A2 (sinal de ação didático). Isso restringe o escoamento e tende a elevar a pressão do D-3904; o PDIC poderá reagir abrindo A1. A A1 pode inicialmente fechar quando ΔP ainda estiver abaixo do SP. Invertendo HS, invertem-se os papéis.
- **Sem comando cruzado artificial:** o ZIC atua apenas na slide auxiliar; a abertura da principal é consequência indireta de ΔP, via PDIC e PDY.
- **Resposta suavizada:** filtro de PV do PDIC de 5 s, ganho proporcional e integral didáticos combinados com saída limitada por rampa e limite de variação de MV de 0,14 p.p./s; ação MV do ZIC limitada a 0,07 p.p./s (0,025 + 0,012×desvio além da banda), mais lenta; atuadores modelados com tau 24 s / 65 s e limitação de curso. Valores arbitrados para treinamento, NÃO dados da planta.
- **Banda morta:** início de atuação ao alcançar |PV−SP| ≥ 3 p.p. conforme relato; término após |PV−SP| ≤ 2,6 p.p. (histerese extra fictícia para reduzir chaveamento no limiar). Verificar filosofia real antes de assumir esse comportamento industrial.
- **Demonstração guiada:** botão “Simular SP 48% → 52%” sem forjar PV de instrumento, com indicação de comando e realimentação das duas slides.
- **Ainda não confirmado:** ação direta/reversa real do ZIC, presença de histerese, retenção do último comando, saturações, tempos, sintonia PID e lógica do PDY-029B.

### Ensaios automatizados executados na V2.5

- SP ZIC 48→52, HS=A1, 200 s simulados: A1 ~49,7%, A2 ~47,3%, ΔP ~0,301 (referência 0,300). Em 600 s: ΔP ~0,300.
- HS=A2, mesma alteração de SP: A2 ~49,7%, A1 ~47,3%, ΔP ~0,302.
- Limite: desvio 2,9 p.p. não libera correção inicial; 3,0 p.p. libera. A transição de saída possui histerese didática de 0,4 p.p.
- Navegador: ausência de erros JavaScript e de rolagem horizontal global em 360, 393, 768 e 1440 px, com rolagem interna da animação ativa no celular.

Esses ensaios validam o comportamento do protótipo, não a exatidão dos parâmetros de processo nem a adequação das manobras na planta.


## V2.7 — layout PC e acompanhamento visual
- PC >= 1180px: duas colunas equilibradas com controles menores lado a lado; a área de tendências deixa de ficar isolada junto a um painel de controle estreito e longo. A organização em resoluções móveis foi preservada.
- Na animação, dois cartões identificam qual L-3903 recebe a saída do PDY-029A pela HS e qual está sob ZIC-009.
- A slide principal recebe destaque turquesa; a auxiliar quando o ZIC atua recebe destaque âmbar, e quando retém comando fica cinza.
- Movimento indicado por `ABRINDO ↑`, `FECHANDO ↓`, `ESTÁVEL` ou `TRAVADA`, a partir da diferença entre comando e posição simulada.
- MV direta do ZIC destacada como saída direta, sem confundir com atuação automática por SP.
- A física do simulador da V2.6 não foi alterada: a nova camada é de identificação/visualização.
