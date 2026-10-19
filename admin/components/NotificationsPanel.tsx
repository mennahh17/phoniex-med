"use client";
import { useEffect , useState } from "react";
import { CheckCheck , Trash2 , Bell , Mail , MailOpen , ShoppingCart , ClipboardList , XCircle , RefreshCw , AlertTriangle , PackageX , UserPlus , CreditCard , MessageSquare , BellOff}  from "lucide-react";

const API_URL = "http://localhost:3000";

type Notifications = {
    id: number;
    type: string;
    title: string;
    message: string;
    link: string | null;
    isRead: boolean;
    createdAt: string;
};

type SettingsT = {
    enabled: boolean;
    inApp: boolean;
    email: boolean;
    newOrders: boolean;
    sellRequests: boolean;
    lowStock: boolean;
    customerInquiries: boolean;
    payments: boolean;
    newCustomers: boolean;
    defaultLowStock: number;
};

const TYPE_CONFIG : Record < string , {label : string ; icon : typeof Bell , style : string}>  = {
    new_order : {label : "New Order" , icon : ShoppingCart , style : "bg-blue-100 text-blue-700"},
    sell_request: { label: "Sell Request", icon: ClipboardList, style: "bg-violet-100 text-violet-700" },
    order_cancelled: { label: "Order Cancelled", icon: XCircle, style: "bg-gray-100 text-gray-600" },
    order_status: { label: "Order Updated", icon: RefreshCw, style: "bg-cyan-100 text-cyan-700" },
    low_stock: { label: "Low Stock", icon: AlertTriangle, style: "bg-amber-100 text-amber-700" },
    out_of_stock: { label: "Out of Stock", icon: PackageX, style: "bg-red-100 text-red-700" },
    new_customer: { label: "New Customer", icon: UserPlus, style: "bg-pink-100 text-pink-700" },
    payment: { label: "Payment", icon: CreditCard, style: "bg-emerald-100 text-emerald-700" },
    inquiry: { label: "Inquiry", icon: MessageSquare, style: "bg-orange-100 text-orange-700" },
};

export default function NotificationsPanel (){
    const [notifications, setNotifications] = useState<Notifications[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [tab , setTab ] = useState("all");
    const [busyId, setBusyId] = useState<number | null>(null);

    useEffect (() => {
        async function load () {
            try {
                const response = await fetch (`${API_URL}/notifications`, {
                    credentials : "include",
                });
            if (!response.ok) throw new Error (`Error ${response.status}`);
            const data : Notifications[] = await response.json();
            setNotifications(data);
            }catch (err){
                setError(err instanceof Error ? err.message : "Something went wrong");
            }finally {
                setLoading(false);
            }
        }
        load();
    }, []);

    if (loading) return <p className="p-10 text-gray-500">Loading notifications...</p>;
    if (error) return <p className="p-10 text-red-600">{error}</p>;

    const total =notifications.length;
    const unread =notifications.filter ((n) => !n.isRead).length;
    const read = total - unread ;

    const STAT =[
        {key : "all" , label : "All notifications" , value : total , icon : Bell , style:"bg-blue-50 text-blue-900"},
        {key : "unread" , label : "Unread" , value : unread , icon : Mail , style :"bg-amber-50 text-amber-900"},
        {key : "read" , label : "Read" , value : read , icon : MailOpen , style : "bg-green-50 text-green-900"}
    ];

    const TABS =[
    {key : "all" , label : "All" , value : total },
    {key : "unread" , label : "Unread" , value : unread },
    {key : "read" , label : "read" , value : read },
    ];


    const visible = notifications.filter((n) => tab === "all" ? true : tab === "unread" ? !n.isRead : n.isRead, ); 

    async function setReadState(n: Notifications , isRead: boolean) {
        setBusyId(n.id);
        try{
            const response = await fetch (`${API_URL}/notifications/${n.id}/${isRead ? "read" : "unread"}` , {
                method: " PATCH",
                credentials : "include",
            });
            if(!response.ok) throw new Error (`${response.status}`);
            const data : Notifications[] = await response.json();
            setNotifications(data);
        }catch(err){
            setError(err instanceof Error ? err.message : "Something went wrong");
        }finally{
            setBusyId(null);
        }
    }

    return (
        <main className="font-fredoka">
            <div className="flex justify-between mt-10">
                <div>
                    <div className="text-blue-900 font-bold text-2xl ">Notifications</div>
                    <div className="text-gray-500 text-sm">Keep track of orders, sell requests, and inventory alerts</div>
                </div>
                <div className="flex gap-3">
                    <button
                    className="font-bold text-blue-900 border border-blue-900 rounded-2xl py-2 w-fit px-6 inline-flex gap-1 items-center transition-all hover:bg-blue-900 hover:text-white hover:shadow-2xl hover:-translate-y-0.5 cursor-pointer">
                        <CheckCheck className="w-5 h-5"/>
                        Mark all as read
                    </button>
                    <button
                    className=" font-bold text-red-500 border border-red-500 rounded-2xl py-2 w-fit px-6 inline-flex gap-1 items-center transition-all hover:bg-red-500 hover:text-white hover:shadow-2xl hover:-translate-y-0.5 cursor-pointer">
                        <Trash2 className="w-5 h-5"/>
                        Clear all
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-4 py-5">
                {STAT.map((s) =>{
                    const active = tab === s.key;
                    return(
                        <button 
                        key={s.key} 
                        className={`text-left bg-white border rounded-2xl p-4 cursor-pointer transition-colors ${
                        active ? "border-blue-900 ring-1 ring-blue-900" : "border-gray-300 hover:border-blue-900"
                        }`}
                        onClick = {() => setTab(s.key)}>
                            <div className="flex justify-between items-center">
                                <div>
                                    <div className="text-gray-500 text-sm">{s.label}</div>
                                    <div className="text-blue-900 text-xl font-bold"> {s.value}</div>
                                </div>
                                <div className={`p-3 rounded-xl ${s.style}`}>
                                    <s.icon className="w-5 h-5"/>
                                </div>
                            </div>
                        </button> 
                    );
                })} 
            </div>

        <div className="bg-white border border-gray-300 rounded-2xl overflow-hidden">
            {visible.length === 0 ? (
                <div className="flex flex-col items-center gap-2 py-16 text-gray-400">
                        <BellOff className="w-10 h-10"/>
                        <p className="font-bold">No notifications</p>
                        <p className="text-sm">{total === 0 ? "You're all caught up" : "Nothing in this filter"}</p>
                </div>
            ):(
                visible.map((n) => {
                    const config = TYPE_CONFIG[n.type] ?? {label:n.type, icon: Bell, style: "bg-gray-100 text-gray-600" };
                    return (
                        <div
                        key={n.id}
                        className={`group flex items-start gap-4 px-5 py-4 border-b border-gray-100 last:border-b-0 ${
                        n.isRead ? "bg-white" : "bg-blue-50/60"
                        }`}
                        >
                            <div className={`p-3 rounded-xl shrink-0 ${config.style}`}>
                                <config.icon className="w-5 h-5"/>
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    {!n.isRead && 
                                    <span className="bg-blue-600  w-2 h-2 rounded-full shrink-0"/>}
                                        <p className={n.isRead ? "text-gray-700" : "text-blue-900 font-bold"}>{n.title}</p>
                                </div>

                                <p className="text-sm text-gray-500 mt-0.5">{n.message}</p>
                                <div className="flex items-center gap-2 mt-1.5 text-xs text-gray-400">
                                    <span className={`rounded-full px-2 py-0.5 font-bold ${config.style}`}>{config.label}</span>
                                    <span>
                                        {new Date(n.createdAt).toLocaleString("en-GB", {
                                            day : "numeric",
                                            month : "short",
                                            hour : "2-digit",
                                            minute: "2-digit",
                                        })}
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center gap-1 shrink-0 md:opacity-0 md:group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                                <button
                                type = "button"
                                title = {n.isRead ? "Mark as read" : "Mark as unread"}
                                className="p-2 rounded-lg text-gray-500 hover:bg-blue-50 hover:text-blue-900 transition-colors cursor-pointer">
                                    {n.isRead ? <MailOpen className="w-5 h-5"/> : <Mail className="w-5 h-5"/>}
                                    
                                </button>

                                <button
                                type="button"
                                title="Delete"
                                className="p-2 rounded-lg text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors cursor-pointer">
                                    <Trash2 className="w-5 h-5"/>
                                </button>
                            </div>

                        </div>
                    );
                })

            )}
                
        </div>

        </main>
    );
}