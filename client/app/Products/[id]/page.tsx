"use client"
import {useState , useEffect , use} from "react";
import {useCart} from "@/context/CartContext";
import {Minus , Plus } from "lucide-react";

type Product ={
    id : number , 
    name : string ,
    description : string , 
    price : number ,
    status : string , 
    condition : string ,
    brand : string,
    year : string ,
    stockStatus : string,
    imgUrl : string,
}

export default function ProductDetails({params} : {params : Promise<{id:string}>}){

    const {id} = use (params);

    const [name , setName] =useState("");
    const [description , setDescription] = useState("");
    const [price , setPrice] =useState("");
    const [status , setStatus] = useState("");
    const [condition , setCondition] =useState("");
    const [brand , setBrand]=useState("");
    const [year , setYear] = useState("");
    const [stockQuantity , setStockQuantity] = useState(0);
    const [imgUrl , setimgUrl] =useState("");
    const [products , setProducts]=useState<Product[]>([]);
    const {addToCart} = useCart();
    const [quantity , setQuantity] = useState(1);
    const [images , setImages] = useState <{id:number ; url:string } []>([]);

    useEffect(()=>{
        async function getProducts(){
    const response = await fetch (`http://localhost:3000/products/${id}`,{
        method:"GET" ,
    })
    const data =await response.json();
    setName(data.name);
    setDescription(data.description);
    setPrice(data.price);
    setStatus(data.status);
    setCondition(data.condition);
    setBrand(data.brand);
    setYear(data.year);
    setStockQuantity(data.quantity);
    setimgUrl(data.imageUrl);
    setImages (data.images || []);
        }
        getProducts();
    },[id]);

    return (
        <main>

            <div className="min-h-screen flex justify-center items-center px-6 py-10 ">
                <div className="rounded-2xl shadow-2xl px-10 py-5 max-w-7xl w-full min-h-[800px] flex overflow-hidden bg-blue-900">
                    
<div className="flex-1 bg-white rounded-2xl mt-10 mb-10 mx-10 flex flex-col items-center gap-3 p-4">
    {imgUrl && (
        <img src={imgUrl} alt={name} className="w-full h-64 object-cover rounded-xl" />
    )}
    <div className="flex gap-2">
        {images.map((img) => (
            <img
                key={img.id}
                src={img.url}
                alt={name}
                className="w-16 h-16 object-cover rounded"
            />
        ))}
    </div>
</div>

                    <div className="flex-1 bg-blue-900/50 p-10 flex flex-col justify-between">
                        <div className="font-oleo-script py-10 px-10 text-2xl">Product Details</div>
                                <div className="text-lg font-bold font-fredoka">{name}</div>
                                <div className="py-3 font-fredoka">{description}</div>
                                <div className="text-xl font-cantora-one">Price : ${price}</div>

                                <div className="flex flex-1 justify-between items-center font-fredoka">
                                <div>{stockQuantity} in stock</div>
                                <div className="flex items-center gap-5 py-3">
                                <Minus className="border border-rounded rounded-lg px-1"
                                onClick ={() => setQuantity(quantity - 1)}/>
                                <span>{quantity}</span>
                                <Plus className="border border-rounded rounded-lg"
                                onClick ={() => setQuantity(quantity + 1)}/>
                                </div>
                                

                                <div className="flex justify-center py-3">
                                <button
                                onClick = {() => addToCart({ id :Number(id) , name : name , price :Number(price)})}
                                className="py-2 px-5 font-bold text-blue-900 bg-white rounded-2xl shadow-2xl font-fredoka"
                                >Add to cart</button>
                                </div>
                                </div>
                        </div>
                    </div>
            </div>


        </main>
    )
}