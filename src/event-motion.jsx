import React from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react';

export function ScrollKite({ progress, enabled }) {
  const x = useTransform(progress, [0, .35, .8], ['4vw', '-9vw', '-31vw']);
  const y = useTransform(progress, [0, .35, .8], [0, -45, 245]);
  const rotate = useTransform(progress, [0, .35, .8], [12, -20, 30]);
  const opacity = useTransform(progress, [0, .12, .62, .8], [0, .9, .9, 0]);
  if (!enabled) return null;
  return <motion.svg className="scroll-kite" viewBox="0 0 64 94" style={{ x, y, rotate, opacity }} aria-hidden="true">
    <path d="M31 52C17 65 51 69 35 81Q26 89 40 92" fill="none" stroke="currentColor" strokeWidth="2" />
    <path d="M31 3 56 27 31 55 7 27Z" fill="#f7941d" stroke="#ffe1a9" strokeWidth="2" />
    <path d="M31 3V55M7 27Q31 13 56 27" fill="none" stroke="#713418" strokeWidth="1.5" />
  </motion.svg>;
}

const tracks = {
  behind: 'M23 37H12A7 7 0 0 1 11 23 12 12 0 0 1 34 18 10 10 0 0 1 39 37H23V46H43',
  devsecops: 'M24 5 43 13V25Q40 40 24 48 8 40 5 25V13Z M15 25 22 32 34 19',
  quantum: 'M6 26A18 10 0 1 0 42 26 18 10 0 1 0 6 26 M24 8A10 18 0 1 0 24 44 10 18 0 1 0 24 8',
  agents: 'M24 7V21M8 38 24 26 42 38M24 26V45 M20 7A4 4 0 1 0 28 7 4 4 0 1 0 20 7 M4 38A4 4 0 1 0 12 38 4 4 0 1 0 4 38 M38 38A4 4 0 1 0 46 38 4 4 0 1 0 38 38',
  robotics: 'M5 44C6 25 13 18 24 25S42 22 43 8 M37 12 43 6 47 13',
  twinmaker: 'M24 26 8 10M24 26 40 10M24 26 24 44 M19 26A5 5 0 1 0 29 26 5 5 0 1 0 19 26 M5 7H11V13H5Z M37 7H43V13H37Z M21 41H27V47H21Z',
};

export function TrackAnimation({ id, enabled }) {
  return <svg className={'track-animation' + (enabled ? ' track-motion' : '')} viewBox="0 0 48 52" aria-hidden="true">
    <path d={tracks[id]} pathLength="1" />
    {id === 'robotics' && <rect className="track-car" x="-3" y="-2" width="6" height="4" rx="1" />}
  </svg>;
}

const cloudLayers = [
  ['far', 42, 16, 25, 36, 6],
  ['west', 29, 38, -17, 28, 15],
  ['east', 24, 21, 19, 32, 12],
  ['low', 19, 72, 14, 25, 18],
];

export function CloudBackdrop({ enabled }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const smoothX = useSpring(x, { stiffness: 45, damping: 20 });
  const smoothY = useSpring(y, { stiffness: 45, damping: 20 });

  React.useEffect(() => {
    const hero = document.getElementById('event-title')?.closest('.hero');
    if (!enabled || !hero) return;
    const pointer = matchMedia('(hover: hover) and (pointer: fine)');
    function move(event) {
      if (!pointer.matches || event.pointerType !== 'mouse') return;
      const bounds = hero.getBoundingClientRect();
      x.set((event.clientX - bounds.left) / bounds.width - .5);
      y.set((event.clientY - bounds.top) / bounds.height - .5);
    }
    function reset() { x.set(0); y.set(0); }
    hero.addEventListener('pointermove', move, { passive: true });
    hero.addEventListener('pointerleave', reset);
    return () => {
      hero.removeEventListener('pointermove', move);
      hero.removeEventListener('pointerleave', reset);
    };
  }, [enabled, x, y]);

  return <div className="cloud-backdrop" aria-hidden="true">
    {cloudLayers.map(([name, width, top, travel, duration, depth]) =>
      <CloudLayer key={name} {...{ name, width, top, travel, duration, depth, enabled }} x={smoothX} y={smoothY}/>)}
    <div className="cloud-particles"><i/><i/><i/><i/><i/><i/></div>
  </div>;
}

function CloudLayer({ name, width, top, travel, duration, depth, enabled, x, y }) {
  const px = useTransform(x, value => value * depth * 2);
  const py = useTransform(y, value => value * depth);
  return <motion.div className={'cloud-layer cloud-' + name} style={{ width: width + '%', top: top + '%', x: enabled ? px : 0, y: enabled ? py : 0 }}>
    <motion.svg viewBox="0 0 340 155" animate={enabled ? { x: [0, travel, 0], y: [0, -10, 0] } : { x: 0, y: 0 }}
      transition={enabled ? { duration, ease: 'easeInOut', repeat: Infinity } : { duration: 0 }}>
      <defs>
        <radialGradient id={'cloud-light-' + name} cx=".38" cy=".22" r=".84">
          <stop offset=".25" stopColor="#fff"/>
          <stop offset=".66" stopColor="#f3fbff"/>
          <stop offset="1" stopColor="#a3c8df"/>
        </radialGradient>
      </defs>
      <g fill={`url(#cloud-light-${name})`}>
        <ellipse cx="163" cy="112" rx="139" ry="34"/>
        <ellipse cx="78" cy="102" rx="62" ry="34"/>
        <ellipse cx="136" cy="84" rx="62" ry="49"/>
        <ellipse cx="199" cy="69" rx="67" ry="58"/>
        <ellipse cx="256" cy="103" rx="69" ry="38"/>
      </g>
    </motion.svg>
  </motion.div>;
}

const networkNodes = [[24,90],[151,39],[247,126],[380,55],[523,158],[648,72],[790,125],[934,43],[1054,119],[1155,51],[76,257],[252,295],[475,265],[703,306],[961,249],[1169,270]];

export function TrackNetwork() {
  return <div className="track-network" aria-hidden="true">
    <svg viewBox="0 0 1200 320" preserveAspectRatio="xMidYMid slice">
      <path d="M24 90L151 39 247 126 380 55 523 158 648 72 790 125 934 43 1054 119 1155 51M24 90L76 257 247 126 252 295 475 265 523 158 703 306 790 125 961 249 1054 119 1169 270 961 249 703 306"/>
      {networkNodes.map(([x,y], i) => <circle key={x} cx={x} cy={y} r={i % 3 === 0 ? 4 : 3} style={{ animationDelay: -i * .61 + 's' }}/>)}
    </svg>
  </div>;
}

export function tiltTrack(event) {
  if (event.pointerType !== 'mouse' || !matchMedia('(hover: hover) and (pointer: fine)').matches ||
      matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const card = event.currentTarget;
  const { left, top, width, height } = card.getBoundingClientRect();
  card.style.setProperty('--tilt-x', (2 - 4 * (event.clientY - top) / height) + 'deg');
  card.style.setProperty('--tilt-y', (5 * (event.clientX - left) / width - 2.5) + 'deg');
}

export function resetTrackTilt(event) {
  event.currentTarget.style.removeProperty('--tilt-x');
  event.currentTarget.style.removeProperty('--tilt-y');
}
