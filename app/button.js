/* Sweetie · WK08 button system — markup for buttons and button groups.
   Shared by the prototype (app/) and the WK08 page. Needs menu.js (icons).
   One structure:  .bt[data-tone][data-level][data-kind]
     data-tone   serene | elegant
     data-level  1 primary (fill) · 2 secondary (low-contrast fill) · 3 tertiary (transparent + outline)
     data-kind   it icon + text · tx text only · ic icon only
   Button group (single selection): .btg[data-tone][role=radiogroup] > .bt[role=radio][aria-checked] */
var btn=function(tone,b){ b=b||{};
  var kind=b.kind||(b.icon&&b.label?'it':b.icon?'ic':'tx'), lv=b.level||1;
  return '<button class="bt'+(b.cls?' '+b.cls:'')+'" type="button" data-tone="'+tone+'" data-level="'+lv+'" data-kind="'+kind+'"'
    +(b.id?' id="'+b.id+'"':'')+(b.disabled?' disabled':'')+(b.pressed!==undefined?' aria-pressed="'+!!b.pressed+'"':'')
    +' aria-label="'+(b.aria||b.label||'')+'"'+(b.attrs||'')+'>'
    +(b.icon?'<span class="bt-ic">'+mico(b.icon)+'</span>':'')+(b.label&&kind!=='ic'?'<span class="bt-label">'+b.label+'</span>':'')+'</button>';
};
var btnGroup=function(tone,items,o){ o=o||{}; var sel=o.value!==undefined?o.value:items[0].value; // value:null = nothing picked yet
  return '<div class="btg'+(sel!==null?' picked':'')+(o.cls?' '+o.cls:'')+'" data-tone="'+tone+'" role="radiogroup" aria-label="'+(o.label||'Options')+'"'+(o.id?' id="'+o.id+'"':'')+'>'
    +'<span class="btg-ind" aria-hidden="true"></span>'
    +items.map(function(it){ var on=it.value===sel;
      return '<button class="bt" type="button" role="radio" data-tone="'+tone+'" data-level="seg" data-kind="'+(it.icon&&it.label?'it':it.icon?'ic':'tx')+'" data-value="'+it.value+'" aria-checked="'+on+'" tabindex="'+(on||(sel===null&&it===items[0])?0:-1)+'"'
        +(it.disabled?' disabled':'')+' aria-label="'+(it.aria||it.label)+'">'
        +(it.icon?'<span class="bt-ic">'+mico(it.icon)+'</span>':'')+(it.label?'<span class="bt-label">'+it.label+'</span>':'')+'</button>'; }).join('')+'</div>';
};
/* wire a group: click / arrow keys select one, the indicator slides under it; onChange(value) */
var wireGroup=function(g,onChange){
  var bs=[].slice.call(g.querySelectorAll('.bt')), ind=g.querySelector('.btg-ind');
  var place=function(anim){ var b=g.querySelector('[aria-checked=true]'); if(!b||!ind) return;
    if(!anim) ind.style.transition='none'; ind.style.width=b.offsetWidth+'px'; ind.style.height=b.offsetHeight+'px'; ind.style.transform='translate('+b.offsetLeft+'px,'+b.offsetTop+'px)';
    if(!anim){ void ind.offsetWidth; ind.style.transition=''; } };
  var pick=function(b,focus){ if(!b||b.disabled) return; var was=b.getAttribute('aria-checked')==='true';
    bs.forEach(function(x){ x.setAttribute('aria-checked',x===b); x.tabIndex=x===b?0:-1; }); g.classList.add('picked'); place(true); if(focus) b.focus();
    if(!was&&onChange) onChange(b.dataset.value); };
  g.addEventListener('click',function(e){ pick(e.target.closest('.bt')); });
  g.addEventListener('keydown',function(e){ var i=bs.indexOf(document.activeElement), d=e.key==='ArrowRight'||e.key==='ArrowDown'?1:e.key==='ArrowLeft'||e.key==='ArrowUp'?-1:0;
    if(!d||i<0) return; e.preventDefault(); for(var k=1;k<=bs.length;k++){ var n=bs[(i+d*k+bs.length*2)%bs.length]; if(!n.disabled){ pick(n,true); break; } } });
  place(false); if(window.ResizeObserver) new ResizeObserver(function(){ place(false); }).observe(g);
  document.fonts&&document.fonts.ready.then(function(){ place(false); });
  return {pick:function(v){ pick(g.querySelector('[data-value="'+v+'"]')); }, place:place};
};
