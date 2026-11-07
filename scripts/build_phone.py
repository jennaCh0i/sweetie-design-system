#!/usr/bin/env python3
"""Build app/phone.html (iPhone, 393 x 852) from the tablet prototype app/index.html.

The phone is the same app — same data, flows, WK01–WK07 components — with phone geometry.
Layout lives in app/phone.css and app/phone.js; this script swaps the handful of
tablet-only numbers in the shared script (canvas positions, honeycomb, frame size).
Run it again after changing app/index.html:   python3 scripts/build_phone.py
"""
import pathlib, re, sys
ROOT = pathlib.Path(__file__).resolve().parents[1]
src = (ROOT / 'app/index.html').read_text()
s = src

def rep(old, new, count=1):
    global s
    n = s.count(old)
    if n != count:
        sys.exit(f'build_phone: expected {count} match(es), found {n}:\n  {old[:120]!r}')
    s = s.replace(old, new)

# ── head ──
rep('<title>Sweetie — Tablet Prototype</title>', '<title>Sweetie — iPhone Prototype</title>')
rep('<meta name="description" content="Sweetie (sweetgreen LLM) tablet prototype:', '<meta name="description" content="Sweetie (sweetgreen LLM) iPhone prototype:')
rep('<meta name="apple-mobile-web-app-capable" content="yes">', '<meta name="apple-mobile-web-app-capable" content="yes">\n<meta name="apple-mobile-web-app-status-bar-style" content="default">\n<meta name="apple-mobile-web-app-title" content="Sweetie">\n<meta name="theme-color" content="#F5F3E8">\n<link rel="apple-touch-icon" href="assets/sweetie-mark-ink.png">')
rep('</style>\n</head>', '</style>\n<link rel="stylesheet" href="phone.css"><!-- iPhone layout on top of the shared styles -->\n</head>')

# ── status bar, Dynamic Island, home indicator ──
rep('  <div class="toast" id="toast" role="status"></div>\n</div>\n</div>',
'''  <div class="toast" id="toast" role="status"></div>
  <div class="statusbar" aria-hidden="true"><span class="time" id="sb-time">9:41</span><span class="island"></span>
    <span class="icons"><svg width="18" height="12" viewBox="0 0 18 12"><rect x="0" y="8" width="3" height="4" rx="1" fill="#000"/><rect x="5" y="5.5" width="3" height="6.5" rx="1" fill="#000"/><rect x="10" y="3" width="3" height="9" rx="1" fill="#000"/><rect x="15" y="0" width="3" height="12" rx="1" fill="#000"/></svg>
    <svg width="16" height="12" viewBox="0 0 16 12"><path d="M8 2.2c2.4 0 4.6.9 6.3 2.5l1.2-1.3A10.6 10.6 0 0 0 8 .4C5.2.4 2.5 1.5.5 3.4l1.2 1.3A8.9 8.9 0 0 1 8 2.2Z" fill="#000"/><path d="M8 5.6c1.5 0 2.9.6 3.9 1.5l1.3-1.3A7.4 7.4 0 0 0 8 3.8c-2 0-3.8.8-5.2 2.1L4.1 7.1c1-.9 2.4-1.5 3.9-1.5Z" fill="#000"/><path d="M8 9a2.1 2.1 0 0 1 1.5.6L8 11.2 6.5 9.6A2.1 2.1 0 0 1 8 9Z" fill="#000"/></svg>
    <svg width="27" height="13" viewBox="0 0 27 13"><rect x=".5" y=".5" width="23" height="12" rx="3.8" fill="none" stroke="#000" stroke-opacity=".35"/><rect x="2" y="2" width="18" height="9" rx="2.5" fill="#000"/><path d="M25 4.5v4c.8-.3 1.3-1.1 1.3-2s-.5-1.7-1.3-2Z" fill="#000" fill-opacity=".4"/></svg></span></div>
  <div class="homebar" aria-hidden="true"></div>
</div>
</div>''')

# ── flow bar: link back to the tablet, frame label ──
rep('<a class="home" href="phone.html" aria-label="Open the iPhone prototype">iPhone</a>', '<a class="home" href="index.html" aria-label="Open the iPad prototype">iPad</a>')
rep('<button data-f="ipad">iPad</button>', '<button data-f="ipad">iPhone</button>')
rep('title="Fill the screen (for iPad)"', 'title="Fill the screen (for iPhone)"')

# ── shared script: phone geometry ──
rep("const clamp=(n,a,b)=>Math.min(b,Math.max(a,n));", "const clamp=(n,a,b)=>Math.min(b,Math.max(a,n));\nlet VW=393, VH=852, HB=34; // iPhone 16 screen · home indicator (phone.js updates VH/HB to the real phone)")
# Start: glass hexagon + carousel clip, sized for the phone (see phone.css: glass 20,214 353×331 · picker 44,272)
rep("const g=$('.glass'), d=hexD(633,593,90);", "const g=$('.glass'), d=hexD(353,331,52);")
rep("{ const inner=hexD(633-28,593-28,78), dx=288+14-368, dy=153+14-(412+72+20); let k=0;",
    "{ const inner=hexD(353-20,331-20,46), dx=20+10-44, dy=256+10-(397+48+10); let k=0;")
rep("rim.setAttribute('viewBox','0 0 633 593');", "rim.setAttribute('viewBox','0 0 353 331');")
rep("const SLOT=80;", "const SLOT=56;")
# frame + fit
rep("const ST={bg:'green',frame:'win',size:72}; try{Object.assign(ST,JSON.parse(localStorage.getItem('sweetie-stage')||'{}'))}catch(e){}",
    "const ST={bg:'green',frame:'ipad',size:88}; try{Object.assign(ST,JSON.parse(localStorage.getItem('sweetie-stage-phone')||'{}'))}catch(e){}")
rep("localStorage.setItem('sweetie-stage',JSON.stringify", "localStorage.setItem('sweetie-stage-phone',JSON.stringify")
rep("framed=!full&&W>=900&&H>=560;", "framed=!full&&W>=520&&H>=700;")
rep("const s=framed?Math.min((W-60)/1210,(H-140)/834)*k:Math.min(W/1210,H/834);", "const s=framed?Math.min((W-60)/VW,(H-140)/VH)*k:Math.min(W/VW,H/VH);")

# Discover: honeycomb at phone size (150 px cells), headline words on the ring around the title
a = s.index("(function(){\n  // honeycomb from the Figma frame"); b = s.index("})();", a) + len("})();")
s = s[:a] + '''(function(){
  // iPhone honeycomb: 150 px cells, columns 172 apart, rows 180 apart, odd columns offset 90 (the title fits the clear cell); centre cell sits behind the title
  const C=[196,452]; for(let c=-4;c<=6;c++) for(let r=-4;r<=5;r++) hexes.push({x:C[0]+c*172,y:C[1]+r*180+(c%2?90:0)});
  hexes.sort((a,b)=>Math.hypot(a.x-C[0],a.y-C[1])-Math.hypot(b.x-C[0],b.y-C[1]));
  const HEAD=['balanced','Pre-workout','Comforting','Citrusy','clean','high protein','cozy','tangy','chicken','Home','warm','crunchy','light','spicy','Yummy','Salty'];
  const rest=DWORDS.filter(w=>!HEAD.includes(w)); let ri=0;
  hexes.forEach((h,i)=>{ h.word=i===0?rest[ri++]:(HEAD[i-1]||rest[(ri++)%rest.length]); });
  hexes.forEach(h=>{
    const el=document.createElement('button'); el.className='khex'; el.type='button';
    el.style.left=h.x+'px'; el.style.top=h.y+'px';
    el.innerHTML=`<svg viewBox="0 0 240 220" aria-hidden="true"><path d="${HX}"/></svg><span>${h.word[0].toUpperCase()+h.word.slice(1)}</span>`;
    el.dataset.word=h.word; h.el=el; field.appendChild(el);
  });
})();''' + s[b:]
rep("  const C=[605,457];\n  const T=1-sstep(20,150,Math.hypot(pan.x,pan.y));", "  const C=[196,452];\n  const T=1-sstep(14,110,Math.hypot(pan.x,pan.y));")
rep("    const d=Math.hypot(h.x+pan.x-C[0],(h.y+pan.y-C[1])*1.15);", "    const d=Math.hypot((h.x+pan.x-C[0])*1.45,h.y+pan.y-C[1]);")
rep("    const b=clamp((d-430)/160,0,1), near=clamp(1-(d-60)/120,0,1)*T, ns=near>0?.6+.4*(1-near):1;",
    "    const b=clamp((d-360)/120,0,1), near=clamp(1-(d-40)/80,0,1)*T, ns=near>0?.6+.4*(1-near):1;")
rep("pan={x:clamp(dDrag.px+dx,-1100,1100),y:clamp(dDrag.py+dy,-700,700)};", "pan={x:clamp(dDrag.px+dx,-720,720),y:clamp(dDrag.py+dy,-640,640)};")
rep("pan={x:clamp(pan.x+vel.x,-1100,1100),y:clamp(pan.y+vel.y,-700,700)};", "pan={x:clamp(pan.x+vel.x,-720,720),y:clamp(pan.y+vel.y,-640,640)};")

# Chat: portrait canvas (393 × 852), extras just off each edge
a = s.index("const PROD=["); b = s.index("];", a) + 2
s = s[:a] + '''const PROD=[
  {k:'onion',x:-44,y:252,w:150,h:128,name:'Onion',fd:'13s',fr:'1.5deg'},
  {k:'avocado',x:70,y:104,w:116,h:176,name:'Avocado',fd:'11s',fy:'8px'},
  {k:'pea',x:238,y:98,w:86,h:170,name:'Peas',fd:'12s',fr:'-2deg'},
  {k:'beet',x:300,y:252,w:132,h:132,name:'Beet',fd:'14s',fx:'-6px'},
  {k:'tomato',x:-46,y:540,w:162,h:155,name:'Tomato',fd:'12.5s',fx:'6px'},
  {k:'lettuce2',x:112,y:478,w:196,h:199,name:'Lettuce',fd:'15s',fy:'6px'},
  // off-canvas: found by dragging with Move around (not in this bowl yet)
  {k:'artichoke',x:60,y:-150,w:104,h:140,name:'Artichoke',fd:'13s',fr:'1.5deg',extra:1},
  {k:'garlic',x:232,y:-140,w:110,h:118,name:'Garlic',fd:'12s',fy:'7px',extra:1},
  {k:'pepper',x:404,y:118,w:150,h:129,name:'Pepper',fd:'14s',fr:'-1.5deg',extra:1},
  {k:'cucumber',x:446,y:440,w:110,h:115,name:'Cucumber',fd:'11.5s',fx:'-6px',extra:1},
  {k:'corn',x:420,y:690,w:115,h:117,name:'Corn',fd:'12.5s',fr:'2deg',extra:1},
  {k:'pumpkin',x:-200,y:430,w:146,h:130,name:'Pumpkin',fd:'13.5s',fy:'8px',extra:1},
  {k:'salmon',x:226,y:590,w:214,h:173,name:'Salmon',fd:'13.5s',fr:'-1deg'}
];''' + s[b:]
rep("    const x0=Math.max(p.x,0), x1=Math.min(p.x+p.w,1210), y0=Math.max(p.y,0), y1=Math.min(p.y+p.h,759-24);",
    "    const x0=Math.max(p.x,0), x1=Math.min(p.x+p.w,VW), y0=Math.max(p.y,103), y1=Math.min(p.y+p.h,VH-HB-70);")
rep("""  const H=Math.min(400,p.h*1.25), W=H*p.w/p.h, w2=Math.min(W,480), h2=w2*p.h/p.w;
  return {left:345-w2/2, top:457-h2/2, width:w2, height:h2};""",
"""  const H=Math.min(220,p.h*1.25), W=H*p.w/p.h, w2=Math.min(W,270), h2=w2*p.h/p.w; // glides into the space above the conversation sheet
  return {left:196-w2/2, top:248-h2/2, width:w2, height:h2};""")
rep("PROD.filter(q=>q!==p&&!q.soft).forEach(q=>{q.el.style.left=(q.x<345?q.x-120:q.x+80)+'px';});",
    "PROD.filter(q=>q!==p&&!q.soft).forEach(q=>{q.el.style.left=(q.x<196?q.x-70:q.x+50)+'px';});")
rep("const ZOOMS=[.5,.75,1,1.25,1.5], EXT={l:-400,r:1490,t:-235,b:964}, OX=605, OY=380;",
    "const ZOOMS=[.5,.75,1,1.25,1.5], EXT={l:-200,r:556,t:-150,b:817}, OX=196, OY=450;")
rep("mpan={x:clamp(mpan.x,Math.min(0,1190-R),Math.max(0,20-L)), y:clamp(mpan.y,Math.min(0,814-B),Math.max(0,95-T))}; }",
    "mpan={x:clamp(mpan.x,Math.min(0,VW-16-R),Math.max(0,16-L)), y:clamp(mpan.y,Math.min(0,VH-HB-80-B),Math.max(0,115-T))}; }")

# Menus: keep inside the phone; a submenu with no room beside its row opens over the menu (iOS style)
rep("""    const right=R.right+W+6<1210; x=right?R.right+4:R.left-W-4; y=R.top-(tone==='serene'?8:0);
    origin=right?'top left':'top right'; el.style.setProperty('--mn-from',right?'-6px':'6px');""",
"""    const right=R.right+W+6<VW, left=R.left-W-4>0;
    if(right||left){ x=right?R.right+4:R.left-W-4; y=R.top-(tone==='serene'?8:0); origin=right?'top left':'top right'; el.style.setProperty('--mn-from',right?'-6px':'6px'); }
    else { const P=MSTACK[level-1].el; x=P.offsetLeft+20; y=R.top+(tone==='serene'?30:34); origin='top left'; el.style.setProperty('--mn-from','0px'); el.style.zIndex=61+level; }""")
rep("    if(y+H>834-12){ y=R.top-8-H; origin=origin.replace('top','bottom'); }", "    if(y+H>VH-HB-12){ y=R.top-8-H; origin=origin.replace('top','bottom'); }")
rep("  x=Math.max(12,Math.min(x,1210-W-12)); y=Math.max(12,Math.min(y,834-H-12));", "  x=Math.max(12,Math.min(x,VW-W-12)); y=Math.max(66,Math.min(y,VH-HB-H-12));")

rep("Visa •••• 4417 · default on this iPad", "Visa •••• 4417 · default on this iPhone")

rep('<div class="tip down plain" role="tooltip" id="loc-tip">Open until 9 pm · 0.4 mi away</div>', '<div class="tip down plain" role="tooltip" id="loc-tip">Saratoga + Campbell · 0.4 mi · open until 9 pm</div>')

# Order history: the hero date fits one line on a phone ("Wed, Oct 21 · Fresh Bowl")
rep("<h2 class=\"hh-date\">${D.toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric'})}", "<h2 class=\"hh-date\">${D.toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric'})}")

# no recording background on the phone: plain backdrop, no Background / Hide controls
rep('<span class="sep"></span><button id="stage-btn">Background</button><button id="rec" title="Hide the controls (press H to bring them back)">Hide for recording</button>', '<span class="sep"></span><button id="stage-btn" hidden>Background</button><button id="rec" hidden>Hide for recording</button>')

# phone-only behaviour (sticky pay button, status bar clock, selection count) after the shared script
rep('</script>\n</body>', '</script>\n<script src="phone.js"></script>\n</body>')

out = ROOT / 'app/phone.html'
out.write_text(s)
print(f'wrote {out.relative_to(ROOT)} ({len(s)//1024} KB)')
