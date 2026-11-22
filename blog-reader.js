/* Loads AFTER the inline script in blog.html. Replaces md2html and adds the reading UI. */
(function(){
const $=id=>document.getElementById(id);
const pv=$('postView'), pb=$('postBody');
const esc=s=>s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
const inline=t=>esc(t)
  .replace(/`([^`]+)`/g,'<code>$1</code>')
  .replace(/\*\*([^*]+)\*\*/g,'<b>$1</b>')
  .replace(/\*([^*]+)\*/g,'<i>$1</i>')
  .replace(/!\[([^\]]*)\]\(([^)]+)\)/g,'<img src="$2" alt="$1" loading="lazy">')
  .replace(/\[([^\]]+)\]\(([^)]+)\)/g,'<a href="$2" target="_blank" rel="noopener">$1</a>');

/* Better markdown: a line that is only **bold** or *italic* becomes a section heading,
   plus numbered lists, blockquotes and rules. Same # -> h2 mapping as before. */
window.md2html=function(src){
  src=src.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/,'');
  let out='',code=false,buf=[],lt=null,para=[],quote=[];
  const fp=()=>{if(para.length){out+='<p>'+inline(para.join(' '))+'</p>';para=[];}};
  const fq=()=>{if(quote.length){out+='<blockquote>'+inline(quote.join(' '))+'</blockquote>';quote=[];}};
  const cl=()=>{if(lt){out+='</'+lt+'>';lt=null;}};
  const flush=()=>{fp();fq();cl();};
  const item=(tag,text)=>{fp();fq();if(lt!==tag){cl();out+='<'+tag+'>';lt=tag;}out+='<li>'+inline(text)+'</li>';};
  for(const line of src.split(/\r?\n/)){
    if(line.trim().startsWith('```')){
      if(code){out+='<pre>'+esc(buf.join('\n'))+'</pre>';buf=[];code=false;}
      else{flush();code=true;}
      continue;
    }
    if(code){buf.push(line);continue;}
    let m;
    if((m=line.match(/^(#{1,4})\s+(.*)/))){flush();const l=Math.min(m[1].length+1,5);out+='<h'+l+'>'+inline(m[2])+'</h'+l+'>';}
    else if((m=line.match(/^\s*(\*\*|\*)([^*]{3,100})\1\s*$/))){flush();out+='<h3 class="lbl">'+inline(m[2])+'</h3>';}
    else if(/^\s*([-*_]\s*){3,}$/.test(line)){flush();out+='<hr>';}
    else if((m=line.match(/^>\s?(.*)/))){fp();cl();quote.push(m[1]);}
    else if((m=line.match(/^\s*[-*]\s+(.*)/))){item('ul',m[1]);}
    else if((m=line.match(/^\s*\d+[.)]\s+(.*)/))){item('ol',m[1]);}
    else if(!line.trim()){flush();}
    else{fq();cl();para.push(line.trim());}
  }
  flush();
  return out;
};

/* reading UI */
const bar=document.createElement('div');bar.id='prog';
const pill=document.createElement('div');pill.id='pill';
document.body.append(bar,pill);
let heads=[],words=1;

function enhance(){
  if(!pb.firstElementChild)return;
  words=pb.textContent.split(/\s+/).length;
  const hs=[...pb.querySelectorAll('h2,h3')];
  heads=hs.filter(h=>h.tagName==='H2');
  if(heads.length<2)heads=hs;
  heads.forEach((h,i)=>h.id='s'+i);

  const kids=[...pb.children], first=kids.find(e=>e.tagName==='P');
  if(first&&kids.indexOf(first)<2)first.classList.add('lead');

  pb.querySelectorAll('pre').forEach(pre=>{
    const b=document.createElement('button');
    b.className='cp';b.textContent='Copy';
    b.onclick=()=>navigator.clipboard.writeText(pre.firstChild.textContent).then(()=>{
      b.textContent='Copied';setTimeout(()=>b.textContent='Copy',1500);
    });
    pre.appendChild(b);
  });

  let t=$('toc');
  if(!t){t=document.createElement('div');t.id='toc';document.body.appendChild(t);}
  t.innerHTML='<p>In this post</p><div class="rail"></div>';
  const rail=t.lastChild;
  heads.forEach(h=>{
    const a=document.createElement('a');
    a.href='#';a.textContent=h.textContent;
    a.onclick=e=>{e.preventDefault();h.scrollIntoView({behavior:'smooth'});};
    rail.appendChild(a);
  });
  const pk=document.createElement('i');pk.className='pk';rail.appendChild(pk);

  const f=decodeURIComponent(location.hash.slice(6)), i=ALL.findIndex(x=>x.file===f);
  let e=$('postEnd');
  if(!e){e=document.createElement('div');e.id='postEnd';pb.after(e);}
  const nb=(p,l)=>p?'<a class="pn" href="#post/'+p.file+'"><small>'+l+'</small>'+(p.title||p.file)+'</a>':'';
  e.innerHTML='<div class="acts"><button id="cl">Copy link</button><button id="tp">Back to top</button></div>'+
    '<div class="pns">'+nb(ALL[i-1],'Newer post')+nb(ALL[i+1],'Older post')+'</div>';
  $('cl').onclick=function(){navigator.clipboard.writeText(location.href).then(()=>{this.textContent='Link copied';});};
  $('tp').onclick=()=>scrollTo({top:0,behavior:'smooth'});
  tick();
}

function tick(){
  const on=pv.style.display==='block';
  document.body.classList.toggle('reading',on);
  if(!on)return;
  const r=pb.getBoundingClientRect(), h=innerHeight;
  const p=Math.min(1,Math.max(0,(h*.3-r.top)/Math.max(1,r.height)));
  document.documentElement.style.setProperty('--p',p.toFixed(4));
  const left=Math.ceil(words*(1-p)/200);
  pill.textContent=left>0?left+' min left':'Finished';
  let k=-1;
  heads.forEach((x,j)=>{if(x.getBoundingClientRect().top<140)k=j;});
  document.querySelectorAll('#toc a').forEach((a,j)=>a.classList.toggle('on',j===k));
}

new MutationObserver(enhance).observe(pb,{childList:true});
addEventListener('scroll',tick,{passive:true});
addEventListener('resize',tick);
addEventListener('hashchange',tick);
})();
