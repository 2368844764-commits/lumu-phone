const BASE='https://gxgfjwqdffehakciokkk.supabase.co';
const KEY='sb_publishable_u1S0hNnTeoG26DvxrtUbvQ_-NekcL-v';
const STORAGE='lumu-anonymous-visitor-v1';
function visitorId():string {
  try {
    const existing=localStorage.getItem(STORAGE);
    if(existing&&/^[0-9a-f-]{36}$/i.test(existing))return existing;
    const value=crypto.randomUUID();
    localStorage.setItem(STORAGE,value);
    return value;
  }catch{return crypto.randomUUID()}
}
export function trackGameEvent(eventName:string){
  if(!/^(visit|unlock|home|app_[a-z0-9]{1,20})$/.test(eventName))return;
  if(new URLSearchParams(location.search).has('preview'))return;
  try{void fetch(BASE+'/rest/v1/rpc/lumu_track_event',{method:'POST',headers:{apikey:KEY,'Content-Type':'application/json'},body:JSON.stringify({p_visitor:visitorId(),p_event:eventName}),keepalive:true}).catch(()=>{})}catch{}
}
