// ตัวช่วยทั่วไป
const $=s=>document.querySelector(s),esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])),uid=()=>Math.random().toString(36).slice(2,9);
const fmt=d=>new Date(d).toLocaleDateString('th-TH',{day:'numeric',month:'short',year:'numeric'}),today=()=>new Date().toISOString().slice(0,10);
