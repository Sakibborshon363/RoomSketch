"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Project } from "@/types/project";
import { AlertTriangle } from "lucide-react";

interface DeleteProjectModalProps {
  isOpen: boolean;
  project: Project | null;
  onClose: () => void;
  onConfirm: (id: string) => Promise<void>;
}

export function DeleteProjectModal({ isOpen, project, onClose, onConfirm }: DeleteProjectModalProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleDelete = async () => {
    if (!project) return;
    setIsLoading(true);
    try {
      await onConfirm(project.id);
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Delete Project">
      <div className="space-y-4 mt-2">
        <div className="flex items-center gap-3 rounded-xl border border-rose-100 bg-rose-50/80 p-3.5 text-rose-800">
          <AlertTriangle className="h-6 w-6 text-rose-600 shrink-0" />
          <p className="text-xs leading-relaxed">
            Are you sure you want to permanently delete{" "}
            <span className="font-bold text-rose-950">&quot;{project?.name}&quot;</span>? This will remove all
            associated floor plans and furniture layouts. This action cannot be undone.
          </p>
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-100">
          <Button type="button" variant="ghost" onClick={onClose} disabled={isLoading}>
            Keep Project
          </Button>
          <Button
            type="button"
            variant="danger"
            onClick={handleDelete}
            isLoading={isLoading}
            className="font-semibold shadow-sm"
          >
            Delete Permanently
          </Button>
        </div>
      </div>
    </Modal>
  );
}
