import {ensure,token,digest,reason,rateLimit} from './core.mjs';
import {transaction,audit} from './db.mjs';
export const localInvitationsAllowed=config=>!config.production&&['127.0.0.1','localhost','[::1]'].includes(new URL(config.publicUrl).hostname);
export function registerLocalInvitations(router,db,config){
 router('POST','/api/admin/people/:id/local-invitation',true,c=>{
  ensure(c.user.roles.includes('admin'),403,'Administrator access required');
  ensure(localInvitationsAllowed(config),403,'Activation links are available only in the local presentation installation');
  const why=reason(c.body);rateLimit(db,'local-invite:'+c.user.id,10,3600000);
  const u=db.prepare("SELECT u.id,u.email FROM users u JOIN coaches co ON co.user_id=u.id WHERE u.id=? AND u.state='invited'").get(c.params.id);
  ensure(u,409,'Only an enrolled coach awaiting activation can receive this link');
  const raw=token(),expires=new Date(Date.now()+30*60000).toISOString();
  transaction(db,()=>{db.prepare('INSERT INTO account_invitations(user_id,token_hash,expires_at,used_at) VALUES(?,?,?,NULL) ON CONFLICT(user_id) DO UPDATE SET token_hash=excluded.token_hash,expires_at=excluded.expires_at,used_at=NULL').run(u.id,digest(raw),expires);audit(db,c.user,'local_coach_activation_link','users',u.id,why);});
  return {url:config.publicUrl+'/login?invite='+raw,email:u.email,expires_at:expires};
 });
}
