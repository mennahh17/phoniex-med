"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
    LayoutDashboard, Package, ShoppingCart, ClipboardList,
    Users, Bell, Boxes, Settings, LogOut,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";

const links = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/Products", label: "Products", icon: Package },
    { href: "/Order", label: "Orders", icon: ShoppingCart },
    { href: "/Requests", label: "Sell Equipment Requests", icon: ClipboardList },
    { href: "/Inventory", label: "Inventory Overview", icon: Boxes },
    { href: "/Notifications", label: "Notifications" , icon:Bell},
    { href: "/Settings" , label:"Settings" , icon:Settings},
];


export default function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const { data: session } = authClient.useSession();

    function isActive(href: string) {
        if (href === "/") return pathname === "/";
        return pathname.startsWith(href);
    }

    async function handleLogout() {
        await authClient.signOut();
        router.push("/Login");
    }

    return (
        <aside className="w-60 shrink-0 bg-blue-900 text-white p-5 flex flex-col font-fredoka sticky top-0 h-screen">
            <div className="text-2xl font-fredoka mb-8 px-3">Phoenix Admin</div>

            <nav className="flex flex-col gap-2">
                {links.map((link) => (
                    <Link
                        key={link.href}
                        href={link.href}
                        className={`flex items-center gap-3 rounded-2xl px-3 py-2 transition-colors ${
                            isActive(link.href) ? "bg-white/20" : "hover:bg-white/10"
                        }`}
                    >
                        <link.icon className="w-4 h-4 shrink-0" />
                        {link.label}
                    </Link>
                ))}
            </nav>

            <div className="mt-auto border-t border-white/20 pt-4">
                <div className="px-3 pb-2 text-sm text-white/70 truncate" title={session?.user.email}>
                    {session?.user.email}
                </div>
                <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 rounded-2xl px-3 py-2 hover:bg-white/10 transition-colors cursor-pointer"
                >
                    <LogOut className="w-4 h-4" />
                    Logout
                </button>
            </div>
        </aside>
    );
}