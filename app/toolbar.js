/* Sweetie · WK07 toolbar system — markup for toolbars. Shared by the prototype (app/) and the WK07 page.
   Needs menu.js (icons). One structure:
     .tb[data-tone][data-align]   container (role=toolbar) · data-align: start | center | end | between
       .tb-group                  a run of items kept together (left or right side of a bar)
       .tbb.ic | .tbb.tx | .tbb.it  icon button · text button · icon + text button
       .tb-sep                    divider        .tb-text   non-interactive label (e.g. "3 selected") */
var tbButton=function(b){
  var kind=b.kind||(b.icon&&b.label?'it':b.icon?'ic':'tx');
  return '<button class="tbb '+kind+(b.danger?' danger':'')+(b.cls?' '+b.cls:'')+'" type="button"'+(b.id?' id="'+b.id+'"':'')
    +(b.pressed!==undefined?' aria-pressed="'+!!b.pressed+'"':'')+' aria-label="'+(b.aria||b.label)+'"'+(b.disabled?' aria-disabled="true"':'')+(b.attrs||'')+'>'
    +(b.icon?'<span class="tbb-ic">'+mico(b.icon)+'</span>':'')+(b.label&&kind!=='ic'?'<span class="tbb-label">'+b.label+'</span>':'')+'</button>';
};
var tbItem=function(it){
  if(it.sep) return '<span class="tb-sep" aria-hidden="true"></span>';
  if(it.spacer) return '<span class="tb-spacer" aria-hidden="true"></span>';
  if(it.text!==undefined) return '<span class="tb-text"'+(it.id?' id="'+it.id+'"':'')+' aria-live="polite">'+it.text+'</span>';
  if(it.html) return it.html;
  if(it.group) return '<div class="tb-group">'+it.group.map(tbItem).join('')+'</div>';
  return tbButton(it);
};
var toolbar=function(tone,items,o){ o=o||{};
  return '<div class="tb'+(o.bar?' bar':'')+(o.cls?' '+o.cls:'')+'" data-tone="'+tone+'" data-align="'+(o.align||'center')+'" role="toolbar" aria-label="'+(o.label||'Toolbar')+'"'+(o.id?' id="'+o.id+'"':'')+'>'
    +items.map(tbItem).join('')+'</div>';
};
