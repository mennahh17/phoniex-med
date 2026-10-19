"use client";
import { useEffect, useState } from "react";
import { Check, X, Package } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type ProductImage = {
    id: number;
    url: string;
};

type PendingRequest = {
    id: number;
    name: string;
    description: string | null;
    price: number;
    manufacturer: string | null;
    modelNumber: string | null;
    condition: string | null;
    manufactureYear: string | null;
    quantity: number | null;
    location: string | null;
    sellerName: string | null;
    sellerPhone: string | null;
    sellerEmail: string | null;
    sellerCompany: string | null;
    sellerMessage: string | null;
    images: ProductImage[];
    createdAt: string;
};

const API_URL = "http://localhost:3000";

export default function PendingRequests({
    limit,
    variant = "list",
}: {
    limit?: number;
    variant?: "list" | "grid";
}) {
    const [requests, setRequests] = useState<PendingRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [processingId, setProcessingId] = useState<number | null>(null);
    const router = useRouter();

    useEffect(() => {
    async function fetchRequests() {
        try {
        const response = await fetch(`${API_URL}/products/pending`, {
            credentials: "include",
        });

        if (!response.ok) throw new Error(`Error ${response.status}`);

        const data: PendingRequest[] = await response.json();
        setRequests(data);
        } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
        } finally {
        setLoading(false);
        }
    }
    fetchRequests();
    }, []);

        async function handleDecision(id: number, action: "approve" | "reject") {
    if (action === "reject" && !confirm("Reject this request?")) return;

    setProcessingId(id);
    try {
        const response = await fetch(`${API_URL}/products/${id}/${action}`, {
        method: "PATCH",
        credentials: "include",
        });

        if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.message || `Error ${response.status}`);
        }

        setRequests((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
        alert(err instanceof Error ? err.message : "Action failed");
    } finally {
        setProcessingId(null);
    }
    }

    const visibleRequests = limit ? requests.slice(0, limit) : requests;
    const isGrid = variant === "grid";

    return (
    <div className="max-w-7xl w-full mx-auto px-4 py-10 flex flex-col gap-6">
        {loading && <p className="text-blue-900 text-center">Loading...</p>}
        {error && <p className="text-red-500 text-center">{error}</p>}
        {!loading && !error && requests.length === 0 && (
        <div className="flex flex-col items-center text-blue-900 gap-3 mt-10">
            <Package className="w-12 h-12 opacity-50" />
            <p>No pending requests</p>
        </div>
        )}

        <div
        className={
            isGrid
            ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            : "flex flex-col gap-6"
        }
        >
        {visibleRequests.map((request) => {
            const image = request.images?.[0]?.url;
            const isProcessing = processingId === request.id;

            return (
            <div
                key={request.id}
                onClick={() => router.push(`/Order/${request.id}`)}
                className={`cursor-pointer bg-white rounded-2xl shadow-lg overflow-hidden flex transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${
                isGrid ? "flex-col" : "flex-col sm:flex-row"
                }`}
            >
                <div
                className={`bg-gray-100 flex items-center justify-center shrink-0 ${
                    isGrid ? "w-full h-48" : "sm:w-56 h-48 sm:h-auto"
                }`}
                >
                {image ? (
                    <img src={image} alt={request.name} className="w-full h-full object-cover" />
                ) : (
                    <span className="text-gray-400 text-sm">No image</span>
                )}
                </div>

                <div className="p-6 flex flex-col gap-3 flex-1">
                <div className="flex justify-between items-start gap-3">
                    <div>
                    <h3 className="text-blue-900 font-bold text-lg line-clamp-2">{request.name}</h3>
                    <p className="text-xs text-gray-500">
                        {[request.manufacturer, request.modelNumber].filter(Boolean).join(" · ") || "—"}
                    </p>
                    </div>
                    <span className="text-blue-900 font-bold whitespace-nowrap">
                    {request.price} EGP
                    </span>
                </div>

                <div className="flex gap-3 mt-auto pt-2">
                    <button
                    type="button"
                    onClick={(e) => {
                    e.stopPropagation();
                    handleDecision(request.id, "approve");
                    }}
                    disabled={isProcessing}
                    className="flex-1 flex items-center justify-center gap-2 bg-green-600 text-white font-semibold rounded-xl py-2 hover:bg-green-700 transition-colors disabled:opacity-50"
                    >

                        
                    <Check className="w-4 h-4" />
                    Approve
                    </button>
                    <button
                    type="button"
                    onClick={(e) => {
                    e.stopPropagation();
                    handleDecision(request.id, "reject");
                    }}
                    disabled={isProcessing}
                    className="flex-1 flex items-center justify-center gap-2 bg-red-50 text-red-600 font-semibold rounded-xl py-2 hover:bg-red-100 transition-colors disabled:opacity-50"
                    >
                    <X className="w-4 h-4" />
                    Reject
                    </button>
                </div>
                </div>
            </div>
            );
        })}
        </div>

        {limit && requests.length > limit && (
        <Link
            href="/Order?tab=Equipments"
            className="self-center text-blue-900 font-semibold border border-blue-900 rounded-2xl px-6 py-2 cursor-pointer
                        transition-all duration-200
                        hover:bg-blue-900 hover:text-white hover:-translate-y-1 hover:shadow-lg
                        active:translate-y-0 active:scale-95"
        >
            View all requests ({requests.length})
        </Link>
        )}
    </div>
    );
}