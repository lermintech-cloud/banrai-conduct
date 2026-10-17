// API ของระบบ (Cloudflare Pages Function) — ตาราง D1: cfg, students, records
// สิทธิ์: ADMIN_PASSWORD = ผู้ดูแล (ทำได้ทุกอย่าง) · TEACHER_PASSWORD = ครู (ดูข้อมูลและเพิ่มบันทึกได้อย่างเดียว)
const J=(o,s=200)=>new Response(JSON.stringify(o),{status:s,headers:{'content-type':'application/json'}});
const ch=(a,n)=>{const o=[];for(let i=0;i<a.length;i+=n)o.push(a.slice(i,i+n));return o};
export async function onRequest({request,env,params}){
  const pw=request.headers.get('x-app-password')||'';
  const role=env.ADMIN_PASSWORD&&pw===env.ADMIN_PASSWORD?'admin':env.TEACHER_PASSWORD&&pw===env.TEACHER_PASSWORD?'teacher':null;
  if(!role)return J({error:'unauthorized'},401);
  const [a,b]=params.path||[],m=request.method,db=env.DB,adm=role==='admin';
  const S=x=>String(x==null?'':x).slice(0,500);
  const insR=(x,rep)=>db.prepare(`INSERT OR ${rep?'REPLACE':'IGNORE'} INTO records(id,sid,d,ty,lv,item,pts,note,who) VALUES(?,?,?,?,?,?,?,?,?)`).bind(S(x.id),S(x.sid),S(x.d),x.ty=='a'?'a':'c',+x.lv||0,S(x.item),Math.min(100,Math.max(1,+x.pts||0)),S(x.note),S(x.by));
  const insS=x=>db.prepare('INSERT OR REPLACE INTO students(id,code,name,cls) VALUES(?,?,?,?)').bind(S(x.id),S(x.code),S(x.name),S(x.cls));
  if(a==='all'&&m==='GET'){
    const [c,s,r]=await db.batch([db.prepare("SELECT value FROM cfg WHERE key='main'"),db.prepare('SELECT id,code,name,cls FROM students ORDER BY cls,code'),db.prepare('SELECT id,sid,d,ty,lv,item,pts,note,who AS "by" FROM records')]);
    return J({role,cfg:c.results[0]?JSON.parse(c.results[0].value):null,st:s.results,rc:r.results});
  }
  if(a==='rc'&&m==='POST'){const L=await request.json();for(const g of ch(L,50))await db.batch(g.map(x=>insR(x,adm)));return J({ok:1})}
  if(!adm)return J({error:'forbidden'},403);
  if(a==='rc'&&m==='DELETE'){await db.prepare('DELETE FROM records WHERE id=?').bind(b).run();return J({ok:1})}
  if(a==='st'&&m==='POST'){const L=await request.json();for(const g of ch(L,50))await db.batch(g.map(insS));return J({ok:1})}
  if(a==='st'&&m==='DELETE'){await db.batch([db.prepare('DELETE FROM records WHERE sid=?').bind(b),db.prepare('DELETE FROM students WHERE id=?').bind(b)]);return J({ok:1})}
  if(a==='cfg'&&m==='PUT'){await db.prepare("INSERT OR REPLACE INTO cfg(key,value) VALUES('main',?)").bind(JSON.stringify(await request.json())).run();return J({ok:1})}
  if(a==='import'&&m==='POST'){const x=await request.json();
    await db.batch([db.prepare('DELETE FROM records'),db.prepare('DELETE FROM students'),db.prepare("INSERT OR REPLACE INTO cfg(key,value) VALUES('main',?)").bind(JSON.stringify(x.cfg||{}))]);
    for(const g of ch(x.st||[],50))await db.batch(g.map(insS));
    for(const g of ch(x.rc||[],50))await db.batch(g.map(r=>insR(r,true)));
    return J({ok:1})}
  return J({error:'not found'},404);
}
