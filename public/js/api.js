// การเชื่อมต่อข้อมูล: ใช้ /api (Cloudflare D1) ถ้าไม่มี API จะสลับเป็นโหมดทดสอบ (เก็บในเบราว์เซอร์)
let D=null,MODE='api',ROLE='admin',ME={name:'',cls:''},PW='';try{PW=sessionStorage.getItem('pw')||''}catch(e){}
const EMPTY=()=>({cfg:{school:'โรงเรียนบ้านไร่',area:'สำนักงานเขตพื้นที่การศึกษาประถมศึกษาเชียงใหม่ เขต 5',term:'1/2569',head:'',dir:'',addr:'',tel:'',pre:''},st:[],rc:[],tc:[]});
const HD=()=>({'Content-Type':'application/json','x-app-password':PW});
async function load(){
  if(MODE=='local'){try{D=JSON.parse(localStorage.getItem('brsc'))}catch(e){}D=D||EMPTY();D.tc=D.tc||[];ROLE='admin';ME={name:'',cls:''};return true}
  let r;try{r=await fetch('/api/all',{headers:HD()})}catch(e){r=null}
  if(r&&r.status==401)return false;
  if(!r||!r.ok||!(r.headers.get('content-type')||'').includes('json')){MODE='local';return load()}
  const j=await r.json();ROLE=j.role;ME=j.me||ME;D={cfg:{...EMPTY().cfg,...(j.cfg||{})},st:j.st,rc:j.rc,tc:j.tc||[]};return true}
// ส่งการเปลี่ยนแปลงทีละรายการไปที่เซิร์ฟเวอร์ (ไม่ทับข้อมูลคนอื่น)
async function call(m,p,b){
  if(MODE=='local'){try{localStorage.setItem('brsc',JSON.stringify(D))}catch(e){}return true}
  try{const r=await fetch('/api/'+p,{method:m,headers:HD(),body:b?JSON.stringify(b):undefined});if(!r.ok)throw 0;return true}
  catch(e){toast('บันทึกไม่สำเร็จ หรือไม่มีสิทธิ์ทำรายการนี้');return false}}
function loginUI(msg){document.body.classList.add('lg');M(`<div class="card" style="text-align:center"><img class="lgi" src="assets/logo.png" alt=""><h1>ระบบคะแนนความประพฤติ</h1><p class="sub">โรงเรียนบ้านไร่ · กรอกรหัสผ่าน หรือ PIN ครู เพื่อเข้าใช้งาน</p><input type="password" id="pw" placeholder="รหัสผ่าน" onkeydown="if(event.key=='Enter')doLogin()"><p style="color:var(--bad);min-height:1.5em">${msg||''}</p><button class="btn" onclick="doLogin()">เข้าสู่ระบบ</button></div>`)}
async function doLogin(){PW=$('#pw').value;if(await load()){try{sessionStorage.setItem('pw',PW)}catch(e){}go('dash',1)}else loginUI('รหัสผ่านไม่ถูกต้อง')}
async function boot(){if(await load())go('dash',1);else loginUI()}
