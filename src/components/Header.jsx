// Header.jsx — Exact match of the sticky top app bar across all pages

export default function Header() {
  return (
    <header className="w-full sticky top-0 bg-background border-b-4 border-primary z-50 flex justify-between items-center px-container-padding-mobile py-4">
      {/* Menu icon */}
      <div className="flex items-center gap-2">
        <span className="material-symbols-outlined text-primary cursor-pointer active:translate-x-px active:translate-y-px transition-transform select-none">
          menu
        </span>
      </div>

      {/* Logo */}
      <h1 className="font-headline-lg-mobile text-headline-lg-mobile font-black text-primary italic uppercase tracking-tighter">
        DripCheck
      </h1>

      {/* Avatar */}
      <div className="w-10 h-10 rounded-full bg-surface-container overflow-hidden border-2 border-primary active:translate-x-px active:translate-y-px transition-transform flex items-center justify-center">
        <span className="text-lg">✨</span>
      </div>
    </header>
  );
}
