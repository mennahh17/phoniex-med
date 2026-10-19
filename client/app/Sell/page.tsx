"use client";
import { ClipboardList, MessageCircle, BadgeDollarSign, Handshake, ArrowRight, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const steps = [
    {
    icon: ClipboardList,
    title: "Tell Us About Your Equipment",
    description: "Fill in the device details, condition, and upload clear photos.",
    },
    {
    icon: MessageCircle,
    title: "Get in Touch",
    description: "Our team reviews your request and contacts you to confirm the details.",
    },
    {
    icon: BadgeDollarSign,
    title: "Get an Offer",
    description: "We send you a fair price based on the device's condition and market value.",
    },
    {
    icon: Handshake,
    title: "Complete the Sale",
    description: "Once you accept, we arrange pickup and payment, and it's done.",
    },
];

export default function SellPage() {
    const [flipped, setFlipped] = useState<number | null>(null);

    function toggle(index: number) {
    setFlipped(flipped === index ? null : index);
    }

    return (
    <main className="px-6 pb-16">
        <h1 className="text-blue-900 text-[30px] font-cantora-one flex justify-center py-10">
        How It Works
        </h1>

        <div className="flex flex-col gap-6 max-w-2xl mx-auto">
        {steps.map((step, index) => {
            const Icon = step.icon;
            const isFlipped = flipped === index;

            return (
            <div
                key={step.title}
                onClick={() => toggle(index)}
                className="perspective-[1000px] h-[88px] cursor-pointer"
            >
                <div
                className={`relative w-full h-full transition-transform duration-500 transform-3d ${
                    isFlipped ? "rotate-y-180" : ""
                }`}
                >
                <div className="absolute inset-0 backface-hidden bg-blue-900 text-white rounded-2xl px-10 flex items-center gap-4 font-fredoka">
                    <Icon className="w-7 h-7" />
                    <div>{step.title}</div>
                    <ArrowRight className="ml-auto w-6 h-6" />
                </div>

                <div className="absolute inset-0 backface-hidden rotate-y-180 bg-white text-blue-900 border-2 border-blue-900 rounded-2xl px-10 flex items-center gap-4 font-fredoka">
                    <ArrowLeft className="w-6 h-6 shrink-0" />
                    <p className="text-sm">{step.description}</p>
                </div>
                </div>
            </div>
            );
        })}
        </div>

        <section className="flex flex-col items-center gap-3 py-16 text-center">
        <h2 className="text-blue-900 text-2xl font-bold font-cantora-one">
            Have equipment you&apos;re ready to sell?
        </h2>
        <p className="text-blue-900 text-lg font-fredoka">
            Let us know what you have, and we&apos;ll take it from there
        </p>
        <Link
        href ="/Sell/request"
        className="mt-2 w-fit bg-white text-blue-900 rounded-2xl px-10 py-3 font-fredoka font-bold shadow-lg
                    transition-all duration-200 hover:-translate-y-1 hover:shadow-2xl
                    active:translate-y-0 active:scale-95"
        >
        Start Selling
        </Link>
        </section>

    </main>
    );
}