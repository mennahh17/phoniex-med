"use client";
import { useState , useRef} from "react";
import { ImagePlus , FileText ,  X , Loader2} from "lucide-react";

export default function SellRequestPage() {
    const [currentStep, setCurrentStep] = useState(1);
    const [productName , setProductName] = useState("");
    const [manufacturer , setManufacturer] = useState("");
    const [model , setModel] = useState("");
    const [equipLocation, setEquipLocation] = useState("");
    const [condition , setCondition] = useState("");
    const [manfacturerYear , setManfacturerYear] = useState("");
    const [quantity , setQuantity] = useState("");
    const [askingPrice , setAskingPrice] = useState("");
    const [description , setDescription] = useState("");
    const [fullName , setFullName ] = useState("");
    const [phone , setPhone ] = useState("");
    const [company , setCompany ] = useState("");
    const [emailAddress , setEmailAddress] = useState("");
    const [photos , setPhotos] = useState<string[]>([]);
    const [documents , setDocuments] = useState<string[]>([]);
    const [addMessage , setAddMessage] = useState("");
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState("");
    

        async function handleFiles(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;

    const formData = new FormData();
    Array.from(fileList).forEach((file) => formData.append("images", file));

    setUploading(true);
    setUploadError("");

    try {
    const response = await fetch("http://localhost:3000/products/upload", {
        method: "POST",
        credentials: "include",
        body: formData,
    });

    if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.message || `Upload failed (${response.status})`);
    }

    const data: { urls: string[] } = await response.json();
    setPhotos((prev) => [...prev, ...data.urls]);
    } catch (err) {
    setUploadError(err instanceof Error ? err.message : "Upload failed");
    } finally {
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
    }
}

function removePhoto(url: string) {
    setPhotos((prev) => prev.filter((p) => p !== url));
}

        async function fetchRequest (){
            const response = await fetch ("http://localhost:3000/products/sell-request", {
                method : "POST" ,
                credentials : "include",
            headers :{
                "Content-Type" : "application/json"
            },
            body : JSON.stringify ({
                name : productName,
                manufacturer, 
                modelNumber : model,
                condition,
                manufactureYear : manfacturerYear , 
                quantity : Number(quantity),
                price : Number(askingPrice),
                description,
                images : photos,
                location : equipLocation,
                sellerName : fullName,
                sellerPhone : phone,
                sellerCompany : company , 
                sellerEmail : emailAddress , 
                documents,
                sellerMessage : addMessage,
            }),
        });
        }

        return (

    <main className="px-15 pb-16">
        <h1 className="text-blue-900 font-bold font-fredoka text-2xl flex justify-center items-center py-15">
        Tell Us About Your Equipment
        </h1>

        <div className="flex justify-center py-10">
        <div className="bg-white w-full max-w-[800px] rounded-2xl shadow-2xl py-10">
            <div className="px-20">

            {currentStep === 1 && (
                <div key={currentStep} className="step-animate mt-6 px-15">
                <div>
                <div className="text-blue-900 text-2xl flex justify-center font-bold font-cantora-one">
                    Equipment Information
                </div>

                <div className="py-3">
                    <label className="text-blue-900 font-cantora-one font-bold text-lg px-5">Product name</label>
                    <div className="py-2">
                    <input
                        type="text"
                        placeholder="e.g. Portable Ultrasound System"
                        value={productName}
                        onChange = {(e) => setProductName(e.target.value) }
                        className="text-sm border border-gray-300 rounded-2xl py-2 w-full text-gray-900 px-5"
                    />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                    <label className="text-blue-900 font-cantora-one font-bold text-lg px-5">Manufacturer</label>
                    <div className="py-2">
                        <input
                        type="text"
                        placeholder="e.g. FUJIFILM SonoSite"
                        value={manufacturer}
                        onChange = {(e) => setManufacturer(e.target.value)}
                        className="text-sm border border-gray-300 rounded-2xl py-2 w-full text-gray-900 px-5"
                        />
                    </div>
                    </div>

                    <div>
                    <label className="text-blue-900 font-cantora-one font-bold text-lg px-5">Model</label>
                    <div className="py-2">
                        <input
                        type="text"
                        placeholder="e.g. M-Turbo"
                        value = {model}
                        onChange ={(e) => setModel(e.target.value)}
                        className="text-sm border border-gray-300 rounded-2xl py-2 w-full text-gray-900 px-5"
                        />
                    </div>
                    </div>

                    <div>
                    <label className="text-blue-900 font-cantora-one font-bold text-lg px-5">Equipment Location</label>
                    <div className="py-2">
                        <input
                        type="text"
                        placeholder="e.g. Cairo, Egypt"
                        value = {equipLocation}
                        onChange = {(e) => setEquipLocation(e.target.value)}
                        className="text-sm border border-gray-300 rounded-2xl py-2 w-full text-gray-900 px-5"
                        />
                    </div>
                    </div>

                    <div>
                    <label className="text-blue-900 font-cantora-one font-bold text-lg px-5">Condition</label>
                    <div className="py-2">
                        <select 
                        value = {condition}
                        onChange = {(e) => setCondition(e.target.value)}
                        className="text-sm border border-gray-300 rounded-2xl py-2 w-full text-gray-900 px-5">
                        <option value="">Select equipment condition</option>
                        <option value="new">New</option>
                        <option value="used">Used</option>
                        <option value="refurbished">Refurbished</option>
                        </select>
                    </div>
                    </div>

                    <div>
                    <label className="text-blue-900 font-cantora-one font-bold text-lg px-5">Year of Manufacture</label>
                    <div className="py-2">
                        <input
                        type="number"
                        min={1950}
                        max={2026}
                        placeholder="e.g. 2022"
                        value = {manfacturerYear}
                        onChange = {(e) => setManfacturerYear(e.target.value)}
                        className="text-sm border border-gray-300 rounded-2xl py-2 w-full text-gray-900 px-5"
                        />
                    </div>
                    </div>

                    <div>
                    <label className="text-blue-900 font-cantora-one font-bold text-lg px-5">Quantity</label>
                    <div className="py-2">
                        <input
                        type="number"
                        min={1}
                        placeholder="e.g. 2"
                        value = {quantity}
                        onChange = {(e) => setQuantity(e.target.value)}
                        className="text-sm border border-gray-300 rounded-2xl py-2 w-full text-gray-900 px-5"
                        />
                    </div>
                    </div>

                    <div>
                    <label className="text-blue-900 font-cantora-one font-bold text-lg px-5">Asking Price</label>
                    <div className="py-2">
                        <input
                        type="number"
                        min={0}
                        placeholder="Enter your expected price"
                        value ={askingPrice}
                        onChange = {(e) => setAskingPrice(e.target.value)}
                        className="text-sm border border-gray-300 rounded-2xl py-2 w-full text-gray-900 px-5"
                        />
                    </div>
                    </div>
                </div>

                <div className="py-3">
                    <label className="text-blue-900 font-cantora-one font-bold text-lg px-5">Description</label>
                    <div className="py-2">
                    <textarea
                        rows={4}
                        placeholder="Tell us about the equipment, its condition, and any additional details..."
                        className="text-sm border border-gray-300 rounded-2xl py-2 w-full text-gray-900 px-5"
                        value = {description}
                        onChange = {(e) => setDescription(e.target.value)}
                    />
                    </div>
                </div>

                    <div className="flex justify-center ">
                        <button 
                        onClick = {() => setCurrentStep(currentStep +1)}
                        className="text-blue-900 font-cantora-one font-semibold rounded-2xl shadow-2xl bg-blue-900 text-white px-15 py-1"
                        >Next</button>
                    </div>
                </div>
                </div>
            )}

            {currentStep === 2 && (
                <div key={currentStep} className="step-animate mt-6 px-15">
                <div>
                <div className="text-blue-900 text-2xl flex justify-center font-bold font-cantora-one">
                    Contact Information
                </div> 
                
                <div className="flex flex-col gap-6 mt-10">

                <div className="flex flex-col">
                <label className="text-blue-900 font-fredoka font-bold text-lg px-5">Full Name</label>
                <input
                type="text"
                placeholder="Enter your full name"
                value ={fullName}
                onChange = {(e) => setFullName(e.target.value)}
                className="border border-blue-900 w-full rounded-2xl px-5 py-1 text-gray-900 px-5"/>
                </div>

                <div className="flex flex-col">
                <label className="text-blue-900 font-fredoka font-bold text-lg px-5">Company</label>
                <input
                type="text"
                placeholder="e.g. ABC Medical Center"
                value = {company}
                onChange = {(e) => setCompany(e.target.value)}
                className="border border-blue-900 w-full rounded-2xl px-5 py-1 text-gray-900 px-5"/>
                </div>

                <div className="flex flex-col">
                <label className="text-blue-900 font-fredoka font-bold text-lg px-5">Email Address</label>
                <input
                type="email"
                placeholder="Enter your email address"
                value = {emailAddress}
                onChange = {(e) => setEmailAddress(e.target.value)}
                className="border border-blue-900 w-full rounded-2xl px-5 py-1 text-gray-900 px-5"/>
                </div>

                <div className="flex flex-col">
                <label className="text-blue-900 font-fredoka font-bold text-lg px-5">Phone Number</label>
                <input
                type="tel"
                placeholder="Enter your phone number"
                value ={phone}
                onChange = {(e) => setPhone(e.target.value)}
                className="border border-blue-900 w-full rounded-2xl px-5 py-1 text-gray-900 px-5"/>
                </div>

                </div>

                <div className="flex justify-center py-15 gap-3">
                    <button
                    onClick = {() => setCurrentStep (currentStep - 1)}
                    className ="text-blue-900 font-cantora-one font-semibold rounded-2xl shadow-2xl bg-white border border-blue-900 text-blue-900 px-15 py-1">Back</button>
                    <button 
                    onClick = {() => setCurrentStep (currentStep + 1)}
                    className="text-blue-900 font-cantora-one font-semibold rounded-2xl shadow-2xl bg-blue-900 text-white px-35 py-1">Next</button>
                </div>

                </div>
                </div>
            )}

            {currentStep === 3 && (
                <div key={currentStep} className="step-animate mt-6 px-15">
                <div className="flex flex-col gap-8">

                    <div className="text-blue-900 text-2xl flex justify-center font-bold font-cantora-one">
                    Photos & Documents
                    </div>
                    
                    <div className="flex flex-col gap-2">
    <div className="text-blue-900 font-fredoka font-bold text-lg px-5">Equipment Photos</div>

    <input
    ref={fileInputRef}
    type="file"
    accept="image/jpeg,image/png,image/webp"
    multiple
    hidden
    onChange={(e) => handleFiles(e.target.files)}
    />

    <div className="border border-dashed border-gray-300 rounded-2xl py-12 flex flex-col items-center gap-3 text-center">
    {uploading ? (
        <>
        <Loader2 className="w-8 h-8 text-blue-900 animate-spin" />
        <p className="text-blue-900 text-sm">Uploading...</p>
        </>
    ) : (
        <>
        <ImagePlus className="w-8 h-8 text-gray-400" />
        <p className="text-gray-400 text-sm">Upload clear photos of your equipment</p>
        <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="border border-blue-900 py-2 cursor-pointer text-blue-900 rounded-2xl font-bold px-3 hover:bg-blue-50"
        >
            Click to browse
        </button>
        </>
    )}
    </div>

    {uploadError && <p className="text-red-500 text-sm px-5">{uploadError}</p>}

    {photos.length > 0 && (
    <div className="grid grid-cols-3 gap-3 mt-2">
            {photos.map((url) => (
        <div key={url} className="relative group">
            <img src={url} alt="" className="w-full h-24 object-cover rounded-xl" />
            <button
            type="button"
            onClick={() => removePhoto(url)}
            className="absolute top-1 right-1 bg-white rounded-full p-1 shadow opacity-0 group-hover:opacity-100 transition-opacity"
            >
            <X className="w-4 h-4 text-red-500" />
            </button>
        </div>
        ))}
    </div>
    )}
</div>

                    

                    <div className="flex justify-center py-15 gap-3">
                    <button
                    onClick = {() => setCurrentStep (currentStep - 1)}
                    className ="text-blue-900 font-cantora-one font-semibold rounded-2xl shadow-2xl bg-white border border-blue-900 text-blue-900 px-15 py-1">Back</button>
                    <button 
                    onClick = {() => setCurrentStep (currentStep + 1)}
                    className="text-blue-900 font-cantora-one font-semibold rounded-2xl shadow-2xl bg-blue-900 text-white px-35 py-1">Next</button>
                    </div>

                </div>
                </div>
            )}

            {currentStep === 4 && (
                <div key={currentStep} className="step-animate mt-6 px-15">
                <div>
                    
                    <div className="text-blue-900 text-2xl flex justify-center font-bold font-cantora-one">
                    Additional Message
                    </div>
                    <div className="py-15">
                    <label className="text-blue-900 font-cantora-one font-bold text-lg px-5">Anything else you'd like us to know?</label>
                    <div className="py-2">
                    <textarea
                        rows={4}
                        placeholder="any additional details..."
                        value = {addMessage}
                        onChange = {(e) => setAddMessage(e.target.value)}
                        className="text-sm border border-gray-300 rounded-2xl py-2 w-full text-gray-900 px-5"
                    />
                    </div>
                    </div>

                    <div className="flex justify-center py-15 gap-3">
                    <button
                    onClick = {() => setCurrentStep (currentStep - 1)}
                    className ="text-blue-900 font-cantora-one font-semibold rounded-2xl shadow-2xl bg-white border border-blue-900 text-blue-900 px-15 py-1">Back</button>
                    <button
                    onClick = {fetchRequest}
                    className="text-blue-900 font-cantora-one font-semibold rounded-2xl shadow-2xl bg-blue-900 text-white px-35 py-1">Submit Request</button>
                    </div>

                </div>
                </div>
            )}
            </div>
        </div>
    </div>
    </main>
    );
}