/* Sweetie · WK06 menu system — markup for one menu item. Shared by the prototype (app/) and the WK06 page.
   Slots: lead icon · single-line label · one trailing accessory (submenu chevron | badge | shortcut | icon | check) */
// WK06 menu icons (24 grid, stroked) — also used by the ··· buttons in Order history
var MI={
  receipt:'<path d="M6 3.5h12v17l-3-2-3 2-3-2-3 2z"/><path d="M9 8.5h6M9 12.5h6"/>',
  star:'<path d="M12 3.8l2.5 5.1 5.6.8-4 3.9.9 5.6-5-2.6-5 2.6.9-5.6-4-3.9 5.6-.8z"/>',
  bag:'<path d="M5 8.5h14l-1 11.8a1.6 1.6 0 0 1-1.6 1.5H7.6A1.6 1.6 0 0 1 6 20.3z"/><path d="M9 8.5V7a3 3 0 0 1 6 0v1.5"/>',
  person:'<circle cx="12" cy="8.5" r="3.6"/><path d="M5.2 20c1.2-3.4 3.8-5.2 6.8-5.2s5.6 1.8 6.8 5.2"/>',
  leaf:'<path d="M5.5 18.5C5.5 10 10.5 5 19 4.8c0 8.7-5 13.7-13.5 13.7z"/><path d="M5.5 18.5 13 11"/>',
  pin:'<path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11z"/><circle cx="12" cy="10" r="2.3"/>',
  help:'<circle cx="12" cy="12" r="8.8"/><path d="M9.7 9.4a2.4 2.4 0 0 1 4.6.9c0 1.6-2.3 2-2.3 3.5"/><path d="M12 16.9v.1"/>',
  out:'<path d="M9 15 15.5 8.5M10 8.5h5.5V14"/><path d="M19 13.5V18a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 5 18V7a1.5 1.5 0 0 1 1.5-1.5H11"/>',
  chev:'<path d="M9.5 6l6 6-6 6"/>',
  check:'<path d="M5 12.5l4.5 4.5L19 7.5"/>',
  pencil:'<path d="M4.5 19.5l1-4.2L16 4.8l3.2 3.2L8.7 18.5z"/><path d="M14 6.8l3.2 3.2"/>',
  sheet:'<rect x="3.5" y="5" width="17" height="14" rx="2"/><path d="M14 5v14"/>',
  share:'<path d="M12 3.5v11.5M8 7.3l4-3.8 4 3.8"/><path d="M5.5 11.5v7.5A1.5 1.5 0 0 0 7 20.5h10a1.5 1.5 0 0 0 1.5-1.5v-7.5"/>',
  heart:'<path d="M12 19.8s-7-4.3-7-9.8a4 4 0 0 1 7-2.7 4 4 0 0 1 7 2.7c0 5.5-7 9.8-7 9.8z"/>',
  hide:'<path d="M3.5 3.5l17 17"/><path d="M10.6 6.1c.5-.1.9-.1 1.4-.1 5 0 8.5 4.5 9 6-.3.9-1.2 2.4-2.8 3.8M6.6 7.6C4.7 8.9 3.4 10.8 3 12c.5 1.5 4 6 9 6 1.4 0 2.7-.3 3.8-.9"/><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2"/>',
  more:'<circle cx="5.5" cy="12" r="1.5" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none"/><circle cx="18.5" cy="12" r="1.5" fill="currentColor" stroke="none"/>'
};
var mico=k=>`<svg viewBox="0 0 24 24" aria-hidden="true">${MI[k]}</svg>`;
function menuItem(it,i){
  if(it.head) return `<div class="m-head" role="presentation">${it.head}</div>`;
  if(it.sep) return `<div class="m-sep" role="separator"></div>`;
  const chk=it.check!==undefined;
  const trail=it.sub?`<span class="mi-chev">${mico('chev')}</span>`:it.badge?`<span class="mi-badge">${it.badge}</span>`:it.key?`<kbd class="mi-key">${it.key}</kbd>`
    :it.icon?`<span class="mi-icon">${mico(it.icon)}</span>`:chk?`<span class="mi-icon mi-check${it.check?'':' off'}">${mico('check')}</span>`:'';
  return `<button class="mi${it.danger?' danger':''}" type="button" role="${chk?'menuitemcheckbox':'menuitem'}" tabindex="-1" data-i="${i}" style="--i:${i}"${it.sub?' aria-haspopup="menu" aria-expanded="false"':''}${chk?` aria-checked="${!!it.check}"`:''}>`
    +`${it.lead?`<span class="mi-lead">${mico(it.lead)}</span>`:''}<span class="mi-label">${it.label}</span>${trail?`<span class="mi-trail">${trail}</span>`:''}</button>`;
}
