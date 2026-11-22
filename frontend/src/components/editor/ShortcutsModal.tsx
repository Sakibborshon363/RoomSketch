"use client";

import React from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import {
  Keyboard,
  MousePointer,
  RotateCw,
  Copy,
  Trash2,
  Lock,
  Move,
  Undo2,
  Save,
  Compass,
  Command,
} from "lucide-react";

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ShortcutsModal({ isOpen, onClose }: ShortcutsModalProps) {
  const shortcutGroups = [
    {
      title: "Tools & Navigation",
      icon: <MousePointer className="h-4 w-4 text-[#1E3A34]" />,
      items: [
        { keys: ["V"], label: "Select & Transform tool" },
        { keys: ["H"], label: "Pan Canvas hand tool" },
        { keys: ["R"], label: "Draw new room rectangle" },
        { keys: ["Scroll"], label: "Zoom in / Zoom out" },
        { keys: ["Drag"], label: "Pan infinite canvas" },
        { keys: ["Esc"], label: "Deselect active item" },
      ],
    },
    {
      title: "Object Manipulations",
      icon: <RotateCw className="h-4 w-4 text-[#1E3A34]" />,
      items: [
        { keys: ["Ctrl", "D"], label: "Duplicate selected item" },
        { keys: ["Del"], label: "Delete selected item" },
        { keys: ["R"], label: "Rotate selected item (45° / 90°)" },
        { keys: ["L"], label: "Lock / unlock furniture item" },
        { keys: ["↑", "↓", "←", "→"], label: "Nudge item by 20cm" },
        { keys: ["Shift", "Arrows"], label: "Micro-nudge by 5cm" },
      ],
    },
    {
      title: "History & Cloud Sync",
      icon: <Save className="h-4 w-4 text-[#1E3A34]" />,
      items: [
        { keys: ["Ctrl", "Z"], label: "Undo last edit" },
        { keys: ["Ctrl", "Y"], label: "Redo action" },
        { keys: ["Ctrl", "S"], label: "Force save layout to database" },
      ],
    },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Keyboard Shortcuts & Gestures"
      description="Accelerate your architectural CAD workflow with professional key bindings"
    >
      <div className="space-y-4 mt-2 max-h-[70vh] overflow-y-auto pr-1">
        {shortcutGroups.map((group) => (
          <div key={group.title} className="rounded-xl border border-stone-200/80 bg-[#FAF9F5] p-3 space-y-2">
            <div className="flex items-center gap-2 pb-1.5 border-b border-stone-200/60 font-bold text-xs text-stone-900">
              {group.icon}
              <span>{group.title}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-0.5">
              {group.items.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between gap-2 text-xs py-1">
                  <span className="text-stone-600 text-[11px] font-medium">{item.label}</span>
                  <div className="flex items-center gap-1 shrink-0">
                    {item.keys.map((k) => (
                      <kbd
                        key={k}
                        className="rounded-md border border-stone-300 bg-white px-2 py-0.5 text-[10px] font-bold font-mono text-stone-800 shadow-2xs"
                      >
                        {k}
                      </kbd>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        <div className="flex items-center justify-between pt-3 border-t border-stone-100">
          <div className="flex items-center gap-1.5 text-[11px] text-stone-500">
            <Command className="h-3.5 w-3.5 text-[#1E3A34]" />
            <span>On macOS, use Cmd ⌘ instead of Ctrl</span>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} className="h-8 text-xs font-bold">
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
}
