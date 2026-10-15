"use client";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Search, User, ShoppingBag , ChevronDown } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import {useState} from "react";

export default function Header() {
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const [isOpen , setIsOpen] = useState(false);

  async function handleLogout() {
    await authClient.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <header className="border-t-2 border-white-600">
      <div className="flex items-center justify-between px-7 py-5">
        <div className="flex items-center gap-1">
          <Image
            src="/img/Gemini_Generated_Image_eqiwvxeqiwvxeqiw-removebg-preview.png"
            alt="Phoenix Medical logo"
            width={80}
            height={80}
            priority
          />
          <span className="font-bold font-bad-script text-xl text-blue-900">
            Phoenix Medical
          </span>
        </div>

        <nav className="flex justify-center items-center gap-10">
          <Link href="/" className="font-bold text-blue-900">
            Home
          </Link>
          <Link href="/About" className="font-bold text-blue-900">
            About
          </Link>
          <Link href="/Products" className="font-bold text-blue-900">
            Products
          </Link>
        </nav>

        <div className="flex items-center justify-end gap-4 ">
          <Link href="/Search">
            <Search className="w-5 h-5 cursor-pointer text-blue-900" />
          </Link>

          {session ? (
          <div className="relative">
            <button 
            onClick={() => setIsOpen(!isOpen)} 
            className="font-semibold text-blue-900 gap-1 flex items-center">

            Hi,{session.user.name}
            <ChevronDown className="w-4 h-4"/>
            </button>

            {isOpen && (
              <div className="absolute top-full right-0 bg-white shadow-lg rounded-2xl mt-2 w-48 py-2 z-50">
              <Link href ="/Orders"
              className="block px-4 py-2 text-blue-900 hover:bg-blue-900/50 rounded-2xl font-bold"
              onClick={() => setIsOpen(false)}
              > Order History </Link>

              <div >
                <Link href="/Cart"
                className="block text-blue-900 px-4 py-2 hover:bg-blue-900/50 rounded-2xl font-bold"
                onClick={()=>setIsOpen(false)}
                >My Cart </Link>
                </div>

                <div >
                <Link href="/Sell"
                className="block text-blue-900 px-4 py-2 hover:bg-blue-900/50 rounded-2xl font-bold"
                onClick={()=>setIsOpen(false)}
                >Sell Equipment </Link>
                </div>

              <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-blue-900 hover:bg-blue-900/50 rounded-2xl font-bold"
                  >
                    Logout
                  </button>

          </div>
            )}
          </div>
          
          ) : (
            <>
              <Link href="/Login" className="text-blue-900">
                Sign in
              </Link>
              <Link href="/Login" className="text-blue-900">
                Sign up
              </Link>
            </>


          )}
        </div>
      </div>
    </header>
  );
}