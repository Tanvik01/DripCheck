// ErrorState.jsx — Exact match of the error page HTML design

import { useEffect, useRef } from 'react';

export default function ErrorState({ message, onRetry }) {
  const sectionRef = useRef(null);

  // 3D tilt on mouse move (matches the error page script)
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!sectionRef.current) return;
      const x = e.clientX / window.innerWidth - 0.5;
      const y = e.clientY / window.innerHeight - 0.5;
      sectionRef.current.style.transform = `perspective(1000px) rotateY(${x * 5}deg) rotateX(${-y * 5}deg)`;
    };
    document.addEventListener('mousemove', handleMouseMove);
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <main className="flex-grow flex flex-col items-center justify-center px-container-padding-mobile py-stack-lg relative overflow-hidden min-h-[60vh]">
      <section
        ref={sectionRef}
        className="relative z-10 w-full max-w-md flex flex-col items-center text-center"
        style={{ transition: 'transform 0.1s ease-out' }}
      >
        {/* Wobble illustration area */}
        <div className="relative mb-stack-md animate-wobble">
          <div className="w-64 h-64 bg-tertiary rounded-xl sticker-border relative flex items-center justify-center overflow-hidden">
            {/* Placeholder illustration */}
            <div className="flex flex-col items-center gap-2 p-4">
              <span
                className="material-symbols-outlined text-on-tertiary-container select-none"
                style={{ fontSize: '80px', fontVariationSettings: '"FILL" 1' }}
              >
                sentiment_dissatisfied
              </span>
              <span className="font-label-xl text-label-xl text-on-tertiary-container uppercase tracking-widest">
                Style Error
              </span>
            </div>

            {/* Floatie badge */}
            <div className="absolute -top-4 -right-4 bg-secondary-container text-on-secondary-container px-3 py-1 rounded-full sticker-border font-label-xl text-label-xl rotate-12 whitespace-nowrap">
              #FashionGlitch
            </div>
          </div>

          {/* Bottom badge */}
          <div className="absolute -bottom-4 -left-4 bg-primary text-on-primary px-3 py-1 rounded-full sticker-border font-label-xl text-label-xl -rotate-12 whitespace-nowrap">
            404: STYLE NOT FOUND
          </div>
        </div>

        {/* Text content */}
        <h2 className="font-headline-lg-mobile text-headline-lg-mobile text-primary italic uppercase mb-2 mt-4">
          Oops!
        </h2>
        <p className="font-headline-lg-mobile text-headline-lg-mobile text-secondary mb-stack-sm leading-none">
          Our Stylist Tripped.
        </p>
        <p className="font-body-lg text-body-lg text-on-surface-variant mb-stack-lg px-4">
          {message || "Looks like your fit was too fire for our servers to handle. We've got a lint roller and we're cleaning up the mess!"}
        </p>

        {/* Action buttons */}
        <div className="flex flex-col w-full gap-gutter">
          <button
            onClick={onRetry}
            id="error-retry-btn"
            className="bg-primary text-on-primary py-4 rounded-full font-label-xl text-label-xl uppercase tracking-widest hard-shadow-sm sticker-border-sm flex items-center justify-center gap-2 transition-transform active:translate-x-px active:translate-y-px"
          >
            <span className="material-symbols-outlined select-none">cloud_upload</span>
            Back to Upload
          </button>

          <button
            onClick={onRetry}
            className="bg-surface-container-high text-secondary py-4 rounded-full font-label-xl text-label-xl uppercase tracking-widest sticker-border-sm flex items-center justify-center gap-2 hover:bg-primary hover:text-on-primary transition-all active:scale-95"
          >
            <span className="material-symbols-outlined select-none">auto_awesome</span>
            Try Again
          </button>
        </div>

        {/* Hashtag chips */}
        <div className="mt-stack-lg flex flex-wrap justify-center gap-base">
          {['#WrongSize', '#TextureFail', '#VibeBroken'].map((tag) => (
            <span
              key={tag}
              className="bg-tertiary-container text-on-tertiary-container px-4 py-2 rounded-full font-label-xl text-label-xl uppercase"
            >
              {tag}
            </span>
          ))}
        </div>
      </section>
    </main>
  );
}
