"use client";
import { useState, useEffect } from "react";
import { ChevronDown, ShoppingBag, Package, CircleCheck, Loader, Truck, PackageCheck } from "lucide-react";
import jsPDF from "jspdf";

type OrderItem = {
    id: number;
    productName: string;
    price: number;
    quantity: number;
};

type Order = {
    id: number;
    status: string;
    totalPrice: number;
    items: OrderItem[];
    createdAt: string;
};

export default function orders() {
    const [activeTab, setActiveTab] = useState("track");
    const [allOrders, setAllOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [openOrders, setOpenOrders] = useState<Set<number>>(new Set());
    const statusSteps = ["pending", "confirmed", "processing", "delivery", "delivered"];
    const statusIcons = [Package, CircleCheck, Loader, Truck, PackageCheck];

    useEffect(() => {
        async function fetchOrders() {
            try {
                const response = await fetch("http://localhost:3000/orders/my-orders", {
                    credentials: "include",
                });
                if (response.ok) {
                    const data = await response.json();
                    setAllOrders(data);
                }
            } finally {
                setLoading(false);
            }
        }
        fetchOrders();
    }, []);

    async function handleCancel(id: number) {
        await fetch(`http://localhost:3000/orders/${id}/cancel`, {
            method: "PATCH",
            credentials: "include",
        });
        setAllOrders((prev) =>
            prev.map((order) =>
                order.id === id ? { ...order, status: "cancelled" } : order
            )
        );
    }

    function handleDownloadInvoice(order: Order) {
        const doc = new jsPDF();

        doc.text(`Order #${order.id}`, 10, 10);
        doc.text(`Total: ${order.totalPrice} EGP`, 10, 20);

        doc.save(`invoice-${order.id}.pdf`);
    }

    function toggleOrder(id: number) {
        const newSet = new Set(openOrders);
        if (newSet.has(id)) {
            newSet.delete(id);
        } else {
            newSet.add(id);
        }
        setOpenOrders(newSet);
    }

    const trackOrders = allOrders.filter((o) =>
        ["pending", "confirmed", "processing", "delivery"].includes(o.status)
    );
    const completedOrders = allOrders.filter((o) => o.status === "delivered");
    const cancelledOrders = allOrders.filter((o) => o.status === "cancelled");

    function renderOrderList(list: Order[]) {
        if (loading) return <p className="text-center text-blue-900 py-10">Loading...</p>;
        if (list.length === 0) return <p className="text-center text-gray-500 py-10">No orders here.</p>;

        return (
            <div className="flex flex-col gap-10 max-w-3xl mx-auto py-8">
                {list.map((order) => {
                    const currentStep = statusSteps.indexOf(order.status);
                    const totalItems = order.items.reduce((sum, item) => sum + item.quantity, 0);

                    return (
                        <div key={order.id} className="bg-white rounded-lg shadow-2xl p-4">
                            <div className="flex justify-between items-center">
                                <span className="font-semibold text-blue-900 text-lg">Order #{order.id}</span>
                                <div className="flex items-center gap-3">
                                    <span className="font-bold text-white bg-blue-900 rounded-xl shadow-2xl px-5 py-2">{order.totalPrice} EGP</span>

                                    {order.status === "pending" && (
                                        <button
                                            onClick={() => handleCancel(order.id)}
                                            className="text-sm text-white bg-red-600 hover:bg-red-700 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                                        >
                                            Cancel Order
                                        </button>
                                    )}
                                    <ChevronDown
                                        onClick={() => toggleOrder(order.id)}
                                        className="text-blue-900 w-4 h-4 cursor-pointer"
                                    />
                                </div>
                            </div>

                            {order.status !== "cancelled" && (
                                <div className="flex justify-center items-center gap-10 mt-4">
                                    {statusSteps.map((step, index) => {
                                        const Icon = statusIcons[index];
                                        return (
                                            <div key={step} className="flex flex-col items-center gap-1">
                                                <Icon
                                                    className={`w-6 h-6 ${
                                                        index <= currentStep ? "text-blue-900" : "text-gray-300"
                                                    }`}
                                                />
                                                <span
                                                    className={`text-xs ${
                                                        index <= currentStep ? "text-blue-900" : "text-gray-300"
                                                    }`}
                                                >
                                                    {step}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            {openOrders.has(order.id) && (
                                <div className="border-t pt-3 mt-3 px-5">
                                    <div className="text-blue-900 font-oleo-script text-xl px-5 py-5">Order Details</div>
                                    <ul className="text-lg text-white flex flex-col gap-1 px-10 py-2">
                                        {order.items.map((item) => (
                                            <li
                                                className="bg-blue-900 rounded-2xl shadow-2xl py-5 px-4 flex justify-between items-center"
                                                key={item.id}
                                            >
                                                <span>{item.productName} × {item.quantity}</span>
                                                <span>{item.price * item.quantity} EGP</span>
                                            </li>
                                        ))}
                                    </ul>

                                    <div className="flex">
                                        <div className="px-30 py-5">
                                            <span className="font-cantora-one font text-blue-900">
                                                Total: {order.totalPrice} EGP
                                            </span>
                                        </div>

                                        <div className="px-30 py-5">
                                            <span className="font-cantora-one font text-blue-900">
                                                Total Items: {totalItems}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex justify-center items-center gap-8 rounded-2xl shadow-2xl py-10 bg-blue-900">
                                        <div className="flex flex-col justify-center items-center">
                                            <p className="font-cantora-one">Order ID</p>
                                            <p className="text-sm">{order.id}</p>
                                        </div>

                                        <div className="flex flex-col justify-center items-center">
                                            <p className="font-cantora-one">Payment method</p>
                                            <p className="text-sm">PayPal</p>
                                        </div>

                                        <div className="flex flex-col justify-center items-center">
                                            <p className="font-cantora-one">Estimated Delivery</p>
                                            <p className="text-sm">20 Dec 2026</p>
                                        </div>

                                        <button
                                            onClick={() => handleDownloadInvoice(order)}
                                            className="font-bold bg-white rounded-2xl shadow-2xl px-5 py-2 font-cantora-one text-blue-900"
                                        >
                                            Download Invoice
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        );
    }

    return (
        <main>
            <div className="flex items-center gap-6 text-blue-900 font-bold py-15 px-30">
                <div className="text-[50px] font-oleo-script">Order History</div>
                <ShoppingBag className="text-blue-900 w-10 h-10" />
            </div>
            <div className="flex justify-center items-center gap-6 text-white font-bold text-xl bg-blue-900 rounded-xl py-3">
                <div className="cursor-pointer px-4 py-2 hover:bg-white rounded-2xl hover:text-blue-900">
                    <div onClick={() => setActiveTab("track")}>Track Order</div>
                </div>
                <div className="cursor-pointer px-4 py-2 hover:bg-white rounded-2xl hover:text-blue-900">
                    <div onClick={() => setActiveTab("completed")}>Completed Orders</div>
                </div>
                <div className="cursor-pointer px-4 py-2 hover:bg-white rounded-2xl hover:text-blue-900">
                    <div onClick={() => setActiveTab("cancelled")}>Cancelled Orders</div>
                </div>
            </div>

            {activeTab === "track" && renderOrderList(trackOrders)}
            {activeTab === "completed" && renderOrderList(completedOrders)}
            {activeTab === "cancelled" && renderOrderList(cancelledOrders)}
        </main>
    );
}