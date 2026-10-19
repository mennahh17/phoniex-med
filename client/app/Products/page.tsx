"use client";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useCart } from "@/context/CartContext";
import { authClient } from "@/lib/auth-client";

const OWNER_EMAIL = "admin@test1.com";

type TProduct = {
    id: number;
    name: string;
    price: number;
    description: string | null;
    imageUrl: string | null;
};

export default function Product() {
    const [searchTerm, setSearchTerm] = useState("");
    const [products, setProducts] = useState<TProduct[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [name, setName] = useState("");
    const [price, setPrice] = useState("");
    const [description, setDescription] = useState("");
    const [imageUrl, setImageUrl] = useState("");

    const [pending, setPending] = useState<TProduct[]>([]);

    const { addToCart } = useCart();
    const { data: session } = authClient.useSession();
    const isAdmin = session?.user?.email === OWNER_EMAIL;

    useEffect(() => {
        async function getProducts() {
            try {
                const response = await fetch("http://localhost:3000/products");
                if (!response.ok) throw new Error("Failed to fetch products");
                const data = await response.json();
                setProducts(data);
            } catch (err) {
                setError("Could not load products. Please try again later.");
            } finally {
                setLoading(false);
            }
        }
        getProducts();
    }, []);

    useEffect(() => {
        if (!isAdmin) return;
        async function fetchPending() {
            const response = await fetch("http://localhost:3000/products/pending", {
                credentials: "include",
            });
            if (response.ok) {
                const data = await response.json();
                setPending(data);
            }
        }
        fetchPending();
    }, [isAdmin]);

    async function handleApprove(id: number) {
        await fetch(`http://localhost:3000/products/${id}/approve`, {
            method: "PATCH",
            credentials: "include",
        });
        setPending((prev) => prev.filter((p) => p.id !== id));
    }

    async function handleReject(id: number) {
        await fetch(`http://localhost:3000/products/${id}/reject`, {
            method: "PATCH",
            credentials: "include",
        });
        setPending((prev) => prev.filter((p) => p.id !== id));
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        const response = await fetch("http://localhost:3000/products/sell-request", {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                name,
                price: Number(price),
                description,
                imageUrl: imageUrl || null,
            }),
        });

        if (response.ok) {
            alert("Your item has been submitted for review!");
        }

        setName("");
        setPrice("");
        setDescription("");
        setImageUrl("");
    }

    return(
        <main>
            <div className ="font-bold text-2xl text-blue-900 flex justify-center items-center py-10  font-bad-script">
                Find the Equipment That Fits Your Needs
            </div>

            <div className=" flex items-center px-60 py-10 pt-3 gap-3">
                <Link href="/Category">
            <div className="text-blue-900 font-bold text-xl  "> 
                Category
            </div>
            </Link>
            <div className="rounded-xl bg-white px-6 py-2 w-80">
                <input
                type="text"
                placeholder="Search by category"
                value={searchTerm}
                onChange={(e) =>setSearchTerm(e.target.value)}
                className="outline-none w-full text-blue-900"
                />
                
            </div>
            </div>

            {loading && (
                <p className="text-center text-blue-900 py-10">Loading products...</p>
            )}

            {error && (
                <p className="text-center text-red-600 py-10">{error}</p>
            )}
            <div className="sm:px-8 lg:px-12 py-12 px-4 mx-auto max-w-7xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
                <div key={product.id} className="bg-white rounded-xl shadow-2xl overflow-hidden">
                    <div className="relative h-48 w-full bg-gray-100 flex items-center justify-center">
                        {product.imageUrl ? (
                            <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                        ) : (
                            <span className="text-gray-400 text-sm">No image</span>
                        )}
                    </div>
                    <div className="p-4">
                        <h3 className="font-bold text-blue-900">{product.name}</h3>
                        <p className="text-sm text-gray-500">{product.description}</p>
                        <p className="text-blue-900 font-semibold mt-1">{product.price} EGP</p>
                    </div>
                    <div className="p-4">
                        <div className="flex justify-center items-center">
                            <button
                                onClick={() => addToCart({ id: product.id, name: product.name, price: product.price })}
                                className="text-white font-semibold cursor-pointer bg-blue-900 rounded-lg shadow-2xl py-3 px-7"
                            >
                                Add to cart
                            </button>
                        </div>
                    </div>
                </div>
            ))}
            </div>
            </div>
            <section className="flex flex-col items-center gap-3 py-16 text-center">
            <h2 className="text-blue-900 font-cantora-one font-bold text-2xl flex justify-center mt-7">Looking to sell your medical device?</h2>
            <div className="text-blue-900 font-cantora-one font-bold text-xl flex justify-center py-3">List it on our platform and connect with potential buyers</div>
            <Link href="/Sell"
            className="flex justify-center  w-fit rounded-2xl bg-blue-900 shadow-2xl px-10 py-3 hover:bg-white hover:text-blue-900 transition font-fredoka shadow-2xl transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-xl hover-bg-blue-800 active:translate-y-0 active:scale-95"
            >Sell equipment</Link>
            </section>
        </main>
    );
}