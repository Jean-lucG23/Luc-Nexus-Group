(()=>{const d=document,T0=Date.now(),EP='send-confirmation.php',q=s=>d.querySelector(s);
let tp;const tok=()=>tp||(tp=fetch(EP+'?token=1',{cache:'no-store'}).then(r=>r.json()).catch(()=>null));tok();
d.querySelectorAll('form[data-lead]').forEach(f=>{
const hp=d.createElement('input');hp.type='text';hp.name='_gotcha';hp.tabIndex=-1;hp.autocomplete='off';hp.setAttribute('aria-hidden','true');hp.style.cssText='position:absolute;left:-9999px;height:0;opacity:0';f.appendChild(hp);
const box=f.parentElement,ok=box.querySelector('[data-ok]'),er=box.querySelector('[data-err]'),b=f.querySelector('[type=submit]'),lab=b.innerHTML,def=er.textContent;
const fail=m=>{er.textContent=m||def;er.classList.remove('hidden')};
f.addEventListener('submit',async e=>{e.preventDefault();ok.classList.add('hidden');er.classList.add('hidden');
const msg=(f.elements.message&&f.elements.message.value)||'',now=Date.now();
if(hp.value||now-T0<3000)return fail('Please take a moment to complete the form, then try again.');
if((msg.match(/https?:\/\/|www\./gi)||[]).length>2)return fail('Please remove extra links from your message.');
let last=0;try{last=+localStorage.getItem('lng_last')||0}catch(_){}
if(now-last<60000)return fail('Please wait a minute before sending another request.');
b.disabled=true;b.innerHTML='<i class="fa-solid fa-spinner fa-spin"></i> Sending...';
const fd=new FormData(f);
try{const r=await fetch(f.action,{method:'POST',body:fd,headers:{Accept:'application/json'}});
if(r.ok){ok.classList.remove('hidden');try{localStorage.setItem('lng_last',now)}catch(_){}sendConf(fd,f);f.reset()}else fail()}catch(_){fail()}
b.disabled=f.hasAttribute('data-needslot')&&!(f.elements.slot_utc&&f.elements.slot_utc.value);b.innerHTML=lab})});
async function sendConf(fd,f){try{const cs=f&&f.querySelector('#country-select'),cn=cs&&cs.value?(cs.options[cs.selectedIndex]||{}).text.replace(/\s*\(\+\d+\)\s*$/,''):'',t=await tok(),p=new FormData();tp=null;
['name','email','country_code','phone','service_required','message','preferred_slot','_gotcha'].forEach(k=>p.append(k,fd.get(k)||''));
p.append('country_name',cn);
if(t){p.append('t',t.t);p.append('s',t.s)}await fetch(EP,{method:'POST',body:p})}catch(_){}tok()}
/* booking calendar: next 10 weekdays, 30-min slots 09:00-16:30 SAST (UTC+2) */
const D=q('#days'),S=q('#slots');if(D&&S){const bf=q('#booking-form'),pk=q('#picked'),sb=bf.querySelector('[type=submit]'),days=[];
const n=new Date(Date.now()+72e5);let c=new Date(Date.UTC(n.getUTCFullYear(),n.getUTCMonth(),n.getUTCDate())),di=0,sel=null;
while(days.length<10){c=new Date(c.getTime()+864e5);const w=c.getUTCDay();if(w>0&&w<6)days.push(c)}
const cls='tab shrink-0 whitespace-nowrap px-4 py-2.5 rounded-full border border-navy-600 bg-navy-800 text-slate-300 text-sm font-medium hover:border-cyan-500/60 transition-colors';
const sf=(ts,tz)=>new Intl.DateTimeFormat('en-ZA',{weekday:'long',day:'numeric',month:'long',year:'numeric',hour:'2-digit',minute:'2-digit',hour12:false,timeZone:tz}).format(new Date(ts));
function drawD(){D.innerHTML='';days.forEach((x,i)=>{const b=d.createElement('button');b.type='button';b.className=cls;b.setAttribute('aria-selected',String(i===di));b.textContent=x.toLocaleDateString('en-ZA',{weekday:'short',day:'numeric',month:'short',timeZone:'UTC'});b.onclick=()=>{di=i;drawD();drawS()};D.appendChild(b)})}
function drawS(){S.innerHTML='';const x=days[di];for(let h=9;h<17;h++)[0,30].forEach(m=>{const ts=Date.UTC(x.getUTCFullYear(),x.getUTCMonth(),x.getUTCDate(),h-2,m),b=d.createElement('button');b.type='button';b.className=cls;b.setAttribute('aria-selected',String(ts===sel));b.textContent=String(h).padStart(2,'0')+':'+String(m).padStart(2,'0');b.onclick=()=>pick(ts);S.appendChild(b)})}
function pick(ts){sel=ts;bf.elements.slot_utc.value=new Date(ts).toISOString();const tz=Intl.DateTimeFormat().resolvedOptions().timeZone;let t=sf(ts,'Africa/Johannesburg')+' SAST';if(tz&&tz!=='Africa/Johannesburg')t+=' (your time: '+sf(ts,tz)+', '+tz+')';bf.elements.preferred_slot.value=t;pk.textContent='Selected: '+t;sb.disabled=false;drawS()}
bf.addEventListener('reset',()=>{sel=null;pk.textContent='';bf.elements.slot_utc.value='';bf.elements.preferred_slot.value='';sb.disabled=true;setTimeout(drawS)});drawD();drawS()}
})();
