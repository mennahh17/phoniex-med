import Image from "next/image";
import Link from "next/link";

export const metadata ={
  title :"Phoniex Medical-Home",
}

export default function Home() {
  return (
    <main className="flex-1">
      <section className="relative w-full h-[500px]">
        <Image
          src="/img/Gemini_Generated_Image_tc5fm5tc5fm5tc5f.jpeg"
          alt="Shop page banner"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 flex flex-col items-start justify-center text-center px-20">
          <div className="justify-center font-geist-mono text-2xl py-5 font-bad-script">
            Better Equipment Better Care
          </div>
          <Link
            href="/Products"
            className="bg-white text-[#091c45] font-semibold px-6 py-3 rounded-full hover:bg-gray-100 transition-colors font-bad-script"
          >
            Discover
          </Link>
        </div>
      </section>

      <div className=" font-oleo-script text-[35px] flex justify-center py-7 text-blue-900">
        Our Services
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 max-w-6xl mx-auto px-4 pb-12">

        
        <div className="bg-white rounded-lg shadow-md overflow-hidden p-6 text-center">
          <h3 className="text-blue-900 font-bold text-xl mb-3 cursor-pointer">
            Repair & Maintenance
          </h3>
          <p className="text-blue-900 text-sm">
            We provide professional repair and maintenance services to help
            keep your medical equipment operating safely and efficiently.
          </p>
        </div>


        <div className="bg-white rounded-lg shadow-md overflow-hidden p-6 text-center">
          <h3 className="text-blue-900 font-bold text-xl mb-3 cursor-pointer">
            Equipment Sales
          </h3>
          <p className="text-blue-900 text-sm">
            We offer a wide range of new and used medical equipment from
            trusted suppliers and manufacturers.
          </p>
        </div>


        <div className="bg-white rounded-lg shadow-md overflow-hidden p-6 text-center">
          <h3 className="text-blue-900 font-bold text-xl mb-3 cursor-pointer">
            Equipment Purchase
          </h3>
          <p className="text-blue-900 text-sm">
            We buy medical equipment from hospitals, clinics, and healthcare
            facilities.
          </p>
        </div>
      </div>
      
      <div className="flex justify-center items-center">
        
          <div className=" text-[35px] font-oleo-script text-blue-900">
        Shop by Category
          </div>
          </div>

          <div className="flex justify-center items-center gap-10 py-7">
            <div className="flex flex-col items-center gap-3">
            <img
            src="/img/NSM-S15P-Neusoft-Medical-Systems.webp"
            alt=""
            className="w-48 h-48 rounded-full object-cover"
            />
          <span className="text-blue-900 font-bold "> MRI Scanner  </span>
          </div>

          <div className="flex flex-col items-center gap-2">
            <img
            src="/img/bdc0903ba856a5929d24d284cc18ddfa.jpg"
            alt=""
            className="w-48 h-48 rounded-full object-cover"
            />
            <span className="text-blue-900 font-bold"> CT Scanner</span>
          </div>

          <div className="flex flex-col items-center gap-2">
            <img
            src="/img/images.jpeg"
            alt=""
            className="w-48 h-48 rounded-full object-cover"
            />
            <span className="text-blue-900 font-bold">IC component</span>
          </div>
          </div>

          <div className="flex justify-center py-5">
          <Link href ="/Products"
          className="font-oleo-script text-xl bg-blue-900 px-10 py-3 rounded-2xl shadow-2xl"> View All Products </Link>
      </div>
    </main>
  );
}