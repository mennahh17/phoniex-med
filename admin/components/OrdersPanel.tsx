"use client";
import { useState, useEffect } from "react";
import { ArrowRight, Search, ShoppingCart } from "lucide-react";
import Link from "next/link";

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
    createdAt: string;
    paymentStatus?: string | null;
    paymentMethod?: string | null;
};

const STAT_CARDS = [
    { key: "all", label: "All Orders" },
    { key: "pending", label: "Pending" },
    { key: "confirmed", label: "Approved" },
    { key: "processing", label: "Processing" },
    { key: "delivered", label: "Completed" },
    { key: "rejected", label: "Rejected" },
    { key: "cancelled", label: "Cancelled" },
];

const STATUS_CONFIG: Record<string, { label: string; style: string }> = {
    pending: { label: "Pending", style: "bg-amber-100 text-amber-700" },
    confirmed: { label: "Approved", style: "bg-blue-100 text-blue-700" },
    processing: { label: "Processing", style: "bg-violet-100 text-violet-700" },
    delivery: { label: "Shipping", style: "bg-cyan-100 text-cyan-700" },
    delivered: { label: "Completed", style: "bg-green-100 text-green-700" },
    rejected: { label: "Rejected", style: "bg-red-100 text-red-700" },
    cancelled: { label: "Cancelled", style: "bg-gray-100 text-gray-600" },
};

const PAYMENT_STYLE: Record<string, string> = {
    paid: "bg-green-100 text-green-700",
    unpaid: "bg-amber-100 text-amber-700",
    refunded: "bg-gray-100 text-gray-600",
};

export default function OrdersPanel() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState("all");
    const [search, setSearch] = useState("");

    useEffect(() => {
    async function fetchOrders() {
        try {
        const response = await fetch("http://localhost:3000/orders/all", {
            credentials: "include",
        });

        if (!response.ok) throw new Error(`Error ${response.status}`);

        const data: Order[] = await response.json();
        setOrders(data);
        } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
        } finally {
        setLoading(false);
        }
    }
    fetchOrders();
    }, []);

    const term = search.trim().toLowerCase();

    const filteredOrders = orders.filter((order) => {
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;

    const customer = `${order.firstName ?? ""} ${order.lastName ?? ""}`.toLowerCase();
    const matchesSearch =
        term === "" ||
        customer.includes(term) ||
        String(order.id).includes(term) ||
        `ord-${order.id}`.includes(term);

    return matchesStatus && matchesSearch;
    });

    return (
    <div>
        <h1 className="text-blue-900 font-fredoka font-bold text-2xl mt-10">Orders</h1>
        <div className="text-gray-900/50 font-fredoka text-sm">Track, review, and manage customer orders</div>

        <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-7 gap-3 p-5">
        {STAT_CARDS.map((card) => {
            const active = statusFilter === card.key;
            const count =
            card.key === "all"
                ? orders.length
                : orders.filter((order) => order.status === card.key).length;

            return (
            <button
                key={card.key}
                type="button"
                onClick={() => setStatusFilter(card.key)}
                className={`text-left rounded-2xl p-4 border transition-all hover:-translate-y-0.5 hover:shadow-2xl ${
                active ? "bg-blue-900 border-gray-300 text-white" : "bg-gray-200 border-blue-900 text-blue-900"
                }`}
            >
                <p className={`font-fredoka font-bold text-sm ${active ? "text-white" : "text-blue-900"}`}>
                {card.label}
                </p>
                <p className="font-fredoka text-2xl font-bold mt-1">{count}</p>
            </button>
            );
        })}
        </div>

        <div className="relative mx-5 mb-4">
        <Search className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
        <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by order ID, customer name..."
            className="w-full bg-white border border-gray-300 rounded-2xl pl-11 pr-4 py-3 text-sm text-gray-900 font-fredoka
                        focus:outline-none focus:border-blue-900"
        />
        </div>

        <div className="bg-white rounded-2xl p-4 overflow-hidden border border-blue-900">
        <div className="overflow-x-auto">
            <table className="w-full text-sm">
            <thead>
                <tr>
                <th className="text-blue-900 font-fredoka text-lg text-left px-5 py-3">Order ID</th>
                <th className="text-blue-900 font-fredoka text-lg text-left px-5 py-3">Customer</th>
                <th className="text-blue-900 font-fredoka text-lg text-left px-5 py-3">Items</th>
                <th className="text-blue-900 font-fredoka text-lg text-left px-5 py-3">Total</th>
                <th className="text-blue-900 font-fredoka text-lg text-left px-5 py-3">Payment</th>
                <th className="text-blue-900 font-fredoka text-lg text-left px-5 py-3">Status</th>
                <th className="text-blue-900 font-fredoka text-lg text-left px-5 py-3">Submitted on</th>
                <th className="text-blue-900 font-fredoka text-lg text-left px-5 py-3">Actions</th>
                </tr>
            </thead>
            <tbody>
                {filteredOrders.map((order) => {
                const status = STATUS_CONFIG[order.status];
                const payment = order.paymentStatus ?? "unpaid";

                return (
                    <tr key={order.id} className="border-t border-gray-100 hover:bg-blue-50 transition-colors">
                    <td className="px-5 py-4 text-blue-900 font-fredoka font-bold">#ORD-{order.id}</td>
                    <td className="px-5 py-4 text-blue-900 font-fredoka">
                        {[order.firstName, order.lastName].filter(Boolean).join(" ") || "—"}
                    </td>
                    <td className="px-5 py-4 text-blue-900 font-fredoka">{order.items.length}</td>
                    <td className="px-5 py-4 text-blue-900 font-fredoka">
                        {order.totalPrice.toLocaleString()} EGP
                    </td>
                    <td className="px-5 py-4">
                        <span
                        className={`rounded-full px-3 py-1 text-xs font-bold font-fredoka capitalize ${
                            PAYMENT_STYLE[payment] ?? "bg-gray-100 text-gray-600"
                        }`}
                        >
                        {payment}
                        </span>
                    </td>
                    <td className="px-5 py-4">
                        <span
                        className={`rounded-full px-3 py-1 text-xs font-bold font-fredoka ${
                            status?.style ?? "bg-gray-100 text-gray-600"
                        }`}
                        >
                        {status?.label ?? order.status}
                        </span>
                    </td>
                    <td className="px-5 py-4 text-blue-900 font-fredoka">
                        {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-4">
                        <Link
                        href={`/Order/details/${order.id}`}
                        className="inline-flex items-center gap-1 text-blue-900 font-fredoka font-bold hover:underline"
                        >
                        View
                        <ArrowRight className="w-4 h-4" />
                        </Link>
                    </td>
                    </tr>
                );
                })}
            </tbody>
            </table>
        </div>

        {loading && <p className="text-center text-blue-900 font-fredoka py-10">Loading...</p>}

        {error && <p className="text-center text-red-500 font-fredoka py-10">{error}</p>}

        {!loading && !error && filteredOrders.length === 0 && (
            <div className="flex flex-col items-center gap-2 py-12 text-gray-400 font-fredoka">
            <ShoppingCart className="w-10 h-10" />
            <p>No orders match your filters</p>
            </div>
        )}
        </div>
    </div>
    );
}