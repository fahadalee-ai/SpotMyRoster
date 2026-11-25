import { Link } from "@tanstack/react-router";
import { Lock, Zap } from "lucide-react";

export function PremiumLock({ title }: { title: string }) {
  return (
    <div className="rounded-3xl bg-[#162830] p-5 text-white">
      <div className="flex items-center gap-2 text-[#00E5FF]">
        <Zap size={18} />
        <Lock size={16} />
        <p className="text-xs font-semibold uppercase tracking-wide">Premium</p>
      </div>
      <h2 className="mt-3 font-display text-2xl font-semibold leading-tight">{title}</h2>
      <p className="mt-2 text-sm leading-relaxed text-white/75">Unlock Parent & Athlete Premium</p>
      <p className="mt-1 text-sm text-white/75">$9.99 yearly</p>
      <Link to="/subscription/compare" className="mt-4 flex min-h-11 items-center justify-center rounded-2xl bg-primary px-4 text-sm font-semibold text-primary-foreground">
        Compare plans
      </Link>
    </div>
  );
}
