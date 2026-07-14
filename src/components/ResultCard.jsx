// ResultCard.jsx — Exact match of the recommendation page HTML design

// Determine grid layout based on role
function getGridClass(role, index, total) {
  // Outerwear or first item always gets the large card
  if (role === 'outerwear' || index === 0) return 'col-span-2';
  // Accessories get special strip treatment (handled separately)
  return 'col-span-1';
}

const ROLE_ICONS = {
  top: 'checkroom',
  bottom: 'checkroom',
  shoes: 'sprint',
  outerwear: 'dry_cleaning',
  accessory: 'watch',
};

export default function ResultCard({ result, images, vibe, onRegenerate, isRegenerating }) {
  const {
    chosen_items = [],
    explanation = '',
    vibe_match_score = 0,
    missing_pieces = '',
  } = result;

  // Separate accessories from main items for different rendering
  const mainItems = chosen_items.filter((item) => item.role !== 'accessory');
  const accessories = chosen_items.filter((item) => item.role === 'accessory');

  const matchPercent = Math.round(vibe_match_score * 10);

  return (
    <>
      {/* ── Main Content ── */}
      <main className="flex-grow px-container-padding-mobile py-stack-md animate-slide-up">

        {/* ── Expressive Heading ── */}
        <section className="mb-stack-lg">
          <div className="relative">
            <span className="font-label-xl text-label-xl text-secondary-container uppercase tracking-[0.2em] mb-2 block">
              Your Result
            </span>
            <h2 className="font-display-lg text-[64px] leading-[0.9] text-primary italic uppercase break-words text-glow">
              {vibe.split(' ').length > 1 ? (
                <>
                  {vibe.split(' ').slice(0, Math.ceil(vibe.split(' ').length / 2)).join(' ')}
                  <br />
                  <span className="text-secondary-container">
                    {vibe.split(' ').slice(Math.ceil(vibe.split(' ').length / 2)).join(' ')}
                  </span>
                </>
              ) : (
                vibe
              )}
            </h2>

            {/* Match badge */}
            <div className="absolute -right-2 -top-4 rotate-12 bg-secondary-container text-on-secondary-container px-3 py-1 font-label-xl text-label-xl sticker-border-sm">
              MATCH: {matchPercent}%
            </div>
          </div>
        </section>

        {/* ── Bento Grid ── */}
        <section className="grid grid-cols-2 gap-gutter mb-stack-lg">
          {mainItems.map(({ image_index, role }, i) => {
            const img = images[image_index];
            if (!img) return null;

            const isLarge = role === 'outerwear' || i === 0;

            return (
              <div
                key={i}
                className={`${isLarge ? 'col-span-2' : 'col-span-1'} relative bg-tertiary-container rounded-lg p-2 sticker-border overflow-hidden ${isLarge ? 'aspect-[4/5]' : 'aspect-square'} animate-pop-in`}
                style={{ animationDelay: `${i * 0.1}s`, opacity: 0 }}
              >
                <img
                  src={img.dataUrl}
                  alt={`${role} — item ${image_index + 1}`}
                  className="w-full h-full object-cover rounded-md"
                />

                {/* Label overlay */}
                <div className="absolute bottom-4 left-4 right-4 bg-background/80 backdrop-blur-md p-3 rounded-DEFAULT border-2 border-primary">
                  <p className="font-label-xl text-label-xl text-primary font-bold uppercase">
                    {role.charAt(0).toUpperCase() + role.slice(1)}
                  </p>
                  <p className="font-body-md text-body-md text-on-surface">
                    Item #{image_index + 1}
                  </p>
                </div>

                {/* Favorite button on non-large cards */}
                {!isLarge && (
                  <div className="absolute top-2 right-2 bg-secondary-container text-on-secondary-container rounded-full p-1">
                    <span className="material-symbols-outlined text-[18px] select-none">favorite</span>
                  </div>
                )}
              </div>
            );
          })}

          {/* ── Accessory strips ── */}
          {accessories.map(({ image_index, role }, i) => {
            const img = images[image_index];
            return (
              <div
                key={`acc-${i}`}
                className="col-span-2 flex items-center bg-secondary-container rounded-lg p-4 sticker-border gap-4 animate-pop-in"
                style={{ animationDelay: `${(mainItems.length + i) * 0.1}s`, opacity: 0 }}
              >
                {img ? (
                  <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-background flex-shrink-0">
                    <img
                      src={img.dataUrl}
                      alt={`Accessory ${i + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-16 h-16 bg-surface rounded-full flex items-center justify-center border-2 border-background flex-shrink-0">
                    <span className="material-symbols-outlined text-primary text-3xl select-none">
                      {ROLE_ICONS[role] || 'watch'}
                    </span>
                  </div>
                )}
                <div>
                  <h4 className="font-label-xl text-label-xl text-on-secondary-container font-black italic uppercase">
                    Accessory #{image_index + 1}
                  </h4>
                  <p className="font-body-md text-body-md text-on-secondary-container/80">
                    The Final Touch
                  </p>
                </div>
                <span className="material-symbols-outlined ml-auto text-on-secondary-container select-none">
                  arrow_forward_ios
                </span>
              </div>
            );
          })}
        </section>

        {/* ── Stylist's Note ── */}
        <section className="mb-stack-lg">
          <div className="bg-tertiary text-on-tertiary-container p-6 rounded-lg hard-shadow border-4 border-background relative overflow-hidden">
            {/* Decorative circle */}
            <div className="absolute -right-6 -top-6 w-20 h-20 bg-primary opacity-20 rounded-full" />

            <div className="flex items-center gap-2 mb-4">
              <span
                className="material-symbols-outlined select-none"
                style={{ fontVariationSettings: '"FILL" 1' }}
              >
                auto_awesome
              </span>
              <h3 className="font-headline-lg-mobile text-headline-lg-mobile text-on-tertiary-fixed-variant italic uppercase">
                Stylist's Note
              </h3>
            </div>

            <div className="font-body-lg text-body-lg leading-relaxed mb-4 italic font-bold">
              "{explanation}"
            </div>

            {/* Tags */}
            <div className="flex gap-2 flex-wrap">
              {['#DRIP', '#AI-CURATED', '#VIBECHECK'].map((tag) => (
                <span
                  key={tag}
                  className="bg-on-tertiary-container text-tertiary px-2 py-0.5 rounded font-label-xl text-label-xl uppercase"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* ── Missing Pieces ── */}
        {missing_pieces && (
          <section className="mb-stack-lg">
            <div className="bg-surface-container-high p-stack-md rounded-lg border-2 border-outline-variant relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-tertiary-container" />
              <p className="font-label-xl text-label-xl text-tertiary mb-2 uppercase font-bold tracking-widest">
                💡 Level Up Your Look
              </p>
              <p className="font-body-md text-body-md text-on-surface">{missing_pieces}</p>
            </div>
          </section>
        )}

        {/* Spacer for fixed button */}
        <div className="h-32" />
      </main>

      {/* ── Fixed Regenerate Button ── */}
      <div className="fixed bottom-10 left-0 right-0 z-40 flex justify-center pointer-events-none">
        <div className="w-full max-w-[430px] px-container-padding-mobile pointer-events-auto">
          <button
            id="regenerate-btn"
            onClick={onRegenerate}
            disabled={isRegenerating}
            className="w-full bg-primary-container text-on-primary-container font-headline-lg-mobile text-headline-lg-mobile italic uppercase py-6 rounded-full hard-shadow active-press flex items-center justify-center gap-4 border-4 border-background disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {isRegenerating ? (
              <>
                <span
                  className="inline-block w-7 h-7 border-4 border-on-primary-container/30 border-t-on-primary-container rounded-full"
                  style={{ animation: 'spin 0.7s linear infinite' }}
                />
                Regenerating...
              </>
            ) : (
              <>
                <span>Regenerate Vibe</span>
                <span className="material-symbols-outlined text-4xl select-none">refresh</span>
              </>
            )}
          </button>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </>
  );
}
