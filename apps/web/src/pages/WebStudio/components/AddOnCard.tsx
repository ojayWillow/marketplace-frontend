import type { AddOn } from '../../../constants/webPackages';

interface Props {
  addon: AddOn;
}

export default function AddOnCard({ addon }: Props) {
  return (
    <div className="flex items-start gap-4 bg-white/[0.03] rounded-xl border border-white/10 p-4 hover:border-white/20 hover:bg-white/[0.05] transition-all">
      <span className="text-2xl flex-shrink-0">{addon.icon}</span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <h3 className="font-semibold text-white text-sm">{addon.title}</h3>
          <span className="text-sm font-bold text-white/60 whitespace-nowrap">{addon.price}</span>
        </div>
        <p className="text-xs text-white/40 mt-0.5">{addon.description}</p>
      </div>
    </div>
  );
}
