import Image from "next/image";
import Link from "next/link";

export const metadata ={
    title:"Phoniex Medical-Product",
} 

export default function product(){
    return(
        <main>
            
            <div className="grid grid-col-1 sm:grid-cols-2 md:grid-cols-3 gap-6  max-w-6xl mx-auto px-4">

            <div className="bg-white rounded-xl shadow-2xl overflow-hidden">
            <div className="relative h-48 w-full">
            <Image 
            src="/img/bdc0903ba856a5929d24d284cc18ddfa.jpg"
            alt="CT Scanner"
            fill
            className="object-cover"
            />
            </div>
            <div className="p-4">
                <h3 className="font-bold text-blue-900">CT Scanner</h3>
                <p className="text-sm text-gray-500"></p>

            </div>
            <div className="p-4">
                    <div className="flex justify-center items-center"> 
                    <Link href="/Cart">
                    <div className="bg-white p-5">
                    <button className="text-white font-semibold cursor-pointer bg-blue-900 rounded-lg shadow-2xl py-3 px-7">
                    Add to cart
                    </button>
                    </div>
                    </Link>
            </div>
            </div>
            </div>

            <div className="bg-white rounded-xl shadow-2xl overflow-hidden" >
            <div className="relative w-full h-48">
            <Image
            src="/img/68e17bce70f4e6f485805a6148bf57f7.jpg"
            alt=""
            fill
            className="object-cover"
            />
            </div>
            <div className="p-4">
                <h3 className="font-bold text-blue-900">Digital Blood Pressure</h3>
            
            </div>
            <div className="p-4">
                    <div className="flex justify-center items-center"> 
                    <Link href="/Cart">
                    <div className="bg-white p-5">
                    <button className="text-white font-semibold cursor-pointer bg-blue-900 rounded-lg shadow-2xl px-7 py-3">
                    Add to cart
                    </button>
                    </div>
                    </Link>
                    
                </div>
            </div>
            </div>

            <div className="bg-white rounded-xl shadow-2xl overflow-hidden">
                <div className="relative w-full h-48">
                    <Image
                    src="/img/57690094b714861e28852743daf134e3.jpg" 
                    alt="UltraSound machine"
                    fill
                    className="object-cover"
                    />
                </div>
                <div className="p-4">
                <h3 className="font-bold text-blue-900 cursor-pointer">UltraSound machine</h3>
                </div>
                <div className="p-4">
                    <div className="flex justify-center items-center"> 
                    <Link href="/Cart">
                    <div className="bg-white p-5">
                    <button className="text-white font-semibold cursor-pointer bg-blue-900 rounded-lg shadow-2xl px-7 py-3">
                    Add to cart
                    </button>
                    </div>
                    </Link>
                </div>
                </div>


            </div>
            


            </div>
        </main>
    );
}