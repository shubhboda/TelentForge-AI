import { Navigate, NavLink, Route, Routes } from "react-router-dom";
import { motion } from "framer-motion";
import { Activity, BriefcaseBusiness, LayoutDashboard, LogOut, ShieldCheck, Users } from "lucide-react";
import { cn } from "./lib/cn";
import { Logo } from "./components/Logo";
import { DashboardPage } from "./pages/DashboardPage";
import { JobsPage } from "./pages/JobsPage";
import { CandidatesPage } from "./pages/CandidatesPage";
import { InterviewsPage } from "./pages/InterviewsPage";
import { AdminPage } from "./pages/AdminPage";
import { AuthPage } from "./pages/AuthPage";
import { useAuth } from "./lib/auth";

function Shell({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();

  const navItems: Array<{ to: string; label: string; icon: typeof LayoutDashboard }> = [
    { to: "/", label: "Dashboard", icon: LayoutDashboard },
    { to: "/jobs", label: "Jobs", icon: BriefcaseBusiness },
    { to: "/candidates", label: "Candidates", icon: Users },
    { to: "/interviews", label: "Interviews", icon: Activity },
    ...(user?.role === "admin" || user?.role === "manager"
      ? [{ to: "/admin", label: "Admin", icon: ShieldCheck }]
      : []),
  ];

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(22,153,109,0.22),_transparent_32%),linear-gradient(180deg,#06110e_0%,#091712_50%,#040906_100%)] text-slate-100">
      <div className="mx-auto flex min-h-screen max-w-[1600px] flex-col lg:flex-row">
        <aside className="border-b border-white/10 bg-white/5 px-5 py-6 backdrop-blur-xl lg:min-h-screen lg:w-80 lg:border-b-0 lg:border-r">
          <Logo size="default" />

          <nav className="mt-10 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition",
                      isActive ? "bg-brand-500 text-white shadow-glow" : "text-slate-300 hover:bg-white/8 hover:text-white"
                    )
                  }
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </NavLink>
              );
            })}
          </nav>

          <div className="mt-10 rounded-3xl border border-white/10 bg-slate-950/60 p-5 shadow-2xl">
            <p className="text-sm font-medium text-white">Platform status</p>
            <div className="mt-4 flex items-center justify-between text-sm text-slate-300">
              <span>Pipeline health</span>
              <span className="rounded-full bg-emerald-500/20 px-2 py-1 text-emerald-200">98%</span>
            </div>
            <div className="mt-3 h-2 rounded-full bg-white/10">
              <div className="h-2 w-[98%] rounded-full bg-gradient-to-r from-brand-400 to-emerald-300" />
            </div>
            <p className="mt-4 text-xs leading-5 text-slate-400">
              Supabase-backed data, secure REST APIs, AI ranking, and role-aware workflow controls.
            </p>
          </div>
        </aside>

        <main className="flex-1 px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
          <header className="mb-6 flex flex-col gap-4 rounded-[2rem] border border-white/10 bg-white/5 p-5 backdrop-blur-xl lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-brand-200/80">Secure hiring workflow</p>
              <h2 className="mt-2 text-2xl font-semibold text-white sm:text-3xl">AI ranking, ATS control, and candidate operations.</h2>
            </div>
            <div className="flex flex-wrap gap-3 text-sm text-slate-300">
              <div className="rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3">
                <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Exports</p>
                <p className="mt-1 font-semibold text-white">PDF + Excel</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3">
                <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Notifications</p>
                <p className="mt-1 font-semibold text-white">Email + Realtime</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3">
                <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Signed in</p>
                <p className="mt-1 font-semibold text-white">{user?.fullName ?? "Unknown user"}</p>
              </div>
              <button
                onClick={logout}
                className="inline-flex items-center rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 font-semibold text-white transition hover:bg-slate-900"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </button>
            </div>
          </header>

          {children}
        </main>
      </div>
    </div>
  );
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }
  return <>{children}</>;
}

function GuestRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
}

function RoleProtectedRoute({ children, allowedRoles }: { children: React.ReactNode; allowedRoles: string[] }) {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/auth" replace />;
  }
  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
}

export function App() {
  return (
    <Routes>
      <Route
        path="/auth"
        element={
          <GuestRoute>
            <AuthPage />
          </GuestRoute>
        }
      />
      <Route
        path="*"
        element={
          <ProtectedRoute>
            <Shell>
              <Routes>
                <Route path="/" element={<DashboardPage />} />
                <Route path="/jobs" element={<JobsPage />} />
                <Route path="/candidates" element={<CandidatesPage />} />
                <Route path="/interviews" element={<InterviewsPage />} />
                <Route
                  path="/admin"
                  element={
                    <RoleProtectedRoute allowedRoles={["admin", "manager"]}>
                      <AdminPage />
                    </RoleProtectedRoute>
                  }
                />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Shell>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export const BrandPulse = motion.div;
