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
