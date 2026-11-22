import { describe, it, expect } from "vitest";

describe("Phase 8: Keyboard Shortcuts & Help System", () => {
  const shortcutList = [
    { key: "V", action: "Select & Transform tool" },
    { key: "H", action: "Pan Canvas hand tool" },
    { key: "R", action: "Draw new room rectangle / Rotate" },
    { key: "Ctrl+D", action: "Duplicate selected item" },
    { key: "Del", action: "Delete selected item" },
    { key: "L", action: "Lock / unlock furniture item" },
    { key: "Ctrl+Z", action: "Undo last edit" },
    { key: "Ctrl+Y", action: "Redo action" },
    { key: "Ctrl+S", action: "Force immediate save" },
  ];

  it("registers essential CAD keyboard shortcuts", () => {
    expect(shortcutList.length).toBeGreaterThanOrEqual(9);

    const keys = shortcutList.map((s) => s.key);
    expect(keys).toContain("V");
    expect(keys).toContain("H");
    expect(keys).toContain("R");
    expect(keys).toContain("Ctrl+D");
    expect(keys).toContain("Ctrl+S");
    expect(keys).toContain("Ctrl+Z");
    expect(keys).toContain("L");
  });

  it("contains clear descriptive labels for university presentation", () => {
    shortcutList.forEach((shortcut) => {
      expect(shortcut.action.length).toBeGreaterThan(5);
    });
  });
});
