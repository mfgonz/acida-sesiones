import Image from "next/image";

const WEBSITE_URL = "https://www.somosacida.com";
const INSTAGRAM_URL = "https://instagram.com/somos.acida";

export function PublicFooter({ tone = "light" }: { tone?: "light" | "dark" }) {
  const dark = tone === "dark";
  return (
    <footer
      className={`flex flex-wrap items-end justify-between gap-[18px] border-t pb-12 pt-9 ${
        dark ? "border-mustard text-mustard" : "border-ink text-ink"
      }`}
    >
      <Image
        src={dark ? "/brand/logo-acida-mustard.png" : "/brand/logo-acida-ink.png"}
        alt="ÁCIDA"
        width={600}
        height={199}
        className="block h-8 w-auto"
      />
      <div className="flex flex-wrap gap-6">
        <a className="lbl underline-offset-4 hover:underline" href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer">
          @somos.acida
        </a>
        <a className="lbl underline-offset-4 hover:underline" href={WEBSITE_URL} target="_blank" rel="noopener noreferrer">
          www.somosacida.com
        </a>
      </div>
    </footer>
  );
}
