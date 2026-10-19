"use client";
import { useState, useEffect, use } from "react";
import { User, Building2, Phone, Mail, MapPin, MessageSquare, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type ProductImage = {
    id: number;
    url: string;
};

type Product = {
    id: number;
    name: string;
    description: string | null;
    price: number;
    manufacturer: string | null;
    modelNumber: string | null;
    manufactureYear: string | null;
    images: ProductImage[];
    status: string | null;
    condition: string | null;
    location: string | null;
    sellerName: string | null;
    sellerPhone: string | null;
    sellerEmail: string | null;
    sellerCompany: string | null;
    sellerMessage: string | null;
    documents: string[];
    quantity: number | null;
    createdAt: string;
};

const requestStyle: Record<string, string> = {
    pending: "bg-yellow-200 text-yellow-900",
    approved: "bg-green-200 text-green-900",
    rejected: "bg-red-200 text-red-900",
};

export default function EquiDetails({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();

    const [equipment, setEquipment] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedImage, setSelectedImage] = useState(0);
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        async function fetchEquip() {
            try {
                const response = await fetch(`http://localhost:3000/products/${id}`, {
                    credentials: "include",
                });
                if (!response.ok) throw new Error(`Error ${response.status}`);
                const data: Product = await response.json();
                setEquipment(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : "Something went wrong");
            } finally {
                setLoading(false);
            }
        }
        fetchEquip();
    }, [id]);

    async function handleDecision(action: "approve" | "reject") {
        if (action === "reject" && !confirm("Reject this request?")) return;

        setProcessing(true);
        try {
            const response = await fetch(`http://localhost:3000/products/${id}/${action}`, {
                method: "PATCH",
                credentials: "include",
            });
            if (!response.ok) throw new Error(`Error ${response.status}`);
            router.push("/Requests");
        } catch (err) {
            alert(err instanceof Error ? err.message : "Action failed");
            setProcessing(false);
        }
    }

    if (loading) return <p className="text-center text-blue-900 py-20 font-fredoka">Loading...</p>;
    if (error) return <p className="text-center text-red-500 py-20 font-fredoka">{error}</p>;
    if (!equipment) return null;

    return (
        <main className="font-fredoka py-10">
            <Link href="/Requests" className="inline-flex items-center gap-2 mb-6 text-blue-900 hover:underline">
                <ArrowLeft className="w-5 h-5" />
                <span className="text-lg font-bold">Back to requests</span>
            </Link>

            <div className="bg-white border border-gray-300 rounded-2xl p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">

                    <div className="flex flex-col gap-3">
                        <div className="w-full h-96 bg-gray-100 rounded-2xl overflow-hidden flex items-center justify-center">
                            {equipment.images.length > 0 ? (
                                <img
                                    src={equipment.images[selectedImage].url}
                                    alt={equipment.name}
                                    className="w-full h-full object-contain p-4"
                                />
                            ) : (
                                <span className="text-gray-400">No images</span>
                            )}
                        </div>

                        {equipment.images.length > 1 && (
                            <div className="flex flex-wrap gap-3">
                                {equipment.images.map((image, index) => (
                                    <img
                                        key={image.id}
                                        src={image.url}
                                        alt=""
                                        onClick={() => setSelectedImage(index)}
                                        className={`object-cover w-20 h-20 rounded-2xl cursor-pointer border-2 transition-all ${
                                            selectedImage === index
                                                ? "border-blue-900"
                                                : "border-transparent opacity-60 hover:opacity-100"
                                        }`}
                                    />
                                ))}
                            </div>
                        )}

                        {equipment.status === "pending" && (
                            <div className="flex gap-4 pt-6">
                                <button
                                    type="button"
                                    onClick={() => handleDecision("approve")}
                                    disabled={processing}
                                    className="flex-1 rounded-2xl bg-green-700 text-white py-3 text-lg cursor-pointer transition-all duration-200
                                        hover:bg-green-600 hover:-translate-y-1 hover:shadow-lg active:translate-y-0 active:scale-95
                                        disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                                >
                                    {processing ? "Processing..." : "Approve"}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleDecision("reject")}
                                    disabled={processing}
                                    className="flex-1 rounded-2xl bg-red-500 text-white py-3 text-lg cursor-pointer transition-all duration-200
                                        hover:bg-red-600 hover:-translate-y-1 hover:shadow-lg active:translate-y-0 active:scale-95
                                        disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                                >
                                    Reject
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="flex flex-col gap-3">
                        <div
                            className={`rounded-2xl px-5 w-fit py-1 font-bold capitalize ${
                                requestStyle[equipment.status ?? "pending"]
                            }`}
                        >
                            {equipment.status}
                        </div>

                        <h1 className="text-blue-900 font-cantora-one text-[30px]">{equipment.name}</h1>
                        <div className="text-blue-900 font-cantora-one text-2xl">
                            {equipment.price.toLocaleString()} EGP
                        </div>
                        <div className="text-gray-400 text-xs">
                            submitted on {new Date(equipment.createdAt).toLocaleDateString()}
                        </div>

                        <div className="flex flex-col gap-2 py-3">
                            <p className="text-blue-900 text-lg font-bold">Description</p>
                            <div className="text-gray-500 text-sm">{equipment.description ?? "—"}</div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            {[
                                { label: "Manufacturer", value: equipment.manufacturer },
                                { label: "Model", value: equipment.modelNumber },
                                { label: "Condition", value: equipment.condition },
                                { label: "Year", value: equipment.manufactureYear },
                                { label: "Quantity", value: equipment.quantity },
                                { label: "Location", value: equipment.location },
                            ].map((item) => (
                                <div key={item.label} className="rounded-2xl bg-gray-100 p-4 text-sm">
                                    <p className="text-gray-500">{item.label}</p>
                                    <p className="text-blue-900 text-lg font-bold capitalize">{item.value ?? "—"}</p>
                                </div>
                            ))}
                        </div>

                        <div className="rounded-2xl bg-gray-100 p-4 flex flex-col gap-2">
                            <div className="text-blue-900 text-lg font-bold">Seller information</div>
                            {[
                                { icon: User, value: equipment.sellerName },
                                { icon: Building2, value: equipment.sellerCompany },
                                { icon: Phone, value: equipment.sellerPhone },
                                { icon: Mail, value: equipment.sellerEmail },
                                { icon: MapPin, value: equipment.location },
                            ].map((row, index) => {
                                const Icon = row.icon;
                                return (
                                    <div key={index} className="flex items-center gap-3">
                                        <Icon className="text-gray-400 w-5 h-5 shrink-0" />
                                        <p className="text-gray-600">{row.value ?? "—"}</p>
                                    </div>
                                );
                            })}
                        </div>

                        {equipment.sellerMessage && (
                            <div className="flex gap-3 bg-gray-100 rounded-2xl p-4">
                                <MessageSquare className="text-gray-400 w-5 h-5 shrink-0 mt-0.5" />
                                <p className="text-gray-600 italic">{equipment.sellerMessage}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </main>
    );
}