'use strict';
/* L-3903A1/A2 CONCEPT · V2.6 · MODELO EXCLUSIVAMENTE DIDÁTICO
   O modelo não representa sintonia, dinâmica ou lógica funcional validada da U-39.
   Pressões da captura são estáticas; a simulação calcula um ΔP matematicamente coerente. */
const $=id=>document.getElementById(id);
const clamp=(v,min,max)=>Math.max(min,Math.min(max,v));
const fmt=(v,n=1)=>Number(v).toFixed(n).replace('.',',');
const esc=str=>String(str).replace(/[&<>"']/g,s=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[s]));
let showToastHandle;
function toast(msg){const el=$('toast');el.textContent=msg;el.classList.add('show');clearTimeout(showToastHandle);showToastHandle=setTimeout(()=>el.classList.remove('show'),3800);}
function goPage(page){const tab=document.querySelector(`.tab[data-page="${page}"]`),section=$('page-'+page);if(!tab||!section)return;document.querySelectorAll('.tab').forEach(t=>{const active=t===tab;t.classList.toggle('active',active);t.setAttribute('aria-selected',active?'true':'false')});document.querySelectorAll('.page').forEach(p=>p.classList.toggle('active',p===section));window.scrollTo({top:Math.max(0,document.querySelector('.tabs').offsetTop-5),behavior:'smooth'});if(page==='simulator')setTimeout(()=>{renderCharts();updatePlantPan();},100);}
document.querySelectorAll('.tab').forEach(t=>t.addEventListener('click',()=>goPage(t.dataset.page)));
document.querySelectorAll('[data-go]').forEach(t=>t.addEventListener('click',()=>goPage(t.dataset.go)));
// V2.1 — navegação da animação: arraste horizontalmente, use setas ou enquadre tudo.
const plantScroll=$('plantScroll'), plantPanLeft=$('plantPanLeft'), plantPanRight=$('plantPanRight'), plantFit=$('plantFit');
function updatePlantPan(){
  const fitted=plantScroll.classList.contains('is-fit');
  const max=Math.max(0,plantScroll.scrollWidth-plantScroll.clientWidth);
  plantPanLeft.disabled=fitted||max<3||plantScroll.scrollLeft<=3;
  plantPanRight.disabled=fitted||max<3||plantScroll.scrollLeft>=max-3;
  plantFit.setAttribute('aria-pressed',String(fitted));
  plantFit.textContent=fitted?'Explorar ↔':'Ver inteiro';
  $('plantViewportStatus').textContent=fitted?'Desenho completo enquadrado (reduzido)':max<3?'Desenho inteiro visível':`Posição: ${Math.round(100*plantScroll.scrollLeft/max)}% do trajeto horizontal`;
}
plantPanLeft.addEventListener('click',()=>plantScroll.scrollBy({left:-Math.max(240,plantScroll.clientWidth*.75),behavior:'smooth'}));
plantPanRight.addEventListener('click',()=>plantScroll.scrollBy({left:Math.max(240,plantScroll.clientWidth*.75),behavior:'smooth'}));
plantFit.addEventListener('click',()=>{
  plantScroll.classList.toggle('is-fit');plantScroll.scrollLeft=0;
  requestAnimationFrame(updatePlantPan);
});
plantScroll.addEventListener('scroll',updatePlantPan,{passive:true});
window.addEventListener('resize',updatePlantPan);
requestAnimationFrame(updatePlantPan);

const topicData={
 topology:{title:'Fluxo de sinais de controle',body:`<p>Há três níveis funcionais: <b>medir</b> o que o processo está fazendo, <b>decidir</b> a maior solicitação de abertura e <b>atuar/confirmar</b> o posicionamento final.</p><ul><li>PT-029B e PT-029A entram na diferença PDX-029A.</li><li>PDIC-029 calcula a demanda para manter ΔP.</li><li>PT-028 e PIC-028 calculam a demanda relativa à pressão do regenerador.</li><li>PDY-029A seleciona a maior MV.</li><li>ZIC-009 / PDY-029B / HS-39014 intervêm no caminho posterior, cujo algoritmo exato não está documentado na tela.</li><li>PDY-029K/N, PY e as realimentações completam cada ramal.</li></ul><p>Uma falha em qualquer camada pode gerar resposta diferente da desejada; a posição de fato deve ser confrontada com o comando.</p>`},
 override:{title:'Por que selecionar o maior comando?',body:`<p>O comportamento físico esperado das slides é: <b>mais abertura → mais descarga → menor pressão do regenerador</b>, mantendo as demais variáveis constantes.</p><p>Se o diferencial estiver baixo, o PDIC tende a pedir fechamento. Se a pressão do regenerador estiver alta, o PIC tende a pedir abertura. São duas solicitações potencialmente conflitantes.</p><p>O <code>max(MV_PDIC, MV_PIC)</code> impõe o maior sinal, favorecendo maior descarga quando necessário. Assim, a limitação de pressão pode prevalecer sobre a busca do diferencial.</p><p>Exemplo: PDIC = 39%, PIC = 72% → saída do seletor = 72%. Não são somadas as duas saídas.</p>`},
 flow:{title:'Abertura, restrição e perda de carga',body:`<p>O conjunto slide modifica a seção efetiva de passagem de gases de combustão. Para a mesma geração de gases, reduzir área aumenta a resistência e tende a elevar a pressão a montante. Aumentar a abertura permite mais fluxo e tende a reduzir essa pressão.</p><p>Em gases compressíveis, não se pode assumir relação linear entre porcentagem de abertura e vazão. Há influência da densidade, contrapressão, relação de pressões, geometria e eventualmente regime crítico de escoamento.</p><p>A expressão simplificada do simulador foi escolhida somente para mostrar causalidade qualitativa, não para cálculos de projeto.</p>`},
 purpose:{title:'Gases de combustão versus circulação de catalisador',body:`<p>As L-3903A1/A2 estão associadas à descarga dos gases de combustão do regenerador no caminho da câmara de orifícios F-3902. Não conduzem a circulação normal do catalisador entre reator e regenerador.</p><p>Alterar a pressão do D-3904 modifica o diferencial em relação ao D-3902 e pode afetar margens hidráulicas do conversor. Entretanto, <b>o diferencial D-3904/D-3902 isolado não permite concluir que uma slide de catalisador esteja em reversão</b>; são necessários os balanços de pressões dos respectivos trechos.</p>`},
 measurement:{title:'Cálculo correto do diferencial',body:`<p>PT-029B = 2,47 e PT-029A = 2,20. Portanto, ΔP = 2,47 − 2,20 = <b>0,27</b>, valor correto para a PV do PDIC-029 nessa condição.</p><p>A Concept adota diretamente o valor correto de 0,27 para essa condição, sem considerar divergência instrumental associada ao diferencial.</p><p>O PT-028 = 2,47 é uma medição identificada separadamente e continua útil para comparar instrumentos em cenários hipotéticos de falha de medição.</p>`},
 pic:{title:'PIC-028 como controle de sobreposição',body:`<p>O procedimento de transferência PE.REF.OPE.CCF.063 descreve o PIC-39028 em automático com referência em torno de 250 gramas acima da pressão corrente, em certas condições de transferência. A estratégia permite que a saída do PIC não domine o seletor durante a regulação usual do diferencial.</p><p>Se o regenerador elevar sua pressão até a região de atuação do PIC, sua MV pode aumentar e superar a do PDIC, solicitando maior abertura das slides.</p><p>Isso é controle de override/sobreposição. Não equivale à comprovação de intertravamento de segurança ou de limite mecânico do equipamento.</p>`},
 uncertain:{title:'Partes da malha que exigem validação documental',body:`<p>A tela deixa claros o seletor de máxima PDY-029A e vários valores, mas não apresenta uma lógica completa de HS-39014, PDY-029B, ZIC-009/ZIC-029, ganhos, filtros, distribuição por ramal e permissivos.</p><p>A função da HS-39014 foi esclarecida pelo operador: selecionar A1 ou A2 para receber o caminho do PDIC-029. O comando percorre o seletor de máxima PDY-029A, preservando a possibilidade de override do PIC-028. A slide não selecionada permanece sob o ZIC-009. Este somente libera novo comando quando <b>|PV−SP| ≥ 3 pontos percentuais</b>, conforme informação operacional recebida. A PV do ZIC-009 é a saída do PDY-029A, confirmada pelo operador. Permanecem não validados os ganhos e a lei interna da MV do ZIC.</p><p>Para engenharia de validação, confrontar folhas lógicas e configuração real do Yokogawa Centum VP.</p>`},
 position:{title:'Comando não é posição, posição não é vazão',body:`<p>Uma MV ou comando de 48% corresponde a uma referência. A realimentação ZI mostra onde o conjunto foi medido. Na captura, A1 tem 48% comandado e 47,9% real; A2 tem 50% comandado e 50,3% real.</p><p>O erro pequeno sugere acompanhamento da referência naquela fotografia, não prova ausência de desgaste ou falhas intermitentes.</p><p>A abertura percentual também não garante capacidade de fluxo equivalente entre dois caminhos. Curva característica, pressão disponível e condição dos internos precisam ser consideradas.</p>`},
 alarms:{title:'Desvio de posição e supressão de alarme',body:`<p>O critério ilustrativo considera <code>|comando − posição|</code>. Uma diferença persistente pode indicar travamento, resposta lenta, problema do I/P, atuador ou medição de posição.</p><p>Na tela original aparece referência de ±5 e blocos ZDSHL e ZDAHL. Não há documentação suficiente para confirmar sua temporização, modo de supressão, polaridade e eventuais ações automáticas.</p><p>O simulador sinaliza atenção quando a magnitude excede 5 pontos percentuais, sem reproduzir uma lógica real de alarme ou intertravamento.</p>`},
 deadband:{title:'O que a dead band modifica?',body:`<p>Banda morta significa deixar de reagir a pequenas diferenças para evitar movimentos incessantes. Por exemplo, com comando 48%, posição 47,7% e banda de ±0,5 ponto percentual, o algoritmo pode manter a posição sem atuar.</p><p>Uma banda morta excessiva, por outro lado, piora a precisão do posicionamento. O melhor valor depende do equipamento e da filosofia de controle.</p><p>Na malha informada, o ZIC-009 possui banda morta de <b>3 pontos percentuais</b> entre PV do PDY-029A e SP digitado pelo operador. Fora da faixa, o ZIC atua na slide não selecionada. O modelo usa histerese de retorno de 0,4 p.p. (desliga com |erro| ≤ 2,6), exclusivamente para evitar oscilações didáticas. A histerese real não foi confirmada.</p>`},
 balance:{title:'Por que uma slide abre enquanto outra fecha?',body:`<p>Se a HS-39014 seleciona A1, ela recebe o comando de PDY-029A; A2 fica sob o ZIC-009. A PV do ZIC vem de PDY-029A e o SP é definido pelo operador.</p><p><b>Exemplo condicional:</b> SP do ZIC sobe de 48% para 52% e PV continua 47,6%. O desvio de −4,4 p.p. excede a banda de 3. Com a ação didática adotada, o ZIC inicia o fechamento da A2. A descarga cai, a pressão do D-3904 tende a subir, o ΔP tende a crescer e o PDIC reage solicitando abertura da A1 para recuperar a referência diferencial.</p><p>É uma compensação <b>indireta pelo processo</b>, não um comando direto do SP do ZIC para a slide selecionada. Se o ΔP começar abaixo do SP, a A1 pode inicialmente fechar e só abrir após o aumento de pressão. O tempo e o sentido exatos dependem da configuração real dos controladores.</p>`},
 commands:{title:'Como ler a cascata de comandos',body:`<p>A coluna PDIC mostra a saída destinada a manter ΔP. A coluna PIC mostra a saída de proteção por pressão alta. A coluna PDY-029A mostra qual delas é maior no instante.</p><p>A HS-39014 escolhe qual slide recebe a referência selecionada pelo PDY-029A. A outra slide fica sob ZIC-009, que só libera nova referência quando |PV−SP| alcançar 3 p.p. A PV do ZIC é a MV selecionada pelo PDY-029A (máximo PDIC/PIC), não a posição real da slide. Cada posição real se aproxima do respectivo comando com tempo de resposta.</p><p>Os indicadores de desvio mostram se a válvula acompanha. Um controle pode ter MV correta, mas o processo continuar instável caso a válvula esteja travada ou haja contrapressão elevada.</p>`},
 disturb:{title:'Distúrbios simulados no balanço de gases',body:`<ul><li><b>Geração de gases:</b> maior produção que saída → pressão tende a subir.</li><li><b>P(D-3902):</b> aumenta ou diminui o ΔP medido, sem exigir mudança imediata de P(D-3904).</li><li><b>Contrapressão a jusante:</b> reduz a capacidade de fluxo das slides quando cresce.</li><li><b>SP ΔP:</b> modifica o alvo do controlador diferencial.</li><li><b>SP PIC:</b> modifica o início pretendido da limitação por pressão.</li></ul><p>O modelo simplifica interações físicas para torná-las visualmente compreensíveis.</p>`},
 scenariopresets:{title:'Sequência de prática recomendada',body:`<p>1. Reinicie o laboratório e acompanhe como o PDIC tenta corrigir ΔP inicialmente abaixo do SP.</p><p>2. Aplique aumento de geração de gases, observe P(D-3904) e a saída do PDIC.</p><p>3. Ative Override PIC, observe a troca de controlador selecionado.</p><p>4. Trave A1 e observe como o desvio cresce mesmo que o comando continue mudando.</p><p>5. Acrescente erro do PT-029B para notar discrepância entre variável real e variável que o controlador interpreta.</p><p>6. Retorne à condição de referência e compare a recuperação no histórico.</p>`}
};
const overlay=$('topicOverlay');
function openTopic(key){const d=topicData[key];if(!d)return;$('topicTitle').textContent=d.title;$('topicBody').innerHTML=d.body;overlay.hidden=false;document.body.style.overflow='hidden';$('topicClose').focus();}
function closeTopic(){overlay.hidden=true;document.body.style.overflow='';}
document.querySelectorAll('.bulb').forEach(b=>b.addEventListener('click',()=>openTopic(b.dataset.topic)));
$('topicClose').addEventListener('click',closeTopic);overlay.querySelector('[data-close]').addEventListener('click',closeTopic);
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!overlay.hidden)closeTopic()});
$('methodBtn').addEventListener('click',()=>{goPage('sources');toast('Consulte a documentação dos pressupostos e limites.');});
let pendingInstall=null;
window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();pendingInstall=e;$('installBtn').textContent='↓ Instalar App'});
window.addEventListener('appinstalled',()=>{pendingInstall=null;toast('O aplicativo foi instalado.')});
$('installBtn').addEventListener('click',async()=>{if(pendingInstall){const event=pendingInstall;pendingInstall=null;event.prompt();try{await event.userChoice;}catch(_){}return;}const ios=/iphone|ipad|ipod/i.test(navigator.userAgent);toast(ios?'No Safari: Compartilhar → Adicionar à Tela de Início.':'Abra por HTTPS e use o menu do navegador → Instalar aplicativo / Adicionar à tela inicial.');});
if('serviceWorker' in navigator && location.protocol.startsWith('http'))window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));

// ===== SIMULAÇÃO DIDÁTICA =====
function initialState(){return{t:0,preg:2.47,psep:2.2,psepTarget:2.2,back:1.2,load:49.1,dpSp:.30,pregSp:2.75, pdicMv:47.6,picMv:10,pdicPrev:.27,pdicPvFilt:.27,picPrev:2.47,pdicMode:'auto',picMode:'auto',pdicManual:47.6,picManual:10,zicMv:50,zicSp:48,zicMode:'sp',zicDirectMv:50,zicPv:47.6,zicError:-.4,zicActive:false,zicWasActive:false,zicHeldA1:47.9,zicHeldA2:50.3,path:'max',hs:'A1',sourceA1:'PDY-029A',sourceA2:'ZIC-009 · em espera',alarmDelay:5,alarmTimerA1:0,alarmTimerA2:0,alarmActiveA1:false,alarmActiveA2:false,stableSeconds:0,lastWinner:"PDIC",events:[],mission:"recovery",missionStart:0,manualA1:48,manualA2:50,a1:47.9,a2:50.3,targetA1:48,targetA2:50,jamA1:false,jamA2:false,slow:false,sensorBias:0,speed:1, flow:49.1,winner:'PDIC',max:47.6,base:47.6,paused:false,history:[],sampleClock:0,manualTouched:false};}
let s=initialState();
const inputs=['load','psepTarget','back','dpSp','pregSp','pdicManual','picManual','manualA1','manualA2','sensorBias','alarmDelay'];
const dpMeasured=()=>s.preg+s.sensorBias-s.psep;
const selectedMode=()=>s.pdicMv>=s.picMv?'PDIC':'PIC';
const clampPercent=v=>clamp(v,0,100);
const slidersDigits={load:1,psepTarget:2,back:2,dpSp:2,pregSp:2,pdicManual:1,picManual:1,manualA1:1,manualA2:1,sensorBias:2,alarmDelay:0};
function outputText(key){const value=fmt(s[key],slidersDigits[key]);const unit=['pdicManual','picManual','manualA1','manualA2'].includes(key)?'%':key==='alarmDelay'?' s':'';return value+unit;}
function updateControls(){
 inputs.forEach(k=>{const el=$(k);if(!el)return;el.value=s[k];const out=$('out-'+k);if(out)out.textContent=outputText(k)});
 $('pdicMode').value=s.pdicMode;$('picMode').value=s.picMode;$('signalPath').value=s.path;$('hsSelector').value=s.hs;
 $('zicSpInput').value=fmt(s.zicSp,1);$('zicMvInput').value=fmt(s.zicDirectMv,1);updateZicFaceMode();
 $('zicWrap').classList.toggle('is-hidden',s.path==='individual');$('hsSelector').disabled=s.path==='individual';
 $('jamA1').checked=s.jamA1;$('jamA2').checked=s.jamA2;$('slow').checked=s.slow;$('speed').value=s.speed;
 $('pdicManualWrap').classList.toggle('is-hidden',s.pdicMode!=='manual');$('picManualWrap').classList.toggle('is-hidden',s.picMode!=='manual');$('manualValves').classList.toggle('is-hidden',s.path!=='individual');
}
inputs.forEach(k=>$(k).addEventListener('input',e=>{s[k]=parseFloat(e.target.value);if(k==='pdicManual'&&s.pdicMode==='manual')s.pdicMv=s.pdicManual;if(k==='picManual'&&s.picMode==='manual')s.picMv=s.picManual;const out=$('out-'+k);if(out)out.textContent=outputText(k);s.manualTouched=true}));
$('pdicMode').addEventListener('change',e=>{s.pdicMode=e.target.value;s.pdicManual=s.pdicMv;s.pdicPrev=dpMeasured();s.pdicPvFilt=s.pdicPrev;recordEvent('mode','PDIC-029 em '+s.pdicMode.toUpperCase(),'Transição de modo didática.');updateControls()});$('picMode').addEventListener('change',e=>{s.picMode=e.target.value;s.picManual=s.picMv;s.picPrev=s.preg;recordEvent('mode','PIC-028 em '+s.picMode.toUpperCase(),'Referência independente do D-3904.');updateControls()});$('signalPath').addEventListener('change',e=>{s.path=e.target.value;updateControls()});$('hsSelector').addEventListener('change',e=>{const previous=s.hs;s.hs=e.target.value;s.zicHeldA1=s.a1;s.zicHeldA2=s.a2;s.zicWasActive=s.zicActive;currentOutput();recordEvent('switch','HS-39014: comando PDIC/PIC direcionado à L-3903'+s.hs,'Antes: L-3903'+previous+'. A outra slide fica sob ZIC-009, com limiar de 3 p.p.; até nova atuação, retém a referência atual.');toast('HS-39014 em '+s.hs+': PDIC → L-3903'+s.hs+'; outra slide → ZIC-009 (dead band 3 p.p.).');render();});
// Faceplate: operador digita o SP do ZIC-009; a PV é sempre a saída real de PDY-029A.
$('zicSpForm').addEventListener('submit',e=>{
 e.preventDefault();
 const raw=$('zicSpInput').value.trim().replace(',', '.');
 const value=Number(raw);
 if(!raw || !Number.isFinite(value) || value<0 || value>100){toast('SP inválido: informe percentual entre 0 e 100.');$('zicSpInput').focus();return;}
 const old=s.zicSp;s.zicSp=value;
 currentOutput();recordEvent('mode','Faceplate ZIC-009: SP alterado',`Operador ${fmt(old,1)}% → ${fmt(s.zicSp,1)}%; PV atual do PDY-029A ${fmt(s.zicPv,1)}%.`);
 updateControls();render();toast('SP do ZIC-009 aplicado: '+fmt(s.zicSp,1)+'%.');
});
// V2.6 · Dois modos didáticos de atuação do ZIC-009. A saída por MV é
// comando direto do operador (sem malha fechada ZIC SP/PV), apesar do nome de menu.
function updateZicFaceMode(){
 const isSp=s.zicMode==='sp';
 $('zicModeSp').classList.toggle('is-selected',isSp);$('zicModeMv').classList.toggle('is-selected',!isSp);
 $('zicModeSp').setAttribute('aria-pressed',String(isSp));$('zicModeMv').setAttribute('aria-pressed',String(!isSp));
 $('zicSpPanel').classList.toggle('is-hidden',!isSp);$('zicMvPanel').classList.toggle('is-hidden',isSp);
 $('zicFaceStatus').textContent=isSp?'AUTO · SP':'MV DIRETA';
 $('zicThresholdTests').classList.toggle('is-hidden',!isSp);
 $('zicCompensationDemo').disabled=!isSp;
 $('zicModeNote').innerHTML=isSp?'<b>AUTO · SP:</b> a MV é corrigida lentamente somente ao atingir a banda morta de 3 p.p.; PV = PDY-029A. Ganhos e histerese são didáticos.':'<b>MV DIRETA:</b> o operador define a saída para a slide auxiliar. SP e PV são exibidos para comparação, porém não fecham a malha do ZIC. Este modo não equivale a AUTO por SP no sentido usual de instrumentação.';
}
function setZicMode(mode){
 if(mode!== 'sp' && mode!=='mv'||s.zicMode===mode)return;
 const old=s.zicMode;
 if(mode==='mv'){
  // Entrada sem salto: pega a saída atual do ZIC como a nova referência direta.
  s.zicDirectMv=s.zicMv;
 }else{
  // Saída sem salto: AUTO parte da MV atual e aguarda banda morta para correção.
  s.zicWasActive=false;
 }
 s.zicMode=mode;currentOutput();updateControls();render();
 recordEvent('mode','ZIC-009: '+(mode==='sp'?'AUTO por SP':'MV direta pelo operador'),`Antes ${old==='sp'?'AUTO SP':'MV direta'}; MV atual ${fmt(s.zicMv,1)}%; HS seleciona ${s.hs}.`);
 toast(mode==='sp'?'ZIC-009 AUTO SP: correção somente pela banda morta.':'ZIC-009 MV direta: digite a nova saída; SP não atua neste modo.');
}
$('zicModeSp').addEventListener('click',()=>setZicMode('sp'));
$('zicModeMv').addEventListener('click',()=>setZicMode('mv'));
$('zicMvForm').addEventListener('submit',e=>{
 e.preventDefault();
 const raw=$('zicMvInput').value.trim().replace(',','.');const value=Number(raw);
 if(!raw||!Number.isFinite(value)||value<0||value>100){toast('MV inválida: informe percentual entre 0 e 100.');$('zicMvInput').focus();return;}
 if(s.zicMode!=='mv'){toast('Selecione MV DIRETA para atuar pela saída.');return;}
 const before=s.zicDirectMv;s.zicDirectMv=value;
 recordEvent('mode','ZIC-009: MV direta definida',`Operador ${fmt(before,1)}% → ${fmt(value,1)}%; saída se deslocará lentamente na slide L-3903${s.hs==='A1'?'A2':'A1'}.`);
 updateControls();render();toast('MV direta solicitada: '+fmt(value,1)+'%. Observe a rampa no simulador.');
});
$('zicCompensationDemo').addEventListener('click',()=>{
 // Demonstração sem alterar PV artificialmente, apenas o SP decidido pelo operador.
 s.hs='A1';s.path='max';s.zicMode='sp';s.zicSp=52;
 s.pdicMode='auto';s.picMode='auto';
 s.pdicPrev=dpMeasured();s.pdicPvFilt=s.pdicPrev;s.picPrev=s.preg;
 currentOutput();updateControls();render();
 recordEvent('disturbance','Demonstração SP ZIC 48% → 52%','A2 sob ZIC pode fechar. A1 responde pelo PDIC ao ΔP: efeito indireto.');
 toast('SP do ZIC = 52% • observe a A2 e a reação posterior da A1.');
});
// Os botões de teste forçam a saída REAL do seletor de maior usando as MVs manuais
// do PDIC e PIC, sem forjar uma fonte de PV independente no ZIC.
document.querySelectorAll('[data-zic-test]').forEach(b=>b.addEventListener('click',()=>{
 const wanted=clampPercent(s.zicSp+Number(b.dataset.zicTest));
 s.pdicMode='manual';s.picMode='manual';s.pdicManual=wanted;s.picManual=Math.max(0,Math.min(10,wanted));
 s.pdicMv=wanted;s.picMv=s.picManual;s.pdicPrev=dpMeasured();s.pdicPvFilt=s.pdicPrev;s.picPrev=s.preg;
 currentOutput();updateControls();
 recordEvent('disturbance','Teste da PV do ZIC via PDY-029A',`PDIC MAN ${fmt(s.pdicMv,1)}%; PIC MAN ${fmt(s.picMv,1)}%; PV = MAX = ${fmt(s.zicPv,1)}%; SP ${fmt(s.zicSp,1)}%; |Δ| ${fmt(Math.abs(s.zicError),1)} p.p.`);
 render();toast('PDIC e PIC em MAN didático: PV do ZIC vem do PDY-029A. Avance +1 s para observar a MV.');
}));
['jamA1','jamA2','slow'].forEach(k=>$(k).addEventListener('change',e=>{s[k]=e.target.checked;}));$('speed').addEventListener('change',e=>{s.speed=Number(e.target.value)});
function recordEvent(type,title,detail=''){
 const item={t:s.t,type,title,detail};s.events.push(item);if(s.events.length>28)s.events.shift();
 if($('eventList'))renderEvents();
}
function renderEvents(){const list=$('eventList');if(!list)return;list.innerHTML=[...s.events].reverse().slice(0,12).map(x=>`<li class="event-${esc(x.type)}"><span class="event-time">${fmt(x.t,1)} s</span><span><b>${esc(x.title)}</b>${x.detail?`<small>${esc(x.detail)}</small>`:''}</span></li>`).join('')||'<li>Sem eventos registrados.</li>';}
function checkAlarmTimers(dt){
 for(const i of [1,2]){
  const key='alarmTimerA'+i,alarm='alarmActiveA'+i;
  const deviation=Math.abs(s['targetA'+i]-s['a'+i]);
  s[key]=deviation>5?s[key]+dt:0;
  const active=deviation>5 && s[key]>=s.alarmDelay;
  if(active!==s[alarm])recordEvent(active?'alarm':'clear',`${active?'Desvio persistente':'Desvio normalizado'} na L-3903A${i}`,`Magnitude ${fmt(deviation,1)} p.p.; limiar didático ±5, duração ${fmt(s[key],1)} s.`);
  s[alarm]=active;
 }
}
function trackingStable(){return Math.abs((s.preg-s.psep)-s.dpSp)<=.025 && Math.abs(dpMeasured()-s.dpSp)<=.025 &&
 Math.abs(s.targetA1-s.a1)<=5 && Math.abs(s.targetA2-s.a2)<=5 && s.winner==='PDIC' && s.path==='max' && s.pdicMode==='auto' && !s.jamA1 && !s.jamA2;}
function currentOutput(){
 s.max=Math.max(s.pdicMv,s.picMv);s.winner=selectedMode();s.base=s.max;
 // CONFIRMADO PELO OPERADOR: a PV do ZIC-009 é a saída percentual do PDY-029A
 // (seleção de maior dos comandos PDIC-029 e PIC-028), independente da HS.
 // Não corresponde à realimentação de posição da L-3903 selecionada.
 s.zicPv=s.max;
 s.zicError=s.zicPv-s.zicSp;
 // Limiar de ENTRADA de 3 p.p. informado pelo operador.
 // A pequena histerese de SAÍDA é somente didática: reduz chaveamento perto de 3.
 const absZicError=Math.abs(s.zicError);
 s.zicActive=s.zicMode==='sp' && (s.zicActive ? absZicError>2.6 : absZicError>=3-1e-9);
 if(s.path==='individual'){
  s.targetA1=clampPercent(s.manualA1);s.targetA2=clampPercent(s.manualA2);
  s.sourceA1='MANUAL individual';s.sourceA2='MANUAL individual';return;
 }
 // A banda morta é do ZIC-009 (|PV-SP| >= 3 p.p.), NÃO da dinâmica dos atuadores.
 // Se não atingir o limiar, a slide NÃO selecionada preserva sua última referência.
 // Se atingir, recebe o sinal MV independente do ZIC-009. Ao retornar para dentro
 // da banda, a última referência permanece até novo evento de atuação.
 if(s.hs==='A1'){
   s.targetA1=clampPercent(s.max);
   if(s.zicMode==='mv'||s.zicActive)s.zicHeldA2=clampPercent(s.zicMv);
   s.targetA2=clampPercent(s.zicHeldA2);
   s.sourceA1=s.winner==='PDIC'?'PDIC-029 via PDY-029A / HS':'PIC-028 override via PDY-029A / HS';
   s.sourceA2=s.zicMode==='mv'?'ZIC-009 · MV DIRETA':s.zicActive?'ZIC-009 · AUTO SP ativo':'ZIC-009 · banda morta / retendo';
 }else{
   s.targetA2=clampPercent(s.max);
   if(s.zicMode==='mv'||s.zicActive)s.zicHeldA1=clampPercent(s.zicMv);
   s.targetA1=clampPercent(s.zicHeldA1);
   s.sourceA1=s.zicMode==='mv'?'ZIC-009 · MV DIRETA':s.zicActive?'ZIC-009 · AUTO SP ativo':'ZIC-009 · banda morta / retendo';
   s.sourceA2=s.winner==='PDIC'?'PDIC-029 via PDY-029A / HS':'PIC-028 override via PDY-029A / HS';
 }
}
function advance(dt){dt=Math.min(dt,.15);if(s.pdicMode==='auto'){
  const sensed=dpMeasured();
  // Filtragem, ação direta e limitação de velocidade: valores apenas didáticos.
  s.pdicPvFilt+=(sensed-s.pdicPvFilt)*Math.min(1,dt/5);
  const pv=s.pdicPvFilt,err=pv-s.dpSp;
  const raw=90*(pv-s.pdicPrev)+.72*err*dt;
  const desired=clampPercent(s.pdicMv+raw);
  const maxStep=.14*dt; // p.p./s: movimento de comando suavizado
  s.pdicMv=clampPercent(s.pdicMv+clamp(desired-s.pdicMv,-maxStep,maxStep));
  s.pdicPrev=pv;
 }else{s.pdicMv=s.pdicManual;s.pdicPrev=dpMeasured();s.pdicPvFilt=s.pdicPrev;}
 if(s.picMode==='auto'){
  const pv=s.preg,err=pv-s.pregSp;
  // Pré-ativação apenas ilustrativa para materializar override em pressão alta.
  if(err<-.06){s.picMv=clampPercent(s.picMv-dt*(.3+1.5*Math.abs(err)));}
  else{const approx=clampPercent((48+150*err)*clamp((err+.06)/.06,0,1));const integral=210*(pv-s.picPrev)+2.8*err*dt;
    s.picMv=clampPercent(Math.max(s.picMv+integral,s.picMv+(approx-s.picMv)*Math.min(1,dt/3)));
  }s.picPrev=pv;
 }else{s.picMv=s.picManual;s.picPrev=s.preg;}
 currentOutput();
 // Dinâmica didática do ZIC (NÃO calibrada): fora da banda de ±3 p.p.
 // PV do PDY acima do SP -> abre gradualmente a slide auxiliar;
 // PV do PDY abaixo do SP -> fecha gradualmente a slide auxiliar.
 // O controle real da MV/ganhos e o seguimento interno do PDY-029B não foram fornecidos.
 if(s.path!=='individual' && s.zicMode==='sp' && s.zicActive){
  const outside=Math.max(0,Math.abs(s.zicError)-3);
  const rate=Math.min(.07,.025+.012*outside); // p.p./s, rampa suave DIDÁTICA
  s.zicMv=clampPercent(s.zicMv+Math.sign(s.zicError)*rate*dt);
  currentOutput();
 }else if(s.path!=='individual' && s.zicMode==='mv'){
  // MV direta do operador: sem comparação SP/PV no cálculo da correção.
  // A saída segue a referência pela rampa didática, preservando a suavidade da V2.5.
  const maxStep=.07*dt; // p.p./s ilustrativos; NÃO representa o SDCD.
  s.zicMv=clampPercent(s.zicMv+clamp(s.zicDirectMv-s.zicMv,-maxStep,maxStep));
  currentOutput();
 }
 if(s.zicMode==='sp' && s.zicActive!==s.zicWasActive && s.path!=='individual'){recordEvent(s.zicActive?'switch':'clear',s.zicActive?'ZIC-009: dead band de 3 p.p. atingida — comando liberado':'ZIC-009: dentro da dead band — referência retida',`PV ${fmt(s.zicPv,1)}% · SP ${fmt(s.zicSp,1)}% · |Δ| ${fmt(Math.abs(s.zicError),1)} p.p. · slide L-3903${s.hs==='A1'?'A2':'A1'}`);s.zicWasActive=s.zicActive;}
 if(s.winner!==s.lastWinner){recordEvent('switch',`PDY-029A passou a selecionar ${s.winner}`,`PDIC ${fmt(s.pdicMv,1)}% | PIC ${fmt(s.picMv,1)}%`);s.lastWinner=s.winner;}
 const tau=s.slow?65:24;
 const approach=(old,target,jam)=>{
  if(jam)return old;
  const desiredStep=(target-old)*Math.min(1,dt/tau);
  const maxStep=(s.slow?.035:.11)*dt; // p.p./s, hipótese didática de tempo de curso
  return clampPercent(old+clamp(desiredStep,-maxStep,maxStep));
 };
 s.a1=approach(s.a1,s.targetA1,s.jamA1);s.a2=approach(s.a2,s.targetA2,s.jamA2);
 checkAlarmTimers(dt);
 s.psep+=(s.psepTarget-s.psep)*Math.min(1,dt/10);
 // Balanço de gás relativo (gás compressível real exige modelo mais completo).
 const available=Math.max(.04,s.preg-s.back);
 s.flow=((s.a1+s.a2)/2)*Math.sqrt(available/1.27);
 const dPdt=.00165*(s.load-s.flow);
 s.preg=clamp(s.preg+dPdt*dt,.45,4.0);
 s.stableSeconds=trackingStable()?Math.min(20,s.stableSeconds+dt):0;
 s.t+=dt;s.sampleClock+=dt;
 if(s.sampleClock>=.9){s.sampleClock=0;takeSample();}
}
function takeSample(){const h=s.history;h.push({t:s.t,preg:s.preg,psep:s.psep,dp:dpMeasured(),dpTrue:s.preg-s.psep,dpSp:s.dpSp,pdic:s.pdicMv,pic:s.picMv,a1:s.a1,a2:s.a2,cmd1:s.targetA1,cmd2:s.targetA2,max:s.max,selected:s.winner,path:s.path,hs:s.hs,sourceA1:s.sourceA1,sourceA2:s.sourceA2,zicPv:s.zicPv,zicSp:s.zicSp,zicError:s.zicError,zicActive:s.zicActive,zicMode:s.zicMode,zicDirectMv:s.zicDirectMv,zicMv:s.zicMv,pdicMode:s.pdicMode,flow:s.flow});if(h.length>330)h.shift();}
function setPct(id,n){$(id).textContent=fmt(n,1)+'%'}
/* V2.7 — clear roles and actual movement on the animated slides. */
function renderValveRouting(){
  const main=s.hs==='A1'?1:2,aux=main===1?2:1;
  const isManual=s.path==='individual';
  const zicDirect=s.zicMode==='mv';
  const zicCorrection=!isManual && (zicDirect||s.zicActive);
  const mainSource=s.winner==='PIC'?'PIC-028 (OVERRIDE)':'PDIC-029';
  const auxState=zicDirect?'MV DIRETA':s.zicActive?'AUTO SP · ATUANDO':'AUTO SP · BANDA MORTA';
  $('routeMainName').textContent=isManual?'L-3903A1/A2 — MAN individual':`L-3903${s.hs} — comando principal`;
  $('routeMainText').textContent=isManual?'Comando manual independente':`${mainSource} → PDY-029A → HS-39014`;
  $('routeAuxName').textContent=isManual?'Controle automático desabilitado':`L-3903A${aux} — slide auxiliar`;
  $('routeAuxText').textContent=isManual?'As duas slides seguem referências individuais':`ZIC-009 · ${auxState}`;
  $('routeCardMain').className='controller-route-card '+(isManual?'route-manual':'route-primary');
  $('routeCardAux').className='controller-route-card '+(isManual?'route-manual':zicCorrection?'route-active':'route-idle');
  $('routeExplanation').textContent=isManual?'Modo manual individual: nenhuma slide segue o comando automático via HS.':
    `HS-39014 → L-3903${s.hs} recebe ${mainSource} via PDY-029A. `+
    `L-3903A${aux} está sob ZIC-009: `+(zicDirect?'MV solicitada diretamente pelo operador.':s.zicActive?'correção AUTO/SP liberada pela banda morta de 3 p.p.':'dentro da banda morta de 3 p.p., última MV retida.');
  for(let i=1;i<=2;i++){
    const mainValve=i===main;
    const group=$('svgValveGroup'+i),card=$('valveCard'+i);
    const role=isManual?'is-manual':mainValve?'is-route-primary':zicCorrection?'is-zic-active':'is-zic-idle';
    group.classList.remove('is-manual','is-route-primary','is-zic-active','is-zic-idle');group.classList.add(role);
    card.classList.remove('is-route-primary','is-zic-active','is-zic-idle');if(!isManual)card.classList.add(role);
    const jam=s['jamA'+i];
    const difference=s['targetA'+i]-s['a'+i];
    const motion=jam?'TRAVADA':difference>0.28?'ABRINDO ↑':difference<-.28?'FECHANDO ↓':'ESTÁVEL';
    const label=$('svgMotion'+i);
    label.textContent=motion;
    label.className.baseVal='valve-direction '+(jam?'is-stuck':difference>0.28?'is-opening':difference<-.28?'is-closing':'');
    if(mainValve)$('routeMainMotion').textContent=motion;
    else $('routeAuxMotion').textContent=!zicCorrection&&!isManual?'RETENDO · '+motion:motion;
  }
}
function render(){const dp=dpMeasured();$('vPreg').textContent=fmt(s.preg,3);$('vPsep').textContent=fmt(s.psep,3);$('vDp').textContent=fmt(dp,3);$('vWinner').textContent=s.winner;$('vSelect').textContent=fmt(s.max,1)+'%';$('dpCompare').textContent=`SP ${fmt(s.dpSp,2)} · erro ${fmt(dp-s.dpSp,3)}`;
 $('pregTrend').textContent=s.picMv>s.pdicMv?'PIC priorizado no seletor':'PDIC disponível • HS em '+s.hs;
 $('refPt').textContent=fmt(s.preg,3);$('sensedPt').textContent=fmt(s.preg+s.sensorBias,3);
 $('dpPhysical').textContent=`${fmt(s.preg-s.psep,3)} / ${fmt(dp,3)}`;
 const bias=Math.abs(s.sensorBias);$('sensorDelta').textContent=bias>.025?`ATENÇÃO: diferença de ${fmt(s.sensorBias,3)} na medição PT-029B`:'Instrumentos coerentes na tolerância didática (±0,025)';
 $('sensorDelta').className=bias>.025?'sensor-warning':'';
 const err=dp-s.dpSp;
 $('coachText').textContent=bias>.025?'DIAGNÓSTICO: PT-029B e PT-028 divergem. Antes de confiar na reação do PDIC, confronte as indicações e as tendências.':s.alarmActiveA1||s.alarmActiveA2?'DIAGNÓSTICO: desvio persistente de posição; investigar comando, ZI e capacidade física de descarga.':s.jamA1||s.jamA2?'DIAGNÓSTICO: falha de atuação simulada. Verifique se a posição real reage ao comando.':s.path!=='max'?'DIAGNÓSTICO: válvulas em MAN individual, não seguem o sinal selecionado pelo PDY-029A.':s.pdicMode!=='auto'?'DIAGNÓSTICO: PDIC em MANUAL. A correção automática do ΔP não está ativa neste modelo.':s.zicMode==='mv'&&s.path==='max'?'DIAGNÓSTICO: ZIC-009 em MV DIRETA. A slide auxiliar segue o valor da MV digitada; a banda morta e o SP não corrigem automaticamente. Avalie o efeito sobre o diferencial.':s.winner==='PIC'?'DIAGNÓSTICO: override de pressão prevalece; compare P(D-3904) com SP do PIC e acompanhe a resposta de abertura.':err<-.025?'DIAGNÓSTICO: ΔP abaixo do SP. Com PIC não dominante, o PDIC tende a restringir a descarga para recuperar pressão.':err>.025?'DIAGNÓSTICO: ΔP acima do SP. Espere maior demanda de abertura pelo PDIC, se a malha estiver em AUTO.':'Malha próxima à referência: confira estabilidade temporal e acompanhamento individual das slides.';
 $('stableClock').textContent=`${fmt(s.stableSeconds,1)} / 20 s`;
 $('stabilityProgress').style.width=`${clamp(s.stableSeconds/20*100,0,100)}%`;
 $('vTime').textContent=fmt(s.t,1);$('simState').textContent=s.paused?'PAUSADO':'RODANDO';$('simState').classList.toggle('paused',s.paused);
 setPct('sPdic',s.pdicMv);setPct('sPic',s.picMv);setPct('sMax',s.max);setPct('sBase',s.base);$('sPdicMode').textContent=s.pdicMode==='auto'?'AUTO':'MANUAL';$('sPicMode').textContent=s.picMode==='auto'?'AUTO':'MANUAL';$('sMaxFrom').textContent='Vence: '+s.winner;$('sPath').textContent=s.path==='individual'?'Ambas em MAN':'HS → L-3903'+s.hs;
 $('a1Source').textContent=s.sourceA1;$('a2Source').textContent=s.sourceA2;
 $('zicPvLive').textContent=fmt(s.zicPv,1)+'%';$('zicSpLive').textContent=fmt(s.zicSp,1)+'%';$('zicDeltaLive').textContent=fmt(Math.abs(s.zicError),1)+' p.p.';$('zicMvLive').textContent=fmt(s.zicMv,1)+'%';$('zicPvOrigin').textContent='PDY-029A = maior MV ('+s.winner+')';
 $('zicFpPv').textContent=fmt(s.zicPv,1)+'%';$('zicFpSp').textContent=fmt(s.zicSp,1)+'%';$('zicFpMv').textContent=fmt(s.zicMv,1)+'%';
 $('zicMvRequested').textContent=fmt(s.zicDirectMv,1)+'%';$('zicMvSent').textContent=fmt(s.zicMv,1)+'%';$('zicMvProgress').style.width=clampPercent(s.zicMv)+'%';
 const directZic=s.zicMode==='mv' && s.path!=='individual';
 $('zicCorrectionLive').textContent=s.path==='individual'?'MAN individual (ZIC fora da rota)':directZic?'MV DIRETA: saída acompanha lentamente '+fmt(s.zicDirectMv,1)+'% (SP não atua)':!s.zicActive?'AUTO SP: MV retida na banda morta':s.zicError>0?'AUTO SP: PV acima do SP → abertura auxiliar (hipótese)':'AUTO SP: PV abaixo do SP → fechamento auxiliar (hipótese)';
 $('zicActLive').textContent=s.path==='individual'?'FORA DE SERVIÇO (MAN)':directZic?'MV DIRETA — COMANDO PELO OPERADOR':s.zicActive?'AUTO SP — CORRIGINDO SLIDE AUXILIAR':'AUTO SP — EM BANDA MORTA';
 $('zicActLive').className='zic-state '+((s.zicActive||directZic)&&s.path!=='individual'?'zic-active':'zic-standby');
 $('balanceLive').textContent=s.path==='individual'?'Modo manual individual: compensação automática suspensa.':s.hs==='A1'?`HS A1: principal ${fmt(s.a1,1)}%; auxiliar A2 ${fmt(s.a2,1)}% • ${s.zicMode==='mv'?'MV direta':s.zicActive?'ZIC corrigindo':'ZIC na banda'}.`:`HS A2: principal ${fmt(s.a2,1)}%; auxiliar A1 ${fmt(s.a1,1)}% • ${s.zicMode==='mv'?'MV direta':s.zicActive?'ZIC corrigindo':'ZIC na banda'}.`;
 $('svgSource1').textContent=s.path==='individual'?'MANUAL':s.hs==='A1'?(s.winner==='PIC'?'PIC override':'PDIC via HS'):(s.zicMode==='mv'?'ZIC MV direta':s.zicActive?'ZIC ativo':'ZIC retém');
 $('svgSource2').textContent=s.path==='individual'?'MANUAL':s.hs==='A2'?(s.winner==='PIC'?'PIC override':'PDIC via HS'):(s.zicMode==='mv'?'ZIC MV direta':s.zicActive?'ZIC ativo':'ZIC retém');
 $('hsLiveRoute').innerHTML=s.path==='individual'?'<span class="route-chip">MANUAL</span><b>Ambas as slides por comando individual</b><span>Modo de treinamento, fora da seleção HS</span>':`<span class="route-chip">HS-39014: ${s.hs}</span><b>PDY-029A (${s.winner}) → L-3903${s.hs}</b><span>L-3903${s.hs==='A1'?'A2':'A1'}: ${s.hs==='A1'?s.sourceA2:s.sourceA1}</span>`;
 for(const [bar,v] of [['barPdic',s.pdicMv],['barPic',s.picMv],['barMax',s.max],['barBase',s.base]])$(bar).style.width=clampPercent(v)+'%';
 const errors=[Math.abs(s.targetA1-s.a1),Math.abs(s.targetA2-s.a2)];
 for(let i=1;i<=2;i++){const actual=s['a'+i], target=s['targetA'+i],er=errors[i-1],jam=s['jamA'+i];setPct('a'+i+'Actual',actual);setPct('a'+i+'Target',target);$('a'+i+'Error').textContent=fmt(er,1)+' p.p.';$('a'+i+'Track').style.width=actual+'%';const el=$('a'+i+'Health');const bad=s['alarmActiveA'+i],pending=er>5;el.textContent=bad?'ALARME DE DESVIO':jam?'TRAVADA':pending?'DESVIO · PENDENTE':er>2?'EM MOVIMENTO':'ACOMPANHANDO';el.className=bad?'status-bad':jam||pending?'status-warn':'status-good';$('alarmT'+i).textContent=fmt(s['alarmTimerA'+i],1)+' s';}
 renderValveRouting();
 $('svgPreg').textContent=fmt(s.preg,2);$('svgPsep').textContent=fmt(s.psep,2);$('svgDP').textContent='ΔP '+fmt(dp,2);$('svgValve1').textContent=fmt(s.a1,1)+'%';$('svgValve2').textContent=fmt(s.a2,1)+'%';$('aperture1').setAttribute('width',(55*s.a1/100).toFixed(1));$('aperture2').setAttribute('width',(55*s.a2/100).toFixed(1));$('vFlow').textContent='Vazão relativa: '+fmt(s.flow,1)+' u.a.';
 let severity='normal',msg='As posições estão acompanhando os comandos. Observe as tendências de pressão.';
 if(s.alarmActiveA1||s.alarmActiveA2){severity='bad';msg='Desvio de posição persistente após a temporização configurada (critério didático). Compare comando, ZI e descarga.';}else if(errors.some(v=>v>5)){severity='warn';msg='Desvio de posição > 5 p.p. em observação; a temporização hipotética ainda não foi satisfeita.';}
 else if(s.preg>s.pregSp+.025){severity='warn';msg='Pressão do regenerador acima do SP do PIC. Confirme a seleção e a resposta das slides.';}
 else if(Math.abs(dp-s.dpSp)>.075){severity='warn';msg='Diferencial significativamente afastado do SP didático. Verifique as demandas e a posição real.';}
 else if(s.winner==='PIC'){severity='warn';msg='Override PIC ativo: a demanda por pressão prevalece sobre o diferencial.';}
 const alarm=$('alarmBox');alarm.className='alarm '+(severity==='normal'?'':severity);$('alarmText').textContent=msg;
}
function resetSim(){s=initialState();currentOutput();updateControls();s.history=[];s.events=[];recordEvent('info','Simulador reiniciado','Condições iniciais da captura, com ΔP físico calculado de 0,27.');takeSample();render();renderCharts();$('pauseSim').textContent='Ⅱ Pausar';$('challengeResult').className='challenge-feedback';$('challengeResult').textContent='Simulação reiniciada. Aplique uma perturbação ou ajuste os comandos.';}
$('resetSim').addEventListener('click',()=>{resetSim();toast('Simulação reiniciada com as referências da tela.')});
$('stepSim').addEventListener('click',()=>{s.paused=true;$('pauseSim').textContent='▶ Continuar';for(let i=0;i<10;i++)advance(.1);takeSample();render();renderCharts();toast('Avanço de 1 segundo simulado.');});
$('clearEvents').addEventListener('click',()=>{s.events=[];renderEvents();toast('Eventos simulados limpos.');});
$('pauseSim').addEventListener('click',()=>{s.paused=!s.paused;$('pauseSim').textContent=s.paused?'▶ Continuar':'Ⅱ Pausar';render()});
$('clearTrend').addEventListener('click',()=>{s.history=[];takeSample();renderCharts();toast('Histórico de tendência limpo.')});
const presets={loadUp:{load:67},loadDown:{load:34},sepUp:{psepTarget:2.52},sepDown:{psepTarget:1.93},backUp:{back:1.75},picOverride:{load:82,pregSp:2.52},jam1:{jamA1:true,load:64},bias:{sensorBias:-.16},normal:{load:49.1,psepTarget:2.2,back:1.2,pregSp:2.75,dpSp:.30,zicSp:48,jamA1:false,jamA2:false,slow:false,sensorBias:0}};
function preset(name){const values=presets[name];if(!values)return;Object.assign(s,values);updateControls();recordEvent('disturbance','Perturbação: '+name,'Mudanças didáticas nos valores de entrada; confira quem comanda e a posição real.');toast('Perturbação aplicada: observe a correção da malha e as tendências.');}
document.querySelectorAll('[data-preset]').forEach(b=>b.addEventListener('click',()=>preset(b.dataset.preset)));
$('exportCsv').addEventListener('click',()=>{const cols=['t','preg','psep','dp','dpSp','pdic','pic','max','a1','a2','cmd1','cmd2','hs','sourceA1','sourceA2','zicPv','zicSp','zicError','zicActive','zicMode','zicDirectMv','zicMv','flow'];const content='sep=;\n'+cols.join(';')+'\n'+s.history.map(item=>cols.map(c=>typeof item[c]==='number'?item[c].toFixed(4).replace('.',','):(item[c]??'')).join(';')).join('\n');const blob=new Blob(['\ufeff',content],{type:'text/csv;charset=utf-8'});const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='L-3903A1A2-tendencias-simuladas.csv';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);toast('Tendência didática exportada em CSV.');});
$('checkStability').addEventListener('click',()=>{const recent=s.history.filter(p=>p.t>=s.t-20),box=$('challengeResult');let pass=false;const enough=recent.length>=17&&s.t>=20;if(enough)pass=recent.every(p=>Math.abs(p.dp-p.dpSp)<=.025&&Math.abs(p.dpTrue-p.dpSp)<=.025&&Math.abs(p.cmd1-p.a1)<=5&&Math.abs(p.cmd2-p.a2)<=5&&p.selected==='PDIC'&&p.path==='max'&&p.pdicMode==='auto');box.className='challenge-feedback '+(pass?'pass':'fail');box.textContent=pass?'Objetivo didático atingido: diferencial próximo ao SP por 20 s; slide selecionada pela HS acompanha PDIC e outra permanece sob ZIC-009 com limiar de 3 p.p.':!enough?'Histórico insuficiente: mantenha a simulação funcionando por pelo menos 20 s simulados.':'Ainda há instabilidade no intervalo recente: confira ΔP × SP, comando versus posição e qual controlador prevalece.';});
// Roteiro guiado: critérios didáticos baseados nos sinais simulados e nos eventos de cada missão.
const missions={
 recovery:{title:'Recuperar o ΔP e estabilizar',goal:'Mantenha ΔP físico e medido próximo do SP (±0,025), as duas slides acompanhando e o PDIC selecionado durante 20 s simulados.',preset:'normal'},
 override:{title:'Reconhecer o override do PIC',goal:'Aguarde a MV do PIC exceder a MV do PDIC e confirme aumento da demanda por abertura em condição de pressão elevada.',preset:'picOverride'},
 stuck:{title:'Diagnosticar a slide travada',goal:'Observe comando, posição real da A1 e a duração de desvio acima de 5 pontos percentuais.',preset:'jam1'},
 instrument:{title:'Conferir erro do transmissor',goal:'Compare PT-029B com PT-028 e diferencie o ΔP físico do ΔP usado pelo PDIC.',preset:'bias'},
 backpressure:{title:'Reconhecer contrapressão elevada',goal:'Aumente a contrapressão, analise a capacidade de descarga e observe a resposta da pressão do D-3904.',preset:'backUp'}
};
function showMission(){const m=missions[s.mission];$('missionGoal').textContent=`Missão ${m.title}: ${m.goal}`;}
$('missionSelect').addEventListener('change',e=>{s.mission=e.target.value;showMission();});
$('missionStart').addEventListener('click',()=>{const which=$('missionSelect').value;resetSim();s.mission=which;s.missionStart=s.t;preset(missions[which].preset);showMission();$('missionFeedback').className='mission-feedback';$('missionFeedback').textContent='Missão iniciada. Observe a evolução e valide quando houver evidências suficientes.';recordEvent('mission','Missão iniciada: '+missions[which].title);});
$('missionGrade').addEventListener('click',()=>{
 const key=$('missionSelect').value,elapsed=s.t-s.missionStart,h=s.history;
 const hadWinner=h.some(p=>p.t>=s.missionStart && p.selected==='PIC' && p.pic>p.pdic+1);
 const maximumPressure=Math.max(...h.filter(p=>p.t>=s.missionStart).map(p=>p.preg),s.preg);
 const worstPosition=Math.max(...h.filter(p=>p.t>=s.missionStart).map(p=>Math.abs(p.cmd1-p.a1)),0);
 let ok=false,why='';
 if(key==='recovery'){ok=s.stableSeconds>=20;why=ok?'O desvio manteve-se dentro do intervalo simultaneamente nas medições física e instrumental, sem perda de acompanhamento.':'Aguarde 20 s de estabilidade contínua. Observe diferenças entre ΔP físico e medido, prioridade no seletor e rastreamento.';}
 if(key==='override'){ok=hadWinner;why=ok?'O histórico registrou a seleção PIC com demanda superior à do PDIC. Acompanhe o efeito nas posições e P(D-3904).':'Ainda não houve evidência de MV do PIC superar a do PDIC. Acompanhe a pressão e as saídas.';}
 if(key==='stuck'){ok=s.jamA1 && (s.alarmActiveA1||worstPosition>5);why=ok?'A A1 ficou sem seguir o comando e houve desvio reconhecível pela supervisão.':'É necessário demonstrar comando diferente da posição real da A1, não apenas marcar o travamento.';}
 if(key==='instrument'){ok=Math.abs(s.sensorBias)>.05 && Math.abs((s.preg+s.sensorBias)-s.preg)>.05;why=ok?'PT-029B diverge do PT-028, e o ΔP usado pelo PDIC não representa exatamente o ΔP físico.':'A perturbação instrumental deve ser visível na comparação entre PT-029B, PT-028 e ΔP calculado.';}
 if(key==='backpressure'){ok=s.back>=1.6 && elapsed>=4 && maximumPressure>2.50;why=ok?'Com contrapressão elevada, a descarga se reduz e a pressão exige resposta; avalie quem prevalece no seletor.':'Observe por pelo menos 4 s simulados a restrição, a vazão e a tendência de pressão; não basta um clique no preset.';}
 const el=$('missionFeedback');el.className='mission-feedback '+(ok?'pass':'fail');el.textContent=(ok?'Evidência atingida: ':'Evidência insuficiente: ')+why;
 recordEvent(ok?'mission':'info',(ok?'Missão validada: ':'Missão ainda não validada: ')+missions[key].title);
});
// Tendências sem bibliotecas externas, com eixo e grade legíveis em mobile.
function drawChart(canvasId,series,minY,maxY){const canvas=$(canvasId);if(!canvas)return;const rect=canvas.getBoundingClientRect();if(rect.width<10)return;const dpr=Math.min(window.devicePixelRatio||1,2),w=rect.width,h=rect.height;const dw=Math.round(w*dpr),dh=Math.round(h*dpr);if(canvas.width!==dw||canvas.height!==dh){canvas.width=dw;canvas.height=dh;}const ctx=canvas.getContext('2d');ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,w,h);const left=44,right=12,top=10,bottom=25,cw=w-left-right,ch=h-top-bottom;
 ctx.strokeStyle='#2c4857';ctx.lineWidth=.6;ctx.font='10px Inter, sans-serif';ctx.textBaseline='middle';ctx.fillStyle='#9db4c0';for(let j=0;j<=4;j++){const yy=top+ch*j/4,v=maxY-(maxY-minY)*j/4;ctx.beginPath();ctx.moveTo(left,yy);ctx.lineTo(w-right,yy);ctx.stroke();ctx.fillText(fmt(v,maxY-minY<2?2:0),4,yy);}const hdata=s.history;if(!hdata.length)return;const start=Math.max(0,hdata[hdata.length-1].t-180),end=Math.max(180,hdata[hdata.length-1].t),den=Math.max(1,end-start);
 for(let j=0;j<=4;j++){const xx=left+cw*j/4;ctx.strokeStyle='#243e4d';ctx.beginPath();ctx.moveTo(xx,top);ctx.lineTo(xx,top+ch);ctx.stroke();ctx.fillStyle='#87a4b2';ctx.fillText(Math.round(start+den*j/4)+'s',xx-7,h-10);}
 const xy=(p,key)=>[left+(p.t-start)/den*cw,top+(maxY-clamp(p[key],minY,maxY))/(maxY-minY)*ch];
 for(const {key,color,dashed} of series){ctx.strokeStyle=color;ctx.lineWidth=2;ctx.setLineDash(dashed?[6,4]:[]);ctx.beginPath();let first=true;for(const point of hdata){if(point.t<start)continue;const [x,y]=xy(point,key);if(first){ctx.moveTo(x,y);first=false}else ctx.lineTo(x,y);}ctx.stroke();ctx.setLineDash([]);}
}
function renderCharts(){drawChart('chartPress',[{key:'preg',color:'#35d6c8'},{key:'psep',color:'#eab968'}],1.7,3.5);drawChart('chartDp',[{key:'dp',color:'#50abf5'},{key:'dpTrue',color:'#55d6c0',dashed:true},{key:'dpSp',color:'#eab968',dashed:true}],-.22,1.0);drawChart('chartMv',[{key:'pdic',color:'#36d4c3'},{key:'pic',color:'#e3ad5b'},{key:'a1',color:'#809efb'},{key:'a2',color:'#d68cfe'}],0,100);}
window.addEventListener('resize',renderCharts);
let frameAt=performance.now(),renderAt=frameAt,chartAt=frameAt;
function animationLoop(now){let realdt=Math.min(.11,Math.max(0,(now-frameAt)/1000));frameAt=now;if(!s.paused){let simTime=realdt*s.speed;while(simTime>0){const dt=Math.min(.1,simTime);advance(dt);simTime-=dt;}}
 if(now-renderAt>90){render();renderAt=now;}if(now-chartAt>500 && $('page-simulator').classList.contains('active')){renderCharts();chartAt=now;}requestAnimationFrame(animationLoop);}
document.querySelectorAll('[data-select-valve]').forEach(el=>{
 const open=()=>{const i=Number(el.getAttribute('data-select-valve'));s.path='individual';s.manualA1=s.targetA1;s.manualA2=s.targetA2;updateControls();
 $('manualA'+i).focus({preventScroll:true});document.getElementById('manualValves').scrollIntoView({behavior:'smooth',block:'center'});
 toast('Modo de posicionamento individual didático: ajuste o comando da L-3903A'+i+'.');recordEvent('mode','Comando individual selecionado para a A'+i,'O clique na válvula é um atalho para o controle manual do laboratório.');};
 el.addEventListener('click',open);el.addEventListener('keydown',ev=>{if(ev.key==='Enter'||ev.key===' '){ev.preventDefault();open();}});
});
resetSim();showMission();requestAnimationFrame(animationLoop);

// ===== CENÁRIOS CIC COM EXPLICAÇÕES ENCADEADAS =====
const scenes=[
 {id:'01',title:'Diferencial abaixo da referência',symptom:'PDIC: PV 0,27; SP 0,30. PIC com MV inferior.',reason:'Qual objetivo físico deve orientar a interpretação inicial?',response:'Com pressão do D-3902 constante, a redução da descarga de gases tende a elevar P(D-3904) e recuperar ΔP.',caution:'O operador deve primeiro identificar se o PDIC está prevalecendo e observar tendência de comando e posição. A MV isolada não demonstra movimento.',preset:'normal',kind:'∆P'},
 {id:'02',title:'Aumento da geração de gases',symptom:'Subida sustentada de P(D-3904) e de ΔP.',reason:'Como o PDIC deverá corrigir?',response:'A tendência do PDIC é aumentar sua MV para abrir mais as slides e ampliar a descarga de gases.',caution:'Se a pressão superar a região de controle do PIC, a maior demanda poderá vir do override. Observar contrapressão e limites operacionais.',preset:'loadUp',kind:'GASES'},
 {id:'03',title:'Pressão D-3902 sobe',symptom:'P(D-3902) aumenta e ΔP diminui mesmo com P(D-3904) quase constante.',reason:'Qual a tendência esperada do PDIC?',response:'Solicitar menor abertura, aumentando a resistência na descarga dos gases para recuperar P(D-3904) − P(D-3902).',caution:'Se a pressão do regenerador se elevar demais, o PIC pode competir com o PDIC e assumir a seleção de máxima.',preset:'sepUp',kind:'D-3902'},
 {id:'04',title:'Pressão D-3902 cai',symptom:'P(D-3902) diminui; ΔP cresce sem aumento proporcional no regenerador.',reason:'Qual variável a malha está observando?',response:'O diferencial cresce porque sua parcela subtraída diminuiu; o PDIC tende a solicitar maior abertura de descarga.',caution:'Não deduzir a causa apenas pela MV: conferir ambas as pressões e transmissores.',preset:'sepDown',kind:'D-3902'},
 {id:'05',title:'PIC passa a prevalecer',symptom:'P(D-3904) aproxima-se da referência superior e MV do PIC ultrapassa o PDIC.',reason:'O que o seletor faz?',response:'O PDY-029A escolhe a saída mais alta do PIC e tende a impor mais abertura às slides.',caution:'A recuperação imediata do diferencial pode ficar subordinada à contenção da pressão do regenerador.',preset:'picOverride',kind:'OVERRIDE'},
 {id:'06',title:'L-3903A1 não acompanha',symptom:'Comando A1 varia, mas ZI-39968 permanece quase constante.',reason:'Que evidência comprova falha de acompanhamento?',response:'A diferença entre comando e posição real cresce; a capacidade efetiva de descarga pode ficar limitada.',caution:'Não presumir compensação automática da A2. Confirmar a configuração real e a situação dos atuadores.',preset:'jam1',kind:'ATUADOR'},
 {id:'07',title:'Transmissor PT-029B desviado',symptom:'ΔP calculado apresenta desvio incoerente com leitura independente do regenerador.',reason:'O que avaliar antes de alterar setpoint?',response:'Conferir coerência entre PT-029B, PT-029A, PT-028, históricos, escalas e ponto de tomada.',caution:'Um controle atuando sobre medição incorreta pode provocar deslocamento inadequado das slides.',preset:'bias',kind:'MEDIÇÃO'},
 {id:'08',title:'Restrição a jusante cresce',symptom:'A contrapressão aumenta e o fluxo relativo dos gases diminui.',reason:'Por que a pressão pode crescer mesmo com abertura adequada?',response:'Com menor diferencial disponível para descarga, a mesma posição fornece menor capacidade de escoamento.',caution:'Ajustar apenas a MV não elimina uma restrição física a jusante. Verificar o sistema de gases conforme procedimentos.',preset:'backUp',kind:'HIDRÁULICA'}
];
function makeScenarioCards(){const host=$('scenarioCards');host.innerHTML=scenes.map(x=>`<article class="scenario-card" id="sc-${x.id}"><span class="kicker">CENÁRIO ${x.id} · ${x.kind}</span><h3>${x.title}</h3><p>${x.symptom}</p><dl><div><dt>QUESTÃO DE DIAGNÓSTICO</dt><dd>${x.reason}</dd></div><div><dt>PONTO DE ACOMPANHAMENTO</dt><dd>Pressões + MV + posição real</dd></div></dl><div class="expansion"><p><strong>Resposta técnica:</strong> ${x.response}</p><p><strong>Cuidados:</strong> ${x.caution}</p></div><div class="actions"><button class="button outline small" data-expand="${x.id}">Entenda a correção</button><button class="button primary small" data-simscenario="${x.preset}">Simular cenário ↗</button></div></article>`).join('');host.querySelectorAll('[data-expand]').forEach(b=>b.addEventListener('click',()=>{const card=$('sc-'+b.dataset.expand);const exp=card.classList.toggle('expanded');b.textContent=exp?'Ocultar explicação':'Entenda a correção';}));host.querySelectorAll('[data-simscenario]').forEach(b=>b.addEventListener('click',()=>{resetSim();preset(b.dataset.simscenario);goPage('simulator');}));}
makeScenarioCards();

// ===== AVALIAÇÃO: ALTERNATIVAS PLAUSÍVEIS, EMBARALHAMENTO E DISTRIBUIÇÃO =====
const QUESTIONS=[
 {tag:'Leitura de sinais',q:'Com PT-029B em 2,47, PT-029A em 2,20 e SP do PDIC em 0,30, qual é a interpretação correta?',a:['ΔP = 0,27, estando 0,03 abaixo do SP.','ΔP = 0,27, estando 0,03 acima do SP.','ΔP = 0,30, sem desvio em relação ao SP.','ΔP = 0,23, estando 0,07 abaixo do SP.'],why:'ΔP = 2,47 − 2,20 = 0,27. Em relação ao setpoint de 0,30, o diferencial está 0,03 abaixo.'},
 {tag:'Seletor de máxima',q:'PDIC-029 tem MV=47,6% e PIC-028 MV=10%. Qual é a saída do PDY-029A?',a:['47,6%, proveniente do controlador diferencial de pressão.','10%, proveniente da referência de pressão do regenerador.','57,6%, resultante da soma das duas demandas de controle.','28,8%, resultante da média aritmética das saídas.'],why:'O seletor de máxima escolhe o maior dos dois valores; não soma, não subtrai e não tira média.'},
 {tag:'Ação corretiva',q:'Com P(D-3902) constante, o diferencial cai abaixo do SP e o PDIC prevalece. Qual efeito físico tende a recuperar o ΔP?',a:['Restringir parcialmente a descarga de gases para elevar P(D-3904).','Ampliar a descarga de gases para elevar P(D-3904) e recuperar o diferencial.','Manter abertura fixa e reduzir somente a pressão do D-3902.','Aumentar a descarga para elevar P(D-3902) e ΔP.'],why:'O fechamento parcial eleva a restrição de saída e tende a aumentar a pressão a montante, recuperando P(D-3904) − P(D-3902).'},
 {tag:'Override',q:'O PIC-028 passa a comandar 68%, enquanto o PDIC permanece em 44%. O que deve prevalecer no PDY-029A?',a:['O comando de 68% solicitado pelo PIC-028.','O comando de 44% solicitado pelo PDIC-029.','A divisão igual de 56% entre os controladores.','A soma compensada dos comandos dos dois controladores.'],why:'O PDY-029A é um seletor de maior. A saída de 68% supera 44% e passa a ser selecionada.'},
 {tag:'Processo',q:'A pressão do separador aumenta, mas a pressão do regenerador muda pouco. Como isso afeta o ΔP D-3904 menos D-3902?',a:['O diferencial diminui porque o termo subtraído aumentou.','O diferencial cresce porque a pressão a jusante é maior.','O diferencial não muda sem alteração na posição das slides.','O diferencial passa automaticamente a ser igual à MV do PIC.'],why:'ΔP = P regenerador − P separador. Aumentar P separador mantendo a primeira parcela quase constante diminui o resultado.'},
 {tag:'Posicionamento',q:'A1 recebe comando de 62%, mas sua realimentação permanece em 48%. Qual é o melhor diagnóstico inicial?',a:['Investigar grande desvio entre comando e posição e a capacidade de atuação.','Concluir que a válvula já atingiu 62%, pois a MV do controlador é uma medição direta.','Atribuir a pressão do separador ao desvio sem verificar realimentação.','Descartar problema de atuador porque o controle está em automático.'],why:'A diferença de 14 pontos percentuais indica falha de acompanhamento ou dinâmica anormal; verificar atuador, posicionador, instrumentos e lógica.'},
 {tag:'Controle x segurança',q:'O fato de existir PIC-028 com seletor de máxima permite concluir que há uma função instrumentada de segurança independente?',a:['Não; controle de sobreposição não demonstra uma função instrumentada de segurança.','Sim; todo seletor de máxima equivale a intertravamento, mesmo sem lógica independente.','Sim; a existência de duas MVs elimina a necessidade de outras proteções.','Não; porque a pressão do regenerador não afeta a segurança de processo.'],why:'Uma filosofia de override não comprova implementação de SIS, intertravamento ou nível de integridade.'},
 {tag:'Instrumentação',q:'O PT-029B fornece valor incompatível com o PT-028, ambos associados ao regenerador. Qual ação de diagnóstico é mais fundamentada?',a:['Verificar medições, escalas, históricos e consistência antes de alterar SP.','Ajustar o SP diferencial até que os dois transmissores coincidam.','Manter apenas a posição real das slides como medida de pressão.','Assumir que o PT-028 está errado por ser controle secundário.'],why:'Confrontar instrumentos independentes e históricos ajuda a separar perturbação real de desvio de medição.'},
 {tag:'Fluidos',q:'Mantida a pressão do regenerador e as aberturas, a contrapressão da descarga sobe. O que tende a ocorrer?',a:['A capacidade de escoamento das slides tende a diminuir.','A capacidade de escoamento aumenta devido ao maior bloqueio.','A vazão permanece idêntica independentemente das pressões.','O diferencial entre D-3904 e D-3902 deixa de existir.'],why:'Menor diferencial disponível através das slides tende a reduzir a vazão, mantidas outras condições.'},
 {tag:'Distribuição A1/A2',q:'As duas slides indicam posições reais de 47,9% e 50,3%. Que inferência é tecnicamente sustentável?',a:['Há pequena diferença de posição, sem prova de falha nem de vazão idêntica.','A válvula A2 transporta exatamente 2,4% mais vazão, porque sua abertura é maior.','A válvula A1 está travada porque sua posição é menor que 50%.','O seletor PDY-029A enviou necessariamente dois comandos iguais.'],why:'O posicionamento diferenciado pode ser normal. Igualdade ou desigualdade de vazão requer características e pressões dos ramais.'},
 {tag:'Banda morta ZIC-009',q:'Com SP do ZIC-009 em 48%, qual condição libera novo comando para a slide NÃO selecionada pela HS-39014?',a:['PV = 45%, desvio de 3 pontos percentuais.','PV = 47%, desvio de 1 ponto percentual.','PV = 46%, desvio de 2 pontos percentuais.','PV = 48%, sem desvio entre PV e SP.'],why:'A PV do ZIC é o maior sinal selecionado pelo PDY-029A (PDIC ou PIC). Com SP de 48%, desvio de 3 p.p. libera correção didática para a slide auxiliar.'},
 {tag:'Malha integrada',q:'O diferencial está abaixo do SP, mas a pressão do regenerador exige forte abertura pelo PIC. Como interpretar o conflito?',a:['A seleção de máxima pode priorizar a abertura para controlar a pressão.','O PDIC deve sempre prevalecer porque compara duas pressões independentes do sistema.','O seletor bloqueia os dois sinais até que seus setpoints coincidam.','O PIC necessariamente fecha a slide porque sua PV está elevada.'],why:'O seletor passa a maior MV. A regulação de pressão pode se sobrepor à recuperação imediata do diferencial.'},
 {tag:'Falha de atuação',q:'O comando de A1 aumenta, mas a posição real não varia e P(D-3904) continua crescendo. Qual sequência de observação é mais útil?',a:['Confirmar comando, realimentação, desvio, contrapressão e condição do atuador.','Alterar repetidamente SP para induzir uma nova resposta, sem verificar se a slide obedece.','Inferir que a A2 assumiu controle automático sem consultar a lógica.','Ignorar a pressão porque o controlador apresenta MV dentro de 0–100%.'],why:'Uma ordem de abertura não comprova aumento de descarga. O diagnóstico integra execução, instrumentação e processo.'},
 {tag:'PV do ZIC-009',q:'Qual sinal chega à entrada PV do ZIC-009 quando o PDIC solicita 47,6% e o PIC solicita 10%?',a:['O sinal percentual de 47,6% selecionado pelo PDY-029A.','A posição real de 47,9% informada pelo ZI-39968.','A saída de 10% do PIC-028, independentemente do seletor.','O valor de 48% que o operador digitou como SP do ZIC.'],why:'A PV do ZIC-009 vem da saída de maior valor do PDY-029A, neste caso 47,6%. O SP digitado pelo operador é uma entrada distinta. A posição real da slide não é a PV do ZIC.'},
 {tag:'Diagnóstico numérico',q:'A1 tem comando 48% e posição real 47,9%. Como interpretar o desvio em pontos percentuais?',a:['A magnitude é de 0,1 ponto percentual, relativamente pequena.','A magnitude é de 1 ponto percentual, exatamente igual à banda morta.','A magnitude é de 10 pontos percentuais, acima do valor ±5.','A magnitude é nula, pois posição e comando sempre coincidem.'],why:'|48 − 47,9| = 0,1 ponto percentual. Não confundir ponto percentual com porcentagem relativa.'},
 {tag:'Operação CIC',q:'Antes de transferir o controle real da PDV-39027C para as L-3903, qual referência deve prevalecer?',a:['Procedimento controlado vigente, verificações de disponibilidade e coordenação CIC/campo.','Sequência aleatória da simulação, pois ela contém as mesmas válvulas do processo.','Apenas a porcentagem da MV do PDIC, sem avaliar pressão e alinhamento.','A movimentação simultânea máxima das válvulas para abreviar a transferência.'],why:'O procedimento PE.REF.OPE.CCF.063 é a referência para transferências reais, com acompanhamento e coordenação operacional.'}
];
let quiz={order:[],i:0,score:0,answers:[],locked:false};
function shuffle(arr){for(let i=arr.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[arr[i],arr[j]]=[arr[j],arr[i]];}return arr;}
function buildQuiz(){quiz={order:shuffle(QUESTIONS.map((q,id)=>({q,id}))),i:0,score:0,answers:[],locked:false};const balance=[0,0,0,0];quiz.order.forEach(({q},ix)=>{const low=Math.min(...balance),slots=balance.map((n,j)=>({n,j})).filter(x=>x.n===low);const correctIndex=slots[Math.floor(Math.random()*slots.length)].j;balance[correctIndex]++;const wrong=shuffle(q.a.slice(1).map((text,i)=>({text,correct:false})));wrong.splice(correctIndex,0,{text:q.a[0],correct:true});quiz.answers[ix]=wrong;});renderQuiz();}
function renderQuiz(){const current=quiz.order[quiz.i];if(!current){$('qCounter').textContent='AVALIAÇÃO CONCLUÍDA';$('qTheme').textContent='RESULTADO FINAL';$('questionText').textContent=`Você acertou ${quiz.score} de ${quiz.order.length} questões.`;$('quizOptions').innerHTML='<p>Refaça a avaliação para obter nova distribuição de questões e alternativas. Procure explicar a relação entre as medições, as saídas dos controladores e as posições reais.</p>';$('quizFeedback').hidden=false;$('quizFeedback').textContent=quiz.score>=Math.ceil(quiz.order.length*.8)?'Bom domínio conceitual. Os cenários de falha de atuação e conflito de controle merecem sempre atenção.':'Revise a lógica de seleção de máxima, o sinal das ações corretivas e o acompanhamento das slides.';$('quizNext').disabled=true;$('quizNext').textContent='Avaliação concluída';$('quizProgress').style.width='100%';return;}
 quiz.locked=false;$('qCounter').textContent=`QUESTÃO ${quiz.i+1} DE ${quiz.order.length}`;$('qTheme').textContent=current.q.tag.toUpperCase();$('questionText').textContent=current.q.q;$('quizProgress').style.width=((quiz.i)/quiz.order.length*100)+'%';$('quizOptions').innerHTML=quiz.answers[quiz.i].map((a,j)=>`<button class="option" data-answer="${j}"><span class="letter">${'ABCD'[j]}</span><span>${esc(a.text)}</span></button>`).join('');$('quizFeedback').hidden=true;$('quizFeedback').className='quiz-feedback';$('quizNext').disabled=true;$('quizNext').textContent=quiz.i===quiz.order.length-1?'Ver resultado final →':'Próxima questão →';$('quizScore').textContent=quiz.score+' / '+quiz.i;
 $('quizOptions').querySelectorAll('[data-answer]').forEach(b=>b.addEventListener('click',()=>chooseAnswer(Number(b.dataset.answer))));}
function chooseAnswer(j){if(quiz.locked)return;quiz.locked=true;const correct=quiz.answers[quiz.i][j].correct;if(correct)quiz.score++;
 $('quizOptions').querySelectorAll('[data-answer]').forEach((btn,k)=>{btn.disabled=true;const a=quiz.answers[quiz.i][k];if(a.correct)btn.classList.add('correct');else if(k===j)btn.classList.add('wrong');});
 const feedback=$('quizFeedback');feedback.hidden=false;feedback.classList.toggle('wrong',!correct);feedback.textContent=(correct?'Resposta correta. ':'Resposta inadequada. ')+quiz.order[quiz.i].q.why;$('quizNext').disabled=false;$('quizScore').textContent=quiz.score+' / '+(quiz.i+1);}
$('quizNext').addEventListener('click',()=>{quiz.i++;renderQuiz();});$('resetQuiz').addEventListener('click',()=>{buildQuiz();toast('Nova avaliação: ordem de questões e alternativas reorganizada.')});buildQuiz();
