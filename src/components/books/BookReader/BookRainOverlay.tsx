'use client';

import { useEffect, type RefObject } from 'react';

type Drop = {
  x: number;
  landingY: number;
  progress: number;
  drying: number;
  speed: number;
  length: number;
  radius: number;
};

const DROP_COUNT = 11;
const PUDDLE_DRY_SECONDS = 1.15;

function createDrop(): Drop {
  return {
    x: 0.08 + Math.random() * 0.84,
    landingY: 0.12 + Math.random() * 0.76,
    progress: 0,
    drying: 0,
    speed: 0.13 + Math.random() * 0.08,
    length: 8 + Math.random() * 4,
    radius: 2.3 + Math.random() * 1.2,
  };
}

export function BookRainOverlay({ targetRef }: { targetRef: RefObject<HTMLDivElement> }) {
  useEffect(() => {
    const host = targetRef.current;
    if (!host) return;
    const canvas = document.createElement('canvas');
    canvas.className = 'book-rain-overlay';
    canvas.setAttribute('aria-hidden', 'true');
    host.appendChild(canvas);

    const context = canvas.getContext('2d');
    if (!context) {
      canvas.remove();
      return;
    }

    const drops = Array.from({ length: DROP_COUNT }, () => {
      const drop = createDrop();
      drop.progress = Math.random() * 0.65;
      return drop;
    });
    let width = 0;
    let height = 0;
    let pixelRatio = 1;
    let animationFrame = 0;
    let previousTime = 0;

    const resizeCanvas = () => {
      width = host.clientWidth;
      height = host.clientHeight;
      pixelRatio = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.round(width * pixelRatio);
      canvas.height = Math.round(height * pixelRatio);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    };

    const resizeObserver = new ResizeObserver(resizeCanvas);
    resizeObserver.observe(host);
    resizeCanvas();

    const animate = (time: number) => {
      const delta = Math.min((time - (previousTime || time)) / 1000, 0.05);
      previousTime = time;
      context.clearRect(0, 0, width, height);

      const book = host.querySelector<HTMLElement>('.demo-book');
      if (book) {
        const hostBounds = host.getBoundingClientRect();
        const bookBounds = book.getBoundingClientRect();
        const scaleX = hostBounds.width / Math.max(host.clientWidth, 1);
        const scaleY = hostBounds.height / Math.max(host.clientHeight, 1);
        const bounds = {
          left: (bookBounds.left - hostBounds.left) / scaleX,
          top: (bookBounds.top - hostBounds.top) / scaleY,
          width: bookBounds.width / scaleX,
          height: bookBounds.height / scaleY,
        };
        const inset = Math.min(14, bounds.width * 0.025);
        const left = bounds.left + inset;
        const top = bounds.top + inset;
        const dropWidth = Math.max(1, bounds.width - inset * 2);
        const pageHeight = Math.max(1, bounds.height - inset * 2);

        context.save();
        context.beginPath();
        context.roundRect(left, top, dropWidth, pageHeight, 5);
        context.clip();

        drops.forEach((drop) => {
          const x = left + drop.x * dropWidth;
          const landingY = top + drop.landingY * pageHeight;

          if (drop.drying > 0) {
            drop.drying += delta;
            const dryProgress = Math.min(drop.drying / PUDDLE_DRY_SECONDS, 1);
            const opacity = (1 - dryProgress) * 0.32;
            const puddleWidth = 4 + dryProgress * 12;
            const puddleHeight = 2 + dryProgress * 3;

            context.beginPath();
            context.ellipse(x, landingY + 1, puddleWidth, puddleHeight, -0.08, 0, Math.PI * 2);
            context.fillStyle = `rgba(74, 137, 158, ${opacity * 0.36})`;
            context.fill();

            context.beginPath();
            context.ellipse(x, landingY, puddleWidth, puddleHeight, -0.08, 0, Math.PI * 2);
            context.strokeStyle = `rgba(71, 132, 154, ${opacity * 0.6})`;
            context.lineWidth = 1.4;
            context.stroke();

            context.beginPath();
            context.ellipse(x - puddleWidth * 0.2, landingY - 0.8, puddleWidth * 0.42, 0.8, -0.08, 0, Math.PI * 2);
            context.strokeStyle = `rgba(196, 226, 232, ${opacity * 0.22})`;
            context.lineWidth = 1;
            context.stroke();

            if (dryProgress >= 1) Object.assign(drop, createDrop());
            return;
          }

          drop.progress += drop.speed * delta;
          if (drop.progress >= 1) {
            drop.progress = 1;
            drop.drying = 0.001;
            return;
          }

          const y = top + drop.progress * (drop.landingY * pageHeight);
          const fade = Math.min(1, drop.progress * 4 + 0.15);
          context.beginPath();
          context.moveTo(x, y - drop.length);
          context.lineTo(x, y);
          context.strokeStyle = `rgba(66, 126, 149, ${0.38 * fade})`;
          context.lineWidth = 1.35;
          context.stroke();

          context.beginPath();
          context.ellipse(x - 0.5, y - 1, drop.radius, drop.radius * 1.55, -0.2, 0, Math.PI * 2);
          context.fillStyle = `rgba(72, 145, 169, ${0.27 * fade})`;
          context.fill();
          context.beginPath();
          context.ellipse(x - drop.radius * 0.22, y - drop.radius * 1.25, drop.radius * 0.25, drop.radius * 0.42, -0.2, 0, Math.PI * 2);
          context.fillStyle = `rgba(220, 242, 246, ${0.17 * fade})`;
          context.fill();
        });

        context.restore();
      }
      animationFrame = window.requestAnimationFrame(animate);
    };

    animationFrame = window.requestAnimationFrame(animate);
    return () => {
      window.cancelAnimationFrame(animationFrame);
      resizeObserver.disconnect();
      canvas.remove();
    };
  }, [targetRef]);

  return null;
}
