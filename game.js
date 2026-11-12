'use strict';
const CAP=4,names=['Лисеня','Зайчик','Єнот','Ведмежа','Котик','Панда'];
const $=id=>document.getElementById(id),copy=s=>s.map(b=>b.slice());
const won=s=>s.every(b=>!b.length||(b.length===CAP&&b.every(x=>x===b[0])));
const legal=(s,a,b)=>a!==b&&s[a].length>0&&s[b].length<CAP&&(!s[b].length||s[b].at(-1)===s[a].at(-1));
function rng(seed){return()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296}}
const MODES={cozy:{name:'Затишний',colors:3,empty:3,mix:30},adventure:{name:'Пригода',colors:5,empty:2,mix:95},expert:{name:'Експерт',colors:6,empty:1,mix:160}};
let mode='adventure',campaign={cozy:1,adventure:1,expert:1},target=0,stars={},living=true;
function generate(level,kind=mode){const cfg=MODES[kind];let best=null;for(let attempt=0;attempt<18;attempt++){let random=rng(level*7919+attempt*983+cfg.colors*37),n=cfg.colors,s=Array.from({length:n},(_,i)=>Array(4).fill(i)).concat(Array.from({length:cfg.empty},()=>[])),reverse=[],visited=new Set([JSON.stringify(s)]);for(let k=0;k<cfg.mix+level*2;k++){let choices=[];for(let a=0;a<s.length;a++)if(s[a].length&&(s[a].length===1||s[a].at(-1)===s[a].at(-2)))for(let b=0;b<s.length;b++)if(a!==b&&s[b].length<CAP){let t=copy(s);t[b].push(t[a].pop());if(!visited.has(JSON.stringify(t)))choices.push([a,b,t])}if(!choices.length)break;let [a,b,t]=choices[Math.floor(random()*choices.length)];s=t;visited.add(JSON.stringify(s));reverse.unshift([b,a])}let score=s.reduce((v,b)=>v+b.slice(1).filter((x,j)=>x!==b[j]).length,0);if(!won(s)&&(!best||score>best.score))best={state:s,route:reverse,score}}if(!best)throw Error('Level generation failed');return best}
let level=1,unlocked=1,state,route=[],initial,history=[],selected=-1,busy=false,moves=0,sound=true,extra=false;
const preferredLanguages=navigator.languages?.length?navigator.languages:[navigator.language||'en'];
const detectLanguage=()=>{for(const locale of preferredLanguages){const key=locale.toLowerCase().split('-')[0];if(window.FluffyLocales[key])return key;if(key==='tl'&&window.FluffyLocales.fil)return 'fil'}return 'en'};
let lang=localStorage.getItem('fluffy-forest-lang')||detectLanguage();
if(!window.FluffyLocales[lang])lang='en';
function tr(key){return window.FluffyLocales[lang][key]}
function modeName(k){return tr('modes')[k]}
let speechEnabled=localStorage.getItem('fluffy-forest-voice')!=='off',voiceTutored=false;
function narrate(t,pet=false){if(sound&&speechEnabled&&t){if(pet)window.FluffyAudio?.effect('chirp');window.FluffyVoice?.speak(t,window.FluffyVoiceTags?.[lang]||'en-US',{pet})}}
function syncSoundButton(){const button=$('sound');button.classList.toggle('muted',!sound);button.setAttribute('aria-pressed',String(sound));button.setAttribute('aria-label',tr(sound?'soundOff':'soundOn'))}
function translateStatic(){
  document.documentElement.lang=lang;
  document.documentElement.dir=['ar','ur'].includes(lang)?'rtl':'ltr';
  document.title=tr('title');
  document.querySelector('meta[name="description"]').content=tr('description');
  $('home').setAttribute('aria-label',tr('homeAria'));
  syncSoundButton();
  $('difficulty').setAttribute('aria-label',tr('difficultyAria'));
  $('levelLabel').textContent=tr('levelLabel');
  for(const [id,key] of [['undo','undo'],['hint','hint'],['restart','restart'],['extra','extra']])$(id).querySelector('span').textContent=tr(key);
  document.querySelector('.caption').firstChild.textContent=tr('tagline')+' ';
  $('close').textContent=tr('continue');
  $('board').setAttribute('aria-label',tr('branches'));
  say(tr('instruction'));
}
try{const p=JSON.parse(localStorage.getItem('fluffy-forest-v1'));if(p&&Number.isInteger(p.level)&&p.level>0&&p.level<=100&&Array.isArray(p.state)&&p.state.length<=9&&p.state.every(b=>Array.isArray(b)&&b.length<=4&&b.every(t=>Number.isInteger(t)&&t>=0&&t<6))){({level,state,route,moves,extra}=p);unlocked=Math.max(level,p.unlocked||1);mode=MODES[p.mode]?p.mode:'adventure';campaign={...campaign,...p.campaign};campaign[mode]=unlocked;target=p.target||Math.max(8,Math.ceil((p.route?.length||20)*1.35));stars=p.stars||{};living=p.living!==false;sound=!!p.sound;}}catch{}
function save(){try{localStorage.setItem('fluffy-forest-v1',JSON.stringify({level,unlocked,state,route,moves,extra,mode,campaign,target,stars,living,sound}))}catch{}}
function start(l){level=l;unlocked=campaign[mode]||1;const g=generate(l,mode);target=Math.max(8,Math.ceil(g.route.length*(mode==='cozy'?1.8:mode==='expert'?1:1.35)));state=g.state;route=g.route;initial=copy(state);history=[];moves=0;selected=-1;extra=false;busy=false;voiceTutored=false;render();say(tr('instruction'));save()}
function sprite(t,branchIndex=0,slotIndex=0){
 const el=document.createElement('span');el.className='animal species-'+t;el.dataset.type=t;
 const x=`${t%3*50}%`,y=`${Math.floor(t/3)*100}%`;
 el.style.setProperty('--sprite-x',x);el.style.setProperty('--sprite-y',y);
 el.style.backgroundPosition=`${x} ${y}`;
 // Stable per-branch phases: rerendering controls must not restart everybody in sync.
 const seed=(t*17+branchIndex*13+slotIndex*7)%19;
 el.style.setProperty('--idle-duration',`${(3.4+(seed%7)*.18).toFixed(2)}s`);
 el.style.setProperty('--idle-delay',`${(-seed*.23).toFixed(2)}s`);
 // Never duplicate/clamp the head into rotating ears: visible rectangular sprite seams.
 el.innerHTML='<i aria-hidden="true" class="blink-eye blink-left"></i><i aria-hidden="true" class="blink-eye blink-right"></i>';
 return el;
}
function render(){const board=$('board');board.innerHTML='';state.forEach((b,i)=>{const el=document.createElement('button');el.className='branch'+(i===selected?' selected':'')+(b.length===4&&b.every(t=>t===b[0])?' complete':'');el.setAttribute('aria-label',`${tr('branch')} ${i+1}: ${b.map(t=>tr('names')[t]).join(', ')||tr('empty')}`);el.innerHTML='<span class="wood"></span>';if(!b.length)el.insertAdjacentHTML('beforeend','<span class="slots">· · · ·</span>');b.forEach((t,j)=>{let animal=sprite(t,i,j);if(mode==='expert'&&j<b.length-1&&!b.every(x=>x===b[0]))animal.classList.add('mystery');el.append(animal)});el.onclick=()=>tap(i);board.append(el)});$('level').textContent=String(level).padStart(2,'0');$('moves').textContent=`${moves} / ${target} ${tr('moves')}`;$('difficulty').textContent=modeName(mode);$('app').classList.toggle('still',!living);$('undo').disabled=!history.length||busy;$('extra').disabled=extra||busy||mode==='expert';$('chapter').textContent=tr('chapters')[level<6?0:level<16?1:2];$('progress').style.width=state.filter(b=>b.length===4&&b.every(t=>t===b[0])).length/(state.flat().length/4)*100+'%'}
// Chime after a full family lands, not when the board initially renders.
let completedBeforeRender=0,completionLanding=false;
const originalRender=render;
render=function(){
  const completed=state.filter(b=>b.length===CAP&&b.every(t=>t===b[0])).length;
  if(busy&&completed>completedBeforeRender)completionLanding=true;
  if(!busy&&completionLanding){completionLanding=false;window.FluffyAudio?.effect('complete')}
  completedBeforeRender=completed;
  return originalRender();
};
function say(t,spoken=false,pet=false){$('message').textContent=t;if(spoken)narrate(t,pet)}
function tone(f=500){if(!sound)return;const kind=f>=1000?'win':f>=700?'move':f<300?'invalid':'pick';window.FluffyAudio?.effect(kind,f)}
async function tap(i){if(busy||won(state))return;if(selected<0){if(state[i].length){selected=i;tone(620);render();say(tr('pickDestination'),!voiceTutored);voiceTutored=true}return}if(selected===i){selected=-1;render();return}let a=selected;if(!legal(state,a,i)){selected=state[i].length?i:-1;tone(180);render();say(tr('invalidMove'),true);return}busy=true;history.push({state:copy(state),route:route.map(x=>x.slice()),extra});const from=$('board').children[a].querySelector('.animal:last-of-type'),r=from.getBoundingClientRect();state[i].push(state[a].pop());if(route.length&&route[0][0]===a&&route[0][1]===i)route.shift();else route=[];moves++;selected=-1;render();const dest=$('board').children[i].querySelector('.animal:last-of-type'),d=dest.getBoundingClientRect(),fly=dest.cloneNode(true);dest.style.visibility='hidden';fly.classList.add('flying');Object.assign(fly.style,{left:r.left+'px',top:r.top+'px',width:r.width+'px',height:r.height+'px'});document.body.append(fly);tone(720);const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;await fly.animate([{transform:'translate(0,0) scale(1,.9)'},{transform:`translate(${(d.left-r.left)*.5}px,${(d.top-r.top)*.5-65}px) scale(1.08) rotate(-8deg)`,offset:.5},{transform:`translate(${d.left-r.left}px,${d.top-r.top}px) scale(1.1,.9)`}],{duration:reduce?1:550,easing:'cubic-bezier(.3,.1,.25,1)'}).finished;fly.remove();dest.style.visibility='';busy=false;render();save();if(won(state)){unlocked=Math.min(100,Math.max(unlocked,level+1));campaign[mode]=unlocked;stars[mode+level]=Math.max(stars[mode+level]||0,extra?1:moves<=target?3:moves<=target*1.5?2:1);save();celebrate(d);setTimeout(victory,550)}else say(tr('collectFour'))}
function celebrate(r){tone(1000);for(let k=0;k<25;k++){const el=document.createElement('span');el.className='spark';el.textContent='✦';el.style.left=r.left+'px';el.style.top=r.top+'px';el.style.setProperty('--x',(Math.random()-.5)*450+'px');el.style.setProperty('--y',(Math.random()-.7)*400+'px');document.body.append(el);setTimeout(()=>el.remove(),1100)}}
function modal(html){$('modalContent').innerHTML=html;if(!$('modal').open)$('modal').showModal()}
function victory(){modal(`<div style="font-size:40px;color:#efcb7b">${'✦ '.repeat(stars[mode+level]||1)}</div><h2>${tr('allHome')}</h2><p>${tr('victoryLine')}<br>${tr('victorySummary').replace('{level}',level).replace('{moves}',moves)}</p><button class="primary" id="next">${level<100?tr('next'):tr('playAgain')}</button>`);narrate(tr('allHome')+' '+tr('victoryLine'));$('next').onclick=()=>{$('modal').close();start(level<100?level+1:1)}}
$('close').onclick=()=>$('modal').close();$('undo').onclick=()=>{if(busy||!history.length)return;const p=history.pop();state=p.state;route=p.route;extra=p.extra;moves=Math.max(0,moves-1);selected=-1;render();save();say(tr('undoDone'))};$('restart').onclick=()=>{if(busy)return;modal(`<h2>${tr('restartTitle')}</h2><p>${tr('restartBody')}</p><button class="primary" id="yes">${tr('restartConfirm')}</button>`);$('yes').onclick=()=>{$('modal').close();start(level)}};
$('extra').onclick=()=>{if(busy||extra||mode==='expert')return;state.push([]);extra=true;render();save();say(tr('extraAdded'),true)};
function solve(board){let seen=new Set(),budget=60000;function walk(s,path){if(won(s))return path;if(!budget--||path.length>100)return null;const key=s.map(b=>b.join('')).sort().join('|');if(seen.has(key))return null;seen.add(key);let choices=[];for(let a=0;a<s.length;a++){if(!s[a].length||s[a].length===4&&s[a].every(x=>x===s[a][0]))continue;let empty=false;for(let b=0;b<s.length;b++)if(legal(s,a,b)){if(!s[b].length){if(empty||s[a].every(x=>x===s[a][0]))continue;empty=true}choices.push([a,b])}}choices.sort((x,y)=>s[y[1]].length-s[x[1]].length);for(let [a,b] of choices){let n=copy(s);n[b].push(n[a].pop());let r=walk(n,path.concat([[a,b]]));if(r)return r}return null}return walk(copy(board),[])}
$('hint').onclick=()=>{if(busy)return;if(won(state)){victory();return}if(!route.length){say(tr('searching'));route=solve(state)||[]}while(route.length>1&&route[0][0]===route[1][1]&&route[0][1]===route[1][0])route.splice(0,2);if(route.length){let [a,b]=route[0];if(legal(state,a,b)){$('board').children[a].classList.add('hinted');$('board').children[b].classList.add('hinted');selected=a;say(tr('hintMove').replace('{a}',a+1).replace('{b}',b+1),true,true);return}}say(tr('hintFallback'),true,true)};
$('sound').onclick=()=>{sound=!sound;save();syncSoundButton();window.FluffyAudio?.setEnabled(sound);if(!sound)window.FluffyVoice?.stop()};
$('home').onclick=()=>{if(busy)return;modal(`<h2>${tr('forestAdventures')}</h2><p>${modeName(mode)} • 100 ${tr('levels')}</p><button class="primary" id="chooseMode">${tr('changeDifficulty')}</button><div class="levels">`+Array.from({length:100},(_,i)=>`<button data-l="${i+1}" ${i+1>unlocked?'disabled':''} class="${i+1===level?'current':''}">${i+1>unlocked?'·':i+1}</button>`).join('')+'</div>');$('chooseMode').onclick=chooseMode;document.querySelectorAll('[data-l]').forEach(b=>b.onclick=()=>{$('modal').close();start(Number(b.dataset.l))})};
for(let k=0;k<23;k++){const f=document.createElement('i');f.style.left=Math.random()*100+'%';f.style.top=Math.random()*100+'%';f.style.animationDelay=-Math.random()*8+'s';$('flies').append(f)}
translateStatic();
window.FluffyAudio?.setEnabled(sound,true);
if(!state)start(1);else{initial=copy(state);render();if(won(state))victory()}
function chooseMode(){if(busy)return;modal(`<h2>${tr('modeTitle')}</h2><p>${tr('modeBody')}</p>`+Object.entries(MODES).map(([k,c])=>`<button class="mode-card ${mode===k?'active':''}" data-mode="${k}"><b>${modeName(k)}</b><span>${tr('modeDetails')[k]}</span></button>`).join('')+`<p>${tr('starsHelp')}</p><button id="motion" class="secondary">${tr('animation')}: ${tr(living?'on':'off')}</button><button id="voice" class="secondary">${tr('voice')}: ${tr(speechEnabled?'on':'off')}</button><label class="locale-picker">${tr('language')} <select id="switchLanguage">`+Object.entries(window.FluffyLocaleNames).map(([code,label])=>`<option value="${code}" ${lang===code?'selected':''}>${label}</option>`).join('')+'</select></label>');document.querySelectorAll('[data-mode]').forEach(b=>b.onclick=()=>{mode=b.dataset.mode;$('modal').close();start(campaign[mode]||1);narrate(tr('instruction'))});$('motion').onclick=()=>{living=!living;save();render();chooseMode()};$('voice').onclick=()=>{speechEnabled=!speechEnabled;localStorage.setItem('fluffy-forest-voice',speechEnabled?'on':'off');if(!speechEnabled)window.FluffyVoice?.stop();chooseMode();if(speechEnabled)narrate(tr('voiceOn'))};$('switchLanguage').onchange=e=>{lang=e.target.value;localStorage.setItem('fluffy-forest-lang',lang);window.FluffyVoice?.stop();translateStatic();render();chooseMode();narrate(tr('instruction'))}}
$('difficulty').onclick=chooseMode;
// Ambient motion is intentionally sparse. CSS handles breathing; JS adds occasional expressions.
setInterval(()=>{
 if(!living||document.hidden||busy||$('modal').open||matchMedia('(prefers-reduced-motion: reduce)').matches)return;
 const pets=[...document.querySelectorAll('.branch:not(.selected):not(.complete) .animal:not(.mystery)')];
 if(!pets.length)return;
 const blinkPet=pets[Math.floor(Math.random()*pets.length)];
 if(Math.random()<.78){
  blinkPet.classList.add('blinking');
  setTimeout(()=>blinkPet.classList.remove('blinking'),135);
  if(Math.random()<.23)setTimeout(()=>{if(blinkPet.isConnected){blinkPet.classList.add('blinking');setTimeout(()=>blinkPet.classList.remove('blinking'),125)}},275);
 }
 if(Math.random()<.42){
  const pet=pets[Math.floor(Math.random()*pets.length)];
  if(!pet.classList.contains('curious')){
   pet.classList.add('curious');
   setTimeout(()=>pet.classList.remove('curious'),1550);
  }
 }
},1650);
document.addEventListener('visibilitychange',()=>{if(document.hidden){save();window.FluffyAudio?.pause();window.FluffyVoice?.stop()}else window.FluffyAudio?.resume()});
window.FluffyTest={generate,legal,won,MODES};
