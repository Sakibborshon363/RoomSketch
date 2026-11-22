"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Project } from "@/types/project";

interface RenameProjectModalProps {
  isOpen: boolean;
  project: Project | null;
  onClose: () => void;
  onRename: (id: string, name: string, description: string, unitSystem: string) => Promise<void>;
}

export function RenameProjectModal({ isOpen, project, onClose, onRename }: RenameProjectModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (project) {
      setName(project.name);
      setDescription(project.description || "");
    }
  }, [project]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!project || !name.trim()) return;

    setIsLoading(true);
    try {
      await onRename(project.id, name.trim(), description.trim(), project.unitSystem);
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Rename Project" description="Update the project title and description">
      <form onSubmit={handleSubmit} className="space-y-4 mt-2">
        <Input
          id="renameProjectName"
          label="Project Title"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <Input
          id="renameProjectDesc"
          label="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Brief description of the floor plan"
        />
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-100">
          <Button type="button" variant="ghost" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isLoading} className="font-semibold shadow-sm">
            Save Changes
          </Button>
        </div>
      </form>
    </Modal>
  );
}
