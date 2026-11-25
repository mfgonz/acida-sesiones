import Image from "next/image";

/** Split layout for login / password screens: olive brand panel + form column. */
export function AuthShell({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col font-body text-ink md:flex-row">
      <aside className="flex flex-col justify-between gap-9 bg-olive px-6 py-9 text-mustard md:w-[44%] md:px-12 md:py-12">
        <Image src="/brand/logo-acida-mustard.png" alt="ÁCIDA" width={600} height={199} priority className="block h-11 w-auto self-start" />
        <div className="hidden bg-cream p-6 md:block">
          <Image
            src="/brand/ilustracion-abanico.png"
            alt=""
            width={1400}
            height={788}
            className="block h-auto w-full"
          />
        </div>
        <div className="flex flex-col gap-2 border-t border-mustard pt-[18px]">
          <span className="lbl">[ Panel de sesiones ]</span>
          <span className="lbl">Oficio creativo del bien</span>
        </div>
      </aside>
      <main className="flex flex-1 items-center justify-center px-4 py-12 sm:px-12">
        <div className="flex w-full max-w-md flex-col gap-6">
          <div className="flex flex-col gap-3 border-b border-ink pb-[18px]">
            <span className="lbl">[ Acceso ]</span>
            <h1 className="font-display text-[44px] font-normal leading-[48px] tracking-[-0.01em]">{title}</h1>
            {subtitle && <p className="text-lg leading-[25px]">{subtitle}</p>}
          </div>
          {children}
        </div>
      </main>
    </div>
  );
}
