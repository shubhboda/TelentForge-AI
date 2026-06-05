import { Card } from "../components/ui/card";

export function JobsPage() {
  return (
    <div className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
      <Card>
        <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Jobs</p>
        <h3 className="mt-2 text-2xl font-semibold text-white">ATS pipeline management</h3>
        <p className="mt-3 text-sm leading-6 text-slate-300">
          This section will manage job creation, pipeline stages, AI scoring, and organization-scoped access.
        </p>
      </Card>
      <Card>
        <div className="space-y-3 text-sm text-slate-300">
          <div className="rounded-2xl border border-white/10 bg-black/15 p-4">Create, publish, and archive roles</div>
          <div className="rounded-2xl border border-white/10 bg-black/15 p-4">Trigger candidate ranking against role criteria</div>
          <div className="rounded-2xl border border-white/10 bg-black/15 p-4">Track stage movement and activity logs</div>
        </div>
      </Card>
    </div>
  );
}
