import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Building2, LoaderCircle, Lock, Mail, User2 } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Logo } from "../components/Logo";
import { useAuth } from "../lib/auth";

type Mode = "login" | "signup";

export function AuthPage() {
  const navigate = useNavigate();
  const { login, signup } = useAuth();

  const [mode, setMode] = useState<Mode>("login");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [organizationSlug, setOrganizationSlug] = useState("talentforge-demo");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      if (mode === "login") {
        await login({ email, password });
      } else {
        await signup({
          email,
          password,
          fullName,
          organizationSlug,
          role: "recruiter",
        });
      }
      navigate("/", { replace: true });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Authentication failed";
      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-[100dvh] bg-[radial-gradient(circle_at_top,_rgba(22,153,109,0.22),_transparent_30%),linear-gradient(180deg,#06110e_0%,#091712_50%,#040906_100%)] px-3 py-6 text-slate-100 sm:px-4 sm:py-10">
      <div className="mx-auto flex min-h-[calc(100dvh-3rem)] max-w-5xl items-center justify-center">
        <Card className="grid w-full max-w-4xl overflow-hidden p-0 lg:grid-cols-2">
          <section className="relative hidden bg-[radial-gradient(circle_at_top,_rgba(22,153,109,0.25),_transparent_38%),radial-gradient(circle_at_bottom,_rgba(245,158,11,0.17),_transparent_35%)] p-8 lg:block">
            <Logo size="lg" />
            <h1 className="mt-6 text-4xl font-semibold text-white">Secure hiring workspace</h1>
            <p className="mt-5 max-w-sm text-sm leading-6 text-slate-300">
              Sign in to continue to your recruitment command center, or create a new recruiter account linked to your organization.
            </p>
            <div className="mt-10 space-y-3 text-sm text-slate-200">
              <p>1. JWT-based secure API sessions.</p>
              <p>2. Supabase PostgreSQL-backed user accounts.</p>
              <p>3. Role-ready foundation for RBAC routes.</p>
            </div>
          </section>

          <section className="p-4 sm:p-8">
            <div className="mb-5 lg:hidden">
              <Logo size="sm" />
              <p className="mt-3 text-sm leading-6 text-slate-400">
                Sign in or create your recruiter account to access the hiring workspace.
              </p>
            </div>

            <div className="mb-6 flex rounded-2xl border border-white/10 bg-black/20 p-1">
              <button
                type="button"
                className={`flex-1 rounded-xl px-3 py-2 text-sm font-semibold transition ${
                  mode === "login" ? "bg-brand-500 text-white" : "text-slate-300 hover:text-white"
                }`}
                onClick={() => {
                  setMode("login");
                  setErrorMessage(null);
                }}
              >
                Login
              </button>
              <button
                type="button"
                className={`flex-1 rounded-xl px-3 py-2 text-sm font-semibold transition ${
                  mode === "signup" ? "bg-brand-500 text-white" : "text-slate-300 hover:text-white"
                }`}
                onClick={() => {
                  setMode("signup");
                  setErrorMessage(null);
                }}
              >
                Sign Up
              </button>
            </div>

            <form onSubmit={onSubmit} className="space-y-4">
              {mode === "signup" && (
                <label className="block space-y-2 text-sm text-slate-300">
                  <span className="text-xs uppercase tracking-[0.22em] text-slate-400">Full name</span>
                  <div className="flex items-center gap-2 rounded-2xl border border-white/20 bg-white/8 px-4 py-3 transition focus-within:border-brand-400 focus-within:bg-white/12">
                    <User2 className="h-4 w-4 text-brand-300" />
                    <input
                      required
                      value={fullName}
                      onChange={(event) => setFullName(event.target.value)}
                      className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
                      placeholder="Your full name"
                    />
                  </div>
                </label>
              )}

              <label className="block space-y-2 text-sm text-slate-300">
                <span className="text-xs uppercase tracking-[0.22em] text-slate-400">Email</span>
                <div className="flex items-center gap-2 rounded-2xl border border-white/20 bg-white/8 px-4 py-3 transition focus-within:border-brand-400 focus-within:bg-white/12">
                  <Mail className="h-4 w-4 text-brand-300" />
                  <input
                    required
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
                    placeholder="you@company.com"
                  />
                </div>
              </label>

              <label className="block space-y-2 text-sm text-slate-300">
                <span className="text-xs uppercase tracking-[0.22em] text-slate-400">Password</span>
                <div className="flex items-center gap-2 rounded-2xl border border-white/20 bg-white/8 px-4 py-3 transition focus-within:border-brand-400 focus-within:bg-white/12">
                  <Lock className="h-4 w-4 text-brand-300" />
                  <input
                    required
                    minLength={8}
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
                    placeholder="Minimum 8 characters"
                  />
                </div>
              </label>

              {mode === "signup" && (
                <label className="block space-y-2 text-sm text-slate-300">
                  <span className="text-xs uppercase tracking-[0.22em] text-slate-400">Organization slug</span>
                  <div className="flex items-center gap-2 rounded-2xl border border-white/20 bg-white/8 px-4 py-3 transition focus-within:border-brand-400 focus-within:bg-white/12">
                    <Building2 className="h-4 w-4 shrink-0 text-brand-300" />
                    <input
                      required
                      value={organizationSlug}
                      onChange={(event) => setOrganizationSlug(event.target.value.trim().toLowerCase())}
                      className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
                      placeholder="talentforge-demo"
                      autoComplete="off"
                    />
                  </div>
                  <p className="text-xs text-slate-500">
                    Use an existing team slug or enter a new one to create your organization.
                  </p>
                </label>
              )}

              {errorMessage && (
                <div className="rounded-xl border border-rose-400/40 bg-rose-500/15 px-4 py-3 text-sm text-rose-200">
                  {errorMessage}
                </div>
              )}

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                    {mode === "login" ? "Signing in..." : "Creating account..."}
                  </>
                ) : mode === "login" ? (
                  "Login"
                ) : (
                  "Sign Up"
                )}
              </Button>
            </form>
          </section>
        </Card>
      </div>
    </div>
  );
}
