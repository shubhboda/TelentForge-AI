import { motion } from "framer-motion";
import { BarChart3, FileText, Sparkles } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { StatCard } from "../components/StatCard";
import { apiGet } from "../lib/api";

const cards = [
  { label: "Open roles", value: "24", delta: "+4 this week" },
  { label: "Qualified candidates", value: "1,284", delta: "+18.2%" },
  { label: "Interviews scheduled", value: "86", delta: "+12 today" },
  { label: "AI rank accuracy", value: "94%", delta: "+3.1%" },
];

type HealthResponse = { status: string; service: string };
type AnalyticsSummary = {
  candidateCount: number;
  applicationCount: number;
  interviewCount: number;
  hiringVelocity: number;
};

export function DashboardPage() {
  const healthQuery = useQuery({
    queryKey: ["health"],
    queryFn: () => apiGet<HealthResponse>("/health"),
  });

  const analyticsQuery = useQuery({
    queryKey: ["analytics-summary"],
    queryFn: () => apiGet<AnalyticsSummary>("/api/analytics/summary"),
  });

  const healthStatus = healthQuery.data?.status ?? (healthQuery.isLoading ? "Connecting" : "Offline");
  const healthService = healthQuery.data?.service ?? "Backend";

  const analytics = analyticsQuery.data ?? {
    candidateCount: 0,
    applicationCount: 0,
    interviewCount: 0,
    hiringVelocity: 0,
  };

  return (
    <div className="space-y-6">
      <section className="grid gap-4 lg:grid-cols-[1.6fr_0.9fr]">
        <Card className="relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(22,153,109,0.3),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(245,158,11,0.14),transparent_30%)]" />
          <div className="relative">
            <p className="text-xs uppercase tracking-[0.35em] text-brand-200/70">TalentForge Command Center</p>
            <h3 className="mt-3 max-w-2xl text-3xl font-semibold text-white sm:text-4xl">
              Rank candidates with AI, move them through the ATS pipeline, and keep every hiring step auditable.
            </h3>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-300">
              This scaffold is wired for Supabase Auth, PostgreSQL, Storage, RLS, secure REST APIs, and role-based controls.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button>
                <Sparkles className="mr-2 h-4 w-4" />
                Review AI rankings
              </Button>
              <button className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10">
                <FileText className="mr-2 h-4 w-4" />
                Export reports
              </button>
            </div>
          </div>
        </Card>

        <Card>
          <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Workflow health</p>
          <div className="mt-4 space-y-4 text-sm">
            {[
              ["Backend API", healthQuery.isError ? "Offline" : healthStatus],
              ["Service", healthService],
              ["Supabase sync", "Connected"],
              ["Realtime data", analyticsQuery.isError ? "Pending" : "Live"],
            ].map(([label, status]) => (
              <div key={label} className="flex items-center justify-between rounded-2xl border border-white/8 bg-black/15 px-4 py-3">
                <span className="text-slate-300">{label}</span>
                <span className="text-white">{status}</span>
              </div>
            ))}
          </div>
        </Card>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <StatCard key={card.label} {...card} />
        ))}
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Live candidates" value={String(analytics.candidateCount)} delta="Synced from API" />
        <StatCard label="Live applications" value={String(analytics.applicationCount)} delta="Synced from API" />
        <StatCard label="Live interviews" value={String(analytics.interviewCount)} delta="Synced from API" />
        <StatCard label="Hiring velocity" value={String(analytics.hiringVelocity)} delta="Live metric" />
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.3fr_0.7fr]">
        <Card>
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Hiring funnel</p>
              <h4 className="mt-2 text-xl font-semibold text-white">Pipeline overview</h4>
            </div>
            <BarChart3 className="h-5 w-5 text-brand-200" />
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {[
              ["Applied", "312"],
              ["Interviewing", "68"],
              ["Offers", "11"],
            ].map(([label, value]) => (
              <div key={label} className="rounded-3xl border border-white/10 bg-slate-950/45 p-4">
                <p className="text-xs uppercase tracking-[0.25em] text-slate-500">{label}</p>
                <p className="mt-3 text-3xl font-semibold text-white">{value}</p>
                <div className="mt-4 h-2 rounded-full bg-white/10">
                  <motion.div
                    className="h-2 rounded-full bg-gradient-to-r from-brand-400 to-emerald-300"
                    initial={{ width: 0 }}
                    animate={{ width: label === "Applied" ? "78%" : label === "Interviewing" ? "44%" : "16%" }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Next actions</p>
          <div className="mt-5 space-y-3 text-sm text-slate-300">
            <p>1. Connect Supabase tables and RLS policies.</p>
            <p>2. Replace scaffolded routes with persistence-backed handlers.</p>
            <p>3. Add export, notification, and interview scheduling integrations.</p>
          </div>
        </Card>
      </section>
    </div>
  );
}
