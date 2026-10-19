"use client";
import { useState , useEffect } from "react";
import Link from "next/link";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import {Package, ShoppingCart, Clock, ClipboardList,CheckCircle2, AlertTriangle, XCircle,TrendingUp, Boxes,} from "lucide-react";

type Product = {
    id : number ; 
    name : string ;
    price : number ;
    askingPrice : number | null ;
    quantity : number ;
    lowStockThreshold : number | null ;
    sellerName : string | null ; 
    sellerCompany : string | null ;
    status : string | null ; 
    images : { id : number ; url : string }[];
    createdAt : string ;
};

type Order = {
    id : number ;
    firstName : string | null ;
    lastName : string |  null ; 
    totalPrice : number ;
    status : string ; 
    createdAt : string ; 
};

const STATUS_CONFIG: Record<string , {label : string ; style : string}> ={
    pending : {label : "Pending" , style : "bg-amber-100 text-amber-700"},
    confirmed: { label: "Approved", style: "bg-blue-100 text-blue-700" },
    processing: { label: "Processing", style: "bg-violet-100 text-violet-700" },
    delivery: { label: "Shipping", style: "bg-cyan-100 text-cyan-700" },
    delivered: { label: "Completed", style: "bg-green-100 text-green-700" },
    rejected: { label: "Rejected", style: "bg-red-100 text-red-700" },
    cancelled: { label: "Cancelled", style: "bg-gray-100 text-gray-600" },
};

    function getStock (p:Product) {
        if (p.quantity === 0 ) return "out";
        if (p.lowStockThreshold != null && p.quantity<= p.lowStockThreshold) return "low";
        else {
            return "in";
        }
        
    };

const RANGES = [
    {key : "7d" , label : "7 Days"},
    {key : "30d" , label : "30 Days"},
    {key : "12m" , label : "12 Months"},
];

function dayKey(d: Date) {
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${d.getFullYear()}-${m}-${day}`;
}

function monthKey(d: Date) {
    const m = String(d.getMonth() + 1).padStart(2, "0");
    return `${d.getFullYear()}-${m}`;
}

function buildRevenue(orders: Order[], range: string) {
    const points: { key: string; label: string; revenue: number }[] = [];
    const now = new Date();

    if (range === "12m") {
        for (let i = 11; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            points.push({
                key: monthKey(d),
                label: d.toLocaleDateString("en-US", { month: "short" }),
                revenue: 0,
            });
        }
    } else {
        const days = range === "7d" ? 7 : 30;
        for (let i = days - 1; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            points.push({
                key: dayKey(d),
                label: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
                revenue: 0,
            });
        }
    }

    for (const order of orders) {
        if (order.status === "rejected" || order.status === "cancelled") continue;
        const date = new Date(order.createdAt);
        const key = range === "12m" ? monthKey(date) : dayKey(date);
        const point = points.find((p) => p.key === key);
        if (point) point.revenue += order.totalPrice;
    }

    return points;
}

const API_URL = "http://localhost:3000";

export default function DashboardOverview(){
    const [products , setProducts] = useState<Product[]>([]);
    const [orders , setOrders] = useState<Order[]>([]);
    const [error , setError] = useState<string | null >(null);
    const [loading , setLoading ] = useState(true);
    const [requests , setRequests] = useState<Product[]>([]);
    const [range , setRange] = useState("7d");

    useEffect(() => {
        async function load(){
            try {
            const productsRes = await fetch(`${API_URL}/products/admin`, {
                    credentials : "include",
            });
            if (!productsRes.ok) throw new Error (`Error ${productsRes.status}`);
            const productsData = await productsRes.json();
            setProducts(productsData);

            const ordersRes = await fetch(`${API_URL}/orders/all`, {
                credentials : "include",
            });
            if (!ordersRes.ok) throw new Error (`Error ${ordersRes.status}`);
            const ordersData = await ordersRes.json();
            setOrders(ordersData);

            const requestsRes = await fetch(`${API_URL}/products/pending`,{
            credentials : "include",
            }); 
            if (!requestsRes.ok) throw new Error (`Error ${requestsRes.status}`);
            const requestsData = await requestsRes.json();
            setRequests(requestsData);
            
            }catch (err) {
                setError(err instanceof Error ? err.message : "Something went wrong");
            }finally {
                setLoading(false);
            }
        }
        load();
    }, []);

    if (error) return <p className="p-10 text-red-600">{error}</p>;
    if (loading) return <p className="p-10 text-gray-500">Loading...</p>;

    const totalProducts = products.length;
    const totalOrders = orders.length;
    const pendingOrders = orders.filter ((o) => o.status === "pending").length; 
    const pendingRequests = requests.length;
    const inStock = products.filter ((p) => getStock(p)==="in").length;
    const lowStock = products.filter ((p) => getStock(p) === "low").length;
    const outOfStock = products.filter ((p) => getStock(p) === "out").length;


    const stats = [
    { label: "Total products", value: totalProducts, icon: Package },
    { label: "Total orders", value: totalOrders, icon: ShoppingCart },
    { label: "Pending Orders", value: pendingOrders, icon: Clock },
    { label: "Pending Sell Requests", value: pendingRequests, icon: ClipboardList },
];

    const recentOrders = [...orders].sort((a,b)=> + new Date(b.createdAt) - +new Date(a.createdAt)).slice(0,5);
    const recentRequests = requests.slice(0 , 5);
    const th = "text-blue-900 text-left px-4 py-3 whitespace-nowrap";
    const td = "text-gray-500 px-4 py-3 whitespace-nowrap";

const inventory = [
    { label: "In Stock", value: inStock, style: "bg-green-100 text-green-700", icon: CheckCircle2 },
    { label: "Low Stock", value: lowStock, style: "bg-orange-100 text-orange-700", icon: AlertTriangle },
    { label: "Out of Stock", value: outOfStock, style: "bg-red-100 text-red-700", icon: XCircle },
];

const revenueData = buildRevenue(orders, range);
const totalRevenue = revenueData.reduce((sum, p) => sum + p.revenue, 0);

    return (
        <main className="font-fredoka">

            <div className="py-10">
                <div className="text-blue-900 text-2xl font-bold ">Dashboard</div>
                <p className="text-gray-500 text-sm ">Welcome back, Admin! Here&apos;s your store overview</p>
            </div>

            <div className="grid grid-cols-4 gap-4">
                {stats.map((card) => {
                    return (
                        <div key={card.label} className="rounded-2xl bg-white border border-gray-300 p-4 flex items-center justify-between">
                    <div>
        <p className="text-gray-500 text-sm">{card.label}</p>
        <p className="text-blue-900 text-xl font-bold">{card.value}</p>
    </div>
    <div className="p-3 rounded-xl bg-blue-50 text-blue-900">
        <card.icon className="w-5 h-5" />
    </div>
</div>
                    );
                })}
            </div>

    <div className="mt-5 border border-gray-300 bg-white p-5 rounded-2xl">
    <div className="flex justify-between items-center">
        <div className="flex items-center gap-2 text-blue-900 font-bold text-xl">
        <TrendingUp className="w-5 h-5" />
        Sales Overview
        </div>
        <div className="flex gap-2">
            {RANGES.map((r) => {
                const active = range === r.key; 
                return (
                    <button
                        key={r.key}
                        type="button"
                        onClick={() => setRange(r.key)}  
                        className={`px-4 py-1.5 rounded-xl text-sm font-bold ${
                            active ? "bg-blue-900 text-white" : "bg-gray-200 text-blue-900"
                        }`}
                    >
                        {r.label}
                    </button>
                );
            })}
        </div>
    </div>

    <p className="text-gray-500 text-sm mt-2 mb-4">Total Revenue : 
        <span className="text-blue-900 font-bold"> {totalRevenue.toLocaleString()} EGP</span>
    </p>
    <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false}/>
                <XAxis dataKey="label" tick={{ fontSize : 12}}/>
                <YAxis tick={{ fontSize: 12 }}/>
                <Tooltip formatter={(v) => `${Number(v).toLocaleString()} EGP`}/>
                <Area type="monotone" dataKey="revenue" stroke="#1e3a8a" fill="#dbeafe" />
            </AreaChart>
        </ResponsiveContainer>
    </div>

    </div>

    <div className=" grid grid-cols-2 gap-4"> 
        <div className="rounded-2xl bg-white border border-gray-300 overflow-hidden mt-5">

            <div className="flex justify-between p-4">
            <div className="flex items-center gap-2 text-blue-900 text-xl font-bold">
            <ShoppingCart className="w-5 h-5" />
            Recent Orders
            </div>
            <Link href="/Order" className="text-gray-500 font-bold hover:underline text-sm">View all</Link>
            </div>
            <div className="overflow-x-auto ">
            <table className="w-full text-sm">
                <thead>
                    <tr className="bg-gray-300 ">
                        <th className={th}>Order Id</th>
                        <th className={th}>Customer</th>
                        <th className={th}>Total</th>
                        <th className={th}>Status</th>
                        <th className={th}>Date</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {recentOrders.map((o) => {
                        const status = STATUS_CONFIG[o.status];
                        return (
                        <tr key={o.id}>
                            <td className={td}>#{o.id}</td>
                            <td className={td}>{o.firstName} {o.lastName}</td>
                            <td className={td}>{o.totalPrice} EGP</td>
                            <td >
                                <span className={`rounded-full px-3 py-1 font-bold ${status?.style ?? "bg-gray-100 text-gray-100"}`}>
                                    {status?.label ?? o.status}
                                </span>
                            </td>
                            <td className={td}>{new Date(o.createdAt).toDateString()}</td>
                            <td>
                            <Link href={`/Order/details/${o.id}`} className="text-gray-500 px-4 py-3 hover:underline">
                            View
                            </Link>
                            </td>
                        </tr>
                        );
                    })}
                </tbody>
            </table>
            </div>
        </div>

        <div className="rounded-2xl bg-white border border-gray-300 overflow-hidden mt-5">
            <div className="flex justify-between p-4">
            <div className="flex items-center gap-2 text-blue-900 text-xl font-bold">
            <ClipboardList className="w-5 h-5" />
            Recent Sell Requests
            </div>
            <Link href="/Order?tab=Equipments" className="text-gray-500 font-bold hover:underline text-sm">View all</Link>
            </div>
            <div className="overflow-x-auto">
            <table className="w-full text-sm">
                <thead>
                    <tr className="bg-gray-300 ">
                        <th className={th}>Equipments</th>
                        <th className={th}>Seller</th>
                        <th className={th}>Price</th>
                        <th className={th}>Status</th>
                        <th className={th}>Date</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {recentRequests.map((r) => {
                        const status = STATUS_CONFIG[r.status ?? ""];
                        return (
                        <tr key={r.id}>
                            <td className={td}>{r.name}</td>
                            <td className={td}>{r.sellerName ?? ""}</td>
                            <td className={td}>{r.askingPrice ?? r.price} EGP</td>
                            <td >
                                <span className={`rounded-full px-3 py-1 font-bold ${status?.style ?? "bg-gray-100 text-gray-100"}`}>
                                    {status?.label ?? r.status}
                                </span>
                            </td>
                            <td className={td}>{new Date(r.createdAt).toDateString()}</td>
                            <td>
                            <Link href={`/Order/${r.id}`}  className="text-gray-500 px-4 py-3 hover:underline">
                            View
                            </Link>
                            </td>
                        </tr>
                        );
                    })}
                </tbody>
            </table>
            </div>
        </div>
    </div>

    <div className="bg-white border border-gray-300 mt-5 overflow-hidden rounded-2xl px-4 pb-4">
        <div className="flex items-center gap-2 text-blue-900 font-bold p-4 text-xl">
        <Boxes className="w-5 h-5" />
        Inventory Overview
        </div>
        <div className="grid grid-cols-3 gap-3">
            {inventory.map((i) => {
            return (
            <div key={i.label} className={`rounded-2xl p-4 font-bold flex items-center gap-3 ${i.style}`}>
            <i.icon className="w-6 h-6" />
            <div>
            <div>{i.label}</div>
            <div className="text-2xl">{i.value}</div>
    </div>
</div>
            );}
            )}

        </div>

    </div>

    
    
        </main>
    );
}