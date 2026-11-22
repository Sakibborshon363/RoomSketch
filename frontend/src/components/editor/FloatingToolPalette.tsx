"use client";

import React from "react";
import { useEditorStore } from "@/store/editorStore";
import {
  MousePointer2,
  Square,
  PenTool,
  DoorOpen,
  AppWindow,
  Ruler,
  Hand,
  Undo2,
  Redo2,
} from "lucide-react";

export function FloatingToolPalette() {
  const { activeTool, setActiveTool, undo, redo, history } = useEditorStore();

  const tools = [
    { id: "select", label: "Select (V)", icon: MousePointer2 },
    { id: "draw_room", label: "Draw Room (R)", icon: Square },
    { id: "wall", label: "Wall (W)", icon: PenTool },
    { id: "door", label: "Door (D)", icon: DoorOpen },
    { id: "window", label: "Window", icon: AppWindow },
    { id: "measure", label: "Tape Measure", icon: Ruler },
    { id: "pan", label: "Pan Canvas (H)", icon: Hand },
  ] as const;

  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1 rounded-2xl border border-stone-200/90 bg-white/95 p-1.5 shadow-lg backdrop-blur-md select-none">
      {tools.map((tool) => {
        const Icon = tool.icon;
        const isActive = activeTool === tool.id;
        return (
          <button
            key={tool.id}
            onClick={() => {
              if (tool.id === "door") {
                useEditorStore.getState().addDoorWindow({ type: "DOOR", name: "Standard Interior Door" });
                setActiveTool("select");
              } else if (tool.id === "window") {
                useEditorStore.getState().addDoorWindow({ type: "WINDOW", name: "Casement Window" });
                setActiveTool("select");
              } else {
                setActiveTool(tool.id);
              }
            }}
            className={`flex h-9 w-9 items-center justify-center rounded-xl transition-all ${
              isActive
                ? "bg-[#1E3A34] text-white shadow-sm"
                : "text-stone-600 hover:bg-stone-100 hover:text-stone-900"
            }`}
            title={tool.label}
          >
            <Icon className="h-4 w-4" />
          </button>
        );
      })}

      <div className="mx-1 h-5 w-px bg-stone-200" />

      <button
        onClick={undo}
        disabled={history.past.length === 0}
        className="flex h-9 w-9 items-center justify-center rounded-xl text-stone-600 hover:bg-stone-100 disabled:opacity-30 disabled:pointer-events-none transition-colors"
        title="Undo"
      >
        <Undo2 className="h-4 w-4" />
      </button>

      <button
        onClick={redo}
        disabled={history.future.length === 0}
        className="flex h-9 w-9 items-center justify-center rounded-xl text-stone-600 hover:bg-stone-100 disabled:opacity-30 disabled:pointer-events-none transition-colors"
        title="Redo"
      >
        <Redo2 className="h-4 w-4" />
      </button>
    </div>
  );
}
