'use strict';
(() => {
  const mission=document.querySelector('#mission-view'),portfolio=document.querySelector('#portfolio-view');
  const missionNav=document.querySelector('#mission-nav'),portfolioNav=document.querySelector('#portfolio-nav');
  const headerButton=document.querySelector('.header-cta');
  window.enterPortfolio=function(landed=false){
    if(!portfolio.hidden)return;
    window.marsGame.setActive(false);mission.hidden=true;portfolio.hidden=false;missionNav.hidden=true;portfolioNav.hidden=false;
    document.querySelector('#arrival-label').textContent=landed?'SUCCESSFULLY LANDED':'YOU’VE ARRIVED';
    headerButton.innerHTML='Let’s talk <span>↗</span>';headerButton.removeAttribute('data-enter');
    document.title='Affan Ahmed Dahar — Software Engineer';portfolio.classList.add('reveal');
    history.replaceState(null,'','#about');window.scrollTo({top:0,behavior:'instant'});
    const heading=portfolio.querySelector('h1');heading.tabIndex=-1;heading.focus({preventScroll:true});
  };
  function returnToMission(){portfolio.hidden=true;portfolio.classList.remove('reveal');mission.hidden=false;portfolioNav.hidden=true;missionNav.hidden=false;headerButton.innerHTML='View portfolio <span>↗</span>';headerButton.setAttribute('data-enter','');document.title='Affan Dahar — A Different Kind of Landing Page';history.replaceState(null,'',location.pathname);window.marsGame.reset();window.marsGame.setActive(true);window.scrollTo({top:0,behavior:'instant'});}
  document.addEventListener('click',e=>{const enter=e.target.closest('[data-enter]');if(enter){e.preventDefault();window.enterPortfolio(false);}});
  headerButton.addEventListener('click',()=>{if(!portfolio.hidden)document.querySelector('#contact').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});});
  document.querySelectorAll('.replay-mission').forEach(b=>b.addEventListener('click',returnToMission));
  document.querySelector('.site-header .brand').addEventListener('click',e=>{e.preventDefault();if(!portfolio.hidden)returnToMission();else window.scrollTo({top:0,behavior:'smooth'});});
  document.querySelectorAll('.project-toggle').forEach(b=>b.addEventListener('click',()=>{const expanded=b.getAttribute('aria-expanded')==='true';b.setAttribute('aria-expanded',String(!expanded));document.getElementById(b.getAttribute('aria-controls')).hidden=expanded;b.innerHTML=`${expanded?'Explore my contribution':'Close contribution'} <span>${expanded?'↗':'−'}</span>`;}));
  const dialog=document.querySelector('#flight-manual');document.querySelector('#manual-open').addEventListener('click',()=>dialog.showModal());document.querySelector('#manual-close').addEventListener('click',()=>dialog.close());document.querySelector('#manual-start').addEventListener('click',()=>{dialog.close();window.marsGame.start();});dialog.addEventListener('click',e=>{const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();});
  document.querySelector('#copy-email').addEventListener('click',async e=>{const b=e.currentTarget;try{await navigator.clipboard.writeText('daharaffan@gmail.com');b.textContent='Email copied ✓';document.querySelector('#announcer').textContent='Email address copied to clipboard.';setTimeout(()=>b.innerHTML='Copy email <span>⧉</span>',2500);}catch{b.textContent='daharaffan@gmail.com';document.querySelector('#announcer').textContent='Email address: daharaffan@gmail.com';}});
  document.querySelectorAll('.current-year').forEach(el=>el.textContent=new Date().getFullYear());
  if(['#about','#work','#experience','#skills','#contact'].includes(location.hash)){const target=location.hash;window.enterPortfolio(false);history.replaceState(null,'',target);setTimeout(()=>document.querySelector(target)?.scrollIntoView({behavior:'instant'}),50);}
})();
