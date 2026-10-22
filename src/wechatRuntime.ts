export type IncomingMessage={id:string;personId:string;sender:'contact';type:'text';content:string;time:string;unread:boolean};
export type AlertSettings={banner:boolean;sound:boolean;vibration:boolean;preview:boolean};
export type ScheduledMessage={id:string;personId:string;content:string;trigger?:'delay'|'at'|'after_open';delayMs?:number;at?:string;once?:boolean;enabled?:boolean;notify?:boolean};
const messagesKey='lumu-wechat-player-messages-v1';
const firedKey='lumu-wechat-fired-v1';
const startKey='lumu-wechat-start-v1';
const settingsKey='lumu-wechat-alert-settings-v1';
export const getAlertSettings=():AlertSettings=>{try{return {...{banner:true,sound:true,vibration:true,preview:true},...JSON.parse(localStorage.getItem(settingsKey)||'{}')}}catch{return {banner:true,sound:true,vibration:true,preview:true}}};
export const saveAlertSettings=(s:AlertSettings)=>localStorage.setItem(settingsKey,JSON.stringify(s));
export const storedMessages=():IncomingMessage[]=>{try{const v=JSON.parse(localStorage.getItem(messagesKey)||'[]');return Array.isArray(v)?v:[]}catch{return []}};
export function dispatchIncoming(m:IncomingMessage,notify=true){
 const old=storedMessages();if(old.some(x=>x.id===m.id))return false;
 try{localStorage.setItem(messagesKey,JSON.stringify([...old,m]));}catch{return false}
 window.dispatchEvent(new CustomEvent('lumu:wechat-message',{detail:{message:m,notify}}));
 return true;
}
export function fireScheduled(messages:ScheduledMessage[]){
 const now=Date.now();let started=Number(localStorage.getItem(startKey));if(!started||!Number.isFinite(started)){started=now;localStorage.setItem(startKey,String(now))}
 let fired:string[]=[];try{fired=JSON.parse(localStorage.getItem(firedKey)||'[]')}catch{}
 for(const rule of messages){if(!rule?.id||!rule?.personId||!rule?.content||rule.enabled===false)continue;
  const key=String(rule.id);if(fired.includes(key))continue;
  const due=rule.trigger==='at'?Date.parse(rule.at||''):started+Math.max(0,Number(rule.delayMs??6000));
  if(!Number.isFinite(due)||now<due)continue;
  const msg:IncomingMessage={id:'scheduled-'+key,personId:rule.personId,sender:'contact',type:'text',content:rule.content,time:new Date().toISOString(),unread:true};
  if(dispatchIncoming(msg,rule.notify!==false)){fired.push(key);localStorage.setItem(firedKey,JSON.stringify(fired))}
 }
}
export function testIncoming(personId:string){const m:IncomingMessage={id:'test-'+Date.now(),personId,sender:'contact',type:'text',content:'【测试消息】这是一条用于检查微信通知的模拟信息。',time:new Date().toISOString(),unread:true};return dispatchIncoming(m,true)}
