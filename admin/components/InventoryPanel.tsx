"use client";
import Link from "next/link";
import { Plus, Package, Download, CheckCircle2, AlertTriangle, XCircle, Wallet, TrendingUp, Percent, Eye, Pencil, PackagePlus, History, Boxes, Search, ChevronLeft, ChevronRight, Power } from "lucide-react";
import { useState , useEffect } from "react";
import StockModal from "@/components/StockModal";

type Products = {
    id : number ; 
    name : string ;
    sku : string | null ; 
    modelNumber : string | null ;
    price : number;
    regularPrice: number | null;
    salePrice: number | null;
    costPrice: number | null;
    quantity : number ;
    lowStockThreshold : number | null;
    category: string | null;
    condition: string | null;
    manufacturer: string | null;
    isActive: boolean;
    images: { id: number; url: string }[];
    createdAt: string;
    updatedAt:string;
};

type Movement = {
    id: number;
    productId: number;
    product: { name: string; sku: string | null };
    change: number;
    previousQty: number;
    newQty: number;
    reason: string;
    note: string | null;
    adminEmail: string;
    createdAt: string;
};

const API_URL = "http://localhost:3000";

function getPrice(p : Products){
    return p.salePrice ?? p.regularPrice ?? p.price;
};

function exportCSV (rows :  Products[]) {
    const header = ["Name", "SKU", "Category", "Manufacturer", "Condition", "Quantity", "Threshold", "Status", "Price", "Cost" ];
    const lines = rows.map((p) => 
    [p.name, p.sku, p.category, p.manufacturer, p.condition, p.quantity, p.lowStockThreshold,
            STOCK_CONFIG[getStock(p)].label, getPrice(p), p.costPrice]
            .map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`)
            .join(","),
    );

    const blob = new Blob([[header.join(",") , ...lines].join("\n")], {type : "text/csv"});
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `inventory-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
}

function getStock(products : Products) {
    if (products.quantity === 0) return "out";
    if (products.lowStockThreshold != null && products.quantity <= products.lowStockThreshold) return "low";
    else {
        return "in"; 
    }
};

const STOCK_CONFIG : Record <string, {label: string ; style : string ; bar: string }> = {
    in: { label: "In Stock", style: "bg-green-100 text-green-700", bar: "bg-green-500" },
    low: { label: "Low Stock", style: "bg-amber-100 text-amber-700", bar: "bg-amber-500" },
    out: { label: "Out of Stock", style: "bg-red-100 text-red-700", bar: "bg-red-500" },
};

const TABS = [
    {key : "inventory" , label:"All inventory" , icon: Boxes},
    {key : "history" , label : "Stock History" , icon: History},
];

export default function InventoryPanel(){
    const [products , setProducts]= useState<Products[]>([]);
    const [error , setError] = useState<string| null>(null);
    const [loading , setLoading] = useState(true);
    const [tab , setTab ] =useState("inventory");
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("all");
    const [stockFilter, setStockFilter] = useState("all");
    const [condition, setCondition] = useState("all");
    const [sortBy, setSortBy] = useState("newest");
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [modalProduct, setModalProduct] = useState<Products | null>(null);    
    const [busyId, setBusyId] = useState<number | null>(null);
    const [history, setHistory] = useState<Movement[]>([]);
    const [historyLoading, setHistoryLoading] = useState(false);
    const [historyError, setHistoryError] = useState<string | null>(null);
    const [historyProduct, setHistoryProduct] = useState<Products | null>(null);
    const [historyVersion, setHistoryVersion] = useState(0);

    useEffect(() => {
        async function fetchProducts (){
            try {
                const response = await fetch (`${API_URL}/products/admin` , {
                credentials : "include",
                });
            if(!response.ok) throw new Error (`Error ${response.status}`);    
            const data : Products[] = await response.json();
            setProducts(data);
            }catch(err){
                setError(err instanceof Error ? err.message : "Something went wrong");
            }finally {
                setLoading(false);
            }
        }
        fetchProducts();
    }, []);

    useEffect(() => {
    if (tab !== "history") return;
    async function fetchHistory() {
        setHistoryLoading(true);
        setHistoryError(null);
        try {
            const response = await fetch(`${API_URL}/products/stock-history`, { credentials: "include" });
            if (!response.ok) throw new Error(`Error ${response.status}`);
            setHistory(await response.json());
        } catch (err) {
            setHistoryError(err instanceof Error ? err.message : "Could not load history");
        } finally {
            setHistoryLoading(false);
        }
    }
    fetchHistory();
}, [tab, historyVersion]);

    if (loading) return <p className="p-10 text-gray-500">Loading inventory...</p>;
    if (error) return <p className="p-10 text-red-600">{error}</p>;
    
    const lastUpdated = products.length
        ? products.reduce((latest, p) => (p.updatedAt > latest ? p.updatedAt : latest), products[0].updatedAt)
        : null;

    const totalProducts = products.length;
    const totalUnits = products.reduce((sum, p) => sum + p.quantity, 0);
    const inStock = products.filter((p) => getStock(p) === "in").length;
    const outStock = products.filter((p) => getStock(p) === "out").length;
    const lowStock = products.filter((p) =>  getStock(p) === "low").length;

    const stats = [
        {label : "Total Products" , value : totalProducts , icon : Package , title : `${totalUnits} units in stock` , style : "bg-blue-50 text-blue-900"},
        {label : "In Stock" , value : inStock , icon: CheckCircle2 , title : "Avalible for purchase" , style : "bg-green-50 text-green-700"},
        {label : "low Stock" , value : lowStock , icon : AlertTriangle , title : "need restocking" , style : "bg-amber-50 text-amber-700"},
        {label : "Out of Stock" , value : outStock , icon : XCircle , title : "currently unavaliable" , style : "bg-red-50 text-red-700"},
    ];

    const distribution = [
        { key: "in", count: inStock },
        { key: "low", count: lowStock },
        { key: "out", count: outStock },
    ];

    const totalCost = products.reduce((sum , p ) => sum + (p.costPrice ?? 0) * p.quantity , 0);
    const salesValue = products.reduce((sum , p ) => sum + getPrice(p) * p.quantity , 0);
    const margin = salesValue > 0 ? ((salesValue -  totalCost)/salesValue)*100 : 0 ; 

    const valueCards =[
        {label : "Total Inventory Cost" , value : `${totalCost.toLocaleString()} EGP` , icon: Wallet},
        {label : "Potenial Sales Value" , value : `${salesValue.toLocaleString()} EGP` , icon : TrendingUp },
        {label : "Estimated Margin" , value : `${margin.toFixed(1)} %` , icon : Percent}
    ];

    const alerts = products.filter((p) => getStock(p) !== "in").sort((a,b) => a.quantity - b.quantity);

    const th = "text-left px-4 py-3 text-blue-900 whitespace-nowrap";
    const td = "px-4 py-3 text-gray-600 whitespace-nowrap";
    const iconBtn = "p-2 rounded-lg text-gray-500 hover:bg-blue-50 hover:text-blue-900 transition-colors disabled:opacity-40 cursor-pointer";

    const categories = Array.from(new Set(products.map((p) => p.category).filter(Boolean))) as string[];
    const term = search.trim().toLowerCase();

    const filteredProducts = products.filter((p) => {
    const matchesSearch =
        term === "" ||
        p.name.toLowerCase().includes(term) ||
        (p.sku ?? "").toLowerCase().includes(term) ||
        (p.modelNumber ?? "").toLowerCase().includes(term) ||
        (p.manufacturer ?? "").toLowerCase().includes(term);
    const matchesCategory = category === "all" || p.category === category;
    const matchesStock = stockFilter === "all" || getStock(p) === stockFilter;
    const matchesCondition = condition === "all" || p.condition === condition;

    return matchesSearch && matchesCategory && matchesStock && matchesCondition;
});

const sorted = [...filteredProducts].sort((a, b) => {
    if (sortBy === "name") return a.name.localeCompare(b.name);
    if (sortBy === "stockAsc") return a.quantity - b.quantity;
    if (sortBy === "stockDesc") return b.quantity - a.quantity;
    return +new Date(b.createdAt) - +new Date(a.createdAt);
});

const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
const currentPage = Math.min(page, totalPages);
const pageRows = sorted.slice((currentPage - 1) * pageSize, currentPage * pageSize);

const visibleHistory = historyProduct
    ? history.filter((m) => m.productId === historyProduct.id)
    : history;

function handleStockSaved(updated: Products) {
    setProducts((prev) => prev.map((p) => (p.id === updated.id ? { ...p, ...updated } : p)));
    setModalProduct(null);
    setHistoryVersion((v) => v + 1);
}

function openHistory(p: Products | null) {
    setHistoryProduct(p);
    setTab("history");
}

async function handleToggleActive(p: Products) {
    setBusyId(p.id);
    try {
        const response = await fetch(`${API_URL}/products/${p.id}`, {
            method: "PATCH",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ isActive: !p.isActive }),
        });
        if (!response.ok) throw new Error(`Error ${response.status}`);
        setProducts((prev) => prev.map((x) => (x.id === p.id ? { ...x, isActive: !p.isActive } : x)));
    } catch (err) {
        alert(err instanceof Error ? err.message : "Update failed");
    } finally {
        setBusyId(null);
    }
}

    return (
        <main className="font-fredoka">

            <div className="flex flex-col sm:justify-between sm:items-end sm:flex-row gap-4 mt-10">
                <div>
                    <div className="text-blue-900 text-2xl font-bold ">Inventory Overview</div>
                    <div className="text-gray-500 text-sm">Track stock levels, monitor availability, and keep your medical equipment inventory organized</div>
                    {lastUpdated && <div className="text-sm text-gray-500">Last updated: {new Date(lastUpdated).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })} </div>}
                </div>

                <div className="flex gap-3">
                    <button className="inline-flex gap-2 text-center rounded-2xl border border-blue-900 text-blue-900 font-bold w-fit px-7 py-2 transition-all hover:bg-blue-900 hover:text-white hover:shadow-2xl hover:-translate-y-0.5 cursor-pointer"
                    type = "button"
                    onClick={() => exportCSV(products)}
                    >
                        <Download className="text-blue-900 w-5 h-5"/>
                        Export</button>
                    <Link href="/Addproduct" className="inline-flex bg-blue-900 text-white w-fit px-7 py-2 rounded-2xl gap-2 items-center font-bold hover:bg-white border border-blue-900 hover:text-blue-900 transition-all hover:shadow-2xl hover:-translate-y-0.5">
                    <Plus className="w-5 h-5"/>
                    Add Product</Link>
                </div>
            </div>

            <div className="grid grid-cols-4 gap-4 py-5">
                {stats.map((p) => {
                    return (
                <div key={p.label} className="bg-white border border-gray-300 rounded-2xl p-4 flex justify-between items-start">
                    <div>
                        <div className="text-sm text-gray-500">{p.label}</div>
                        <div className="text-blue-900 text-xl font-bold">{p.value}</div>
                        <div className="text-sm text-gray-500">{p.title}</div>
                    </div>
                    <div className={`p-3 rounded-xl ${p.style}`}>
                        <p.icon className="w-6 h-6 "/>
                    </div>
                </div>
                );
                })
                }
            </div>

        <div className="grid grid-cols-2 gap-6">
            <div className="bg-white border border-gray-300 rounded-2xl p-4">
                <div className="text-blue-900 text-xl font-bold">Stock Status</div>
                <p className="text-gray-500 text-sm mb-4">Overview of product availability</p>
                <div className="flex flex-col gap-4">
                    {distribution.map((d) => {
                        const config = STOCK_CONFIG[d.key];
                        const percent = totalProducts ? Math.round((d.count / totalProducts) *100):0;
                        return (
                            <div key={d.key}>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-blue-900 font-bold">{config.label}</span>
                                    <span className="text-gray-500">{d.count} products · {percent}%</span>
                                </div>
                                <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                                    <div className={`h-full rounded-full ${config.bar}`} style={{ width: `${percent}%` }} />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        
            <div className="bg-white border border-gray-300 rounded-2xl p-4">
                <div className="flex items-center text-blue-900 gap-2 text-xl font-bold ">
                    <AlertTriangle className="w-5 h-5 text-amber-500"/>
                    Low Stock Alerts</div>
                <p className="text-gray-500 text-sm mb-4">{alerts.length} products need attention</p>

                {alerts.length === 0 ? (
                    <div className="flex flex-col items-center gap-2 py-8 text-gray-400">
                        <CheckCircle2 className="w-8 h-8 text-green-500" />
                        <p>All products are well stocked</p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-2">
                        {alerts.slice(0,4).map((p) => {
                            const config =STOCK_CONFIG[getStock(p)];
                            return (
                    <div key={p.id} className="flex items-center gap-3 rounded-xl bg-gray-50 p-3">
                    <div className="flex-1 min-w-0">
                    <p className="text-blue-900 font-bold truncate">{p.name}</p>
                    <p className="text-gray-400 text-xs">{p.sku ?? "No SKU"}</p>
                    </div>
                    <div className="text-right shrink-0">
                    <p className="text-sm text-gray-600">{p.quantity} units left</p>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${config.style}`}>
                    {config.label}
                    </span>
                    </div>
                    <button type="button" title="Update stock" onClick={() => setModalProduct(p)} className={iconBtn}>
                    <PackagePlus className="w-4 h-4" />
                    </button>
                    </div>
                );
                        })}
                    </div>
                )}
            </div>
        </div>  

    <div className="py-4"></div>

        <div className="bg-white border border-gray-300 rounded-2xl p-4">
            <div className="text-blue-900 text-xl font-bold">Inventory Value</div>
            <p className="text-sm text-gray-500">Based on current stock</p>
            <div className="grid grid-cols-3 gap-6 py-5">
                {valueCards.map((v) => {
                    return (
                        <div key={v.label}>
                            <div className="flex items-center gap-4 border border-gray-300 rounded-2xl p-6">
                                <div className="bg-blue-100 rounded-2xl p-3">
                                <v.icon className="w-6 h-6 text-blue-900 "/>
                                </div>
                                <div>
                                    <div className="text-gray-500 text-sm whitespace-nowrap">{v.label}</div>
                                    <div className="text-blue-900 text-lg font-bold">{v.value}</div>
                                </div>
                            </div>
                        </div>    
                    );
                })}
            </div>
        </div>

        <div className="flex gap-3 mt-5 border-b border-gray-300">
            {TABS.map((t) => {
                const active = tab === t.key;
                return (
                    <div key={t.key} >
                        <button 
                        key={t.key}
                        onClick={() => (t.key === "history" ? openHistory(null) : setTab("inventory"))}
                        className={`px-4 py-2.5 font-bold border-b-2 -mb-px transition-colors cursor-pointer text-xl ${
                        active ? "border-blue-900 text-blue-900" : "border-transparent text-gray-400 hover:text-blue-900"}`}>{t.label}</button>
                    </div>
                );
            })}
        </div>

        {tab === "inventory" && (
    <>
        <div className="bg-white border border-gray-300 rounded-2xl p-4 mt-4 flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-64">
                <Search className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by name, SKU, model, or manufacturer..."
                    className="w-full border border-gray-300 rounded-2xl pl-11 pr-4 py-2.5 text-sm focus:outline-none focus:border-blue-900"
                />
            </div>

            <select value={category} onChange={(e) => setCategory(e.target.value)} className="text-gray-600 rounded-2xl py-2.5 px-3 border border-gray-300 text-sm cursor-pointer">
                <option value="all">All categories</option>
                {categories.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>

            <select value={stockFilter} onChange={(e) => setStockFilter(e.target.value)} className="text-gray-600 rounded-2xl py-2.5 px-3 border border-gray-300 text-sm cursor-pointer">
                <option value="all">Any stock</option>
                <option value="in">In stock</option>
                <option value="low">Low stock</option>
                <option value="out">Out of stock</option>
            </select>

            <select value={condition} onChange={(e) => setCondition(e.target.value)} className="text-gray-600 rounded-2xl py-2.5 px-3 border border-gray-300 text-sm cursor-pointer">
                <option value="all">Any condition</option>
                <option value="new">New</option>
                <option value="used">Used</option>
                <option value="refurbished">Refurbished</option>
            </select>

            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="text-gray-600 rounded-2xl py-2.5 px-3 border border-gray-300 text-sm cursor-pointer">
                <option value="newest">Newest added</option>
                <option value="name">Name (A–Z)</option>
                <option value="stockAsc">Stock (low → high)</option>
                <option value="stockDesc">Stock (high → low)</option>
            </select>
        </div>

        <div className="bg-white border border-gray-300 rounded-2xl overflow-hidden mt-4">
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className={th}>Product</th>
                            <th className={th}>SKU</th>
                            <th className={th}>Category</th>
                            <th className={th}>Condition</th>
                            <th className={th}>Stock</th>
                            <th className={th}>Threshold</th>
                            <th className={th}>Status</th>
                            <th className={th}>Updated</th>
                            <th className={th}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {pageRows.map((p) => (
                            <tr key={p.id} className={`border-t border-gray-100 hover:bg-blue-50 ${p.isActive ? "" : "opacity-60"}`}>
                                <td className={td}>
                                    <div className="flex items-center gap-3">
                                        {p.images?.[0]?.url ? (
                                            <img src={p.images[0].url} alt={p.name} className="w-10 h-10 rounded-lg object-cover" />
                                        ) : (
                                            <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                                                <Package className="w-4 h-4 text-gray-400" />
                                            </div>
                                        )}
                                        <div>
                                            <p className="text-blue-900 font-bold">{p.name}</p>
                                            <p className="text-xs text-gray-400">{p.manufacturer ?? "—"}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className={td}>{p.sku ?? "—"}</td>
                                <td className={`${td} capitalize`}>{p.category ?? "—"}</td>
                                <td className={`${td} capitalize`}>{p.condition ?? "—"}</td>
                                <td className={`${td} text-blue-900 font-bold`}>{p.quantity}</td>
                                <td className={td}>{p.lowStockThreshold ?? "—"}</td>
                                <td className={td}>
                                    <span className={`rounded-full px-3 py-1 text-xs font-bold ${STOCK_CONFIG[getStock(p)].style}`}>
                                        {STOCK_CONFIG[getStock(p)].label}
                                    </span>
                                </td>
                                <td className={td}>
                                    {new Date(p.updatedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                                </td>
                                <td className={td}>
                                    <div className="flex items-center gap-1">
                                        <Link href={`/Products/${p.id}`} title="View" className={iconBtn}>
                                            <Eye className="w-4 h-4" />
                                        </Link>
                                        <Link href={`/Products/${p.id}/edit`} title="Edit" className={iconBtn}>
                                            <Pencil className="w-4 h-4" />
                                        </Link>
                                        <button type="button" title="Update stock" onClick={() => setModalProduct(p)} className={iconBtn}>
                                        <PackagePlus className="w-4 h-4" />
                                        </button>
                                        <button type="button" title="Stock history" onClick={() => openHistory(p)} className={iconBtn}>
                                        <History className="w-4 h-4" />
                                        </button>
                                        <button
                                        type="button"
                                        title={p.isActive ? "Deactivate" : "Activate"}
                                        onClick={() => handleToggleActive(p)}
                                        disabled={busyId === p.id}
                                        className={`${iconBtn} ${p.isActive ? "" : "text-green-600"}`}
                                        >
                                        <Power className="w-4 h-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {pageRows.length === 0 && (
                            <tr>
                                <td colSpan={9} className="text-center py-10 text-gray-400">No products match your filters</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                    Rows per page
                    <select value={pageSize} onChange={(e) => setPageSize(Number(e.target.value))} className="border border-gray-300 rounded-xl px-2 py-1 cursor-pointer">
                        <option value={10}>10</option>
                        <option value={25}>25</option>
                        <option value={50}>50</option>
                    </select>
                    <span>· {sorted.length} products</span>
                </div>
                <div className="flex items-center gap-2">
                    <button type="button" onClick={() => setPage(currentPage - 1)} disabled={currentPage === 1} className={iconBtn}>
                        <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span>Page {currentPage} of {totalPages}</span>
                    <button type="button" onClick={() => setPage(currentPage + 1)} disabled={currentPage === totalPages} className={iconBtn}>
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    </>
)}

{tab === "history" && (
    <div className="bg-white border border-gray-300 rounded-2xl overflow-hidden mt-4">
        {historyProduct && (
            <div className="flex items-center justify-between px-4 py-3 bg-blue-50 text-sm">
                <span className="text-blue-900">Showing history for <b>{historyProduct.name}</b></span>
                <button type="button" onClick={() => setHistoryProduct(null)} className="text-blue-900 hover:underline cursor-pointer">
                    Show all
                </button>
            </div>
        )}

        {historyLoading && <p className="p-10 text-center text-gray-500">Loading history...</p>}
        {historyError && <p className="p-10 text-center text-red-600">{historyError}</p>}

        {!historyLoading && !historyError && (
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className={th}>Date</th>
                            <th className={th}>Product</th>
                            <th className={th}>Change</th>
                            <th className={th}>Before → After</th>
                            <th className={th}>Reason</th>
                            <th className={th}>Notes</th>
                            <th className={th}>Updated by</th>
                        </tr>
                    </thead>
                    <tbody>
                        {visibleHistory.map((m) => (
                            <tr key={m.id} className="border-t border-gray-100">
                                <td className={td}>
                                    {new Date(m.createdAt).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                                </td>
                                <td className={`${td} text-blue-900 font-bold`}>{m.product.name}</td>
                                <td className={`${td} font-bold ${m.change > 0 ? "text-green-600" : "text-red-600"}`}>
                                    {m.change > 0 ? `+${m.change}` : m.change}
                                </td>
                                <td className={td}>{m.previousQty} → {m.newQty}</td>
                                <td className={td}>{m.reason}</td>
                                <td className={`${td} max-w-xs truncate`}>{m.note ?? "—"}</td>
                                <td className={td}>{m.adminEmail}</td>
                            </tr>
                        ))}
                        {visibleHistory.length === 0 && (
                            <tr>
                                <td colSpan={7} className="text-center py-10 text-gray-400">No stock movements yet</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        )}
    </div>
)}
{modalProduct && (
    <StockModal product={modalProduct} onClose={() => setModalProduct(null)} onSaved={handleStockSaved} />
)}
        </main>
    );
}