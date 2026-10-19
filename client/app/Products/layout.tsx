import type {Metadata } from "next";

export const metadata : Metadata ={
    title:"Phoniex Medical-Product",
} ;

export default function ProductLayout({children}: {children:React.ReactNode}) {
    return <>{children}</>;
}