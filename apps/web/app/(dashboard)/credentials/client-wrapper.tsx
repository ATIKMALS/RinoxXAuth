"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { GenerateApiKeyForm } from "@/components/forms/generate-api-key-form";
import { ExportCsvButton } from "@/components/ui/export-csv-button";
import type { ApiKeyRecord } from "@/lib/types";

export function CredentialsClientWrapper({ credentials }: { credentials: ApiKeyRecord[] }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();

  const handleSuccess = () => {
    router.refresh();
  };

  const exportRows = credentials.map((c) => [
    c.name,
    c.prefix,
    c.status,
    c.created_at,
    c.last_used ?? "",
    (c.permissions && c.permissions.join(";")) || "",
  ]);

  return (
    <>
      <div className="flex items-center gap-3">
        <ExportCsvButton
          filename={`api-credentials-${new Date().toISOString().slice(0, 10)}.csv`}
          headers={["Name", "Key prefix", "Status", "Created", "Last used", "Permissions"]}
          rows={exportRows}
          label="Export"
        />
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="rounded-xl bg-gradient-to-r from-indigo-600 to-violet-500 px-5 py-2.5 text-sm font-semibold text-white inline-flex items-center gap-2 group shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all duration-300 hover:scale-105"
        >
          <Plus className="h-4 w-4 group-hover:rotate-90 transition-transform duration-300" />
          Generate New Key
        </button>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Generate New API Key" size="lg">
        <GenerateApiKeyForm onClose={() => setIsModalOpen(false)} onSuccess={handleSuccess} />
      </Modal>
    </>
  );
}
