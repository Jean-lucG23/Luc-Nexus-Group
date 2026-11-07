(()=>{
const d=document,$=(s,c=d)=>c.querySelector(s),$$=(s,c=d)=>[...c.querySelectorAll(s)];
const rm=matchMedia('(prefers-reduced-motion: reduce)').matches;
const mb=$('#mobile-menu-button'),mm=$('#mobile-menu');
mb&&mb.addEventListener('click',()=>{const o=mm.classList.toggle('hidden');mb.setAttribute('aria-expanded',String(!o))});
const y=$('#current-year');y&&(y.textContent=new Date().getFullYear());
/* scroll reveal */
const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}}),{threshold:.15,rootMargin:'0px 0px -40px 0px'});
$$('.reveal').forEach(el=>rm?el.classList.add('in'):io.observe(el));
/* animated counters */
const cio=new IntersectionObserver(es=>es.forEach(e=>{if(!e.isIntersecting)return;cio.unobserve(e.target);const el=e.target,n=+el.dataset.count,s=el.dataset.suffix||'';if(rm){el.textContent=n+s;return}const t0=performance.now();(function f(t){const p=Math.min((t-t0)/1600,1);el.textContent=Math.round(n*(1-Math.pow(1-p,3)))+s;if(p<1)requestAnimationFrame(f)})(t0)}),{threshold:.6});
$$('[data-count]').forEach(el=>cio.observe(el));
/* progress bar, header shadow, parallax, timeline fill */
const bar=$('#progress'),hd=$('header'),par=$$('[data-parallax]'),tl=$('#tl-fill');
function onScroll(){const h=d.documentElement,sc=h.scrollTop,max=h.scrollHeight-h.clientHeight;
if(bar)bar.style.width=(max>0?sc/max*100:0)+'%';
if(hd)hd.classList.toggle('shadow-lg',sc>10);
if(!rm)par.forEach(el=>el.style.transform='translateY('+Math.min(sc,600)*.06+'px)');
if(tl){const r=tl.parentElement.getBoundingClientRect(),p=Math.min(Math.max((innerHeight*.6-r.top)/r.height,0),1);tl.style.height=p*100+'%'}}
addEventListener('scroll',onScroll,{passive:true});onScroll();
/* tabs */
$$('[data-tabs]').forEach(g=>{const bs=$$('[data-tab]',g),ps=$$('[data-panel]',g);
bs.forEach(b=>b.addEventListener('click',()=>{bs.forEach(x=>x.setAttribute('aria-selected',String(x===b)));ps.forEach(p=>{const on=p.dataset.panel===b.dataset.tab;p.classList.toggle('hidden',!on);if(on){p.classList.remove('pop');void p.offsetWidth;p.classList.add('pop')}})}))});
/* service finder */
const fr=$('#find-result'),fb=$$('[data-find]');
fb.forEach(b=>b.addEventListener('click',()=>{fb.forEach(x=>x.setAttribute('aria-selected',String(x===b)));
const bt='inline-flex items-center justify-center h-11 w-full sm:w-40 rounded-full text-sm font-semibold whitespace-nowrap transition-opacity ';
fr.innerHTML='<div class="flex flex-col sm:flex-row items-center gap-6 w-full text-center sm:text-left"><div class="w-16 h-16 shrink-0 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center text-3xl"><i class="fa-solid '+b.dataset.i+'"></i></div><div class="flex-1 min-w-0"><p class="text-xs uppercase tracking-widest text-cyan-400 mb-1">We suggest</p><h3 class="text-xl sm:text-2xl font-bold text-white leading-snug">'+b.dataset.t+'</h3></div><div class="flex flex-col sm:flex-row gap-3 w-full sm:w-auto shrink-0"><a href="services.html#'+b.dataset.id+'" class="'+bt+'border border-cyan-500/40 text-cyan-400 hover:bg-navy-700">View service</a><a href="contact.html?service='+encodeURIComponent(b.dataset.t)+'" class="'+bt+'bg-gradient-to-r from-cyan-500 to-blue-600 text-navy-900 font-bold hover:opacity-90">Enquire Now</a></div></div>';
fr.classList.remove('pop');void fr.offsetWidth;fr.classList.add('pop')}));
/* services scroll-spy */
const ch=$$('.chip');if(ch.length){const so=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting)ch.forEach(c=>c.setAttribute('aria-current',String(c.getAttribute('href')==='#'+e.target.id)))}),{rootMargin:'-40% 0px -55% 0px'});$$('article[id]').forEach(a=>so.observe(a))}
})();
