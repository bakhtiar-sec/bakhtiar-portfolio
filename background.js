(function(){
  var BLOG=document.body.classList.contains('blog'),cv=document.getElementById('bg'),cx=cv.getContext('2d'),chip=document.getElementById('chip');
  var RM=matchMedia('(prefers-reduced-motion: reduce)').matches;
  var cs=getComputedStyle(document.documentElement);
  var C={node:cs.getPropertyValue('--node').trim(),line:cs.getPropertyValue('--line').trim(),acc:cs.getPropertyValue('--accent').trim(),mut:cs.getPropertyValue('--muted').trim(),txt:cs.getPropertyValue('--text').trim(),bad:cs.getPropertyValue('--bad').trim()};
  var names=['Your browser','Home router','ISP router','CDN edge','Firewall','Load balancer','Web app'];
  var TTL=[64,63,62,62,62,62,62];
  var CAP=['Looks up the address with DNS, then sends the request down the layers, 7 to 1, ending as bits on the wire.','Swaps the layer 2 frame, rewrites your private address (NAT) and lowers TTL by one.','Reads only the layer 3 header to pick the next hop and lowers TTL by one, so a lost packet can’t loop forever.','Often ends TLS here and serves a cached copy, so your request travels less far.','Checks the packet against its rules. Allowed traffic passes and the rest is dropped.','Picks one of several healthy servers.','Turns the bits back into a frame, peels the layers off from 1 up to 7, then reads the request.'];
  var P=[[.58,.2],[.72,.31],[.63,.45],[.82,.52],[.7,.67],[.87,.79],[.75,.91]];
  var N=[],s=11,W,H,D,t=0,last=0,hop=-1,HB=0;
  function r(){s=(s*16807)%2147483647;return s/2147483647;}
  for(var i=0;i<38;i++)N.push([r(),r()]);
  function size(){D=Math.min(devicePixelRatio||1,2);W=innerWidth;H=innerHeight;cv.width=W*D;cv.height=H*D;cx.setTransform(D,0,0,D,0,0);HB=rot?rot.getBoundingClientRect().bottom+scrollY:0;}
  function px(p){return [p[0]*W,p[1]*H];}
  function text(h){if(!chip)return;chip.innerHTML='Hop '+(h+1)+' of 7, <b>'+names[h]+'</b>. '+CAP[h];}
  var RN=['Firewall','Login and MFA','Input checks','Encryption'],MSG=['Port scan blocked at the firewall.','Stolen password stopped by MFA.','SQL injection rejected by input checks.','Stolen data is useless without the key.'],EV=[0,1,-1,2,3,-1],AN=[2.0,3.2,4.1,2.6,3.6,4.5];
  function shield(){
    if(W<900||BLOG)return;
    var k0=Math.min(1.05,H/760,(H-50-HB)/212);
    if(k0<.5)return;
    var R=[40,62,84,106].map(function(v){return v*k0;}),cr=17*k0,x0=Math.max(150,W*.19),y0=H-30-106*k0;
    var u=RM?6.2:performance.now()/1000,L=3.4,ei=Math.floor(u/L)%EV.length,p=(u%L)/L,ev=EV[ei],ang=AN[ei],g=p<.62?p/.62:1,res=p>=.62,tr=ev<0?cr:R[ev]+3;
    cx.save();
    for(var i=3;i>=0;i--){
      var hit=res&&ev===i,a=hit?Math.max(0,1-(p-.62)/.38):0;
      cx.beginPath();cx.arc(x0,y0,R[i],0,7);cx.lineWidth=1.2+a*2.5;cx.strokeStyle=hit?C.bad:C.node;cx.globalAlpha=hit?.6+a*.4:.6;cx.stroke();
      cx.globalAlpha=1;cx.fillStyle=C.mut;cx.font='10px system-ui,sans-serif';cx.fillText(String(i+1),x0-3,y0-R[i]+12);
    }
    var pulse=res&&ev<0;
    cx.globalAlpha=pulse?.9:.35;cx.fillStyle=pulse?C.acc:C.node;cx.beginPath();cx.arc(x0,y0,cr*(pulse?1+.12*Math.sin(p*30):1),0,7);cx.fill();
    cx.globalAlpha=1;cx.fillStyle=pulse?'#14100a':C.txt;cx.font='10px system-ui,sans-serif';cx.textAlign='center';cx.fillText('data',x0,y0+3);cx.textAlign='left';
    var Rs=R[3]+46*k0,r=Rs-(Rs-tr)*g,dx=x0+Math.cos(ang)*r,dy=y0+Math.sin(ang)*r,col=ev<0?C.acc:C.bad;
    if(!res){cx.shadowColor=col;cx.shadowBlur=10;cx.fillStyle=col;cx.beginPath();cx.arc(dx,dy,4,0,7);cx.fill();cx.shadowBlur=0;}
    else if(ev>=0){cx.strokeStyle=C.bad;cx.lineWidth=2;cx.beginPath();cx.moveTo(dx-5,dy-5);cx.lineTo(dx+5,dy+5);cx.moveTo(dx+5,dy-5);cx.lineTo(dx-5,dy+5);cx.stroke();}
    var lx=x0+R[3]+22,ty=y0-58;
    cx.fillStyle=C.txt;cx.font='600 12px system-ui,sans-serif';cx.fillText('Defense in depth',lx,ty);
    cx.fillStyle=C.mut;cx.font='11px system-ui,sans-serif';
    for(var j=0;j<4;j++)cx.fillText((j+1)+'  '+RN[j],lx,ty+18+j*16);
    cx.fillStyle=res?(ev<0?C.acc:C.bad):C.mut;
    cx.fillText(res?(ev<0?'A real user passes every layer.':MSG[ev]):(ev<0?'A real user is coming in...':'An attacker is coming in...'),lx,ty+94);
    cx.fillStyle=C.mut;cx.fillText('What one layer misses, the next one catches.',lx,ty+112);
    cx.restore();
  }
  function draw(){
    cx.clearRect(0,0,W,H);
    cx.lineWidth=1;cx.strokeStyle=C.line;cx.globalAlpha=.7;
    for(var i=0;i<N.length;i++)for(var j=i+1;j<N.length;j++){
      var a=px(N[i]),b=px(N[j]),d=Math.hypot(a[0]-b[0],a[1]-b[1]);
      if(d<Math.min(W,H)*.26){cx.beginPath();cx.moveTo(a[0],a[1]);cx.lineTo(b[0],b[1]);cx.stroke();}
    }
    cx.globalAlpha=.8;cx.fillStyle=C.node;
    N.forEach(function(n){var a=px(n);cx.beginPath();cx.arc(a[0],a[1],2,0,7);cx.fill();});
    cx.globalAlpha=1;cx.strokeStyle=C.node;cx.lineWidth=1.5;cx.beginPath();
    P.forEach(function(p,i){var a=px(p);i?cx.lineTo(a[0],a[1]):cx.moveTo(a[0],a[1]);});cx.stroke();
    var seg=Math.min(Math.floor(t),6),f=Math.min(t-seg,1);
    P.forEach(function(p,i){
      var a=px(p),on=i<=t;
      cx.fillStyle=on?C.acc:C.node;cx.beginPath();cx.arc(a[0],a[1],on?5:4,0,7);cx.fill();
      if(W>700&&!BLOG){cx.fillStyle=C.mut;cx.font='12px system-ui,sans-serif';cx.fillText(names[i],a[0]+10,a[1]+4);}
    });
    if(seg<6){
      var a=px(P[seg]),b=px(P[seg+1]),e=f<.5?2*f*f:1-Math.pow(-2*f+2,2)/2;
      var x=a[0]+(b[0]-a[0])*e,y=a[1]+(b[1]-a[1])*e;
      cx.strokeStyle=C.acc;cx.lineWidth=2.5;cx.beginPath();cx.moveTo(a[0],a[1]);cx.lineTo(x,y);cx.stroke();
      cx.shadowColor=C.acc;cx.shadowBlur=16;cx.fillStyle=C.acc;
      cx.fillRect(x-6,y-4,12,8);cx.shadowBlur=0;
    }
    var hh=Math.min(Math.round(t),6),p0=px(P[0]),dn=[p0[0]-W*.1,p0[1]-H*.09];
    cx.save();cx.setLineDash([4,5]);cx.strokeStyle=C.node;cx.lineWidth=1;cx.beginPath();cx.moveTo(p0[0],p0[1]);cx.lineTo(dn[0],dn[1]);cx.stroke();cx.restore();
    cx.fillStyle=C.node;cx.beginPath();cx.arc(dn[0],dn[1],4,0,7);cx.fill();
    if(W>700&&!BLOG){cx.fillStyle=C.mut;cx.font='12px system-ui,sans-serif';cx.fillText('DNS',dn[0]-30,dn[1]+4);}
    if(t<1){var q2=t<.5?t*2:2-t*2;cx.fillStyle=C.acc;cx.beginPath();cx.arc(p0[0]+(dn[0]-p0[0])*q2,p0[1]+(dn[1]-p0[1])*q2,3,0,7);cx.fill();}
    if(t>3.2&&t<4.7){var fw=px(P[4]),g=Math.min((t-3.2)/.9,1),gx=fw[0]-90*(1-g),gy=fw[1]-70*(1-g);
      cx.globalAlpha=t>4.1?Math.max(0,1-(t-4.1)/.6):.9;cx.fillStyle=C.mut;cx.fillRect(gx-6,gy-4,12,8);
      if(g>=1){cx.strokeStyle=C.mut;cx.lineWidth=2;cx.beginPath();cx.moveTo(fw[0]-9,fw[1]-9);cx.lineTo(fw[0]+9,fw[1]+9);cx.moveTo(fw[0]+9,fw[1]-9);cx.lineTo(fw[0]-9,fw[1]+9);cx.stroke();}
      cx.globalAlpha=1;}
    if(W>700&&!BLOG){
      var sg=Math.min(seg,6),A=px(P[sg]),B2=px(P[Math.min(sg+1,6)]),ff=seg<6?(f<.5?2*f*f:1-Math.pow(-2*f+2,2)/2):0;
      var qx=A[0]+(B2[0]-A[0])*ff,qy=A[1]+(B2[1]-A[1])*ff;
      var n=t<1?Math.ceil(t*7):(t>6.1?7-Math.floor((t-6.1)/1.5*7):7);n=Math.max(0,Math.min(7,n));
      var bits='';for(var i2=0;i2<9;i2++)bits+=((Math.floor(t*10)+i2*7)%5<2?'1':'0')+' ';var lab=['L7 HTTP','L6 TLS','L5 session, no header here','L4 TCP','L3 IP, TTL '+TTL[hh],'L2 Ethernet','L1 '+bits],bx=Math.min(qx+18,W-172),by=Math.max(Math.min(qy-104,H-180),84);
      if(n){cx.fillStyle=C.mut;cx.font='10px system-ui,sans-serif';cx.fillText('Inside the packet',bx,by-5);}
      for(var k=0;k<n;k++){
        var yy=by+k*14,fl=(k===5&&t>1&&t<6&&(t%1)<.25);
        if(k===2){cx.save();cx.setLineDash([3,3]);cx.strokeStyle=C.node;cx.lineWidth=1;cx.strokeRect(bx+.5,yy+.5,149,11);cx.restore();}else{cx.globalAlpha=fl?1:(k===6?.85:.45);cx.fillStyle=(fl||k===6)?C.acc:C.node;cx.fillRect(bx,yy,150,12);}
        cx.globalAlpha=1;cx.fillStyle=(fl||k===6)?'#14100a':C.txt;cx.font='10px system-ui,sans-serif';cx.fillText(lab[k],bx+6,yy+9);
      }
    }
    shield();
    var h=hh;if(h!==hop){hop=h;text(h);}
  }
  function frame(ts){
    var dt=Math.min((ts-last)/1000,.1);last=ts;
    t+=dt*(BLOG?.15:.3);if(t>7.6)t=0;
    draw();requestAnimationFrame(frame);
  }
  var rot=document.getElementById('rot'),PR=['A lock you never test is just jewelry.','Every input is a stranger. Check its ID before it comes in.','Most attackers don’t break in. They log in.','A secret in the repo is a gift to strangers.','The test you skip is the bug someone else finds.','Security isn’t a feature you ship. It’s a habit you keep.'],pi=0;
  if(rot)rot.textContent=PR[0];
  if(rot&&!RM)setInterval(function(){rot.style.opacity=0;setTimeout(function(){pi=(pi+1)%PR.length;rot.textContent=PR[pi];rot.style.opacity=1;},500);},5500);
  size();addEventListener('load',function(){size();draw();});addEventListener('resize',function(){size();draw();});
  if(RM){t=3;draw();}else requestAnimationFrame(frame);
})();
