// สร้างไฟล์ PDF ขนาด A4 จากเอกสารที่เลือก + หน้าตัวอย่างให้ดูบนมือถือก่อนดาวน์โหลด
// ขอบกระดาษตามงานสารบรรณ: บน 25 / ล่าง 20 / ซ้าย 30 / ขวา 20 มม. (ตรงกับตอนพิมพ์)
const PDFL=['https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js','https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js'];
const loadJs=u=>new Promise((ok,no)=>{const s=document.createElement('script');s.src=u;s.onload=ok;s.onerror=()=>no(new Error('โหลดตัวสร้าง PDF ไม่ได้ ตรวจสอบอินเทอร์เน็ตแล้วลองใหม่'));document.head.appendChild(s)});
function pdfClose(){const e=document.getElementById('pv');if(e){e.remove();if(e.dataset.u)URL.revokeObjectURL(e.dataset.u)}}
async function pdf(){
  const src=document.querySelector('#pp .frame tbody td');if(!src||!src.textContent.trim())return toast('ยังไม่มีเอกสารให้สร้าง');
  const bt=[...document.querySelectorAll('button')].filter(b=>b.textContent.includes('PDF'));bt.forEach(b=>b.disabled=true);toast('กำลังสร้าง PDF…');
  let host;
  try{
    if(!window.html2canvas)await loadJs(PDFL[0]);
    if(!window.jspdf)await loadJs(PDFL[1]);
    if(document.fonts&&document.fonts.ready)await document.fonts.ready;
    host=document.createElement('div');host.className='paper';
    host.style.cssText='position:absolute;left:0;top:0;z-index:-1;width:160mm;min-height:0;padding:0;margin:0;box-shadow:none;background:#fff';
    host.innerHTML=src.innerHTML;document.body.appendChild(host);
    await Promise.all([...host.querySelectorAll('img')].map(i=>i.complete?1:new Promise(r=>{i.onload=i.onerror=r})));
    const hr=host.getBoundingClientRect(),W=hr.width,H=host.scrollHeight,top=hr.top;
    // หาตำแหน่งตัดหน้า: ตัดตรงขอบล่างของบล็อก ไม่ตัดกลางบรรทัด/กลางกล่องลายเซ็น
    const ys=[...host.querySelectorAll('p,tr,h1,h2,.sg,.box,.sgn,.mh,.ph,.lt,.hr')].map(e=>e.getBoundingClientRect().bottom-top).sort((a,b)=>a-b);
    const av=[...host.querySelectorAll('.box,.sg,.sgn')].map(e=>{const r=e.getBoundingClientRect();return[r.top-top,r.bottom-top]});
    const okY=y=>!av.some(([a,b])=>a<y-1&&b>y+1),PH=W*(252/160),cut=[];let st=0;
    while(st<H-1){const lim=st+PH;if(lim>=H){cut.push([st,H]);break}
      const c=ys.filter(y=>y>st+4&&y<=lim&&okY(y)),en=c.length?c[c.length-1]:lim;cut.push([st,en]);st=en}
    const cv=await html2canvas(host,{scale:2,backgroundColor:'#fff',useCORS:true,windowWidth:1100}),k=cv.width/160,sc2=cv.height/H;
    const imgs=cut.map(([a,b])=>{const pc=document.createElement('canvas');pc.width=Math.round(210*k);pc.height=Math.round(297*k);const x=pc.getContext('2d');x.fillStyle='#fff';x.fillRect(0,0,pc.width,pc.height);
      const sh=Math.min(cv.height-Math.round(a*sc2),Math.round((b-a)*sc2));x.drawImage(cv,0,Math.round(a*sc2),cv.width,sh,Math.round(30*k),Math.round(25*k),cv.width,sh);return pc.toDataURL('image/jpeg',.92)});
    const doc=new window.jspdf.jsPDF({unit:'mm',format:'a4',orientation:'p'});imgs.forEach((u,i)=>{if(i)doc.addPage();doc.addImage(u,'JPEG',0,0,210,297)});
    const blob=doc.output('blob'),url=URL.createObjectURL(blob),name=(D.cfg.school+'_'+today()+'.pdf');
    pdfClose();const v=document.createElement('div');v.id='pv';v.dataset.u=url;
    v.style.cssText='position:fixed;inset:0;z-index:100;background:rgba(15,23,42,.9);display:flex;flex-direction:column';
    v.innerHTML=`<div style="display:flex;gap:8px;align-items:center;justify-content:space-between;padding:10px 12px;background:#0f172a;color:#fff"><b>ตัวอย่าง PDF · ${imgs.length} หน้า</b><span><a class="btn gold" id="pvd" href="${url}" download="${esc(name)}" style="text-decoration:none;display:inline-block">⬇ ดาวน์โหลด PDF</a> <button class="btn ghost" onclick="pdfClose()">ปิด</button></span></div><div style="overflow:auto;flex:1;padding:12px;-webkit-overflow-scrolling:touch">${imgs.map((u,i)=>`<img src="${u}" alt="หน้า ${i+1}" style="display:block;width:100%;max-width:794px;margin:0 auto 12px;background:#fff;box-shadow:0 4px 18px rgba(0,0,0,.4)">`).join('')}</div>`;
    document.body.appendChild(v);toast('สร้าง PDF เรียบร้อย');
  }catch(e){toast('สร้าง PDF ไม่สำเร็จ: '+(e&&e.message||e))}
  finally{if(host)host.remove();bt.forEach(b=>b.disabled=false)}}
