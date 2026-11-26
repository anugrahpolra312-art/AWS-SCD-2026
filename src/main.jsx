import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { AnimatePresence, motion, useReducedMotion, MotionConfig, useScroll, useSpring, useTransform } from 'motion/react';
import { ArrowLeft, ArrowRight, ArrowUp, ArrowUpRight, CalendarDays, ChevronDown, Cloud, Code2, Cpu, MapPin, Menu, Mic, Radio, Shield, Sparkles, Users, X } from 'lucide-react';
import { photos, sessions, tracks } from './event-data';
import { CloudBackdrop, resetTrackTilt, ScrollKite, tiltTrack, TrackAnimation, TrackNetwork } from './event-motion';
import './styles.css';

const navigation = [['the-day','The day'],['tracks','Tracks'],['lineup','Schedule'],['glimpses','Glimpses'],['venue','Venue']];
const asset = name => '/assets/' + name;
const mapUrl = 'https://www.google.com/maps/search/?api=1&query=Silver+Oak+University+Ahmedabad+Gujarat';
const registrationUrl = 'https://konfhub.com/aws-student-community-day-ahmedabad-2026';
const eventStart = Date.parse('2026-12-12T08:00:00+05:30');
const ease = [.22,1,.36,1];
const heroFrom = { y:0 }, heroTo = { y:80 };
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
      <a className="cta small desktop-save" href={registrationUrl} target="_blank" rel="noreferrer">Register <ArrowUpRight size={16}/></a>
      <button type="button" ref={button} className="menu-button scene-button" aria-label={menu ? 'Close navigation' : 'Open navigation'} aria-expanded={menu} aria-controls="mobile-navigation" onClick={() => setMenu(!menu)}>{menu ? <X /> : <Menu />}</button>
    </div>
    <AnimatePresence initial={false}>
      {menu && <motion.nav id="mobile-navigation" className="mobile-navigation" aria-label="Mobile navigation"
        initial={enabled ? {opacity:0,y:-12} : false} animate={{opacity:1,y:0}} exit={{opacity:0,y:-8}} transition={{duration:enabled?.2:0}}>
        {navigation.map(([id,label]) => <a key={id} href={'/#'+id} onClick={() => setMenu(false)} aria-current={active === id ? 'location' : undefined}>{label}<ArrowRight size={17}/></a>)}
        <a className="cta registration-link" href={registrationUrl} target="_blank" rel="noreferrer" onClick={() => setMenu(false)}>Register <ArrowUpRight size={17}/></a>
      </motion.nav>}
    </AnimatePresence>
    <motion.div className="reading-progress" style={{ scaleX: enabled ? progress : scrollYProgress }} aria-hidden="true" />
  </header>;
}

const titleArtwork = asset('event-title-2026.png');
const titleWidth = 803;
const titleHeight = 302;
const tileHeight = titleHeight / 2;
const tileWidth = tileHeight * 2 / 3;
const tileOrder = [
  [4, 0], [3, 0], [5, 0], [2, 0], [6, 0], [1, 0], [7, 0], [0, 0],
  [1, 1], [0, 1], [2, 1], [6, 1], [7, 1], [5, 1], [3, 1], [4, 1],
];

function EventTitle({ enabled }) {
  const [assembling, setAssembling] = useState(false);
  useLayoutEffect(() => {
    if (!enabled || (location.hash && location.hash !== '#top') || window.scrollY > 40) return;
    try {
      if (sessionStorage.getItem('scd-title-assembly')) return;
      sessionStorage.setItem('scd-title-assembly', '1');
    } catch { /* Play normally when storage is unavailable. */ }
    setAssembling(true);
    const timer = setTimeout(() => setAssembling(false), 1200);
    return () => clearTimeout(timer);
  }, [enabled]);

  return <h1 id="event-title" className={enabled && assembling ? 'title-assembling' : undefined}>
    <img className="title-original" src={titleArtwork} width={titleWidth} height={titleHeight}
      fetchPriority="high" alt="AWS Student Community Day Ahmedabad 2026" />
    {enabled && assembling && <span className="title-tiles" aria-hidden="true">
      {tileOrder.map(([column, row], index) => {
        const x = column * tileWidth;
        const y = row * tileHeight;
        const width = Math.min(tileWidth, titleWidth - x);
        const height = tileHeight;
        const bridge = row === 1 && column < 3;
        const right = column >= 6;
        return <span className="title-tile" key={index} style={{
          left: `${100 * x / titleWidth}%`,
          top: `${100 * y / titleHeight}%`,
          width: `${100 * width / titleWidth}%`,
          height: `${100 * height / titleHeight}%`,
          '--tile-delay': `${index * 50}ms`,
          '--tile-x': bridge ? '-22px' : right ? '23px' : '0px',
          '--tile-y': bridge ? '18px' : row === 0 ? '-21px' : '13px',
          '--tile-angle': bridge ? '-5deg' : right ? '5deg' : '-3deg',
        }}>
          <img src={titleArtwork} alt="" style={{
            width: `${100 * titleWidth / width}%`,
            left: `${-100 * x / width}%`,
            top: `${-100 * y / height}%`,
          }} />
        </span>;
      })}
    </span>}
  </h1>;
}

function FlipDigit({ digit, enabled }) {
  const [current, setCurrent] = useState(digit);
  const [previous, setPrevious] = useState(digit);
  if (current !== digit) {
    setPrevious(current);
    setCurrent(digit);
  }

  const flipping = enabled && previous !== digit;
  return <span className="flip-digit" aria-hidden="true">
    <span className="flip-half flip-top"><span>{digit}</span></span>
    <span className="flip-half flip-bottom"><span>{flipping ? previous : digit}</span></span>
    {flipping && <React.Fragment key={digit}>
      <span className="flip-half flip-top flip-out"><span>{previous}</span></span>
      <span className="flip-half flip-bottom flip-in"><span>{digit}</span></span>
    </React.Fragment>}
  </span>;
}

function secondsToEvent() {
  return Math.max(0, Math.ceil((eventStart - Date.now()) / 1000));
}

function Countdown({ enabled }) {
  const [remaining, setRemaining] = useState(secondsToEvent);
  useEffect(() => {
    let timer;
    const tick = () => {
      const seconds = secondsToEvent();
      setRemaining(seconds);
      if (seconds > 0) {
        const untilNextSecond = (eventStart - Date.now()) % 1000 || 1000;
        timer = setTimeout(tick, Math.max(0, untilNextSecond));
      }
    };
    tick();
    return () => clearTimeout(timer);
  }, []);
  const values = [['Days',Math.floor(remaining/86400)],['Hours',Math.floor(remaining/3600)%24],['Minutes',Math.floor(remaining/60)%60],['Seconds',remaining%60]];
  return <section className="countdown" aria-label="Countdown to AWS Student Community Day">
    <div className="site-wrap countdown-inner">
      <div className="countdown-label flex items-center gap-3"><Sparkles aria-hidden="true"/><div><strong>Countdown to Community Day</strong><span>12 December · 08:00 AM IST</span></div></div>
      <div className="countdown-values" role="timer" aria-live="off">
        {values.map(([label, value]) => {
          const digits = String(value).padStart(2, '0');
          return <div className="countdown-cell" key={label}>
            <strong className="flip-value"><span className="sr-only">{digits}</span>
              {[...digits].map((digit, index) => <FlipDigit key={index - digits.length} digit={digit} enabled={enabled}/>)}
            </strong>
            <span className="countdown-unit">{label}</span>
          </div>;
        })}
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
      <CloudBackdrop enabled={enabled}/>
      <ScrollKite progress={scrollYProgress} enabled={enabled}/>
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
          <EventTitle enabled={enabled}/>
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
    <Countdown enabled={enabled}/>
  </>;
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
  return <section id="tracks" className="track-section"><TrackNetwork/>
    <div className="site-wrap content-section">
      <SectionHeading eyebrow="TECHNICAL TRACKS" title="Six ways to" accent="build what's next." description="Choose a track to preview its focus areas. Detailed sessions and speakers will be announced soon." enabled={enabled}/>
      <Reveal enabled={enabled} className="tracks-layout">
        <div className="track-tablist" role="tablist" aria-label="Explore technical tracks" aria-orientation="vertical">
          {keys.map((id,i) => {const TabIcon=trackIcons[id]; return <motion.button key={id} type="button" role="tab" initial={enabled ? {opacity:.65} : false} whileInView={{opacity:1}} viewport={{once:true}} transition={{duration:enabled?.35:0,delay:enabled?i*.045:0}} onPointerMove={tiltTrack} onPointerLeave={resetTrackTilt} id={'tab-'+id} aria-selected={key===id} aria-controls="track-panel" tabIndex={key===id?0:-1} ref={element=>{tabs.current[i]=element;}} onClick={()=>setKey(id)} onKeyDown={event=>onTabKey(event,i)}><TabIcon size={19}/><span>{tracks[id].title}</span><ArrowRight size={16}/></motion.button>;})}
        </div>
        <div id="track-panel" className="track-panel" role="tabpanel" aria-labelledby={'tab-'+key} tabIndex={0}>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div className="track-panel-content" key={key} initial={enabled?{opacity:0,x:12}:false} animate={{opacity:1,x:0}} exit={enabled?{opacity:0,x:-10}:undefined} transition={{duration:enabled?.22:0,ease}}>
              <div className="track-emblem"><Icon size={42}/></div>
              <TrackAnimation id={key} enabled={enabled}/>
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
  const group = useRef(null);
  const { scrollYProgress } = useScroll({ target: group, offset: ["start .9", "end .45"] });
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
  return <section ref={group} className="timeline-group" aria-labelledby={label+'-title'}>
    <div className="agenda-progress" aria-hidden="true"><motion.span style={{ scaleX: enabled ? scrollYProgress : 1 }}/></div>
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
        <div className="timeline-copy"><h4>{item.title}</h4><p>{item.description}</p></div><motion.span className="timeline-dot" aria-hidden="true" initial={enabled ? { scale: .55, opacity: .4 } : false} whileInView={{ scale: 1, opacity: 1 }} viewport={{ once: true, amount: .8 }} transition={{ duration: enabled ? .38 : 0 }}/>
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
  const thumbnail=useRef(null);
  const photoFrame=useRef(null);
  const [direction,setDirection]=useState(1);
  const shown=filter==='all'?photos:photos.filter(photo=>photo.category===filter);
  const selected=index===null?null:shown[index];
  const filters=[['all','All moments'],['sessions','Sessions'],['hands-on','Hands-on'],['community','Community']];
  useEffect(()=>{
    const node=dialog.current;
    if(index!==null&&!node.open) {
      node.showModal();
      if (enabled && thumbnail.current && photoFrame.current) {
        const frame=photoFrame.current;
        const to=frame.getBoundingClientRect();
        const from=thumbnail.current;
        frame.animate([
          { transform: `translate(${from.left-to.left}px,${from.top-to.top}px) scale(${from.width/to.width},${from.height/to.height})`, opacity: .6 },
          { transform: 'none', opacity: 1 }
        ], { duration: 420, easing: 'cubic-bezier(.22,1,.36,1)' });
      }
    }
    if(index===null&&node.open) node.close();
  },[index,enabled]);
  function step(direction) {
    if (shown.length < 2) return;
    setDirection(direction);
    setIndex(value=>(value+direction+shown.length)%shown.length);
  }
  return <section id="glimpses" className="site-wrap content-section">
    <SectionHeading eyebrow="GLIMPSES FROM 2025" title="The community" accent="in motion." description="Scenes from AWS Student Community Day Ahmedabad 2025 at Silver Oak University." enabled={enabled}/>
    <div className="gallery-filters flex flex-wrap gap-2" role="group" aria-label="Filter past event photos">
      {filters.map(([id,name])=><button key={id} type="button" className="filter" aria-pressed={filter===id} onClick={()=>setFilter(id)}>{name}</button>)}
    </div>
    <motion.div className="gallery-grid grid gap-4 sm:grid-cols-2 lg:grid-cols-3" key={filter}>
      {shown.map((photo,i)=><Reveal key={photo.src} enabled={enabled} delay={i%3*.065}>
        <button type="button" className="gallery-card" onClick={event=>{thumbnail.current=event.currentTarget.querySelector("img").getBoundingClientRect();setIndex(i);}} aria-label={'View '+photo.title}>
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
        <div ref={photoFrame} className="lightbox-photo" onTouchCancel={()=>{touch.current=null;}} onTouchStart={e=>{touch.current=e.touches[0].clientX;}} onTouchEnd={e=>{if(touch.current!==null){const delta=e.changedTouches[0].clientX-touch.current;if(Math.abs(delta)>45) step(delta<0?1:-1);touch.current=null;}}}>
          <AnimatePresence initial={false} custom={direction}>
            <motion.img key={selected.src} src={selected.src} alt={selected.alt}
              variants={{ enter: side=>({x:side*44,opacity:0}), visible:{x:0,opacity:1}, exit:side=>({x:-side*44,opacity:0}) }}
              initial={enabled ? 'enter' : false} animate="visible" exit={enabled ? 'exit' : undefined}
              custom={direction} transition={{duration:enabled ? .25 : 0}}/>
          </AnimatePresence>
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
    ['How can I register?','Registrations are open on KonfHub. Select Register in the navigation to open the registration page.'],
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
      <Header enabled={enabled}/>
      <main id="main">
        <Hero enabled={enabled} saveDate={saveDate}/>
        <Experience enabled={enabled}/>
        <Tracks enabled={enabled}/>
        <Schedule enabled={enabled}/>
        <Gallery enabled={enabled}/>
        <Venue enabled={enabled} saveDate={saveDate}/>
      </main>
      <footer className="site-footer"><div className="site-wrap footer-inner flex flex-wrap items-center justify-between gap-6"><div><strong>AWS Student Community Day Ahmedabad 2026</strong><span>AWS Student Builder Group at Silver Oak University</span></div><a href="#top" className="back-top">Back to top <ArrowUp size={17}/></a></div></footer>
      <div className="toast-holder" role="status" aria-live="polite"><AnimatePresence>{toast&&<motion.div className="toast" initial={enabled?{opacity:0,y:10}:false} animate={{opacity:1,y:0}} exit={{opacity:0}} transition={{duration:enabled?.2:0}}>Calendar file downloaded</motion.div>}</AnimatePresence></div>
    </div>
  </MotionConfig>;
}

createRoot(document.getElementById('root')).render(<App />);
