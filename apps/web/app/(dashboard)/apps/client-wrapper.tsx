"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { ExportCsvButton } from "@/components/ui/export-csv-button";
import { Modal } from "@/components/ui/modal";
import { CreateAppForm } from "@/components/forms/create-app-form";
import { CredentialsModal } from "@/components/modals/credentials-modal";

interface AppRecord {
  id: number | string;
  name: string;
  version: string;
  status: string;
  users: number;
}

export function AppsClientWrapper({ apps }: { apps: AppRecord[] }) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCredentialModalOpen, setIsCredentialModalOpen] = useState(false);
  const [selectedAppId, setSelectedAppId] = useState<string | null>(null);
  const router = useRouter();

  const handleCreateSuccess = () => {
    setIsCreateModalOpen(false);
    router.refresh();
  };

  const openCredentials = (appId: string | number) => {
    setSelectedAppId(String(appId));
    setIsCredentialModalOpen(true);
  };

  const exportRows = apps.map((a) => [a.id, a.name, a.version, a.status, a.users]);

  return (
    <>
      {/* Header Buttons */}
      <div className="flex items-center gap-3">
        <ExportCsvButton
          filename={`applications-${new Date().toISOString().slice(0, 10)}.csv`}
          headers={["ID", "Name", "Version", "Status", "Users"]}
          rows={exportRows}
          label="Export"
        />
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="rounded-xl bg-gradient-to-r from-indigo-600 to-violet-500 px-5 py-2.5 text-sm font-semibold text-white inline-flex items-center gap-2 group shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all duration-300 hover:scale-105"
        >
          <Plus className="h-4 w-4 group-hover:rotate-90 transition-transform duration-300" />
          Create New App
        </button>
      </div>

      {/* ✅ Pass openCredentials function to server table via data attribute */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
            window.__openCredentials = function(appId) {
              document.dispatchEvent(new CustomEvent('open-credentials', { detail: appId }));
            };
          `,
        }}
      />

      {/* Create App Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create New Application"
        size="md"
      >
        <CreateAppForm
          onClose={() => setIsCreateModalOpen(false)}
          onSuccess={handleCreateSuccess}
        />
      </Modal>

      {/* ✅ Credentials Modal */}
      <CredentialsModal
        isOpen={isCredentialModalOpen}
        onClose={() => {
          setIsCredentialModalOpen(false);
          setSelectedAppId(null);
        }}
        appId={selectedAppId || ""}
      />
    </>
  );
}