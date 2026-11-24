export default function PageHeader({ title, subtitle, action }) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-[34px] font-bold text-[#0b1f5c] capitalize">{title}</h1>
        {subtitle && <p className="mt-1 text-[17px] font-light text-[#0b1f5c]">{subtitle}</p>}
      </div>
      {action && <div className="flex shrink-0 gap-2">{action}</div>}
    </div>
  );
}
