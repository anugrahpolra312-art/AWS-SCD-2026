import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { AnimatePresence, motion, useReducedMotion, MotionConfig, useScroll, useSpring, useTransform } from 'motion/react';
import { ArrowLeft, ArrowRight, ArrowUp, ArrowUpRight, CalendarDays, ChevronDown, Cloud, Code2, Cpu, MapPin, Menu, Mic, Radio, Shield, Sparkles, Users, X } from 'lucide-react';
import { photos, sessions, tracks } from './event-data';
import './styles.css';

const navigation = [['the-day','The day'],['tracks','Tracks'],['lineup','Schedule'],['glimpses','Glimpses'],['venue','Venue']];
const asset = name => '/assets/' + name;
const mapUrl = 'https://www.google.com/maps/search/?api=1&query=Silver+Oak+University+Ahmedabad+Gujarat';
const eventStart = Date.parse('2026-12-12T08:00:00+05:30');
const ease = [.22,1,.36,1];
const heroFrom = { y:0 }, heroTo = { y:80 };
const registrationPage = /^\/registration(?:\.html)?\/?$/.test(location.pathname);
const trackIcons = { behind: Cloud, devsecops: Shield, quantum: Cpu, agents: Sparkles, robotics: Code2, twinmaker: Radio };

function Reveal({ children, className = '', enabled, delay = 0, hero = false }) {
  return <motion.div className={className}
    initial={enabled ? { opacity: 0, y: hero ? 24 : 34 } : false}
    animate={hero || !enabled ? { opacity:1, y:0 } : undefined}
    whileInView={hero || !enabled ? undefined : { opacity:1, y:0 }}
    viewport={{ once:true, amount:.12 }}
    transition={enabled ? { duration: .7, delay, ease } : { duration:0 }}>
    {children}
  </motion.div>;
}

function SectionHeading({ eyebrow, title, accent, description, enabled }) {
  return <Reveal className="section-heading" enabled={enabled}>
    <div><p className="eyebrow section-label"><span />{eyebrow}</p><h2>{title} <em>{accent}</em></h2><motion.span className="heading-rule" aria-hidden="true" initial={enabled?{scaleX:0}:false} whileInView={{scaleX:1}} viewport={{once:true}} transition={{duration:enabled?.9:0,delay:.12,ease}}/></div>
    {description && <p className="section-description">{description}</p>}
  </Reveal>;
}

function Header({ enabled }) {
  const [menu, setMenu] = useState(false);
  const [active, setActive] = useState('');
  const button = useRef(null);
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 160, damping: 29 });
  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const id = [...navigation].reverse().find(([id]) => document.getElementById(id)?.getBoundingClientRect().top <= 150)?.[0];
      setActive(id || '');
    };
    const request = () => { if (!frame) frame = requestAnimationFrame(update); };
    window.addEventListener('scroll', request, { passive:true });
    update();
    return () => { window.removeEventListener('scroll', request); cancelAnimationFrame(frame); };
  }, []);
  useEffect(() => {
    if (!menu) return;
    const close = event => {
      if (event.key === 'Escape') { setMenu(false); button.current?.focus(); }
    };
    window.addEventListener('keydown', close);
    return () => window.removeEventListener('keydown', close);
  }, [menu]);
  return <header className="site-header">
    <div className="site-wrap nav-inner flex items-center justify-between">
      <a className="brand flex items-center" href="/#top" aria-label="Event home" onClick={() => setMenu(false)}>
        <img className="university-logo" src={asset('silver-oak-logo.png')} alt="Silver Oak University" />
        <span className="brand-divider" />
        <img className="builder-logo" src={asset('aws-builder-logo-2026.png')} alt="AWS Student Builder Group at Silver Oak University" />
      </a>
      <nav className="desktop-navigation" aria-label="Main navigation">
        {navigation.map(([id,label]) => <a key={id} href={'/#'+id} aria-current={active === id ? 'location' : undefined}>{label}</a>)}
      </nav>
      <a className="cta small desktop-save" href="/registration.html">Register <ArrowUpRight size={16}/></a>
      <button type="button" ref={button} className="menu-button scene-button" aria-label={menu ? 'Close navigation' : 'Open navigation'} aria-expanded={menu} aria-controls="mobile-navigation" onClick={() => setMenu(!menu)}>{menu ? <X /> : <Menu />}</button>
    </div>
    <AnimatePresence initial={false}>
      {menu && <motion.nav id="mobile-navigation" className="mobile-navigation" aria-label="Mobile navigation"
        initial={enabled ? {opacity:0,y:-12} : false} animate={{opacity:1,y:0}} exit={{opacity:0,y:-8}} transition={{duration:enabled?.2:0}}>
        {navigation.map(([id,label]) => <a key={id} href={'/#'+id} onClick={() => setMenu(false)} aria-current={active === id ? 'location' : undefined}>{label}<ArrowRight size={17}/></a>)}
        <a className="cta registration-link" href="/registration.html" onClick={() => setMenu(false)}>Register <ArrowUpRight size={17}/></a>
      </motion.nav>}
    </AnimatePresence>
    <motion.div className="reading-progress" style={{ scaleX: enabled ? progress : scrollYProgress }} aria-hidden="true" />
  </header>;
}

function Intro({ enabled }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (!enabled || location.hash || scrollY > 40) return;
    try {
      if (sessionStorage.getItem('scd-react-intro')) return;
      sessionStorage.setItem('scd-react-intro','1');
    } catch {}
    setVisible(true);
    const timer = setTimeout(() => setVisible(false), 620);
    const dismiss = () => setVisible(false);
    const events = ['pointerdown','keydown','wheel','focusin'];
    events.forEach(event => window.addEventListener(event,dismiss,{passive:true}));
    return () => {
      clearTimeout(timer);
      events.forEach(event => window.removeEventListener(event,dismiss));
    };
  }, [enabled]);
  return <AnimatePresence>
    {visible && enabled && <motion.div className="intro" aria-hidden="true" exit={{ opacity:0, clipPath:'inset(0 0 100% 0)' }} transition={{duration:.35,ease}}>
      <motion.div initial={{opacity:0,y:14}} animate={{opacity:1,y:0}} transition={{duration:.35,ease}}>
        <span className="intro-kite"/><p>AWS STUDENT COMMUNITY DAY</p><small>AHMEDABAD 2026</small>
      </motion.div>
    </motion.div>}
  </AnimatePresence>;
}

function Countdown({ enabled }) {
  const [remaining, setRemaining] = useState(() => Math.max(0, Math.floor((eventStart - Date.now()) / 1000)));
  useEffect(() => {
    const timer = setInterval(() => setRemaining(Math.max(0, Math.floor((eventStart - Date.now()) / 1000))), 1000);
    return () => clearInterval(timer);
  }, []);
  const values = [['Days',Math.floor(remaining/86400)],['Hours',Math.floor(remaining/3600)%24],['Minutes',Math.floor(remaining/60)%60],['Seconds',remaining%60]];
  return <section className="countdown" aria-label="Countdown to AWS Student Community Day">
    <div className="site-wrap countdown-inner">
      <div className="countdown-label flex items-center gap-3"><Sparkles aria-hidden="true"/><div><strong>Countdown to Community Day</strong><span>12 December · 08:00 AM IST</span></div></div>
      <div className="countdown-values" role="timer" aria-live="off">
        {values.map(([label,value]) => <div className="countdown-cell" key={label}>
          <motion.strong key={value} initial={enabled?{opacity:.35,y:5}:false} animate={{opacity:1,y:0}} transition={{duration:enabled?.26:0}}>{String(value).padStart(2,'0')}</motion.strong><span>{label}</span>
        </div>)}
      </div>
      <a href="#venue" className="countdown-venue">Meet us at Silver Oak <ArrowUpRight size={17}/></a>
    </div>
  </section>;
}

function useParallax(container, selector, from, to, start, end, enabled) {
  useEffect(() => {
    if (!enabled) return;
    let active = true;
    let context;
    import('./parallax').then(({ createParallax }) => {
      if (active) context = createParallax(container.current, selector, from, to, start, end);
    }).catch(() => { /* The scene remains visible without the scroll effect. */ });
    return () => { active = false; context?.revert(); };
  }, [container, selector, from, to, start, end, enabled]);
}

function Hero({enabled, saveDate}) {
  const section = useRef(null);
  useParallax(section, '.hero-gridlight', heroFrom, heroTo, 'top top', 'bottom top', enabled);
  const {scrollYProgress} = useScroll({target:section, offset:['start start','end start']});
  const copyY = useTransform(scrollYProgress,[0,1],[0,42]);
  const skyY = useTransform(scrollYProgress,[0,1],[0,100]);
  return <>
    <section ref={section} className="hero" aria-labelledby="event-title">
      <div className="hero-gridlight" aria-hidden="true" />
      <div className="hero-sunlight" aria-hidden="true" />
      <motion.div className="hero-sky" style={{y:enabled?skyY:0}} aria-hidden="true">
        <span className="sky-wisp sky-wisp-left" />
        <span className="sky-wisp sky-wisp-right" />
        <span className="sky-bird sky-bird-one" />
        <span className="sky-bird sky-bird-two" />
        <span className="sky-bird sky-bird-three" />
      </motion.div>
      <div className="hero-kite kite-one" aria-hidden="true"/><div className="hero-kite kite-two" aria-hidden="true"/>
      <div className="site-wrap hero-layout">
        <motion.div className="hero-copy" style={{y:enabled?copyY:0}}>
          <Reveal enabled={enabled} hero delay={.07}><p className="eyebrow event-date"><span/> AWS STUDENT COMMUNITY DAY · 2026</p></Reveal>
          <Reveal enabled={enabled} hero delay={.14}>
            <h1 id="event-title"><img src={asset('event-title.png')} width="1774" height="724" fetchPriority="high" alt="AWS Student Community Day Ahmedabad 2026" /></h1>
          </Reveal>
          <Reveal enabled={enabled} hero delay={.23}>
            <div className="hero-venue flex items-start gap-3"><MapPin size={19}/><div><strong>Aryabhata Auditorium · Silver Oak University</strong><span>5th floor, EB-Block · Ahmedabad</span></div></div>
            <p className="hero-description">A day to explore cloud technology, meet fellow student builders, and share what you’re creating.</p>
          </Reveal>
          <Reveal enabled={enabled} hero delay={.31} className="hero-actions flex flex-wrap items-center gap-3">
            <a className="cta" href="#the-day">Explore the day <ArrowRight size={17}/></a>
            <button className="cta secondary" type="button" onClick={saveDate}><CalendarDays size={17}/> Save the date</button>
          </Reveal>
          <Reveal enabled={enabled} hero delay={.38} className="hero-date">
            <span className="hero-date-tile" aria-hidden="true">12<small>DEC</small></span>
            <div><strong>Saturday, 12 December 2026</strong><span>08:00 AM–05:30 PM IST · In person</span></div>
          </Reveal>
        </motion.div>
        <a className="scroll-cue" href="#the-day">Scroll to discover <ChevronDown size={16}/></a>
      </div>
    </section>
    <Riverfront/>
    <Countdown enabled={enabled}/>
  </>;
}

function Riverfront() {
  return <div className="riverfront">
    <div className="riverfront-art">
      <img className="riverfront-image" src={asset('main-poster.png')} width="1600" height="1600"
        alt="Illustrated Ahmedabad skyline and Sabarmati Riverfront, with the full bridge, tower, and waterfront" loading="lazy" decoding="async" />
    </div>
  </div>;
}

function ScrollAccent({enabled, dark=false}) {
  const ref=useRef(null);
  const {scrollYProgress}=useScroll({target:ref,offset:['start end','end start']});
  const rotate=useTransform(scrollYProgress,[0,1],[-28,38]);
  const y=useTransform(scrollYProgress,[0,1],[35,-35]);
  return <div ref={ref} className={'scroll-atmosphere'+(dark?' on-dark':'')} aria-hidden="true">
    <motion.svg viewBox="0 0 420 420" style={{rotate:enabled?rotate:0,y:enabled?y:0}}>
      <circle cx="210" cy="210" r="150"/><circle cx="210" cy="210" r="193" strokeDasharray="3 14"/>
      <ellipse cx="210" cy="210" rx="193" ry="76" transform="rotate(-35 210 210)"/>
      <path d="M60 210H360M210 60V360" strokeDasharray="5 12"/>
      <circle className="orbit-node" cx="210" cy="60" r="8"/><circle className="orbit-node" cx="360" cy="210" r="6"/>
    </motion.svg>
  </div>;
}

function Registration({enabled,saveDate}) {
  return <section className="registration-page">
    <ScrollAccent enabled={enabled}/>
    <div className="site-wrap registration-layout">
      <a href="/#top" className="registration-back"><ArrowLeft size={17}/> Back to the event</a>
      <Reveal enabled={enabled} hero className="registration-card">
        <img className="registration-title" src={asset('event-title.png')} width="1774" height="724" alt="AWS Student Community Day Ahmedabad 2026"/>
        <p className="eyebrow registration-status"><span/> REGISTRATION UPDATE</p>
        <h1>Registrations<br/><em>opening soon.</em></h1>
        <p className="registration-description">Your next big idea starts here. Join student builders for a day of cloud, creativity, and community in Ahmedabad.</p>
        <p className="registration-notice">We’re getting everything ready. The registration link will be available here once registrations open. Check back soon!</p>
        <div className="registration-details">
          <div><CalendarDays size={20}/><p><strong>12 December 2026</strong><span>08:00 AM–05:30 PM IST</span></p></div>
          <div><MapPin size={20}/><p><strong>Aryabhata Auditorium</strong><span>5th floor, EB-Block · Silver Oak University</span></p></div>
        </div>
        <div className="registration-actions"><button type="button" className="cta" onClick={saveDate}><CalendarDays size={17}/> Save the date</button><a className="cta secondary" href="/#lineup">Explore the schedule <ArrowRight size={17}/></a></div>
      </Reveal>
    </div>
  </section>;
}

function Experience({enabled}) {
  const features = [
    [Cloud,'Explore the cloud','Hear new perspectives on AWS, cloud architecture, and emerging technology.'],
    [Code2,'Build something','Find practical ideas in six technical tracks and see projects in the Student Builder Zone.'],
    [Users,'Meet other builders','Connect with student builders and cloud enthusiasts from the community.']
  ];
  return <section id="the-day" className="site-wrap content-section">
    <SectionHeading eyebrow="THE EXPERIENCE" title="Come curious." accent="Leave inspired." description="A full day of sessions, technical tracks, and student projects at Silver Oak University." enabled={enabled}/>
    <div className="experience-grid grid gap-4 md:grid-cols-3">
      {features.map(([Icon,title,copy],i) => <Reveal enabled={enabled} key={title} delay={i*.07}>
        <motion.article className="experience-card" whileHover={enabled ? {y:-7} : undefined} transition={{duration:.24,ease}}>
          <div className="experience-icon"><Icon size={23}/></div><h3>{title}</h3><p>{copy}</p>
        </motion.article>
      </Reveal>)}
    </div>
  </section>;
}

function Tracks({enabled}) {
  const keys = Object.keys(tracks);
  const [key,setKey] = useState(keys[0]);
  const tabs = useRef([]);
  const track = tracks[key];
  const Icon = trackIcons[key];
  function onTabKey(event,index) {
    let next;
    if (['ArrowRight','ArrowDown'].includes(event.key)) next = (index+1)%keys.length;
    if (['ArrowLeft','ArrowUp'].includes(event.key)) next = (index+keys.length-1)%keys.length;
    if (event.key==='Home') next=0;
    if (event.key==='End') next=keys.length-1;
    if (next===undefined) return;
    event.preventDefault();
    setKey(keys[next]);
    tabs.current[next]?.focus();
  }
  return <section id="tracks" className="track-section"><ScrollAccent enabled={enabled}/>
    <div className="site-wrap content-section">
      <SectionHeading eyebrow="TECHNICAL TRACKS" title="Six ways to" accent="build what's next." description="Choose a track to preview its focus areas. Detailed sessions and speakers will be announced soon." enabled={enabled}/>
      <Reveal enabled={enabled} className="tracks-layout">
        <div className="track-tablist" role="tablist" aria-label="Explore technical tracks" aria-orientation="vertical">
          {keys.map((id,i) => {const TabIcon=trackIcons[id]; return <button key={id} type="button" role="tab" id={'tab-'+id} aria-selected={key===id} aria-controls="track-panel" tabIndex={key===id?0:-1} ref={element=>{tabs.current[i]=element;}} onClick={()=>setKey(id)} onKeyDown={event=>onTabKey(event,i)}><TabIcon size={19}/><span>{tracks[id].title}</span><ArrowRight size={16}/></button>;})}
        </div>
        <div id="track-panel" className="track-panel" role="tabpanel" aria-labelledby={'tab-'+key} tabIndex={0}>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div className="track-panel-content" key={key} initial={enabled?{opacity:0,x:12}:false} animate={{opacity:1,x:0}} exit={enabled?{opacity:0,x:-10}:undefined} transition={{duration:enabled?.22:0,ease}}>
              <div className="track-emblem"><Icon size={42}/></div>
              <p className="eyebrow">{track.eyebrow}</p><h3>{track.title}</h3><p className="track-description">{track.description}</p>
              <div className="topic-list flex flex-wrap gap-2" aria-label="Focus areas">{track.topics.map(topic=><span key={topic}>{topic}</span>)}</div>
            </motion.div>
          </AnimatePresence>
        </div>
      </Reveal>
    </div>
  </section>;
}

function TimelineRow({ title, items, enabled }) {
  const rail = useRef(null);
  const label = title.toLowerCase();
  const [limits,setLimits] = useState({prev:false,next:false});
  useEffect(() => {
    const node=rail.current;
    const update=()=>setLimits({prev:node.scrollLeft>3,next:node.scrollLeft+node.clientWidth<node.scrollWidth-3});
    const resize=new ResizeObserver(update);
    resize.observe(node);
    node.addEventListener('scroll',update,{passive:true});
    update();
    return ()=>{resize.disconnect();node.removeEventListener('scroll',update);};
  },[]);
  function shift(direction) {
    const node=rail.current;
    const width=node.firstElementChild.getBoundingClientRect().width+16;
    node.scrollBy({left:direction*width,behavior:enabled?'smooth':'instant'});
  }
  return <section className="timeline-group" aria-labelledby={label+'-title'}>
    <div className="timeline-heading flex items-center justify-between gap-3">
      <h3 id={label+'-title'}>{title}</h3>
      {(limits.prev||limits.next) && <div className="flex gap-2">
        <button type="button" className="scene-button" disabled={!limits.prev} aria-label={'Previous '+label+' activities'} onClick={()=>shift(-1)}><ArrowLeft size={16}/></button>
        <button type="button" className="scene-button" disabled={!limits.next} aria-label={'Next '+label+' activities'} onClick={()=>shift(1)}><ArrowRight size={16}/></button>
      </div>}
    </div>
    <ol ref={rail} className="timeline-rail" tabIndex={0} aria-label={title+' schedule'} onKeyDown={event=>{
      if (event.key==='ArrowRight'||event.key==='ArrowLeft') {event.preventDefault();shift(event.key==='ArrowRight'?1:-1);}
    }}>
      {items.map((item,i)=><motion.li className={'timeline-card tone-'+i} key={item.title} initial={enabled?{opacity:0,y:22}:false}
        whileInView={{opacity:1,y:0}} viewport={{once:true,amount:.2}} transition={{duration:enabled?.55:0,delay:enabled?i*.06:0,ease}}>
        <div className="timeline-time">{item.start} <span>–</span> {item.end}</div>
        <div className="timeline-copy"><h4>{item.title}</h4><p>{item.description}</p></div><span className="timeline-dot" aria-hidden="true"/>
      </motion.li>)}
    </ol>
  </section>;
}

function Schedule({enabled}) {
  return <section className="schedule-section" id="lineup"><ScrollAccent enabled={enabled} dark/>
    <div className="site-wrap content-section">
      <SectionHeading eyebrow="EVENT SCHEDULE" title="Plan your" accent="community day." description="Saturday, 12 December 2026 · 08:00 AM–05:30 PM IST" enabled={enabled}/>
      <TimelineRow title="Morning" items={sessions.slice(0,5)} enabled={enabled}/>
      <TimelineRow title="Afternoon" items={sessions.slice(5)} enabled={enabled}/>
      <p className="schedule-note">All times are in IST. Some afternoon activities overlap.</p>
      <Reveal enabled={enabled} className="speakers flex items-center gap-4">
        <span className="speaker-icon"><Mic size={25}/></span><div><h3>Speakers revealing soon</h3><p>Check back for the full lineup.</p></div><Sparkles className="speaker-spark" aria-hidden="true"/>
      </Reveal>
    </div>
  </section>;
}

function Gallery({enabled}) {
  const [filter,setFilter]=useState('all');
  const [index,setIndex]=useState(null);
  const dialog=useRef(null);
  const touch=useRef(null);
  const shown=filter==='all'?photos:photos.filter(photo=>photo.category===filter);
  const selected=index===null?null:shown[index];
  const filters=[['all','All moments'],['sessions','Sessions'],['hands-on','Hands-on'],['community','Community']];
  useEffect(()=>{
    const node=dialog.current;
    if(index!==null&&!node.open) node.showModal();
    if(index===null&&node.open) node.close();
  },[index]);
  function step(direction) { setIndex(value=>(value+direction+shown.length)%shown.length); }
  return <section id="glimpses" className="site-wrap content-section">
    <SectionHeading eyebrow="GLIMPSES FROM 2025" title="The community" accent="in motion." description="Scenes from AWS Student Community Day Ahmedabad 2025 at Silver Oak University." enabled={enabled}/>
    <div className="gallery-filters flex flex-wrap gap-2" role="group" aria-label="Filter past event photos">
      {filters.map(([id,name])=><button key={id} type="button" className="filter" aria-pressed={filter===id} onClick={()=>setFilter(id)}>{name}</button>)}
    </div>
    <motion.div className="gallery-grid grid gap-4 sm:grid-cols-2 lg:grid-cols-3" key={filter}>
      {shown.map((photo,i)=><Reveal key={photo.src} enabled={enabled} delay={i%3*.065}>
        <button type="button" className="gallery-card" onClick={()=>setIndex(i)} aria-label={'View '+photo.title}>
          <span className="gallery-image"><img src={photo.src} alt={photo.alt} loading="lazy" /><span className="gallery-open"><ArrowUpRight size={20}/></span></span>
          <span className="gallery-copy"><strong>{photo.title}</strong><span>{photo.label}</span></span>
        </button>
      </Reveal>)}
    </motion.div>
    <a className="report-link" href="https://events.vtools.ieee.org/event_media/download/82513" target="_blank" rel="noreferrer">2025 event photo source <ArrowUpRight size={15}/></a>
    <dialog className="lightbox" ref={dialog} aria-label="Event photo viewer" onClose={()=>setIndex(null)} onClick={event=>{if(event.target===dialog.current)setIndex(null);}} onKeyDown={event=>{
      if(event.key==='ArrowLeft'||event.key==='ArrowRight'){event.preventDefault();step(event.key==='ArrowLeft'?-1:1);}
    }}>
      {selected && <div className="lightbox-shell">
        <div className="lightbox-top flex justify-between items-center"><span>{index+1} / {shown.length}</span><button type="button" className="scene-button" aria-label="Close photo viewer" onClick={()=>setIndex(null)}><X size={21}/></button></div>
        <div onTouchStart={e=>{touch.current=e.touches[0].clientX;}} onTouchEnd={e=>{if(touch.current!==null){const delta=e.changedTouches[0].clientX-touch.current;if(Math.abs(delta)>45) step(delta<0?1:-1);touch.current=null;}}}>
          <img src={selected.src} alt={selected.alt}/>
        </div>
        <div className="lightbox-bottom flex justify-between items-center gap-4"><div><strong>{selected.title}</strong><p>{selected.caption}</p></div><div className="flex gap-2">
          <button type="button" className="scene-button" aria-label="Previous photo" disabled={shown.length<2} onClick={()=>step(-1)}><ArrowLeft size={16}/></button>
          <button type="button" className="scene-button" aria-label="Next photo" disabled={shown.length<2} onClick={()=>step(1)}><ArrowRight size={16}/></button>
        </div></div>
      </div>}
    </dialog>
  </section>;
}

function Venue({enabled,saveDate}) {
  const questions=[
    ['When and where is the event?','Saturday, 12 December 2026, from 08:00 AM to 05:30 PM IST at Aryabhata Auditorium, 5th floor, EB-Block, Silver Oak University, Ahmedabad.'],
    ['Is the schedule available?','Yes. The schedule section has all ten activities and their timings.'],
    ['How can I register?','Registrations will open soon. Select Register in the navigation to visit the registration page. You can save the event to your calendar in the meantime.'],
    ['What topics will be covered?','Explore Behind AWS Scenes, DevSecOps, Quantum, AI Agents, Robotics, and IoT TwinMaker in the technical tracks section.']
  ];
  return <>
    <section id="venue" className="venue-section">
      <div className="site-wrap content-section venue-layout grid items-center gap-8 lg:grid-cols-2">
        <div>
          <SectionHeading eyebrow="THE VENUE" title="See you at" accent="Silver Oak." enabled={enabled}/>
          <Reveal enabled={enabled} delay={.08} className="venue-info">
            <address><MapPin size={21}/><div><strong>Aryabhata Auditorium</strong><br/>5th floor, EB-Block<br/>Silver Oak University, Ahmedabad, Gujarat</div></address>
            <p className="venue-time flex items-center gap-3"><CalendarDays size={20}/>Saturday, 12 December 2026 · 08:00 AM IST</p>
            <div className="flex flex-wrap gap-3"><a href={mapUrl} target="_blank" rel="noreferrer" className="cta">Get directions <ArrowUpRight size={17}/></a><button type="button" className="cta secondary" onClick={saveDate}>Save the date <CalendarDays size={17}/></button></div>
          </Reveal>
        </div>
        <Reveal enabled={enabled} className="campus"><img src={asset('silver-oak-campus.jpg')} alt="Silver Oak University campus in Ahmedabad" loading="lazy"/><span>Silver Oak University</span></Reveal>
      </div>
    </section>
    <section className="site-wrap content-section faq">
      <SectionHeading eyebrow="EVENT FAQ" title="Good to" accent="know." enabled={enabled}/>
      <div className="faq-list">{questions.map(([question,answer])=><details key={question}><summary>{question}<ChevronDown size={19}/></summary><p>{answer}</p></details>)}</div>
    </section>
  </>;
}

function App() {
  const enabled=!useReducedMotion();
  const [toast,setToast]=useState(false);
  const toastTimer=useRef(null);
  useEffect(()=>{
    document.documentElement.dataset.motion=enabled?'on':'off';
  },[enabled]);
  useEffect(()=>()=>clearTimeout(toastTimer.current),[]);
  function saveDate() {
    const stamp=new Date().toISOString().replace(/[-:]|\.\d{3}/g,'');
    const ics=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//SCD Ahmedabad//Event Calendar//EN','BEGIN:VEVENT','UID:aws-scd-ahmedabad-2026@silveroak','DTSTAMP:'+stamp,'DTSTART:20261212T023000Z','DTEND:20261212T120000Z','SUMMARY:AWS Student Community Day Ahmedabad 2026','LOCATION:Aryabhata Auditorium\\, 5th floor\\, EB-Block\\, Silver Oak University\\, Ahmedabad','END:VEVENT','END:VCALENDAR',''].join('\r\n');
    const url=URL.createObjectURL(new Blob([ics],{type:'text/calendar;charset=utf-8'}));
    const link=document.createElement('a');
    link.href=url;
    link.download='AWS-SCD-Ahmedabad-2026.ics';
    link.click();
    setTimeout(()=>URL.revokeObjectURL(url),1000);
    setToast(true);
    clearTimeout(toastTimer.current);
    toastTimer.current=setTimeout(()=>setToast(false),3200);
  }
  useEffect(()=>{
    const id=location.hash.slice(1);
    if(id) requestAnimationFrame(()=>document.getElementById(id)?.scrollIntoView({behavior:'instant'}));
  },[]);
  return <MotionConfig reducedMotion={enabled?'never':'always'}>
    <div id="top"><a className="skip-link" href="#main">Skip to content</a>
      <Intro enabled={enabled}/><Header enabled={enabled}/>
      <main id="main">
        {registrationPage ? <Registration enabled={enabled} saveDate={saveDate}/> : <>
        <Hero enabled={enabled} saveDate={saveDate}/>
        <Experience enabled={enabled}/>
        <Tracks enabled={enabled}/>
        <Schedule enabled={enabled}/>
        <Gallery enabled={enabled}/>
        <Venue enabled={enabled} saveDate={saveDate}/>
        </>}
      </main>
      <footer className="site-footer"><div className="site-wrap footer-inner flex flex-wrap items-center justify-between gap-6"><div><strong>AWS Student Community Day Ahmedabad 2026</strong><span>AWS Student Builder Group at Silver Oak University</span></div><a href="#top" className="back-top">Back to top <ArrowUp size={17}/></a></div></footer>
      <div className="toast-holder" role="status" aria-live="polite"><AnimatePresence>{toast&&<motion.div className="toast" initial={enabled?{opacity:0,y:10}:false} animate={{opacity:1,y:0}} exit={{opacity:0}} transition={{duration:enabled?.2:0}}>Calendar file downloaded</motion.div>}</AnimatePresence></div>
    </div>
  </MotionConfig>;
}

createRoot(document.getElementById('root')).render(<App />);
