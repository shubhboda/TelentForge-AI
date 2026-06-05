import { Card } from "../components/ui/card";

export function CandidatesPage() {
  return (
    <Card>
      <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Candidates</p>
      <h3 className="mt-2 text-2xl font-semibold text-white">Resume parsing and AI ranking</h3>
      <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300">
        Resume uploads will land in Supabase Storage, get parsed server-side, and be ranked against job requirements before being surfaced in the recruiter workflow.
      </p>
    </Card>
  );
}
