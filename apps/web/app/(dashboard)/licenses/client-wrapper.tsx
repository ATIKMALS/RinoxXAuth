"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Download, Search } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { CreateLicenseForm } from "@/components/forms/create-license-form";
import { ExportCsvButton } from "@/components/ui/export-csv-button";

interface LicenseRecord {
  id: number;
  application_name?: string;
  key: string;
  plan: string;
  issued_to?: string;
  device_limit: number;
  issued_date: string;
  expires_at: string;
  status: string;
  note?: string;
  hwid_lock?: boolean;
}

export function LicensesClientWrapper({ licenses }: { licenses: LicenseRecord[] }) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [planFilter, setPlanFilter] = useState("all");
  const router = useRouter();

  const handleCreateSuccess = () => {
    router.refresh();
  };

  const exportRows = useMemo(
    () =>
      licenses.map((l) => [
        l.key,
        l.application_name || "Unknown",
        l.plan,
        l.status,
        l.expires_at,
        l.device_limit,
        l.note ?? "",
        l.hwid_lock ? "locked" : "open",
      ]),
    [licenses]
  );

  return (
    <>
      <div className="w-full space-y-4">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:gap-4">
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(true)}
              className="rounded-xl bg-gradient-to-r from-indigo-600 to-violet-500 px-5 py-2.5 text-sm font-semibold text-white inline-flex items-center gap-2 group shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all duration-300 hover:scale-[1.02] order-first"
            >
              <Plus className="h-4 w-4 group-hover:rotate-90 transition-transform duration-300" />
              Generate License
            </button>
            <ExportCsvButton
              filename={`licenses-${new Date().toISOString().slice(0, 10)}.csv`}
              headers={["License key", "Application", "Plan", "Status", "Expires", "Device limit", "Note", "HWID"]}
              rows={exportRows}
              label="Export"
            />
          </div>

          <div className="flex flex-1 flex-col sm:flex-row gap-2 min-w-0">
            <div className="relative flex-1 min-w-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search licenses by key or note..."
                className="w-full rounded-xl border border-zinc-700/50 bg-zinc-800/50 pl-10 pr-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-all"
              />
            </div>
            <div className="flex gap-2 shrink-0">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-xl border border-zinc-700/50 bg-zinc-800/50 px-4 py-2.5 text-sm text-zinc-300 cursor-pointer min-w-[8rem]"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="expired">Expired</option>
                <option value="revoked">Revoked</option>
              </select>
              <select
                value={planFilter}
                onChange={(e) => setPlanFilter(e.target.value)}
                className="rounded-xl border border-zinc-700/50 bg-zinc-800/50 px-4 py-2.5 text-sm text-zinc-300 cursor-pointer min-w-[8rem]"
              >
                <option value="all">All Plans</option>
                {[...new Set(licenses.map((l) => l.plan).filter(Boolean))].map((plan) => (
                  <option key={String(plan)} value={String(plan).toLowerCase()}>
                    {String(plan)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

      </div>

      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Generate New License"
        size="lg"
      >
        <CreateLicenseForm
          onClose={() => setIsCreateModalOpen(false)}
          onSuccess={handleCreateSuccess}
        />
      </Modal>
    </>
  );
}
