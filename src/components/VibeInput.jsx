// VibeInput.jsx — Matches the "DESCRIBE THE MOOD" section from the upload HTML

export default function VibeInput({ value, onChange, disabled }) {
  return (
    <section className="w-full mt-stack-md">
      <label
        htmlFor="vibe-input"
        className="font-label-xl text-label-xl text-primary mb-2 block tracking-widest uppercase"
      >
        Describe the Mood
      </label>

      <div className="relative">
        <input
          id="vibe-input"
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          placeholder="e.g. Cyber-Punk Picnic"
          maxLength={120}
          autoComplete="off"
          className="w-full bg-background border-4 border-tertiary rounded-full px-6 py-4 text-secondary font-body-lg text-body-lg focus:outline-none focus:border-primary transition-colors placeholder:text-surface-variant disabled:opacity-50"
        />

        {/* Sparkle icon */}
        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex gap-2 pointer-events-none">
          <span className="material-symbols-outlined text-secondary-container select-none">
            temp_preferences_custom
          </span>
        </div>
      </div>

      {/* Character count */}
      {value.length > 80 && (
        <p
          className="text-right mt-1 font-label-xl text-label-xl"
          style={{ color: value.length > 110 ? '#ffb4ab' : '#a4899d' }}
        >
          {value.length}/120
        </p>
      )}
    </section>
  );
}
