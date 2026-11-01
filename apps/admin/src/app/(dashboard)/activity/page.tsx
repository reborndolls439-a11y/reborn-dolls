import { getCurrentAdmin } from "@/lib/auth";
import { prisma } from "@reborn/db";
import { redirect } from "next/navigation";
import { AdminHeader } from "@/components/layout/AdminHeader";

export const dynamic = "force-dynamic";

export default async function ActivityPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/login");

  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page) || 1);
  const limit = 30;

  const [logs, total] = await Promise.all([
    prisma.activityLog.findMany({
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      include: { user: { select: { name: true, email: true } } },
    }),
    prisma.activityLog.count(),
  ]);

  const actionColors: Record<string, string> = {
    product_created: "text-green-700 bg-green-50",
    product_updated: "text-blue-700 bg-blue-50",
    product_archived: "text-red-700 bg-red-50",
    product_imported: "text-purple-700 bg-purple-50",
    order_updated: "text-amber-700 bg-amber-50",
    settings_updated: "text-taupe bg-charcoal-50",
  };

  return (
    <div className="flex flex-col">
      <AdminHeader title="Activity Logs" subtitle={`${total} total events`} />
      <div className="p-6">
        <div className="bg-white rounded-2xl border border-charcoal-100 overflow-hidden">
          <table className="w-full text-sm font-body">
            <thead>
              <tr className="bg-charcoal-50 border-b border-charcoal-100">
                {["Time", "User", "Action", "Entity", "Details"].map((h) => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-taupe uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-charcoal-50">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-charcoal-50 transition-colors">
                  <td className="px-5 py-3 text-taupe whitespace-nowrap">
                    {new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(log.createdAt))}
                  </td>
                  <td className="px-5 py-3">
                    <p className="font-medium text-charcoal">{log.user?.name || "System"}</p>
                    <p className="text-xs text-taupe">{log.user?.email || ""}</p>
                  </td>
                  <td className="px-5 py-3">
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${actionColors[log.action] || "text-charcoal bg-charcoal-50"}`}>
                      {log.action.replace(/_/g, " ")}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-taupe capitalize">{log.entity || "—"}</td>
                  <td className="px-5 py-3 text-taupe text-xs max-w-xs truncate">
                    {log.metadata ? JSON.stringify(log.metadata).slice(0, 60) : "—"}
                  </td>
                </tr>
              ))}
              {logs.length === 0 && <tr><td colSpan={5} className="py-10 text-center text-taupe">No activity yet.</td></tr>}
            </tbody>
          </table>
        </div>

        {total > limit && (
          <div className="flex items-center justify-between mt-4 text-sm font-body text-taupe">
            <span>Page {page} of {Math.ceil(total / limit)}</span>
            <div className="flex gap-2">
              {page > 1 && <a href={`?page=${page - 1}`} className="px-3 py-1.5 rounded-lg border border-charcoal-200 hover:border-bloom-rose hover:text-bloom-rose transition-colors">Previous</a>}
              {page * limit < total && <a href={`?page=${page + 1}`} className="px-3 py-1.5 rounded-lg border border-charcoal-200 hover:border-bloom-rose hover:text-bloom-rose transition-colors">Next</a>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
