import { describe, it, expect, beforeEach } from "vitest";
import { useProjectStore } from "../src/store/projectStore";

describe("useProjectStore state management", () => {
  beforeEach(() => {
    useProjectStore.setState({
      projects: [],
      stats: null,
      isLoading: false,
      searchQuery: "",
      sortBy: "updatedAt_desc",
      filterCategory: "ALL",
      selectedUnit: "METERS",
    });
  });

  it("updates search query filter", () => {
    useProjectStore.getState().setSearchQuery("apartment");
    expect(useProjectStore.getState().searchQuery).toBe("apartment");
  });

  it("updates sort option", () => {
    useProjectStore.getState().setSortBy("name_asc");
    expect(useProjectStore.getState().sortBy).toBe("name_asc");
  });

  it("updates filter category", () => {
    useProjectStore.getState().setFilterCategory("APARTMENTS");
    expect(useProjectStore.getState().filterCategory).toBe("APARTMENTS");

    useProjectStore.getState().setFilterCategory("STUDIOS");
    expect(useProjectStore.getState().filterCategory).toBe("STUDIOS");
  });

  it("updates selected measurement unit", () => {
    useProjectStore.getState().setSelectedUnit("FEET");
    expect(useProjectStore.getState().selectedUnit).toBe("FEET");
  });
});
