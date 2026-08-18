import { Globe, Instagram } from "lucide-react";

// TODO: fill in once the main ACIDA site URL is decided.
const WEBSITE_URL = "";
const INSTAGRAM_URL = "https://instagram.com/somos.acida";

export function PublicFooter() {
  return (
    <footer className="flex items-center justify-center gap-4 px-4 pb-10 pt-4">
      {WEBSITE_URL ? (
        <a
          href={WEBSITE_URL}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Website"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-base-700 text-neutral-400 transition hover:border-accent hover:text-accent"
        >
          <Globe size={16} />
        </a>
      ) : (
        <span
          aria-hidden="true"
          title="Website link coming soon"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-base-800 text-neutral-700"
        >
          <Globe size={16} />
        </span>
      )}
      <a
        href={INSTAGRAM_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Instagram @somos.acida"
        className="flex h-9 w-9 items-center justify-center rounded-full border border-base-700 text-neutral-400 transition hover:border-accent hover:text-accent"
      >
        <Instagram size={16} />
      </a>
    </footer>
  );
}
