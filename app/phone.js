/* Sweetie · iPhone prototype — phone-only behaviour on top of the shared script (phone.html only) */
(function(){
  // status bar clock (real time, like the pickup times)
  const t=document.getElementById('sb-time');
  const tick=()=>{ const d=new Date(); t.textContent=`${d.getHours()%12||12}:${String(d.getMinutes()).padStart(2,'0')}`; };
  tick(); setInterval(tick,15000);

  // Bag: the pay button becomes a sticky footer at the bottom of the one-column bag
  const pay=document.createElement('div'); pay.className='ph-pay';
  pay.append(document.getElementById('place'),document.getElementById('co-note'));
  document.getElementById('s-bag').appendChild(pay);

  // Order history: in selection mode the count moves from the toolbar to the subtitle (no room in a 353 px bar)
  const base=paintSel;
  paintSel=function(){ base();
    if(OF.select){ const n=[...OF.sel].filter(o=>ORDERS.includes(o)).length; document.getElementById('o-sub').textContent=n?`${n} selected`:'Tap orders to select them'; } };

  // the screens that scroll as one column start at the top each visit
  const top=id=>{ const el=document.getElementById(id); if(el) el.scrollTop=0; };
  const enter=Object.assign({},ENTER);
  ['builder','bag','done'].forEach(k=>{ const f=enter[k]; ENTER[k]=(from)=>{ top('s-'+k); f&&f(from); }; });

})();

/* ═════════════ Real phone: fill the screen, use the phone's own status bar and keyboard ═════════════
   Opened on a phone (touch + narrow screen, or ?device) the app renders at the phone's width with no frame,
   flow bar or background controls. Heights, safe areas and the keyboard come from the phone itself. */
(function(){
  const q=new URLSearchParams(location.search), app=document.getElementById('app'), dev=document.getElementById('device'), body=document.body;
  const isPhone=q.has('device')||(matchMedia('(pointer:coarse)').matches&&Math.min(screen.width,screen.height)<600);
  const probe=document.createElement('div'); probe.style.cssText='position:fixed;left:0;top:0;visibility:hidden;pointer-events:none;padding:env(safe-area-inset-top) 0 env(safe-area-inset-bottom)';
  body.appendChild(probe);
  const px=v=>parseFloat(v)||0;
  function layout(){
    const root=document.documentElement;
    if(!isPhone){ VH=852; HB=34; root.style.removeProperty('--vshift'); return; }
    body.classList.add('device'); body.classList.remove('framed','full','forced');
    const W=innerWidth, H=innerHeight, k=W/393, cs=getComputedStyle(probe), top=px(cs.paddingTop)/k, bot=Math.max(px(cs.paddingBottom)/k,24), h=H/k; // keep bottom controls ≥ 24 + their own gap off the edge
    Object.assign(dev.style,{left:'0',top:'0',width:'393px',height:h+'px',transform:`scale(${k})`,transformOrigin:'0 0'});
    window.SCALE=k; VH=h; HB=bot;
    root.style.setProperty('--sb',top+'px'); root.style.setProperty('--navb',(top+44)+'px'); root.style.setProperty('--hb',bot+'px');
    // centre the Start / Discover compositions in the space this phone has (designed for 103 … 818 on an 852 screen)
    const shift=((top+44)+(h-bot))/2-(103+818)/2; root.style.setProperty('--vshift',shift.toFixed(1)+'px');
    root.style.setProperty('--chat-top',Math.round((top+44)+(h-top-44)*.39)+'px');
  }
  layout(); addEventListener('resize',()=>requestAnimationFrame(layout)); addEventListener('orientationchange',()=>setTimeout(layout,300));
  // the chat ingredient glides into the space above the conversation sheet, whatever the screen height
  window.focusPos=function(p){ const nav=parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--navb'))||103,
      ct=parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--chat-top'))||392, room=ct-nav-24;
    const H=Math.min(220,room-16,p.h*1.25), W=H*p.w/p.h, w2=Math.min(W,270), h2=w2*p.h/p.w;
    return {left:196-w2/2, top:nav+(ct-nav)/2-h2/2, width:w2, height:h2}; };
  // the phone's own keyboard: measure it with visualViewport and let each screen make room
  const vv=window.visualViewport; if(!isPhone||!vv) return;
  const onVV=()=>{ const k=window.SCALE||1, kbh=Math.max(0,(innerHeight-vv.height-vv.offsetTop)/k);
    app.style.setProperty('--kbh',kbh+'px'); app.classList.toggle('kb-on',kbh>120);
    app.style.setProperty('--kb-lift',(-Math.min(140,Math.max(0,kbh-180))).toFixed(0)+'px');
    if(kbh>120) window.scrollTo(0,0); };
  vv.addEventListener('resize',onVV); vv.addEventListener('scroll',()=>{ if(app.classList.contains('kb-on')) window.scrollTo(0,0); });
  app.addEventListener('focusin',e=>{ if(e.target.matches('input')) setTimeout(()=>{ const sc=e.target.closest('.screen');
    if(sc&&/(auto|scroll)/.test(getComputedStyle(sc).overflowY)) e.target.scrollIntoView({block:'center',behavior:'smooth'}); },350); });
})();
// the Start field waits for a tap on a phone (no keyboard over the first screen)
ENTER.start=()=>{};

/* ═════════════ Bowl builder: the slider sheet ═════════════ */
(function(){
  const scr=document.getElementById('s-builder'), left=scr.querySelector('.left'), R=document.getElementById('builder-r');
  const sh=document.createElement('section'); sh.className='bsheet'; sh.setAttribute('aria-label','Ingredients');
  sh.innerHTML='<div class="bs-grab" role="button" tabindex="0" aria-label="Show or hide ingredients"><i></i></div><div class="bs-scroll"></div>';
  const sc=sh.querySelector('.bs-scroll'), grab=sh.querySelector('.bs-grab');
  sc.append(document.getElementById('b-desc'),R);
  scr.insertBefore(sh,scr.querySelector('.b-foot'));
  const rootPx=n=>parseFloat(getComputedStyle(document.documentElement).getPropertyValue(n))||0;
  let up=false, low=400;
  // resting point: overlap the bottom of the photo by 36 px, never higher than half the screen
  function measure(){ const nav=rootPx('--navb')||103, ph=document.getElementById('photo'), k=window.SCALE||1, a=document.getElementById('app').getBoundingClientRect();
    const pb=(ph.getBoundingClientRect().bottom-a.top)/k; low=Math.max(VH*.5,pb-36)-nav; }
  function set(isUp,anim=true){ up=isUp; measure(); sh.classList.toggle('dragging',!anim); sh.classList.toggle('up',up);
    sh.style.setProperty('--bs-y',(up?0:low)+'px'); if(!up) sc.scrollTop=0; grab.setAttribute('aria-expanded',up); }
  window.builderSheet=set;
  grab.addEventListener('click',()=>{ if(!moved) set(!up); });
  grab.addEventListener('keydown',e=>{ if(e.key==='Enter'||e.key===' '){ e.preventDefault(); set(!up); } });
  // drag: anywhere on the sheet except the controls; while open, only when the list is scrolled to the top
  let d=null, moved=false;
  sh.addEventListener('pointerdown',e=>{ if(e.button>0||e.target.closest('[role=slider],input,button:not(.bs-grab),.chip,.add,.x')&&!e.target.closest('.bs-grab')) return;
    d={y:e.clientY,base:up?0:low,id:e.pointerId,t:performance.now(),ly:e.clientY,v:0}; moved=false; });
  addEventListener('pointermove',e=>{ if(!d||e.pointerId!==d.id) return; const k=window.SCALE||1, dy=(e.clientY-d.y)/k;
    if(!moved){ if(Math.abs(dy)<6) return; if(up&&(dy<0||sc.scrollTop>0)){ d=null; return; } moved=true; try{sh.setPointerCapture(d.id)}catch(_){} sh.classList.add('dragging'); }
    const now=performance.now(); d.v=((e.clientY-d.ly)/k)/Math.max(1,now-d.t); d.t=now; d.ly=e.clientY;
    let y=d.base+dy; if(y<0) y*=.25; if(y>low) y=low+(y-low)*.25; sh.style.setProperty('--bs-y',y+'px'); });
  const end=e=>{ if(!d||(e&&e.pointerId!==d.id)) return; const was=moved; const k=window.SCALE||1;
    if(was){ const y=parseFloat(sh.style.getPropertyValue('--bs-y'))||0; set(d.v<-.4?true:d.v>.4?false:y<low/2); setTimeout(()=>moved=false,0); }
    d=null; };
  addEventListener('pointerup',end); addEventListener('pointercancel',end);
  // a scroll / wheel on the resting sheet opens it
  sh.addEventListener('wheel',e=>{ if(!up&&e.deltaY>0){ e.preventDefault(); set(true); } else if(up&&e.deltaY<0&&sc.scrollTop<=0){ set(false); } },{passive:false});
  // tapping a tag on the photo opens the sheet at that ingredient
  document.getElementById('photo').addEventListener('click',e=>{ if(e.target.closest('.tag')&&!up) set(true); },true);
  // every visit starts at rest
  const f=ENTER.builder; ENTER.builder=from=>{ f&&f(from); setTimeout(()=>set(false,false),80); };
  addEventListener('resize',()=>requestAnimationFrame(()=>set(up,false)));
  requestAnimationFrame(()=>set(false,false));
})();

/* ═════════════ Bowl builder: "Adjust with words" lives in a tab on the right edge ═════════════
   Tucked in until you need it; tap to slide the composer in (keyboard opens), it tucks away after you send. */
(function(){
  const scr=document.getElementById('s-builder'), cmp=document.getElementById('b-cmp'), inp=document.getElementById('adjust-in');
  const SPARK='<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M10 2.5l1.6 4.6 4.6 1.6-4.6 1.6L10 15l-1.6-4.7L3.8 8.7l4.6-1.6z"/><path d="M15.5 13.5l.6 1.6 1.6.6-1.6.6-.6 1.6-.6-1.6-1.6-.6 1.6-.6z"/></svg>';
  const tab=document.createElement('button'); tab.type='button'; tab.className='adj-tab'; tab.setAttribute('aria-label','Adjust with words'); tab.setAttribute('aria-expanded','false');
  tab.innerHTML=SPARK+'<span>Adjust with words</span>';
  const dr=document.createElement('div'); dr.className='adj-drawer'; dr.setAttribute('aria-label','Adjust with words'); dr.append(cmp);
  const x=document.createElement('button'); x.type='button'; x.className='adj-x'; x.setAttribute('aria-label','Close'); x.innerHTML='<svg viewBox="0 0 12 12"><path d="M1 1l10 10M11 1 1 11"/></svg>';
  cmp.querySelector('.cmp-top').appendChild(x);
  scr.append(tab,dr);
  let open=false, t=0;
  function set(v){ open=v; clearTimeout(t); scr.classList.toggle('adj-open',v); tab.setAttribute('aria-expanded',v);
    if(v) setTimeout(()=>inp.focus({preventScroll:true}),260); else inp.blur(); }
  tab.onclick=()=>set(!open); x.onclick=()=>set(false);
  // after a send: keep the reply up for a moment, then tuck the composer back into the tab
  document.getElementById('adjust').addEventListener('submit',()=>{ clearTimeout(t); t=setTimeout(()=>{ if(!inp.value) set(false); },2600); });
  inp.addEventListener('input',()=>clearTimeout(t));
  // tap anywhere else closes it
  scr.addEventListener('pointerdown',e=>{ if(open&&!e.target.closest('.adj-drawer,.adj-tab')) set(false); });
  // swipe right on the composer to close
  let sx=null; dr.addEventListener('pointerdown',e=>{ sx=e.clientX; }); dr.addEventListener('pointerup',e=>{ if(sx!=null&&e.clientX-sx>60) set(false); sx=null; });
  document.addEventListener('keydown',e=>{ if(e.key==='Escape'&&open) set(false); });
  // first visit: the tab slides out once to say what it is
  let shown=false; const f=ENTER.builder;
  const peek=()=>{ if(shown) return; shown=true; setTimeout(()=>{ tab.classList.add('peek'); setTimeout(()=>tab.classList.remove('peek'),2200); },900); };
  ENTER.builder=from=>{ f&&f(from); set(false); peek(); };
  if(document.getElementById('app').dataset.screen==='builder') peek();
})();
