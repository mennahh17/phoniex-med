"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export default function LoginPage() {
    const router = useRouter();
    const [isSignUp, setIsSignUp] = useState(false);

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError("");

        if (isSignUp) {
            const { error } = await authClient.signUp.email({
                name,
                email,
                password,
            });
            if (error) {
                setError(error.message || "Sign up failed");
                return;
            }
        } else {
            const { error } = await authClient.signIn.email({
                email,
                password,
            });
            if (error) {
                setError(error.message || "Sign in failed");
                return;
            }
        }

        router.push("/");
    }

    return (
        <main className="min-h-screen flex bg-blue-950">
            <div className="hidden md:flex flex-col justify-center items-center w-1/2 text-white px-16">
                <h1 className="text-5xl font-bold mb-4 px-20">Welcome!</h1>
                <div className="w-16 h-1 bg-white mb-6"></div>
                <p className="text-blue-200 max-w-sm">
                    Find trusted medical equipment, or sell your own —
                    all in one place at Phoenix Medical.
                </p>
            </div>

            <div className="flex flex-1 justify-center items-center px-6">
                <div className="bg-white/10 rounded-xl shadow-2xl p-12 w-full max-w-xl">
                    <h2 className="text-3xl font-bold text-white mb-8 text-center">
                        {isSignUp ? "Create Account" : "Sign In"}
                    </h2>

                    {error && (
                        <p className="text-red-300 text-sm mb-4 text-center">{error}</p>
                    )}

                    <form onSubmit={handleSubmit}>
                        {isSignUp && (
                            <input
                                type="text"
                                placeholder="Name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                className="w-full bg-white/90 rounded-lg px-4 py-3 mb-4 text-blue-900 outline-none"
                            />
                        )}

                        <input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full bg-white/90 rounded-lg px-4 py-3 mb-4 text-blue-900 outline-none"
                        />

                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full bg-white/90 rounded-lg px-4 py-3 mb-6 text-blue-900 outline-none"
                        />

                        <button
                            type="submit"
                            className="w-full bg-blue-500 hover:bg-blue-400 text-white font-semibold rounded-lg py-3 mb-4 transition-colors"
                        >
                            {isSignUp ? "Sign Up" : "Sign In"}
                        </button>
                    </form>

                    <p className="text-center text-sm text-blue-200">
                        {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
                        <button
                            onClick={() => setIsSignUp(!isSignUp)}
                            className="font-semibold underline text-white"
                        >
                            {isSignUp ? "Sign In" : "Sign Up"}
                        </button>
                    </p>
                </div>
            </div>
        </main>
    );
}