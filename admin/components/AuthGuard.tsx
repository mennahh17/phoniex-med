"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const { data: session, isPending } = authClient.useSession();

    useEffect(() => {
        if (!isPending && !session) router.replace("/Login");
    }, [isPending, session, router]);

    if (isPending || !session) {
        return <p className="p-10 text-gray-500 font-fredoka">Checking session...</p>;
    }

    return <>{children}</>;
}