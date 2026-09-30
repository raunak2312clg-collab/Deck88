(() => {
  const qs = (s, c=document) => c.querySelector(s);
  const qsa = (s, c=document) => [...c.querySelectorAll(s)];
  const finePointer = matchMedia('(pointer:fine)').matches;
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---------- PRELOADER ----------
  const preloader = qs('.preloader');
  const preLine = qs('.preloader__line span');
  if (window.gsap && !reduceMotion) {
    gsap.timeline({defaults:{ease:'power3.out'}})
      .to(preLine,{x:'0%',duration:1.15})
      .to('.preloader__logo',{scale:.92,duration:.65},.35)
      .to('.preloader__copy',{opacity:.35,duration:.3},.7)
      .to(preloader,{yPercent:-100,duration:.9,ease:'power4.inOut',delay:.15})
      .set(preloader,{display:'none'});
  } else {
    setTimeout(() => preloader.style.display='none', 350);
  }

  // ---------- LENIS ----------
  let lenis = null;
  if (window.Lenis && !reduceMotion) {
    lenis = new Lenis({duration:1.15,smoothWheel:true,wheelMultiplier:.9,touchMultiplier:1.5});
    const raf = time => { lenis.raf(time); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
  }

  // ---------- TRUE INFINITE MARQUEE ----------
  const marqueeTrack=qs('.coastal-marquee__track');
  const marqueeSeed=qs('.coastal-marquee__group',marqueeTrack || document);
  if(marqueeTrack && marqueeSeed){
    const buildMarquee=()=>{
      qsa('.coastal-marquee__group',marqueeTrack).slice(1).forEach(n=>n.remove());
      let safety=0;
      while(marqueeTrack.scrollWidth < innerWidth*2.6 && safety<12){
        const clone=marqueeSeed.cloneNode(true);
        clone.setAttribute('aria-hidden','true');
        marqueeTrack.appendChild(clone);
        safety++;
      }
      // Always keep at least two identical groups for seamless wrap.
      if(qsa('.coastal-marquee__group',marqueeTrack).length<2){
        const clone=marqueeSeed.cloneNode(true);clone.setAttribute('aria-hidden','true');marqueeTrack.appendChild(clone);
      }
    };
    buildMarquee();
    let marqueeX=0,last=performance.now();
    const speed=reduceMotion?0:52; // px / second
    const marqueeLoop=now=>{
      const dt=Math.min((now-last)/1000,.05); last=now;
      const first=qs('.coastal-marquee__group',marqueeTrack);
      const wrap=first ? first.getBoundingClientRect().width : 0;
      if(speed && wrap){marqueeX-=speed*dt;if(-marqueeX>=wrap)marqueeX+=wrap;marqueeTrack.style.transform=`translate3d(${marqueeX}px,0,0)`;}
      requestAnimationFrame(marqueeLoop);
    };
    requestAnimationFrame(marqueeLoop);
    let resizeTimer;
    addEventListener('resize',()=>{clearTimeout(resizeTimer);resizeTimer=setTimeout(()=>{marqueeX=0;marqueeTrack.style.transform='translate3d(0,0,0)';buildMarquee();},160)});
  }

  // ---------- GSAP SETUP ----------
  if (window.gsap && window.ScrollTrigger) gsap.registerPlugin(ScrollTrigger);
  if (window.gsap && window.Flip) gsap.registerPlugin(Flip);

  // Split only by words but retain line-style masks. Works without external split library.
  qsa('.split-lines').forEach(el => {
    const text = el.textContent.trim();
    el.setAttribute('aria-label', text);
    const words = text.split(/\s+/);
    el.innerHTML = words.map(w => `<span class="line-wrap"><span class="line">${w}</span></span>`).join(' ');
    // Hero keeps words on a shared visual line on desktop via inline-block.
    if (el.classList.contains('hero__title')) {
      qsa('.line-wrap', el).forEach(w => w.style.display='inline-block');
    }
  });

  // ---------- HERO ENTRY ----------
  if (window.gsap && !reduceMotion) {
    gsap.set('.hero__frame,.pattern-card,.hero-seal',{opacity:0});
    gsap.set('.hero__title .line',{yPercent:115});
    gsap.set('.hero__eyebrow,.hero__desc,.hero__cta,.hero-divider',{opacity:0,y:18});
    gsap.timeline({delay:1.55,defaults:{ease:'power4.out'}})
      .to('.hero__frame--left',{opacity:1,x:0,duration:1.15},0)
      .fromTo('.hero__frame--left',{x:-90},{x:0,duration:1.15},0)
      .to('.hero__frame--right',{opacity:1,x:0,duration:1.05},.08)
      .fromTo('.hero__frame--right',{x:90},{x:0,duration:1.05},.08)
      .to('.hero__frame--left-top,.hero__frame--right-bottom',{opacity:1,scale:1,duration:.9,stagger:.12},.18)
      .fromTo('.hero__frame--left-top,.hero__frame--right-bottom',{scale:.82},{scale:1,duration:.9,stagger:.12},.18)
      .to('.pattern-card',{opacity:1,scale:1,duration:.75,stagger:.13},.25)
      .fromTo('.pattern-card',{scale:.72,rotation:-8},{scale:1,rotation:0,duration:.75,stagger:.13},.25)
      .to('.hero__eyebrow',{opacity:1,y:0,duration:.6},.25)
      .to('.hero__title .line',{yPercent:0,duration:.95,stagger:.07},.38)
      .to('.hero-divider',{opacity:.78,y:0,duration:.55},.64)
      .to('.hero__desc',{opacity:1,y:0,duration:.65},.74)
      .to('.hero__cta',{opacity:1,y:0,duration:.6},.88)
      .to('.hero-seal',{opacity:1,scale:1,duration:.7},.8)
      .fromTo('.hero-seal',{scale:.72},{scale:1,duration:.7},.8);
  }

  // ---------- CURSOR ----------
  if (finePointer) {
    const dot = qs('.cursor--dot');
    const ring = qs('.cursor--ring');
    const label = qs('.cursor--ring span');
    let mx=-100,my=-100,rx=-100,ry=-100;
    window.addEventListener('mousemove',e=>{mx=e.clientX;my=e.clientY;dot.style.transform=`translate(${mx}px,${my}px) translate(-50%,-50%)`;});
    const tick=()=>{rx+=(mx-rx)*.14;ry+=(my-ry)*.14;ring.style.transform=`translate(${rx}px,${ry}px) translate(-50%,-50%)`;requestAnimationFrame(tick)};tick();
    qsa('a,button,input,select,.dish-row').forEach(el=>{
      el.addEventListener('mouseenter',()=>document.body.classList.add('cursor-hover'));
      el.addEventListener('mouseleave',()=>document.body.classList.remove('cursor-hover'));
    });
    qsa('.chef-card__image,.editorial-card,.journal-card__img').forEach(el=>{
      el.addEventListener('mouseenter',()=>{document.body.classList.add('cursor-label');label.textContent='VIEW';});
      el.addEventListener('mouseleave',()=>{document.body.classList.remove('cursor-label');label.textContent='';});
    });
    qsa('.interactive-orb').forEach(el=>{
      el.addEventListener('mouseenter',()=>{document.body.classList.add('cursor-label');label.textContent='EXPLORE';});
      el.addEventListener('mouseleave',()=>{document.body.classList.remove('cursor-label');label.textContent='';});
    });
    qs('.play-button')?.addEventListener('mouseenter',()=>{document.body.classList.add('cursor-label');label.textContent='PLAY';});
    qs('.play-button')?.addEventListener('mouseleave',()=>{document.body.classList.remove('cursor-label');label.textContent='';});
  }

  // ---------- MAGNETIC ----------
  if (finePointer && !reduceMotion) {
    qsa('.magnetic').forEach(el=>{
      const strength=Number(el.dataset.strength||8);
      el.addEventListener('mousemove',e=>{
        const r=el.getBoundingClientRect();
        const x=(e.clientX-r.left-r.width/2)/r.width*strength;
        const y=(e.clientY-r.top-r.height/2)/r.height*strength;
        el.style.transform=`translate(${x}px,${y}px)`;
      });
      el.addEventListener('mouseleave',()=>{el.style.transition='transform .55s cubic-bezier(.2,.9,.2,1.3)';el.style.transform='translate(0,0)';setTimeout(()=>el.style.transition='',560)});
    });
  }

  // ---------- INTERACTIVE ORBS THROUGHOUT PAGE ----------
  // Pointer motion and scroll motion use separate CSS variables so they can
  // layer together instead of fighting over the same transform.
  if (finePointer && !reduceMotion) {
    qsa('[data-float-orb]').forEach(orb=>{
      const zone=orb.closest('[data-orb-zone]') || orb.parentElement;
      if(!zone) return;
      zone.addEventListener('mousemove',e=>{
        const r=zone.getBoundingClientRect();
        const nx=((e.clientX-r.left)/r.width)-.5;
        const ny=((e.clientY-r.top)/r.height)-.5;
        const ampX=Number(orb.dataset.floatX || 18);
        const ampY=Number(orb.dataset.floatY || 12);
        const ampRot=Number(orb.dataset.floatRot || 4);
        const x=nx*ampX, y=ny*ampY, rot=nx*ampRot;
        if(window.gsap){
          gsap.to(orb,{
            '--orb-mx':`${x}px`,
            '--orb-my':`${y}px`,
            '--orb-mr':`${rot}deg`,
            duration:.8,ease:'power3.out',overwrite:'auto'
          });
        }else{
          orb.style.setProperty('--orb-mx',`${x}px`);
          orb.style.setProperty('--orb-my',`${y}px`);
          orb.style.setProperty('--orb-mr',`${rot}deg`);
        }
      });
      zone.addEventListener('mouseleave',()=>{
        if(window.gsap){
          gsap.to(orb,{
            '--orb-mx':'0px','--orb-my':'0px','--orb-mr':'0deg',
            duration:.9,ease:'elastic.out(1,.45)',overwrite:'auto'
          });
        }else{
          orb.style.setProperty('--orb-mx','0px');
          orb.style.setProperty('--orb-my','0px');
          orb.style.setProperty('--orb-mr','0deg');
        }
      });
    });
  }

  // ---------- MOUSE PARALLAX HERO ----------
  if (finePointer && window.gsap && !reduceMotion) {
    const layers=qsa('[data-depth]');
    qs('.hero').addEventListener('mousemove',e=>{
      const nx=(e.clientX/window.innerWidth-.5), ny=(e.clientY/window.innerHeight-.5);
      layers.forEach(layer=>{
        const d=Number(layer.dataset.depth||1);
        gsap.to(layer,{x:nx*18*d,y:ny*13*d,duration:.9,ease:'power2.out',overwrite:'auto'});
      });
    });
  }

  // ---------- SCROLL ANIMATIONS ----------
  if (window.gsap && window.ScrollTrigger && !reduceMotion) {
    qsa('.reveal-up').forEach((el,i)=>{
      gsap.from(el,{scrollTrigger:{trigger:el,start:'top 88%'},y:46,opacity:0,duration:.9,ease:'power3.out'});
    });
    qsa('.reveal-clip').forEach(el=>{
      gsap.from(el,{scrollTrigger:{trigger:el,start:'top 88%'},clipPath:'inset(0 0 100% 0)',y:24,duration:1.15,ease:'power4.out'});
    });
    qsa('.section-title.split-lines').forEach(el=>{
      gsap.from(qsa('.line',el),{scrollTrigger:{trigger:el,start:'top 88%'},yPercent:115,duration:.95,stagger:.055,ease:'power4.out'});
    });
    gsap.to('.hero__frame--left',{y:-130,scrollTrigger:{trigger:'.hero',start:'top top',end:'bottom top',scrub:1}});
    gsap.to('.hero__frame--right',{y:95,scrollTrigger:{trigger:'.hero',start:'top top',end:'bottom top',scrub:1.2}});
    gsap.to('.hero__frame--right-bottom',{y:-65,scrollTrigger:{trigger:'.hero',start:'top top',end:'bottom top',scrub:1.4}});
    gsap.to('.pattern-card--hero-a',{y:80,rotation:18,scrollTrigger:{trigger:'.hero',start:'top top',end:'bottom top',scrub:1}});
    gsap.to('.story__image',{y:-45,scrollTrigger:{trigger:'.story',start:'top bottom',end:'bottom top',scrub:1.2}});
    gsap.to('.story__mini',{y:55,scrollTrigger:{trigger:'.story',start:'top bottom',end:'bottom top',scrub:1.2}});
    gsap.to('.cinema__video',{yPercent:5,scale:1.07,scrollTrigger:{trigger:'.cinema',start:'top bottom',end:'bottom top',scrub:1.2}});
    gsap.to('.testimonial__visual',{y:-35,scrollTrigger:{trigger:'.testimonial',start:'top bottom',end:'bottom top',scrub:1.5}});

    // Edge ornaments now respond to scroll as well as the mouse, echoing the
    // independently drifting hero layers. Each one gets a slightly different
    // direction so the page feels composed rather than mechanically repeated.
    qsa('[data-float-orb]').forEach((orb,i)=>{
      const zone=orb.closest('[data-orb-zone]') || orb.parentElement;
      if(!zone) return;
      const dir=i%2===0 ? 1 : -1;
      const yStart=-10*dir, yEnd=24*dir;
      const xEnd=6*(i%3-1);
      const rStart=-3*dir, rEnd=7*dir;
      gsap.fromTo(orb,
        {'--orb-sy':`${yStart}px`,'--orb-sx':'0px','--orb-sr':`${rStart}deg`},
        {'--orb-sy':`${yEnd}px`,'--orb-sx':`${xEnd}px`,'--orb-sr':`${rEnd}deg`,ease:'none',
          scrollTrigger:{trigger:zone,start:'top bottom',end:'bottom top',scrub:1.15}}
      );
    });

    gsap.fromTo('.deck-texture-ribbon',{backgroundPosition:'50% 40%'},{backgroundPosition:'50% 66%',ease:'none',scrollTrigger:{trigger:'.team',start:'top bottom',end:'bottom top',scrub:1.3}});
  }

  // ---------- HEADER / ACTIVE NAV / PROGRESS ----------
  const header=qs('.site-header');
  let lastY=0;
  const sections=qsa('main section[id]');
  window.addEventListener('scroll',()=>{
    const y=scrollY;
    header.classList.toggle('is-scrolled',y>30);
    if(y>360 && y>lastY+8) header.classList.add('is-hidden');
    if(y<lastY-8) header.classList.remove('is-hidden');
    lastY=y;
    const max=document.documentElement.scrollHeight-innerHeight;
    qs('.scroll-progress span').style.transform=`scaleX(${max>0?y/max:0})`;
    let active='home';
    sections.forEach(s=>{if(y>=s.offsetTop-220) active=s.id});
    qsa('.nav-link').forEach(a=>a.classList.toggle('is-active',a.getAttribute('href')===`#${active}`));
  },{passive:true});

  // ---------- SMOOTH ANCHORS ----------
  qsa('a[href^="#"]').forEach(a=>a.addEventListener('click',e=>{
    const id=a.getAttribute('href');
    if(id==='#') return;
    const target=qs(id);
    if(!target)return;
    e.preventDefault();
    closeMenu();
    if(lenis) lenis.scrollTo(target,{offset:-65,duration:1.25}); else target.scrollIntoView({behavior:'smooth'});
  }));

  // ---------- MOBILE MENU ----------
  const menuToggle=qs('.menu-toggle'), mobileMenu=qs('.mobile-menu');
  function closeMenu(){menuToggle?.classList.remove('is-open');menuToggle?.setAttribute('aria-expanded','false');mobileMenu?.classList.remove('is-open');mobileMenu?.setAttribute('aria-hidden','true');document.body.classList.remove('is-locked')}
  menuToggle?.addEventListener('click',()=>{
    const open=!menuToggle.classList.contains('is-open');
    menuToggle.classList.toggle('is-open',open);mobileMenu.classList.toggle('is-open',open);menuToggle.setAttribute('aria-expanded',String(open));mobileMenu.setAttribute('aria-hidden',String(!open));document.body.classList.toggle('is-locked',open);
  });

  // ---------- MENU HOVER IMAGE ----------
  if(finePointer){
    const preview=qs('.menu-preview'), img=qs('img',preview);
    qsa('.dish-row').forEach(row=>{
      row.addEventListener('mouseenter',()=>{img.src=row.dataset.image;preview.classList.add('is-visible')});
      row.addEventListener('mousemove',e=>{preview.style.left=`${e.clientX+120}px`;preview.style.top=`${e.clientY}px`});
      row.addEventListener('mouseleave',()=>preview.classList.remove('is-visible'));
    });
  }

  // ---------- TESTIMONIAL / DECK FEELING SLIDER ----------
  let quoteIndex=0;
  const quotes=qsa('.quote'),
        tImgs=qsa('.testimonial-img'),
        indexEl=qs('.quote-index span'),
        prog=qs('.quote-index i'),
        moodTitle=qs('#moodSlideTitle');
  let moodTitleTimer;
  function showQuote(next){
    quoteIndex=(next+quotes.length)%quotes.length;
    quotes.forEach((q,i)=>q.classList.toggle('is-active',i===quoteIndex));
    tImgs.forEach((im,i)=>im.classList.toggle('is-active',i===quoteIndex));
    if(indexEl) indexEl.textContent=String(quoteIndex+1).padStart(2,'0');

    // Real progress: 01 = 1/3, 02 = 2/3, 03 = full line.
    if(prog){
      const pct=((quoteIndex+1)/quotes.length)*100;
      prog.style.setProperty('--progress',`${pct}%`);
      prog.dataset.index=String(quoteIndex+1);
    }

    // Each slide owns its own headline instead of repeating one global tagline.
    if(moodTitle){
      const nextTitle=quotes[quoteIndex]?.dataset.title || '';
      clearTimeout(moodTitleTimer);
      moodTitle.classList.add('is-changing');
      moodTitleTimer=setTimeout(()=>{
        moodTitle.textContent=nextTitle;
        moodTitle.classList.remove('is-changing');
      },150);
    }
  }
  qs('[data-quote-next]')?.addEventListener('click',()=>showQuote(quoteIndex+1));
  qs('[data-quote-prev]')?.addEventListener('click',()=>showQuote(quoteIndex-1));
  showQuote(0);
  setInterval(()=>{if(!document.hidden)showQuote(quoteIndex+1)},7000);


  // ---------- FULL MENU POPUP ----------
  const fullMenuModal=qs('#fullMenuModal');
  const openFullMenuBtn=qs('#openFullMenu');
  const fullMenuScroll=qs('.full-menu-modal__scroll',fullMenuModal||document);
  let menuRestoreY=0;

  // Lenis controls the page scroll. The full-menu panel is deliberately a
  // separate native scroll region, so input inside it must never be consumed
  // by the page scroller. The data-lenis-prevent attributes in the markup are
  // the primary guard; these listeners are a robust fallback for wheel/touch.
  if(fullMenuScroll){
    fullMenuScroll.addEventListener('wheel',e=>{
      e.stopPropagation();
    },{passive:true});
    fullMenuScroll.addEventListener('touchmove',e=>{
      e.stopPropagation();
    },{passive:true});
  }


  function openFullMenu(){
    if(!fullMenuModal) return;
    menuRestoreY=window.scrollY;
    fullMenuModal.classList.add('is-open');
    fullMenuModal.setAttribute('aria-hidden','false');
    document.body.classList.add('is-locked','full-menu-open');
    lenis?.stop?.();
    if(fullMenuScroll) fullMenuScroll.scrollTop=0;
    requestAnimationFrame(()=>qs('.full-menu-modal__close',fullMenuModal)?.focus({preventScroll:true}));
    if(window.gsap && !reduceMotion){
      gsap.fromTo('.full-menu-modal__intro h2',{y:34,opacity:0},{y:0,opacity:1,duration:.75,ease:'power4.out'});
      gsap.fromTo('.full-menu-modal__intro .eyebrow,.full-menu-modal__intro>p:not(.eyebrow)',{y:18,opacity:0},{y:0,opacity:1,duration:.6,stagger:.08,ease:'power3.out'});
    }
  }
  function closeFullMenu(){
    if(!fullMenuModal) return;
    fullMenuModal.classList.remove('is-open');
    fullMenuModal.setAttribute('aria-hidden','true');
    document.body.classList.remove('is-locked','full-menu-open');
    lenis?.start?.();
    openFullMenuBtn?.focus({preventScroll:true});
  }
  openFullMenuBtn?.addEventListener('click',openFullMenu);
  qs('.full-menu-modal__close',fullMenuModal||document)?.addEventListener('click',closeFullMenu);
  // The footer action simply returns to the site at the same position
  // from which the full menu was opened.
  qs('.full-menu-back',fullMenuModal||document)?.addEventListener('click',closeFullMenu);

  // Reveal each alternating panel as it enters the independently scrolling popup.
  if(fullMenuModal && 'IntersectionObserver' in window){
    const menuCourseObserver=new IntersectionObserver(entries=>{
      entries.forEach(entry=>{
        if(entry.isIntersecting) entry.target.classList.add('is-seen');
      });
    },{root:fullMenuScroll,threshold:.18,rootMargin:'0px 0px -7% 0px'});
    qsa('.full-menu-course',fullMenuModal).forEach(course=>menuCourseObserver.observe(course));
  }



  // ---------- V16 FILTERABLE RESTAURANT GALLERY ----------
  // The reference video uses a portfolio-style filter where cards smoothly
  // reflow into their new positions. We use GSAP Flip when available and a
  // clean fade fallback otherwise.
  const deckGallery=qs('.deck-gallery');
  const deckGalleryGrid=qs('[data-deck-gallery-grid]');
  if(deckGallery && deckGalleryGrid){
    const items=qsa('.deck-gallery__item',deckGalleryGrid);
    const filters=qsa('.deck-gallery__filter',deckGallery);
    const filterLine=qs('.deck-gallery__filter-line',deckGallery);
    const loadMore=qs('.deck-gallery__more',deckGallery);
    let activeFilter='all';
    let loadedCount=9;

    const matches=(item,filter)=>filter==='all' || (item.dataset.galleryCategory||'').split(/\s+/).includes(filter);
    const shouldShow=(item,index)=> activeFilter==='all' ? index<loadedCount : matches(item,activeFilter);

    const positionFilterLine=(button,instant=false)=>{
      if(!button||!filterLine)return;
      const parent=button.parentElement.getBoundingClientRect();
      const box=button.getBoundingClientRect();
      const vars={x:box.left-parent.left,width:box.width,duration:instant?0:.42,ease:'power3.out'};
      if(window.gsap) gsap.to(filterLine,vars);
      else {filterLine.style.transform=`translateX(${vars.x}px)`;filterLine.style.width=`${vars.width}px`;}
    };

    const syncLoadMore=()=>{
      if(!loadMore)return;
      const done=loadedCount>=items.length;
      loadMore.parentElement.hidden=activeFilter!=='all';
      loadMore.classList.toggle('is-done',done);
      qs('span',loadMore).textContent=done?'All Loaded':'Load More';
    };

    const applyLayout=(animate=true)=>{
      const state=(animate && window.Flip && !reduceMotion)?Flip.getState(items):null;
      items.forEach((item,index)=>item.classList.toggle('is-hidden',!shouldShow(item,index)));
      if(state){
        Flip.from(state,{
          duration:.72,ease:'power2.inOut',absolute:true,absoluteOnLeave:true,scale:true,
          stagger:.018,
          onEnter:els=>gsap.fromTo(els,{opacity:0,scale:.94},{opacity:1,scale:1,duration:.48,stagger:.025,ease:'power2.out'}),
          onLeave:els=>gsap.to(els,{opacity:0,scale:.94,duration:.28,ease:'power2.in'}),
          onComplete:()=>window.ScrollTrigger&&ScrollTrigger.refresh()
        });
      }else if(window.gsap && animate && !reduceMotion){
        gsap.fromTo(items.filter((item,index)=>shouldShow(item,index)),{opacity:0,y:18},{opacity:1,y:0,duration:.48,stagger:.035,ease:'power2.out'});
      }
      syncLoadMore();
      if(window.ScrollTrigger) setTimeout(()=>ScrollTrigger.refresh(),80);
    };

    // initial progressive state, as in the reference before LOAD MORE.
    applyLayout(false);
    requestAnimationFrame(()=>positionFilterLine(qs('.deck-gallery__filter.is-active',deckGallery),true));

    filters.forEach(btn=>{
      btn.addEventListener('mouseenter',()=>positionFilterLine(btn));
      btn.addEventListener('focus',()=>positionFilterLine(btn));
      btn.addEventListener('mouseleave',()=>positionFilterLine(qs('.deck-gallery__filter.is-active',deckGallery)));
      btn.addEventListener('click',()=>{
        activeFilter=btn.dataset.galleryFilter||'all';
        filters.forEach(b=>b.classList.toggle('is-active',b===btn));
        positionFilterLine(btn);
        applyLayout(true);
      });
    });

    loadMore?.addEventListener('click',()=>{
      if(loadedCount>=items.length)return;
      loadedCount=items.length;
      applyLayout(true);
      if(window.gsap && !reduceMotion) gsap.fromTo(loadMore,{scale:1},{scale:.96,duration:.12,yoyo:true,repeat:1});
    });

    // Hover treatment from the video: image subtly pushes opposite the mouse,
    // while the circular view target follows inside the card.
    items.forEach(item=>{
      const img=qs('img',item), zoom=qs('.deck-gallery__zoom',item);
      let qx=null,qy=null,zx=null,zy=null;
      if(window.gsap){
        qx=gsap.quickTo(img,'x',{duration:.45,ease:'power3.out'});
        qy=gsap.quickTo(img,'y',{duration:.45,ease:'power3.out'});
        zx=gsap.quickTo(zoom,'x',{duration:.25,ease:'power3.out'});
        zy=gsap.quickTo(zoom,'y',{duration:.25,ease:'power3.out'});
      }
      item.addEventListener('mouseenter',()=>{ if(window.gsap&&!reduceMotion) gsap.to(img,{scale:1.055,duration:.65,ease:'power3.out'}); });
      item.addEventListener('mousemove',e=>{
        if(!finePointer||reduceMotion)return;
        const r=item.getBoundingClientRect();
        const nx=(e.clientX-r.left)/r.width-.5, ny=(e.clientY-r.top)/r.height-.5;
        if(qx){qx(nx*-10);qy(ny*-10);zx(nx*20);zy(ny*20);}
      });
      item.addEventListener('mouseleave',()=>{
        if(window.gsap&&!reduceMotion){gsap.to(img,{scale:1,x:0,y:0,duration:.65,ease:'power3.out'});gsap.to(zoom,{x:0,y:0,duration:.35,ease:'power3.out'});}
      });
    });

    if(window.gsap && window.ScrollTrigger && !reduceMotion){
      gsap.from('.deck-gallery__item:not(.is-hidden)',{
        scrollTrigger:{trigger:deckGalleryGrid,start:'top 82%',once:true},
        y:42,opacity:0,scale:.975,duration:.75,stagger:.065,ease:'power3.out'
      });
    }

    addEventListener('resize',()=>positionFilterLine(qs('.deck-gallery__filter.is-active',deckGallery),true));
  }


  // ---------- IMAGE LIGHTBOX GALLERIES ----------
  // Reused by both “Eat. Drink. Linger.” and “Food. Space. Goa.”.
  // Each data-gallery value creates an independent gallery, so the arrow
  // navigation stays within the section the visitor opened.
  const allGalleryItems=qsa('.gallery-trigger');
  const lightbox=qs('#imageLightbox');
  const lightboxImg=qs('.image-lightbox__image',lightbox||document);
  const lightboxCaption=qs('.image-lightbox__caption',lightbox||document);
  const lightboxIndex=qs('.image-lightbox__index',lightbox||document);
  let activeGallery=[];
  let galleryIndex=0;

  function galleryFor(item){
    const key=item?.dataset.gallery || 'default';
    return allGalleryItems.filter(el=>(el.dataset.gallery || 'default')===key);
  }

  function renderLightbox(index){
    if(!lightbox || !activeGallery.length) return;
    galleryIndex=(index+activeGallery.length)%activeGallery.length;
    const item=activeGallery[galleryIndex];
    lightbox.classList.remove('is-ready');
    const src=item.getAttribute('href');
    const alt=qs('img',item)?.alt || 'Deck 88';
    const sizeLightboxToImage=()=>{
      if(!lightboxImg?.naturalWidth || !lightboxImg?.naturalHeight) return;
      const ratio=lightboxImg.naturalWidth/lightboxImg.naturalHeight;
      const vw=window.innerWidth;
      const vh=window.innerHeight;
      const maxW=vw*(vw<=760?.84:.68);
      const maxH=vh*(vw<=760?.64:.72);
      // Start from a generous zoomed viewing height, then clamp by width.
      let h=Math.min(maxH,760);
      let w=h*ratio;
      if(w>maxW){ w=maxW; h=w/ratio; }
      // Avoid tiny frames for near-square / wide photographs.
      if(ratio>=.95 && h<Math.min(maxH,560)){
        h=Math.min(maxH,560); w=Math.min(maxW,h*ratio); h=w/ratio;
      }
      lightbox.style.setProperty('--lb-w',`${Math.round(w+20)}px`);
      lightbox.style.setProperty('--lb-h',`${Math.round(h+20)}px`);
    };
    const done=()=>{
      sizeLightboxToImage();
      requestAnimationFrame(()=>lightbox.classList.add('is-ready'));
      lightboxImg.removeEventListener('load',done);
    };
    lightboxImg.addEventListener('load',done);
    lightboxImg.src=src;
    lightboxImg.alt=alt;
    if(lightboxImg.complete) requestAnimationFrame(done);
    if(lightboxCaption) lightboxCaption.textContent=item.dataset.caption || alt;
    if(lightboxIndex) lightboxIndex.textContent=`${String(galleryIndex+1).padStart(2,'0')} / ${String(activeGallery.length).padStart(2,'0')}`;
  }
  function openLightbox(item){
    if(!lightbox || !item) return;
    activeGallery=galleryFor(item);
    galleryIndex=Math.max(0,activeGallery.indexOf(item));
    renderLightbox(galleryIndex);
    lightbox.classList.add('is-open');
    lightbox.setAttribute('aria-hidden','false');
    document.body.classList.add('is-locked');
    lenis?.stop?.();
  }
  function closeLightbox(){
    if(!lightbox) return;
    lightbox.classList.remove('is-open','is-ready');
    lightbox.setAttribute('aria-hidden','true');
    document.body.classList.remove('is-locked');
    lenis?.start?.();
  }
  allGalleryItems.forEach(item=>item.addEventListener('click',e=>{e.preventDefault();openLightbox(item)}));
  qs('.image-lightbox__close',lightbox||document)?.addEventListener('click',closeLightbox);
  qs('.image-lightbox__prev',lightbox||document)?.addEventListener('click',()=>renderLightbox(galleryIndex-1));
  qs('.image-lightbox__next',lightbox||document)?.addEventListener('click',()=>renderLightbox(galleryIndex+1));
  lightbox?.addEventListener('click',e=>{if(e.target===lightbox)closeLightbox()});
  window.addEventListener('resize',()=>{if(lightbox?.classList.contains('is-open')) renderLightbox(galleryIndex)});

  // ---------- COUNTERS ----------
  const counters=qsa('[data-counter]');
  const counterObserver=new IntersectionObserver(entries=>{
    entries.forEach(entry=>{
      if(!entry.isIntersecting||entry.target.dataset.done)return;
      entry.target.dataset.done='1';
      const end=+entry.target.dataset.counter;
      const start=performance.now(),dur=1400;
      const step=t=>{const p=Math.min((t-start)/dur,1), eased=1-Math.pow(1-p,3);entry.target.textContent=Math.round(end*eased);if(p<1)requestAnimationFrame(step)};requestAnimationFrame(step);
    });
  },{threshold:.7});counters.forEach(c=>counterObserver.observe(c));

  // ---------- RESERVATION FORM ----------
  qs('#reservationForm')?.addEventListener('submit',e=>{
    e.preventDefault();
    const form=e.currentTarget, status=qs('.form-status'), btn=form.querySelector('button');
    const data=new FormData(form);
    const message=[
      'Hello Deck 88, I would like to request a table.',
      `Name: ${data.get('name')||''}`,
      `Phone: ${data.get('phone')||''}`,
      `Guests: ${data.get('guests')||''}`,
      `Preferred time: ${data.get('time')||''}`
    ].join('\n');
    status.textContent='Opening WhatsApp…'; btn.disabled=true;
    setTimeout(()=>{
      window.open(`https://wa.me/919028059382?text=${encodeURIComponent(message)}`,'_blank','noopener');
      status.textContent='✓ WhatsApp request prepared.'; btn.disabled=false;
    },450);
  });

  // ---------- INLINE FILM ----------
  const cinemaVideo=qs('.cinema__video');
  if(cinemaVideo){
    cinemaVideo.muted=true;
    cinemaVideo.loop=true;
    cinemaVideo.playsInline=true;
    const keepPlaying=()=>cinemaVideo.play().catch(()=>{});
    keepPlaying();
    addEventListener('pageshow',keepPlaying);
    document.addEventListener('visibilitychange',()=>{if(!document.hidden)keepPlaying()});
  }
  addEventListener('keydown',e=>{
    if(e.key==='Escape'){closeMenu();closeLightbox();closeFullMenu();}
    if(lightbox?.classList.contains('is-open') && e.key==='ArrowLeft') renderLightbox(galleryIndex-1);
    if(lightbox?.classList.contains('is-open') && e.key==='ArrowRight') renderLightbox(galleryIndex+1);
  });

  // ---------- IMAGE TILT / LIGHT REACTION ----------
  if(finePointer && !reduceMotion){
    qsa('.chef-card,.journal-card').forEach(card=>{
      card.addEventListener('mousemove',e=>{const r=card.getBoundingClientRect();const x=(e.clientX-r.left)/r.width-.5;const y=(e.clientY-r.top)/r.height-.5;card.style.transform=`perspective(900px) rotateY(${x*2.2}deg) rotateX(${-y*1.7}deg)`});
      card.addEventListener('mouseleave',()=>{card.style.transition='transform .7s var(--ease)';card.style.transform='';setTimeout(()=>card.style.transition='',700)});
    });
  }
})();
