"use client";
import { useState } from "react";
import { X } from "lucide-react";

const API_URL = "http://localhost:3000";

const REASONS = ["Restock", "Order fulfillment", "Stock correction", "Damaged", "Returned", "Other"];

type Action = "add" | "remove" | "set";

type StockProduct = {
    id: number;
    name: string;
    sku: string | null;
    quantity: number;
};

export default function StockModal<T extends StockProduct>({
    product,
    onClose,
    onSaved,
}: {
    product: T;
    onClose: () => void;
    onSaved: (updated: T) => void;
}) {
    const [action, setAction] = useState<Action>("add");
    const [amount, setAmount] = useState("");
    const [reason, setReason] = useState(REASONS[0]);
    const [note, setNote] = useState("");
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const n = Number(amount);
    const newQty =
        amount === "" ? product.quantity
        : action === "add" ? product.quantity + n
        : action === "remove" ? product.quantity - n
        : n;

    const invalid =
        amount === "" ||
        !Number.isInteger(n) ||
        n < 0 ||
        (action !== "set" && n === 0) ||
        newQty < 0 ||
        newQty === product.quantity ||
        (reason === "Other" && note.trim() === "");

    async function handleSubmit() {
        setSaving(true);
        setError(null);
        try {
            const res = await fetch(`${API_URL}/products/${product.id}/stock`, {
                method: "PATCH",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action, quantity: n, reason, note: note.trim() || undefined }),
            });
            if (!res.ok) {
                const body = await res.json().catch(() => null);
                throw new Error(body?.message ?? `Error ${res.status}`);
            }
            onSaved(await res.json());
        } catch (err) {
            setError(err instanceof Error ? err.message : "Update failed");
            setSaving(false);
        }
    }

    const actions: { key: Action; label: string }[] = [
        { key: "add", label: "Add stock" },
        { key: "remove", label: "Remove stock" },
        { key: "set", label: "Set exact" },
    ];

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50" onClick={onClose}>
            <div className="bg-white rounded-2xl w-full max-w-md p-6 font-fredoka" onClick={(e) => e.stopPropagation()}>

                <div className="flex justify-between items-start mb-5">
                    <div>
                        <h2 className="text-blue-900 font-bold text-xl">Update Stock</h2>
                        <p className="text-gray-500 text-sm">{product.name} · {product.sku ?? "No SKU"}</p>
                    </div>
                    <button type="button" onClick={onClose} className="p-1 text-gray-400 hover:text-gray-700 cursor-pointer">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <p className="text-sm text-gray-500 mb-2">Action</p>
                <div className="grid grid-cols-3 gap-2 mb-4">
                    {actions.map((a) => (
                        <button
                            key={a.key}
                            type="button"
                            onClick={() => setAction(a.key)}
                            className={`rounded-xl py-2 text-sm font-bold transition-colors cursor-pointer ${
                                action === a.key ? "bg-blue-900 text-white" : "bg-gray-100 text-blue-900 hover:bg-gray-200"
                            }`}
                        >
                            {a.label}
                        </button>
                    ))}
                </div>

                <label className="text-sm text-gray-500">{action === "set" ? "New quantity" : "Quantity"}</label>
                <input
                    type="number"
                    min={0}
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 mt-1 mb-4 focus:outline-none focus:border-blue-900"
                />

                <label className="text-sm text-gray-500">Reason</label>
                <select
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 mt-1 mb-4 bg-white cursor-pointer"
                >
                    {REASONS.map((r) => <option key={r}>{r}</option>)}
                </select>

                <label className="text-sm text-gray-500">
                    Notes {reason === "Other" && <span className="text-red-500">*</span>}
                </label>
                <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    rows={2}
                    className="w-full border border-gray-300 rounded-xl px-4 py-2.5 mt-1 mb-4 focus:outline-none focus:border-blue-900 resize-none"
                />

                <div className="rounded-xl bg-gray-50 p-4 flex justify-between items-center mb-4">
                    <div>
                        <p className="text-xs text-gray-500">Current</p>
                        <p className="text-blue-900 text-xl font-bold">{product.quantity}</p>
                    </div>
                    <span className="text-gray-400">→</span>
                    <div className="text-right">
                        <p className="text-xs text-gray-500">New</p>
                        <p className={`text-xl font-bold ${newQty < 0 ? "text-red-600" : "text-blue-900"}`}>{newQty}</p>
                    </div>
                </div>

                {error && <p className="text-red-600 text-sm mb-3">{error}</p>}

                <div className="flex gap-3">
                    <button type="button" onClick={onClose} className="flex-1 rounded-xl py-2.5 border border-gray-300 text-gray-600 hover:bg-gray-50 cursor-pointer">
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={invalid || saving}
                        className="flex-1 rounded-xl py-2.5 bg-blue-900 text-white font-bold hover:bg-blue-800 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                    >
                        {saving ? "Saving..." : "Confirm update"}
                    </button>
                </div>
            </div>
        </div>
    );
}