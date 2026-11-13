import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function createParallax(container, selector, from, to, start, end) {
  return gsap.context(() => {
    gsap.fromTo(selector, from, {
      ...to, ease: 'none',
      scrollTrigger: { trigger: container, start, end, scrub: .85 }
    });
  }, container);
}
