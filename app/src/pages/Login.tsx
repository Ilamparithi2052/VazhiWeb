import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import QRCode from "qrcode";
import { trpc } from "@/providers/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (cfg: { client_id: string; callback: (r: { credential: string }) => void }) => void;
          renderButton: (el: HTMLElement, opts: Record<string, unknown>) => void;
        };
      };
    };
  }
}

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;

type Step =
  | { kind: "signin" }
  | { kind: "totp"; pendingToken: string }
  | { kind: "setup2fa"; secret: string; uri: string }
  | { kind: "done" };

export default function Login() {
  const navigate = useNavigate();
  const utils = trpc.useUtils();
  const setup = trpc.auth.setupStatus.useQuery(undefined, { retry: false });

  const [step, setStep] = useState<Step>({ kind: "signin" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  // sign-in fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  // first-admin fields
  const [name, setName] = useState("");
  // totp code
  const [code, setCode] = useState("");
  const [qr, setQr] = useState("");

  const googleBtn = useRef<HTMLDivElement>(null);

  const startTotpSetupRef = useRef<() => Promise<void>>(async () => {});

  /* after any successful auth: offer 2FA enrolment to admins who lack it */
  const finish = async () => {
    await utils.invalidate();
    try {
      const me = await utils.auth.me.fetch(undefined, { retry: false });
      if (me && me.role === "admin" && !me.totpEnabled) {
        await startTotpSetupRef.current();
        return;
      }
    } catch {
      /* fall through to redirect */
    }
    navigate("/admin");
  };

  const googleLogin = trpc.auth.loginGoogle.useMutation({
    onError: (e) => setError(e.message),
    onSuccess: async (r) => {
      if (r.status === "totp") setStep({ kind: "totp", pendingToken: r.pendingToken });
      else await finish();
    },
  });

  const login = trpc.auth.login.useMutation({
    onError: (e) => { setError(e.message); setBusy(false); },
    onSuccess: async (r) => {
      if (r.status === "totp") { setStep({ kind: "totp", pendingToken: r.pendingToken }); setBusy(false); }
      else await finish();
    },
  });

  const createFirst = trpc.auth.createFirstAdmin.useMutation({
    onError: (e) => { setError(e.message); setBusy(false); },
    onSuccess: finish,
  });

  const verifyTotp = trpc.auth.verifyTotp.useMutation({
    onError: (e) => { setError(e.message); setBusy(false); },
    onSuccess: finish,
  });

  const totpConfirm = trpc.auth.totpConfirm.useMutation({
    onError: (e) => { setError(e.message); setBusy(false); },
    onSuccess: finish,
  });

  /* load Google Identity Services and render its button */
  useEffect(() => {
    if (!GOOGLE_CLIENT_ID || step.kind !== "signin" || setup.data?.needsSetup) return;
    let cancelled = false;
    const init = () => {
      if (cancelled || !window.google || !googleBtn.current) return;
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: (r) => googleLogin.mutate({ idToken: r.credential }),
      });
      window.google.accounts.id.renderButton(googleBtn.current, {
        theme: "outline",
        size: "large",
        width: 320,
        text: "signin_with",
      });
    };
    if (window.google) init();
    else {
      const s = document.createElement("script");
      s.src = "https://accounts.google.com/gsi/client";
      s.async = true;
      s.onload = init;
      document.head.appendChild(s);
    }
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step.kind, setup.data?.needsSetup]);

  /* render the TOTP QR when entering the 2FA setup step */
  useEffect(() => {
    if (step.kind === "setup2fa") {
      QRCode.toDataURL(step.uri, { width: 220, margin: 1 }).then(setQr).catch(() => setQr(""));
    }
  }, [step]);

  const startTotpSetup = async () => {
    setError("");
    try {
      const r = await utils.client.auth.totpStart.mutate();
      setCode("");
      setStep({ kind: "setup2fa", secret: r.secret, uri: r.uri });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not start 2FA setup.");
    }
  };
  startTotpSetupRef.current = startTotpSetup;

  const inputCls = "bg-[#120d08] border-[#3a2c17] text-[#f0e6d2] placeholder:text-[#f0e6d2]/40";
  const needsSetup = setup.data?.needsSetup;

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#120d08] px-4">
      <Card className="w-full max-w-sm bg-[#1b1409] border-[#3a2c17] text-[#f0e6d2] shadow-2xl">
        <CardHeader className="text-center">
          <img src="/img/final/logo-black.png" alt="Vazhi" className="h-14 mx-auto mb-2 object-contain" />
          <CardTitle className="font-serif">
            {needsSetup
              ? "Create the first admin"
              : step.kind === "totp"
                ? "Two-factor authentication"
                : step.kind === "setup2fa"
                  ? "Set up two-factor authentication"
                  : "Welcome back"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && <p className="text-sm text-red-600">{error}</p>}

          {/* ---------- first-run: create the admin account ---------- */}
          {needsSetup && step.kind === "signin" && (
            <form
              className="space-y-3"
              onSubmit={(e) => {
                e.preventDefault();
                setBusy(true); setError("");
                createFirst.mutate({ name, email, password });
              }}
            >
              <p className="text-sm text-muted-foreground">
                No accounts exist yet. This creates the first admin — do it once, on a private connection.
              </p>
              <Input className={inputCls} placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} required />
              <Input className={inputCls} type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              <Input className={inputCls} type="password" placeholder="Password (min. 8 characters)" value={password} onChange={(e) => setPassword(e.target.value)} minLength={8} required />
              <Button className="w-full" size="lg" disabled={busy}>
                {busy ? "Creating…" : "Create admin & sign in"}
              </Button>
            </form>
          )}

          {/* ---------- normal sign-in ---------- */}
          {!needsSetup && step.kind === "signin" && (
            <>
              {GOOGLE_CLIENT_ID && <div ref={googleBtn} className="flex justify-center" />}
              {GOOGLE_CLIENT_ID && (
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="h-px flex-1 bg-border" /> or <span className="h-px flex-1 bg-border" />
                </div>
              )}
              <form
                className="space-y-3"
                onSubmit={(e) => {
                  e.preventDefault();
                  setBusy(true); setError("");
                  login.mutate({ email, password });
                }}
              >
                <Input className={inputCls} type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                <Input className={inputCls} type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                <Button className="w-full" size="lg" disabled={busy}>
                  {busy ? "Signing in…" : "Sign in"}
                </Button>
              </form>
            </>
          )}

          {/* ---------- TOTP challenge during sign-in ---------- */}
          {step.kind === "totp" && (
            <form
              className="space-y-3"
              onSubmit={(e) => {
                e.preventDefault();
                setBusy(true); setError("");
                verifyTotp.mutate({ pendingToken: step.pendingToken, code });
              }}
            >
              <p className="text-sm text-muted-foreground">
                Enter the 6-digit code from your authenticator app.
              </p>
              <Input
                className={`${inputCls} text-center tracking-[0.5em] text-lg`}
                inputMode="numeric"
                autoComplete="one-time-code"
                placeholder="000000"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                required
              />
              <Button className="w-full" size="lg" disabled={busy || code.length !== 6}>
                {busy ? "Verifying…" : "Verify"}
              </Button>
            </form>
          )}

          {/* ---------- optional 2FA enrolment after sign-in ---------- */}
          {step.kind === "setup2fa" && (
            <form
              className="space-y-3"
              onSubmit={(e) => {
                e.preventDefault();
                setBusy(true); setError("");
                totpConfirm.mutate({ code });
              }}
            >
              <p className="text-sm text-muted-foreground">
                Scan this QR with Google Authenticator, Authy or 1Password, then enter the 6-digit code.
              </p>
              {qr && <img src={qr} alt="2FA QR code" className="mx-auto rounded" />}
              <p className="text-xs text-center text-muted-foreground break-all">
                Can't scan? Add this key manually: <code className="font-mono">{step.secret}</code>
              </p>
              <Input
                className={`${inputCls} text-center tracking-[0.5em] text-lg`}
                inputMode="numeric"
                autoComplete="one-time-code"
                placeholder="000000"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                required
              />
              <Button className="w-full" size="lg" disabled={busy || code.length !== 6}>
                {busy ? "Enabling…" : "Enable 2FA"}
              </Button>
              <Button type="button" variant="ghost" className="w-full" onClick={() => navigate("/admin")}>
                Skip for now
              </Button>
            </form>
          )}

          {!needsSetup && step.kind === "signin" && (
            <button
              type="button"
              className="w-full text-xs text-muted-foreground underline underline-offset-2"
              onClick={startTotpSetup}
            >
              Already signed in elsewhere? Set up 2FA
            </button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
