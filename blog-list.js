/* Loads AFTER the inline script in blog.html. Redesigns the post list and adds the background. */
(function(){
const $=id=>document.getElementById(id);
const E=s=>String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const css=document.createElement('link');css.rel='stylesheet';css.href='blog-list.css';document.head.appendChild(css);
const eb=document.querySelector('header .sec-tag');
if(eb)eb.textContent='Security engineering and test automation';

/* frontmatter: strip [brackets] and "quotes" so tags and titles come out clean */
window.frontmatter=function(md){
  const meta={}, m=md.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if(m)m[1].split(/\r?\n/).forEach(line=>{
    const i=line.indexOf(':');if(i<1)return;
    const k=line.slice(0,i).trim();
    let v=line.slice(i+1).trim().replace(/^\[(.*)\]$/,'$1').replace(/^(["'])(.*)\1$/,'$2');
    if(k==='tags')v=v.replace(/["']/g,'');
    meta[k]=v;
  });
  return meta;
};

/* toolbar */
const tb=document.createElement('div');tb.id='tb';
tb.innerHTML='<div class="tb-row"><label class="srch"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg><input id="q" type="search" placeholder="Search articles" aria-label="Search articles"></label><button class="srt" id="srt"></button></div><div class="topics" id="tpx"></div><div id="cnt"></div>';
$('controls').before(tb);
view.q='';
let open=false,TAGS=[];
const sortLbl=()=>$('srt').textContent=(view.sort==='new'?'Newest first':'Oldest first')+' \u21C5';
sortLbl();

function topics(){
  const sh=TAGS.filter((t,i)=>open||i<7||t[0]===view.tag);
  $('tpx').classList.toggle('open',open);
  $('tpx').innerHTML='<button class="tp'+(view.tag?'':' on')+'" data-tag="">All<i>'+ALL.length+'</i></button>'+
    sh.map(t=>'<button class="tp'+(view.tag===t[0]?' on':'')+'" data-tag="'+E(t[0])+'">'+E(t[0])+'<i>'+t[1]+'</i></button>').join('')+
    (TAGS.length>7?'<button class="tp more" id="more">'+(open?'Show fewer':'+'+(TAGS.length-7)+' more')+'</button>':'');
}
window.buildTagbar=function(){
  const c={};ALL.forEach(p=>p.tagArr.forEach(t=>c[t]=(c[t]||0)+1));
  TAGS=Object.keys(c).sort((a,b)=>c[b]-c[a]||a.localeCompare(b)).map(t=>[t,c[t]]);
  topics();
};
$('q').oninput=e=>{view.q=e.target.value.trim();renderCards();};
$('srt').onclick=()=>{view.sort=view.sort==='new'?'old':'new';sortLbl();renderCards();};
$('tpx').onclick=e=>{
  const b=e.target.closest('button');if(!b)return;
  if(b.id==='more')open=!open;else view.tag=b.dataset.tag||null;
  topics();renderCards();
};
$('emptyMsg').onclick=e=>{
  if(!e.target.closest('#rs'))return;
  view.tag=null;view.q='';$('q').value='';topics();renderCards();
};

/* each post gets a unique packet route through the 7 layers as its cover */
function cover(s){
  let h=0;for(const ch of s)h=(h*31+ch.charCodeAt(0))>>>0;
  const L=2+h%5, y=i=>((i+.5)*100/7).toFixed(1), x=i=>(12+((h>>>(i*3))&7)*10.5).toFixed(1);
  let d='M'+x(0)+' '+y(0), dots='', ly='';
  for(let i=0;i<7;i++)ly+='M0 '+y(i)+'H100';
  for(let i=0;i<=L;i++){if(i)d+='H'+x(i)+'V'+y(i);dots+='M'+x(i)+' '+y(i)+'h0';}
  const e='M'+x(L)+' '+y(L)+'h0';
  return '<svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><path class="a" d="'+ly+'"/><path class="b" d="'+d+'"/><path class="c" d="'+dots+'"/><path class="d" d="'+e+'"/><path class="e" d="'+e+'"/></svg>';
}
const fmt=s=>{const d=new Date(s+'T00:00:00');return isNaN(d)?(s||''):d.toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'});};

window.renderCards=function(){
  const q=(view.q||'').toLowerCase();
  const list=ALL.filter(p=>(!view.tag||p.tagArr.includes(view.tag))&&
    (!q||((p.title||'')+' '+(p.summary||'')+' '+p.tagArr.join(' ')).toLowerCase().includes(q)));
  list.sort((a,b)=>(view.sort==='new'?-1:1)*(a.date||'').localeCompare(b.date||''));
  $('cnt').textContent=list.length===ALL.length?ALL.length+' articles':list.length+' of '+ALL.length+' articles';
  const wrap=$('cards'), empty=$('emptyMsg');
  if(!list.length){
    wrap.innerHTML='';empty.style.display='block';
    empty.innerHTML='No articles match. <button class="tp" id="rs">Clear filters</button>';
    return;
  }
  empty.style.display='none';
  wrap.innerHTML=list.map(p=>{
    const mins=Math.max(1,Math.round(p.raw.split(/\s+/).length/200));
    const t=p.title||p.file;
    return '<a class="card" href="#post/'+E(p.file)+'"><div class="cv">'+cover(t)+'</div><div class="cb">'+
      '<div class="date">'+fmt(p.date)+' \u00B7 '+mins+' min read</div><h3>'+E(t)+'</h3>'+
      '<p>'+E(p.summary||'')+'</p><div class="chips">'+p.tagArr.slice(0,3).map(x=>'<span>'+E(x)+'</span>').join('')+'</div></div></a>';
  }).join('');
};

/* margin notes: calm, static, one short lesson per gutter. Hover to read at full strength. */
const NOTES={
 cookie:{t:"Cookie flags",r:[["HttpOnly","Scripts cannot read it, so XSS cannot copy the session."],["Secure","Sent over HTTPS only."],["SameSite=Lax","Withheld on most cross-site requests, which blunts CSRF."],["__Host- prefix","Pins the cookie to this exact host, over HTTPS."]]},
 idor:{t:"IDOR in two requests",r:[["GET /orders/1042","Your order."],["GET /orders/1043","Someone else's. Does the server check the owner?"],["The fix","An ownership check on the server. Hard-to-guess IDs are not a fix."]]},
 authz:{t:"401 vs 403",r:[["401","Who are you? Login is missing or failed."],["403","I know who you are, and the answer is still no."],["404","Sometimes used to hide that a resource exists."]]},
 cia:{t:"The CIA triad",r:[["Confidentiality","Only the right people can read it. A leak breaks it."],["Integrity","It cannot change unnoticed. Tampering breaks it."],["Availability","It works when needed. Outages and ransomware break it."]]},
 llm:{t:"Treat model output as input",r:[["Prompt injection","Text the model reads can carry instructions."],["Output","Validate it before it reaches SQL, a shell or the browser."],["Permissions","Give tools only the access the task needs."]]},
 net:{t:"Private IPv4 ranges",r:[["10.0.0.0/8","About 16.7 million addresses."],["172.16.0.0/12","About 1 million addresses."],["192.168.0.0/16","65,536 addresses. Most home routers."],["NAT","Translates them to one public address."]]},
 test:{t:"Three checks for any test suite",r:[["Access control","Log in as user A and request user B's data."],["Input handling","Send quotes and script tags into every field."],["Sessions","After logout, is the old token rejected?"]]},
 csp:{t:"Content-Security-Policy",r:[["default-src 'self'","Load everything from your own origin unless allowed."],["script-src","Where scripts may come from. A strong second line against XSS."],["frame-ancestors 'none'","Other sites cannot frame yours, which stops clickjacking."]]}
};
const MAP={ai:'llm',llm:'llm','shadow-ai':'llm',verification:'llm','critical-thinking':'llm',workplace:'llm','data-security':'cia',privacy:'cookie','browser-security':'cookie',javascript:'cookie',secframe:'csp',networking:'net',virtualization:'net','lab-setup':'net','qa-automation':'test',testing:'test','security-automation':'test','software-development':'test',python:'test'};
const pick=tags=>{for(const t of tags)if(MAP[t])return MAP[t];return null;};
const gl=document.createElement('aside'),gr=document.createElement('aside');
gl.id='gl';gr.id='gr';gl.className=gr.className='gn';
document.body.append(gl,gr);
function put(el,id){
  if(el.dataset.id===id)return;
  el.dataset.id=id;el.classList.remove('in');
  const n=NOTES[id];
  el.innerHTML='<h4>'+n.t+'</h4>'+n.r.map(r=>'<div><code>'+r[0]+'</code><span>'+r[1]+'</span></div>').join('');
  void el.offsetWidth;el.classList.add('in');
}
function notes(){
  const h=location.hash;let r='cookie';
  if(h.indexOf('#post/')===0){
    const p=ALL.find(x=>x.file===decodeURIComponent(h.slice(6)));
    r=pick(p?p.tagArr:[])||'cia';
  }else if(view.tag)r=pick([view.tag])||'cia';
  put(gr,r);put(gl,r==='authz'?'idor':'authz');
}
const rc=window.renderCards;
window.renderCards=function(){rc();notes();};
addEventListener('hashchange',notes);
notes();
})();
