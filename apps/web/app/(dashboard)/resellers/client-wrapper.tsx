"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { AddResellerForm } from "@/components/forms/add-reseller-form";
import { ExportCsvButton } from "@/components/ui/export-csv-button";

interface ResellerRecord {
  id: number;
  username: string;
  email?: string;
  credits: number;
  users_created: number;
  status: string;
  commission_rate?: number;
  phone?: string;
}

export function ResellersClientWrapper({ resellers }: { resellers: ResellerRecord[] }) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const router = useRouter();

  const handleAddSuccess = () => {
    router.refresh();
  };

  const exportRows = resellers.map((r) => [
    r.username,
    r.email ?? "",
    r.credits,
    r.commission_rate ?? "",
    r.users_created ?? 0,
    r.status,
    r.phone ?? "",
  ]);

  return (
    <>
      <div className="flex items-center gap-3">
        <ExportCsvButton
          filename={`resellers-${new Date().toISOString().slice(0, 10)}.csv`}
          headers={["Username", "Email", "Credits", "Commission %", "Users created", "Status", "Phone"]}
          rows={exportRows}
          label="Export"
        />
        <button
          type="button"
          onClick={() => setIsAddModalOpen(true)}
          className="rounded-xl bg-gradient-to-r from-indigo-600 to-violet-500 px-5 py-2.5 text-sm font-semibold text-white inline-flex items-center gap-2 group shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all duration-300 hover:scale-105"
        >
          <Plus className="h-4 w-4 group-hover:rotate-90 transition-transform duration-300" />
          Add Reseller
        </button>
      </div>

      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Add New Reseller" size="lg">
        <AddResellerForm onClose={() => setIsAddModalOpen(false)} onSuccess={handleAddSuccess} />
      </Modal>
    </>
  );
}
