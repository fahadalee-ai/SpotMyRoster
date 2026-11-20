import { Link, useCanGoBack, useRouter } from "@tanstack/react-router";
import { ArrowLeft, Eye, EyeOff, Loader2, Search, X } from "lucide-react";
import { useEffect, useId, useRef, useState, type ButtonHTMLAttributes, type InputHTMLAttributes, type ReactNode, type TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import { images } from "@/lib/images";
import { useApp } from "@/lib/store";
import { dictionary, issueText } from "@/lib/i18n";
import type { Issue } from "@/lib/validate";

export function useCopy() {
  const { lang } = useApp();
  return dictionary(lang);
}

export function useIssue() {
  const { lang } = useApp();
  return (code: Issue | string | null | undefined) => (code ? issueText(code, lang) : "");
}

export function useTitle(title: string) {
  useEffect(() => {
    document.title = title === "SpotMyRoster" ? title : `${title} · SpotMyRoster`;
  }, [title]);
}

export function Logo({ compact, plain, className }: { compact?: boolean; plain?: boolean; className?: string }) {
  const size = cn(compact ? "h-8 w-auto max-w-full object-contain object-left" : "h-12 w-auto", className);
  if (plain) {
    return (
      <span className="inline-flex min-w-0 items-center">
        <img src={images.logoOnDark} alt="SpotMyRoster" className={cn("auth-logo-dark", size)} />
        <img src={images.logoMark} alt="SpotMyRoster" className={cn("auth-logo-light", size)} />
      </span>
    );
  }
  return (
    <span className={cn("inline-flex rounded-xl bg-black", compact ? "px-2 py-1" : "px-3 py-2")}>
      <img src={images.logo} alt="SpotMyRoster" className={size} />
    </span>
  );
}

export function Btn({
  children,
  variant = "primary",
  full,
  loading,
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  full?: boolean;
  loading?: boolean;
}) {
  const styles = {
    primary: "bg-primary text-primary-foreground shadow-[inset_0_0_0_1px_var(--primary-edge)] hover:brightness-95",
    secondary: "bg-elevated text-foreground ring-1 ring-border hover:bg-muted",
    ghost: "bg-transparent text-link hover:bg-muted",
    danger: "bg-destructive text-destructive-foreground hover:brightness-110",
  }[variant];
  return (
    <button
      {...props}
      disabled={props.disabled || loading}
      className={cn(
        "inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl px-4 text-[0.9375rem] font-semibold transition active:scale-[0.98] disabled:opacity-50",
        styles,
        full && "w-full",
        className,
      )}
    >
      {loading && <Loader2 className="size-4 animate-spin" aria-hidden />}
      {children}
    </button>
  );
}

export function IconButton({
  label,
  children,
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { label: string }) {
  return (
    <button
      {...props}
      aria-label={label}
      className={cn(
        "inline-flex size-11 items-center justify-center rounded-2xl bg-elevated text-foreground ring-1 ring-border",
        className,
      )}
    >
      {children}
    </button>
  );
}

export function TopBar({
  title,
  back = true,
  fallback = "/home",
  right,
}: {
  title?: string;
  back?: boolean;
  fallback?: string;
  right?: ReactNode;
}) {
  const router = useRouter();
  const canGoBack = useCanGoBack();
  const copy = useCopy();
  return (
    <header className="sticky top-0 z-30 bg-background/95 px-5 pt-[max(0.75rem,env(safe-area-inset-top))] pb-3 backdrop-blur">
      <div className="flex items-center gap-3">
        {back && (
          <button
            type="button"
            aria-label={copy.back}
            onClick={() => (canGoBack ? router.history.back() : router.navigate({ to: fallback as never }))}
            className="inline-flex size-11 items-center justify-center rounded-2xl bg-elevated ring-1 ring-border"
          >
            <ArrowLeft size={18} />
          </button>
        )}
        {title && <h1 className="min-w-0 flex-1 truncate font-display text-[1.35rem] font-semibold">{title}</h1>}
        {!title && <div className="flex-1" />}
        {right}
      </div>
    </header>
  );
}

export function Page({
  title,
  back,
  right,
  children,
  className,
}: {
  title: string;
  back?: boolean;
  right?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  useTitle(title);
  return (
    <div className="min-h-dvh">
      <TopBar title={title} back={back} right={right} />
      <div className={cn("min-w-0 px-5 pb-28", className)}>{children}</div>
    </div>
  );
}

export function Field({
  label,
  error,
  hint,
  children,
}: {
  label: string;
  error?: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[0.8125rem] font-semibold">{label}</span>
      {children}
      {error ? (
        <span className="mt-1 block text-[0.75rem] text-destructive" role="alert">
          {error}
        </span>
      ) : hint ? (
        <span className="mt-1 block text-[0.75rem] text-muted-foreground">{hint}</span>
      ) : null}
    </label>
  );
}

const control =
  "min-h-12 w-full rounded-2xl bg-elevated px-3 text-base text-foreground ring-1 ring-border outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-link";

export function TextField({
  label,
  error,
  hint,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { label: string; error?: string; hint?: string }) {
  const id = useId();
  return (
    <Field label={label} error={error} hint={hint}>
      <input id={id} {...props} className={cn(control, props.className)} />
    </Field>
  );
}

export function TextArea({
  label,
  error,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string; error?: string }) {
  return (
    <Field label={label} error={error}>
      <textarea {...props} className={cn(control, "min-h-28 py-3", props.className)} />
    </Field>
  );
}

export function PasswordField({
  label,
  error,
  ...props
}: Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & { label: string; error?: string }) {
  const [show, setShow] = useState(false);
  return (
    <Field label={label} error={error}>
      <span className="relative block">
        <input {...props} type={show ? "text" : "password"} className={cn(control, "pr-12")} />
        <button
          type="button"
          aria-label={show ? "Hide password" : "Show password"}
          onClick={() => setShow((value) => !value)}
          className="absolute right-1 top-1/2 inline-flex size-11 -translate-y-1/2 items-center justify-center text-muted-foreground"
        >
          {show ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </span>
    </Field>
  );
}

export function SearchField({
  value,
  onChange,
  placeholder,
  label = "Search",
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  label?: string;
}) {
  return (
    <label className="relative block">
      <span className="sr-only">{label}</span>
      <Search size={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className={cn(control, "pl-10 pr-12")}
      />
      {value && (
        <button
          type="button"
          aria-label="Clear search"
          onClick={() => onChange("")}
          className="absolute right-1 top-1/2 inline-flex size-11 -translate-y-1/2 items-center justify-center"
        >
          <X size={16} />
        </button>
      )}
    </label>
  );
}

export function SelectField({
  label,
  value,
  onChange,
  options,
  placeholder = "Select",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
}) {
  return (
    <Field label={label}>
      <select value={value} onChange={(event) => onChange(event.target.value)} className={control}>
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </Field>
  );
}

export function Chip({
  selected,
  children,
  onClick,
}: {
  selected?: boolean;
  children: ReactNode;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        "inline-flex min-h-11 shrink-0 items-center whitespace-nowrap rounded-full px-3.5 text-sm font-semibold ring-1",
        selected ? "bg-primary text-primary-foreground ring-transparent" : "bg-elevated text-foreground ring-border",
      )}
    >
      {children}
    </button>
  );
}

export function ChipRow({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const lastSelected = useRef("");

  useEffect(() => {
    const root = ref.current;
    const selected = root?.querySelector<HTMLElement>("[aria-pressed='true']");
    if (!root || !selected) return;
    const key = selected.textContent ?? "";
    if (key === lastSelected.current) return;
    lastSelected.current = key;
    const start = selected.offsetLeft;
    const end = start + selected.offsetWidth;
    if (start < root.scrollLeft) root.scrollLeft = Math.max(0, start - 8);
    else if (end > root.scrollLeft + root.clientWidth) root.scrollLeft = end - root.clientWidth + 8;
  });

  return (
    <div
      ref={ref}
      className={cn(
        "flex w-full min-w-0 max-w-full gap-2 overflow-x-auto overscroll-x-contain pb-1 no-scrollbar",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function Badge({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span className={cn("inline-flex shrink-0 items-center whitespace-nowrap rounded-full px-2.5 py-1 text-[0.75rem] font-semibold", className)}>
      {children}
    </span>
  );
}

export function Avatar({ name, src, size = 40 }: { name: string; src?: string; size?: number }) {
  const letters = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
  return (
    <span
      className="inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-elevated font-semibold ring-1 ring-border"
      style={{ width: size, height: size, fontSize: size < 36 ? 12 : 14 }}
    >
      {src ? <img src={src} alt="" className="h-full w-full object-cover" /> : letters || "?"}
    </span>
  );
}

export function SectionHeader({ title, action, to }: { title: string; action?: string; to?: string }) {
  return (
    <div className="mb-3 flex items-end justify-between gap-3">
      <h2 className="font-display text-lg font-semibold">{title}</h2>
      {action && to && (
        <Link to={to as never} className="text-sm font-semibold text-link">
          {action}
        </Link>
      )}
    </div>
  );
}

export function EmptyState({
  title,
  body,
  action,
  onAction,
  to,
}: {
  title: string;
  body: string;
  action?: string;
  onAction?: () => void;
  to?: string;
}) {
  return (
    <div className="rounded-3xl bg-card px-5 py-8 text-center ring-1 ring-border">
      <img src={images.empty} alt="" className="mx-auto mb-4 size-28 rounded-2xl object-cover" />
      <h2 className="font-display text-xl font-semibold">{title}</h2>
      <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-muted-foreground">{body}</p>
      {action && onAction && (
        <Btn className="mt-5" onClick={onAction}>
          {action}
        </Btn>
      )}
      {action && to && (
        <Link to={to as never} className="mt-5 inline-flex min-h-11 items-center justify-center rounded-2xl bg-primary px-4 font-semibold text-primary-foreground">
          {action}
        </Link>
      )}
    </div>
  );
}

export function ErrorState({ title, body, onRetry }: { title: string; body: string; onRetry: () => void }) {
  return (
    <div className="rounded-3xl bg-card px-5 py-8 text-center ring-1 ring-border" role="alert">
      <h2 className="font-display text-xl font-semibold">{title}</h2>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
      <Btn className="mt-5" onClick={onRetry}>
        Try again
      </Btn>
    </div>
  );
}

export function Bone({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-2xl bg-muted", className)} />;
}

export function CardSkeleton() {
  return (
    <div className="space-y-3">
      <Bone className="h-36 w-full" />
      <Bone className="h-24 w-full" />
      <Bone className="h-24 w-full" />
    </div>
  );
}

export function ProgressBar({ value, label }: { value: number; label?: string }) {
  const safe = Math.max(0, Math.min(100, value));
  return (
    <div>
      {label && (
        <div className="mb-1.5 flex justify-between text-xs font-medium text-muted-foreground">
          <span>{label}</span>
          <span>{safe}%</span>
        </div>
      )}
      <div
        className="h-2 overflow-hidden rounded-full bg-muted"
        role="progressbar"
        aria-valuenow={safe}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label ?? "Progress"}
      >
        <div className="h-full rounded-full bg-primary" style={{ width: `${safe}%` }} />
      </div>
    </div>
  );
}

export function BottomSheet({
  open,
  title,
  onClose,
  children,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50">
      <button type="button" aria-label="Close sheet" className="absolute inset-0 bg-black/55" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="phone-fixed bottom-0 z-10 max-h-[88dvh] overflow-y-auto rounded-t-[28px] bg-card px-5 pt-3 pb-[max(1.25rem,env(safe-area-inset-bottom))]"
      >
        <div className="mx-auto mb-3 h-1.5 w-10 rounded-full bg-muted-foreground/40" />
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="font-display text-lg font-semibold">{title}</h2>
          <IconButton label="Close" onClick={onClose}>
            <X size={18} />
          </IconButton>
        </div>
        {children}
      </div>
    </div>
  );
}

export function useListState() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const load = () => {
    setError(typeof navigator !== "undefined" ? !navigator.onLine : false);
    setLoading(true);
    window.setTimeout(() => setLoading(false), 550);
  };
  useEffect(() => {
    const timer = window.setTimeout(() => {
      setError(!navigator.onLine);
      setLoading(false);
    }, 420);
    return () => window.clearTimeout(timer);
  }, []);
  return { loading, error, refresh: load };
}

export function PullToRefresh({ onRefresh, children }: { onRefresh: () => void; children: ReactNode }) {
  const [pull, setPull] = useState(0);
  const [start, setStart] = useState(0);
  return (
    <div
      onTouchStart={(event) => {
        if (window.scrollY <= 0) setStart(event.touches[0]?.clientY ?? 0);
      }}
      onTouchMove={(event) => {
        if (window.scrollY > 0 || start === 0) return;
        const next = (event.touches[0]?.clientY ?? 0) - start;
        setPull(Math.max(0, Math.min(72, next)));
      }}
      onTouchEnd={() => {
        if (pull > 56) onRefresh();
        setPull(0);
        setStart(0);
      }}
    >
      {pull > 12 && <p className="pb-2 text-center text-xs text-muted-foreground">Release to refresh</p>}
      {children}
    </div>
  );
}

export function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-elevated px-3 py-3 ring-1 ring-border">
      <p className="text-[0.75rem] text-muted-foreground">{label}</p>
      <p className="mt-1 font-display text-lg font-semibold">{value}</p>
    </div>
  );
}

export function RowLink({
  to,
  title,
  detail,
}: {
  to: string;
  title: string;
  detail?: string;
}) {
  return (
    <Link
      to={to as never}
      className="flex min-h-14 items-center justify-between gap-3 border-b border-border py-3 last:border-0"
    >
      <span>
        <span className="block font-semibold">{title}</span>
        {detail && <span className="block text-sm text-muted-foreground">{detail}</span>}
      </span>
      <span aria-hidden className="text-muted-foreground">
        ›
      </span>
    </Link>
  );
}
