"use client";
import { useState, useEffect, use } from "react";
import Link from "next/link";
import { Package, User, Mail, Phone, MapPin, CreditCard, ArrowLeft, Check, X } from "lucide-react";

type OrderItem = {
    id: number;
    productName: string;
    price: number;
    quantity: number;
};

type Order = {
    id: number;
    status: string;
    items: OrderItem[];
    totalPrice: number;
    firstName: string | null;
    lastName: string | null;
    phone: string | null;
    email: string | null;
    deliveryAddress: string | null;
    city: string | null;
    governorate: string | null;
    country: string | null;
    createdAt: string;
    paymentStatus?: string | null;
    paymentMethod?: string | null;
};

const STATUS_CONFIG: Record<string, { label: string; style: string }> = {
    pending: { label: "Pending", style: "bg-amber-100 text-amber-700" },
    confirmed: { label: "Approved", style: "bg-blue-100 text-blue-700" },
    processing: { label: "Processing", style: "bg-violet-100 text-violet-700" },
    delivery: { label: "Shipping", style: "bg-cyan-100 text-cyan-700" },
    delivered: { label: "Completed", style: "bg-green-100 text-green-700" },
    rejected: { label: "Rejected", style: "bg-red-100 text-red-700" },
    cancelled: { label: "Cancelled", style: "bg-gray-100 text-gray-600" },
};

export default function OrderDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [order, setOrder] = useState<Order | null>(null);
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
    async function fetchOrder() {
        try {
        const response = await fetch(`http://localhost:3000/orders/${id}`, {
            credentials: "include",
        });

        if (!response.ok) throw new Error(`Error ${response.status}`);
        const data: Order = await response.json();
        setOrder(data);
        } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
        } finally {
        setLoading(false);
        }
    }
    fetchOrder();
    }, [id]);

    async function updateStatus(newStatus: string) {
    if (newStatus === "rejected" && !confirm("Reject this order?")) return;

    setProcessing(true);
    try {
        const response = await fetch(`http://localhost:3000/orders/${id}/status`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
        });

        if (!response.ok) throw new Error(`Error ${response.status}`);

        setOrder((prev) => (prev ? { ...prev, status: newStatus } : prev));
    } catch (err) {
        alert(err instanceof Error ? err.message : "Action failed");
    } finally {
        setProcessing(false);
    }
    }

    if (loading) {
    return <p className="text-center text-blue-900 font-fredoka py-20">Loading...</p>;
    }

    if (error || !order) {
    return <p className="text-center text-red-500 font-fredoka py-20">{error ?? "Order not found"}</p>;
    }

    const status = STATUS_CONFIG[order.status] ?? { label: order.status, style: "bg-gray-100 text-gray-600" };
    const customerName = [order.firstName, order.lastName].filter(Boolean).join(" ") || "—";
    const address =
    [order.deliveryAddress, order.city, order.governorate, order.country].filter(Boolean).join(", ") || "—";

    return (
    <main className="max-w-6xl mx-auto px-6 py-10 font-fredoka">
        <Link
        href="/Order"
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-blue-900 transition-colors mb-6"
        >
        <ArrowLeft className="w-4 h-4" />
        Back to orders
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
            <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-blue-900">#ORDER-{order.id}</h1>
            <span className={`text-xs font-bold px-3 py-1 rounded-full ${status.style}`}>
                {status.label}
            </span>
            </div>
            <p className="text-sm text-gray-500 mt-1">
            Placed on {new Date(order.createdAt).toLocaleString()}
            </p>
        </div>

        {order.status === "pending" && (
            <div className="flex gap-3">
            <button
                type="button"
                onClick={() => updateStatus("rejected")}
                disabled={processing}
                className="inline-flex items-center gap-2 border border-red-200 text-red-600 font-bold rounded-xl px-5 py-2.5
                            hover:bg-red-50 transition-colors disabled:opacity-50"
            >
                <X className="w-4 h-4" />
                Reject
            </button>
            <button
                type="button"
                onClick={() => updateStatus("confirmed")}
                disabled={processing}
                className="inline-flex items-center gap-2 bg-blue-900 text-white font-bold rounded-xl px-5 py-2.5
                            hover:bg-blue-800 hover:-translate-y-0.5 hover:shadow-lg transition-all disabled:opacity-50"
            >
                <Check className="w-4 h-4" />
                {processing ? "Saving..." : "Approve order"}
            </button>
            </div>
        )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-bold text-blue-900">Order items</h2>
            <span className="text-sm text-gray-500">{order.items.length} items</span>
            </div>

            <div className="divide-y divide-gray-100">
            {order.items.map((item) => (
                <div key={item.id} className="flex items-center gap-4 px-6 py-4">
                <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                    <Package className="w-5 h-5 text-blue-900" />
                </div>

                <div className="flex-1 min-w-0">
                    <p className="font-bold text-blue-900 truncate">{item.productName}</p>
                    <p className="text-sm text-gray-500">
                    {item.price.toLocaleString()} EGP × {item.quantity}
                    </p>
                </div>

                <p className="font-bold text-blue-900 whitespace-nowrap">
                  {(item.price * item.quantity).toLocaleString()} EGP
                </p>
                </div>
            ))}
            </div>

            <div className="bg-gray-50 border-t border-gray-200 px-6 py-4 flex flex-col gap-2">
            <div className="flex justify-between text-sm text-gray-500">
                <span>Subtotal</span>
                <span>{order.totalPrice.toLocaleString()} EGP</span>
            </div>
            <div className="flex justify-between text-sm text-gray-500">
                <span>Shipping</span>
                <span>Free</span>
            </div>
            <div className="flex justify-between text-xl font-bold text-blue-900 pt-3 mt-1 border-t border-gray-200">
                <span>Total</span>
                <span>{order.totalPrice.toLocaleString()} EGP</span>
            </div>
            </div>
        </div>

        <div className="flex flex-col gap-6">
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h2 className="text-blue-900 font-bold text-lg pb-4 mb-4 border-b border-gray-200">Customer</h2>
            <div className="flex flex-col gap-3 text-sm">
                <div className="flex items-center gap-3">
                <User className="text-gray-400 w-4 h-4 shrink-0" />
                <span className="text-gray-700">{customerName}</span>
                </div>
                <div className="flex items-center gap-3">
                <Phone className="text-gray-400 w-4 h-4 shrink-0" />
                <span className="text-gray-700">{order.phone ?? "—"}</span>
                </div>
                <div className="flex items-center gap-3">
                <Mail className="text-gray-400 w-4 h-4 shrink-0" />
                <span className="text-gray-700 break-all">{order.email ?? "—"}</span>
                </div>
            </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h2 className="text-blue-900 font-bold text-lg pb-4 mb-4 border-b border-gray-200">Delivery address</h2>
            <div className="flex items-start gap-3 text-sm">
                <MapPin className="text-gray-400 w-4 h-4 shrink-0 mt-0.5" />
                <span className="text-gray-700">{address}</span>
            </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h2 className="text-blue-900 font-bold text-lg pb-4 mb-4 border-b border-gray-200">Payment</h2>
            <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-3">
                <CreditCard className="text-gray-400 w-4 h-4 shrink-0" />
                <span className="text-gray-700 capitalize">{order.paymentMethod ?? "Cash on delivery"}</span>
                </div>
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-100 text-amber-700 capitalize">
                {order.paymentStatus ?? "unpaid"}
                </span>
            </div>
            </div>
        </div>
        </div>
    </main>
    );
}