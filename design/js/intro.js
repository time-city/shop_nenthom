(function () {
  const TOTAL_DURATION = 4800;

  // Check if intro has already been shown in this tab
  const introShown = sessionStorage.getItem('intro-shown');
  
  const overlay = document.querySelector('.intro-overlay');
  const core = document.querySelector('.intro-core');
  if (!overlay || !core) return;

  function dismiss(){
    const restoreTargets = [
      document.querySelector('nav'),
      document.querySelector('.hero-text'),
      document.querySelector('.candle-scene'),
      document.querySelector('.banner-slider')
    ].filter(Boolean);

    restoreTargets.forEach(el => {
      el.style.opacity = '1';
      el.style.pointerEvents = 'auto';
    });

    overlay.classList.add('is-hidden');
    document.body.classList.remove('intro-playing');
    document.body.classList.add('intro-ready');
    setTimeout(()=>overlay.remove(), 1100);
    
    // Mark intro as shown for this tab only
    sessionStorage.setItem('intro-shown', 'true');
  }

  // If intro already shown, skip animation and go straight to homepage
  if (introShown) {
    dismiss();
    return;
  }

  core.innerHTML = `
    <div class="ft-sky"></div>
    <div class="ft-sun-haze"></div>
    <div class="ft-mist"></div>
    <div class="ft-hill ft-hill-1"></div>
    <div class="ft-hill ft-hill-2"></div>
    <div class="ft-hill ft-hill-3"></div>
    <div id="ft-far-trees"></div>
    <div id="ft-mid-trees"></div>
    <div id="ft-near-trees"></div>
    <div class="ft-ground"><div class="ft-ground-tex"></div></div>
    <div id="ft-grass"></div>
    <div id="ft-flora-back"></div>
    <div id="ft-flora-mid"></div>
    <div id="ft-flora-front"></div>
    <div class="ft-main-candle">
      <div class="ft-flame-wrap">
        <div class="ft-mc-glow"></div>
        <div class="ft-mc-flame"></div>
        <div class="ft-mc-wick"></div>
      </div>
      <div class="ft-mc-body">
        <div class="ft-mc-shine"></div>
        <div class="ft-mc-wax"></div>
      </div>
    </div>
    <div id="ft-fireflies"></div>
  `;

  const W = window.innerWidth;

  // FAR TREES
  const farT = document.getElementById('ft-far-trees');
  [{x:.03,w:20,h:85},{x:.09,w:16,h:68},{x:.16,w:24,h:104},{x:.22,w:14,h:60},
   {x:.60,w:18,h:76},{x:.68,w:26,h:112},{x:.76,w:16,h:66},{x:.84,w:22,h:94},{x:.92,w:15,h:60}]
  .forEach(d=>{
    const t=document.createElement('div');
    t.style.cssText=`position:absolute;bottom:0;left:${Math.round(d.x*W)}px;width:${d.w}px;height:${d.h}px;opacity:0.36;`;
    t.innerHTML=`<div style="position:absolute;bottom:0;left:50%;transform:translateX(-50%);width:${Math.round(d.w*.18)}px;height:${Math.round(d.h*.27)}px;background:#150805;border-radius:2px;"></div>
    <div style="position:absolute;bottom:${Math.round(d.h*.20)}px;left:50%;transform:translateX(-50%);width:${d.w}px;height:${Math.round(d.h*.82)}px;border-radius:50% 50% 42% 42%;background:linear-gradient(to bottom,#3a0a0e,#2a0608);"></div>`;
    farT.appendChild(t);
  });

  // MID TREES
  const midT = document.getElementById('ft-mid-trees');
  [{x:.01,w:42,h:175,op:.60},{x:.08,w:34,h:140,op:.56},{x:.16,w:50,h:205,op:.63},
   {x:.23,w:32,h:124,op:.54},{x:.69,w:46,h:190,op:.61},{x:.77,w:36,h:148,op:.58},
   {x:.85,w:52,h:215,op:.64},{x:.93,w:30,h:126,op:.52}]
  .forEach(d=>{
    const t=document.createElement('div');
    t.style.cssText=`position:absolute;bottom:0;left:${Math.round(d.x*W)}px;width:${d.w}px;height:${d.h}px;opacity:${d.op};`;
    t.innerHTML=`<div style="position:absolute;bottom:0;left:50%;transform:translateX(-50%);width:${Math.round(d.w*.20)}px;height:${Math.round(d.h*.30)}px;background:linear-gradient(to right,#1a0a08,#2c1810);border-radius:3px 3px 1px 1px;"></div>
    <div style="position:absolute;bottom:${Math.round(d.h*.22)}px;left:50%;transform:translateX(-50%);width:${d.w}px;height:${Math.round(d.h*.80)}px;border-radius:50% 50% 44% 44%;background:linear-gradient(155deg,#3a0a0e 0%,#2a0608 55%,#1a0503 100%);"></div>
    <div style="position:absolute;bottom:${Math.round(d.h*.38)}px;left:50%;transform:translateX(-50%);width:${Math.round(d.w*.72)}px;height:${Math.round(d.h*.40)}px;border-radius:50%;background:rgba(84,12,18,0.25);"></div>`;
    midT.appendChild(t);
  });

  // NEAR TREES
  const nearT = document.getElementById('ft-near-trees');
  [{x:.00,w:65,h:190,op:.80},{x:.07,w:50,h:150,op:.74},
   {x:.74,w:62,h:184,op:.78},{x:.83,w:48,h:144,op:.72},{x:.91,w:70,h:196,op:.82}]
  .forEach(d=>{
    const t=document.createElement('div');
    t.style.cssText=`position:absolute;bottom:0;left:${Math.round(d.x*W)}px;width:${d.w}px;height:${d.h}px;opacity:${d.op};`;
    t.innerHTML=`<div style="position:absolute;bottom:0;left:50%;transform:translateX(-50%);width:${Math.round(d.w*.22)}px;height:${Math.round(d.h*.33)}px;background:linear-gradient(to right,#150805,#2c1810);border-radius:4px 4px 2px 2px;"></div>
    <div style="position:absolute;bottom:${Math.round(d.h*.25)}px;left:50%;transform:translateX(-50%);width:${d.w}px;height:${Math.round(d.h*.78)}px;border-radius:50% 50% 46% 46%;background:linear-gradient(150deg,#3a0a0e 0%,#2a0608 48%,#1a0503 82%,#0f0302 100%);"></div>
    <div style="position:absolute;bottom:${Math.round(d.h*.42)}px;left:50%;transform:translateX(-50%);width:${Math.round(d.w*.68)}px;height:${Math.round(d.h*.42)}px;border-radius:50%;background:rgba(60,8,14,0.30);"></div>`;
    nearT.appendChild(t);
  });

  // GRASS
  const grassEl = document.getElementById('ft-grass');
  for(let i=0;i<40;i++){
    const g=document.createElement('div');
    const gw=8+Math.random()*18, gh=14+Math.random()*28, gx=Math.random()*W;
    g.style.cssText=`position:absolute;bottom:0;left:${gx}px;width:${gw}px;height:${gh}px;border-radius:50% 50% 28% 28%;background:linear-gradient(to top,#1a0a08,#2c1810 42%,#3a1815 70%,#4a2420 100%);opacity:${0.35+Math.random()*0.45};`;
    grassEl.appendChild(g);
  }

  // FLOWERS
  const flowerColors=[
    ['#C4686E','#B05666','#E8C87A'],
    ['#D4887A','#C87068','#F5ECD8'],
    ['#E8C87A','#D8B85A','#F5ECD8'],
    ['#D4887A','#C87068','#F5E0C8'],
    ['#C4686E','#B05666','#E8D8C0'],
    ['#B87A4A','#A86A3A','#F5ECD8'],
    ['#E8C87A','#D8B85A','#F5ECD8'],
    ['#C85A3A','#B84A2A','#F5ECD8'],
    ['#D4887A','#C87068','#E8D8C0'],
    ['#B87A4A','#A86A3A','#F5ECD8'],
  ];

  const candleCX = W/2, czone = 100;

  function makeFlower(container, x, bottomPx, stemH, petalSz, colorSet, opacity, delay){
    if(x > candleCX-czone && x < candleCX+czone) return;
    const [p1,p2,center] = colorSet;
    const f = document.createElement('div');
    const petals = 5+Math.floor(Math.random()*3);
    let petalHTML = '';
    for(let p=0;p<petals;p++){
      const angle=(360/petals)*p;
      petalHTML+=`<div style="position:absolute;width:${petalSz}px;height:${petalSz*1.3}px;border-radius:50% 50% 40% 40%;background:radial-gradient(ellipse at 50% 30%,${p1},${p2} 80%);left:50%;top:50%;transform-origin:50% 100%;transform:translateX(-50%) translateY(-100%) rotate(${angle}deg);opacity:0.92;"></div>`;
    }
    f.style.cssText=`position:absolute;bottom:${bottomPx}px;left:${x}px;width:${petalSz*3}px;opacity:${opacity};`;
    f.innerHTML=`
      <div style="position:absolute;bottom:0;left:50%;transform:translateX(-50%);width:2px;height:${stemH}px;background:linear-gradient(to top,#1a0a08,#3a1815);border-radius:1px;animation:ftSway ${2+Math.random()*2}s ease-in-out ${delay}s infinite;transform-origin:center bottom;"></div>
      <div style="position:absolute;bottom:${stemH - petalSz*.6}px;left:50%;transform:translateX(-50%);width:${petalSz*2.4}px;height:${petalSz*2.4}px;">
        ${petalHTML}
        <div style="position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:${Math.round(petalSz*.9)}px;height:${Math.round(petalSz*.9)}px;border-radius:50%;background:radial-gradient(circle,${center},rgba(240,210,60,0.7) 70%);z-index:2;"></div>
      </div>
    `;
    container.appendChild(f);
  }

  const floraBack  = document.getElementById('ft-flora-back');
  const floraMid   = document.getElementById('ft-flora-mid');
  const floraFront = document.getElementById('ft-flora-front');

  for(let i=0;i<30;i++){
    const x=Math.random()*W;
    makeFlower(floraBack,x,0,55+Math.random()*38,7+Math.random()*5,flowerColors[Math.floor(Math.random()*flowerColors.length)],0.55+Math.random()*0.25,Math.random()*3);
  }
  for(let i=0;i<52;i++){
    const x=Math.random()*W;
    makeFlower(floraMid,x,0,36+Math.random()*28,8+Math.random()*7,flowerColors[Math.floor(Math.random()*flowerColors.length)],0.65+Math.random()*0.28,Math.random()*3);
  }
  for(let i=0;i<60;i++){
    const x=Math.random()*W;
    makeFlower(floraFront,x,0,20+Math.random()*20,6+Math.random()*6,flowerColors[Math.floor(Math.random()*flowerColors.length)],0.72+Math.random()*0.25,Math.random()*3);
  }

  // FIREFLIES
  const ffEl = document.getElementById('ft-fireflies');
  for(let i=0;i<22;i++){
    const f=document.createElement('div');
    const sz=1.8+Math.random()*2.8;
    f.style.cssText=`position:absolute;width:${sz}px;height:${sz}px;border-radius:50%;background:rgba(255,242,140,0.88);left:${10+Math.random()*80}%;bottom:${12+Math.random()*45}%;animation:ftFirefly ${3+Math.random()*5}s linear ${Math.random()*7}s infinite;`;
    ffEl.appendChild(f);
  }

  // Orchestrate the requested sequence using only JS:
  // black -> candle -> reveal garden -> fade out -> show homepage
  function orchestrateIntro() {
    const seqTimers = [];
    const main = core.querySelector('.ft-main-candle');
    const flame = main && main.querySelector('.ft-mc-flame');
    const glow = main && main.querySelector('.ft-mc-glow');

    const sceneSelectors = ['.ft-sky', '.ft-hill', '#ft-far-trees', '#ft-mid-trees', '#ft-near-trees', '.ft-ground', '#ft-grass', '#ft-flora-back', '#ft-flora-mid', '#ft-flora-front', '#ft-fireflies'];
    const sceneEls = sceneSelectors.map(s=>Array.from(core.querySelectorAll(s))).flat();

    // Ensure overlay is visible and page remains hidden
    overlay.classList.remove('is-hidden');
    document.body.classList.add('intro-playing');
    document.body.classList.remove('intro-ready');

    // Hide full scene initially so the intro starts as a pure black screen
    sceneEls.forEach(el=>{ el.style.transition = 'opacity 1.4s ease'; el.style.opacity = '0'; });
    if (main) {
      main.style.transition = 'opacity 1.2s ease, transform 1.2s ease';
      main.style.opacity = '0';
      main.style.transform = 'translate(-50%, -50%) scale(0.98)';
    }
    if (flame) { flame.style.transition = 'transform 0.8s ease, opacity 0.8s ease'; flame.style.opacity = '0'; flame.style.transform = 'scale(0.65)'; }
    if (glow)  { glow.style.transition = 'transform 1s ease, opacity 1s ease'; glow.style.opacity = '0'; glow.style.transform = 'translateX(-50%) scale(0.7)'; }

    const fadeTargets = [
      document.querySelector('nav'),
      document.querySelector('.hero-text'),
      document.querySelector('.candle-scene'),
      document.querySelector('.banner-slider')
    ].filter(Boolean);
    fadeTargets.forEach(el => {
      el.style.transition = 'opacity 1.2s ease';
      el.style.opacity = '0';
    });

    // 1) candle appears first on black
    seqTimers.push(setTimeout(()=>{
      if (main) main.style.opacity = '1';
      const flameWrap = core.querySelector('.ft-flame-wrap');
      const candleBody = core.querySelector('.ft-mc-body');
      const candleGlow = core.querySelector('.ft-mc-glow');
      const candleWick = core.querySelector('.ft-mc-wick');
      if (flameWrap) flameWrap.classList.add('ft-show');
      if (candleBody) candleBody.classList.add('ft-show');
      if (candleGlow) candleGlow.classList.add('ft-show');
      if (candleWick) candleWick.classList.add('ft-show');
      if (glow)  { glow.style.opacity = '1'; glow.style.transform = 'translateX(-50%) scale(1)'; }
      if (flame) { flame.style.opacity = '1'; flame.style.transform = 'scale(0.88)'; }
    }, 600));

    // 2) garden starts opening
    seqTimers.push(setTimeout(()=>{
      sceneEls.forEach(el=>el.style.opacity = '1');
    }, 1900));

    // 3) candle brightens a little after the garden is visible
    seqTimers.push(setTimeout(()=>{
      if (glow) { glow.style.opacity = '1'; glow.style.transform = 'translateX(-50%) scale(1.18)'; }
      if (flame){ flame.style.opacity = '1'; flame.style.transform = 'scale(1)'; }
      const flameWrap = core.querySelector('.ft-flame-wrap');
      if (flameWrap) flameWrap.classList.add('ft-show');
    }, 2500));

    // 4) fade out intro elements, then show homepage
    seqTimers.push(setTimeout(()=>{
      dismiss();
    }, 3600));

    return seqTimers;
  }

  // start orchestrator and set a gentle fallback
  const seqTimers = orchestrateIntro();
  // clear any previously set auto-timer and set a fallback final timeout
  let fallbackTimer = setTimeout(dismiss, TOTAL_DURATION + 800);

  overlay.addEventListener('click', ()=>{
    seqTimers.forEach(t=>clearTimeout(t));
    clearTimeout(fallbackTimer);
    dismiss();
  }, { once: true });
})();