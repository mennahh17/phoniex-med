import Sidebar from "@/components/Sidebar";
import AuthGuard from "@/components/AuthGuard";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <AuthGuard>
            <div className="min-h-screen flex bg-gray-50">
                <Sidebar />
                <main className="flex-1 min-w-0 px-8 pb-10">{children}</main>
            </div>
        </AuthGuard>
    );
}