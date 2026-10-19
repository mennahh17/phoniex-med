'use client'
import {ChevronDown , CircleCheck} from "lucide-react";
import {useState} from "react";
import {useCart} from "@/context/CartContext";
import {useRouter } from "next/navigation";
import Link  from "next/link";

export default function checkout(){

    const [email , setEmail] = useState("");
    const [phone , setPhone] = useState("");
    const [country , setCountry ] =useState("");
    const [firstName , setfirstName] = useState("");
    const [lastName , setlastName] =useState("");
    const [address , setaddress] = useState("");
    const [city , setcity]=useState("");
    const [governorate , setgovernorate] = useState("");
    const {items , clearCart} = useCart() ; 
    const router = useRouter();
    const [showSuccess , setshowSuccess] = useState(false);


    async function handleCheckout() {
        const response = await fetch (`http://localhost:3000/orders` , { 
        method : "POST" ,
        credentials : "include",
        headers : {
            "Content-Type" : "application/json",
        },
        body : JSON.stringify ({
        email : email ,
        phone : phone ,
        country : country ,
        firstName : firstName , 
        lastName : lastName , 
        address : address , 
        city : city , 
        governorate : governorate , 
        items : items.map ((item) => ({
                productId : item.id ,
                productName : item.name,
                price : item.price, 
                quantity : item.quantity,
            })
            
            ),
        }),

        });  
        setshowSuccess(true);
    }




    return (
        <main>
        <div className="py-10 flex justify-center items-center text-blue-900 font-bold font-oleo-script text-[60px]">Checkout</div>

        <div className="flex justify-center items-center px-6 py-5">
            <div className="flex max-w-7xl w-full rounded-2xl overflow-hidden shadow-2xl">

                <div className="flex-1 py-15 px-20">
                    <div className="text-blue-900 font-bold text-[40px] font-oleo-script mb-1">Order Summary</div>
                    <div className="text-blue-900 font-oleo-script text-xl mt-1 mb-8">Your Shopping Cart
                    
                <div className="flex justify-end px-10">
                <ChevronDown className="text-blue-900"/>
                </div>
</div>
                    <div className="mb-8">
                        <div className="text-lg font-bold text-blue-900 font-cantora-one uppercase tracking-wide mb-3 pb-2 border-b border-blue-200">Contact</div>
                        <div>
                            <label className="text-sm font-semibold text-blue-900 mb-1 block">Email</label>
                            <input
                                type="text"
                                placeholder="email"
                                value={email}
                                onChange={(e)=>setEmail(e.target.value)}
                                required
                                className="rounded-xl w-full bg-white py-3 text-blue-900 px-5 mb-4 border border-gray-200 focus:border-blue-500 focus:outline-none transition-colors"
                            />

                            <label className="text-sm font-semibold text-blue-900 mb-1 block">Phone</label>
                        <input
                            type="text"
                            placeholder="phone"
                            value={phone}
                            onChange = {(e)=>setPhone(e.target.value)}
                            required
                            className="rounded-xl w-full bg-white py-3 text-blue-900 px-5 mb-4 border border-gray-200 focus:border-blue-500 focus:outline-none transition-colors"
                        />
                        </div>
                    </div>

                    <div>
                        <div className="text-lg font-bold text-blue-900 font-cantora-one uppercase tracking-wide mb-3 pb-2 border-b border-blue-200">Delivery</div>

                        <label className="text-sm font-semibold text-blue-900 mb-1 block">Country/Region</label>
                        <input
                            type="text"
                            placeholder="country"
                            value ={country}
                            onChange ={(e) => setCountry (e.target.value)}
                            required
                            className="rounded-xl w-full bg-white py-3 text-blue-900 px-5 mb-4 border border-gray-200 focus:border-blue-500 focus:outline-none transition-colors"
                        />

                        <label className="text-sm font-semibold text-blue-900 mb-1 block">First name</label>
                        <input
                            type="text"
                            placeholder="firstName"
                            value={firstName}
                            onChange = {(e) => setfirstName (e.target.value)}
                            required
                            className="rounded-xl w-full bg-white py-3 text-blue-900 px-5 mb-4 border border-gray-200 focus:border-blue-500 focus:outline-none transition-colors"
                        />

                        <label className="text-sm font-semibold text-blue-900 mb-1 block">Last name</label>
                        <input
                            type="text"
                            placeholder="last name"
                            value = {lastName}
                            onChange = {(e) => setlastName (e.target.value)}
                            required
                            className="rounded-xl w-full bg-white py-3 text-blue-900 px-5 mb-4 border border-gray-200 focus:border-blue-500 focus:outline-none transition-colors"
                        />

                        <label className="text-sm font-semibold text-blue-900 mb-1 block">Address</label>
                        <input
                            type="text"
                            placeholder="address"
                            value ={address}
                            onChange = {(e) => setaddress (e.target.value)}
                            required
                            className="rounded-xl w-full bg-white py-3 text-blue-900 px-5 mb-4 border border-gray-200 focus:border-blue-500 focus:outline-none transition-colors"
                        />

                        <label className="text-sm font-semibold text-blue-900 mb-1 block">City</label>
                        <input
                            type="text"
                            placeholder="city"
                            value ={city}
                            onChange = {(e) => setcity (e.target.value)}
                            required
                            className="rounded-xl w-full bg-white py-3 text-blue-900 px-5 mb-4 border border-gray-200 focus:border-blue-500 focus:outline-none transition-colors"
                        />

                        <label className="text-sm font-semibold text-blue-900 mb-1 block">Governorate</label>
                        <input
                            type="text"
                            placeholder="governorate"
                            value ={governorate}
                            onChange = {(e) => setgovernorate (e.target.value)}
                            required
                            className="rounded-xl w-full bg-white py-3 text-blue-900 px-5 mb-4 border border-gray-200 focus:border-blue-500 focus:outline-none transition-colors"
                        />

                        
                    </div>
                </div>

                <div className="flex flex-col bg-blue-900/90 flex-1 py-15 px-20 rounded-2xl">
                    <div className="text-white font-bold font-oleo-script text-[40px]">Payment</div>
                    <div className="text-white font-oleo-script text-xl mt-1 mb-8">All transactions are secure and encrypted</div>

                    <div>
                        <label className="text-sm font-semibold text-white mb-1 block">Card number</label>
                        <input
                            type="text"
                            placeholder="card number"
                            className="rounded-xl w-full bg-white py-3 text-blue-900 px-5 mb-4 border border-transparent focus:border-white focus:outline-none transition-colors"
                        />

                        <label className="text-sm font-semibold text-white mb-1 block">Expiration date</label>
                        <input
                            type="text"
                            placeholder="MM/YYYY"
                            className="rounded-xl w-full bg-white py-3 text-blue-900 px-5 mb-4 border border-transparent focus:border-white focus:outline-none transition-colors"
                        />

                        <label className="text-sm font-semibold text-white mb-1 block">Security code</label>
                        <input
                            type="text"
                            placeholder="###"
                            className="rounded-xl w-full bg-white py-3 text-blue-900 px-5 mb-4 border border-transparent focus:border-white focus:outline-none transition-colors"
                        />

                        <label className="text-sm font-semibold text-white mb-1 block">Name on card</label>
                        <input
                            type="text"
                            placeholder="name"
                            className="rounded-xl w-full bg-white py-3 text-blue-900 px-5 mb-4 border border-transparent focus:border-white focus:outline-none transition-colors"
                        />
                    </div>
                    
                    
                    <div className="py-10 flex justify-center">
                        <button 
                        className="flex justify-center items-center font-bold py-3 bg-white text-blue-900 px-6 rounded-2xl shadow-2xl w-90 hover:bg-blue-50 transition-colors"
                        onClick = {() => handleCheckout() }
                        >
                            Complete order
                        </button>
                    </div>
                    
                    {showSuccess && (
                    <div className ="fixed inset-0 flex justify-center items-center bg-black/50 z-50">
                        <div className=" bg-blue-900 rounded-2xl shadow-2xl p-10 max-w-2xl max-h-2xl w-full relative text-center">
                            <CircleCheck className ="mx-auto mb-4 w-20 h-20"/>
                            <h1 className =" font-oleo-script text-2xl py-3">Checkout Successful!</h1>
                            <p>Thank you for your order</p>
                            <p>We’ll start processing your order shortly</p>
                            <div className="py-10 flex justify-center items-center">
                            <Link href="/Products" 
                            className="flex justify-center items-center px-5 py-3 bg-white rounded-2xl shadow-2xl text-blue-900 text-bold">Continue Shopping</Link>
                            </div>
                        </div>
                        
                    </div>
                    )}
                </div>

            </div>
        </div>
        </main>
    )
}