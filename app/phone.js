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

/* ═════════════ iOS keyboard (prototype) ═════════════
   Tapping any text field brings up an iPhone keyboard that types into it; the screen makes room.
   Skipped on a real touch phone (its own keyboard appears). */
(function(){
  if(matchMedia('(pointer:coarse)').matches && !document.body.classList.contains('framed')) return;
  const app=document.getElementById('app');
  const kb=document.createElement('div'); kb.className='kb'; kb.setAttribute('aria-hidden','true');
  const SHIFT='<svg viewBox="0 0 24 24"><path d="M12 4 4 12.5h4.5V20h7v-7.5H20Z"/></svg>';
  const DEL='<svg viewBox="0 0 24 24"><path d="M8.5 5.5H20a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1H8.5L3 12Z"/><path d="m11 9.5 5 5M16 9.5l-5 5"/></svg>';
  const L=['qwertyuiop','asdfghjkl','zxcvbnm'], N=['1234567890','-/:;()$&@"','.,?!\''];
  kb.innerHTML=`<div class="kb-sug"></div><div class="kb-rows"></div>
    <div class="kb-bottom"><svg viewBox="0 0 28 28"><circle cx="14" cy="14" r="11"/><path d="M3 14h22M14 3c3.2 3 4.8 6.7 4.8 11S17.2 22 14 25c-3.2-3-4.8-6.7-4.8-11S10.8 6 14 3Z"/></svg>
    <svg viewBox="0 0 28 28"><rect x="10" y="3.5" width="8" height="14" rx="4"/><path d="M6.5 13.5a7.5 7.5 0 0 0 15 0M14 21v3.5"/></svg></div>`;
  app.appendChild(kb);
  const rows=kb.querySelector('.kb-rows'), sugEl=kb.querySelector('.kb-sug');
  let field=null, shift=true, nums=false;
  const RET={kw:['go','go'],'adjust-in':['send','go'],'ask-in':['send','go'],'o-q':['search','go'],'promo-in':['done','']};
  const SUG={kw:()=>(typeof sugList!=='undefined'?sugList:[]).slice(0,3),
    'adjust-in':()=>['more avocado','no onion','add chickpea'],
    'ask-in':()=>['Why are you in my bowl?','Nutrition?','Where are you from?'],
    'o-q':()=>['Chicken','Avocado','Salmon'], 'promo-in':()=>['WELCOME5','BIRTHDAY','FREEBOWL']};
  function draw(){
    const set=nums?N:L, cs=k=>shift&&!nums?k.toUpperCase():k;
    const keys=r=>[...r].map(k=>`<button class="kb-key" data-k="${k.replace(/"/g,'&quot;')}">${cs(k).replace(/</g,'&lt;')}</button>`).join('');
    const [rl,rc]=RET[field&&field.id]||['return',''];
    rows.innerHTML=`<div class="kb-row">${keys(set[0])}</div><div class="kb-row r2">${keys(set[1])}</div>
      <div class="kb-row r3"><button class="kb-key fn wide shift${shift&&!nums?' on':''}" data-f="shift">${nums?'#+=':SHIFT}</button><span class="mid">${keys(set[2])}</span><button class="kb-key fn wide" data-f="del">${DEL}</button></div>
      <div class="kb-row"><button class="kb-key fn num" data-f="nums">${nums?'ABC':'123'}</button><button class="kb-key space" data-k=" ">space</button><button class="kb-key fn ret ${rc}" data-f="ret">${rl}</button></div>`;
    const S=(SUG[field&&field.id]||(()=>[]))();
    sugEl.innerHTML=S.map(t=>`<button data-s="${t.replace(/"/g,'&quot;')}">${t}</button>`).join('');
  }
  const fire=el=>el.dispatchEvent(new Event('input',{bubbles:true}));
  function insert(t){ if(!field) return; const a=field.selectionStart??field.value.length, b=field.selectionEnd??a;
    if(field.maxLength>0&&field.value.length-(b-a)+t.length>field.maxLength) return;
    field.setRangeText(t,a,b,'end'); fire(field); }
  function del(){ if(!field) return; const a=field.selectionStart??field.value.length, b=field.selectionEnd??a;
    if(a===b&&a>0) field.setRangeText('',a-1,a,'end'); else if(a!==b) field.setRangeText('',a,b,'end'); fire(field); }
  function ret(){ if(!field) return; const f=field.form;
    if(field.id==='kw'){ field.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',bubbles:true})); hide(); field.blur(); return; }
    if(f&&field.id!=='promo-in'){ f.requestSubmit(); return; }
    if(f) f.requestSubmit(); field.blur(); }
  kb.addEventListener('pointerdown',e=>{ e.preventDefault(); const b=e.target.closest('button'); if(!b||!field) return;
    b.classList.add('down'); setTimeout(()=>b.classList.remove('down'),110);
    if(b.dataset.s!==undefined){ const v=b.dataset.s;
      if(field.id==='kw'){ field.value=v; fire(field); } else if(field.id==='ask-in'||field.id==='adjust-in'){ field.value=v; fire(field); ret(); } else { field.value=v; fire(field); }
      field.setSelectionRange(field.value.length,field.value.length); shift=false; draw(); return; }
    const k=b.dataset.k, f=b.dataset.f;
    if(k!==undefined){ insert(shift&&!nums?k.toUpperCase():k); if(shift&&!nums){ shift=false; draw(); } else if(k===' '&&nums){ nums=false; draw(); } return; }
    if(f==='del'){ del(); if(!field.value){ shift=true; draw(); } }
    else if(f==='shift'){ shift=!shift; draw(); }
    else if(f==='nums'){ nums=!nums; draw(); }
    else if(f==='ret') ret();
  });
  function show(el){ field=el; nums=false; shift=!el.value&&el.id!=='o-q'&&el.id!=='promo-in'; draw(); app.classList.add('kb-on'); kb.setAttribute('aria-hidden','false');
    // keep the field in view above the keyboard inside scrolling screens
    setTimeout(()=>{ const sc=el.closest('.screen'); if(!sc||!/(auto|scroll)/.test(getComputedStyle(sc).overflowY)) return;
      const r=el.getBoundingClientRect(), a=app.getBoundingClientRect(), k=window.SCALE||1, y=(r.bottom-a.top)/k, top=852-336-16;
      if(y>top) sc.scrollBy({top:y-top,behavior:'smooth'}); },60); }
  function hide(){ app.classList.remove('kb-on'); kb.setAttribute('aria-hidden','true'); field=null; }
  app.addEventListener('focusin',e=>{ const el=e.target; if(el.matches&&el.matches('input[type=text],input[type=search],input:not([type])')) show(el); });
  app.addEventListener('focusout',e=>{ setTimeout(()=>{ const a=document.activeElement; if(!(a&&a.matches&&a.matches('#app input[type=text],#app input[type=search],#app input:not([type])'))) hide(); },30); });
  document.addEventListener('keydown',e=>{ if(field&&e.target===field&&e.key.length===1&&shift){ shift=false; draw(); } });
  window.addEventListener('hashchange',()=>{ if(document.activeElement) document.activeElement.blur(); hide(); });
})();
// the Start field waits for a tap on a phone (no keyboard over the first screen)
ENTER.start=()=>{};
