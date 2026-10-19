import Link from "next/link";

export const metadata ={
    title:"Phoniex Medical-About",
}

export default function About() {
return (
    <div className="bg-black/50 min-h-screen">
    <main>
        <div className="font-bold text-2xl text-white flex justify-center items-center py-7">
        About Us
        </div>
        <div className="font-bold text-xl text-white flex justify-center items-center py-3">
        Reliable Medical Equipment Solutions
        </div>
        <div className="font-bold text-lg text-white flex justify-center items-center py-3 px-10 text-center">
        We are a trusted medical equipment company dedicated to providing
        reliable and cost-effective solutions for healthcare facilities,
        hospitals, clinics, and medical professionals.
        <br />
        <br />
        Our services cover the complete lifecycle of medical equipment —
        from buying and selling equipment to repair and maintenance. We
        work to connect customers with the equipment they need while
        helping healthcare facilities maintain and extend the life of
        their existing equipment.
        </div>
    </main>
    </div>
);
}