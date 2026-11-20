import { Link, useNavigate } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { images } from "@/lib/images";
import { SAMPLE_OTP, SAMPLE_PASSWORD } from "@/lib/mock-data";
import { useApp } from "@/lib/store";
import { Btn, PasswordField, TextField, useCopy, useTitle } from "@/components/athlete/ui";

const slides = [
  {
    image: images.discover,
    title: "Find travel teams near you",
    body: "Browse open roster spots by sport, age group, and how far a family is willing to travel.",
  },
  {
    image: images.skills,
    title: "Show what you can do",
    body: "Build a profile with positions, measurables, and highlight clips coaches can actually review.",
  },
  {
    image: images.apply,
    title: "Apply and follow every step",
    body: "Send a note to a coach, then track the application from submitted through a tryout invitation.",
  },
  {
    image: images.learn,
    title: "Learn between tournaments",
    body: "Short courses for hitting, defense, spacing, serve receive, and goalkeeping.",
  },
];

export function SplashScreen() {
  const { ready, account } = useApp();
  const navigate = useNavigate();
  useTitle("SpotMyRoster");

  useEffect(() => {
    if (!ready) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const timer = window.setTimeout(() => {
      if (account) navigate({ to: "/home", replace: true });
      else navigate({ to: "/onboarding", replace: true });
    }, reduce ? 250 : 1300);
    return () => window.clearTimeout(timer);
  }, [ready, account, navigate]);

  return (
    <div className="splash-screen relative flex min-h-dvh flex-col items-center justify-center px-8 pb-[max(2rem,env(safe-area-inset-bottom))] pt-[max(2rem,env(safe-area-inset-top))]">
      <div className="splash-in flex w-full max-w-[18rem] flex-col items-center text-center">
        <img src={images.logoOnDark} alt="SpotMyRoster" className="h-auto w-full" />
        <p className="mt-8 text-sm font-medium tracking-wide text-[#d7e4ea]">Find a team. Get seen. Fill the roster.</p>
        <div className="mt-8 h-1 w-28 overflow-hidden rounded-full bg-white/15" aria-hidden>
          <div className="splash-bar h-full w-1/3 rounded-full bg-brand" />
        </div>
      </div>
    </div>
  );
}

export function OnboardingScreen() {
  const [index, setIndex] = useState(0);
  const { markOnboarded } = useApp();
  const navigate = useNavigate();
  const copy = useCopy();
  const slide = slides[index] ?? slides[0];
  useTitle("Welcome");

  const finish = () => {
    markOnboarded();
    navigate({ to: "/login", replace: true });
  };

  return (
    <div className="relative min-h-dvh bg-[#162830] text-[#f4f8f8]">
      <img src={slide.image} alt="" className="absolute inset-0 h-full w-full object-cover" />
      <div className="onboard-scrim absolute inset-0" />
      <div className="relative flex min-h-dvh flex-col px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-[max(1rem,env(safe-area-inset-top))]">
        <div className="flex items-center justify-between">
          <img src={images.logoOnDark} alt="SpotMyRoster" className="h-8 w-auto" />
          <button type="button" onClick={finish} className="min-h-11 px-1 text-sm font-semibold text-[#d7e4ea]">
            {copy.skip}
          </button>
        </div>
        <div className="mt-auto">
          <div className="mb-4 flex gap-2" aria-hidden>
            {slides.map((item, dot) => (
              <span key={item.title} className={`h-1 flex-1 rounded-full ${dot === index ? "bg-brand" : "bg-white/30"}`} />
            ))}
          </div>
          <p className="text-xs font-semibold tracking-wide text-[#d7e4ea]">
            {index + 1} of {slides.length}
          </p>
          <h1 className="mt-2 max-w-[18rem] font-display text-[2rem] font-semibold leading-[1.15]">{slide.title}</h1>
          <p className="mt-3 max-w-sm text-base leading-relaxed text-[#d7e4ea]">{slide.body}</p>
          <div className="mt-6 flex items-center gap-3">
            {index > 0 && (
              <button type="button" onClick={() => setIndex((value) => value - 1)} className="min-h-11 px-2 text-sm font-semibold text-[#d7e4ea]">
                Back
              </button>
            )}
            <Btn
              full
              onClick={() => {
                if (index === slides.length - 1) finish();
                else setIndex((value) => value + 1);
              }}
            >
              {index === slides.length - 1 ? copy.getStarted : copy.next}
            </Btn>
          </div>
        </div>
      </div>
    </div>
  );
}

export function LoginScreen() {
  const { login, markOnboarded, ready } = useApp();
  const navigate = useNavigate();
  const copy = useCopy();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  useTitle(copy.signIn);

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    window.setTimeout(() => {
      login(email, password);
      setLoading(false);
      markOnboarded();
      navigate({ to: "/home" });
    }, 400);
  };

  return (
    <AuthFrame
      eyebrow="Athlete and parent"
      title="Welcome back"
      subtitle="Coaches sign in through the separate Coach app."
      footer={
        <p className="text-center text-sm text-[#d7e4ea]">
          New here?{" "}
          <Link to="/register" className="auth-link font-semibold">Create an account</Link>
        </p>
      }
    >
      <form className="space-y-4" onSubmit={submit} noValidate>
        <TextField label="Email" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} />
        <PasswordField label="Password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} />
        <div className="-mt-1 text-right">
          <Link to="/forgot-password" className="auth-link text-sm font-semibold">Forgot password</Link>
        </div>
        <Btn type="submit" full loading={loading} disabled={!ready}>{copy.signIn}</Btn>
      </form>
      <div className="mt-6 rounded-3xl bg-white/5 p-4 ring-1 ring-white/10">
        <p className="text-sm font-semibold">Try a sample account</p>
        <p className="auth-muted mt-1 text-xs">Password {SAMPLE_PASSWORD}. These profiles are sample data only.</p>
        <div className="mt-3 grid gap-2">
          <button type="button" className="min-h-11 rounded-2xl bg-[#1c3340] px-3 text-left text-sm ring-1 ring-white/10" onClick={() => { setEmail("jordan@sample.spotmyroster.com"); setPassword(SAMPLE_PASSWORD); }}>
            Jordan Hale · Athlete
          </button>
          <button type="button" className="min-h-11 rounded-2xl bg-[#1c3340] px-3 text-left text-sm ring-1 ring-white/10" onClick={() => { setEmail("morgan@sample.spotmyroster.com"); setPassword(SAMPLE_PASSWORD); }}>
            Morgan Hale · Parent
          </button>
        </div>
      </div>
    </AuthFrame>
  );
}

export function RegisterScreen() {
  const { register } = useApp();
  const navigate = useNavigate();
  const [role, setRole] = useState<"athlete" | "parent" | "">("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [terms, setTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  useTitle("Create account");

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    window.setTimeout(() => {
      register({ role: role || "athlete", firstName, lastName, email, phone, password });
      setLoading(false);
      navigate({ to: "/home" });
    }, 400);
  };

  return (
    <AuthFrame
      backTo="/login"
      eyebrow="Create account"
      title="Join SpotMyRoster"
      subtitle="Athlete is one player. Parent is for managing one or more athletes."
      footer={
        <p className="text-center text-sm text-[#d7e4ea]">
          Already registered? <Link to="/login" className="auth-link font-semibold">Sign in</Link>
        </p>
      }
    >
      <form className="space-y-4" onSubmit={submit} noValidate>
        <fieldset>
          <legend className="mb-2 text-[0.8125rem] font-semibold">I am a</legend>
          <div className="grid grid-cols-2 gap-2">
            {(["athlete", "parent"] as const).map((option) => (
              <button
                key={option}
                type="button"
                aria-pressed={role === option}
                onClick={() => setRole(option)}
                className={`min-h-12 rounded-2xl px-3 text-sm font-semibold ring-1 ${role === option ? "bg-primary text-primary-foreground ring-transparent" : "bg-[#1c3340] text-[#f4f8f8] ring-white/10"}`}
              >
                {option === "athlete" ? "Athlete" : "Parent"}
              </button>
            ))}
          </div>
        </fieldset>
        <div className="grid grid-cols-2 gap-3">
          <TextField label="First name" value={firstName} onChange={(event) => setFirstName(event.target.value)} />
          <TextField label="Last name" value={lastName} onChange={(event) => setLastName(event.target.value)} />
        </div>
        <TextField label="Email" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} />
        <TextField label="Phone" type="tel" autoComplete="tel" value={phone} onChange={(event) => setPhone(event.target.value)} />
        <PasswordField label="Password" autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} />
        <PasswordField label="Confirm password" autoComplete="new-password" value={confirm} onChange={(event) => setConfirm(event.target.value)} />
        <label className="flex min-h-11 items-start gap-3 text-sm leading-relaxed">
          <input type="checkbox" className="mt-1 size-5 accent-[var(--brand-dark)]" checked={terms} onChange={(event) => setTerms(event.target.checked)} />
          <span>
            I have read the{" "}
            <Link to="/legal/$doc" params={{ doc: "terms" }} className="auth-link font-semibold underline">Terms</Link>
            {" "}and{" "}
            <Link to="/legal/$doc" params={{ doc: "privacy" }} className="auth-link font-semibold underline">Privacy</Link>
            {" "}notices. Official legal copy has not been published in this sample.
          </span>
        </label>
        <Btn type="submit" full loading={loading}>Create account</Btn>
      </form>
    </AuthFrame>
  );
}

export function ForgotScreen() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  useTitle("Forgot password");

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    navigate({ to: "/verify", search: { purpose: "reset", email: email.trim() } });
  };

  return (
    <AuthFrame backTo="/login" title="Reset your password" subtitle="Next you’ll enter the sample code. No email is sent.">
      <form className="space-y-4" onSubmit={submit} noValidate>
        <TextField label="Email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
        <Btn type="submit" full>Send code</Btn>
      </form>
    </AuthFrame>
  );
}

export function VerifyScreen({ purpose, email }: { purpose: "email" | "reset"; email: string }) {
  const { verifyEmail } = useApp();
  const navigate = useNavigate();
  const [code, setCode] = useState("");
  useTitle("Verification");

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (purpose === "email") {
      verifyEmail();
      navigate({ to: "/auth-success", replace: true });
      return;
    }
    sessionStorage.setItem("smr-reset-email", email);
    navigate({ to: "/reset-password", replace: true });
  };

  return (
    <AuthFrame
      backTo={purpose === "email" ? "/register" : "/forgot-password"}
      title={purpose === "email" ? "Confirm your email" : "Enter the code"}
      subtitle={email ? `For ${email}. Nothing is sent from this sample.` : "Nothing is sent from this sample."}
    >
      <form className="space-y-4" onSubmit={submit} noValidate>
        <p className="rounded-2xl bg-white/5 px-4 py-3 text-sm ring-1 ring-white/10">
          Sample code <span className="font-semibold tracking-wide">{SAMPLE_OTP}</span>
        </p>
        <TextField
          label="Verification code"
          inputMode="numeric"
          autoComplete="one-time-code"
          value={code}
          onChange={(event) => setCode(event.target.value)}
        />
        <Btn type="submit" full>Verify</Btn>
        <button type="button" className="auth-link min-h-11 text-sm font-semibold" onClick={() => toast("Sample code is still 482913")}>
          Resend sample code
        </button>
      </form>
    </AuthFrame>
  );
}

export function ResetScreen() {
  const { resetPassword } = useApp();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  useTitle("New password");

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const email = sessionStorage.getItem("smr-reset-email") ?? "";
    resetPassword(email, password);
    navigate({ to: "/password-updated", replace: true });
  };

  return (
    <AuthFrame backTo="/forgot-password" title="Choose a new password" subtitle="This change is stored only on this device.">
      <form className="space-y-4" onSubmit={submit} noValidate>
        <PasswordField label="New password" value={password} onChange={(event) => setPassword(event.target.value)} />
        <PasswordField label="Confirm password" value={confirm} onChange={(event) => setConfirm(event.target.value)} />
        <Btn type="submit" full>Update password</Btn>
      </form>
    </AuthFrame>
  );
}

export function PasswordUpdatedScreen() {
  const navigate = useNavigate();
  useTitle("Password updated");
  return (
    <AuthFrame title="Password updated" subtitle="Sign in with the new password. This change stays on this device.">
      <StatusMark />
      <Btn full onClick={() => navigate({ to: "/login", replace: true })}>Back to sign in</Btn>
    </AuthFrame>
  );
}

export function AuthSuccessScreen() {
  const navigate = useNavigate();
  useTitle("Account ready");
  return (
    <AuthFrame title="You’re in" subtitle="Finish the athlete profile next. You can save and come back before it is complete.">
      <StatusMark />
      <Btn full onClick={() => navigate({ to: "/setup", replace: true })}>Set up the athlete profile</Btn>
    </AuthFrame>
  );
}

function StatusMark() {
  return (
    <div className="mb-5 grid size-12 place-items-center rounded-2xl bg-brand text-brand-dark" aria-hidden>
      <Check size={22} strokeWidth={2.5} />
    </div>
  );
}

function AuthFrame({
  title,
  subtitle,
  eyebrow,
  backTo,
  footer,
  children,
}: {
  title: string;
  subtitle: string;
  eyebrow?: string;
  backTo?: "/login" | "/register" | "/forgot-password";
  footer?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="auth-screen">
      <div className="mx-auto flex min-h-dvh w-full max-w-[26.5rem] flex-col px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-[max(0.75rem,env(safe-area-inset-top))]">
        <div className="flex h-11 items-center">
          {backTo ? (
            <Link to={backTo} className="inline-flex min-h-11 items-center text-sm font-semibold text-[#d7e4ea]">
              Back
            </Link>
          ) : null}
        </div>
        <img src={images.logoOnDark} alt="SpotMyRoster" className="mt-2 h-9 w-auto self-start" />
        {eyebrow && <p className="mt-8 text-xs font-semibold tracking-[0.14em] text-[#00e5ff] uppercase">{eyebrow}</p>}
        <h1 className={`${eyebrow ? "mt-2" : "mt-8"} font-display text-[1.85rem] font-semibold leading-[1.15]`}>{title}</h1>
        <p className="auth-muted mt-2 text-sm leading-relaxed">{subtitle}</p>
        <div className="mt-6">{children}</div>
        {footer && <div className="mt-auto pt-8">{footer}</div>}
      </div>
    </div>
  );
}
