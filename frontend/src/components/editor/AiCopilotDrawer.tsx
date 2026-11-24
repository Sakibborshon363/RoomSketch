"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { RoomItem, FurnitureItem, DoorWindowItem, UnitSystem } from "@/types/editor";
import {
  processCopilotUserInput,
  CopilotMessage,
  autoFixAllErgonomicIssues,
} from "@/lib/aiCopilotEngine";
import { runArchitecturalAudit } from "@/lib/aiArchitectEngine";
import {
  Sparkles,
  Send,
  X,
  Minimize2,
  Wand2,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Building,
  Layers,
  ArrowRight,
  Maximize2,
  Bot,
  User,
  Calculator,
} from "lucide-react";
import { Button } from "@/components/ui/Button";

interface AiCopilotDrawerProps {
  projectName: string;
  floorName: string;
  rooms: RoomItem[];
  doorsWindows: DoorWindowItem[];
  furniture: FurnitureItem[];
  unit: UnitSystem;
  onAddRooms?: (rooms: RoomItem[]) => void;
  onAddFurniture?: (items: FurnitureItem[]) => void;
  onUpdateFurnitureList?: (items: FurnitureItem[]) => void;
  onNotifySuccess?: (title: string, message: string) => void;
}

export function AiCopilotDrawer({
  projectName,
  floorName,
  rooms,
  doorsWindows,
  furniture,
  unit,
  onAddRooms,
  onAddFurniture,
  onUpdateFurnitureList,
  onNotifySuccess,
}: AiCopilotDrawerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Live compliance check for badge alert
  const auditReport = useMemo(() => {
    return runArchitecturalAudit(rooms, doorsWindows, furniture);
  }, [rooms, doorsWindows, furniture]);

  const totalWarnings = auditReport.criticalCount + auditReport.warningCount;

  // Initial welcome message
  const [messages, setMessages] = useState<CopilotMessage[]>([
    {
      id: "welcome-1",
      sender: "copilot",
      text: `Hello! I am your **RoomSketch AI Copilot**. I can talk with you, auto-furnish rooms, install lighting & engineering points, and **automatically resolve all doorway clearance and collision warnings**.\n\nWhat would you like to design today?`,
      timestamp: Date.now(),
    },
  ]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSendMessage = (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || isProcessing) return;

    const userMsg: CopilotMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: query,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsProcessing(true);

    setTimeout(() => {
      const result = processCopilotUserInput(query, {
        projectName,
        floorName,
        rooms,
        doorsWindows,
        furniture,
        unit,
      });

      // Apply actions to the real floor plan
      if (result.newRooms && onAddRooms) {
        onAddRooms(result.newRooms);
        onNotifySuccess?.("Room Created", `Added ${result.newRooms.length} room(s) to layout.`);
      }

      if (result.newFurniture && onAddFurniture) {
        onAddFurniture(result.newFurniture);
        onNotifySuccess?.("Auto-Furnish Applied", `Placed ${result.newFurniture.length} architectural items.`);
      }

      if (result.updatedFurniture && onUpdateFurnitureList) {
        onUpdateFurnitureList(result.updatedFurniture);
        onNotifySuccess?.("Warnings Resolved", "All ergonomic clearances updated automatically.");
      }

      const copilotMsg: CopilotMessage = {
        id: `copilot-${Date.now()}`,
        sender: "copilot",
        text: result.replyText,
        timestamp: Date.now(),
        actionTaken: result.actionTaken,
      };

      setMessages((prev) => [...prev, copilotMsg]);
      setIsProcessing(false);
    }, 400);
  };

  const handleQuickAction = (actionText: string) => {
    handleSendMessage(actionText);
  };

  return (
    <>
      {/* Floating Launcher Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-40 flex items-center gap-2.5 rounded-2xl bg-[#1E3A34] px-4 py-3 text-white shadow-xl hover:bg-[#254A42] hover:scale-105 transition-all duration-200 border border-emerald-400/30 group"
          title="Open RoomSketch AI Copilot"
        >
          <div className="relative flex items-center justify-center">
            <Sparkles className="h-5 w-5 text-emerald-300 animate-pulse" />
            <span className="absolute -top-1 -right-1 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
          </div>
          <span className="text-xs font-bold tracking-wide">AI Copilot</span>

          {totalWarnings > 0 && (
            <span className="rounded-full bg-amber-400 px-2 py-0.5 text-[10px] font-extrabold text-stone-900 shadow-xs">
              ⚠️ {totalWarnings} {totalWarnings === 1 ? "issue" : "issues"}
            </span>
          )}
        </button>
      )}

      {/* Expanded AI Copilot Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 flex h-[620px] w-[400px] max-w-[calc(100vw-2rem)] flex-col rounded-2xl border border-stone-200 bg-white/95 shadow-2xl backdrop-blur-md animate-in slide-in-from-bottom-5 duration-200 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-stone-100 bg-[#1E3A34] px-4 py-3 text-white">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/10 text-emerald-300">
                <Bot className="h-4 w-4" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-xs font-bold leading-none">RoomSketch AI Copilot</h3>
                  <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
                </div>
                <p className="text-[10px] text-stone-300 mt-0.5">
                  Live Architectural Agent • {floorName}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 text-stone-300">
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-lg p-1.5 hover:bg-white/10 hover:text-white transition-colors"
                title="Minimize Copilot"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Quick Action Suggestion Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto border-b border-stone-100 bg-stone-50/80 px-3 py-2 text-[11px] no-scrollbar">
            {totalWarnings > 0 && (
              <button
                onClick={() => handleQuickAction("Fix all warnings automatically")}
                className="inline-flex shrink-0 items-center gap-1 rounded-full bg-rose-100 text-rose-800 border border-rose-200 px-2.5 py-1 font-bold hover:bg-rose-200 transition-colors shadow-xs"
              >
                <Wand2 className="h-3 w-3 text-rose-600" />
                <span>Auto-Fix Warnings ({totalWarnings})</span>
              </button>
            )}

            <button
              onClick={() => handleQuickAction("Furnish living room in modern minimalist style")}
              className="inline-flex shrink-0 items-center gap-1 rounded-full bg-stone-100 text-stone-700 hover:bg-stone-200 px-2.5 py-1 font-medium transition-colors"
            >
              <span>🛋️ Furnish Living</span>
            </button>

            <button
              onClick={() => handleQuickAction("Furnish bedroom in Scandinavian style")}
              className="inline-flex shrink-0 items-center gap-1 rounded-full bg-stone-100 text-stone-700 hover:bg-stone-200 px-2.5 py-1 font-medium transition-colors"
            >
              <span>🛏️ Furnish Bedroom</span>
            </button>

            <button
              onClick={() => handleQuickAction("Add lighting and power sockets to all rooms")}
              className="inline-flex shrink-0 items-center gap-1 rounded-full bg-stone-100 text-stone-700 hover:bg-stone-200 px-2.5 py-1 font-medium transition-colors"
            >
              <span>💡 Add Lighting</span>
            </button>

            <button
              onClick={() => handleQuickAction("Show estimated construction cost BoQ")}
              className="inline-flex shrink-0 items-center gap-1 rounded-full bg-stone-100 text-stone-700 hover:bg-stone-200 px-2.5 py-1 font-medium transition-colors"
            >
              <span>📊 Estimate Cost</span>
            </button>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs text-stone-800">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${
                  msg.sender === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {msg.sender === "copilot" && (
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#1E3A34] text-emerald-300">
                    <Bot className="h-3.5 w-3.5" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed ${
                    msg.sender === "user"
                      ? "bg-[#1E3A34] text-white rounded-br-xs"
                      : "bg-stone-100/90 text-stone-800 border border-stone-200/60 rounded-bl-xs"
                  }`}
                >
                  <div className="whitespace-pre-line">{msg.text}</div>

                  {/* Action Execution Banner Card */}
                  {msg.actionTaken && (
                    <div className="mt-2.5 rounded-xl border border-emerald-200 bg-emerald-50/80 p-2.5 text-[11px] text-emerald-950 space-y-1">
                      <div className="flex items-center gap-1.5 font-bold text-emerald-900">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                        <span>{msg.actionTaken.title}</span>
                      </div>
                      <p className="text-emerald-800 text-[10px]">
                        {msg.actionTaken.description}
                      </p>
                      {msg.actionTaken.details && msg.actionTaken.details.length > 0 && (
                        <div className="pt-1 border-t border-emerald-200/60 text-[10px] text-emerald-900 space-y-0.5">
                          {msg.actionTaken.details.slice(0, 3).map((d, i) => (
                            <div key={i} className="flex items-center gap-1">
                              <span className="h-1 w-1 rounded-full bg-emerald-500"></span>
                              <span>{d}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {msg.sender === "user" && (
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-stone-200 text-stone-600">
                    <User className="h-3.5 w-3.5" />
                  </div>
                )}
              </div>
            ))}

            {isProcessing && (
              <div className="flex items-center gap-2 text-xs text-stone-500 italic py-1">
                <Sparkles className="h-3.5 w-3.5 text-purple-600 animate-spin" />
                <span>AI Copilot is optimizing layout...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Footer */}
          <div className="border-t border-stone-200/80 bg-white p-3">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask me to design, auto-furnish, or fix warnings..."
                className="flex-1 rounded-xl border border-stone-200 bg-stone-50 px-3.5 py-2.5 text-xs text-stone-900 placeholder:text-stone-400 focus:border-[#1E3A34] focus:bg-white focus:outline-none transition-colors"
              />
              <Button
                type="submit"
                size="sm"
                disabled={!input.trim() || isProcessing}
                className="h-9 w-9 p-0 rounded-xl bg-[#1E3A34] hover:bg-[#254A42] text-white shrink-0 disabled:opacity-40"
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
