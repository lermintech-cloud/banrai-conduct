// ชิ้นส่วน iOS: Segmented Control และ Bottom Sheet (ต่อเข้ากับ <select> เดิม โค้ดเดิมจึงทำงานเหมือนเดิม)
// SEG = select ที่จะแสดงเป็น Segmented Control · SHEET = select ที่จะเปิดเป็น Bottom Sheet พร้อมช่องค้นหา
// select อื่น ๆ ใช้ตัวเลือกของเครื่อง (บน iPhone จะเป็น Wheel Picker ให้อัตโนมัติ)
const SEG=['ht','rkn','re'],SHEET={fs:'เลือกนักเรียน',rs:'เลือกนักเรียน',fi:'เลือกรายการ'};
const fire=s=>s.dispatchEvent(new Event('change',{bubbles:true}));
function iosUp(){
  SEG.forEach(id=>{const s=document.getElementById(id);if(!s)return;let g=s.previousElementSibling;
    if(!g||!g.classList.contains('seg')){g=document.createElement('div');g.className='seg';s.before(g)}
    const k=[...s.options].map(o=>o.value+'\u0001'+o.text).join('\u0002');
    if(g.dataset.k!==k){g.dataset.k=k;g.innerHTML=[...s.options].map(o=>`<button type="button" data-v="${esc(o.value)}">${esc(o.text)}</button>`).join('');
      g.onclick=e=>{const b=e.target.closest('button');if(!b||s.value===b.dataset.v)return;s.value=b.dataset.v;fire(s);iosUp()}}
    g.querySelectorAll('button').forEach(b=>b.classList.toggle('on',b.dataset.v===s.value))});
  Object.keys(SHEET).forEach(id=>{const s=document.getElementById(id);if(!s)return;let b=s.previousElementSibling;
    if(!b||!b.classList.contains('shb')){b=document.createElement('button');b.type='button';b.className='shb';b.onclick=()=>sheet(s,SHEET[id]);s.before(b)}
    const o=s.selectedOptions[0],t=o?o.text:'—';if(b.textContent!==t)b.textContent=t})}
function sheet(s,title){
  const ov=document.createElement('div'),p=document.createElement('div');ov.className='sh-ov';p.className='sh';
  p.innerHTML=`<div class="sh-g"></div><div class="sh-h"><span style="width:56px"></span><b>${esc(title)}</b><button type="button">ปิด</button></div>${s.options.length>8?'<input type="search" class="srch" placeholder="ค้นหา">':''}<div class="sh-l"></div>`;
  document.body.append(ov,p);requestAnimationFrame(()=>{ov.classList.add('open');p.classList.add('open')});
  const close=()=>{ov.classList.remove('open');p.classList.remove('open');setTimeout(()=>{ov.remove();p.remove()},300)};
  ov.onclick=close;p.querySelector('.sh-h button').onclick=close;
  const L=p.querySelector('.sh-l'),q=p.querySelector('.srch');
  const draw=()=>{const f=(q&&q.value||'').toLowerCase(),groups=[];
    [...s.children].forEach(c=>{const opts=c.tagName=='OPTGROUP'?[...c.children]:[c],lab=c.tagName=='OPTGROUP'?c.label:'';const m=opts.filter(o=>!f||o.text.toLowerCase().includes(f));
      if(!m.length)return;const last=groups[groups.length-1];if(!lab&&last&&!last.lab)last.o.push(...m);else groups.push({lab,o:m})});
    L.innerHTML=groups.map(g=>(g.lab?`<h4>${esc(g.lab)}</h4>`:'<div style="height:6px"></div>')+`<div class="grp">${g.o.map(o=>`<button type="button" data-v="${esc(o.value)}" class="${o.value===s.value?'on':''}">${esc(o.text)}</button>`).join('')}</div>`).join('')||'<div class="none">ไม่พบรายการ</div>'};
  L.onclick=e=>{const b=e.target.closest('button[data-v]');if(!b)return;s.value=b.dataset.v;fire(s);iosUp();close()};
  if(q)q.oninput=draw;draw();const on=L.querySelector('.on');if(on)on.scrollIntoView({block:'center'})}
// อัปเดตอัตโนมัติทุกครั้งที่หน้าจอเปลี่ยน
let iosT;new MutationObserver(()=>{cancelAnimationFrame(iosT);iosT=requestAnimationFrame(iosUp)}).observe(document.getElementById('m'),{childList:true,subtree:true});
document.addEventListener('change',e=>{if(e.target.tagName=='SELECT')requestAnimationFrame(iosUp)});
