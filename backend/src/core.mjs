import crypto from 'node:crypto';
import { promisify } from 'node:util';
const scrypt=promisify(crypto.scrypt);
export class HttpError extends Error{constructor(status,message,rule){super(message);this.status=status;this.rule=rule;}}
export function ensure(test,status,message,rule){if(!test)throw new HttpError(status,message,rule);}
export function text(value,name,max=200,required=true){if(value==null&&!required)return null;ensure(typeof value==='string',422,`${name} must be text`);const s=value.trim();ensure((!required||s.length>0)&&s.length<=max,422,`${name} must contain ${required?'1':'0'}–${max} characters`);return s;}
export function integer(value,name,min=0,max=100000000){ensure(Number.isSafeInteger(value)&&value>=min&&value<=max,422,`${name} must be an integer between ${min} and ${max}`);return value;}
export function choice(value,name,values){ensure(values.includes(value),422,`Invalid ${name}`);return value;}
export function email(value){const e=text(value,'email',254).toLowerCase();ensure(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e),422,'Enter a valid email');return e;}
export function date(value,name='date'){ensure(typeof value==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(value)&&!Number.isNaN(Date.parse(value))&&new Date(value).toISOString().startsWith(value),422,`Invalid ${name}`);return value;}
export function only(body,keys){ensure(body&&typeof body==='object'&&!Array.isArray(body),400,'Expected a JSON object');for(const k of Object.keys(body))ensure(keys.includes(k),422,`Unsupported field: ${k}`);}
export const token=()=>crypto.randomBytes(32).toString('base64url');
export const digest=value=>crypto.createHash('sha256').update(value).digest('hex');
export async function passwordHash(password){text(password,'password',128);ensure(password.length>=12,422,'Use a password with at least 12 characters');const salt=crypto.randomBytes(16).toString('hex');const hash=await scrypt(password,salt,64);return `scrypt:${salt}:${hash.toString('hex')}`;}
export async function passwordMatches(password,stored){if(typeof password!=='string'||password.length>128)return false;const [kind,salt,hash]=(stored||'scrypt:dummy-salt:'+ '0'.repeat(128)).split(':');if(kind!=='scrypt')return false;const derived=await scrypt(password,salt,64);const actual=Buffer.from(hash,'hex');return actual.length===derived.length&&crypto.timingSafeEqual(actual,derived);}
export function rateLimit(db,key,limit=10,windowMs=900000){const time=Date.now();const r=db.prepare('SELECT * FROM auth_attempts WHERE bucket=?').get(key);if(!r||r.reset_at<time){db.prepare('INSERT INTO auth_attempts VALUES(?,?,?) ON CONFLICT(bucket) DO UPDATE SET attempts=excluded.attempts,reset_at=excluded.reset_at').run(key,1,time+windowMs);return;}ensure(r.attempts<limit,429,'Too many attempts. Please try again later.');db.prepare('UPDATE auth_attempts SET attempts=attempts+1 WHERE bucket=?').run(key);}
export const OPS=['admin','finance_admin'];
export function privileged(user){return Boolean(user?.roles.some(r=>OPS.includes(r)));}
export function requireOps(user){ensure(privileged(user),403,'This operation requires administrative access','ROLE');}
export function requireRole(user,roles){ensure(user&&user.roles.some(r=>roles.includes(r)),403,'This role cannot perform this operation','ROLE');}
export function reason(body){return text(body.reason,'reason',2000);}
export function publicUser(db,row){if(!row)return null;return {id:row.id,full_name:row.full_name,first_name:row.first_name,email:row.email,phone:row.phone,state:row.state,roles:db.prepare('SELECT role FROM user_roles WHERE user_id=?').all(row.id).map(x=>x.role)};}
export function coachFor(db,user){requireRole(user,['coach_ours','coach_org']);const c=db.prepare('SELECT * FROM coaches WHERE user_id=?').get(user.id);ensure(c,403,'Coach profile is not provisioned');return c;}
export function getRow(db,table,id){const row=db.prepare(`SELECT * FROM ${table} WHERE id=?`).get(id);ensure(row,404,'Record not found');return row;}
