import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { images } from "@/lib/images";
import { SAMPLE_OTP, SAMPLE_PASSWORD } from "@/lib/mock-data";
import { useApp } from "@/lib/store";
import { emailIssue, passwordIssue, phoneIssue, requiredIssue } from "@/lib/validate";
import { Btn, Logo, PasswordField, TextField, useCopy, useIssue, useTitle } from "@/components/athlete/ui";

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
  const { ready, account, athlete } = useApp();
  const navigate = useNavigate();
  useTitle("SpotMyRoster");

  useEffect(() => {
    if (!ready) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const timer = window.setTimeout(() => {
      if (account && !account.emailVerified) navigate({ to: "/verify", search: { purpose: "email", email: account.email }, replace: true });
      else if (account && athlete?.setupComplete) navigate({ to: "/home", replace: true });
      else if (account) navigate({ to: "/setup", replace: true });
      else navigate({ to: "/onboarding", replace: true });
    }, reduce ? 250 : 1300);
    return () => window.clearTimeout(timer);
  }, [ready, account, athlete, navigate]);

  return (
    <div className="splash-screen relative flex min-h-dvh flex-col items-center justify-center px-8 pb-[max(2rem,env(safe-area-inset-bottom))] pt-[max(2rem,env(safe-area-inset-top))]">
      <div className="splash-in flex w-full max-w-[20rem] flex-col items-center text-center">
        <img src={images.logoMark} alt="SpotMyRoster" className="h-auto w-full" />
        <p className="mt-8 text-sm font-medium tracking-wide text-brand-dark">Find a team. Get seen. Fill the roster.</p>
        <div className="mt-8 h-1 w-28 overflow-hidden rounded-full bg-brand-dark/10" aria-hidden>
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
    <div className="relative min-h-dvh bg-brand-dark text-white">
      <img src={slide.image} alt="" className="absolute inset-0 h-full w-full object-cover" />
      <div className="onboard-scrim absolute inset-0" />
      <div className="relative flex min-h-dvh flex-col justify-end px-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-8">
        <div className="mb-4 flex gap-2" aria-hidden>
          {slides.map((item, dot) => (
            <span key={item.title} className={`h-1.5 flex-1 rounded-full ${dot === index ? "bg-brand" : "bg-white/35"}`} />
          ))}
        </div>
        <p className="text-sm font-semibold text-brand">
          {index + 1} / {slides.length}
        </p>
        <h1 className="mt-2 font-display text-[2rem] font-semibold leading-tight">{slide.title}</h1>
        <p className="mt-3 max-w-sm text-base leading-relaxed text-white/85">{slide.body}</p>
        <div className="mt-6 flex items-center gap-3">
          <button type="button" onClick={finish} className="min-h-11 px-2 text-sm font-semibold text-white/80">
            {copy.skip}
          </button>
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
  );
}

export function LoginScreen() {
  const { login, markOnboarded, ready } = useApp();
  const navigate = useNavigate();
  const issue = useIssue();
  const copy = useCopy();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string; form?: string }>({});
  const [loading, setLoading] = useState(false);
  useTitle(copy.signIn);

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const next = {
      email: issue(emailIssue(email)),
      password: password ? "" : issue("required"),
    };
    setErrors(next);
    if (next.email || next.password) return;
    setLoading(true);
    window.setTimeout(() => {
      const result = login(email, password);
      setLoading(false);
      if (!result.ok) {
        setErrors({ form: "That email and password do not match a sample account." });
        return;
      }
      markOnboarded();
      navigate({ to: "/home" });
    }, 400);
  };

  return (
    <AuthFrame title="Welcome back" subtitle="Athlete and parent sign-in. Coaches use the separate Coach app.">
      <form className="space-y-4" onSubmit={submit} noValidate>
        <TextField label="Email" type="email" autoComplete="email" value={email} error={errors.email} onChange={(event) => setEmail(event.target.value)} />
        <PasswordField label="Password" autoComplete="current-password" value={password} error={errors.password} onChange={(event) => setPassword(event.target.value)} />
        {errors.form && <p className="text-sm text-destructive" role="alert">{errors.form}</p>}
        <div className="text-right">
          <Link to="/forgot-password" className="text-sm font-semibold text-link">Forgot password</Link>
        </div>
        <Btn type="submit" full loading={loading} disabled={!ready}>{copy.signIn}</Btn>
      </form>
      <div className="mt-6 rounded-3xl bg-card p-4 ring-1 ring-border">
        <p className="text-sm font-semibold">Sample accounts</p>
        <p className="mt-1 text-xs text-muted-foreground">Password {SAMPLE_PASSWORD}. Nothing here is a live roster.</p>
        <div className="mt-3 grid gap-2">
          <button type="button" className="min-h-11 rounded-2xl bg-elevated px-3 text-left text-sm" onClick={() => { setEmail("jordan@sample.spotmyroster.com"); setPassword(SAMPLE_PASSWORD); }}>
            Athlete · Jordan Hale
          </button>
          <button type="button" className="min-h-11 rounded-2xl bg-elevated px-3 text-left text-sm" onClick={() => { setEmail("morgan@sample.spotmyroster.com"); setPassword(SAMPLE_PASSWORD); }}>
            Parent · Morgan Hale
          </button>
        </div>
      </div>
      <p className="mt-6 text-sm text-muted-foreground">
        New here?{" "}
        <Link to="/register" className="font-semibold text-link">Create an account</Link>
      </p>
    </AuthFrame>
  );
}

export function RegisterScreen() {
  const { register } = useApp();
  const navigate = useNavigate();
  const issue = useIssue();
  const [role, setRole] = useState<"athlete" | "parent" | "">("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [terms, setTerms] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  useTitle("Create account");

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const next: Record<string, string> = {};
    if (!role) next.role = issue("required");
    const first = requiredIssue(firstName);
    const last = requiredIssue(lastName);
    const mail = emailIssue(email);
    const tel = phoneIssue(phone);
    const pass = passwordIssue(password);
    if (first) next.firstName = issue(first);
    if (last) next.lastName = issue(last);
    if (mail) next.email = issue(mail);
    if (tel) next.phone = issue(tel);
    if (pass) next.password = issue(pass);
    if (password !== confirm) next.confirm = issue("match");
    if (!terms) next.terms = "Accept the terms notice to continue. Official legal text is not published yet.";
    setErrors(next);
    if (Object.keys(next).length || !role) return;
    setLoading(true);
    window.setTimeout(() => {
      const result = register({ role, firstName, lastName, email, phone, password });
      setLoading(false);
      if (!result.ok) {
        setErrors({ email: "An account with that email already exists in this sample." });
        return;
      }
      navigate({ to: "/verify", search: { purpose: "email", email: email.trim() } });
    }, 400);
  };

  return (
    <AuthFrame title="Create your account" subtitle="Choose athlete if this login is for one athlete. Choose parent if you will manage one or more athletes.">
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
                className={`min-h-12 rounded-2xl px-3 text-sm font-semibold ring-1 ${role === option ? "bg-primary text-primary-foreground ring-transparent" : "bg-elevated ring-border"}`}
              >
                {option === "athlete" ? "Athlete" : "Parent / guardian"}
              </button>
            ))}
          </div>
          {errors.role && <p className="mt-1 text-xs text-destructive">{errors.role}</p>}
        </fieldset>
        <div className="grid grid-cols-2 gap-3">
          <TextField label="First name" value={firstName} error={errors.firstName} onChange={(event) => setFirstName(event.target.value)} />
          <TextField label="Last name" value={lastName} error={errors.lastName} onChange={(event) => setLastName(event.target.value)} />
        </div>
        <TextField label="Email" type="email" autoComplete="email" value={email} error={errors.email} onChange={(event) => setEmail(event.target.value)} />
        <TextField label="Phone" type="tel" autoComplete="tel" value={phone} error={errors.phone} onChange={(event) => setPhone(event.target.value)} />
        <PasswordField label="Password" autoComplete="new-password" value={password} error={errors.password} onChange={(event) => setPassword(event.target.value)} />
        <PasswordField label="Confirm password" autoComplete="new-password" value={confirm} error={errors.confirm} onChange={(event) => setConfirm(event.target.value)} />
        <label className="flex min-h-11 items-start gap-3 text-sm leading-relaxed">
          <input type="checkbox" className="mt-1 size-5 accent-[var(--brand-dark)]" checked={terms} onChange={(event) => setTerms(event.target.checked)} />
          <span>
            I have read the{" "}
            <Link to="/legal/$doc" params={{ doc: "terms" }} className="font-semibold text-link underline">Terms</Link>
            {" "}and{" "}
            <Link to="/legal/$doc" params={{ doc: "privacy" }} className="font-semibold text-link underline">Privacy</Link>
            {" "}notices. Official legal copy has not been published in this sample.
          </span>
        </label>
        {errors.terms && <p className="text-sm text-destructive">{errors.terms}</p>}
        <Btn type="submit" full loading={loading}>Create account</Btn>
      </form>
      <p className="mt-6 text-sm text-muted-foreground">
        Already registered? <Link to="/login" className="font-semibold text-link">Sign in</Link>
      </p>
    </AuthFrame>
  );
}

export function ForgotScreen() {
  const { accounts } = useApp();
  const navigate = useNavigate();
  const issue = useIssue();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  useTitle("Forgot password");

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const mail = emailIssue(email);
    if (mail) {
      setError(issue(mail));
      return;
    }
    const exists = accounts.some((item) => item.email.toLowerCase() === email.trim().toLowerCase());
    if (!exists) {
      setError("No sample account uses that email.");
      return;
    }
    navigate({ to: "/verify", search: { purpose: "reset", email: email.trim() } });
  };

  return (
    <AuthFrame title="Reset your password" subtitle="We will ask for the sample verification code next. No email is sent.">
      <form className="space-y-4" onSubmit={submit} noValidate>
        <TextField label="Email" type="email" value={email} error={error} onChange={(event) => setEmail(event.target.value)} />
        <Btn type="submit" full>Send code</Btn>
      </form>
    </AuthFrame>
  );
}

export function VerifyScreen({ purpose, email }: { purpose: "email" | "reset"; email: string }) {
  const { verifyEmail } = useApp();
  const navigate = useNavigate();
  const issue = useIssue();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  useTitle("Verification");

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (code.trim() !== SAMPLE_OTP) {
      setError(issue("otp"));
      return;
    }
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
      title={purpose === "email" ? "Confirm your email" : "Enter the code"}
      subtitle={`Sample code ${SAMPLE_OTP}. This build does not send a real message.`}
    >
      <form className="space-y-4" onSubmit={submit}>
        <TextField
          label="6-digit code"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          value={code}
          error={error}
          onChange={(event) => setCode(event.target.value.replace(/\D/g, "").slice(0, 6))}
        />
        <Btn type="submit" full disabled={code.length !== 6}>Verify</Btn>
        <button type="button" className="min-h-11 text-sm font-semibold text-link" onClick={() => toast("Sample code is still 482913")}>
          Resend sample code
        </button>
      </form>
    </AuthFrame>
  );
}

export function ResetScreen() {
  const { resetPassword } = useApp();
  const navigate = useNavigate();
  const issue = useIssue();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState<{ password?: string; confirm?: string }>({});
  useTitle("New password");

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const pass = passwordIssue(password);
    const next = {
      password: pass ? issue(pass) : "",
      confirm: password !== confirm ? issue("match") : "",
    };
    setErrors(next);
    if (next.password || next.confirm) return;
    const email = sessionStorage.getItem("smr-reset-email") ?? "";
    const ok = resetPassword(email, password);
    if (!ok) {
      toast("Start again from Forgot password.");
      navigate({ to: "/forgot-password" });
      return;
    }
    navigate({ to: "/password-updated", replace: true });
  };

  return (
    <AuthFrame title="Choose a new password" subtitle="Use at least 8 characters, with a letter and a number.">
      <form className="space-y-4" onSubmit={submit} noValidate>
        <PasswordField label="New password" value={password} error={errors.password} onChange={(event) => setPassword(event.target.value)} />
        <PasswordField label="Confirm password" value={confirm} error={errors.confirm} onChange={(event) => setConfirm(event.target.value)} />
        <Btn type="submit" full>Update password</Btn>
      </form>
    </AuthFrame>
  );
}

export function PasswordUpdatedScreen() {
  const navigate = useNavigate();
  useTitle("Password updated");
  return (
    <AuthFrame title="Password updated" subtitle="Sign in with the new password. This change is stored only on this device.">
      <Btn full onClick={() => navigate({ to: "/login", replace: true })}>Back to sign in</Btn>
    </AuthFrame>
  );
}

export function AuthSuccessScreen() {
  const navigate = useNavigate();
  useTitle("Account ready");
  return (
    <AuthFrame title="You’re in" subtitle="Next, finish the athlete profile. You can save and come back before it is complete.">
      <Btn full onClick={() => navigate({ to: "/setup", replace: true })}>Set up the athlete profile</Btn>
    </AuthFrame>
  );
}

function AuthFrame({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return (
    <div className="min-h-dvh bg-background px-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-[max(1.25rem,env(safe-area-inset-top))]">
      <Logo compact />
      <h1 className="mt-6 font-display text-[2rem] font-semibold leading-tight">{title}</h1>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{subtitle}</p>
      <div className="mt-6">{children}</div>
    </div>
  );
}
