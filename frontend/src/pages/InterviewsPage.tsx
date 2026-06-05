import { Card } from "../components/ui/card";

export function InterviewsPage() {
  return (
    <Card>
      <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Interviews</p>
      <h3 className="mt-2 text-2xl font-semibold text-white">Scheduling and feedback capture</h3>
      <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300">
        This area will coordinate interview invites, time slots, structured scorecards, and feedback persistence.
      </p>
    </Card>
  );
}
