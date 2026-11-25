/* ===== 3D helpers & materials (all instruments are built along +Y, working end up) ===== */
const T=window.THREE;
const MK={};
const DS=T.DoubleSide;
const mat=(c,m,r,o)=>new T.MeshStandardMaterial(Object.assign({color:c,metalness:m,roughness:r},o||{}));
const plastic=(c,o)=>new T.MeshPhysicalMaterial(Object.assign({color:c,metalness:0,roughness:.32,clearcoat:1,clearcoatRoughness:.18},o||{}));
const STEEL=mat(0xe6eaee,1,.17), STEELM=mat(0xc3c9cf,1,.4), STEELD=mat(0x858d96,1,.32);
const GOLD=mat(0xd8aa45,1,.22), BLK=mat(0x14181b,.1,.5), RUB=mat(0x202427,0,.85), WHT=plastic(0xf3f5f6);
const GLASS=new T.MeshPhysicalMaterial({color:0xdcefff,metalness:0,roughness:.04,transparent:true,opacity:.32,side:DS,clearcoat:1});
const MIRROR=mat(0xffffff,1,.02);
const ms=(geo,m)=>{const x=new T.Mesh(geo,m);x.castShadow=true;x.receiveShadow=true;return x;};
const V3=(a)=>new T.Vector3(a[0],a[1],a[2]||0);

function lathe(pts,m,seg){
  const p=pts.map(q=>new T.Vector2(q[0],q[1]));
  if(p[0].x>0)p.unshift(new T.Vector2(0,p[0].y));
  if(p[p.length-1].x>0)p.push(new T.Vector2(0,p[p.length-1].y));
  return ms(new T.LatheGeometry(p,seg||56),m);
}
function knurl(y0,y1,r,m,o){
  o=o||{};const amp=o.amp==null?.05:o.amp,fr=o.freq||5,pts=[];
  for(let y=y0;y<=y1+1e-6;y+=.7){
    const e=Math.min(1,(y-y0)/3,(y1-y)/3);
    const k=1-Math.pow(1-Math.max(0,e),2)*0;
    const edge=Math.min(1,Math.sqrt(Math.max(0,Math.min((y-y0)/2.4,(y1-y)/2.4))+.02));
    pts.push([r*edge*(1+amp*Math.sin(fr*y))*k,y]);
  }
  return lathe(pts,m,o.seg||40);
}
function cyl(r0,r1,h,m,seg,y){const g=new T.CylinderGeometry(r1,r0,h,seg||32);g.translate(0,h/2+(y||0),0);return ms(g,m);}
function ball(r,m,x,y,z){const b=ms(new T.SphereGeometry(r,28,20),m);b.position.set(x||0,y||0,z||0);return b;}
function box(w,h,d,m,x,y,z){const b=ms(new T.BoxGeometry(w,h,d),m);b.position.set(x||0,y||0,z||0);return b;}
function torus(R,r,m,x,y,z,seg){const t=ms(new T.TorusGeometry(R,r,16,seg||48),m);t.position.set(x||0,y||0,z||0);return t;}
function between(a,b,r0,r1,m,seg){
  const A=V3(a),B=V3(b),d=B.clone().sub(A),len=d.length();
  const g=new T.CylinderGeometry(r1,r0,len,seg||24);
  const x=ms(g,m);x.position.copy(A).add(B).multiplyScalar(.5);
  x.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),d.normalize());return x;
}
/* swept tube along a smooth path. rfn(t)->r or [a,b]; o.up -> keeps the section oriented (flat blades) */
function tube(path,rfn,m,o){
  o=o||{};const cv=new T.CatmullRomCurve3(path.map(V3),false,'centripetal');
  const N=o.n||64,S=o.seg||18,P=[],Tg=[];
  for(let i=0;i<=N;i++){P.push(cv.getPointAt(i/N));Tg.push(cv.getTangentAt(i/N));}
  const pos=[],idx=[];let pB=null;const up=o.up?V3(o.up):null;const ring=[];
  for(let i=0;i<=N;i++){
    const t=i/N,Tn=Tg[i];let B;
    if(up){B=up.clone().sub(Tn.clone().multiplyScalar(up.dot(Tn))).normalize();}
    else if(!pB){const ref=Math.abs(Tn.x)<.9?new T.Vector3(1,0,0):new T.Vector3(0,1,0);B=ref.sub(Tn.clone().multiplyScalar(ref.dot(Tn))).normalize();}
    else{B=pB.clone().sub(Tn.clone().multiplyScalar(pB.dot(Tn))).normalize();}
    pB=B;const Nn=new T.Vector3().crossVectors(B,Tn).normalize();
    const r=rfn(t),a=Array.isArray(r)?r[0]:r,b=Array.isArray(r)?r[1]:r;
    const row=[];
    if(o.profile){
      o.profile.forEach(q=>{const p=P[i].clone().addScaledVector(Nn,q[0]).addScaledVector(B,q[1]);row.push(pos.length/3);pos.push(p.x,p.y,p.z);});
    }else{
      for(let j=0;j<S;j++){
        const ph=j/S*Math.PI*2;
        let k=1;if(o.lobes)k=1+o.lobes.amp*Math.cos(o.lobes.n*ph-(o.lobes.twist||0)*t);
        const p=P[i].clone().addScaledVector(Nn,Math.cos(ph)*a*k).addScaledVector(B,Math.sin(ph)*b*k);
        row.push(pos.length/3);pos.push(p.x,p.y,p.z);
      }
    }
    ring.push(row);
  }
  const W=o.profile?o.profile.length-1:S;
  for(let i=0;i<N;i++)for(let j=0;j<W;j++){
    const a=ring[i][j],b=ring[i+1][j],c=ring[i+1][(j+1)%ring[0].length],d=ring[i][(j+1)%ring[0].length];
    idx.push(a,c,b,a,d,c);
  }
  if(!o.profile&&o.caps!==false){
    [0,N].forEach(e=>{
      const c0=pos.length/3;pos.push(P[e].x,P[e].y,P[e].z);const base=pos.length/3;
      ring[e].forEach(vi=>pos.push(pos[vi*3],pos[vi*3+1],pos[vi*3+2]));
      for(let j=0;j<S;j++){const u=base+j,v=base+(j+1)%S;if(e===0)idx.push(c0,v,u);else idx.push(c0,u,v);}
    });
  }
  const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(pos,3));g.setIndex(idx);g.computeVertexNormals();
  const x=ms(g,o.profile?m.clone():m);if(o.profile)x.material.side=DS;return x;
}
function rib(path,wfn,thk,m,o){return tube(path,t=>[thk,wfn(t)],m,Object.assign({up:[0,0,1],seg:20},o||{}));}
function flat(pts,depth,m,bev,smooth){
  let p=pts;
  if(smooth){const c=new T.CatmullRomCurve3(pts.map(q=>new T.Vector3(q[0],q[1],0)),true,'centripetal');p=c.getPoints(60).map(v=>[v.x,v.y]);}
  const sh=new T.Shape();p.forEach((q,i)=>i?sh.lineTo(q[0],q[1]):sh.moveTo(q[0],q[1]));
  const b=bev==null?.1:bev;
  const g=new T.ExtrudeGeometry(sh,{depth:depth,bevelEnabled:b>0,bevelThickness:b,bevelSize:b,bevelSegments:3,curveSegments:12});
  g.translate(0,0,-depth/2);return ms(g,m);
}
function grp(){return new T.Group();}
function at(o,x,y,z){o.position.set(x||0,y||0,z||0);return o;}

/* double-ended hand instrument: 120 long handle centred at 0, working ends start at y=±60 */
function handle(len,r,m){
  const g=grp();const h=len/2;
  g.add(knurl(-h,h,r,m||STEELM,{amp:.05,freq:4.4}));
  return g;
}
function neck(m){return lathe([[4.2,0],[3.6,2.5],[2.6,7],[1.8,13],[1.6,16]],m||STEELM,40);}
function dbl(A,B,len,r){
  const g=grp();g.add(handle(len||120,r||4.2));
  const a=A();a.position.y=(len||120)/2;g.add(a);
  if(B){const b=B();b.rotation.z=Math.PI;b.position.y=-(len||120)/2;g.add(b);}
  else{const b=A();b.rotation.z=Math.PI;b.position.y=-(len||120)/2;g.add(b);}
  return g;
}
const taper=(r0,r1)=>t=>r0+(r1-r0)*t;

/* ===== 1 mirror ===== */
MK.mirror=function(){
  const g=grp();
  g.add(knurl(0,95,4.2,STEELM,{amp:.05,freq:4.4}));
  g.add(at(lathe([[4.2,95],[3.4,98],[2.4,104],[1.8,112],[1.6,116]],STEELM,40)));
  g.add(tube([[0,112,0],[0,128,0],[0,140,0],[1.2,150,0]],taper(1.6,1.3),STEEL));
  const head=grp();
  head.add(at(ms(new T.CylinderGeometry(11.6,11.6,3.6,64),STEEL)));
  const face=ms(new T.CylinderGeometry(10.2,10.2,.5,64),MIRROR);face.position.y=1.9;head.add(face);
  head.add(torus(10.9,.9,STEEL,0,1.9,0,64).rotateX(Math.PI/2));
  head.rotation.x=0;head.position.set(1.2,160,0);
  head.rotation.z=0;head.rotation.x=Math.PI/2-.35;
  g.add(head);
  g.add(tube([[1.2,150,0],[1.2,156,0]],()=>1.3,STEEL));
  return g;
};

/* ===== 2 explorer ===== */
MK.explorer=function(){
  return dbl(function(){
    const e=grp();e.add(neck());
    e.add(tube([[0,14,0],[0,30,0],[1.8,44,0],[6,55,0],[12,60,0],[15,60.6,0]],t=>1.5*Math.pow(1-t,.9)+.18,STEEL,{n:80}));
    return e;
  },function(){
    const e=grp();e.add(neck());
    e.add(tube([[0,14,0],[0,30,0],[2.2,46,0],[4.5,58,0],[5,66,0]],t=>1.5*Math.pow(1-t,.9)+.18,STEEL,{n:80}));
    return e;
  });
};

/* ===== 3 tweezers ===== */
function tweezerArms(o){
  const g=grp();
  [-1,1].forEach(s=>{
    const arm=rib(o.path(s),t=>o.w*(1-.15*Math.abs(t-.4)),o.th,STEELM,{n:90});
    arm.position.z=s*0;g.add(arm);
  });
  return g;
}
MK.tweezers=function(){
  const g=grp();
  const path=s=>[[s*1.1,0],[s*3.2,28],[s*6,70],[s*5.6,100],[s*2.4,122],[s*.55,138],[s*.4,146]];
  g.add(tweezerArms({path,w:2.6,th:.55}));
  /* serrated grip pads */
  for(let k=0;k<10;k++){const y=16+k*3.6;[-1,1].forEach(s=>{const x=s*(2.7+y*.047)+s*.6;g.add(box(.5,.7,3.3,STEEL,x,y,0));});}
  g.add(box(5.2,5,3,STEELM,0,-2,0));
  /* angled beaks */
  [-1,1].forEach(s=>{const b=rib([[s*.45,140],[s*.4,146],[s*.4,150]],()=>1.6,.5,STEEL,{n:8});g.add(b);});
  g.rotation.z=0;return g;
};
MK.tweezers.rot=[0,0,-Math.PI/2];

/* ===== 4 perio probe ===== */
MK.probe=function(){
  return dbl(function(){
    const e=grp();e.add(neck());
    e.add(tube([[0,14,0],[0,26,0],[1.2,34,0],[4.6,40,0],[4.8,46,0],[4.8,70,0]],()=>.55,STEEL,{n:90,seg:14}));
    e.add(ball(.55,STEEL,4.8,70,0));
    [1,2,3,5,7,8,9,10].forEach(mm=>{const y=70-mm*2.2;const r=cyl(.62,.62,1.1,BLK,16,y);r.position.x=4.8;e.add(r);});
    return e;
  },function(){
    const e=grp();e.add(neck());
    e.add(tube([[0,14,0],[0,26,0],[1.2,34,0],[4.6,40,0],[4.8,46,0],[4.8,70,0]],()=>.55,STEEL,{n:90,seg:14}));
    e.add(ball(.55,STEEL,4.8,70,0));
    [3,6,9,12].forEach(mm=>{const y=70-mm*1.8;const r=cyl(.62,.62,1.3,BLK,16,y);r.position.x=4.8;e.add(r);});
    return e;
  });
};

/* ===== 5 excavator ===== */
function spoon(r,m){
  const g=grp();
  const c=ms(new T.SphereGeometry(r,28,16,0,Math.PI*2,0,Math.PI*.5),m.clone());c.material.side=DS;
  c.scale.set(1,.85,.75);g.add(c);
  g.add(torus(r,.14*r,STEEL,0,0,0,40).rotateX(Math.PI/2));
  return g;
}
MK.excavator=function(){
  return dbl(function(){
    const e=grp();e.add(neck());
    e.add(tube([[0,14,0],[0,28,0],[1.4,40,0],[4.6,49,0],[8,52,0]],t=>1.5-.35*t,STEEL,{n:70}));
    const s=spoon(2.7,STEEL);s.position.set(8.4,52.4,0);s.rotation.z=-Math.PI/2+.25;s.rotation.x=0;e.add(s);
    return e;
  },function(){
    const e=grp();e.add(neck());
    e.add(tube([[0,14,0],[0,28,0],[1.4,40,0],[4.6,49,0],[8,52,0]],t=>1.5-.35*t,STEEL,{n:70}));
    const s=spoon(1.9,STEEL);s.position.set(8.2,52.4,0);s.rotation.z=-Math.PI/2+.25;e.add(s);
    return e;
  });
};
MK.excavator.rot=[0,0,-Math.PI/2];

/* ===== 6 plugger ===== */
MK.plugger=function(){
  const mk=(r,serr)=>function(){
    const e=grp();e.add(neck());
    e.add(tube([[0,14,0],[0,30,0],[1.8,44,0],[4.6,52,0],[4.8,58,0]],t=>1.5+.15*t,STEEL,{n:70}));
    const tip=cyl(r*.9,r,5,STEEL,32,0);tip.position.set(4.8,58,0);e.add(tip);
    if(serr){for(let i=0;i<5;i++){const c=box(.3,.3,r*2,BLK,4.8+(i-2)*.55*r/1.2,63.2,0);c.visible=false;e.add(c);}
      const face=ms(new T.CylinderGeometry(r,r,.2,32),STEELD);face.position.set(4.8,63.1,0);e.add(face);}
    return e;
  };
  return dbl(mk(1.3,true),mk(2.1,true));
};
MK.plugger.rot=[0,0,-Math.PI/2];

/* ===== 7 burnisher ===== */
MK.burnisher=function(){
  return dbl(function(){
    const e=grp();e.add(neck());
    e.add(tube([[0,14,0],[0,30,0],[1.6,42,0],[5,50,0],[8,52,0]],t=>1.5-.25*t,STEEL,{n:70}));
    const b=ball(2.8,STEEL,8.6,52.2,0);e.add(b);return e;
  },function(){
    const e=grp();e.add(neck());
    e.add(tube([[0,14,0],[0,30,0],[1.6,42,0],[5,50,0],[8,52,0]],t=>1.5-.25*t,STEEL,{n:70}));
    const b=ball(2.1,STEEL,8.4,52.2,0);b.scale.set(1.9,1,1);b.rotation.z=.25;e.add(b);return e;
  });
};
MK.burnisher.rot=[0,0,-Math.PI/2];

/* ===== 8 cement spatula ===== */
MK.spatula=function(){
  const blade=(L,W)=>function(){
    const e=grp();e.add(neck());
    e.add(tube([[0,14,0],[0,22,0],[0,26,0]],()=>1.5,STEEL,{n:8}));
    e.add(rib([[0,24,0],[0,34,0],[.6,50,0],[1.2,24+L,0]],t=>{
      const w=1.4+(W-1.4)*Math.sin(Math.min(1,t*2.4)*Math.PI/2);
      return w*Math.sqrt(Math.max(0,1-Math.pow(t,7)));},.35,STEEL,{n:80}));
    return e;
  };
  return dbl(blade(46,6),blade(38,4));
};
MK.spatula.rot=[0,0,-Math.PI/2];

/* ===== 9 Tofflemire matrix retainer ===== */
MK.matrix=function(){
  const g=grp();
  /* main shaft with knurled big knob */
  g.add(knurl(-14,0,8.2,STEELM,{amp:.06,freq:4.2,seg:48}));
  g.add(cyl(5.4,5.4,34,STEELM,48,0));
  g.add(knurl(34,40,3.8,STEELM,{amp:.04,freq:5}));
  /* head */
  g.add(box(11,13,7,STEELM,0,48,0));
  g.add(box(11.4,1.6,7.4,STEEL,0,55,0));
  /* slot where band end is held */
  const slot=box(3.2,7,7.6,BLK,-1.5,49,0);g.add(slot);
  /* guide arms */
  g.add(box(2.2,10,5,STEEL,6.6,49,0));
  /* side spindle with small knob */
  const sp=cyl(1.6,1.6,22,STEEL,24,0);sp.rotation.z=-Math.PI/2;sp.position.set(7,22,0);g.add(sp);
  const kn=knurl(0,8,4.4,STEELM,{amp:.06,freq:4});kn.rotation.z=-Math.PI/2;kn.position.set(25,22,0);g.add(kn);
  /* matrix band loop */
  const band=ms(new T.CylinderGeometry(8.2,8.2,7,56,1,true),STEELM.clone());band.material.side=DS;band.material.color.set(0xd9dde1);
  band.scale.set(1,1,.78);band.position.set(-2,64,0);band.rotation.x=0;g.add(band);
  /* band tail going into the slot */
  g.add(rib([[-9,64,0],[-8,58,0],[-3,54,0],[-1.5,50,0]],()=>3.2,.15,STEELM,{n:20}));
  return g;
};
MK.matrix.rot=[0,0,-Math.PI/2+.5];

/* ===== 10 articulating paper forceps (Miller) ===== */
MK.articulating=function(){
  const g=grp();
  const path=s=>[[s*1.2,0],[s*4,26],[s*8,62],[s*9,88],[s*7,110],[s*3.6,124],[s*1.6,132]];
  g.add(tweezerArms({path,w:3.2,th:.6}));
  g.add(box(5.4,5.5,3.6,STEELM,0,-1,0));
  [-1,1].forEach(s=>{
    g.add(rib([[s*1.6,128],[s*1.2,134],[s*1.2,140]],()=>4,.55,STEEL,{n:8}));
  });
  /* paper strip held between the beaks (blue) */
  const strip=box(.18,22,9,mat(0x2e56d6,0,.7),0,142,0);g.add(strip);
  return g;
};
MK.articulating.rot=[0,0,-Math.PI/2];
