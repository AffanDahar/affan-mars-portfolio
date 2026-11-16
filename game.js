'use strict';
(() => {
  const canvas = document.querySelector('#mars-canvas');
  const ctx = canvas.getContext('2d');
  const stage = document.querySelector('#flight-stage');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const controls = { left: false, right: false, thrust: false };
  let W=1000,H=1000,scale=1,ground=820,phase='idle',active=true,auto=false,last=0,time=0;
  let rocket={x:360,y:400,vx:0,vy:0,fuel:100,angle:.25},particles=[],successTimer=null;
  const pad={x:635,width:150};
  let seed=41;
  function random(){seed=(seed*16807)%2147483647;return (seed-1)/2147483646;}
  const stars=Array.from({length:110},()=>({x:random(),y:random()*.78,r:.4+random()*1.1,a:.12+random()*.6}));
  const rocks=Array.from({length:40},()=>({x:random()*1000,y:random(),r:2+random()*9}));
  const planet=document.createElement('canvas');planet.width=720;planet.height=720;
  const pc=planet.getContext('2d');
  pc.save();pc.beginPath();pc.arc(360,360,350,0,Math.PI*2);pc.clip();
  let pg=pc.createRadialGradient(190,160,0,360,360,480);pg.addColorStop(0,'#d7896a');pg.addColorStop(.35,'#b86651');pg.addColorStop(.7,'#82473f');pg.addColorStop(1,'#28222d');pc.fillStyle=pg;pc.fillRect(0,0,720,720);
  for(let i=0;i<1700;i++){let x=random()*720,y=random()*720,r=1+Math.pow(random(),3)*50;pc.fillStyle=random()>.45?'rgba(47,30,37,.06)':'rgba(244,170,125,.055)';pc.beginPath();pc.ellipse(x,y,r*1.6,r*.45,-.45,0,Math.PI*2);pc.fill();}
  for(let i=0;i<65;i++){let x=random()*720,y=random()*720,r=4+random()*21;pc.strokeStyle='#492f3524';pc.lineWidth=r*.3;pc.beginPath();pc.ellipse(x,y,r*1.3,r*.8,-.4,0,Math.PI*2);pc.stroke();pc.strokeStyle='#eca98518';pc.lineWidth=1;pc.beginPath();pc.ellipse(x-2,y-2,r*1.3,r*.8,-.4,Math.PI,Math.PI*2);pc.stroke();}
  let shadow=pc.createLinearGradient(100,150,650,460);shadow.addColorStop(0,'#0e121b00');shadow.addColorStop(.45,'#0e121b08');shadow.addColorStop(.72,'#0e121b55');shadow.addColorStop(1,'#0e121bf8');pc.fillStyle=shadow;pc.fillRect(0,0,720,720);pc.restore();
  function resize(){const rect=canvas.getBoundingClientRect();if(!rect.width||!rect.height)return;const oldGround=ground;const ratio=Math.min(devicePixelRatio||1,2);canvas.width=Math.round(rect.width*ratio);canvas.height=Math.round(rect.height*ratio);scale=rect.width/W;H=rect.height/scale;ground=H*.80;ctx.setTransform(ratio*scale,0,0,ratio*scale,0,0);if(phase==='playing')rocket.y*=ground/oldGround;draw();}
  new ResizeObserver(resize).observe(stage);
  function path(points,fill){ctx.beginPath();ctx.moveTo(points[0][0],points[0][1]);for(let i=1;i<points.length;i++)ctx.lineTo(points[i][0],points[i][1]);ctx.closePath();ctx.fillStyle=fill;ctx.fill();}
  function drawPlanet(){const x=750,y=H*.30,r=Math.min(265,H*.30);const halo=ctx.createRadialGradient(x,y,r*.8,x,y,r*1.35);halo.addColorStop(0,'#d2795b04');halo.addColorStop(.72,'#d2795b07');halo.addColorStop(1,'#d2795b00');ctx.fillStyle=halo;ctx.beginPath();ctx.arc(x,y,r*1.35,0,Math.PI*2);ctx.fill();ctx.drawImage(planet,x-r,y-r,r*2,r*2);ctx.save();ctx.translate(x,y);ctx.rotate(-.45);ctx.strokeStyle='#d2ab8a15';ctx.lineWidth=1;ctx.setLineDash([3,10]);ctx.beginPath();ctx.ellipse(0,0,r*1.48,r*.65,0,0,Math.PI*2);ctx.stroke();ctx.restore();}
  function drawTerrain(){let g=ground;
    path([[0,H],[0,g+40],[70,g-8],[110,g-5],[190,g-80],[270,g-43],[330,g-70],[420,g+6],[510,g+9],[590,g-15],[710,g+5],[790,g-36],[875,g-25],[1000,g-80],[1000,H]],'#36282b');
    path([[0,H],[0,g+90],[120,g+40],[240,g+55],[365,g+15],[455,g+40],[550,g+12],[670,g+20],[780,g+5],[900,g+36],[1000,g+15],[1000,H]],'#53352f');
    const soil=ctx.createLinearGradient(0,g,0,H);soil.addColorStop(0,'#815044');soil.addColorStop(.3,'#5f3c35');soil.addColorStop(1,'#161a22');
    path([[0,H],[0,g+115],[110,g+72],[210,g+80],[315,g+56],[430,g+69],[530,g+36],[590,g+25],[690,g+25],[800,g+48],[910,g+60],[1000,g+40],[1000,H]],soil);
    for(const rock of rocks){let y=g+60+rock.y*(H-g-40);ctx.fillStyle='#a16c4c1a';ctx.beginPath();ctx.ellipse(rock.x,y,rock.r*2,rock.r*.7,0,0,Math.PI*2);ctx.fill();ctx.fillStyle='#30262966';ctx.beginPath();ctx.ellipse(rock.x+rock.r*.5,y+rock.r*.4,rock.r*1.5,rock.r*.4,0,0,Math.PI*2);ctx.fill();}
    ctx.strokeStyle='#bd876021';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(0,g+130);ctx.bezierCurveTo(220,g+105,300,g+150,510,g+110);ctx.stroke();ctx.beginPath();ctx.moveTo(760,g+93);ctx.lineTo(850,g+83);ctx.lineTo(930,g+101);ctx.stroke();
    const beam=ctx.createLinearGradient(0,g-120,0,g);beam.addColorStop(0,'#c6f5dc00');beam.addColorStop(1,'#c6f5dc12');ctx.fillStyle=beam;ctx.beginPath();ctx.moveTo(pad.x-95,g-120);ctx.lineTo(pad.x+95,g-120);ctx.lineTo(pad.x+pad.width/2,g);ctx.lineTo(pad.x-pad.width/2,g);ctx.fill();
    ctx.fillStyle='#161f26';ctx.beginPath();ctx.ellipse(pad.x,g+7,pad.width*.62,14,0,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#c6f5dc66';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(pad.x,g,pad.width/2,9,0,0,Math.PI*2);ctx.stroke();ctx.strokeStyle='#c6f5dc';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(pad.x-pad.width/2+10,g);ctx.lineTo(pad.x+pad.width/2-10,g);ctx.stroke();
    for(const x of [pad.x-85,pad.x+85]){ctx.fillStyle='#c6f5dc';ctx.fillRect(x,g-14,3,17);ctx.shadowColor='#c6f5dc';ctx.shadowBlur=12;ctx.beginPath();ctx.arc(x+1.5,g-16,3,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;}
    ctx.strokeStyle='#c6f5dc66';ctx.lineWidth=1;ctx.setLineDash([2,5]);ctx.beginPath();ctx.moveTo(pad.x,g-95);ctx.lineTo(pad.x,g-30);ctx.stroke();ctx.setLineDash([]);
  }
  function drawRocket(x,y,angle,flame){ctx.save();ctx.translate(x,y);ctx.rotate(angle);
    if(flame){let length=40+(reducedMotion?15:Math.sin(time*45)*15);const fire=ctx.createLinearGradient(0,-3,0,length);fire.addColorStop(0,'#e3f8ef');fire.addColorStop(.35,'#f7bd77');fire.addColorStop(1,'#f38a7300');ctx.fillStyle=fire;ctx.beginPath();ctx.moveTo(-12,-7);ctx.quadraticCurveTo(-20,22,0,length);ctx.quadraticCurveTo(20,22,12,-7);ctx.fill();ctx.fillStyle='#ecfff0';ctx.beginPath();ctx.moveTo(-5,-6);ctx.lineTo(0,20);ctx.lineTo(5,-6);ctx.fill();}
    path([[-23,-53],[-42,-22],[-42,0],[-23,-13]],'#c87866');path([[23,-53],[42,-22],[42,0],[23,-13]],'#8b4e47');
    const body=ctx.createLinearGradient(-25,0,25,0);body.addColorStop(0,'#929da6');body.addColorStop(.28,'#e6e4d9');body.addColorStop(.56,'#f5eee2');body.addColorStop(1,'#818b96');ctx.fillStyle=body;ctx.beginPath();ctx.moveTo(-24,-14);ctx.lineTo(-24,-68);ctx.bezierCurveTo(-24,-88,-12,-110,0,-123);ctx.bezierCurveTo(12,-110,24,-88,24,-68);ctx.lineTo(24,-14);ctx.closePath();ctx.fill();
    ctx.save();ctx.beginPath();ctx.moveTo(-24,-68);ctx.bezierCurveTo(-24,-88,-12,-110,0,-123);ctx.bezierCurveTo(12,-110,24,-88,24,-68);ctx.closePath();ctx.clip();const nose=ctx.createLinearGradient(-25,0,25,0);nose.addColorStop(0,'#bb5e50');nose.addColorStop(.4,'#f4a089');nose.addColorStop(1,'#a55047');ctx.fillStyle=nose;ctx.fillRect(-26,-125,52,40);ctx.restore();
    ctx.fillStyle='#263b49';ctx.beginPath();ctx.arc(0,-65,13,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#bac8c6';ctx.lineWidth=4;ctx.stroke();const windowGlow=ctx.createLinearGradient(-9,-74,9,-56);windowGlow.addColorStop(0,'#b8e6df');windowGlow.addColorStop(.4,'#5f9caa');windowGlow.addColorStop(1,'#29404f');ctx.fillStyle=windowGlow;ctx.beginPath();ctx.arc(0,-65,9,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#e6ffef77';ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(0,-65,6,3.6,5.4);ctx.stroke();
    ctx.fillStyle='#717e88';ctx.fillRect(-24,-27,48,2);ctx.fillStyle='#42515c';ctx.fillRect(-17,-14,34,9);ctx.fillStyle='#c6f5dc';ctx.fillRect(-6,-38,12,3);ctx.fillStyle='#283645';ctx.font='5px monospace';ctx.textAlign='center';ctx.fillText('AD—01',0,-46);ctx.strokeStyle='#b9c4c3';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(-21,-17);ctx.lineTo(-31,3);ctx.lineTo(-39,3);ctx.moveTo(21,-17);ctx.lineTo(31,3);ctx.lineTo(39,3);ctx.stroke();ctx.restore();
  }
  function draw(){ctx.clearRect(0,0,W,H);ctx.fillStyle='#0e121b';ctx.fillRect(0,0,W,H);
    for(const s of stars){let alpha=s.a*(reducedMotion?1:.75+.25*Math.sin(time*.7+s.x*30));ctx.fillStyle=`rgba(219,228,235,${alpha})`;ctx.beginPath();ctx.arc(s.x*W,s.y*H,s.r,0,Math.PI*2);ctx.fill();}
    drawPlanet();
    if(phase==='idle'){ctx.strokeStyle='#acb2c02b';ctx.lineWidth=1;ctx.setLineDash([4,8]);ctx.beginPath();ctx.moveTo(350,H*.50);ctx.bezierCurveTo(370,H*.65,590,H*.48,pad.x,ground-25);ctx.stroke();ctx.setLineDash([]);ctx.fillStyle='#a2abb366';ctx.beginPath();ctx.arc(350,H*.5,3,0,Math.PI*2);ctx.fill();}
    drawTerrain();
    if(phase==='idle')drawRocket(350+(reducedMotion?0:Math.sin(time*.65)*7),H*.48+(reducedMotion?0:Math.sin(time*1.2)*10),.28, true);
    else if(phase!=='crashed')drawRocket(rocket.x,rocket.y,rocket.angle,phase==='playing'&&((controls.thrust&&!auto)||auto&&rocket.thrusting)&&rocket.fuel>0);
    for(const p of particles){ctx.fillStyle=`rgba(${p.color},${p.life})`;ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);ctx.fill();}
  }
  function update(dt){if(phase==='playing'){
    let horizontal=(controls.right?1:0)-(controls.left?1:0);let firing=controls.thrust;
    if(auto){horizontal=Math.max(-1,Math.min(1,((pad.x-rocket.x)*1.1-rocket.vx*2.2)/70));const altitude=ground-rocket.y;const desired=Math.min(38,Math.sqrt(Math.max(0,altitude)*24));firing=rocket.vy>Math.max(8,desired);}
    rocket.vx+=(horizontal*70-rocket.vx*.48)*dt;rocket.vy+=32*dt;
    rocket.thrusting=firing&&rocket.fuel>0;
    if(rocket.thrusting){rocket.vy-=90*dt;rocket.fuel=Math.max(0,rocket.fuel-dt*7);}
    rocket.vy=Math.max(-80,Math.min(rocket.vy,240));rocket.x+=rocket.vx*dt;rocket.y+=rocket.vy*dt;
    rocket.angle+=(horizontal*.28-rocket.angle)*Math.min(1,dt*5);
    if(rocket.x<55){rocket.x=55;rocket.vx=0;}if(rocket.x>W-55){rocket.x=W-55;rocket.vx=0;}if(rocket.y<150){rocket.y=150;rocket.vy=Math.max(0,rocket.vy);}
    const alt=Math.max(0,(ground-rocket.y)/10),velocity=rocket.vy/10;
    document.querySelector('#altitude').textContent=alt.toFixed(1);document.querySelector('#velocity').textContent=velocity.toFixed(1);document.querySelector('#fuel').textContent=Math.round(rocket.fuel);
    document.querySelector('#velocity').style.color=velocity>4.5?'#f38a73':'#c6f5dc';
    if(rocket.y>=ground){rocket.y=ground;let onPad=Math.abs(rocket.x-pad.x)<pad.width/2-20;let soft=rocket.vy<=45&&Math.abs(rocket.vx)<50;
      if(onPad&&soft)finish(true);else finish(false,onPad?'A little too fast on approach. Hold thrust earlier to slow down.':'Missed the landing pad. Aim for the mint lights and keep your descent gentle.');}
  }
  for(const p of particles){p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=20*dt;p.life-=dt*.65;}particles=particles.filter(p=>p.life>0);
  }
  function loop(t){const dt=Math.min((t-last)/1000,.033)||0;last=t;if(active&&!document.hidden&&!document.querySelector('#flight-manual').open){time+=dt;update(dt);draw();}requestAnimationFrame(loop);}
  function resetControls(){Object.keys(controls).forEach(k=>controls[k]=false);document.querySelectorAll('[data-control]').forEach(b=>b.classList.remove('active'));}
  function start(){clearTimeout(successTimer);phase='playing';auto=false;particles=[];resetControls();rocket={x:360,y:H*.23,vx:0,vy:8,fuel:100,angle:0,thrusting:false};stage.classList.add('game-active');document.querySelector('.game-hud').hidden=false;document.querySelector('.game-controls').hidden=false;document.querySelector('#game-result').hidden=true;document.querySelector('#game-feedback').textContent='Aim for the pad. Hold Space or ↑ to slow your descent.';document.querySelector('#auto-land').textContent='Auto-land ↘';document.querySelector('#auto-land').classList.remove('engaged');const b=document.querySelector('#start-mission');b.innerHTML='Mission in progress <span>↘</span>';b.disabled=true;canvas.focus({preventScroll:true});if(innerWidth<761)stage.scrollIntoView({behavior:reducedMotion?'instant':'smooth',block:'center'});}
  function finish(success,reason){phase=success?'landed':'crashed';auto=false;resetControls();document.querySelector('.game-controls').hidden=true;document.querySelector('#game-feedback').textContent='';document.querySelector('#game-result').hidden=false;document.querySelector('#result-kicker').textContent=success?'MISSION ACCOMPLISHED':'FLIGHT LOG / TRY AGAIN';document.querySelector('#result-title').textContent=success?'Touchdown.':'Almost, commander.';document.querySelector('#result-copy').textContent=success?'A soft landing. A new perspective. Welcome to my world.':reason;document.querySelector('#result-button').textContent=success?'Explore the portfolio ↗':'Another attempt ↗';document.querySelector('.result-icon').textContent=success?'✓':'↻';document.querySelector('#announcer').textContent=success?'Successful Mars landing! Opening Affan’s portfolio.':reason;document.querySelector('#result-button').onclick=success?()=>window.enterPortfolio(true):start;document.querySelector('#result-button').focus({preventScroll:true});
    for(let i=0;i<45;i++)particles.push({x:rocket.x,y:ground-10,vx:(random()-.5)*160,vy:-random()*100,r:1+random()*4,life:1,color:success?'198,245,220':'243,138,115'});
    if(success)successTimer=setTimeout(()=>window.enterPortfolio(true),2200);
    else{const b=document.querySelector('#start-mission');b.innerHTML='Try the mission again <span>↗</span>';b.disabled=false;}
  }
  document.querySelector('#start-mission').addEventListener('click',start);
  document.querySelector('#auto-land').addEventListener('click',()=>{if(phase!=='playing')return;auto=!auto;resetControls();const b=document.querySelector('#auto-land');b.textContent=auto?'Auto-pilot on ✓':'Auto-land ↘';b.classList.toggle('engaged',auto);document.querySelector('#game-feedback').textContent=auto?'Auto-pilot engaged. Enjoy the approach.':'Manual control. Hold Space or ↑ for thrust.';canvas.focus({preventScroll:true});});
  function keyControl(e,on){if(!active||phase!=='playing'||document.querySelector('#flight-manual').open||/INPUT|TEXTAREA|SELECT/.test(e.target.tagName))return;let key={ArrowLeft:'left',a:'left',A:'left',ArrowRight:'right',d:'right',D:'right',ArrowUp:'thrust',w:'thrust',W:'thrust',' ':'thrust'}[e.key];if(key){e.preventDefault();controls[key]=on;document.querySelector(`[data-control="${key}"]`)?.classList.toggle('active',on);}}
  window.addEventListener('keydown',e=>keyControl(e,true));window.addEventListener('keyup',e=>keyControl(e,false));window.addEventListener('blur',resetControls);document.addEventListener('visibilitychange',()=>{resetControls();last=performance.now();});
  document.querySelectorAll('[data-control]').forEach(b=>{b.addEventListener('pointerdown',e=>{if(phase!=='playing')return;e.preventDefault();b.setPointerCapture(e.pointerId);controls[b.dataset.control]=true;b.classList.add('active');});for(const event of ['pointerup','pointercancel','lostpointercapture'])b.addEventListener(event,()=>{controls[b.dataset.control]=false;b.classList.remove('active');});});
  window.marsGame={start,setActive(value){active=value;last=performance.now();if(!value){clearTimeout(successTimer);resetControls();}else resize();},reset(){phase='idle';auto=false;particles=[];resetControls();stage.classList.remove('game-active');document.querySelector('.game-hud').hidden=true;document.querySelector('.game-controls').hidden=true;document.querySelector('#game-result').hidden=true;document.querySelector('#game-feedback').textContent='';const b=document.querySelector('#start-mission');b.innerHTML='Start the mission <span>↗</span>';b.disabled=false;draw();}};
  resize();requestAnimationFrame(loop);
})();
