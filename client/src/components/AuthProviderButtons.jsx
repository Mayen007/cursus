const PROVIDERS = ["Google", "GitHub"];

export default function AuthProviderButtons({ onUnavailable }) {
  return (
    <div className="space-y-2">
      {PROVIDERS.map((provider) => (
        <button
          className="flex w-full items-center justify-center gap-2 border border-slate/60 px-4 py-2.5 text-xs text-ink hover:bg-ink/5"
          key={provider}
          onClick={() => onUnavailable(provider)}
          type="button"
        >
          {provider === "Google" ? (
            <span aria-hidden="true" className="font-sans text-sm font-semibold text-[#4285f4]">
              G
            </span>
          ) : (
            <span aria-hidden="true" className="font-mono text-xs">
              GH
            </span>
          )}
          Continue with {provider}
        </button>
      ))}
    </div>
  );
}
