"use client";

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useParams, useRouter } from "next/navigation";
import { useEditorStore } from "@/store/editorStore";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { EditorToolbar } from "@/components/editor/EditorToolbar";
import { EditorSidebar } from "@/components/editor/EditorSidebar";
import { PropertiesPanel } from "@/components/editor/PropertiesPanel";
import { EditorStatusBar } from "@/components/editor/EditorStatusBar";
import { FloatingToolPalette } from "@/components/editor/FloatingToolPalette";
import { useToast } from "@/components/ui/Toast";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { ShortcutsModal } from "@/components/editor/ShortcutsModal";
import { BoQModal } from "@/components/editor/BoQModal";
import { Loader2, Download, Share2, Copy, Check, ExternalLink, ShieldAlert, Sparkles } from "lucide-react";
import { api } from "@/lib/api";
import { exportToHighResPng, exportToArchitecturalPdf } from "@/lib/exportEngine";

// Dynamically import EditorCanvas with SSR disabled
const EditorCanvas = dynamic(
  () => import("@/components/editor/EditorCanvas"),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full items-center justify-center bg-[#FBFBFA]">
        <div className="flex flex-col items-center gap-2 text-stone-500">
          <Loader2 className="h-8 w-8 animate-spin text-[#1E3A34]" />
          <p className="text-xs font-semibold">Initializing 2D Design Canvas...</p>
        </div>
      </div>
    ),
  }
);

export default function EditorPage() {
  const params = useParams();
  const projectId = params?.projectId as string;
  const router = useRouter();
  const {
    loadProjectAndFloor,
    projectName,
    floorName,
    rooms,
    doorsWindows,
    furniture,
    unit,
    saveCurrentLayout,
  } = useEditorStore();
  const { success, error: toastError } = useToast();

  const [isLoading, setIsLoading] = useState(true);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [shareToken, setShareToken] = useState<string | null>(null);
  const [shareLoading, setShareLoading] = useState(false);
  const [isShareActive, setIsShareActive] = useState(true);
  const [shortcutsModalOpen, setShortcutsModalOpen] = useState(false);
  const [boqModalOpen, setBoqModalOpen] = useState(false);

  useEffect(() => {
    if (projectId) {
      loadProjectAndFloor(projectId).finally(() => setIsLoading(false));
    }
  }, [projectId, loadProjectAndFloor]);

  // Guard against navigating away with unsaved changes (Phase 6)
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      const { saveStatus } = useEditorStore.getState();
      if (saveStatus === "unsaved" || saveStatus === "saving") {
        e.preventDefault();
        e.returnValue = "You have unsaved floor plan changes.";
        return "You have unsaved floor plan changes.";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  // Keyboard shortcuts (Ctrl+Z: Undo, Ctrl+Y: Redo, Ctrl+S: Save, Escape: Deselect)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if user is typing in an input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") {
        e.preventDefault();
        if (e.shiftKey) {
          useEditorStore.getState().redo();
        } else {
          useEditorStore.getState().undo();
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "y") {
        e.preventDefault();
        useEditorStore.getState().redo();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        saveCurrentLayout().then(() => success("Layout saved", "Floor plan synchronized to PostgreSQL."));
      } else if (e.key === "Escape") {
        useEditorStore.getState().setSelection(null, null);
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "d") {
        // Duplicate selected item
        const { selectedId, selectedType, duplicateFurniture, duplicateRoom, duplicateDoorWindow } = useEditorStore.getState();
        if (selectedId) {
          e.preventDefault();
          if (selectedType === "furniture") duplicateFurniture(selectedId);
          else if (selectedType === "room") duplicateRoom(selectedId);
          else if (selectedType === "door_window") duplicateDoorWindow(selectedId);
        }
      } else if (e.key === "Delete" || e.key === "Backspace") {
        // Delete selected item
        const { selectedId, selectedType, deleteFurniture, deleteRoom, deleteDoorWindow } = useEditorStore.getState();
        if (selectedId) {
          e.preventDefault();
          if (selectedType === "furniture") deleteFurniture(selectedId);
          else if (selectedType === "room") deleteRoom(selectedId);
          else if (selectedType === "door_window") deleteDoorWindow(selectedId);
        }
      } else if (e.key.toLowerCase() === "l") {
        // Toggle Lock
        const { selectedId, selectedType, toggleFurnitureLock } = useEditorStore.getState();
        if (selectedId && selectedType === "furniture") {
          e.preventDefault();
          toggleFurnitureLock(selectedId);
        }
      } else if (e.key.toLowerCase() === "r") {
        const { selectedId, selectedType, rotateFurniture, rotateDoorWindow, setActiveTool } = useEditorStore.getState();
        if (selectedId && selectedType === "furniture") {
          e.preventDefault();
          rotateFurniture(selectedId, 45);
        } else if (selectedId && selectedType === "door_window") {
          e.preventDefault();
          rotateDoorWindow(selectedId, 90);
        } else {
          setActiveTool("draw_room");
        }
      } else if (["arrowup", "arrowdown", "arrowleft", "arrowright"].includes(e.key.toLowerCase())) {
        const { selectedId, selectedType, furniture, doorsWindows, updateFurniture, updateDoorWindow } = useEditorStore.getState();
        if (selectedId && selectedType === "furniture") {
          const item = furniture.find((f) => f.id === selectedId);
          if (item && !item.isLocked) {
            e.preventDefault();
            const step = e.shiftKey ? 5 : 20;
            let dx = 0;
            let dy = 0;
            if (e.key === "ArrowUp") dy = -step;
            else if (e.key === "ArrowDown") dy = step;
            else if (e.key === "ArrowLeft") dx = -step;
            else if (e.key === "ArrowRight") dx = step;
            updateFurniture(selectedId, { x: item.x + dx, y: item.y + dy });
          }
        } else if (selectedId && selectedType === "door_window") {
          const item = doorsWindows.find((dw) => dw.id === selectedId);
          if (item) {
            e.preventDefault();
            const step = e.shiftKey ? 5 : 20;
            let dx = 0;
            let dy = 0;
            if (e.key === "ArrowUp") dy = -step;
            else if (e.key === "ArrowDown") dy = step;
            else if (e.key === "ArrowLeft") dx = -step;
            else if (e.key === "ArrowRight") dx = step;
            updateDoorWindow(selectedId, { x: item.x + dx, y: item.y + dy });
          }
        }
      } else if (e.key.toLowerCase() === "v") {
        useEditorStore.getState().setActiveTool("select");
      } else if (e.key.toLowerCase() === "h") {
        useEditorStore.getState().setActiveTool("pan");
      } else if (e.key === "?" || e.key === "F1") {
        e.preventDefault();
        setShortcutsModalOpen(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [saveCurrentLayout, success]);

  const handleExportPng = async () => {
    const { projectName, floorName, unit, rooms, furniture, doorsWindows } = useEditorStore.getState();
    let stage: any = null;
    if (typeof window !== "undefined") {
      const KonvaModule = await import("konva");
      stage = KonvaModule.default?.stages?.[0] || null;
    }
    const ok = await exportToHighResPng({
      stage,
      projectName,
      floorName,
      unit,
      rooms,
      furniture,
      doorsWindows,
    });
    if (ok) {
      success("Exported High-Res PNG", "Architectural 2D drawing saved as image.");
    } else {
      toastError("Export failed", "Could not capture canvas buffer.");
    }
  };

  const handleExportPdf = async () => {
    const { projectName, floorName, unit, rooms, furniture, doorsWindows } = useEditorStore.getState();
    let stage: any = null;
    if (typeof window !== "undefined") {
      const KonvaModule = await import("konva");
      stage = KonvaModule.default?.stages?.[0] || null;
    }
    const ok = await exportToArchitecturalPdf({
      stage,
      projectName,
      floorName,
      unit,
      rooms,
      furniture,
      doorsWindows,
    });
    if (ok) {
      success("Generated Architectural PDF", "A4 presentation sheet downloaded.");
    } else {
      toastError("Export failed", "Could not generate PDF sheet.");
    }
  };

  const handleOpenShare = async () => {
    setShareModalOpen(true);
    setShareLoading(true);
    try {
      const res = await api.post(`/projects/${projectId}/share`);
      if (res.data?.success) {
        setShareToken(res.data.data.shareToken);
        setIsShareActive(res.data.data.isActive ?? true);
      }
    } catch (err) {
      console.error("Failed to fetch share link", err);
    } finally {
      setShareLoading(false);
    }
  };

  const handleRevokeShare = async () => {
    try {
      await api.delete(`/projects/${projectId}/share`);
      setIsShareActive(false);
      success("Link Revoked", "Public access to this floor plan has been disabled.");
    } catch (err) {
      toastError("Revoke failed", "Could not revoke share link.");
    }
  };

  const handleReactivateShare = async () => {
    await handleOpenShare();
    success("Link Re-activated", "Public link is now active.");
  };

  const handleCopyShareLink = () => {
    if (typeof window !== "undefined" && shareToken) {
      const url = `${window.location.origin}/shared/${shareToken}`;
      navigator.clipboard.writeText(url);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 3000);
      success("Link copied", "Read-only share link copied to clipboard.");
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FBFBFA]">
        <div className="flex flex-col items-center gap-3 text-stone-500">
          <Loader2 className="h-8 w-8 animate-spin text-[#1E3A34]" />
          <p className="text-sm font-bold">Loading Floor Plan Project...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthGuard>
      <div className="flex h-screen w-screen flex-col overflow-hidden bg-[#FBFBFA] text-stone-900 selection:bg-[#1E3A34] selection:text-white">
        {/* Top Navigation Toolbar */}
        <EditorToolbar
          onExportPng={handleExportPng}
          onExportPdf={handleExportPdf}
          onShare={handleOpenShare}
          onOpenShortcuts={() => setShortcutsModalOpen(true)}
          onOpenBoQ={() => setBoqModalOpen(true)}
        />

        {/* Center Workspace Layout */}
        <div className="relative flex flex-1 overflow-hidden">
          {/* Left Tool Sidebar (Rail + Drawer) */}
          <EditorSidebar />

          {/* Center Interactive 2D Canvas */}
          <main className="relative flex-1 h-full overflow-hidden">
            {/* Floating Top Tool Palette */}
            <FloatingToolPalette />

            {/* Konva HTML5 2D Canvas */}
            <EditorCanvas />
          </main>

          {/* Right Properties Panel / Plan Overview */}
          <PropertiesPanel />
        </div>

        {/* Bottom Status Bar */}
        <EditorStatusBar />

        {/* Share Modal (Phase 7) */}
        <Modal
          isOpen={shareModalOpen}
          onClose={() => setShareModalOpen(false)}
          title="Share Floor Plan"
          description="Generate a public read-only link for clients and visitors"
        >
          <div className="space-y-4 mt-2">
            <p className="text-xs text-stone-600">
              Anyone with this link can view the floor plan and measurements in real-time without signing in or editing your design.
            </p>

            {shareLoading ? (
              <div className="flex items-center justify-center py-6 text-stone-400 gap-2">
                <Loader2 className="h-5 w-5 animate-spin text-[#1E3A34]" />
                <span className="text-xs font-semibold">Generating secure public share link...</span>
              </div>
            ) : shareToken ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={typeof window !== "undefined" ? `${window.location.origin}/shared/${shareToken}` : ""}
                    className={`w-full rounded-xl border px-3 py-2 text-xs font-mono ${
                      isShareActive
                        ? "border-stone-200 bg-stone-50 text-stone-800"
                        : "border-rose-200 bg-rose-50/50 text-rose-500 line-through"
                    }`}
                  />
                  <Button
                    size="sm"
                    disabled={!isShareActive}
                    onClick={handleCopyShareLink}
                    className="shrink-0 gap-1.5 font-bold h-9 bg-[#1E3A34] hover:bg-[#254A42] text-white"
                  >
                    {copiedLink ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                    {copiedLink ? "Copied" : "Copy"}
                  </Button>
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  {isShareActive ? (
                    <a
                      href={typeof window !== "undefined" ? `/shared/${shareToken}` : "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-xs font-bold text-[#1E3A34] hover:underline"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      <span>Preview Shared Viewer</span>
                    </a>
                  ) : (
                    <span className="text-xs font-semibold text-rose-600">
                      Link is currently deactivated
                    </span>
                  )}

                  {isShareActive ? (
                    <button
                      onClick={handleRevokeShare}
                      className="text-xs font-bold text-rose-600 hover:text-rose-700 hover:underline"
                    >
                      Revoke Public Link
                    </button>
                  ) : (
                    <button
                      onClick={handleReactivateShare}
                      className="text-xs font-bold text-[#1E3A34] hover:underline"
                    >
                      Re-enable Link
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-xs text-rose-500">Could not generate share link. Please try again.</div>
            )}

            <div className="flex justify-end pt-2 border-t border-stone-100">
              <Button variant="ghost" size="sm" onClick={() => setShareModalOpen(false)}>
                Done
              </Button>
            </div>
          </div>
        </Modal>

        {/* Keyboard Shortcuts Modal (Phase 8) */}
        <ShortcutsModal
          isOpen={shortcutsModalOpen}
          onClose={() => setShortcutsModalOpen(false)}
        />

        {/* Architectural Cost Estimator & BoQ Modal */}
        <BoQModal
          isOpen={boqModalOpen}
          onClose={() => setBoqModalOpen(false)}
          projectName={projectName}
          floorName={floorName}
          rooms={rooms}
          doorsWindows={doorsWindows}
          furniture={furniture}
          unit={unit}
        />
      </div>
    </AuthGuard>
  );
}
