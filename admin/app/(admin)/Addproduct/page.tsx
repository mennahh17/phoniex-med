"use client";
import { ImagePlus, Stethoscope, ArrowRight, CircleCheck, X, Loader2 } from "lucide-react";
import { useState, useRef } from "react";
import Link from "next/link";

const STEPS = ["General", "Pricing", "Inventory", "Specifications"];
const API_URL = "http://localhost:3000";

export default function AddProductPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [trackInventory, setTrackInventory] = useState(false);
  const [stockStatus, setStockStatus] = useState("in_stock");
  const [showSuccess, setShowSuccess] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [regularPrice, setRegularPrice] = useState("");
  const [salePrice, setSalePrice] = useState("");
  const [costPrice, setCostPrice] = useState("");
  const [tax, setTax] = useState("");
  const [discount, setDiscount] = useState("");
  const [sku, setSku] = useState("");
  const [quantity, setQuantity] = useState("");
  const [lowStockThreshold, setLowStockThreshold] = useState("");
  const [manufacturer, setManufacturer] = useState("");
  const [modelNumber, setModelNumber] = useState("");
  const [partNumber, setPartNumber] = useState("");
  const [warranty, setWarranty] = useState("");
  const [deviceType, setDeviceType] = useState("");
  const [condition, setCondition] = useState("");
  const [accessories, setAccessories] = useState("");
  const [manufactureYear, setManufactureYear] = useState("");
  const [weight, setWeight] = useState("");
  const [dimensions, setDimensions] = useState("");
  const [technicalSpecs, setTechnicalSpecs] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

    const toNum = (v: string) => (v === "" ? undefined : Number(v));

    function clearError(field: string) {
    setErrors((prev) => ({ ...prev, [field]: "" }));
    }

    function inputClass(field: string) {
    return `border rounded-2xl w-full py-2 px-5 text-sm text-gray-900 ${
        errors[field] ? "border-red-500" : "border-gray-300"
    }`;
    }

  function renderError(field: string) {
    return errors[field] ? (
      <p className="text-red-500 text-xs px-5 mt-1">{errors[field]}</p>
    ) : null;
  }

  async function handleFiles(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;

    const files = Array.from(fileList);

    const invalid = files.find(
      (f) => !["image/jpeg", "image/png", "image/webp"].includes(f.type)
    );
    if (invalid) {
      setErrors((prev) => ({ ...prev, images: "Only JPG, PNG, and WEBP images are allowed" }));
      return;
    }

    const tooBig = files.find((f) => f.size > 5 * 1024 * 1024);
    if (tooBig) {
      setErrors((prev) => ({ ...prev, images: "Each image must be less than 5MB" }));
      return;
    }

    const formData = new FormData();
    files.forEach((file) => formData.append("images", file));

    setUploading(true);
    clearError("images");

    try {
      const response = await fetch(`${API_URL}/products/upload`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.message || `Upload failed (${response.status})`);
      }

      const data: { urls: string[] } = await response.json();
      setImages((prev) => [...prev, ...data.urls]);
    } catch (err) {
      setErrors((prev) => ({
        ...prev,
        images: err instanceof Error ? err.message : "Upload failed",
      }));
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  function removeImage(url: string) {
    setImages((prev) => prev.filter((img) => img !== url));
  }

  function validateStep(step: number) {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!name.trim()) newErrors.name = "Product name is required";
      if (images.length === 0) newErrors.images = "Add at least one image";
    }

    if (step === 2) {
      if (!regularPrice) {
        newErrors.regularPrice = "Regular price is required";
      } else if (Number(regularPrice) <= 0) {
        newErrors.regularPrice = "Price must be greater than 0";
      }
      if (salePrice && Number(salePrice) >= Number(regularPrice)) {
        newErrors.salePrice = "Sale price must be less than regular price";
      }
      if (costPrice && Number(costPrice) < 0) {
        newErrors.costPrice = "Cost price can't be negative";
      }
      if (tax && Number(tax) < 0) {
        newErrors.tax = "Tax can't be negative";
      }
      if (discount && (Number(discount) < 0 || Number(discount) > 100)) {
        newErrors.discount = "Discount must be between 0 and 100";
      }
    }

    if (step === 3) {
      if (!sku.trim()) newErrors.sku = "SKU is required";
      if (trackInventory && quantity === "") {
        newErrors.quantity = "Quantity is required when tracking inventory";
      } else if (quantity && Number(quantity) < 0) {
        newErrors.quantity = "Quantity can't be negative";
      }
      if (lowStockThreshold && Number(lowStockThreshold) < 0) {
        newErrors.lowStockThreshold = "Threshold can't be negative";
      }
    }

    if (step === 4) {
      if (!manufacturer.trim()) newErrors.manufacturer = "Manufacturer is required";
      if (!deviceType.trim()) newErrors.deviceType = "Device type is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function handleNext() {
    if (!validateStep(currentStep)) return;
    setCurrentStep(currentStep + 1);
  }

  function handleBack() {
    setErrors({});
    setCurrentStep(currentStep - 1);
  }

  async function handlesubmit() {
    if (!validateStep(4)) return;

    setSubmitting(true);
    setSubmitError("");

    try {
      const response = await fetch(`${API_URL}/products`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
        name: name.trim(),
        description: description || undefined,
        images,
        trackInventory,
        stockStatus,
        price: toNum(salePrice) ?? toNum(regularPrice),
          regularPrice: toNum(regularPrice),
          salePrice: toNum(salePrice),
          costPrice: toNum(costPrice),
          tax: toNum(tax),
          discount: toNum(discount),
          sku: sku.trim(),
          quantity: toNum(quantity),
          lowStockThreshold: toNum(lowStockThreshold),
          manufacturer: manufacturer || undefined,
          modelNumber: modelNumber || undefined,
          partNumber: partNumber || undefined,
          warranty: warranty || undefined,
          deviceType: deviceType || undefined,
          condition: condition || undefined,
          accessories: accessories || undefined,
          manufactureYear: manufactureYear || undefined,
          weight: weight || undefined,
          dimensions: dimensions || undefined,
          technicalSpecs: technicalSpecs || undefined,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        const message = Array.isArray(data?.message)
          ? data.message.join(", ")
          : data?.message || `Error ${response.status}`;
        throw new Error(message);
      }

      setShowSuccess(true);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  function resetForm() {
    setName(""); setDescription(""); setImages([]);
    setRegularPrice(""); setSalePrice(""); setCostPrice(""); setTax(""); setDiscount("");
    setSku(""); setQuantity(""); setLowStockThreshold("");
    setTrackInventory(false); setStockStatus("in_stock");
    setManufacturer(""); setModelNumber(""); setPartNumber(""); setWarranty("");
    setDeviceType(""); setCondition(""); setAccessories(""); setManufactureYear("");
    setWeight(""); setDimensions(""); setTechnicalSpecs("");
    setErrors({}); setSubmitError("");
    setCurrentStep(1);
    setShowSuccess(false);
  }

  return (
    <main>
      <div className="text-blue-900 flex justify-center text-[35px] mt-15 font-cantora-one">
        Add New Equipment
      </div>
      <div className="text-blue-900 flex justify-center text-xl font-cantora-one py-3">
        Create a detailed listing and make your medical equipment available to customers
      </div>

        <div className="py-10 flex justify-center items-center">
        <div className="bg-white w-full max-w-[800px] min-h-[800px] rounded-2xl shadow-2xl overflow-hidden">
            <div className="flex items-center gap-3 mt-15 px-15">
            <Stethoscope className="text-blue-900 w-6 h-6" />
            <div className="text-blue-900 text-2xl font-cantora-one">Add Equipment</div>
          </div>
          <div className="text-gray-900/50 text-lg px-15 font-cantora-one py-2">
            Add a new product to your store
          </div>

          <div className="flex justify-center items-center gap-2 mt-6 flex-wrap">
            {STEPS.map((label, i) => {
              const stepNum = i + 1;
              return (
                <div key={label} className="flex items-center gap-2">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                      currentStep >= stepNum
                        ? "bg-blue-900 text-white"
                        : "bg-gray-200 text-gray-500"
                    }`}
                  >
                    {stepNum}
                  </div>
                  <span className="text-blue-900 font-semibold text-sm">{label}</span>
                  {stepNum < STEPS.length && (
                    <ArrowRight className="text-blue-900 w-5 h-5" />
                  )}
                </div>
              );
            })}
          </div>

          {currentStep === 1 && (
            <div key={currentStep} className="step-animate mt-6 px-15">
              <div className="mt-6 px-15">
                <label className="text-blue-900 font-bold px-5">Name*</label>
                <input
                  type="text"
                  placeholder="name"
                  value={name}
                  onChange={(e) => { setName(e.target.value); clearError("name"); }}
                  className={inputClass("name")}
                />
                {renderError("name")}
                <div className="text-gray-300 text-xs px-5 py-1">
                  Give your product a short and clear name
                </div>

                <div className="py-2"></div>
                <label className="text-blue-900 font-bold px-5">Description</label>
                <textarea
                  placeholder="Give your product a clear description...."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="border border-gray-300 rounded-2xl w-full py-3 px-5 text-sm text-gray-900"
                />

                <div className="mt-10 px-15">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    multiple
                    hidden
                    onChange={(e) => handleFiles(e.target.files)}
                  />

                  <div
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsDragging(false);
                      handleFiles(e.dataTransfer.files);
                    }}
                    className={`border border-dashed rounded-2xl py-15 flex flex-col justify-center items-center text-center transition-colors ${
                      isDragging
                        ? "border-blue-900 bg-blue-50"
                        : errors.images
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                  >
                    {uploading ? (
                      <>
                        <Loader2 className="text-blue-900 animate-spin" />
                        <p className="text-blue-900 mt-2">Uploading...</p>
                      </>
                    ) : (
                      <>
                        <ImagePlus className="text-gray-300" />
                        <p className="text-gray-300">Drop your product images here</p>
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="text-gray-900/50 border border-gray-900 mt-5 rounded-2xl py-2 px-5 hover:bg-gray-100"
                        >
                          Click to browse
                        </button>
                      </>
                    )}
                  </div>

                  {renderError("images")}

                  <div className="text-gray-300 text-xs py-1 px-5">
                    Upload clear, high-quality images to showcase your equipment, condition, and key details.
                  </div>

                  {images.length > 0 && (
                    <div className="grid grid-cols-3 gap-3 mt-4">
                      {images.map((url, index) => (
                        <div key={url} className="relative group">
                          <img
                            src={url}
                            alt={`Product image ${index + 1}`}
                            className="w-full h-28 object-cover rounded-xl border border-gray-200"
                          />
                          {index === 0 && (
                            <span className="absolute bottom-1 left-1 bg-blue-900 text-white text-[10px] px-2 py-0.5 rounded-full">
                              Main
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={() => removeImage(url)}
                            className="absolute top-1 right-1 bg-white/90 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-4 h-4 text-red-500" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex justify-center items-center gap-3 py-3">
                  <div className="bg-gray-300 py-2 px-5 rounded-2xl">Save as draft</div>
                  <button
                    type="button"
                    onClick={handleNext}
                    disabled={uploading}
                    className="bg-blue-900 text-white font-cantora-one px-35 py-2 rounded-2xl disabled:opacity-50"
                  >
                    Next Step
                  </button>
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div key={currentStep} className="step-animate px-15">
              <div className="px-15 py-10">
                <div className="text-blue-900 font-cantora-one flex justify-center items-center text-sm mb-4">
                  Set accurate pricing for your medical products and keep your costs under control
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="px-6 py-3">
                    <label className="text-blue-900 font-cantora-one block mb-1">Regular price*</label>
                    <input
                      type="number"
                      placeholder="100 LE"
                      value={regularPrice}
                      onChange={(e) => { setRegularPrice(e.target.value); clearError("regularPrice"); }}
                      className={inputClass("regularPrice")}
                    />
                    {renderError("regularPrice")}
                  </div>

                  <div className="px-6 py-3">
                    <label className="text-blue-900 font-cantora-one block mb-1">Sale price</label>
                    <input
                      type="number"
                      placeholder="90 LE"
                      value={salePrice}
                      onChange={(e) => { setSalePrice(e.target.value); clearError("salePrice"); }}
                      className={inputClass("salePrice")}
                    />
                    {renderError("salePrice")}
                  </div>

                  <div className="px-6 py-3">
                    <label className="text-blue-900 font-cantora-one block mb-1">Cost price</label>
                    <input
                      type="number"
                      placeholder="70 LE"
                      value={costPrice}
                      onChange={(e) => { setCostPrice(e.target.value); clearError("costPrice"); }}
                      className={inputClass("costPrice")}
                    />
                    {renderError("costPrice")}
                  </div>

                  <div className="px-6 py-3">
                    <label className="text-blue-900 font-cantora-one block mb-1">Tax</label>
                    <input
                      type="number"
                      placeholder="14"
                      value={tax}
                      onChange={(e) => { setTax(e.target.value); clearError("tax"); }}
                      className={inputClass("tax")}
                    />
                    {renderError("tax")}
                  </div>

                  <div className="px-6 py-3">
                    <label className="text-blue-900 font-cantora-one block mb-1">Discount (%)</label>
                    <input
                      type="number"
                      placeholder="10"
                      value={discount}
                      onChange={(e) => { setDiscount(e.target.value); clearError("discount"); }}
                      className={inputClass("discount")}
                    />
                    {renderError("discount")}
                  </div>
                </div>

                <div className="flex justify-center items-center gap-3 py-15">
                  <button
                    type="button"
                    onClick={handleBack}
                    className="bg-gray-300 font-cantora-one px-15 py-2 rounded-2xl text-white"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={handleNext}
                    className="bg-blue-900 text-white font-cantora-one px-35 py-2 rounded-2xl"
                  >
                    Next Step
                  </button>
                </div>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div key={currentStep} className="step-animate px-15">
              <div className="py-2"></div>
              <label className="text-blue-900 font-bold px-5">SKU*</label>
              <input
                type="text"
                placeholder="e.g. MED-001-ABC"
                value={sku}
                onChange={(e) => { setSku(e.target.value); clearError("sku"); }}
                className={inputClass("sku")}
              />
              {renderError("sku")}

              <div className="py-2"></div>
              <label className="text-blue-900 font-bold px-5">
                Stock Quantity{trackInventory && "*"}
              </label>
              <input
                type="number"
                placeholder="e.g. 25"
                value={quantity}
                onChange={(e) => { setQuantity(e.target.value); clearError("quantity"); }}
                className={inputClass("quantity")}
              />
              {renderError("quantity")}

              <div className="mt-4">
                <label className="text-blue-900 font-bold px-5">Stock Status</label>
                <select
                  value={stockStatus}
                  onChange={(e) => setStockStatus(e.target.value)}
                  className="border border-gray-300 rounded-2xl py-2 px-4 w-full text-gray-900 text-sm"
                >
                  <option value="in_stock">In Stock</option>
                  <option value="low_stock">Low Stock</option>
                  <option value="out_of_stock">Out of Stock</option>
                </select>
              </div>

              <div className="py-2"></div>
              <label className="text-blue-900 font-bold px-5">Low-stock Threshold</label>
              <input
                type="number"
                placeholder="e.g. 5"
                value={lowStockThreshold}
                onChange={(e) => { setLowStockThreshold(e.target.value); clearError("lowStockThreshold"); }}
                className={inputClass("lowStockThreshold")}
              />
              {renderError("lowStockThreshold")}

              <div className="flex items-center justify-between px-15 mt-8">
                <div>
                  <p className="text-blue-900 font-bold">Track Inventory</p>
                  <p className="text-gray-400 text-xs">
                    If on, the system automatically tracks quantity with every sale
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setTrackInventory(!trackInventory)}
                  className={`w-12 h-6 rounded-full flex items-center px-1 transition-colors ${
                    trackInventory ? "bg-blue-900 justify-end" : "bg-gray-300 justify-start"
                  }`}
                >
                  <div className="w-4 h-4 bg-white rounded-full"></div>
                </button>
              </div>

              <div className="text-blue-900 font-cantora-one flex justify-center items-center mt-6 text-xl">
                Keep track of your stock and stay ahead of low inventory
              </div>

              <div className="flex justify-center items-center gap-3 py-10">
                <button
                  type="button"
                  onClick={handleBack}
                  className="bg-gray-300 font-cantora-one px-15 py-2 rounded-2xl text-white"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  className="bg-blue-900 text-white font-cantora-one px-35 py-2 rounded-2xl"
                >
                  Next Step
                </button>
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div key={currentStep} className="step-animate px-15">
              <div className="px-15 py-10">
                <div className="text-blue-900 font-cantora-one text-lg flex justify-center items-center text-center">
                  Provide detailed information to help customers understand the device and its capabilities
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="px-6 py-3">
                    <label className="text-blue-900 font-cantora-one block mb-1">Manufacturer*</label>
                    <input
                      type="text"
                      placeholder="e.g. Philips"
                      value={manufacturer}
                      onChange={(e) => { setManufacturer(e.target.value); clearError("manufacturer"); }}
                      className={inputClass("manufacturer")}
                    />
                    {renderError("manufacturer")}
                  </div>

                  <div className="px-6 py-3">
                    <label className="text-blue-900 font-cantora-one block mb-1">Model</label>
                    <input
                      type="text"
                      placeholder="e.g. M-Turbo"
                      value={modelNumber}
                      onChange={(e) => setModelNumber(e.target.value)}
                      className={inputClass("modelNumber")}
                    />
                  </div>

                  <div className="px-6 py-3">
                    <label className="text-blue-900 font-cantora-one block mb-1">Part Number</label>
                    <input
                      type="text"
                      placeholder="e.g. P12345"
                      value={partNumber}
                      onChange={(e) => setPartNumber(e.target.value)}
                      className={inputClass("partNumber")}
                    />
                  </div>

                  <div className="px-6 py-3">
                    <label className="text-blue-900 font-cantora-one block mb-1">Warranty</label>
                    <input
                      type="text"
                      placeholder="e.g. 12 months"
                      value={warranty}
                      onChange={(e) => setWarranty(e.target.value)}
                      className={inputClass("warranty")}
                    />
                  </div>

                  <div className="px-6 py-3">
                    <label className="text-blue-900 font-cantora-one block mb-1">Device Type*</label>
                    <input
                      type="text"
                      placeholder="e.g. Ultrasound System"
                      value={deviceType}
                      onChange={(e) => { setDeviceType(e.target.value); clearError("deviceType"); }}
                      className={inputClass("deviceType")}
                    />
                    {renderError("deviceType")}
                  </div>

                  <div className="px-6 py-3">
                    <label className="text-blue-900 font-cantora-one block mb-1">Condition</label>
                    <select
                      value={condition}
                      onChange={(e) => setCondition(e.target.value)}
                      className={inputClass("condition")}
                    >
                      <option value="">Select condition</option>
                      <option value="new">New</option>
                      <option value="used">Used</option>
                      <option value="refurbished">Refurbished</option>
                    </select>
                  </div>

                  <div className="px-6 py-3">
                    <label className="text-blue-900 font-cantora-one block mb-1">Included Accessories</label>
                    <input
                      type="text"
                      placeholder="e.g. C60x Probe, Power Cable"
                      value={accessories}
                      onChange={(e) => setAccessories(e.target.value)}
                      className={inputClass("accessories")}
                    />
                  </div>

                  <div className="px-6 py-3">
                    <label className="text-blue-900 font-cantora-one block mb-1">Year of Manufacture</label>
                    <input
                      type="date"
                      value={manufactureYear}
                      onChange={(e) => setManufactureYear(e.target.value)}
                      className={inputClass("manufactureYear")}
                    />
                  </div>

                  <div className="px-6 py-3">
                    <label className="text-blue-900 font-cantora-one block mb-1">Weight</label>
                    <input
                      type="text"
                      placeholder="e.g. 5.5 kg"
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                      className={inputClass("weight")}
                    />
                  </div>

                  <div className="px-6 py-3">
                    <label className="text-blue-900 font-cantora-one block mb-1">Dimensions</label>
                    <input
                      type="text"
                      placeholder="e.g. 35 × 25 × 10 cm"
                      value={dimensions}
                      onChange={(e) => setDimensions(e.target.value)}
                      className={inputClass("dimensions")}
                    />
                  </div>

                  <div className="px-6 py-3 col-span-2">
                    <label className="text-blue-900 font-cantora-one block mb-1">Technical Specifications</label>
                    <textarea
                      value={technicalSpecs}
                      onChange={(e) => setTechnicalSpecs(e.target.value)}
                      placeholder="Enter key technical specifications..."
                      rows={3}
                      className={inputClass("technicalSpecs")}
                    />
                  </div>
                </div>
              </div>

              {submitError && (
                <p className="text-red-500 text-sm text-center px-15">{submitError}</p>
              )}

              <div className="flex justify-center items-center gap-3 py-10">
                <button
                  type="button"
                  onClick={handleBack}
                  className="bg-gray-300 font-cantora-one px-15 py-2 rounded-2xl text-white"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handlesubmit}
                  disabled={submitting}
                  className="bg-blue-900 font-cantora-one px-35 py-2 rounded-2xl text-white disabled:opacity-50"
                >
                  {submitting ? "Adding..." : "Add Product"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {showSuccess && (
        <div className="fixed inset-0 flex justify-center items-center bg-black/50 z-50">
          <div className="bg-blue-900 rounded-2xl shadow-2xl p-15 max-w-3xl min-h-[350px] w-full relative text-center">
            <button
              type="button"
              onClick={() => setShowSuccess(false)}
              className="absolute top-4 right-4 text-white hover:text-gray-300"
            >
              ✕
            </button>

            <CircleCheck className="w-16 h-16 text-white mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-1">Product Added Successfully!</h2>
            <p className="text-sm text-white/80">
              Your product has been added successfully and is now available in your product catalog
            </p>

            <div className="flex justify-center items-center gap-3 mt-6">
              <Link
                href="/Products"
                className="bg-white text-blue-900 font-cantora-one rounded-2xl px-5 py-2"
              >
                View Products
              </Link>
              <button
                type="button"
                onClick={resetForm}
                className="border border-white text-white font-cantora-one rounded-2xl px-5 py-2"
              >
                Add Another Product
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}