// App.jsx — Full-page state machine matching the HTML design screens

import { useState, useCallback } from 'react';
import Header from './components/Header';
import UploadZone from './components/UploadZone';
import VibeInput from './components/VibeInput';
import LoadingState from './components/LoadingState';
import ErrorState from './components/ErrorState';
import ResultCard from './components/ResultCard';

const API_URL = '/api/style';

// status: 'upload' | 'loading' | 'result' | 'error'

export default function App() {
  const [images, setImages] = useState([]);
  const [vibe, setVibe] = useState('');
  const [result, setResult] = useState(null);
  const [status, setStatus] = useState('upload');
  const [apiError, setApiError] = useState('');
  const [uploadError, setUploadError] = useState('');
  const [isRegenerating, setIsRegenerating] = useState(false);

  // ── Validation ──────────────────────────────────────────────
  const validate = () => {
    if (images.length < 2) {
      setUploadError('Drop at least 2 clothing items to get styled 👗');
      return false;
    }
    if (!vibe.trim()) {
      setUploadError('Describe the vibe first — what mood are we going for? ✨');
      return false;
    }
    setUploadError('');
    return true;
  };

  // ── API Call ─────────────────────────────────────────────────
  const callAPI = useCallback(
    async (regenerate = false) => {
      if (!regenerate && !validate()) return;

      if (regenerate) {
        setIsRegenerating(true);
      } else {
        setStatus('loading');
        setResult(null);
      }
      setApiError('');

      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 60000);

        const response = await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            images: images.map((img) => img.dataUrl),
            vibe: vibe.trim(),
            regenerate,
          }),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || `Request failed (${response.status})`);
        }

        setResult(data);
        setStatus('result');
      } catch (err) {
        const msg =
          err.name === 'AbortError'
            ? "Gemini's in the dressing room — took too long. Try again! ⏱️"
            : err.message || 'Something went wrong in the styling session. Try again!';

        setApiError(msg);
        if (!regenerate) setStatus('error');
      } finally {
        setIsRegenerating(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [images, vibe]
  );

  const handleStyleMe = () => callAPI(false);
  const handleRegenerate = () => callAPI(true);
  const handleReset = () => {
    setImages([]);
    setVibe('');
    setResult(null);
    setStatus('upload');
    setApiError('');
    setUploadError('');
    setIsRegenerating(false);
  };

  // ── Render ───────────────────────────────────────────────────
  return (
    <div className="mobile-shell flex flex-col">
      <Header />

      {/* ════════════════ UPLOAD SCREEN ════════════════ */}
      {status === 'upload' && (
        <main className="flex flex-col items-center px-container-padding-mobile pb-24 overflow-y-auto">
          {/* Hero Header */}
          <section className="w-full pt-stack-md text-left">
            <h2 className="font-headline-lg-mobile text-headline-lg-mobile text-primary uppercase italic leading-none mb-2">
              What's the <br />
              <span className="text-secondary-container bg-on-secondary py-1 px-2 inline-block">
                vibe today?
              </span>
            </h2>
            <p className="font-body-md text-body-md text-on-surface-variant opacity-80 mt-2">
              Upload your fit and let our AI curate your next level look.
            </p>
          </section>

          {/* Upload Zone */}
          <UploadZone
            images={images}
            onImagesChange={setImages}
            onError={(msg) => setUploadError(msg)}
          />

          {/* Vibe Input */}
          <VibeInput value={vibe} onChange={setVibe} disabled={false} />

          {/* Inline error (upload / validation) */}
          {uploadError && (
            <div className="w-full mt-stack-sm bg-error-container/20 border-2 border-error/40 rounded-DEFAULT px-4 py-3 flex items-start gap-3">
              <span className="text-error font-label-xl text-label-xl flex-1">{uploadError}</span>
              <button
                onClick={() => setUploadError('')}
                className="text-error/60 hover:text-error transition-colors text-sm font-black"
                aria-label="Dismiss"
              >
                ✕
              </button>
            </div>
          )}

          {/* Style Me Button */}
          <section className="w-full mt-stack-md">
            <button
              id="style-me-btn"
              onClick={handleStyleMe}
              disabled={images.length < 2 || !vibe.trim()}
              className="w-full py-6 rounded-full bg-primary-container text-on-primary-container font-headline-lg-mobile text-2xl italic flex items-center justify-center gap-3 hard-shadow-black active:translate-x-px active:translate-y-px active:shadow-none transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none disabled:active:translate-x-0 disabled:active:translate-y-0"
            >
              STYLE ME
              <span
                className="material-symbols-outlined text-3xl select-none"
                style={{ fontVariationSettings: '"FILL" 1' }}
              >
                bolt
              </span>
            </button>
          </section>

          {/* Footer */}
          <footer className="flex flex-col items-center gap-stack-sm px-container-padding-mobile py-stack-md w-full bg-surface-container-lowest border-t-4 border-secondary-container mt-stack-lg mb-20">
            <h4 className="font-headline-lg-mobile text-headline-lg-mobile text-primary italic">
              DripCheck
            </h4>
            <div className="flex gap-4">
              {['Privacy', 'Terms', 'Legal'].map((link) => (
                <a
                  key={link}
                  href="#"
                  className="text-on-surface-variant font-label-xl text-label-xl hover:text-primary transition-colors"
                >
                  {link}
                </a>
              ))}
            </div>
            <p className="text-secondary font-label-xl text-label-xl mt-2">
              © 2024 DRIPCHECK. STAY LOUD.
            </p>
          </footer>
        </main>
      )}

      {/* ════════════════ LOADING SCREEN ════════════════ */}
      {status === 'loading' && <LoadingState vibe={vibe} />}

      {/* ════════════════ RESULT SCREEN ════════════════ */}
      {status === 'result' && result && (
        <>
          {/* Back button */}
          <div className="px-container-padding-mobile pt-stack-md">
            <button
              onClick={handleReset}
              className="flex items-center gap-2 text-on-surface-variant font-label-xl text-label-xl uppercase tracking-widest hover:text-primary transition-colors"
            >
              <span className="material-symbols-outlined text-base select-none">arrow_back</span>
              Start over
            </button>
          </div>

          {/* Regeneration error */}
          {apiError && (
            <div className="mx-container-padding-mobile mt-2 bg-error-container/20 border-2 border-error/40 rounded-DEFAULT px-4 py-3 flex items-start gap-3">
              <span className="text-error font-label-xl text-label-xl flex-1">{apiError}</span>
              <button
                onClick={() => setApiError('')}
                className="text-error/60 hover:text-error transition-colors text-sm font-black"
              >
                ✕
              </button>
            </div>
          )}

          <ResultCard
            result={result}
            images={images}
            vibe={vibe}
            onRegenerate={handleRegenerate}
            isRegenerating={isRegenerating}
          />

          {/* Footer */}
          <footer className="flex flex-col items-center gap-stack-sm px-container-padding-mobile py-stack-md w-full bg-surface-container-lowest border-t-4 border-secondary-container mt-stack-lg">
            <h2 className="font-headline-lg-mobile text-headline-lg-mobile text-primary italic uppercase font-black">
              DRIPCHECK
            </h2>
            <div className="flex gap-gutter">
              {['Privacy', 'Terms', 'Legal'].map((link) => (
                <a
                  key={link}
                  href="#"
                  className="font-label-xl text-label-xl text-on-surface-variant hover:text-primary transition-colors"
                >
                  {link}
                </a>
              ))}
            </div>
            <p className="font-label-xl text-label-xl text-secondary opacity-60">
              © 2024 DRIPCHECK. STAY LOUD.
            </p>
          </footer>
        </>
      )}

      {/* ════════════════ ERROR SCREEN ════════════════ */}
      {status === 'error' && (
        <>
          <ErrorState message={apiError} onRetry={handleReset} />

          <footer className="w-full mt-stack-lg border-t-4 border-secondary-container bg-surface-container-lowest flex flex-col items-center gap-stack-sm px-container-padding-mobile py-stack-md">
            <div className="font-headline-lg-mobile text-headline-lg-mobile text-primary italic font-black uppercase tracking-tighter">
              DripCheck
            </div>
            <div className="flex gap-stack-md text-on-surface-variant font-label-xl text-label-xl">
              {['Privacy', 'Terms', 'Legal'].map((link) => (
                <a key={link} href="#" className="hover:text-primary transition-colors">
                  {link}
                </a>
              ))}
            </div>
            <p className="font-label-xl text-label-xl text-secondary opacity-70 uppercase mt-2">
              © 2024 DRIPCHECK. STAY LOUD.
            </p>
          </footer>
        </>
      )}
    </div>
  );
}
