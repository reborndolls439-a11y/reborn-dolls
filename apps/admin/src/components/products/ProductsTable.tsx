"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Pencil, Trash2, AlertTriangle, CheckSquare, Square, Loader2 } from "lucide-react";
import { Badge } from "@reborn/ui";

interface Product {
  id: string;
  name: string;
  sku: string | null;
  price: number;
  stockQuantity: number;
  status: string;
  image: string | null;
  categoryName: string | null;
}

const statusVariant: Record<string, "success" | "warning" | "default"> = {
  PUBLISHED: "success",
  DRAFT: "warning",
  ARCHIVED: "default",
};

export function ProductsTable({ products }: { products: Product[] }) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [deleting, setDeleting] = useState<string | null>(null); // single product id being deleted
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [confirmBulk, setConfirmBulk] = useState(false);

  const allSelected = products.length > 0 && selected.size === products.length;
  const someSelected = selected.size > 0;

  const toggleAll = () => {
    if (allSelected) {
      setSelected(new Set());
    } else {
      setSelected(new Set(products.map((p) => p.id)));
    }
  };

  const toggleOne = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const deleteOne = async (id: string) => {
    setDeleting(id);
    try {
      const res = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
      if (res.ok) {
        startTransition(() => router.refresh());
      }
    } catch { /* ignore */ }
    finally { setDeleting(null); }
  };

  const bulkDelete = async () => {
    setBulkDeleting(true);
    try {
      const res = await fetch("/api/admin/products/bulk", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: Array.from(selected) }),
      });
      if (res.ok) {
        setSelected(new Set());
        setConfirmBulk(false);
        startTransition(() => router.refresh());
      }
    } catch { /* ignore */ }
    finally { setBulkDeleting(false); }
  };

  return (
    <>
      {/* Bulk action bar — appears when items are selected */}
      {someSelected && (
        <div className="flex items-center justify-between bg-bloom-rose-50 border border-bloom-rose-200 rounded-xl px-4 py-2.5 mb-3">
          <span className="text-sm font-medium text-charcoal font-body">
            {selected.size} product{selected.size !== 1 ? "s" : ""} selected
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelected(new Set())}
              className="text-xs text-taupe font-body hover:text-charcoal transition-colors"
            >
              Deselect all
            </button>
            {confirmBulk ? (
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-500" />
                <span className="text-xs text-red-600 font-body">Archive {selected.size} products?</span>
                <button
                  onClick={bulkDelete}
                  disabled={bulkDeleting}
                  className="flex items-center gap-1 text-xs font-semibold text-white bg-red-500 hover:bg-red-600 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                >
                  {bulkDeleting ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
                  Confirm
                </button>
                <button
                  onClick={() => setConfirmBulk(false)}
                  className="text-xs text-taupe font-body hover:text-charcoal transition-colors"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirmBulk(true)}
                className="flex items-center gap-1.5 text-xs font-semibold text-white bg-red-500 hover:bg-red-600 px-3 py-1.5 rounded-lg transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Archive selected
              </button>
            )}
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-2xl border border-charcoal-100 overflow-x-auto">
        <table className="w-full text-sm font-body min-w-[700px]">
          <thead>
            <tr className="bg-charcoal-50 border-b border-charcoal-100">
              {/* Select all */}
              <th className="px-4 py-3 w-10">
                <button onClick={toggleAll} aria-label="Select all" className="text-taupe hover:text-bloom-rose transition-colors">
                  {allSelected
                    ? <CheckSquare className="w-4 h-4 text-bloom-rose" />
                    : <Square className="w-4 h-4" />}
                </button>
              </th>
              {["Product", "SKU", "Price", "Stock", "Status", "Category", "Actions"].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-taupe uppercase tracking-wider">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-charcoal-50">
            {products.map((p) => {
              const isSelected = selected.has(p.id);
              const isDeleting = deleting === p.id;
              return (
                <tr
                  key={p.id}
                  className={`transition-colors ${isSelected ? "bg-bloom-rose-50/60" : "hover:bg-charcoal-50"}`}
                >
                  {/* Checkbox */}
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggleOne(p.id)}
                      aria-label={`Select ${p.name}`}
                      className="text-taupe hover:text-bloom-rose transition-colors"
                    >
                      {isSelected
                        ? <CheckSquare className="w-4 h-4 text-bloom-rose" />
                        : <Square className="w-4 h-4" />}
                    </button>
                  </td>

                  {/* Product */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl overflow-hidden bg-soft-blush-100 shrink-0">
                        {p.image && <img src={p.image} alt={p.name} className="w-full h-full object-cover" />}
                      </div>
                      <span className="font-medium text-charcoal line-clamp-1 max-w-[180px]">{p.name}</span>
                    </div>
                  </td>

                  <td className="px-4 py-3 text-taupe">{p.sku || "—"}</td>
                  <td className="px-4 py-3 font-semibold">£{p.price.toFixed(2)}</td>

                  {/* Stock */}
                  <td className="px-4 py-3">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                      p.stockQuantity === 0
                        ? "bg-red-100 text-red-600"
                        : p.stockQuantity <= 5
                          ? "bg-amber-100 text-amber-700"
                          : "bg-green-100 text-green-700"
                    }`}>
                      {p.stockQuantity}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="px-4 py-3">
                    <Badge variant={statusVariant[p.status] ?? "default"}>
                      {p.status.charAt(0) + p.status.slice(1).toLowerCase()}
                    </Badge>
                  </td>

                  <td className="px-4 py-3 text-taupe text-xs">{p.categoryName || "—"}</td>

                  {/* Actions */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/products/${p.id}/edit`}
                        className="p-1.5 rounded-lg text-taupe hover:text-bloom-rose hover:bg-bloom-rose-50 transition-colors"
                        aria-label="Edit product"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </Link>
                      <button
                        onClick={() => deleteOne(p.id)}
                        disabled={isDeleting}
                        className="p-1.5 rounded-lg text-taupe hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-40"
                        aria-label="Delete product"
                      >
                        {isDeleting
                          ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          : <Trash2 className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {products.length === 0 && (
              <tr>
                <td colSpan={8} className="px-5 py-12 text-center text-taupe">
                  No products found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
