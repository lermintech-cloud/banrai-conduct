// การเชื่อมต่อข้อมูล: ใช้ /api (Cloudflare D1) ถ้าไม่มี API จะสลับเป็นโหมดทดสอบ (เก็บในเบราว์เซอร์)
let D=null,MODE='api',ROLE='admin',ME={name:'',cls:''},PW='',MD='';try{PW=sessionStorage.getItem('pw')||'';MD=sessionStorage.getItem('md')||''}catch(e){}
const EMPTY=()=>({cfg:{school:'โรงเรียนบ้านไร่',area:'สำนักงานเขตพื้นที่การศึกษาประถมศึกษาเชียงใหม่ เขต 5',term:'1/2569',head:'',dir:'',addr:'',tel:'',pre:''},st:[],rc:[],tc:[]});
const HD=()=>({'Content-Type':'application/json','x-app-password':PW,'x-mode':MD});
const LOCAL=location.protocol=='file:';
async function load(){
  if(MODE=='local'){try{D=JSON.parse(localStorage.getItem('brsc'))}catch(e){}D=D||EMPTY();D.tc=D.tc||[];ROLE='admin';ME={name:'',cls:''};return true}
  let r;try{r=await fetch('/api/all',{headers:HD()})}catch(e){r=null}
  if(r&&r.status==401)return false;
  if(!r||!r.ok||!(r.headers.get('content-type')||'').includes('json')){
    if(LOCAL){MODE='local';return load()}
    let why='เชื่อมต่อฐานข้อมูลไม่ได้';try{const j=await r.json();if(j.error)why=j.error}catch(e){}
    throw new Error(why)}
  MODE='api';
  const j=await r.json();ROLE=j.role;ME=j.me||ME;D={cfg:{...EMPTY().cfg,...(j.cfg||{})},st:j.st,rc:j.rc,tc:j.tc||[]};return true}
// ส่งการเปลี่ยนแปลงทีละรายการไปที่เซิร์ฟเวอร์ (ไม่ทับข้อมูลคนอื่น)
async function call(m,p,b){
  if(MODE=='local'){try{localStorage.setItem('brsc',JSON.stringify(D))}catch(e){}return true}
  try{const r=await fetch('/api/'+p,{method:m,headers:HD(),body:b?JSON.stringify(b):undefined});if(!r.ok)throw 0;return true}
  catch(e){toast('บันทึกไม่สำเร็จ หรือไม่มีสิทธิ์ทำรายการนี้');return false}}
function loginUI(msg,adm){document.body.classList.add('lg');M(`<div class="card" style="text-align:center"><img class="lgi" src="assets/logo.png" alt=""><h1>ระบบคะแนนความประพฤติ</h1><p class="sub">โรงเรียนบ้านไร่</p>${adm?`<input type="password" id="pw" placeholder="รหัสผ่านผู้ดูแล" onkeydown="if(event.key=='Enter')doLogin('admin')"><p style="color:var(--bad);min-height:1.5em">${msg||''}</p><button class="btn" style="width:100%" onclick="doLogin('admin')">เข้าสู่ระบบผู้ดูแล</button><p><button class="btn ghost" style="width:100%" onclick="loginUI()">ย้อนกลับ</button></p>`:`<p style="color:var(--bad);min-height:1.5em">${msg||''}</p><button class="btn" style="width:100%;margin-bottom:10px" onclick="doLogin('teacher')">🧑‍🏫 เข้าสู่ระบบครู</button><button class="btn ghost" style="width:100%" onclick="loginUI('',1)">🔑 เข้าสู่ระบบผู้ดูแล</button>`}</div>`);if(adm)setTimeout(()=>{const e=$('#pw');e&&e.focus()},50)}
function errUI(m){document.body.classList.add('lg');M(`<div class="card" style="text-align:center"><img class="lgi" src="assets/logo.png" alt=""><h1>เชื่อมต่อฐานข้อมูลไม่ได้</h1><p style="color:var(--bad)">${esc(m)}</p><p class="sub">ตรวจสอบอินเทอร์เน็ต หรือการผูกฐานข้อมูล D1 (ตัวแปร DB) ใน Cloudflare Pages แล้วลองใหม่<br>ระบบจะไม่เก็บข้อมูลไว้ในเครื่องแทน เพื่อไม่ให้ข้อมูลแต่ละเครื่องไม่ตรงกัน</p><button class="btn" onclick="boot()">ลองใหม่</button></div>`)}
async function doLogin(mode){MD=mode;PW=mode=='admin'?($('#pw').value||''):'';let ok;try{ok=await load()}catch(e){return errUI(e.message)}
  if(ok){try{sessionStorage.setItem('pw',PW);sessionStorage.setItem('md',MD)}catch(e){}go('dash',1)}else loginUI('รหัสผ่านไม่ถูกต้อง',1)}
function logout(){try{sessionStorage.removeItem('pw');sessionStorage.removeItem('md')}catch(e){}PW='';MD='';loginUI()}
async function boot(){if(LOCAL){MD='admin';try{if(await load())return go('dash',1)}catch(e){}}
  if(!MD)return loginUI();let ok;try{ok=await load()}catch(e){return errUI(e.message)}
  if(ok)go('dash',1);else loginUI('',1)}
