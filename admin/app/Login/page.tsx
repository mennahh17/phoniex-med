"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError("");

        const { error } = await authClient.signIn.email({ email, password });

        if (error) {
            setError(error.message || "Login failed");
            return;
        }

        router.push("/");
    }

    return (
        <main className="min-h-screen flex justify-center items-center bg-gray-100">
            <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-sm">
                <h1 className="text-2xl font-bold text-blue-900 mb-6 text-center">Admin Login</h1>

                {error && <p className="text-red-600 text-sm mb-4 text-center">{error}</p>}

                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full border rounded-lg px-4 py-2 mb-3"
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full border rounded-lg px-4 py-2 mb-4"
                />
                <button
                    type="submit"
                    className="w-full bg-blue-900 text-white font-semibold py-3 rounded-lg"
                >
                    Sign In
                </button>
            </form>
        </main>
    );
}