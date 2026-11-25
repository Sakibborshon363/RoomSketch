
"use client";

import { useEffect, useMemo, useState } from "react";

type Material = {
  id: number;
  name: string;
  category: string;
  unit: string;
  defaultPrice: number;
  customPrice: number;
  quantity: number;
};

const initialMaterials: Material[] = [
  {
    id: 1,
    name: "Ceramic Tiles",
    category: "Flooring",
    unit: "sq.ft",
    defaultPrice: 85,
    customPrice: 85,
    quantity: 500,
  },
  {
    id: 2,
    name: "Marble Flooring",
    category: "Flooring",
    unit: "sq.ft",
    defaultPrice: 250,
    customPrice: 250,
    quantity: 200,
  },
  {
    id: 3,
    name: "Wall Paint",
    category: "Paint",
    unit: "liter",
    defaultPrice: 450,
    customPrice: 450,
    quantity: 20,
  },
  {
    id: 4,
    name: "Cement",
    category: "Construction",
    unit: "bag",
    defaultPrice: 550,
    customPrice: 550,
    quantity: 100,
  },
  {
    id: 5,
    name: "Wooden Flooring",
    category: "Flooring",
    unit: "sq.ft",
    defaultPrice: 180,
    customPrice: 180,
    quantity: 300,
  },
  {
    id: 6,
    name: "Wall Tiles",
    category: "Wall",
    unit: "sq.ft",
    defaultPrice: 110,
    customPrice: 110,
    quantity: 250,
  },
];

const currencySymbols: Record<string, string> = {
  BDT: "৳",
  USD: "$",
  EUR: "€",
};

export default function MaterialPriceManager() {
  const [materials, setMaterials] = useState<Material[]>(initialMaterials);
  const [currency, setCurrency] = useState("BDT");
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [mounted, setMounted] = useState(false);

  const [newMaterial, setNewMaterial] = useState({
    name: "",
    category: "Flooring",
    unit: "sq.ft",
    defaultPrice: "0",
    customPrice: "0",
    quantity: "1",
  });

  useEffect(() => {
    const saved = localStorage.getItem("roomsketch-material-prices");

    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setMaterials(parsed);
        }
      } catch {
        console.error("Could not load saved material prices.");
      }
    }

    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      localStorage.setItem(
        "roomsketch-material-prices",
        JSON.stringify(materials)
      );
    }
  }, [materials, mounted]);

  const symbol = currencySymbols[currency] || currency;

  const totals = useMemo(() => {
    return materials.reduce(
      (result, material) => {
        result.defaultTotal += material.defaultPrice * material.quantity;
        result.customTotal += material.customPrice * material.quantity;
        return result;
      },
      { defaultTotal: 0, customTotal: 0 }
    );
  }, [materials]);

  const difference = totals.defaultTotal - totals.customTotal;

  const filteredMaterials = materials.filter((material) => {
    const matchesSearch = material.name
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchesCategory =
      categoryFilter === "All" || material.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  const categories = [
    "All",
    ...Array.from(new Set(materials.map((item) => item.category))),
  ];

  const formatMoney = (amount: number) =>
    `${symbol}${amount.toLocaleString("en-US", {
      maximumFractionDigits: 2,
    })}`;

  const updateMaterial = (
    id: number,
    field: "customPrice" | "quantity",
    value: string
  ) => {
    const numberValue = Math.max(0, Number(value) || 0);

    setMaterials((previous) =>
      previous.map((material) =>
        material.id === id
          ? { ...material, [field]: numberValue }
          : material
      )
    );
  };

  const addMaterial = () => {
    if (!newMaterial.name.trim()) {
      alert("Please enter a material name.");
      return;
    }

    const defaultPrice = Math.max(0, Number(newMaterial.defaultPrice) || 0);
    const customPrice = Math.max(0, Number(newMaterial.customPrice) || 0);
    const quantity = Math.max(0, Number(newMaterial.quantity) || 0);

    const material: Material = {
      id: Date.now(),
      name: newMaterial.name.trim(),
      category: newMaterial.category,
      unit: newMaterial.unit.trim() || "unit",
      defaultPrice,
      customPrice,
      quantity,
    };

    setMaterials((previous) => [...previous, material]);

    setNewMaterial({
      name: "",
      category: "Flooring",
      unit: "sq.ft",
      defaultPrice: "0",
      customPrice: "0",
      quantity: "1",
    });
  };

  const removeMaterial = (id: number) => {
    setMaterials((previous) =>
      previous.filter((material) => material.id !== id)
    );
  };

  const resetMaterials = () => {
    if (confirm("Reset all materials to the original sample list?")) {
      setMaterials(initialMaterials);
      setSearch("");
      setCategoryFilter("All");
    }
  };

  const exportCSV = () => {
    const headers = [
      "Material",
      "Category",
      "Unit",
      "Quantity",
      "Default Price",
      "Custom Price",
      "Default Total",
      "Custom Total",
    ];

    const rows = materials.map((material) => [
      material.name,
      material.category,
      material.unit,
      material.quantity,
      material.defaultPrice,
      material.customPrice,
      material.defaultPrice * material.quantity,
      material.customPrice * material.quantity,
    ]);

    const csvContent = [headers, ...rows]
      .map((row) =>
        row
          .map((value) => `"${String(value).replace(/"/g, '""')}"`)
          .join(",")
      )
      .join("\n");

    const blob = new Blob(["\uFEFF" + csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "roomsketch-material-price-report.csv";
    link.click();

    URL.revokeObjectURL(url);
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-slate-500">Loading Material Price Manager...</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-800">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <header className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-blue-600">
              RoomSketch Tools
            </p>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              Material Price Manager
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Manage material prices, compare costs and estimate your budget.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <select
              value={currency}
              onChange={(event) => setCurrency(event.target.value)}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500"
            >
              <option value="BDT">BDT (৳)</option>
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
            </select>

            <button
              onClick={exportCSV}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Export CSV ↓
            </button>
          </div>
        </header>

        <section className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Total Materials</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">
              {materials.length}
            </p>
            <p className="mt-1 text-xs text-slate-400">Items in your list</p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Default Estimated Cost</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">
              {formatMoney(totals.defaultTotal)}
            </p>
            <p className="mt-1 text-xs text-slate-400">Based on default prices</p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Your Estimated Cost</p>
            <p className="mt-2 text-2xl font-bold text-blue-600">
              {formatMoney(totals.customTotal)}
            </p>
            <p className="mt-1 text-xs text-slate-400">Based on custom prices</p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">
              {difference >= 0 ? "Potential Savings" : "Additional Cost"}
            </p>
            <p
              className={`mt-2 text-2xl font-bold ${
                difference >= 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              {formatMoney(Math.abs(difference))}
            </p>
            <p className="mt-1 text-xs text-slate-400">
              Compared with default prices
            </p>
          </div>
        </section>

        <section className="mb-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-5">
            <h2 className="text-lg font-bold text-slate-900">
              Add New Material
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Add a material and set its estimated and local market prices.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <input
              value={newMaterial.name}
              onChange={(event) =>
                setNewMaterial({ ...newMaterial, name: event.target.value })
              }
              placeholder="Material name"
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
            />

            <select
              value={newMaterial.category}
              onChange={(event) =>
                setNewMaterial({ ...newMaterial, category: event.target.value })
              }
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
            >
              <option>Flooring</option>
              <option>Paint</option>
              <option>Wall</option>
              <option>Construction</option>
              <option>Wood</option>
              <option>Other</option>
            </select>

            <input
              value={newMaterial.unit}
              onChange={(event) =>
                setNewMaterial({ ...newMaterial, unit: event.target.value })
              }
              placeholder="Unit (e.g. sq.ft, bag)"
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
            />

            <input
              type="number"
              min="0"
              value={newMaterial.defaultPrice}
              onChange={(event) =>
                setNewMaterial({
                  ...newMaterial,
                  defaultPrice: event.target.value,
                })
              }
              placeholder="Default price"
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
            />

            <input
              type="number"
              min="0"
              value={newMaterial.customPrice}
              onChange={(event) =>
                setNewMaterial({
                  ...newMaterial,
                  customPrice: event.target.value,
                })
              }
              placeholder="Your market price"
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
            />

            <input
              type="number"
              min="0"
              value={newMaterial.quantity}
              onChange={(event) =>
                setNewMaterial({
                  ...newMaterial,
                  quantity: event.target.value,
                })
              }
              placeholder="Quantity"
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
            />
          </div>

          <button
            onClick={addMaterial}
            className="mt-4 rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-700"
          >
            + Add Material
          </button>
        </section>

        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col justify-between gap-4 border-b border-slate-200 p-5 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Material Price List
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Edit your prices and quantities to update the budget.
              </p>
            </div>

            <button
              onClick={resetMaterials}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50"
            >
              Reset Sample Data
            </button>
          </div>

          <div className="flex flex-col gap-3 border-b border-slate-200 p-4 sm:flex-row">
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search materials..."
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 sm:max-w-xs"
            />

            <select
              value={categoryFilter}
              onChange={(event) => setCategoryFilter(event.target.value)}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-5 py-4">Material</th>
                  <th className="px-5 py-4">Category</th>
                  <th className="px-5 py-4">Default Price</th>
                  <th className="px-5 py-4">Custom Price</th>
                  <th className="px-5 py-4">Quantity</th>
                  <th className="px-5 py-4">Custom Total</th>
                  <th className="px-5 py-4">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filteredMaterials.map((material) => (
                  <tr key={material.id} className="hover:bg-slate-50">
                    <td className="px-5 py-4 font-semibold text-slate-800">
                      {material.name}
                      <p className="mt-1 text-xs font-normal text-slate-400">
                        Per {material.unit}
                      </p>
                    </td>

                    <td className="px-5 py-4 text-slate-500">
                      {material.category}
                    </td>

                    <td className="px-5 py-4 text-slate-600">
                      {formatMoney(material.defaultPrice)}
                    </td>

                    <td className="px-5 py-4">
                      <input
                        type="number"
                        min="0"
                        value={material.customPrice}
                        onChange={(event) =>
                          updateMaterial(
                            material.id,
                            "customPrice",
                            event.target.value
                          )
                        }
                        className="w-28 rounded-md border border-slate-300 px-2 py-1.5 outline-none focus:border-blue-500"
                      />
                    </td>

                    <td className="px-5 py-4">
                      <input
                        type="number"
                        min="0"
                        value={material.quantity}
                        onChange={(event) =>
                          updateMaterial(
                            material.id,
                            "quantity",
                            event.target.value
                          )
                        }
                        className="w-24 rounded-md border border-slate-300 px-2 py-1.5 outline-none focus:border-blue-500"
                      />
                    </td>

                    <td className="px-5 py-4 font-semibold text-blue-600">
                      {formatMoney(material.customPrice * material.quantity)}
                    </td>

                    <td className="px-5 py-4">
                      <button
                        onClick={() => removeMaterial(material.id)}
                        className="text-sm font-medium text-red-500 hover:text-red-700"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}

                {filteredMaterials.length === 0 && (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-5 py-10 text-center text-slate-500"
                    >
                      No materials found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col justify-between gap-2 border-t border-slate-200 bg-slate-50 p-5 sm:flex-row sm:items-center">
            <p className="text-sm text-slate-500">
              Showing {filteredMaterials.length} of {materials.length} materials
            </p>
            <p className="text-lg font-bold text-slate-900">
              Estimated Total:{" "}
              <span className="text-blue-600">
                {formatMoney(totals.customTotal)}
              </span>
            </p>
          </div>
        </section>

        <footer className="mt-5 text-center text-xs text-slate-400">
          Material Price Manager · RoomSketch · Prices are user-entered estimates
        </footer>
      </div>
    </main>
  );
}
