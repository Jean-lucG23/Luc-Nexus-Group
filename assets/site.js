(()=>{
const d=document,$=(s,c=d)=>c.querySelector(s),$$=(s,c=d)=>[...c.querySelectorAll(s)];
const rm=matchMedia('(prefers-reduced-motion: reduce)').matches;
const fine=matchMedia('(hover: hover) and (pointer: fine)').matches;
const mb=$('#mobile-menu-button'),mm=$('#mobile-menu');
mb&&mb.addEventListener('click',()=>{const o=mm.classList.toggle('hidden');mb.setAttribute('aria-expanded',String(!o))});
const y=$('#current-year');y&&(y.textContent=new Date().getFullYear());

/* scroll direction (+1 down, -1 up) */
let dir=0,lastY=scrollY;

/* 3D scroll reveal: animates in on the way down AND on the way back up */
const setSide=(el,up)=>{if(el.classList.contains('from-top')===up)return;const t=el.style.transition;el.style.transition='none';el.classList.toggle('from-top',up);void el.offsetWidth;el.style.transition=t};
const enter=new IntersectionObserver(es=>es.forEach(e=>{if(!e.isIntersecting)return;const el=e.target;setSide(el,dir<0);if(el.classList.contains('rst')){el.classList.remove('rst');void el.offsetWidth}el.classList.add('in')}),{threshold:.12,rootMargin:'0px 0px -40px 0px'});
const leave=new IntersectionObserver(es=>es.forEach(e=>{if(!e.isIntersecting){e.target.classList.remove('in');e.target.classList.add('rst')}}),{threshold:0});
$$('.reveal').forEach(el=>{if(rm){el.classList.add('in');return}enter.observe(el);leave.observe(el)});

/* animated counters: count 0 -> target every time they scroll into view; all share one duration so they finish together */
const CDUR=1800;
const cStart=el=>{const n=+el.dataset.count,s=el.dataset.suffix||'',id=(el._c=(el._c||0)+1);el._on=true;
if(rm){el.textContent=n+s;return}
const t0=performance.now();(function f(t){if(el._c!==id)return;const p=Math.min((t-t0)/CDUR,1);el.textContent=Math.round(n*p)+s;if(p<1)requestAnimationFrame(f)})(t0)};
const cReset=el=>{el._c=(el._c||0)+1;el._on=false;el.textContent='0'+(el.dataset.suffix||'')};
const cin=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting&&!e.target._on)cStart(e.target)}),{threshold:.6});
const cout=new IntersectionObserver(es=>es.forEach(e=>{if(!e.isIntersecting&&e.target._on)cReset(e.target)}),{threshold:0});
$$('[data-count]').forEach(el=>{cin.observe(el);cout.observe(el)});

/* ambient depth layer: perspective grid floor + parallax glows */
let bg=null;
if(!rm){bg=d.createElement('div');bg.id='depth-bg';bg.setAttribute('aria-hidden','true');bg.innerHTML='<div class="floor"></div><i class="orb o1"></i><i class="orb o2"></i><i class="orb o3"></i>';d.body.appendChild(bg)}

/* card tilt (pointer devices only) */
if(!rm&&fine){$$('article.reveal,a.reveal.group,.glow-effect.reveal,[data-glow]').forEach(el=>{
const big=el.offsetWidth>700,ax=big?4:10,ay=big?3:8;el.classList.add('tilt');
el.addEventListener('pointermove',ev=>{if(!el.classList.contains('in'))return;const r=el.getBoundingClientRect(),px=(ev.clientX-r.left)/r.width,py=(ev.clientY-r.top)/r.height;
el.classList.add('tilting');el.style.setProperty('--ry',((px-.5)*ax).toFixed(2)+'deg');el.style.setProperty('--rx',((.5-py)*ay).toFixed(2)+'deg');el.style.setProperty('--mx',(px*100).toFixed(1)+'%');el.style.setProperty('--my',(py*100).toFixed(1)+'%')});
el.addEventListener('pointerleave',()=>{el.classList.remove('tilting');el.style.setProperty('--rx','0deg');el.style.setProperty('--ry','0deg')})})}

/* sections drift through depth while scrolling (not the contact form) */
const secs=$$('main section, body > section').filter((s,i,a)=>a.indexOf(s)===i&&s.id!=='contact');
const hero=secs[0],heroIn=hero&&hero.firstElementChild&&hero.querySelector(':scope > div.relative');


/* hero: pointer-driven 3D tilt on the orbit graphic, recede on scroll */
const par=$$('[data-parallax]');let px=0,py=0,tx=0,ty=0,busy=false,lastTr='';
if(!rm&&fine)addEventListener('pointermove',e=>{tx=e.clientX/innerWidth*2-1;ty=e.clientY/innerHeight*2-1;request()},{passive:true});

/* services: slim chip rail follows the section being read */
const ch=$$('.chip'),rail=ch[0]&&ch[0].parentElement;
if(rail)rail.classList.add('chip-rail');
function followChip(c){if(!rail||!c)return;const rr=rail.getBoundingClientRect(),cr=c.getBoundingClientRect();
const left=cr.left-rr.left+rail.scrollLeft-(rail.clientWidth-cr.width)/2;rail.scrollTo({left:Math.max(0,left),behavior:rm?'auto':'smooth'})}

/* progress bar, header shadow, timeline fill + all scroll-linked depth */
const bar=$('#progress'),hd=$('header'),tl=$('#tl-fill');
function request(){if(!busy){busy=true;requestAnimationFrame(frame)}}
function frame(){busy=false;
const h=d.documentElement,sc=h.scrollTop,max=h.scrollHeight-h.clientHeight,vh=innerHeight;
if(bar)bar.style.width=(max>0?sc/max*100:0)+'%';
if(hd)hd.classList.toggle('shadow-lg',sc>10);
if(!rm){
px+=(tx-px)*.12;ty!==py&&(py+=(ty-py)*.12);
const tr='perspective(900px) rotateX('+(-py*6).toFixed(2)+'deg) rotateY('+(px*9).toFixed(2)+'deg)';if(tr!==lastTr){lastTr=tr;par.forEach(el=>el.style.transform=tr)}
if(Math.abs(tx-px)>.002||Math.abs(ty-py)>.002)request();


}
if(tl){const r=tl.parentElement.getBoundingClientRect(),p=Math.min(Math.max((innerHeight*.6-r.top)/r.height,0),1);tl.style.height=p*100+'%'}}
addEventListener('scroll',()=>{const n=scrollY;if(n!==lastY){dir=n>lastY?1:-1;lastY=n}request()},{passive:true});addEventListener('resize',request);frame();

/* tabs */
$$('[data-tabs]').forEach(g=>{const bs=$$('[data-tab]',g),ps=$$('[data-panel]',g);
bs.forEach(b=>b.addEventListener('click',()=>{bs.forEach(x=>x.setAttribute('aria-selected',String(x===b)));ps.forEach(p=>{const on=p.dataset.panel===b.dataset.tab;p.classList.toggle('hidden',!on);if(on){p.classList.remove('pop');void p.offsetWidth;p.classList.add('pop')}})}))});
/* service finder */
const fr=$('#find-result'),fb=$$('[data-find]'),rs=$('#find-reset'),dflt=fr&&fr.innerHTML;
rs&&rs.addEventListener('click',()=>{fb.forEach(x=>x.setAttribute('aria-selected','false'));fr.innerHTML=dflt;fr.classList.remove('pop');rs.classList.add('hidden')});
fb.forEach(b=>b.addEventListener('click',()=>{fb.forEach(x=>x.setAttribute('aria-selected',String(x===b)));
const bt='inline-flex items-center justify-center h-11 w-full sm:w-40 rounded-full text-sm font-semibold whitespace-nowrap transition-opacity ';
fr.innerHTML='<div class="flex flex-col sm:flex-row items-center gap-6 w-full text-center sm:text-left"><div class="w-16 h-16 shrink-0 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center text-3xl"><i class="fa-solid '+b.dataset.i+'"></i></div><div class="flex-1 min-w-0"><p class="text-xs uppercase tracking-widest text-cyan-400 mb-1">We suggest</p><h3 class="text-xl sm:text-2xl font-bold text-white leading-snug">'+b.dataset.t+'</h3></div><div class="flex flex-col sm:flex-row gap-3 w-full sm:w-auto shrink-0"><a href="services.html#'+b.dataset.id+'" class="'+bt+'border border-cyan-500/40 text-cyan-400 hover:bg-navy-700">View service</a><a href="contact.html?service='+encodeURIComponent(b.dataset.t)+'" class="'+bt+'bg-gradient-to-r from-cyan-500 to-blue-600 text-navy-900 font-bold hover:opacity-90">Enquire Now</a></div></div>';
fr.classList.remove('pop');void fr.offsetWidth;fr.classList.add('pop');rs&&rs.classList.remove('hidden')}));
/* services scroll-spy (also slides the chip rail to keep the active chip in view; the last service scrolls it fully right) */
if(ch.length){const so=new IntersectionObserver(es=>es.forEach(e=>{if(!e.isIntersecting)return;let act=null;ch.forEach(c=>{const on=c.getAttribute('href')==='#'+e.target.id;c.setAttribute('aria-current',String(on));if(on)act=c});followChip(act)}),{rootMargin:'-40% 0px -55% 0px'});$$('article[id]').forEach(a=>so.observe(a))}
})();
