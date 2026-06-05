import { Card } from "../components/ui/card";

export function AdminPage() {
  return (
    <Card>
      <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Admin</p>
      <h3 className="mt-2 text-2xl font-semibold text-white">Organization governance and RBAC</h3>
      <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300">
        Admin workflows will manage organizations, user roles, system audit logs, notification settings, and policy enforcement.
      </p>
    </Card>
  );
}
