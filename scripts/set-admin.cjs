const fs=require('fs');
const {initializeApp,applicationDefault}=require('firebase-admin/app');
const {getAuth}=require('firebase-admin/auth');
const {getFirestore,FieldValue}=require('firebase-admin/firestore');
const P='prime-housing-72330',E=process.env.ADMIN_EMAIL,W=process.env.ADMIN_PASSWORD;
const OLD=(process.env.OLD_ADMIN_EMAILS||'').split(',').map(s=>s.trim()).filter(Boolean);
(async()=>{
 if(!E||!W||W.length<8){console.error('Set ADMIN_EMAIL and ADMIN_PASSWORD (min 8 chars)');process.exit(1);}
 const kf=process.env.GOOGLE_APPLICATION_CREDENTIALS;
 if(kf&&fs.existsSync(kf)){const pid=JSON.parse(fs.readFileSync(kf,'utf8')).project_id;if(pid!==P){console.error('Key is for '+pid+', need '+P);process.exit(1);}}
 initializeApp({credential:applicationDefault(),projectId:P});
 const a=getAuth(),d=getFirestore();let u;
 try{u=await a.getUserByEmail(E);await a.updateUser(u.uid,{password:W,emailVerified:true,disabled:false});console.log('updated user');}
 catch(e){if(e.code==='auth/user-not-found'){u=await a.createUser({email:E,password:W,emailVerified:true});console.log('created user');}else throw e;}
 await a.setCustomUserClaims(u.uid,{admin:true,role:'admin'});
 const doc={email:E,role:'admin',updatedAt:FieldValue.serverTimestamp()};
 await d.doc('admins/'+u.uid).set(doc,{merge:true});await d.doc('users/'+u.uid).set(doc,{merge:true});
 for(const o of OLD){if(o===E)continue;try{const x=await a.getUserByEmail(o);await a.setCustomUserClaims(x.uid,null);await d.doc('admins/'+x.uid).delete();await d.doc('users/'+x.uid).set({role:'user'},{merge:true});console.log('revoked: '+o);}catch(e){console.log('skip '+o+': '+(e.code||e.message));}}
 const c=await a.getUser(u.uid);console.log('email:',c.email,'| claims:',JSON.stringify(c.customClaims));console.log('Done');
})().catch(e=>{console.error('FAILED:',e.message);process.exit(1);});
