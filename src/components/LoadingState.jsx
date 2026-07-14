// LoadingState.jsx — Exact match of the loading page HTML design

import { useEffect, useState } from 'react';

const MESSAGES = [
  'Stitching your look...',
  'Analyzing the drip...',
  'Syncing the vibe...',
  'Curating the heat...',
  'Polishing your style...',
];

const TIPS = [
  'Layering oversized neon knits with chunky silver chains is the ultimate 2024 mood.',
  'Mixing textures — velvet with leather — is the secret sauce for a high-fashion fit.',
  'A statement belt can transform any look from "meh" to "main character" instantly.',
  'The rule is: one neon piece per outfit. Let it do the talking. 🔥',
];

export default function LoadingState({ vibe }) {
  const [msgIndex, setMsgIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setMsgIndex((i) => (i + 1) % MESSAGES.length);
        setVisible(true);
      }, 300);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  const tip = TIPS[Math.floor(Date.now() / 10000) % TIPS.length];

  return (
    <div className="flex-grow flex flex-col items-center justify-center relative px-container-padding-mobile py-stack-lg dynamic-bg min-h-[60vh]">
      {/* Pulsing Center Animation Cluster */}
      <div className="relative flex items-center justify-center w-64 h-64">
        {/* Outer Pulsing Ring */}
        <div className="absolute inset-0 border-8 border-primary-container rounded-full animate-pulse-ring opacity-30" />

        {/* Middle Graphic Container */}
        <div className="relative z-10 bg-secondary-container p-6 rounded-xl sticker-border rotate-3">
          <span
            className="material-symbols-outlined text-on-secondary-container block animate-bounce select-none"
            style={{ fontSize: '80px', fontVariationSettings: '"FILL" 1' }}
          >
            auto_awesome
          </span>
        </div>

        {/* Orbiting Chip — top right */}
        <div className="absolute top-0 right-0 bg-tertiary text-on-tertiary px-3 py-1 font-label-xl text-label-xl rounded-full sticker-border -rotate-12 animate-pulse whitespace-nowrap">
          TRENDING
        </div>

        {/* Orbiting Chip — bottom left */}
        <div className="absolute bottom-4 left-0 bg-primary text-on-primary px-3 py-1 font-label-xl text-label-xl rounded-full sticker-border rotate-6 whitespace-nowrap">
          DRIP CHECK
        </div>
      </div>

      {/* Loading Text */}
      <div className="mt-stack-lg text-center">
        <h2
          className="font-headline-lg-mobile text-headline-lg-mobile italic uppercase text-primary tracking-tighter drop-shadow-[4px_4px_0px_rgba(0,0,0,1)] transition-opacity duration-300"
          style={{ opacity: visible ? 1 : 0 }}
        >
          {MESSAGES[msgIndex]}
        </h2>

        {/* Bouncing dots */}
        <div className="mt-stack-sm flex justify-center gap-base">
          <div className="w-3 h-3 bg-secondary-container rounded-full animate-bounce [animation-delay:-0.3s]" />
          <div className="w-3 h-3 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]" />
          <div className="w-3 h-3 bg-tertiary-container rounded-full animate-bounce" />
        </div>

        {vibe && (
          <p className="mt-3 font-body-md text-body-md text-on-surface-variant">
            Finding your{' '}
            <span className="text-primary font-black italic uppercase">{vibe}</span> look
          </p>
        )}
      </div>

      {/* Pro-Tip Card */}
      <div className="mt-12 bg-surface-container-high p-stack-md rounded-lg border-2 border-outline-variant w-full max-w-xs relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1 h-full bg-secondary-container" />
        <p className="font-label-xl text-label-xl text-secondary-container mb-2 uppercase font-bold tracking-widest">
          Vibe Pro-Tip
        </p>
        <p className="font-body-md text-body-md text-on-surface">{tip}</p>
      </div>
    </div>
  );
}
