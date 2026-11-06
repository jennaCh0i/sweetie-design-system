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
