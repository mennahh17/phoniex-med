"use client";
import Link from "next/link";
import { Plus, Search, Package, Eye, Pencil, Copy, Power, Trash2, RotateCcw } from "lucide-react";
import { useState , useEffect } from "react";

type product = {
    id : number;
    name : string;
    description : string | null;
    price  : number ;
    regularPrice : number | null;
    salePrice : number | null ; 
    costPrice : number | null;
    tax : number | null ;
    discount : number | null ;
    sku : string | null ;
    lowStockThreshold : number | null ;
    trackInventory : boolean ;
    manufacturer : string | null ;
    modelNumber : string | null ;
    partNumber : string | null ;
    warranty : string | null ; 
    deviceType : string | null ; 
    accessories  : string | null ; 
    manufactureYear : string | null ;
    weight : string | null ;
    dimensions : string | null ; 
    technicalSpecs : string | null ; 
    imageUrl : string | null ; 
    images : ProductImage[] ; 
    status : string | null ; 
    submittedBy : string | null ; 
    condition : string | null ; 
    brand : string | null ; 
    year : string | null ; 
    askingPrice : number | null ; 
    location : string | null ; 
    sellerName : string | null ; 
    sellerPhone : string | null ; 
    sellerEmail : string | null ; 
    sellerCompany : string | null ; 
    sellerMessage : string | null ; 
    documents  : string[] ; 
    stockStatus : string | null ; 
    quantity : number ;
    category : string | null;
    isActive : boolean ;
    createdAt : string ;
};

type ProductImage = {
    id : number ; 
    productId : number ;
    product  : product[] ;
    url : string ;
    createdAt : string ; 
};

const API_URL = "http://localhost:3000";

const STAT_CARDS = [
    {key : "total" , label : "Total Products"},
    {key : "active" , label : "Active Products"},
    {key : "out" , label : "Out of Stock"},
    {key : "low" , label : "Low Stock"},
];

const STOCK_CONFIG: Record<string, { label: string; style: string }> = {
    in: { label: "In Stock", style: "bg-green-100 text-green-700" },
    low: { label: "Low Stock", style: "bg-amber-100 text-amber-700" },
    out: { label: "Out of Stock", style: "bg-red-100 text-red-700" },
};

function getStock (p: product) {
    if (p.quantity === 0 ) return "out";
    if (p.quantity != null && p.lowStockThreshold !=null && p.quantity <= p.lowStockThreshold) return "low";
    return "in"; 
}

function getPrice(p: product) {
    return p.salePrice ?? p.regularPrice ?? p.price;
}

export default function ProductsPanel(){
    const [error , setError ] = useState<string | null>(null);
    const [loading , setLoading] = useState (true);
    const [products , setProducts] = useState<product[]>([]);
    const [statusFilter , setStatusFilter] = useState("total");
    const [search , setSearch ] = useState("");
    const [category , setCategory] = useState("all");
    const [manufacturer , setManufacturer] = useState("all");
    const [condition , setCondition] = useState("");
    const [stockFilter , setStockFilter] = useState("all");
    const [activeFilter , setActiveFilter] = useState("all");
    const [minPrice , setMinPrice] = useState("");
    const [maxPrice , setMaxPrice] = useState("");
    const [busyId , setBusyId ] = useState<number | null>(null);

    const term = search.trim().toLowerCase() ;

    const filteredProducts = products.filter((product) => {
        const price = product.salePrice ?? product.regularPrice ?? product.price;

    const matchesCategory = category === "all" || product.category === category ;
    const matchesManufacturer = manufacturer === "all" || product.manufacturer === manufacturer;
    const matchesCondition = condition === "" || product.condition === condition;
    const matchesStock = stockFilter === "all" || getStock(product) === stockFilter;
    const matchesActive = 
        activeFilter === "all" || 
        (activeFilter === "active" && product.isActive) || 
        (activeFilter === "inactive" && !product.isActive);

    const matchesMin = minPrice === "" || price >= Number(minPrice);
    const matchesMax = maxPrice === "" || price <= Number(maxPrice);
    const matchesSearch =
    term === "" || 
    product.name.toLowerCase().includes(term) || 
    (product.sku ?? "").toLowerCase().includes(term) ||
    (product.modelNumber ?? "").toLowerCase().includes(term);
    const matchesCard =
    statusFilter === "total" ||
    (statusFilter === "active" && product.isActive) ||
    getStock(product) === statusFilter;


    return (matchesCategory && matchesCondition && matchesManufacturer && matchesStock && matchesActive && matchesMax && matchesMin && matchesSearch && matchesCard);
    });


    useEffect(() => {
    async function fetchProducts(){
        try {
            const response = await fetch(`${API_URL}/products/admin`, {
                credentials : "include",
            });

            if (!response.ok) throw new Error (`Error ${response.status}`); 

            const data : product[] = await response.json();
            setProducts(data);
        }catch (err){
            setError(err instanceof Error ? err.message :"Something went wrong");

        }finally {
            setLoading(false);

        }
    }
    fetchProducts();
    }, []);

    const categories = Array.from(new Set(products.map((p) => p.category).filter(Boolean))) as string[];
    const manufacturers = Array.from(new Set(products.map((p) => p.manufacturer).filter(Boolean))) as string[];

    async function handleDelete (product: product) {
        if (!confirm(`Delete "${product.name}" ? this can't be undone`)) return;

        setBusyId(product.id);
        try {
            const response = await fetch(`${API_URL}/products/${product.id}`, {
            method: "DELETE",
            credentials: "include",
            });
            
            if (!response.ok) throw new Error (`Error ${response.status}`);
            setProducts((prev) => prev.filter((p) => p.id !== product.id));

            }catch (err){
                alert (err instanceof Error ? err.message : "Delete failed");
            }finally {
                setBusyId(null);
            }
        }   

        const iconBtn = "p-2 rounded-lg text-gray-500 hover:bg-blue-50 hover:text-blue-900 transition-colors disabled:opacity-40 cursor-pointer";

        async function handleDuplicate (product : product) {
            setBusyId(product.id);

            try {
                const response = await fetch(`${API_URL}/products`, {
                    method : "POST",
                    credentials : "include",
                    headers : { "content-type" : "application/json" },
                    body: JSON.stringify ({
                        name: `${product.name} (Copy)`,
                        description: product.description ?? undefined,
                        price: product.price,
                        regularPrice: product.regularPrice ?? undefined,
                        salePrice: product.salePrice ?? undefined,
                        costPrice: product.costPrice ?? undefined,
                        tax: product.tax ?? undefined,
                        discount: product.discount ?? undefined,
                        sku: product.sku ? `${product.sku}-COPY` : undefined,
                        quantity: product.quantity ?? undefined,
                        lowStockThreshold: product.lowStockThreshold ?? undefined,
                        trackInventory: product.trackInventory ?? undefined,
                        stockStatus: product.stockStatus ?? undefined,
                        manufacturer: product.manufacturer ?? undefined,
                        modelNumber: product.modelNumber ?? undefined,
                        partNumber: product.partNumber ?? undefined,
                        warranty: product.warranty ?? undefined,
                        deviceType: product.deviceType ?? undefined,
                        category: product.category ?? undefined,
                        condition: product.condition ?? undefined,
                        accessories: product.accessories ?? undefined,
                        manufactureYear: product.manufactureYear ?? undefined,
                        weight: product.weight ?? undefined,
                        dimensions: product.dimensions ?? undefined,
                        technicalSpecs: product.technicalSpecs ?? undefined,
                        images: product.images.map((img) => img.url),
                    }),
                });

                if (!response.ok) throw new Error (`Error ${response.status}`);
                const created: product = await response.json();
                setProducts((prev) => [created, ...prev]);
            }
            catch(err) {
                alert (err instanceof Error ? err.message : "Duplicate failed");
            }
            finally {
                setBusyId(null);
            }
        }

        function resetFilters (){
            setStatusFilter("total")
            setSearch("");
            setCategory("all");
            setManufacturer("all");
            setCondition("");
            setStockFilter("all");
            setActiveFilter("all");
            setMinPrice("");
            setMaxPrice("");
            }

        async function handleToggleActive (product : product) {
            const next = !product.isActive;
            setBusyId(product.id);

            try {
            const response = await fetch(`${API_URL}/products/${product.id}`, {
                method : "PATCH",
                credentials : "include",
                headers : { "Content-Type" : "application/json" },
                body : JSON.stringify({ isActive : next}),
            });
            if (!response.ok) throw new Error (`Error ${response.status}`);
            setProducts((prev) => prev.map((p) => (p.id === product.id ? { ...p, isActive: next } : p)));
        }
            catch (err){
                alert (err instanceof Error ? err.message : "update failed");
            } finally {
                setBusyId(null);
            }
        }

        if (loading) return <p className="p-10 text-gray-500">Loading products...</p>;
        if (error) return <p className="p-10 text-red-600">{error}</p>;

    return(
        <main className="font-fredoka">

            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mt-10">
                <div>
                    <div className="text-blue-900 text-2xl font-bold ">Products</div>
                    <div className="text-gray-500 text-sm">Manage your medical equipment, pricing, and inventory</div>
                </div>

                <Link href="/Addproduct"
                className="inline-flex  items-center gap-2 text-white font-bold bg-blue-900 py-2.5 w-fit rounded-2xl px-7 transition-all hover:bg-blue-800 hover:-translate-y-0.5 hover:shadow-lg active:scale-95">
                <Plus className="w-4 h-4"/>
                Add Product
                </Link>
            </div>

            <div className="grid grid-cols-4 gap-4 py-5">
                {STAT_CARDS.map((card) => {
                    const  active = statusFilter === card.key; 
                    const count = 
                    card.key == "total" ? products.length 
                    : card.key === "active" ? products.filter((p) => p.isActive).length
                    : products.filter((p) => getStock(p) === card.key).length;

                    
                    return (
                        <button
                        key = {card.key}
                        onClick = {() => setStatusFilter(card.key)}
                        className={`rounded-2xl text-left p-4 border transition-all ${
                            active ? "bg-blue-900 text-white " : "bg-gray-200 text-blue-900"}`}>
                            <p className=" font-bold">{card.label}</p>
                            <p className="text-xl font-bold ">{count}</p>
                        </button>
                    );
                })}
            </div>

            <div className="rounded-2xl bg-white w-full border border-gray-300 py-3">
                <div className="relative mx-5 mb-4">
                    <Search className="text-gray-300 w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2"/>
                    <input
                    type="text"
                    value ={search}
                    placeholder="Search by product name , SKU , model..."
                    onChange = {(e) => setSearch(e.target.value)}
                    className="w-full bg-white border border-gray-300 rounded-2xl pl-11 pr-4 py-3 text-sm text-gray-900 font-fredoka
                        focus:outline-none focus:border-blue-900">
                    </input>
                </div>

                <div className="flex flex-wrap gap-3 mx-5 mb-4 gap-4">
                    <select value={category}
                        onChange ={(e) => setCategory(e.target.value)}
                        className="text-gray-500 rounded-2xl py-2 px-3 w-fit border border-gray-300 cursor-pointer"
                    >
                        <option value ="all">All Category</option>
                        {categories.map((c) => (
                            <option key={c} value={c}>{c}</option>
                        ) 
                        )}
                    </select>

                    <select
                        value = {manufacturer}
                        onChange = {(e) => setManufacturer(e.target.value)}
                        className="text-gray-500 rounded-2xl py-2 border border-gray-300 text-center cursor-pointer w-fit">
                        <option value="all">All Manufacturer</option>
                        {manufacturers.map((m) => (
                            <option key={m} value={m}> {m}</option>
                        ))}
                    </select>

                    
                    <select value ={condition} 
                    onChange={(e) => setCondition(e.target.value)}
                    className="text-gray-500 rounded-2xl py-2 border border-gray-300 text-center cursor-pointer w-fit">
                        <option value="">Condition</option>
                        <option value="new">New</option>
                        <option value="used">Used</option>
                        <option value="refurbished">refurbished</option>
                    </select>

                    <select value ={stockFilter}
                    onChange = {(e) => setStockFilter(e.target.value)}
                    className="text-gray-500 rounded-2xl py-2 border border-gray-300 text-center cursor-pointer w-fit">
                        <option value="all">Any stock</option>
                        <option value="in">In stock</option>
                        <option value="low">low stock</option>
                        <option value="out">Out of stock</option>
                    </select>

                    <select value ={activeFilter}
                    onChange = {(e) => setActiveFilter(e.target.value)}
                    className="text-gray-500 rounded-2xl py-2 border border-gray-300 text-center cursor-pointer w-fit">
                        <option value="all">Active and inactive</option>
                        <option value="active">Active only</option>
                        <option value="inactive">Inactive only</option>
                    </select>

                    <div className="flex items-center gap-2">
                        <input
                        type ="number"
                        value={minPrice}
                        placeholder ="Min EGP"
                        onChange = {(e) => setMinPrice(e.target.value)}
                        className="text-gray-700 rounded-2xl py-2 px-3 border border-gray-300 w-28"
                        />
                        <span className="text-gray-400">-</span>
                        <input
                        type ="number"
                        value={maxPrice}
                        placeholder ="Max EGP"
                        onChange = {(e) => setMaxPrice(e.target.value)}
                        className="text-gray-700 rounded-2xl py-2 px-3 border border-gray-300 w-28"
                        />
                    </div>

                    <button
                    type="button"
                    onClick={resetFilters}
                    className="ml-auto inline-flex items-center gap-1 text-sm text-gray-500 hover:text-blue-900 px-3 py-2"
                    >
                    <RotateCcw className="w-4 h-4" />
                    Reset
                    </button>

                </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-300 mt-4 overflow-hidden">
                <div className="overflow-x-auto"> 
                    <table className="w-full text-sm">
                        <thead className="bg-gray-200">
                            <tr>
                                <th className ="text-left px-5 py-3 text-blue-900">Product</th>
                                <th className ="text-left px-5 py-3 text-blue-900">SKU</th>
                                <th className ="text-left px-5 py-3 text-blue-900">Category</th>
                                <th className ="text-left px-5 py-3 text-blue-900">Price</th>
                                <th className ="text-left px-5 py-3 text-blue-900">Stock</th>
                                <th className ="text-left px-5 py-3 text-blue-900">Status</th>
                                <th className ="text-left px-5 py-3 text-blue-900">Actions</th>
                            </tr>
                        </thead>
                        <tbody>

                            {filteredProducts.map((p) => {
                            const stock = STOCK_CONFIG[getStock(p)];
                            const active = p.isActive !== false ;
                            const image = p.images?.[0]?.url;
                            
                            return(
                            <tr key={p.id} className={`hover:bg-blue-50 transition-colors ${active ? "" : "opacity-60"}`}>
                                <td className="px-5 py-4">
                                    <div className="flex items-center gap-3">
                                    {image ? (
                                    <img src={image} alt={p.name} className="w-10 h-10 rounded-lg object-cover" />
                                    ) : (
                                    <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                                    <Package className="w-4 h-4 text-gray-400" />
                                    </div>
                                )}
                            <div>
                                <p className="font-bold text-blue-900">{p.name}</p>
                                <p className="text-xs text-gray-500">{p.manufacturer ?? "—"}</p>
                                </div>
                                    </div>
                                </td>

                                <td className="px-5 py-3 text-gray-600 whitespace-nowrap">{p.sku ?? "—"}</td>
                                <td className="px-5 py-3 text-gray-600 whitespace-nowrap capitalize">{p.category ?? "—"}</td>
                                <td className="px-5 py-3 text-gray-600 whitespace-nowrap">
                                {getPrice(p).toLocaleString()} EGP
                                </td>

                                <td className="px-5 py-3 text-gray-600">{p.quantity ?? "—"}</td>
                                <td className="px-5 py-3 ">
                                    <span className={`rounded-full px-3 py-1 text-xs font-bold whitespace-nowrap ${stock.style}`}>
                                        {stock.label}
                                    </span>
                                </td>

                                
                                <td className="px-5 py-3">
                                <div className="flex items-center justify-end gap-1">
                                
                                <Link href={`/Products/${p.id}`} title="View" className={iconBtn} >
                                    <Eye className=" w-4 h-4"/>
                                </Link>

                                <Link
                                href={`/Products/${p.id}/edit`} title="Edit" className={iconBtn}>
                                <Pencil className=" w-4 h-4"/>
                                </Link>

                                <button type="button" title="Duplicate" className={iconBtn}
                                onClick ={() => handleDuplicate(p)}
                                disabled={ busyId === p.id }>
                                    < Copy className=" w-4 h-4"/>
                                </button>

                                <button 
                                type = "button"
                                title = {p.isActive ? "Deactiviate" : "Activate"}
                                onClick = {() => handleToggleActive(p)}
                                disabled={busyId === p.id}
                                className={`${iconBtn} ${p.isActive ? "" : "text-green-600"}`}>
                                    <Power className=" w-4 h-4"/>
                                </button>

                                <button
                                type="button"
                                title="Delete"
                                onClick = {() => handleDelete(p)}
                                disabled={busyId === p.id} className={iconBtn}>
                                    <Trash2 className=" w-4 h-4"/>
                                </button>

                                </div>
                                </td>
                                

                            </tr>
                                );
                            })}

                        </tbody>

                    </table>

                </div>

            </div>
        </main>
    );
}