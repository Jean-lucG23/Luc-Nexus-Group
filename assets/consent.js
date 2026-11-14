(()=>{const K='lng_consent',G='G-21L4M4TLTL',w=window,d=document;
w.dataLayer=w.dataLayer||[];w.gtag=function(){dataLayer.push(arguments)};
let c=null;try{c=JSON.parse(localStorage.getItem(K));if(c&&Date.now()-c.t>315e8)c=null}catch(e){}
const st=a=>({analytics_storage:a?'granted':'denied',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied'});
gtag('consent','default',st(c&&c.a));
let on=false;
function load(){w['ga-disable-'+G]=false;if(on)return;on=true;const s=d.createElement('script');s.async=true;s.src='https://www.googletagmanager.com/gtag/js?id='+G;d.head.appendChild(s);gtag('js',new Date());gtag('config',G)}
function off(){w['ga-disable-'+G]=true;d.cookie.split(';').forEach(k=>{const n=k.split('=')[0].trim();if(n.indexOf('_ga')===0)['',location.hostname,'.'+location.hostname.replace(/^www\./,'')].forEach(h=>d.cookie=n+'=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/'+(h?';domain='+h:'')) })}
function save(a){try{localStorage.setItem(K,JSON.stringify({a:a,t:Date.now()}))}catch(e){}gtag('consent','update',st(a));a?load():off();const e=d.getElementById('ck');e&&e.remove()}
function ui(){if(d.getElementById('ck'))return;const e=d.createElement('div');e.id='ck';e.setAttribute('role','dialog');e.setAttribute('aria-label','Cookie consent');
e.className='fixed z-[70] bottom-4 left-4 right-4 sm:right-auto sm:max-w-md bg-navy-800 border border-cyan-500/30 rounded-2xl p-5 shadow-2xl text-sm text-slate-300';
e.innerHTML='<p class="text-white font-semibold mb-1">Cookies &amp; privacy</p><p class="mb-4">We use essential storage to run this site. With your permission we also use Google Analytics cookies to see how the site is used. Nothing analytic loads until you choose. <a class="text-cyan-400 underline" href="privacy-policy.html#cookies">Learn more</a></p><div class="flex gap-3"><button type="button" data-a="0" class="flex-1 border border-cyan-500/40 text-cyan-400 font-semibold py-2.5 rounded-xl hover:bg-navy-700">Essential only</button><button type="button" data-a="1" class="flex-1 bg-gradient-to-r from-cyan-500 to-blue-600 text-navy-900 font-bold py-2.5 rounded-xl">Accept analytics</button></div>';
e.onclick=ev=>{const b=ev.target.closest('[data-a]');b&&save(b.dataset.a==='1')};d.body.appendChild(e)}
if(c&&c.a)load();
d.addEventListener('DOMContentLoaded',()=>{if(!c)ui()});
d.addEventListener('click',e=>{if(e.target.closest('[data-cookie-settings]'))ui()});
})();
