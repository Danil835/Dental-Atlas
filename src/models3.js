/* ===== hinged instruments: pliers, hemostat, scissors, forceps ===== */
function hinged(o){
  const g=grp();const H=o.H,J=o.J,hx=o.hx,m=o.mat||STEEL;
  const p0=H/(H+J+8);
  [-1,1].forEach(s=>{
    const path=[[s*hx,-H],[s*hx*.62,-H*.62],[s*hx*.22,-H*.24],[s*.6,-6],[0,0],[-s*.6,6],[-s*.5,J*.35],[-s*.3,J*.75],[-s*.12,J]];
    const w=t=>{
      if(t<p0*.92)return o.hw+(o.pw-o.hw)*Math.pow(t/p0,3);
      const u=(t-p0)/(1-p0);return o.jw?o.jw(u):o.pw;
    };
    const arm=rib(path,w,o.th,m,{n:110});arm.position.z=s*(o.dz||.8);g.add(arm);
    if(o.ring){
      const R=o.ring;
      const r=torus(R,o.rt||1.2,o.ringMat||m,s*(hx+R*.62),-H-R*.78,s*(o.dz||.8),56);r.rotation.z=0;g.add(r);
      g.add(rib([[s*hx,-H],[s*(hx+R*.2),-H-R*.2]],()=>o.hw,o.th,m,{n:6}).translateZ(s*(o.dz||.8)));
    }
    if(o.ratchet){
      const rb=box(hx*.55,.9,1.2,STEELM,s*hx*.3,-H*.55+s*0,s*1.7);g.add(rb);
      for(let k=0;k<5;k++)g.add(box(.5,1.4,1.2,STEELM,s*hx*(.08+k*.1),-H*.55+.8,s*1.7));
    }
    if(o.tip)o.tip(g,s);
  });
  const piv=cyl(2.1,2.1,3.8,STEELM,32,-1.9);piv.rotation.x=Math.PI/2;g.add(piv);
  const scr=cyl(1.1,1.1,.5,STEELD,24,1.9);scr.rotation.x=Math.PI/2;scr.position.z=1;g.add(scr);
  return g;
}
MK.clampforceps=function(){
  return hinged({H:78,J:60,hx:15,hw:2.2,pw:3,th:.9,ratchet:true,tip:(g,s)=>{
    const pin=cyl(.75,.55,4,STEEL,16,0);pin.rotation.z=s>0?Math.PI/2:-Math.PI/2;pin.position.set(0,60,s*.8+0);
    pin.position.x=-s*.4;pin.rotation.z=s>0?Math.PI/2:-Math.PI/2;g.add(pin);
  },jw:u=>3.1-1*u});
};

MK.needleholder=function(){
  return hinged({H:70,J:34,hx:10,hw:2,pw:3.2,th:1,ring:7,rt:1.4,ringMat:GOLD,ratchet:true,mat:STEEL,jw:u=>3.6-.6*u,
    tip:(g,s)=>{ if(s>0)g.add(box(.5,22,4.4,GOLD,0,22,0).translateX(0)); }});
};

MK.hemostat=function(){
  return hinged({H:68,J:52,hx:10,hw:1.8,pw:2.8,th:.9,ring:6.6,rt:1.3,ratchet:true,jw:u=>2.8-1.5*u,
    tip:(g,s)=>{for(let k=0;k<9;k++){g.add(box(.2,.25,2.4,STEELD,-s*.2,10+k*3.7,s*.8));}}});
};

MK.scissors=function(){
  return hinged({H:60,J:66,hx:7,hw:1.8,pw:3.3,th:.7,ring:8,rt:1.5,jw:u=>3.4*Math.pow(Math.max(0,1-u),.55)+.1});
};

MK.forceps=function(){
  const g=hinged({H:125,J:62,hx:17,hw:5,pw:6,th:1.3,dz:1.1,mat:STEELM,jw:u=>6+3*Math.sin(u*Math.PI)*(1-u*.4)});
  /* beak inner cups */
  [-1,1].forEach(s=>{
    const c=ms(new T.CylinderGeometry(3.4,3.4,28,24,1,true,0,Math.PI),STEEL.clone());c.material.side=DS;
    c.position.set(-s*1.4,48,s*1.1);c.rotation.z=0;c.rotation.y=s>0?-Math.PI/2:Math.PI/2;g.add(c);
  });
  return g;
};


/* ===== carpule syringe ===== */
MK.carpule=function(){
  const g=grp();const bm=mat(0xcfd5db,1,.25);
  const barrel=ms(new T.CylinderGeometry(8.8,8.8,84,56,1,true,Math.PI*.22,Math.PI*1.56),bm.clone());barrel.material.side=DS;barrel.position.y=42;g.add(barrel);
  g.add(torus(8.8,.8,bm,0,0,0,56).rotateX(Math.PI/2));
  /* glass cartridge with anaesthetic */
  const cart=ms(new T.CylinderGeometry(7.4,7.4,54,48,1,true),GLASS);cart.position.y=36;g.add(cart);
  const liq=ms(new T.CylinderGeometry(7.1,7.1,45,40),new T.MeshPhysicalMaterial({color:0xf6e9a4,transparent:true,opacity:.5,roughness:.08}));liq.position.y=40;g.add(liq);
  g.add(cyl(7.2,7.2,4,RUB,40,8));
  g.add(lathe([[7.6,62],[7.6,66],[6.2,68],[4.6,69]],mat(0xc7ccd2,1,.3),40));
  g.add(cyl(3.2,3.2,.6,RUB,28,68.6));
  /* front head + needle */
  g.add(lathe([[8.8,84],[7.2,88],[5,92],[3.6,96],[3.4,99]],bm,48));
  g.add(lathe([[3.7,97],[3.1,103],[2.3,110],[1.5,114]],plastic(0xf2c230),32));
  g.add(tube([[0,114,0],[0,152,0]],()=>.5,STEEL,{n:20,seg:14}));
  g.add(ball(.45,STEEL,0,152,0));
  /* plunger with harpoon & thumb ring */
  g.add(tube([[0,-86,0],[0,6,0]],()=>1.9,STEEL,{n:30,seg:20}));
  g.add(cyl(2.4,.01,4,STEELM,16,6));
  g.add(torus(9,1.8,bm,0,-96,0,56));
  /* finger wings */
  const wing=flat([[-24,0],[-22,3],[-10,3],[10,3],[22,3],[24,0],[22,-3],[10,-3],[-10,-3],[-22,-3]],3,bm,.6,true);
  wing.position.set(0,-4,0);g.add(wing);
  g.add(lathe([[3,-12],[3.4,-8],[3.4,0]],bm,28));
  return g;
};
MK.carpule.rot=[0,0,-Math.PI/2+.05];

/* ===== elevator ===== */
MK.elevator=function(){
  const g=grp();
  g.add(lathe([[7.2,-90],[10,-86],[11.2,-72],[10.6,-46],[8,-22],[5,-8],[3,0]],STEELM,56));
  for(let i=0;i<6;i++)g.add(torus(10.9-Math.abs(i-2.5)*.4,.35,STEELD,0,-76+i*4.2,0).rotateX(Math.PI/2));
  g.add(tube([[0,0,0],[0,40,0],[0,62,0]],t=>3.3-.5*t,STEEL,{n:40}));
  g.add(lathe([[3.2,56],[4.4,62],[4,66]],STEELM,28));
  /* spoon blade: tapered half-pipe opening towards +Z, rounded tip */
  const bm=STEEL.clone();bm.side=DS;
  const bl=ms(new T.CylinderGeometry(3.2,5.4,34,32,1,true,Math.PI*.1,Math.PI*.8),bm);
  bl.position.set(0,82,0);bl.rotation.y=-Math.PI*.5;g.add(bl);
  const rim=tube([[0,65,0],[0,99,0]],()=>.25,STEEL,{n:4,seg:6});rim.visible=false;g.add(rim);
  const tip=ms(new T.SphereGeometry(3.2,28,12,Math.PI*.1,Math.PI*.8,0,Math.PI/2),bm);
  tip.position.set(0,99,0);tip.rotation.y=-Math.PI*.5;g.add(tip);
  return g;
};
MK.elevator.rot=[0,0,-Math.PI/2];

/* ===== scalpel ===== */
MK.scalpel=function(){
  const g=grp();
  g.add(tube([[0,-72,0],[0,36,0],[0,52,0]],t=>[t>.82?4.2-(t-.82)*8:4.2,1.5],STEELM,{n:80,up:[0,0,1],seg:18}));
  for(let i=0;i<26;i++){const y=-60+i*3.1;g.add(box(5.2,.45,.2,STEELD,0,y,1.5));g.add(box(5.2,.45,.2,STEELD,0,y,-1.5));}
  g.add(box(4.4,2,1.9,STEEL,0,-72,0));
  const bl=flat([[-3,0],[3,0],[3.6,8],[3.3,17],[2,24],[.2,28.5],[-3,24],[-3,10]],.32,STEEL,.06);
  bl.position.set(0,44,.0);g.add(bl);
  const hole=ms(new T.CylinderGeometry(.6,.6,.6,16),BLK);hole.rotation.x=Math.PI/2;hole.position.set(0,52,.1);g.add(hole);
  g.add(box(1.2,10,.2,STEELD,0,48,.5).translateX(0)).visible=true;
  return g;
};
MK.scalpel.rot=[0,0,-Math.PI/2];

/* ===== periosteal elevator (Molt) ===== */
MK.periosteal=function(){
  const A=()=>{
    const e=grp();e.add(neck());
    e.add(tube([[0,14,0],[0,28,0],[1.6,40,0]],()=>1.6,STEEL,{n:30}));
    e.add(rib([[1.6,36,0],[3,44,0],[6,52,0],[10,57,0]],t=>1.2+4.8*Math.sin(Math.min(1,t*2.2)*Math.PI/2)*Math.sqrt(Math.max(0,1-Math.pow(t,6))),.5,STEEL,{n:80}));
    return e;
  };
  const B=()=>{
    const e=grp();e.add(neck());
    e.add(tube([[0,14,0],[0,28,0],[1.4,40,0]],()=>1.6,STEEL,{n:30}));
    e.add(rib([[1.4,36,0],[2.5,44,0],[4.5,52,0],[7,56,0]],t=>1.1+1.6*Math.sin(Math.min(1,t*2)*Math.PI/2)*(1-Math.pow(t,3)),.45,STEEL,{n:80}));
    return e;
  };
  return dbl(A,B);
};
MK.periosteal.rot=[0,0,-Math.PI/2];

/* ===== Volkmann curette ===== */
MK.volkmann=function(){
  const mk=(R)=>function(){
    const e=grp();e.add(neck());
    e.add(tube([[0,14,0],[0,28,0],[1.2,40,0],[3.6,49,0],[6,52,0]],()=>1.5,STEEL,{n:60}));
    const s=spoon(R,STEEL);s.position.set(6.5,52.8,0);s.rotation.z=-Math.PI/2+.1;s.scale.set(1,1,1.5);e.add(s);
    return e;
  };
  return dbl(mk(3.8),mk(2.8));
};
MK.volkmann.rot=[0,0,-Math.PI/2];

/* ===== impression tray ===== */
MK.tray=function(){
  const g=grp();const m=mat(0xcfd5db,1,.3);
  const pts=[[-30,0,20],[-34,0,2],[-28,0,-20],[-13,0,-36],[0,0,-40],[13,0,-36],[28,0,-20],[34,0,2],[30,0,20]];
  g.add(tube(pts,()=>1,m,{n:140,up:[0,1,0],profile:[[-9.5,11],[-9.9,2],[-8.3,-.2],[8.3,-.2],[9.9,2],[9.5,11]]}));
  const cv=new T.CatmullRomCurve3(pts.map(V3),false,'centripetal');
  for(let i=0;i<=22;i++){
    const t=i/22,p=cv.getPointAt(t),tn=cv.getTangentAt(t),nr=new T.Vector3(tn.z,0,-tn.x);
    [-4.6,0,4.6].forEach(u=>{
      const d=ms(new T.CircleGeometry(.95,14),BLK);d.rotation.x=-Math.PI/2;
      d.position.copy(p).addScaledVector(nr,u);d.position.y=-.15+.04;g.add(d);
    });
  }
  /* retention rim */
  g.add(tube(pts,()=>.5,m,{n:140,seg:10}).translateY(11.2).translateX(0)).visible=true;
  /* handle */
  g.add(tube([[0,0.2,-40],[0,1.4,-56],[0,2.2,-76]],t=>[6.2-t*1.2,1.2],m,{n:20,up:[0,1,0]}));
  g.add(ms(new T.CylinderGeometry(3.4,3.4,2.4,24),m)).position.set(0,2.2,-77);
  return g;
};
MK.tray.rot=[.9,0,0];MK.tray.k=.8;

/* ===== shade guide ===== */
MK.shade=function(){
  const g=grp();
  const cols=[0xf6efdf,0xf2e6cf,0xeddcbd,0xe8d3aa,0xe5d6b8,0xdec99e,0xd9c18f,0xd3b780,0xebdfc6,0xdcc9a7,0xcdb88d,0xc2a272,0xe3d4b4,0xd4bf95,0xc7ab7b,0xb5936a];
  cols.forEach((c,i)=>{
    const a=(7.5-i)*.115;const tab=grp();
    tab.add(rib([[0,0],[0,52]],()=>1.2,.45,STEELM,{n:6}));
    const crown=flat([[-4.4,0],[-5.2,7],[-4.8,14],[-2.6,18],[0,19],[2.6,18],[4.8,14],[5.2,7],[4.4,0]],1.4,plastic(c,{roughness:.28,clearcoat:.6}),.5,true);
    crown.position.set(0,58,0);tab.add(crown);
    tab.add(box(2.6,3,1.6,mat(0x3a4650,0,.6),0,50,0));
    tab.rotation.z=a;tab.position.z=i*.55;g.add(tab);
  });
  const hold=cyl(6.5,6.5,16,plastic(0x2c3a46),40,-8);hold.rotation.x=Math.PI/2;hold.position.set(0,0,5);g.add(hold);
  g.add(ball(2.8,STEEL,0,0,14));
  return g;
};
MK.shade.rot=[0,0,0];MK.shade.k=.62;
