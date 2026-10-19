"use client";
import { useCart } from "@/context/CartContext";

export default function CartToast() {
    const { message } = useCart();

    if (!message) return null;

    return (
        <div className="fixed top-20 right-6 bg-blue-900 text-white px-6 py-3 rounded-lg shadow-2xl z-50 animate-pulse">
            {message}
        </div>
    );
}