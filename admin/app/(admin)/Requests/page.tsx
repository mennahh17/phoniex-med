import PendingRequests from "@/components/PendingRequests";

export default function RequestsPage() {
    return (
        <>
            <h1 className="text-2xl font-bold font-cantora-one text-blue-900 mt-10 mb-4">
                Sell Equipment Requests
            </h1>
            <PendingRequests variant="grid" />
        </>
    );
}