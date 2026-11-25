/** Page title block shared by every admin view: mono kicker, big title, optional actions. */
export function AdminPageHeader({
  n,
  title,
  children,
}: {
  n: string;
  title: string;
  children?: React.ReactNode;
}) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-[18px] border-b border-ink pb-[18px]">
      <div className="flex flex-col gap-3">
        <span className="lbl">[ Panel ] · {n}</span>
        <h1 className="font-display text-[44px] font-normal leading-[48px] tracking-[-0.01em] sm:text-[56px] sm:leading-[60px]">
          {title}
        </h1>
      </div>
      {children}
    </header>
  );
}
