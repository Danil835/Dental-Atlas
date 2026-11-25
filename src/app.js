/* ===== 3D viewer: one renderer shared by learn and test views ===== */
const Viewer=(function(){
  let r,scene,cam,root,ground,overlay,cur=null,sz={w:1,h:1};
  const st={th:.62,ph:1.22,zoom:1,auto:true,fit:4.3,hold:false};
  const cache={};const ptr=new Map();let pinch=0;let ok=false;let el=null;
  function envScene(){
    const s=new T.Scene();
    const dome=new T.Mesh(new T.SphereGeometry(40,32,16),new T.MeshBasicMaterial({color:0x26343b,side:T.BackSide}));s.add(dome);
    const panel=(w,h,x,y,z,v)=>{const m=new T.Mesh(new T.PlaneGeometry(w,h),new T.MeshBasicMaterial({color:new T.Color(v,v,v),side:T.DoubleSide}));m.position.set(x,y,z);m.lookAt(0,0,0);s.add(m);};
    panel(30,12,0,30,6,9);panel(8,30,-30,8,6,6);panel(8,30,30,6,-4,5);panel(40,8,0,4,-32,4);panel(30,5,0,-12,30,2.5);
    return s;
  }
  function init(){
    if(!window.THREE)return false;
    try{
      r=new T.WebGLRenderer({antialias:true,alpha:true});
    }catch(e){return false;}
    r.setPixelRatio(Math.min(window.devicePixelRatio||1,2));
    r.outputEncoding=T.sRGBEncoding;r.toneMapping=T.ACESFilmicToneMapping;r.toneMappingExposure=1.1;
    r.shadowMap.enabled=true;r.shadowMap.type=T.PCFSoftShadowMap;
    scene=new T.Scene();cam=new T.PerspectiveCamera(30,1,.1,200);
    const pm=new T.PMREMGenerator(r);scene.environment=pm.fromScene(envScene(),.03).texture;
    const key=new T.DirectionalLight(0xffffff,1.0);key.position.set(4,8,6);key.castShadow=true;
    key.shadow.mapSize.set(2048,2048);key.shadow.camera.left=-5;key.shadow.camera.right=5;key.shadow.camera.top=5;key.shadow.camera.bottom=-5;key.shadow.bias=-.0004;key.shadow.radius=5;
    scene.add(key);scene.add(new T.HemisphereLight(0xcfe6ff,0x1a2830,.45));
    ground=new T.Mesh(new T.PlaneGeometry(40,40),new T.ShadowMaterial({opacity:.38}));ground.rotation.x=-Math.PI/2;ground.receiveShadow=true;scene.add(ground);
    root=new T.Group();scene.add(root);
    const c=r.domElement;
    c.addEventListener('pointerdown',e=>{c.setPointerCapture(e.pointerId);ptr.set(e.pointerId,{x:e.clientX,y:e.clientY});st.hold=true;if(ptr.size===2)pinch=dist2();});
    c.addEventListener('pointermove',e=>{
      const p=ptr.get(e.pointerId);if(!p)return;
      if(ptr.size===1){st.th-=(e.clientX-p.x)*.009;st.ph=Math.max(.12,Math.min(Math.PI-.12,st.ph-(e.clientY-p.y)*.009));}
      p.x=e.clientX;p.y=e.clientY;
      if(ptr.size===2){const d=dist2();if(pinch>0)st.zoom=clampZ(st.zoom*pinch/d);pinch=d;}
    });
    const up=e=>{ptr.delete(e.pointerId);if(!ptr.size)st.hold=false;pinch=0;};
    c.addEventListener('pointerup',up);c.addEventListener('pointercancel',up);
    c.addEventListener('wheel',e=>{e.preventDefault();st.zoom=clampZ(st.zoom*Math.exp(e.deltaY*.0012));},{passive:false});
    c.addEventListener('dblclick',()=>reset());
    window.addEventListener('resize',resize);
    ok=true;loop();return true;
  }
  function dist2(){const a=[...ptr.values()];return Math.hypot(a[0].x-a[1].x,a[0].y-a[1].y)||1;}
  function clampZ(z){return Math.max(.35,Math.min(1.6,z));}
  function resize(){
    if(!r||!el)return;
    const w=el.clientWidth||300,h=el.clientHeight||300;sz={w,h};
    r.setSize(w,h,false);cam.aspect=w/h;
    st.fitD=Math.max(st.fit,5.3/cam.aspect);cam.updateProjectionMatrix();
  }
  function build(id){
    if(cache[id])return cache[id];
    let g;
    try{g=MK[id]();}catch(e){console.error(id,e);g=new T.Group();}
    const fn=MK[id];const rot=fn.rot||[0,0,-Math.PI/2];
    g.rotation.set(rot[0],rot[1],rot[2]);
    const w=new T.Group();w.add(g);w.updateMatrixWorld(true);
    let box=new T.Box3().setFromObject(w);const sp=box.getBoundingSphere(new T.Sphere());
    const s=1.55*(fn.k||1)/sp.radius;w.scale.setScalar(s);w.updateMatrixWorld(true);
    box=new T.Box3().setFromObject(w);const c=box.getCenter(new T.Vector3());
    w.position.sub(c);box.translate(c.clone().negate());
    cache[id]={w,minY:box.min.y};return cache[id];
  }
  function show(id){
    if(!ok)return;
    const b=build(id);while(root.children.length)root.remove(root.children[0]);
    root.add(b.w);ground.position.y=b.minY-.04;cur=id;reset(true);
  }
  function reset(soft){st.th=.62;st.ph=1.22;st.zoom=1;if(!soft)st.auto=st.auto;}
  function loop(){
    requestAnimationFrame(loop);
    if(!el||!el.isConnected||el.offsetParent===null)return;
    if(sz.w!==el.clientWidth||sz.h!==el.clientHeight)resize();
    if(st.auto&&!st.hold)st.th+=.0045;
    const d=(st.fitD||st.fit)*st.zoom;
    cam.position.set(d*Math.sin(st.ph)*Math.sin(st.th),d*Math.cos(st.ph),d*Math.sin(st.ph)*Math.cos(st.th));
    cam.lookAt(0,0,0);r.render(scene,cam);
  }
  function mount(host,ov){
    el=host;host.prepend(r.domElement);if(ov)host.append(ov);resize();
  }
  return {init,mount,show,reset,get ok(){return ok;},toggleAuto(){st.auto=!st.auto;return st.auto;},get auto(){return st.auto;},get cur(){return cur;}};
})();

/* ===== app ===== */
(function(){
  const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
  const UI={
    ru:{title:'Атлас стоматолога',sub:'обучение и проверка знаний',learn:'Обучение',test:'Тест',search:'Поиск инструмента…',all:'Все',
      studied:'изучено',overview:'Обзор',steps:'Инструкция',example:'Пример',mark:'Отметить изученным',marked:'Изучено ✓',prev:'← Назад',next:'Далее →',
      reset:'Сброс',auto:'Вращение',hint:'Тяните, чтобы вращать. Колесо или щипок: масштаб. Двойной клик: сбросить.',
      model:'3D-модель',tstart:'Проверка знаний',tcats:'Разделы',tcount:'Количество вопросов',tbegin:'Начать тест',
      what:'Какой это инструмент?',ex:'Пример применения',q:'Вопрос',of:'из',check:'Подсказка: раздел',right:'Верно!',wrong:'Неверно. Правильный ответ:',
      nextq:'Следующий вопрос',finish:'Показать результат',result:'Результат',again:'Новый тест',redo:'Повторить ошибки',mistakes:'Ошибки',nomist:'Ошибок нет, отличный результат.',
      study:'Изучить',none:'Ничего не найдено',allq:'Все',fail:'3D-просмотр не загрузился. Проверьте интернет и обновите страницу.',
      foot:'Модели построены программно по реальным формам и пропорциям инструментов и служат для распознавания. Конкретные модели и размеры у разных производителей отличаются. Уточняйте инструкции и протоколы в учебниках и у наставника клиники.'},
    uk:{title:'Атлас стоматолога',sub:'навчання і перевірка знань',learn:'Навчання',test:'Тест',search:'Пошук інструмента…',all:'Усі',
      studied:'вивчено',overview:'Огляд',steps:'Інструкція',example:'Приклад',mark:'Позначити вивченим',marked:'Вивчено ✓',prev:'← Назад',next:'Далі →',
      reset:'Скинути',auto:'Обертання',hint:'Тягніть, щоб обертати. Колесо або щипок: масштаб. Подвійний клік: скинути.',
      model:'3D-модель',tstart:'Перевірка знань',tcats:'Розділи',tcount:'Кількість запитань',tbegin:'Почати тест',
      what:'Який це інструмент?',ex:'Приклад застосування',q:'Запитання',of:'з',check:'Підказка: розділ',right:'Правильно!',wrong:'Неправильно. Правильна відповідь:',
      nextq:'Наступне запитання',finish:'Показати результат',result:'Результат',again:'Новий тест',redo:'Повторити помилки',mistakes:'Помилки',nomist:'Помилок немає, чудовий результат.',
      study:'Вивчити',none:'Нічого не знайдено',allq:'Усі',fail:'3D-перегляд не завантажився. Перевірте інтернет і оновіть сторінку.',
      foot:'Моделі побудовано програмно за реальними формами та пропорціями інструментів, вони слугують для розпізнавання. Конкретні моделі й розміри в різних виробників відрізняються. Уточнюйте інструкції й протоколи в підручниках та в наставника клініки.'}
  };
  let lang='ru',view='learn',cur=D[0].id,cat='all',query='',learned=new Set();
  try{lang=localStorage.getItem('da_lang')||'ru';learned=new Set(JSON.parse(localStorage.getItem('da_done')||'[]'));}catch(e){}
  if(!UI[lang])lang='ru';
  const t=k=>UI[lang][k];
  const save=()=>{try{localStorage.setItem('da_lang',lang);localStorage.setItem('da_done',JSON.stringify([...learned]));}catch(e){}};
  const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  const byId=id=>D.find(d=>d.id===id);
  const L=d=>d[lang];

  /* stage overlay (hint + buttons) moved between views */
  const ov=document.createElement('div');
  function buildOverlay(){
    ov.innerHTML='<div class="stagelabel">'+esc(t('model'))+'</div><div class="hint">'+esc(t('hint'))+'</div><div class="tools"><button id="bReset" type="button">'+esc(t('reset'))+'</button><button id="bAuto" type="button" aria-pressed="'+Viewer.auto+'">'+esc(t('auto'))+'</button></div>';
    ov.querySelector('#bReset').onclick=()=>Viewer.reset();
    ov.querySelector('#bAuto').onclick=e=>{e.currentTarget.setAttribute('aria-pressed',Viewer.toggleAuto());};
  }
  function mountStage(host){
    if(!Viewer.ok){host.innerHTML='<div class="fail">'+esc(t('fail'))+'</div>';return;}
    buildOverlay();Viewer.mount(host,ov);
  }

  function renderChrome(){
    $('#ttl').textContent=t('title');$('#sub').textContent=t('sub');
    $$('#tabs button').forEach(b=>{b.textContent=t(b.dataset.v);b.setAttribute('aria-pressed',b.dataset.v===view);});
    $$('#lang button').forEach(b=>b.setAttribute('aria-pressed',b.dataset.l===lang));
    $('#q').placeholder=t('search');$('#foot').textContent=t('foot');
    document.documentElement.lang=lang==='uk'?'uk':'ru';
  }
  function filtered(){
    const q=query.trim().toLowerCase();
    return D.filter(d=>(cat==='all'||d.cat===cat)&&(!q||(L(d).n+' '+d.en+' '+D_ALT(d)).toLowerCase().includes(q)));
  }
  const D_ALT=d=>d.ru.n+' '+d.uk.n;

  function renderSide(){
    $('#cats').innerHTML=['all',...Object.keys(CATS)].map(k=>'<button type="button" class="chip" data-c="'+k+'" aria-pressed="'+(k===cat)+'">'+esc(k==='all'?t('all'):CATS[k][lang])+'</button>').join('');
    $$('#cats .chip').forEach(b=>b.onclick=()=>{cat=b.dataset.c;renderSide();});
    const f=filtered();
    $('#list').innerHTML=f.length?f.map(d=>'<li><button type="button" data-id="'+d.id+'" class="'+(learned.has(d.id)?'done':'')+'" '+(d.id===cur?'aria-current="true"':'')+'><span class="dot"></span><span>'+esc(L(d).n)+'</span></button></li>').join(''):'<li class="prog">'+esc(t('none'))+'</li>';
    $$('#list button').forEach(b=>b.onclick=()=>select(b.dataset.id));
    $('#prog').textContent=learned.size+' / '+D.length+' '+t('studied');
    $('#progbar').style.width=(learned.size/D.length*100)+'%';
  }
  function select(id){cur=id;renderSide();renderInfo();Viewer.show(id);}
  function renderInfo(){
    const d=byId(cur),x=L(d),i=D.indexOf(d);
    $('#info').innerHTML=
      '<div class="head"><div><span class="tag">'+esc(CATS[d.cat][lang])+'</span><h2>'+esc(x.n)+'</h2><div class="en">'+esc(d.en)+'</div></div>'+
      '<button type="button" class="btn '+(learned.has(d.id)?'on':'pri')+'" id="bMark">'+esc(learned.has(d.id)?t('marked'):t('mark'))+'</button></div>'+
      '<div class="sections"><section class="wide"><h3>'+esc(t('overview'))+'</h3><p>'+esc(x.o)+'</p></section>'+
      '<section><h3>'+esc(t('steps'))+'</h3><ol>'+x.i.map(s=>'<li>'+esc(s)+'</li>').join('')+'</ol></section>'+
      '<section><h3>'+esc(t('example'))+'</h3><p class="example">'+esc(x.e)+'</p></section></div>'+
      '<div class="nav" style="margin-top:18px"><button type="button" class="btn" id="bPrev">'+esc(t('prev'))+'</button><button type="button" class="btn" id="bNext">'+esc(t('next'))+'</button></div>';
    $('#bMark').onclick=()=>{learned.has(d.id)?learned.delete(d.id):learned.add(d.id);save();renderSide();renderInfo();};
    $('#bPrev').onclick=()=>select(D[(i-1+D.length)%D.length].id);
    $('#bNext').onclick=()=>select(D[(i+1)%D.length].id);
  }

  /* ===== test ===== */
  const TS={sel:new Set(Object.keys(CATS)),count:10,qs:[],idx:0,score:0,wrong:[],answered:false};
  const shuffle=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};
  function renderSetup(){
    const box=$('#testbox');
    const pool=D.filter(d=>TS.sel.has(d.cat)).length;
    const counts=[10,20,36].filter(c=>c<=Math.max(10,pool));
    box.innerHTML='<div class="card setup"><h2>'+esc(t('tstart'))+'</h2>'+
      '<div><label class="lbl">'+esc(t('tcats'))+'</label><div class="chips" id="tc">'+Object.keys(CATS).map(k=>'<button type="button" class="chip" data-c="'+k+'" aria-pressed="'+TS.sel.has(k)+'">'+esc(CATS[k][lang])+'</button>').join('')+'</div></div>'+
      '<div><label class="lbl">'+esc(t('tcount'))+'</label><div class="chips" id="tn">'+counts.map(c=>'<button type="button" class="chip" data-n="'+c+'" aria-pressed="'+(Math.min(TS.count,pool)===Math.min(c,pool))+'">'+(c>=pool?pool:c)+'</button>').join('')+'</div></div>'+
      '<div><button type="button" class="btn pri" id="go" '+(pool<4?'disabled':'')+'>'+esc(t('tbegin'))+'</button></div></div>';
    $$('#tc .chip').forEach(b=>b.onclick=()=>{const k=b.dataset.c;TS.sel.has(k)?TS.sel.delete(k):TS.sel.add(k);renderSetup();});
    $$('#tn .chip').forEach(b=>b.onclick=()=>{TS.count=+b.dataset.n;renderSetup();});
    $('#go').onclick=()=>startTest(D.filter(d=>TS.sel.has(d.cat)),TS.count);
  }
  function startTest(pool,n){
    TS.qs=shuffle(pool).slice(0,Math.min(n,pool.length));TS.idx=0;TS.score=0;TS.wrong=[];renderQ();
  }
  function renderQ(){
    const d=TS.qs[TS.idx];TS.answered=false;
    const same=shuffle(D.filter(x=>x.id!==d.id&&x.cat===d.cat)),other=shuffle(D.filter(x=>x.id!==d.id&&x.cat!==d.cat));
    const opts=shuffle([d,...same.concat(other).slice(0,3)]);
    const box=$('#testbox');
    box.innerHTML='<div class="qhead"><span>'+esc(t('q'))+' '+(TS.idx+1)+' '+esc(t('of'))+' '+TS.qs.length+'</span><span>'+TS.score+' ✓</span></div>'+
      '<div class="qgrid"><div class="stagewrap"><div class="stage" id="stageT"></div></div>'+
      '<div class="card"><h3 style="font:600 12px var(--f-mono);letter-spacing:.08em;text-transform:uppercase;color:var(--accent);margin:0 0 6px">'+esc(t('ex'))+'</h3>'+
      '<p style="margin:0 0 14px">'+esc(L(d).e)+'</p>'+
      '<div style="font:600 17px var(--f-head)">'+esc(t('what'))+'</div>'+
      '<div class="opts" id="opts">'+opts.map((o,k)=>'<button type="button" class="opt" data-id="'+o.id+'"><span class="k">'+(k+1)+'</span>'+esc(L(o).n)+'</button>').join('')+'</div>'+
      '<div id="fb"></div><div style="margin-top:12px"><button type="button" class="btn" id="hintb">'+esc(t('check'))+'</button> <span class="en" id="hintv"></span></div></div></div>';
    mountStage($('#stageT'));Viewer.show(d.id);
    $('#hintb').onclick=()=>{$('#hintv').textContent=CATS[d.cat][lang];};
    $$('#opts .opt').forEach(b=>b.onclick=()=>answer(b.dataset.id,d));
  }
  function answer(id,d){
    if(TS.answered)return;TS.answered=true;
    const okk=id===d.id;if(okk)TS.score++;else TS.wrong.push(d.id);
    $$('#opts .opt').forEach(b=>{b.disabled=true;if(b.dataset.id===d.id)b.classList.add('good');else if(b.dataset.id===id)b.classList.add('bad');});
    const last=TS.idx===TS.qs.length-1;
    $('#fb').innerHTML='<div class="fb '+(okk?'good':'bad')+'"><strong>'+esc(okk?t('right'):t('wrong')+' '+L(d).n)+'</strong><p style="margin:6px 0 0">'+esc(L(d).o)+'</p></div>'+
      '<div style="margin-top:12px"><button type="button" class="btn pri" id="nq">'+esc(last?t('finish'):t('nextq'))+'</button></div>';
    $('#nq').onclick=()=>{if(last)renderResult();else{TS.idx++;renderQ();}};
    $('#nq').focus();
  }
  function renderResult(){
    const n=TS.qs.length,pct=Math.round(TS.score/n*100);
    $('#testbox').innerHTML='<div class="card setup"><h2>'+esc(t('result'))+'</h2><div class="score">'+TS.score+' / '+n+' <span style="font-size:22px;color:var(--ink2)">'+pct+'%</span></div>'+
      (TS.wrong.length?'<div><label class="lbl">'+esc(t('mistakes'))+'</label><ul class="wrong">'+TS.wrong.map(id=>'<li><span>'+esc(L(byId(id)).n)+'</span><button type="button" class="chip" data-s="'+id+'">'+esc(t('study'))+'</button></li>').join('')+'</ul></div>':'<p>'+esc(t('nomist'))+'</p>')+
      '<div style="display:flex;gap:10px;flex-wrap:wrap">'+(TS.wrong.length?'<button type="button" class="btn pri" id="redo">'+esc(t('redo'))+'</button>':'')+'<button type="button" class="btn" id="again">'+esc(t('again'))+'</button></div></div>';
    $$('[data-s]').forEach(b=>b.onclick=()=>{setView('learn');select(b.dataset.s);});
    const r=$('#redo');if(r)r.onclick=()=>startTest(TS.wrong.map(byId),TS.wrong.length);
    $('#again').onclick=renderSetup;
  }

  function setView(v){
    view=v;$('#learn').hidden=v!=='learn';$('#test').hidden=v!=='test';renderChrome();
    if(v==='learn'){renderSide();renderInfo();mountStage($('#stageL'));Viewer.show(cur);}
    else renderSetup();
  }
  $$('#tabs button').forEach(b=>b.onclick=()=>setView(b.dataset.v));
  $$('#lang button').forEach(b=>b.onclick=()=>{lang=b.dataset.l;save();renderAll();});
  $('#q').oninput=e=>{query=e.target.value;renderSide();};
  function renderAll(){
    renderChrome();
    if(view==='learn'){renderSide();renderInfo();buildOverlay();}
    else{TS.qs.length&&TS.idx<TS.qs.length&&$('#opts')?renderQ():renderSetup();}
  }
  Viewer.init();
  window.__atlas={show:id=>{cur=id;renderSide();renderInfo();Viewer.show(id);},ids:()=>D.map(d=>d.id),Viewer};
  setView('learn');
})();
