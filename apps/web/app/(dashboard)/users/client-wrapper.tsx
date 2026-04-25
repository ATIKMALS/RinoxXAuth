"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { CreateUserForm } from "@/components/forms/create-user-form";

export function UsersClientWrapper() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();

  const handleSuccess = () => {
    router.refresh();
  };

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="rounded-xl bg-gradient-to-r from-indigo-600 to-violet-500 px-5 py-2.5 text-sm font-semibold text-white inline-flex items-center gap-2 group shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all duration-300 hover:scale-105"
      >
        <Plus className="h-4 w-4 group-hover:rotate-90 transition-transform duration-300" />
        Create User
      </button>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create New User"
        size="lg"
      >
        <CreateUserForm 
          onClose={() => setIsModalOpen(false)} 
          onSuccess={handleSuccess}
        />
      </Modal>
    </>
  );
}