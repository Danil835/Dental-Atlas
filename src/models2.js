/* ===== endodontics ===== */
function endoHandle(col,len){
  const g=grp();
  const pm=plastic(col);
  g.add(lathe([[2.3,-len],[3.1,-len+1.2],[3.4,-len*.6],[3.3,-3],[2.6,-.5],[2.4,0]],pm,36));
  [0,1,2].forEach(i=>g.add(torus(3.35,.12,STEELD,0,-len*.82+i*.0,0).rotateX(Math.PI/2).translateZ(0)));
  g.children.slice(-3).forEach((r,i)=>r.position.y=-len*.5+i*1.4);
  g.add(lathe([[2.3,0],[2.1,2],[1.6,5],[1.25,8]],STEELM,28));
  return g;
}
MK.kfile=function(){
  const g=grp();g.add(endoHandle(0xf0c828,15));
  g.add(tube([[0,7,0],[0,34,0]],t=>1.05-.88*t,STEEL,{n:130,seg:24,lobes:{n:4,amp:.38,twist:30}}));
  const st=cyl(2.4,2.4,1.5,RUB,28,15);st.position.y=0;g.add(st);
  return g;
};
MK.spreader=function(){
  const g=grp();g.add(endoHandle(0xd8dde2,15));
  g.add(tube([[0,7,0],[0,18,0],[0,32,0]],t=>1.1-.95*t,STEEL,{n:60,seg:24}));
  const st=cyl(2.3,2.3,1.3,mat(0x1f6fe0,0,.5),28,14);g.add(st);
  return g;
};
MK.endosyringe=function(){
  const g=grp();
  g.add(ms(new T.CylinderGeometry(6,6,62,48,1,true),GLASS)).position.y=31;
  const liq=ms(new T.CylinderGeometry(5.6,5.6,34,40),new T.MeshPhysicalMaterial({color:0xfff2a6,transparent:true,opacity:.55,roughness:.1}));liq.position.y=42;g.add(liq);
  const flange=ms(new T.CylinderGeometry(11,11,1.8,48),plastic(0xeef2f4));flange.scale.z=.55;flange.position.y=1;g.add(flange);
  const stopper=cyl(5.9,5.9,6,RUB,40,22);g.add(stopper);
  g.add(cyl(1.7,1.7,70,plastic(0xeef2f4),20,-48));
  g.add(cyl(.9,3.6,1,plastic(0xeef2f4),20,-6)).visible=true;
  const disc=cyl(8.5,8.5,1.8,plastic(0xeef2f4),40,-50);g.add(disc);
  /* cross ribs on plunger rod */
  const r1=box(.9,52,7,plastic(0xeef2f4),0,-10,0);g.add(r1);
  /* luer tip + hub + needle */
  g.add(lathe([[6,62],[4.6,65],[3.4,67],[3,70]],plastic(0xeef2f4),36));
  g.add(lathe([[3.6,68],[3.1,72],[2.3,80],[1.7,84]],plastic(0xff8a1f),32));
  g.add(tube([[0,84,0],[0,110,0]],()=>.5,STEEL,{n:20,seg:14}));
  g.add(ball(.5,STEEL,0,110,0));
  const vent=ball(.3,BLK,.45,106,0);g.add(vent);
  /* graduation marks */
  for(let i=0;i<8;i++){const w=i%2?3:5;g.add(box(w,.25,.2,BLK,5.9-w/2*0,10+i*6.2,6.1).translateX(0));}
  return g;
};

/* ===== rotary instruments ===== */
function handHead(rH,len,burShank,burHead,cap){
  const g=grp();
  g.add(lathe([[rH*.78,-len/2],[rH,-len/2+1.4],[rH,len/2-1.4],[rH*.8,len/2]],STEEL,48));
  g.add(lathe([[rH*.55,len/2],[rH*.55,len/2+1.3],[rH*.4,len/2+2]],cap||STEELM,32));
  g.add(lathe([[rH*.55,-len/2],[rH*.4,-len/2-2.5],[rH*.28,-len/2-4]],STEELM,32));
  g.add(tube([[0,-len/2-3,0],[0,-len/2-burShank,0]],()=>.8,STEEL,{n:8,seg:16}));
  const by=-len/2-burShank;
  g.add(lathe(burHead.map(p=>[p[0],by+p[1]]),mat(0x9aa3ac,1,.65),32));
  return g;
}
MK.turbine=function(){
  const g=grp();
  g.add(lathe([[5.2,0],[5.2,8]],STEELD,40));
  g.add(lathe([[5.5,8],[5.5,12]],GOLD,40));
  g.add(lathe([[5.5,12],[5.9,22],[6.6,44],[6.4,64],[5.5,80],[4.6,93],[4.3,98]],STEEL,56));
  for(let i=0;i<6;i++)g.add(torus(6.55-i*.02,.18,STEELD,0,30+i*3.6,0).rotateX(Math.PI/2));
  g.add(lathe([[4.3,98],[4.5,100],[4.5,103]],STEELM,36));
  /* quick-connect holes */
  [0,1,2,3].forEach(k=>{const a=k*Math.PI/2;g.add(ball(.6,BLK,Math.cos(a)*5.3,4,Math.sin(a)*5.3));});
  const h=handHead(7,12,17,[[.95,0],[1.55,-2.5],[1.6,-7],[.9,-9],[0,-9.6]],STEELM);
  h.position.set(1.5,103,0);h.rotation.z=Math.PI/2-.17;g.add(h);
  g.add(ball(.35,GLASS,3,98,3.5));
  return g;
};
MK.contra=function(){
  const g=grp();
  g.add(lathe([[5.3,0],[5.3,6]],STEELD,40));
  g.add(lathe([[5.6,6],[5.6,10]],mat(0x2fa86b,1,.25),40));
  g.add(lathe([[5.6,10],[6.2,24],[6.6,48],[6.1,70],[5.2,86]],STEEL,56));
  for(let i=0;i<7;i++)g.add(torus(6.6,.16,STEELD,0,28+i*3.2,0).rotateX(Math.PI/2));
  const nose=grp();nose.position.set(0,86,0);nose.rotation.z=-.36;
  nose.add(lathe([[5.2,0],[4.4,14],[3.8,26],[3.6,32]],STEELM,40));
  const h=handHead(4.2,10,12,[[.95,0],[1.3,-2],[1.3,-18],[.5,-20],[0,-20.4]],GOLD);
  h.position.set(1.2,37,0);h.rotation.z=Math.PI/2+.0;nose.add(h);
  g.add(nose);
  return g;
};
MK.contra.rot=[0,0,-Math.PI/2+.1];
function burShank(g){
  g.add(tube([[0,0,0],[0,19,0]],()=>.8,STEEL,{n:8,seg:20}));
  g.add(lathe([[.8,19],[.8,19.2]],STEEL,20));
}
MK.diamondbur=function(){
  const g=grp();burShank(g);
  g.add(lathe([[.8,19],[1.05,21],[.9,24]],STEELD,28));
  g.add(lathe([[.9,23],[1.05,23.9],[1.05,24.6],[.9,25]],mat(0x1f6fe0,0,.4),28));
  const grit=mat(0xa7aeb6,1,.78);
  g.add(lathe([[.95,25],[1.35,26],[1.5,29],[1.55,33],[1.2,35.2],[.5,36.2],[0,36.4]],grit,40));
  /* diamond grit */
  const sg=new T.SphereGeometry(.07,5,4),sm=mat(0xe8eef4,1,.15);
  const im=new T.InstancedMesh(sg,sm,420);const d=new T.Object3D();
  for(let i=0;i<420;i++){const y=26+Math.random()*9.4;const r=y<26.7?1.3:y<29?1.4+(y-26)*.05:y<33?1.55:Math.max(.2,1.55-(y-33)*.55);
    const a=Math.random()*6.283;d.position.set(Math.cos(a)*r,y,Math.sin(a)*r);d.updateMatrix();im.setMatrixAt(i,d.matrix);}
  g.add(im);
  g.scale.setScalar(2.4);return g;
};
MK.diamondbur.rot=[0,0,-Math.PI/2];
MK.carbidebur=function(){
  const g=grp();burShank(g);
  g.add(lathe([[.8,19],[1.0,21],[.95,24]],STEELD,28));
  g.add(tube([[0,24,0],[0,34,0]],t=>1.28*(1-.12*t)*(t>.93?Math.sqrt(Math.max(0,(1-t)/.07)):1)+.001,mat(0x6d7782,1,.28),{n:70,seg:32,lobes:{n:8,amp:.2,twist:6}}));
  g.add(lathe([[.95,23],[1.5,24],[1.5,24.2]],STEELM,28));
  g.scale.setScalar(2.4);return g;
};
MK.carbidebur.rot=[0,0,-Math.PI/2];

MK.lamp=function(){
  const g=grp();
  const body=plastic(0xf4f6f7);
  g.add(lathe([[10,0],[13.8,6],[15.6,28],[14.6,56],[12.6,84],[10.8,100]],body,56));
  g.add(lathe([[9,0],[10,-2],[10,0]],BLK,40));
  /* display + buttons on front */
  const scr=box(10,12,.8,mat(0x07131c,0,.2),0,64,13.3);scr.rotation.x=-.05;g.add(scr);
  const dig=box(6,6,.2,mat(0x4aa8ff,0,.3,{emissive:0x4aa8ff,emissiveIntensity:1.6}),0,64.5,13.8);g.add(dig);
  const b1=cyl(3.6,3.6,1,plastic(0x1f6fe0),28,0);b1.rotation.x=Math.PI/2;b1.position.set(0,44,14.5);g.add(b1);
  /* head */
  g.add(lathe([[10.8,100],[11.4,104],[11.2,120],[9,132],[7,140]],plastic(0x20272c),48));
  g.add(torus(11.3,.5,STEEL,0,106,0).rotateX(Math.PI/2));
  /* bent light guide */
  g.add(tube([[0,138,0],[0,150,0],[6,164,0],[16,174,0]],t=>6.2-1.2*t,mat(0x30363b,.3,.35),{n:70,seg:36}));
  const tip=cyl(5,5,.8,mat(0x2a7bff,0,.2,{emissive:0x2a7bff,emissiveIntensity:2.2}),36,0);
  tip.position.set(17.8,175.3,0);tip.rotation.z=-Math.atan2(10,10)-.0;g.add(tip);
  g.add(lathe([[6,138],[5.4,142],[4.4,148]],STEELM,36));
  return g;
};
MK.lamp.rot=[0,0,-Math.PI/2+.25];

/* ===== hygiene ===== */
function scalerBlade(kind){
  const e=grp();e.add(neck());
  const path=kind==='sickle'?[[0,14,0],[0,30,0],[1.4,44,0],[4,54,0],[5.6,58,0]]:[[0,14,0],[0,30,0],[1,42,0],[3.8,52,0],[6.2,57,0]];
  e.add(tube(path,t=>1.55-.55*t,STEEL,{n:70}));
  if(kind==='sickle'){
    const b=flat([[-1.4,0],[1.5,.5],[.4,16]],1.15,STEEL,.12);b.position.set(5.4,57.5,0);b.rotation.z=-.5;e.add(b);
    const r=box(.01,.01,.01,STEEL);e.add(r);
  }else{
    const c=ms(new T.CylinderGeometry(1.25,.95,12,24,1,true,0,Math.PI),STEEL.clone());c.material.side=DS;
    c.position.set(6.3,63,0);c.rotation.z=-.55;c.rotation.y=-Math.PI/2;e.add(c);
    const tipc=ms(new T.SphereGeometry(1.1,20,12,0,Math.PI,0,Math.PI/2),STEEL.clone());tipc.material.side=DS;
    tipc.position.set(8.6,68.6,0);tipc.rotation.z=-.55;tipc.rotation.y=-Math.PI/2+0;tipc.rotation.x=0;e.add(tipc);
  }
  return e;
}
MK.sickle=function(){return dbl(()=>scalerBlade('sickle'),()=>{const e=scalerBlade('sickle');e.scale.set(1.15,1.1,1.1);return e;});};
MK.gracey=function(){return dbl(()=>scalerBlade('gracey'),()=>{const e=scalerBlade('gracey');e.scale.set(1.2,1.1,1);return e;});};
MK.sickle.rot=[0,0,-Math.PI/2];MK.gracey.rot=[0,0,-Math.PI/2];

MK.airwater=function(){
  const g=grp();
  g.add(lathe([[4.2,-30],[5,-26],[7.5,-20],[9,-8],[9.6,0],[9.4,30],[8,46],[6,54],[5,58]],mat(0xbfc6cd,1,.28),48));
  g.add(lathe([[3.4,-48],[3.4,-30]],RUB,28));
  g.add(lathe([[4.6,-34],[5.2,-30],[5.2,-27]],STEELM,28));
  /* buttons */
  const bw=cyl(4,4,5,plastic(0x2c7be5),32,0);bw.position.set(0,38,8);bw.rotation.x=Math.PI/2;bw.scale.set(1,1,1);g.add(bw);
  const ba=cyl(4,4,5,plastic(0xf4f6f7),32,0);ba.position.set(0,24,9.4);ba.rotation.x=Math.PI/2;g.add(ba);
  /* nozzle */
  g.add(lathe([[5,58],[4.2,63],[3.4,70]],STEELM,32));
  g.add(tube([[0,66,0],[0,82,0],[3.6,98,0],[12,108,0],[20,112,0]],t=>3.1-1.2*t,STEEL,{n:80,seg:26}));
  g.add(ball(1.9,STEEL,20,112,0));
  g.add(ball(.6,BLK,22,112,0));
  return g;
};
MK.airwater.rot=[0,0,-Math.PI/2+.2];

MK.saliva=function(){
  const g=grp();
  const pm=plastic(0xe8f2fa,{transparent:true,opacity:.78});
  g.add(lathe([[3.4,0],[5.2,6],[6.2,16],[5.2,26],[4.9,30]],plastic(0x2c7be5),36));
  g.add(tube([[0,28,0],[0,60,0],[0,92,0],[4,120,0],[16,138,0],[40,146,0],[66,144,0]],()=>4.6,pm,{n:130,seg:28,caps:false}));
  /* inner steel spiral wire visible through the wall */
  const w=tube([[0,28,0],[0,60,0],[0,92,0],[4,120,0],[16,138,0],[40,146,0],[66,144,0]],()=>.35,STEELD,{n:130,seg:8});
  g.add(w);
  g.add(lathe([[4.9,0],[4.9,.1]],WHT,8));
  const tipC=ball(5,pm,66,144,0);tipC.scale.set(.5,1,1);g.add(tipC);
  g.add(torus(4.6,.45,plastic(0xe8f2fa),66,144,0,24).rotateY(Math.PI/2));
  return g;
};
MK.saliva.rot=[0,0,-Math.PI/2];

MK.damclamp=function(){
  const g=grp();const m=mat(0xa8b0b8,1,.28);
  /* bow: horseshoe in XZ */
  g.add(tube([[-9.5,0,10],[-11.6,0,2],[-9,0,-6],[0,0,-9.6],[9,0,-6],[11.6,0,2],[9.5,0,10]],t=>[.9,1.5],m,{n:80,up:[0,1,0]}));
  /* jaws bent down */
  [-1,1].forEach(s=>{
    g.add(tube([[s*9.5,0,10],[s*9.7,-3,10.4],[s*8.3,-7,9],[s*6.2,-9.6,7.2],[s*5.6,-10.2,6.4]],t=>[.8,2.6-1.1*t],m,{n:40,up:[0,0,1]}));
    /* prongs */
    g.add(ball(.9,m,s*5.7,-10.3,6.2));
    /* forceps holes */
    const hole=torus(1.8,.6,m,s*12,0,9.6,32);hole.rotation.x=Math.PI/2;g.add(hole);
    g.add(tube([[s*9.5,0,10],[s*11.2,0,10.3],[s*12.3,0,9.8]],()=>[.9,.9],m,{n:10,up:[0,1,0]}));
  });
  return g;
};
MK.damclamp.rot=[.6,.4,0];MK.damclamp.k=.8;

MK.damframe=function(){
  const g=grp();
  const m=mat(0xcfd5db,1,.3);
  const path=[[-52,58,0],[-58,22,0],[-58,-20,0],[-48,-46,0],[-22,-60,0],[0,-63,0],[22,-60,0],[48,-46,0],[58,-20,0],[58,22,0],[52,58,0]];
  g.add(tube(path,()=>1.5,m,{n:180,seg:16}));
  g.add(ball(2.6,m,-52,58,0));g.add(ball(2.6,m,52,58,0));
  /* pins */
  const cv=new T.CatmullRomCurve3(path.map(V3),false,'centripetal');
  for(let i=1;i<28;i++){
    const t=i/28,p=cv.getPointAt(t);
    const c=cyl(.55,.18,4,m,10,0);c.rotation.x=Math.PI/2;c.position.copy(p);c.position.z=1.5;g.add(c);
  }
  /* rubber sheet (translucent green) */
  const sh=ms(new T.PlaneGeometry(92,88,1,1),new T.MeshStandardMaterial({color:0x2e9a6e,roughness:.8,transparent:true,opacity:.5,side:DS}));
  sh.position.set(0,0,.4);g.add(sh);
  const hole=ms(new T.CircleGeometry(4,24),mat(0x1b1f22,0,.9));hole.position.set(0,-8,.5);g.add(hole);
  return g;
};
MK.damframe.rot=[0,0,0];MK.damframe.k=.62;
