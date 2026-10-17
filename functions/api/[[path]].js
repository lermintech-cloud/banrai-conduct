// API ของระบบ (Cloudflare Pages Function) — ตาราง D1: cfg, students, records
// สิทธิ์: ADMIN_PASSWORD = ผู้ดูแล (ส่งหัว x-mode: admin) · ครู = เข้าได้โดยไม่ต้องใช้รหัส (ดูข้อมูลและเพิ่มบันทึกได้อย่างเดียว)
const J=(o,s=200)=>new Response(JSON.stringify(o),{status:s,headers:{'content-type':'application/json'}});
const ch=(a,n)=>{const o=[];for(let i=0;i<a.length;i+=n)o.push(a.slice(i,i+n));return o};
export async function onRequest({request,env,params}){
  const pw=request.headers.get('x-app-password')||'',mode=request.headers.get('x-mode')||'';
  const db=env.DB;let role=null,me={name:'',cls:''};
  if(!db)return J({error:'ยังไม่ได้ผูกฐานข้อมูล D1 (ตัวแปร DB) ในโปรเจกต์ Cloudflare Pages'},500);
  // ผู้ดูแล: ต้องใส่ ADMIN_PASSWORD · ครู: เข้าได้โดยไม่ต้องใช้รหัส (ดูข้อมูลและเพิ่มบันทึกได้อย่างเดียว)
  if(mode==='admin'){if(env.ADMIN_PASSWORD&&pw===env.ADMIN_PASSWORD)role='admin'}
  else role='teacher';
  if(!role)return J({error:'unauthorized'},401);
  const [a,b]=params.path||[],m=request.method,adm=role==='admin';
  const S=x=>String(x==null?'':x).slice(0,500);
  const insR=(x,rep)=>db.prepare(`INSERT OR ${rep?'REPLACE':'IGNORE'} INTO records(id,sid,d,ty,lv,item,pts,note,who) VALUES(?,?,?,?,?,?,?,?,?)`).bind(S(x.id),S(x.sid),S(x.d),x.ty=='a'?'a':'c',+x.lv||0,S(x.item),Math.min(100,Math.max(1,+x.pts||0)),S(x.note),S(adm?x.by:(me.name||x.by)));
  const insS=x=>db.prepare('INSERT OR REPLACE INTO students(id,code,name,cls,sex) VALUES(?,?,?,?,?)').bind(S(x.id),S(x.code),S(x.name),S(x.cls),S(x.sex));
  const insT=x=>db.prepare('INSERT INTO teachers(id,name,cls,pin) VALUES(?,?,?,?) ON CONFLICT(id) DO UPDATE SET name=excluded.name,cls=excluded.cls,pin=excluded.pin').bind(S(x.id),S(x.name),S(x.cls),S(x.pin));
  if(a==='all'&&m==='GET'){
    const q=[db.prepare("SELECT value FROM cfg WHERE key='main'"),db.prepare('SELECT id,code,name,cls,sex FROM students ORDER BY cls,code'),db.prepare('SELECT id,sid,d,ty,lv,item,pts,note,who AS "by" FROM records')];
    if(adm)q.push(db.prepare('SELECT id,name,cls,pin FROM teachers ORDER BY cls,name'));
    const [c,s,r,t]=await db.batch(q);
    return J({role,me,cfg:c.results[0]?JSON.parse(c.results[0].value):null,st:s.results,rc:r.results,tc:t?t.results:[]});
  }
  if(a==='rc'&&m==='POST'){const L=await request.json();for(const g of ch(L,50))await db.batch(g.map(x=>insR(x,adm)));return J({ok:1})}
  if(!adm)return J({error:'forbidden'},403);
  if(a==='rc'&&m==='DELETE'){await db.prepare('DELETE FROM records WHERE id=?').bind(b).run();return J({ok:1})}
  if(a==='st'&&m==='POST'){const L=await request.json();for(const g of ch(L,50))await db.batch(g.map(insS));return J({ok:1})}
  if(a==='st'&&m==='DELETE'){await db.batch([db.prepare('DELETE FROM records WHERE sid=?').bind(b),db.prepare('DELETE FROM students WHERE id=?').bind(b)]);return J({ok:1})}
  if(a==='tc'&&m==='POST'){const L=await request.json();try{for(const g of ch(L,50))await db.batch(g.map(insT))}catch(e){return J({error:'pin ซ้ำ'},409)}return J({ok:1})}
  if(a==='tc'&&m==='DELETE'){await db.prepare('DELETE FROM teachers WHERE id=?').bind(b).run();return J({ok:1})}
  if(a==='cfg'&&m==='PUT'){await db.prepare("INSERT OR REPLACE INTO cfg(key,value) VALUES('main',?)").bind(JSON.stringify(await request.json())).run();return J({ok:1})}
  if(a==='import'&&m==='POST'){const x=await request.json();
    await db.batch([db.prepare('DELETE FROM records'),db.prepare('DELETE FROM students'),db.prepare('DELETE FROM teachers'),db.prepare("INSERT OR REPLACE INTO cfg(key,value) VALUES('main',?)").bind(JSON.stringify(x.cfg||{}))]);
    for(const g of ch(x.st||[],50))await db.batch(g.map(insS));
    for(const g of ch(x.tc||[],50))await db.batch(g.map(insT));
    for(const g of ch(x.rc||[],50))await db.batch(g.map(r=>insR(r,true)));
    return J({ok:1})}
  return J({error:'not found'},404);
}
