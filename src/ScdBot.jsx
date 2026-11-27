import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Sparkles, X } from 'lucide-react';

const BOT_MESSAGES = [
  '12 Dec 2026 · AWS Student Community Day at Silver Oak University! ☁️',
  '6 Technical Tracks: Behind AWS, DevSecOps, Quantum, AI Agents, Robotics & IoT TwinMaker! 🚀',
  'Visit the Student Builder Zone from 03:45 PM to see live projects! 🛠️',
  'Venue: Aryabhata Auditorium, 5th Floor, EB-Block, Silver Oak University. 📍',
  'Morning starts at 08:00 AM IST with Registration & Breakfast! ☕',
  'Don’t miss the Quiz at 12:00 PM and Swags & High Tea at 05:15 PM! 🎁',
  'Catch me if you can! Drag me anywhere or click me for more tips! ⚡',
];

const TRICKS = ['spin', 'jump', 'dance', 'dash', 'wave'];
const BOT_SIZE = 78;
const EDGE_PAD = 16;
const GROUND_OFFSET = 14;

function groundY() {
  if (typeof window === 'undefined') return 24;
  return Math.max(EDGE_PAD, window.innerHeight - BOT_SIZE - GROUND_OFFSET);
}

function clampPosition(x, y) {
  if (typeof window === 'undefined') return { x: 24, y: 24 };
  const maxX = Math.max(EDGE_PAD, window.innerWidth - BOT_SIZE - EDGE_PAD);
  const maxY = Math.max(EDGE_PAD, window.innerHeight - BOT_SIZE - EDGE_PAD);
  return {
    x: Math.min(Math.max(EDGE_PAD, x), maxX),
    y: Math.min(Math.max(EDGE_PAD, y), maxY),
  };
}

export function ScdBot({ enabled }) {
  const [pos, setPos] = useState(() =>
    typeof window === 'undefined'
      ? { x: 24, y: 24 }
      : clampPosition(window.innerWidth - BOT_SIZE - 48, groundY())
  );
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [facing, setFacing] = useState(-1); // -1 = left, 1 = right
  const [trick, setTrick] = useState('walk');

  const posRef = useRef(pos);
  posRef.current = pos;

  const dragRef = useRef({
    active: false,
    moved: false,
    pointerId: null,
    startX: 0,
    startY: 0,
    originX: 0,
    originY: 0,
  });

  useEffect(() => {
    const onResize = () => setPos((prev) => clampPosition(prev.x, groundY()));
    window.addEventListener('resize', onResize, { passive: true });
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Autonomous ground roaming & crazy tricks
  useEffect(() => {
    if (!enabled || dragging || hovered) return;

    let frameId = 0;
    let lastTime = performance.now();
    let dir = facing;
    let speed = 58; // px per second
    let nextTrickAt = lastTime + 2200 + Math.random() * 2000;
    let trickEndsAt = 0;
    let activeTrick = 'walk';

    const tick = (now) => {
      const dt = Math.min(0.05, (now - lastTime) / 1000);
      lastTime = now;

      if (now >= nextTrickAt && activeTrick === 'walk') {
        activeTrick = TRICKS[Math.floor(Math.random() * TRICKS.length)];
        setTrick(activeTrick);
        trickEndsAt = now + (activeTrick === 'dash' ? 950 : 1250);
        if (activeTrick === 'dash') {
          speed = 230;
        }
      } else if (activeTrick !== 'walk' && now >= trickEndsAt) {
        activeTrick = 'walk';
        setTrick('walk');
        speed = 58 + Math.random() * 26;
        if (Math.random() < 0.35) {
          dir = -dir;
          setFacing(dir);
        }
        nextTrickAt = now + 2200 + Math.random() * 2600;
      }

      const maxX = Math.max(EDGE_PAD, window.innerWidth - BOT_SIZE - EDGE_PAD);
      const targetY = groundY();
      const current = posRef.current;

      // Gently settle back to ground if user dropped it mid-air, otherwise walk horizontally
      const dy = targetY - current.y;
      const nextY = Math.abs(dy) > 1.5 ? current.y + dy * Math.min(1, dt * 6) : targetY;

      let nextX = current.x;
      if (activeTrick !== 'wave' && activeTrick !== 'dance') {
        nextX += dir * speed * dt;
        if (nextX <= EDGE_PAD) {
          nextX = EDGE_PAD;
          dir = 1;
          setFacing(1);
        } else if (nextX >= maxX) {
          nextX = maxX;
          dir = -1;
          setFacing(-1);
        }
      }

      setPos({ x: nextX, y: nextY });
      frameId = requestAnimationFrame(tick);
    };

    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [enabled, dragging, hovered]);

  function handlePointerDown(event) {
    if (event.button !== 0 && event.pointerType === 'mouse') return;
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = {
      active: true,
      moved: false,
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      originX: pos.x,
      originY: pos.y,
    };
  }

  function handlePointerMove(event) {
    const state = dragRef.current;
    if (!state.active || state.pointerId !== event.pointerId) return;
    const dx = event.clientX - state.startX;
    const dy = event.clientY - state.startY;
    if (!state.moved && Math.hypot(dx, dy) > 5) {
      state.moved = true;
      setDragging(true);
      setTrick('walk');
    }
    if (state.moved) {
      if (Math.abs(dx) > 2) setFacing(dx > 0 ? 1 : -1);
      setPos(clampPosition(state.originX + dx, state.originY + dy));
    }
  }

  function handlePointerUp(event) {
    const state = dragRef.current;
    if (!state.active || state.pointerId !== event.pointerId) return;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    const wasMoved = state.moved;
    state.active = false;
    state.moved = false;
    setDragging(false);

    if (!wasMoved) {
      if (!open) {
        setOpen(true);
      } else {
        setIndex((prev) => (prev + 1) % BOT_MESSAGES.length);
      }
    }
  }

  function handleKeyDown(event) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      if (!open) setOpen(true);
      else setIndex((prev) => (prev + 1) % BOT_MESSAGES.length);
    }
  }

  const placeBelow = pos.y < 190;
  const alignLeft = pos.x < 130;
  const alignRight = typeof window !== 'undefined' && pos.x > window.innerWidth - 190;
  const bubbleAlign = alignLeft ? 'is-left' : alignRight ? 'is-right' : 'is-center';

  return (
    <div
      className={`scd-bot-root trick-${trick}${dragging ? ' is-dragging' : ''}`}
      style={{ transform: `translate3d(${pos.x}px, ${pos.y}px, 0)` }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <AnimatePresence mode="wait">
        {open && (
          <motion.div
            key="bubble"
            className={`scd-bot-bubble ${placeBelow ? 'is-below' : 'is-above'} ${bubbleAlign}`}
            role="status"
            aria-live="polite"
            initial={enabled ? { opacity: 0, scale: 0.92, y: placeBelow ? -6 : 6 } : false}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={enabled ? { opacity: 0, scale: 0.92, y: placeBelow ? -6 : 6 } : undefined}
            transition={{ duration: enabled ? 0.2 : 0, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="scd-bot-bubble-head">
              <span className="scd-bot-badge">
                <Sparkles size={13} aria-hidden="true" />
                SCD BOT
              </span>
              <button
                type="button"
                className="scd-bot-close"
                aria-label="Close bot message"
                onClick={() => setOpen(false)}
              >
                <X size={15} aria-hidden="true" />
              </button>
            </div>
            <motion.p
              key={index}
              className="scd-bot-message"
              initial={enabled ? { opacity: 0, y: 4 } : false}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: enabled ? 0.18 : 0 }}
            >
              {BOT_MESSAGES[index]}
            </motion.p>
            <div className="scd-bot-bubble-foot">
              <span>Click bot for next tip</span>
              <span>{index + 1} / {BOT_MESSAGES.length}</span>
            </div>
            <span className="scd-bot-tail" aria-hidden="true" />
          </motion.div>
        )}
      </AnimatePresence>

      <button
        type="button"
        className="scd-bot-avatar"
        aria-label="SCD Bot assistant. Click to view or cycle event tips, or drag to move."
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onKeyDown={handleKeyDown}
      >
        <span className="scd-bot-shadow" aria-hidden="true" />
        <span className="scd-bot-sparks" aria-hidden="true">
          <i /><i /><i />
        </span>
        <svg
          className="scd-bot-svg"
          style={{ '--bot-dir': facing }}
          viewBox="0 0 96 96"
          fill="none"
          aria-hidden="true"
        >
          {/* Antenna */}
          <path d="M48 11V18" stroke="#0b2c43" strokeWidth="3.5" strokeLinecap="round" />
          <circle cx="48" cy="9" r="4.5" fill="#f7941d" stroke="#0b2c43" strokeWidth="2.5" />

          {/* Ear pods */}
          <rect x="13" y="30" width="9" height="18" rx="4.5" fill="#f7941d" stroke="#0b2c43" strokeWidth="2.8" />
          <rect x="74" y="30" width="9" height="18" rx="4.5" fill="#f7941d" stroke="#0b2c43" strokeWidth="2.8" />

          {/* Head */}
          <rect x="20" y="18" width="56" height="40" rx="18" fill="#fff8e7" stroke="#0b2c43" strokeWidth="3" />
          {/* Visor */}
          <rect x="26" y="24" width="44" height="27" rx="12" fill="#0b2c43" />
          {/* Happy glowing eyes */}
          <path d="M35 37C36.5 33.5 40.5 33.5 42 37" stroke="#ffbe5c" strokeWidth="3.2" strokeLinecap="round" />
          <path d="M54 37C55.5 33.5 59.5 33.5 61 37" stroke="#ffbe5c" strokeWidth="3.2" strokeLinecap="round" />
          {/* Cute smile */}
          <path d="M44 43C46.5 45.5 49.5 45.5 52 43" stroke="#f7941d" strokeWidth="2.6" strokeLinecap="round" />
          {/* Visor highlight */}
          <path d="M32 28H42" stroke="#ffffff38" strokeWidth="2.2" strokeLinecap="round" />

          {/* Left waving arm */}
          <g className="scd-bot-arm-left">
            <path d="M25 63L14 53" stroke="#fff8e7" strokeWidth="8" strokeLinecap="round" />
            <path d="M25 63L14 53" stroke="#0b2c43" strokeWidth="3" strokeLinecap="round" />
            <circle cx="13" cy="52" r="4.5" fill="#f7941d" stroke="#0b2c43" strokeWidth="2.5" />
          </g>

          {/* Right arm */}
          <g className="scd-bot-arm-right">
            <path d="M71 63L79 71" stroke="#fff8e7" strokeWidth="8" strokeLinecap="round" />
            <path d="M71 63L79 71" stroke="#0b2c43" strokeWidth="3" strokeLinecap="round" />
            <circle cx="80" cy="72" r="4.2" fill="#f7941d" stroke="#0b2c43" strokeWidth="2.5" />
          </g>

          {/* Body */}
          <rect x="29" y="59" width="38" height="24" rx="11" fill="#fff8e7" stroke="#0b2c43" strokeWidth="3" />
          {/* Chest core */}
          <rect x="40" y="64" width="16" height="13" rx="4" fill="#0b2c43" />
          <rect x="44" y="67.5" width="8" height="6" rx="2" fill="#f7941d" />

          {/* Boots */}
          <rect className="scd-bot-foot-left" x="31" y="81" width="13" height="8" rx="4" fill="#f7941d" stroke="#0b2c43" strokeWidth="2.8" />
          <rect className="scd-bot-foot-right" x="52" y="81" width="13" height="8" rx="4" fill="#f7941d" stroke="#0b2c43" strokeWidth="2.8" />
        </svg>
      </button>
    </div>
  );
}
