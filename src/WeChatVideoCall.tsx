import React,{useEffect,useRef,useState} from 'react';
import {Camera,CameraOff,Mic,MicOff,PhoneOff,SwitchCamera,Send,Volume2,VolumeX} from 'lucide-react';

export type VideoMessage={from:'contact'|'owner';text:string;delay:number};
export type VideoScene={
 id:string;personId:string;title?:string;enabled?:boolean;
 trigger?:'manual'|'delay'|'keyword';delayMs?:number;keyword?:string;
 mainVideo?:string;selfVideo?:string;selfMode?:'video'|'avatar'|'off';
 messages?:VideoMessage[];autoHangup?:boolean;
};
type Props={scene?:VideoScene|null;name:string;avatar?:string;incoming:boolean;onEnd:(seconds:number,answered:boolean)=>void};
export default function WeChatVideoCall({scene,name,avatar,incoming,onEnd}:Props){
 const [answered,setAnswered]=useState(!incoming);
 const [seconds,setSeconds]=useState(0);
 const [mic,setMic]=useState(true),[camera,setCamera]=useState(true),[muted,setMuted]=useState(true);
 const [notes,setNotes]=useState<Array<{id:number;from:string;text:string}>>([]);
 const [text,setText]=useState('');
 const [position,setPosition]=useState({x:0,y:0});
 const pointer=useRef<{x:number;y:number;px:number;py:number}|null>(null);
 const main=useRef<HTMLVideoElement|null>(null);
 const end=()=>onEnd(seconds,answered);
 useEffect(()=>{if(!answered)return;const t=window.setInterval(()=>setSeconds(v=>v+1),1000);return()=>window.clearInterval(t)},[answered]);
 useEffect(()=>{if(!answered)return;const timers=(scene?.messages||[]).filter(m=>m.text).map((m,i)=>window.setTimeout(()=>{
  setNotes(old=>[...old,{id:i,from:m.from,text:m.text}].slice(-5));
 },Math.max(0,Number(m.delay)||0)*1000));return()=>timers.forEach(window.clearTimeout)},[answered,scene]);
 useEffect(()=>{if(!answered||!notes.length)return;const t=window.setTimeout(()=>setNotes(v=>v.slice(1)),5500);return()=>window.clearTimeout(t)},[notes,answered]);
 const send=()=>{const v=text.trim();if(!v)return;setNotes(n=>[...n,{id:Date.now(),from:'owner',text:v}].slice(-5));setText('')};
 const clock=Math.floor(seconds/60).toString().padStart(2,'0')+':'+(seconds%60).toString().padStart(2,'0');
 const icon=avatar?<img src={avatar} alt="" className="wx-video-avatar-image"/>:<span>{name.slice(0,1)}</span>;
 if(!answered)return <div className="wx-video-call wx-video-incoming" role="dialog" aria-label="微信视频来电">
  <div className="wx-video-incoming-head"><div className="wx-video-avatar">{icon}</div><h2>{name}</h2><p>邀请你进行视频通话</p><small>等待接听…</small></div>
  <div className="wx-video-incoming-actions"><button type="button" onClick={end}><PhoneOff/>挂断</button><button type="button" className="accept" onClick={()=>setAnswered(true)}><Camera/>接听</button></div>
 </div>;
 return <div className="wx-video-call" role="dialog" aria-label="微信视频通话">
  {scene?.mainVideo?<video ref={main} className="wx-video-main" src={scene.mainVideo} autoPlay playsInline loop={!scene.autoHangup} muted={muted} onEnded={()=>{if(scene.autoHangup)end()}} onClick={()=>{setMuted(false);main.current?.play().catch(()=>{})}}/>:<div className="wx-video-empty"><div className="wx-video-avatar">{icon}</div><small>未配置通话视频</small></div>}
  <div className="wx-video-shade"/>
  <div className="wx-video-top"><b>{name}</b><span>{clock}</span></div>
  <div className="wx-video-self" style={{transform:`translate(${position.x}px,${position.y}px)`}} onPointerDown={e=>{pointer.current={x:e.clientX,y:e.clientY,px:position.x,py:position.y};e.currentTarget.setPointerCapture(e.pointerId)}} onPointerMove={e=>{if(!pointer.current)return;const p=pointer.current;setPosition({x:Math.max(-180,Math.min(50,p.px+e.clientX-p.x)),y:Math.max(-40,Math.min(360,p.py+e.clientY-p.y))})}} onPointerUp={()=>{pointer.current=null}} onPointerCancel={()=>{pointer.current=null}}>
   {camera&&scene?.selfMode==='video'&&scene.selfVideo?<video src={scene.selfVideo} autoPlay muted loop playsInline/>:camera&&scene?.selfMode==='avatar'?<div className="wx-video-self-avatar">我</div>:<div className="wx-video-self-off"><CameraOff size={18}/>摄像头已关闭</div>}
  </div>
  <div className="wx-video-notes" aria-live="polite">{notes.map(n=><div key={n.id}><b>{n.from==='owner'?'我':name}：</b>{n.text}</div>)}</div>
  <div className="wx-video-bottom"><div className="wx-video-controls">
   <button type="button" onClick={()=>setPosition({x:0,y:0})} aria-label="切换镜头"><SwitchCamera/></button>
   <button type="button" onClick={()=>setMic(v=>!v)} aria-label={mic?'关闭麦克风':'打开麦克风'}>{mic?<Mic/>:<MicOff/>}</button>
   <button type="button" onClick={()=>setCamera(v=>!v)} aria-label={camera?'关闭摄像头':'打开摄像头'}>{camera?<Camera/>:<CameraOff/>}</button>
   <button type="button" onClick={()=>{setMuted(v=>!v);main.current?.play().catch(()=>{})}} aria-label={muted?'开启声音':'静音'}>{muted?<VolumeX/>:<Volume2/>}</button>
   <button type="button" className="wx-video-end" onClick={end} aria-label="挂断"><PhoneOff/></button>
  </div><div className="wx-video-compose"><input aria-label="通话消息" placeholder="发消息…" value={text} onChange={e=>setText(e.target.value)} onKeyDown={e=>{if(e.key==='Enter')send()}}/><button type="button" onClick={send} aria-label="发送"><Send size={18}/></button></div></div>
 </div>;
}
