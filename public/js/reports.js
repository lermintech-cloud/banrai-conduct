// รายงานตามรูปแบบเอกสารราชการไทย: บันทึกข้อความ / หนังสือแจ้งผู้ปกครอง / ตารางรายงาน
const MON=['มกราคม','กุมภาพันธ์','มีนาคม','เมษายน','พฤษภาคม','มิถุนายน','กรกฎาคม','สิงหาคม','กันยายน','ตุลาคม','พฤศจิกายน','ธันวาคม'];
const fmtL=d=>{const x=new Date(d);return x.getDate()+' '+MON[x.getMonth()]+' '+(x.getFullYear()+543)};
const DOT='......................................';
const frame=h=>`<table class="frame"><thead><tr><td><div class="sp1"></div></td></tr></thead><tbody><tr><td>${h}</td></tr></tbody><tfoot><tr><td><div class="sp2"></div></td></tr></tfoot></table>`;
let EMB='g';try{EMB=localStorage.getItem('emb')||'g'}catch(e){}
const gar=h=>EMB=='s'?`<img src="assets/logo.png" style="height:${h}" alt="ตราโรงเรียน">`:`<img src="assets/garuda.jpg" style="height:${h}" alt="ตราครุฑ">`;
function setEmb(v){EMB=v;try{localStorage.setItem('emb',v)}catch(e){}gen()}
const one=(role,name,pre)=>`<div class="sgn">${pre||''}<div class="sp3"></div>( ${esc(name||DOT)} )<br>${role}</div>`;
const sg=l=>`<div class="sg">${l.map(x=>`<div>ลงชื่อ ${DOT}<br>( ${esc(x[1]||DOT)} )<br>${x[0]}</div>`).join('')}</div>`;
const ph=t=>`<div class="ph"><div class="phi" style="justify-content:center">${gar('2.4cm')}</div><b>${esc(D.cfg.school)}</b><br>${esc(D.cfg.area)}<h2>${t}</h2>ภาคเรียนที่ ${esc(D.cfg.term)}</div>`;
const lvn=r=>r.ty=='c'?R[r.lv].n:'เพิ่มคะแนน';
const recT=L=>`<table class="pt"><thead><tr><th class="c">ที่</th><th>วันที่</th><th>รายการ</th><th class="c">ขั้น</th><th class="c">คะแนน</th><th>หลักฐาน/ผู้บันทึก</th></tr></thead><tbody>${L.map((r,i)=>`<tr><td class="c">${i+1}</td><td>${fmtL(r.d)}</td><td>${esc(r.item)}</td><td class="c">${lvn(r).replace('ขั้น','')}</td><td class="c">${r.ty=='c'?'-':'+'}${r.pts}</td><td>${esc(r.note)} ${esc(r.by)}</td></tr>`).join('')||'<tr><td colspan="6" class="c">ไม่มีรายการ</td></tr>'}</tbody></table>`;
function recOpts(sid){return D.rc.filter(r=>r.sid==sid&&r.ty=='c').sort((a,b)=>b.d.localeCompare(a.d)).map(r=>`<option value="${r.id}" selected>${fmt(r.d)} · ${esc(r.item)} (-${r.pts})</option>`).join('')}
function rep(sid){M(head('รายงาน','เอกสารตามรูปแบบหนังสือราชการ พิมพ์หรือบันทึกเป็น PDF ได้')+`<div class="card noprint"><div class="row">
<label>ประเภทเอกสาร<select id="rt" onchange="ru()"><option value="m">บันทึกข้อความ ขออนุญาตตัดคะแนน</option><option value="p">หนังสือแจ้งผู้ปกครอง</option><option value="i">รายงานรายบุคคล</option><option value="c">รายงานรายชั้นเรียน</option><option value="s">สรุประดับโรงเรียน</option></select></label>
<label class="f-m f-p f-i">นักเรียน<select id="rs" onchange="$('#rr').innerHTML=recOpts(this.value);gen()">${sOpts('')}</select></label>
<label class="f-c">ชั้น<select id="rc" onchange="gen()">${clsList().map(x=>`<option>${esc(x)}</option>`).join('')}</select></label>
<label class="f-m f-p">รายการความผิดที่ระบุ<select id="rr" multiple size="3" onchange="gen()"></select></label>
<label class="f-m f-p">เลขที่หนังสือ<input id="rn" value="${esc(D.cfg.pre)}" oninput="gen()"></label>
<label>ตราสัญลักษณ์<select id="re" onchange="setEmb(this.value)"><option value="g">ตราครุฑ</option><option value="s">ตราโรงเรียน</option></select></label>
<label>ลงวันที่<input type="date" id="rd" value="${today()}" onchange="gen()"></label>
<label style="flex:0;min-width:120px"><span><input type="checkbox" id="th" checked onchange="gen()" style="width:auto"> เลขไทย</span></label></div>
<p style="margin-top:12px"><button class="btn gold" onclick="prt()">🖨️ พิมพ์</button> <button class="btn" onclick="pdf()">📄 PDF (ดูตัวอย่าง/ดาวน์โหลด)</button><br><small style="color:var(--mu)">ปุ่มพิมพ์: เลือก A4 และไม่ต้องติ๊ก “ส่วนหัวและส่วนท้าย” · ปุ่ม PDF: สร้างไฟล์ให้ดูตัวอย่างก่อน (ใช้บนมือถือได้) แล้วกดดาวน์โหลด</small></p></div><div class="sheetwrap"><div class="paper" id="pp"></div></div>`);
$('#re').value=EMB;if(typeof sid=='string')$('#rs').value=sid;$('#rr').innerHTML=recOpts($('#rs').value);ru()}
function ru(){const t=$('#rt').value;document.querySelectorAll('.row label[class*="f-"]').forEach(e=>e.style.display=e.classList.contains('f-'+t)?'':'none');gen()}
function prt(){const o=document.title;document.title=D.cfg.school+'_'+today();window.onafterprint=()=>{document.title=o};window.print()}
function pick(){const s=D.st.find(x=>x.id==$('#rs').value);const ids=[...$('#rr').selectedOptions].map(o=>o.value);let L=s?D.rc.filter(r=>r.sid==s.id&&r.ty=='c'):[];if(ids.length)L=L.filter(r=>ids.includes(r.id));return[s,L.sort((a,b)=>a.d.localeCompare(b.d))]}
function memo(s,L,dt,no){const k=sc(s.id),tot=L.reduce((a,r)=>a+r.pts,0);return `<div class="mh">${gar('1.5cm')}<h1>บันทึกข้อความ</h1></div>
<div class="mr"><b>ส่วนราชการ</b><span class="d">${esc(D.cfg.school)} ${esc(D.cfg.area)}</span></div>
<div class="mr"><b>ที่</b><span class="d" style="flex:0 0 6.5cm">${esc(no)}</span><b style="margin-left:.5cm">วันที่</b><span class="d">${fmtL(dt)}</span></div>
<div class="mr"><b>เรื่อง</b><span class="d">ขออนุญาตตัดคะแนนความประพฤตินักเรียน</span></div>
<p class="s6">เรียน ผู้อำนวยการ${esc(D.cfg.school)}</p>
<p class="ti s6">ด้วย ${esc(s.name)} นักเรียนชั้น ${esc(s.cls)} ได้ประพฤติผิดระเบียบของโรงเรียนว่าด้วยการควบคุมความประพฤติ การลงโทษ การตัด และการเพิ่มคะแนนความประพฤตินักเรียน ดังรายการต่อไปนี้</p>${recT(L)}
<p class="ti s6">ทั้งนี้ ได้แนบหลักฐานการกระทำความผิดมาพร้อมบันทึกนี้ โดยพิจารณาแล้วเห็นสมควรตัดคะแนนความประพฤติรวม ${tot} คะแนน คงเหลือคะแนนความประพฤติ ${k.s} คะแนน (${stt(k.s)[0]})</p>
<p class="ti s6">จึงเรียนมาเพื่อโปรดพิจารณาอนุญาต</p>${one('หัวหน้ากลุ่มบริหารกิจการนักเรียน',D.cfg.head)}
<div class="box"><p>ความเห็นผู้อำนวยการ &nbsp; ☐ อนุญาต &nbsp; ☐ ไม่อนุญาต</p>${one('ผู้อำนวยการ'+esc(D.cfg.school),D.cfg.dir)}</div>
${sg([['นักเรียนผู้ถูกตัดคะแนน (รับทราบ)'],['ผู้ปกครองนักเรียน (รับทราบ)']])}`}
function lett(s,L,dt,no){const k=sc(s.id),tot=L.reduce((a,r)=>a+r.pts,0),x=stt(k.s);return `<div style="text-align:center">${gar('3cm')}</div>
<div class="lt"><div>ที่ ${esc(no)||'..................'}</div><div class="ad">${esc(D.cfg.school)}<br>${esc(D.cfg.addr)}</div></div>
<p style="text-align:center;margin-left:8cm">${fmtL(dt)}</p>
<p class="s6">เรื่อง แจ้งการตัดคะแนนความประพฤตินักเรียน</p><p class="s6">เรียน ผู้ปกครองของ ${esc(s.name)}</p>
<p class="s6">สิ่งที่ส่งมาด้วย สำเนาบันทึกการตัดคะแนนความประพฤตินักเรียน จำนวน 1 ฉบับ</p>
<p class="ti s6">ด้วยกลุ่มบริหารกิจการนักเรียน ${esc(D.cfg.school)} ได้พิจารณาตัดคะแนนความประพฤติของ ${esc(s.name)} นักเรียนชั้น ${esc(s.cls)} ซึ่งอยู่ในการปกครองของท่าน ในความผิดเกี่ยวกับ ${L.map(r=>esc(r.item)+' (ตัด '+r.pts+' คะแนน)').join(' ')} รวมตัดคะแนน ${tot} คะแนน คงเหลือคะแนนความประพฤติ ${k.s} คะแนน</p>
<p class="ti s6">ตามระเบียบของโรงเรียน กรณีนี้อยู่ในระดับ “${esc(x[0])}” ${x[2]!='-'?'ซึ่งโรงเรียนขอดำเนินการ: '+esc(x[2]):''}</p>
<p class="ti s6">จึงเรียนมาเพื่อโปรดทราบ และขอความร่วมมือในการกำกับดูแลนักเรียนต่อไป</p>
${one('ผู้อำนวยการ'+esc(D.cfg.school),D.cfg.dir,'ขอแสดงความนับถือ')}
<p style="margin-top:12pt">${esc(D.cfg.school)}<br>กลุ่มบริหารกิจการนักเรียน<br>โทร. ${esc(D.cfg.tel)}</p>`}
function indiv(s,dt){const k=sc(s.id),rs=D.rc.filter(r=>r.sid==s.id).sort((a,b)=>a.d.localeCompare(b.d));return ph('รายงานคะแนนความประพฤตินักเรียนรายบุคคล')+`<p>ชื่อ-สกุล <b>${esc(s.name)}</b> รหัส ${esc(s.code)} ชั้น ${esc(s.cls)}<br>ถูกตัดคะแนน ${k.c} · เพิ่มคะแนน ${k.a} · <b>คะแนนคงเหลือ ${k.s} / 100</b> · สถานะ ${stt(k.s)[0]}</p>${recT(rs)}<p style="margin-top:8px">ณ วันที่ ${fmtL(dt)}</p>`+sg([['ครูที่ปรึกษา'],['หัวหน้ากลุ่มบริหารกิจการนักเรียน',D.cfg.head],['ผู้อำนวยการ',D.cfg.dir]])}
function clsR(c,dt){const g=D.st.filter(s=>s.cls==c);return ph('รายงานคะแนนความประพฤติ ชั้น '+esc(c))+`<table class="pt"><thead><tr><th class="c">ที่</th><th>รหัส</th><th>ชื่อ-สกุล</th><th class="c">ถูกตัด</th><th class="c">เพิ่ม</th><th class="c">คงเหลือ</th><th>สถานะ</th></tr></thead><tbody>${g.map((s,i)=>{const k=sc(s.id);return `<tr><td class="c">${i+1}</td><td>${esc(s.code)}</td><td>${esc(s.name)}</td><td class="c">${k.c}</td><td class="c">${k.a}</td><td class="c"><b>${k.s}</b></td><td>${stt(k.s)[0]}</td></tr>`}).join('')}</tbody></table><p>ณ วันที่ ${fmtL(dt)}</p>`+sg([['ครูที่ปรึกษา'],['หัวหน้ากลุ่มบริหารกิจการนักเรียน',D.cfg.head],['ผู้อำนวยการ',D.cfg.dir]])}
function sumR(dt){const cl=clsList(),A=D.st.map(s=>sc(s.id).s),av=a=>a.length?(a.reduce((x,y)=>x+y,0)/a.length).toFixed(1):0,row=(n,g)=>`<tr><td>${n}</td><td class="c">${g.length}</td><td class="c">${av(g)}</td><td class="c">${g.filter(x=>x==100).length}</td><td class="c">${g.filter(x=>x<100&&x>80).length}</td><td class="c">${g.filter(x=>x<=80).length}</td></tr>`;return ph('สรุปคะแนนความประพฤตินักเรียนระดับโรงเรียน')+`<table class="pt"><thead><tr><th>ชั้น</th><th class="c">จำนวน</th><th class="c">คะแนนเฉลี่ย</th><th class="c">ปกติ</th><th class="c">เฝ้าระวัง</th><th class="c">ถูกตัด ≥ 20</th></tr></thead><tbody>${cl.map(c=>row(esc(c),D.st.filter(s=>s.cls==c).map(s=>sc(s.id).s))).join('')}${row('<b>รวม</b>',A)}</tbody></table><p>จำนวนการตัดคะแนน: ${R.map((r,i)=>r.n+' '+D.rc.filter(x=>x.lv===i).length+' ครั้ง').join(' · ')}<br>ณ วันที่ ${fmtL(dt)}</p>`+sg([['หัวหน้ากลุ่มบริหารกิจการนักเรียน',D.cfg.head],['ผู้อำนวยการ',D.cfg.dir]])}
function gen(){const t=$('#rt').value,P=$('#pp'),dt=$('#rd').value||today(),no=$('#rn').value;let h;
if('mpi'.includes(t)){const[s,L]=pick();if(!s){P.innerHTML='<p>ยังไม่มีนักเรียน</p>';return}h=t=='m'?memo(s,L,dt,no):t=='p'?lett(s,L,dt,no):indiv(s,dt)}
else h=t=='c'?($('#rc').value?clsR($('#rc').value,dt):'<p>ยังไม่มีข้อมูลชั้น</p>'):sumR(dt);
h=frame(h);if($('#th').checked)h=h.replace(/>([^<]+)</g,(m,x)=>'>'+x.replace(/\d/g,d=>'๐๑๒๓๔๕๖๗๘๙'[d])+'<');P.innerHTML=h}
